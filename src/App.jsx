import 'bootstrap/dist/css/bootstrap.min.css';
import { Route, Routes } from 'react-router'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import VaccineApp from './components/VaccineApp'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'

function Dashboard() {
  return (
    <>
      <Navbar />
      <VaccineApp />
    </>
  )
}

function App() {
  return (
    <AuthProvider>
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
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
