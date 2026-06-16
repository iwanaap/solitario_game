import { HashRouter } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthProvider'
import { AppRoutes } from './routes'

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  )
}

export default App
