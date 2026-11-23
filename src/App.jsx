import 'bootstrap/dist/css/bootstrap.min.css';
import { Route, Routes } from 'react-router'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import PetDetail from './pages/PetDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/giris" element={<Login />} />
          <Route path="/kayit" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hayvan/:id"
            element={
              <ProtectedRoute>
                <PetDetail />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
