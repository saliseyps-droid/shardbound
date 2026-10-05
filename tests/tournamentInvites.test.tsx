// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { FakeSocialBackend } from '@/social/fakeBackend';
import { SocialService } from '@/social/service';
import { INVITE_TTL_MS, TOURNAMENT_INVITE_TTL_MS, inviteIsLive, inviteKind, isValidInvite } from '@/social/friends';
import { createNewSave } from '@/domain/newAccount';
import { newTournament, type TournamentPlayer, type TournamentSize } from '@/domain/tournament';
import { useAccount } from '@/state/accountStore';
import { useTournament } from '@/state/tournamentStore';
import { firstValidDeck } from '@/ui/components/meta/MetaWidgets';
import TournamentScreen, { SeatList } from '@/ui/screens/TournamentScreen';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

async function friends() {
  const backend = new FakeSocialBackend();
  backend.seedFriendship('ann', 'bob');
  return { backend, ann: new SocialService(backend, 'ann'), bob: new SocialService(backend, 'bob') };
}

describe('invite kinds', () => {
  it('a tournament invite round-trips its kind and size', async () => {
    const { backend, ann } = await friends();
    const seen = vi.fn();
    backend.watchInvites('bob', seen);
    const id = await ann.sendInvite('bob', 'Ann', 'ABCDE', 'tournament', 16);
    expect(seen).toHaveBeenLastCalledWith([expect.objectContaining({ id, code: 'ABCDE', kind: 'tournament', size: 16 })]);
  });

  it('match invites stay match invites, and a stored invite without a kind reads as a match', async () => {
    const { backend, ann } = await friends();
    const seen = vi.fn();
    backend.watchInvites('bob', seen);
    await ann.invite('bob', 'Ann', 'ABC234');
    expect(seen.mock.lastCall![0][0].kind).toBe('match');
    // Written by an older version: no kind field at all.
    backend.seedInvite('bob', { id: 'old', from: 'ann', fromName: 'Ann', code: 'XYZ234', createdAt: Date.now(), status: 'pending' });
    const old = seen.mock.lastCall![0].find((i: { id: string }) => i.id === 'old');
    expect(old.kind).toBe('match');
    expect(inviteKind({})).toBe('match');
  });

  it('tournament invites stay live longer than match invites', () => {
    const now = 1_000_000_000;
    const at = now - INVITE_TTL_MS - 1000;
    expect(inviteIsLive({ createdAt: at, status: 'pending' }, now)).toBe(false);
    expect(inviteIsLive({ createdAt: at, status: 'pending', kind: 'tournament' }, now)).toBe(true);
    expect(inviteIsLive({ createdAt: now - TOURNAMENT_INVITE_TTL_MS - 1, status: 'pending', kind: 'tournament' }, now)).toBe(false);
  });
});

describe('invite validation (mirrors firestore.rules)', () => {
  const base = { from: 'ann', fromName: 'Ann', code: 'ABCDE' };
  it('accepts old and new shapes', () => {
    expect(isValidInvite(base)).toBe(true);
    expect(isValidInvite({ ...base, kind: 'match' })).toBe(true);
    expect(isValidInvite({ ...base, kind: 'tournament', size: 4 })).toBe(true);
    expect(isValidInvite({ ...base, kind: 'tournament', size: 32 })).toBe(true);
  });
  it('refuses bad kinds, sizes, codes, names and extra fields', () => {
    expect(isValidInvite({ ...base, kind: 'raid' })).toBe(false);
    expect(isValidInvite({ ...base, kind: 'tournament', size: 2 })).toBe(false);
    expect(isValidInvite({ ...base, kind: 'tournament', size: 64 })).toBe(false);
    expect(isValidInvite({ ...base, kind: 'tournament', size: 8.5 })).toBe(false);
    expect(isValidInvite({ ...base, code: 'abc' })).toBe(false);
    expect(isValidInvite({ ...base, code: 'ABCDEFGHI' })).toBe(false);
    expect(isValidInvite({ ...base, fromName: '' })).toBe(false);
    expect(isValidInvite({ ...base, prize: 1000 })).toBe(false);
  });
  it('the fake backend refuses what the rules refuse', async () => {
    const { backend } = await friends();
    await expect(backend.sendInvite('bob', { ...base, kind: 'tournament', size: 64 })).rejects.toThrow('permission-denied');
    await expect(backend.sendInvite('bob', { ...base, kind: 'raid' as never })).rejects.toThrow('permission-denied');
    await expect(backend.sendInvite('bob', { ...base, kind: 'tournament', size: 8 })).resolves.toMatch(/^inv/);
  });
});

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/tournament" element={<TournamentScreen />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('joining from an invite (/tournament?join=CODE)', () => {
  it('joins right away with a valid deck', async () => {
    const save = createNewSave('Bob', 'compass', Date.now(), 'p1');
    useAccount.setState({ save });
    const join = vi.fn(async () => undefined);
    useTournament.setState({ role: 'none', status: 'idle', join });
    await act(async () => void renderAt('/tournament?join=abcde'));
    expect(join).toHaveBeenCalledTimes(1);
    const [code, deck] = join.mock.calls[0] as unknown as [string, { id: string }];
    expect(code).toBe('ABCDE');
    expect(deck.id).toBe(firstValidDeck(save, save.profile.selectedDeckId));
  });

  it('without a valid deck it prefills the join form instead', async () => {
    const save = createNewSave('Bob', 'compass', Date.now(), 'p1');
    useAccount.setState({ save: { ...save, decks: save.decks.map((d) => ({ ...d, cards: {} })) } });
    const join = vi.fn(async () => undefined);
    useTournament.setState({ role: 'none', status: 'idle', join });
    await act(async () => void renderAt('/tournament?join=ABCDE'));
    expect(join).not.toHaveBeenCalled();
    expect((screen.getByLabelText('Tournament code') as HTMLInputElement).value).toBe('ABCDE');
  });
});

describe('lobby seats', () => {
  const me: TournamentPlayer = { id: 'p0', name: 'Ann', avatar: '', faction: 'EMBER', bot: false, connected: true };
  const tourOf = (size: TournamentSize) => ({ ...newTournament('ABCDE', me, size), players: [me, { ...me, id: 'p1', name: 'Bob' }] });

  it.each([16, 32] as const)('shows every seat of a %i-player tournament as a compact tile', (size) => {
    const { container } = render(<SeatList tour={tourOf(size)} myId="p0" />);
    const seats = container.querySelectorAll('.t-seat');
    expect(seats).toHaveLength(size);
    expect(container.querySelector('.t-seats.compact')).not.toBeNull();
    expect(container.querySelectorAll('.t-seat.empty')).toHaveLength(size - 2);
    expect(screen.getByText('Bob')).toBeTruthy();
  });

  it('keeps the roomy list for 4 and 8', () => {
    const { container } = render(<SeatList tour={tourOf(8)} myId="p0" />);
    expect(container.querySelectorAll('.t-seat')).toHaveLength(8);
    expect(container.querySelector('.t-seats.compact')).toBeNull();
  });
});

describe('organizer invite panel', () => {
  it('invites an online friend and shows sent, declined and joined', async () => {
    const { useSocial } = await import('@/state/socialStore');
    const { TournamentInvites } = await import('@/ui/components/TournamentInvites');
    const { fireEvent } = await import('@testing-library/react');
    const backend = new FakeSocialBackend();
    const now = Date.now();
    backend.seedProfile('bob', { name: 'Bob', avatar: 'TIDE', portrait: '', friendCode: 'BOBB2345' }, { lastSeen: now, inMatch: false });
    backend.seedProfile('cid', { name: 'Cid', avatar: 'VOID', portrait: '', friendCode: 'CIDD2345' }, { lastSeen: now - 86_400_000, inMatch: false });
    backend.seedFriendship('ann', 'bob');
    backend.seedFriendship('ann', 'cid');
    useAccount.setState({ save: createNewSave('Ann', 'compass', now, 'p1') });
    useSocial.getState().start('ann', backend, 'mock');
    try {
      const me: TournamentPlayer = { id: 'p0', name: 'Ann', avatar: '', faction: 'EMBER', bot: false, connected: true };
      const tour = newTournament('ABCDE', me, 8);
      const view = render(
        <MemoryRouter>
          <TournamentInvites tour={tour} />
        </MemoryRouter>,
      );
      await act(async () => undefined);
      const rows = () => [...view.container.querySelectorAll('.friend-row')];
      const rowOf = (name: string) => rows().find((r) => r.textContent!.includes(name))!;
      const btn = (name: string) => rowOf(name).querySelector('button')!;
      expect(btn('Cid').disabled).toBe(true); // offline
      await act(async () => void fireEvent.click(btn('Bob')));
      expect(rowOf('Bob').textContent).toContain('Invite sent');
      const [inv] = await new Promise<{ id: string; kind: string; size?: number }[]>((r) => backend.watchInvites('bob', r));
      expect(inv).toMatchObject({ kind: 'tournament', size: 8, code: 'ABCDE' });

      await act(async () => void (await backend.deleteInvite('bob', inv.id)));
      expect(rowOf('Bob').textContent).toContain('Declined');

      view.rerender(
        <MemoryRouter>
          <TournamentInvites tour={{ ...tour, players: [me, { ...me, id: 'p1', name: 'Bob' }] }} />
        </MemoryRouter>,
      );
      expect(rowOf('Bob').textContent).toContain('Joined');
      expect(rowOf('Bob').querySelector('button')).toBeNull();
    } finally {
      useSocial.getState().stop();
    }
  });
});
