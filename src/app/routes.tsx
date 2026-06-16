import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layout/AppLayout'
import { AuthPage } from '../features/auth/AuthPage'
import { ChallengesPage } from '../features/challenges/ChallengesPage'
import { GamePage } from '../features/game/GamePage'
import { HistoryPage } from '../features/history/HistoryPage'
import { HomePage } from '../features/home/HomePage'
import { HowToPlayPage } from '../features/how-to-play/HowToPlayPage'
import { ProfilePage } from '../features/profile/ProfilePage'
import { RankingPage } from '../features/ranking/RankingPage'
import { ResultsPage } from '../features/results/ResultsPage'
import { SettingsPage } from '../features/settings/SettingsPage'
import { ShopPage } from '../features/shop/ShopPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/challenges" element={<ChallengesPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/ranking" element={<RankingPage />} />
        <Route path="/how-to-play" element={<HowToPlayPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
