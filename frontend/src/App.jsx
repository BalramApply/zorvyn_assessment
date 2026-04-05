import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute, GuestOnly } from './components/layout/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import DashboardPage from './pages/Dashboard'
import TransactionsPage from './pages/Transactions'
import UsersPage from './pages/Users'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Guest only */}
          <Route path="/login"    element={<GuestOnly><LoginPage /></GuestOnly>} />
          <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />

          {/* Protected app shell */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index          element={<DashboardPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="users"   element={<ProtectedRoute requiredRole="admin"><UsersPage /></ProtectedRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}