import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import PetCard from '../components/PetCard'
import PetForm from '../components/PetForm'
import ConfirmModal from '../components/ConfirmModal'

export default function Dashboard() {
  const { user } = useAuth()
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formAcik, setFormAcik] = useState(false)
  const [duzenlenenPet, setDuzenlenenPet] = useState(null)
  const [silinecekPet, setSilinecekPet] = useState(null)

  const petleriGetir = async () => {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .order('created_at', { ascending: false })

    setLoading(false)

    if (error) {
      setError('Hayvanlar yüklenemedi, lütfen sayfayı yenileyin.')
      return
    }

    setPets(data)
  }

  useEffect(() => {
    petleriGetir()
  }, [user])

  const handleEdit = (pet) => {
    setDuzenlenenPet(pet)
    setFormAcik(true)
  }

  const handleYeniEkle = () => {
    setDuzenlenenPet(null)
    setFormAcik(true)
  }

  const handleFormSaved = () => {
    setFormAcik(false)
    petleriGetir()
  }

  const handleSil = async () => {
    const { error } = await supabase.from('pets').delete().eq('id', silinecekPet.id)
    setSilinecekPet(null)

    if (error) {
      setError('Silinemedi, lütfen tekrar deneyin.')
      return
    }

    petleriGetir()
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Hayvanlarım</h2>
          <button className="btn btn-primary" onClick={handleYeniEkle}>
            + Hayvan ekle
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading && (
          <div className="d-flex justify-content-center mt-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Yükleniyor...</span>
            </div>
          </div>
        )}

        {!loading && pets.length === 0 && (
          <div className="text-center mt-5">
            <p className="text-muted mb-3">Henüz hiç hayvanın yok.</p>
            <button className="btn btn-primary" onClick={handleYeniEkle}>
              İlk hayvanını ekle
            </button>
          </div>
        )}

        {!loading && pets.map(pet => (
          <PetCard key={pet.id} pet={pet} onEdit={handleEdit} onDelete={setSilinecekPet} />
        ))}
      </div>

      {formAcik && (
        <PetForm
          pet={duzenlenenPet}
          onClose={() => setFormAcik(false)}
          onSaved={handleFormSaved}
        />
      )}

      {silinecekPet && (
        <ConfirmModal
          title="Hayvanı sil"
          message={`"${silinecekPet.name}" silinecek. Bu hayvana ait tüm aşı kayıtları da birlikte silinecek. Emin misin?`}
          onConfirm={handleSil}
          onCancel={() => setSilinecekPet(null)}
        />
      )}
    </>
  )
}
