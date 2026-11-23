import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, signOut } = useAuth()

  return (
    <nav className="navbar navbar-light bg-light border-bottom mb-4">
      <div className="container justify-content-between">
        <span className="navbar-brand mb-0 h1">🐾 Pet Aşı Takip</span>
        <div className="d-flex align-items-center gap-3">
          <span className="text-muted small">{user?.email}</span>
          <button onClick={signOut} className="btn btn-outline-secondary btn-sm">
            Çıkış yap
          </button>
        </div>
      </div>
    </nav>
  )
}
