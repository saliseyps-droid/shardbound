import { Suspense, useEffect } from 'react';
import { lazyWithReload } from '@/ui/lazyRetry';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAccount, gameService } from '@/state/accountStore';
import { useSettings } from '@/state/settingsStore';
import { audio } from '@/audio/audioService';
import { AppHeader } from '@/ui/AppHeader';
import { ErrorBoundary } from '@/ui/components/ErrorBoundary';
import { ConfirmHost, Spinner, ToastHost } from '@/ui/components/common';
import { TooltipLayer } from '@/ui/components/Tooltip';
import { CardInspector } from '@/ui/components/CardInspector';
import { PortraitInspector } from '@/ui/components/PortraitInspector';
import { CloudDialogs } from '@/ui/components/CloudAccount';
import { SocialHost } from '@/ui/components/SocialHost';
import { BootScreen, CorruptedSaveScreen, WelcomeScreen } from '@/ui/screens/BootScreens';

const HomeScreen = lazyWithReload(() => import('@/ui/screens/HomeScreen'));
const PlayScreen = lazyWithReload(() => import('@/ui/screens/PlayScreen'));
const CampaignScreen = lazyWithReload(() => import('@/ui/screens/CampaignScreen'));
const MatchScreen = lazyWithReload(() => import('@/ui/match/MatchScreen'));
const CollectionScreen = lazyWithReload(() => import('@/ui/screens/CollectionScreen'));
const DeckListScreen = lazyWithReload(() => import('@/ui/screens/DeckListScreen'));
const DeckEditorScreen = lazyWithReload(() => import('@/ui/screens/DeckEditorScreen'));
const PacksScreen = lazyWithReload(() => import('@/ui/screens/PacksScreen'));
const ShopScreen = lazyWithReload(() => import('@/ui/screens/ShopScreen'));
const CardBacksScreen = lazyWithReload(() => import('@/ui/screens/CardBacksScreen'));
const ArenaScreen = lazyWithReload(() => import('@/ui/screens/ArenaScreen'));
const QuestsScreen = lazyWithReload(() => import('@/ui/screens/QuestsScreen'));
const ProfileScreen = lazyWithReload(() => import('@/ui/screens/ProfileScreen'));
const MatchHistoryScreen = lazyWithReload(() => import('@/ui/screens/MatchHistoryScreen'));
const SettingsScreen = lazyWithReload(() => import('@/ui/screens/SettingsScreen'));
const LoreScreen = lazyWithReload(() => import('@/ui/screens/LoreScreen'));
const OnlineScreen = lazyWithReload(() => import('@/ui/screens/OnlineScreen'));
const JoinScreen = lazyWithReload(() => import('@/ui/screens/JoinScreen'));
const RankedScreen = lazyWithReload(() => import('@/ui/screens/RankedScreen'));
const AiRankedScreen = lazyWithReload(() => import('@/ui/screens/AiRankedScreen'));
const BrawlScreen = lazyWithReload(() => import('@/ui/screens/BrawlScreen'));
const PatchNotesScreen = lazyWithReload(() => import('@/ui/screens/PatchNotesScreen'));
const TournamentScreen = lazyWithReload(() => import('@/ui/screens/TournamentScreen'));
const AchievementsScreen = lazyWithReload(() => import('@/ui/screens/AchievementsScreen'));
const LeaderboardScreen = lazyWithReload(() => import('@/ui/screens/LeaderboardScreen'));
const FriendsScreen = lazyWithReload(() => import('@/ui/screens/FriendsScreen'));
const DebugScreen = import.meta.env.DEV ? lazyWithReload(() => import('@/ui/screens/DebugScreen')) : null;

function Shell() {
  const location = useLocation();
  const inMatch = location.pathname.startsWith('/match');
  return (
    <div className={`app-shell ${inMatch ? 'in-match' : ''}`}>
      {!inMatch && <AppHeader />}
      <main className="app-main" id="main">
        <ErrorBoundary resetKey={location.pathname}>
          <Suspense fallback={<div className="screen-loading"><Spinner /></div>}>
            <Routes>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/play" element={<PlayScreen />} />
              <Route path="/campaign" element={<CampaignScreen />} />
              <Route path="/match" element={<MatchScreen />} />
              <Route path="/collection" element={<CollectionScreen />} />
              <Route path="/decks" element={<DeckListScreen />} />
              <Route path="/decks/:deckId" element={<DeckEditorScreen />} />
              <Route path="/packs" element={<PacksScreen />} />
              <Route path="/shop" element={<ShopScreen />} />
              <Route path="/card-backs" element={<CardBacksScreen />} />
              <Route path="/arena" element={<ArenaScreen />} />
              <Route path="/quests" element={<QuestsScreen />} />
              <Route path="/profile" element={<ProfileScreen />} />
              <Route path="/history" element={<MatchHistoryScreen />} />
              <Route path="/settings" element={<SettingsScreen />} />
              <Route path="/lore" element={<LoreScreen />} />
              <Route path="/online" element={<OnlineScreen />} />
              <Route path="/join/:code" element={<JoinScreen />} />
              <Route path="/ranked" element={<RankedScreen />} />
              <Route path="/ai-ranked" element={<AiRankedScreen />} />
              <Route path="/brawl" element={<BrawlScreen />} />
              <Route path="/patch-notes" element={<PatchNotesScreen />} />
              <Route path="/tournament" element={<TournamentScreen />} />
              <Route path="/achievements" element={<AchievementsScreen />} />
              <Route path="/leaderboard" element={<LeaderboardScreen />} />
              <Route path="/friends" element={<FriendsScreen />} />
              {DebugScreen && <Route path="/debug" element={<DebugScreen />} />}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default function App() {
  const status = useAccount((s) => s.status);
  const boot = useAccount((s) => s.boot);
  const reducedMotion = useSettings((s) => s.reducedMotion);
  const performanceMode = useSettings((s) => s.performanceMode);

  useEffect(() => {
    void boot();
    // Unlock audio on first user gesture (autoplay policy).
    const unlock = () => {
      audio.unlock();
      audio.startMusic();
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    // Daily rollover while the app stays open.
    const timer = window.setInterval(() => gameService.tick(), 60_000);
    return () => window.clearInterval(timer);
  }, [boot]);

  useEffect(() => {
    document.documentElement.classList.toggle('reduced-motion', reducedMotion);
    document.documentElement.classList.toggle('performance-mode', performanceMode);
  }, [reducedMotion, performanceMode]);

  return (
    <HashRouter>
      {status === 'BOOTING' && <BootScreen />}
      {status === 'NEW' && <WelcomeScreen />}
      {status === 'CORRUPTED' && <CorruptedSaveScreen />}
      {status === 'READY' && <Shell />}
      <CardInspector />
      <PortraitInspector />
      <CloudDialogs />
      <SocialHost />
      <ConfirmHost />
      <ToastHost />
      <TooltipLayer />
    </HashRouter>
  );
}

// Dev-only hooks for automated UI checks (never included in production builds).
if (import.meta.env.DEV && typeof window !== 'undefined') {
  void Promise.all([import('@/state/matchLaunch'), import('@/data/opponents'), import('@/state/matchStore'), import('@/net/session'), import('@/state/tournamentStore')]).then(([launch, opponents, match, net, tour]) => {
    Object.assign(window as unknown as Record<string, unknown>, { __tcg: { gameService, useAccount, launch, opponents, match, net, tour: tour.useTournament } });
  });
}
