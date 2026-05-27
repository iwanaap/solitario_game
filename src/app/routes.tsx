import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layout/AppLayout'
import { AccountPage } from '../features/account/AccountPage'
import { GamePage } from '../features/game/GamePage'
import { HistoryPage } from '../features/history/HistoryPage'
import { HomePage } from '../features/home/HomePage'
import { HowToPlayPage } from '../features/how-to-play/HowToPlayPage'
import { RankingPage } from '../features/ranking/RankingPage'
import { ResultsPage } from '../features/results/ResultsPage'
import { SettingsPage } from '../features/settings/SettingsPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/how-to-play" element={<HowToPlayPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/ranking" element={<RankingPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
