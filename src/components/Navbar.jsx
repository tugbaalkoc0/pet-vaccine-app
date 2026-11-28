import { Link } from 'react-router'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const adSoyad = user?.user_metadata?.full_name

  return (
    <nav className="navbar navbar-light bg-light border-bottom mb-4">
      <div className="container justify-content-between">
        <span className="navbar-brand mb-0 h1">🐾 e-Pet</span>
        <div className="d-flex align-items-center gap-2">
          <Link to="/veterinerler" className="btn btn-outline-secondary btn-sm">
            Anlaşmalı Veterinerler
          </Link>
          <Link to="/randevularim" className="btn btn-outline-secondary btn-sm">
            Randevularım
          </Link>
          <div className="dropdown">
            <button
              className="btn btn-outline-secondary btn-sm dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
            >
              {adSoyad || user?.email}
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <Link className="dropdown-item" to="/profil">Profil ayarları</Link>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button className="dropdown-item" onClick={signOut}>Çıkış yap</button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  )
}
