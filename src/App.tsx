import { lazy, Suspense, useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAccount, gameService } from '@/state/accountStore';
import { useSettings } from '@/state/settingsStore';
import { audio } from '@/audio/audioService';
import { AppHeader } from '@/ui/AppHeader';
import { ErrorBoundary } from '@/ui/components/ErrorBoundary';
import { ConfirmHost, Spinner, ToastHost } from '@/ui/components/common';
import { TooltipLayer } from '@/ui/components/Tooltip';
import { CardInspector } from '@/ui/components/CardInspector';
import { BootScreen, CorruptedSaveScreen, WelcomeScreen } from '@/ui/screens/BootScreens';

const HomeScreen = lazy(() => import('@/ui/screens/HomeScreen'));
const PlayScreen = lazy(() => import('@/ui/screens/PlayScreen'));
const CampaignScreen = lazy(() => import('@/ui/screens/CampaignScreen'));
const MatchScreen = lazy(() => import('@/ui/match/MatchScreen'));
const CollectionScreen = lazy(() => import('@/ui/screens/CollectionScreen'));
const DeckListScreen = lazy(() => import('@/ui/screens/DeckListScreen'));
const DeckEditorScreen = lazy(() => import('@/ui/screens/DeckEditorScreen'));
const PacksScreen = lazy(() => import('@/ui/screens/PacksScreen'));
const ShopScreen = lazy(() => import('@/ui/screens/ShopScreen'));
const QuestsScreen = lazy(() => import('@/ui/screens/QuestsScreen'));
const ProfileScreen = lazy(() => import('@/ui/screens/ProfileScreen'));
const MatchHistoryScreen = lazy(() => import('@/ui/screens/MatchHistoryScreen'));
const SettingsScreen = lazy(() => import('@/ui/screens/SettingsScreen'));
const LoreScreen = lazy(() => import('@/ui/screens/LoreScreen'));
const OnlineScreen = lazy(() => import('@/ui/screens/OnlineScreen'));
const JoinScreen = lazy(() => import('@/ui/screens/JoinScreen'));
const RankedScreen = lazy(() => import('@/ui/screens/RankedScreen'));
const PatchNotesScreen = lazy(() => import('@/ui/screens/PatchNotesScreen'));
const TournamentScreen = lazy(() => import('@/ui/screens/TournamentScreen'));
const DebugScreen = import.meta.env.DEV ? lazy(() => import('@/ui/screens/DebugScreen')) : null;

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
              <Route path="/quests" element={<QuestsScreen />} />
              <Route path="/profile" element={<ProfileScreen />} />
              <Route path="/history" element={<MatchHistoryScreen />} />
              <Route path="/settings" element={<SettingsScreen />} />
              <Route path="/lore" element={<LoreScreen />} />
              <Route path="/online" element={<OnlineScreen />} />
              <Route path="/join/:code" element={<JoinScreen />} />
              <Route path="/ranked" element={<RankedScreen />} />
              <Route path="/patch-notes" element={<PatchNotesScreen />} />
              <Route path="/tournament" element={<TournamentScreen />} />
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
