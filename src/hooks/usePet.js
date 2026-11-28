import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function usePet(id) {
  const [pet, setPet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const petiGetir = async () => {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error || !data) {
      setError('Hayvan bulunamadı.')
      return
    }

    setPet(data)
  }

  useEffect(() => {
    setLoading(true)
    petiGetir().finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    const channel = supabase
      .channel(`pet-${id}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'pets', filter: `id=eq.${id}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setPet(null)
            setError('Bu hayvan başka bir yerden silindi.')
            return
          }
          setPet(payload.new)
        })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [id])

  return { pet, loading, error }
}
