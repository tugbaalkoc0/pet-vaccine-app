import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Route, Routes } from 'react-router'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import PetDetail from './pages/PetDetail'
import PetVaccinations from './pages/PetVaccinations'
import PetVisits from './pages/PetVisits'
import Profile from './pages/Profile'
import Vets from './pages/Vets'
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
          <Route
            path="/hayvan/:id/asilar"
            element={
              <ProtectedRoute>
                <PetVaccinations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hayvan/:id/ziyaretler"
            element={
              <ProtectedRoute>
                <PetVisits />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profil"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/veterinerler"
            element={
              <ProtectedRoute>
                <Vets />
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
