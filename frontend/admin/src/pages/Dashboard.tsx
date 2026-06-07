import { useEffect, useState } from 'react'
import api from '../lib/api'

interface Stats {
  citasHoy: number
  citasMes: number
  doctoresActivos: number
  especialidades: number
}

export default function Dashboard() {
  const [stats,   setStats]   = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const admin = JSON.parse(localStorage.getItem('admin') ?? '{}')

  useEffect(() => {
    async function cargar() {
      try {
        const [citas, doctores, especialidades] = await Promise.all([
          api.get('/citas'),
          api.get('/doctores'),
          api.get('/especialidades'),
        ])

        const hoy = new Date().toISOString().split('T')[0]
        const mes = new Date().getMonth()

        setStats({
          citasHoy: citas.data.filter((c: any) => {
            const fechaCita = new Date(c.fecha).toISOString().split('T')[0]
            return fechaCita === hoy
          }).length,
          citasMes: citas.data.filter((c: any) => {
            return new Date(c.fecha).getMonth() === mes &&
                  new Date(c.fecha).getFullYear() === new Date().getFullYear()
          }).length,
          doctoresActivos: doctores.data.length,
          especialidades:  especialidades.data.length,
        })
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  const cards = [
    { label: 'Citas hoy',         value: stats?.citasHoy,        color: 'bg-blue-50   text-blue-700' },
    { label: 'Citas este mes',     value: stats?.citasMes,        color: 'bg-green-50  text-green-700' },
    { label: 'Doctores activos',   value: stats?.doctoresActivos, color: 'bg-purple-50 text-purple-700' },
    { label: 'Especialidades',     value: stats?.especialidades,  color: 'bg-orange-50 text-orange-700' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-medium text-gray-900">Bienvenido, {admin.nombre}</h1>
        <p className="text-sm text-gray-500 mt-1">{new Date().toLocaleDateString('es-CL', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="text-sm text-gray-500 mb-2">{card.label}</div>
            <div className="text-3xl font-medium text-gray-900">
              {loading ? '—' : card.value ?? 0}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}