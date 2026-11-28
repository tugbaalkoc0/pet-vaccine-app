import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Navbar from '../components/Navbar'
import PetCard from '../components/PetCard'
import PetForm from '../components/PetForm'
import ConfirmModal from '../components/ConfirmModal'
import VaccineStatusBadge from '../components/VaccineStatusBadge'
import { asiDurumu } from '../utils/vaccineStatus'
import { turkceTarih } from '../utils/dateFormat'

export default function Dashboard() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [pets, setPets] = useState([])
  const [ozetAsilar, setOzetAsilar] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formAcik, setFormAcik] = useState(false)
  const [duzenlenenPet, setDuzenlenenPet] = useState(null)
  const [silinecekPet, setSilinecekPet] = useState(null)
  const [siliniyor, setSiliniyor] = useState(false)

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

  const ozetAsilariGetir = async () => {
    const { data, error } = await supabase
      .from('vaccinations')
      .select('*, pets(id, name)')
      .not('next_due_date', 'is', null)

    if (error) return

    const gecikmisVeYaklasanlar = data
      .filter(asi => ['gecikmis', 'yaklasiyor'].includes(asiDurumu(asi.next_due_date)))
      .sort((a, b) => a.next_due_date.localeCompare(b.next_due_date))

    setOzetAsilar(gecikmisVeYaklasanlar)
  }

  useEffect(() => {
    petleriGetir()
    ozetAsilariGetir()
  }, [user])

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`dashboard-${user.id}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'pets', filter: `user_id=eq.${user.id}` },
        petleriGetir)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'vaccinations', filter: `user_id=eq.${user.id}` },
        ozetAsilariGetir)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const gecikmisSayisi = ozetAsilar.filter(a => asiDurumu(a.next_due_date) === 'gecikmis').length
  const yaklasanSayisi = ozetAsilar.filter(a => asiDurumu(a.next_due_date) === 'yaklasiyor').length

  const handleEdit = (pet) => {
    setDuzenlenenPet(pet)
    setFormAcik(true)
  }

  const handleYeniEkle = () => {
    setDuzenlenenPet(null)
    setFormAcik(true)
  }

  const handleFormSaved = () => {
    const duzenlemeydi = Boolean(duzenlenenPet)
    setFormAcik(false)
    petleriGetir()
    showToast(duzenlemeydi ? 'Hayvan güncellendi.' : 'Hayvan eklendi.')
  }

  const handleSil = async () => {
    setSiliniyor(true)
    const { error } = await supabase.from('pets').delete().eq('id', silinecekPet.id)
    setSiliniyor(false)
    setSilinecekPet(null)

    if (error) {
      showToast('Silinemedi, lütfen tekrar deneyin.', 'error')
      return
    }

    petleriGetir()
    showToast('Hayvan silindi.')
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

        {!loading && ozetAsilar.length > 0 && (
          <div className="alert alert-warning">
            <div className="fw-bold mb-2">
              {gecikmisSayisi} gecikmiş, {yaklasanSayisi} yaklaşan aşı
            </div>
            <ul className="mb-0 ps-3">
              {ozetAsilar.map(asi => (
                <li key={asi.id}>
                  <Link to={`/hayvan/${asi.pets.id}/asilar`} className="text-decoration-none">
                    {asi.pets.name}
                  </Link>
                  {' '}— {asi.vaccine_name} ({turkceTarih(asi.next_due_date)}){' '}
                  <VaccineStatusBadge nextDueDate={asi.next_due_date} />
                </li>
              ))}
            </ul>
          </div>
        )}

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
          loading={siliniyor}
        />
      )}
    </>
  )
}
