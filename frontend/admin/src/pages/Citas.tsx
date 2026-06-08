import { useEffect, useState } from 'react'
import api from '../lib/api'

interface Cita {
  id:                 number
  fecha:              string
  hora:               string
  estado:             'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA'
  codigoConfirmacion: string
  pacienteNombre:     string
  pacienteRut:        string
  pacienteTelefono:   string
  pacienteEmail:      string
  prevision:          string
  doctor:             { id: number; nombre: string; apellido: string }
  especialidad:       { id: number; nombre: string }
}

const ESTADO_STYLES: Record<string, string> = {
  PENDIENTE:  'bg-yellow-50 text-yellow-700',
  CONFIRMADA: 'bg-blue-50   text-blue-700',
  CANCELADA:  'bg-red-50    text-red-700',
  COMPLETADA: 'bg-green-50  text-green-700',
}

const ESTADO_LABEL: Record<string, string> = {
  PENDIENTE:  'Pendiente',
  CONFIRMADA: 'Confirmada',
  CANCELADA:  'Cancelada',
  COMPLETADA: 'Completada',
}

export default function Citas() {
  const [citas,    setCitas]    = useState<Cita[]>([])
  const [loading,  setLoading]  = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroFecha,  setFiltroFecha]  = useState('')
  const [busqueda,     setBusqueda]     = useState('')
  const [accionando,   setAccionando]   = useState<number | null>(null)
useEffect(() => { cargar() }, [filtroFecha, filtroEstado])
  useEffect(() => { cargar() }, [])

  async function cargar() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filtroEstado) params.append('estado', filtroEstado)
      if (filtroFecha)  params.append('fecha',  filtroFecha)
      const { data } = await api.get(`/citas?${params}`)
      setCitas(data)
    } finally {
      setLoading(false)
    }
  }

  async function cancelar(id: number) {
    if (!confirm('¿Cancelar esta cita?')) return
    setAccionando(id)
    try {
      await api.put(`/citas/${id}/cancelar`)
      await cargar()
    } finally {
      setAccionando(null) }
  }

  async function completar(id: number) {
    if (!confirm('¿Marcar como completada?')) return
    setAccionando(id)
    try {
      // Llamada directa a Prisma via endpoint genérico de actualización
      await api.put(`/citas/${id}/completar`)
      await cargar()
    } finally {
      setAccionando(null)
    }
  }

  const citasFiltradas = citas.filter(c => {
    if (!busqueda) return true
    const q = busqueda.toLowerCase()
    return (
      c.pacienteNombre.toLowerCase().includes(q) ||
      c.pacienteRut.includes(q) ||
      c.codigoConfirmacion.toLowerCase().includes(q) ||
      c.doctor.apellido.toLowerCase().includes(q)
    )
  })

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium text-gray-900">Citas</h1>
        <span className="text-sm text-gray-500">{citasFiltradas.length} registros</span>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar paciente, RUT, código..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="flex-1 min-w-48 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
        />
        <input
          type="date"
          value={filtroFecha}
          onChange={async e => { 
            const val = e.target.value
            setFiltroFecha(val)
            }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
        />
        <select
          value={filtroEstado}
          onChange={e => { setFiltroEstado(e.target.value); setTimeout(cargar, 100) }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
        >
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="CONFIRMADA">Confirmada</option>
          <option value="CANCELADA">Cancelada</option>
          <option value="COMPLETADA">Completada</option>
        </select>
        <button
          onClick={() => { setFiltroEstado(''); setFiltroFecha(''); setBusqueda(''); cargar() }}
          className="px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-lg border border-gray-200"
        >
          Limpiar
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-gray-400">Cargando...</div>
        ) : citasFiltradas.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">No hay citas que mostrar</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-4 py-3 font-medium text-gray-500">Código</th>
                <th className="px-4 py-3 font-medium text-gray-500">Paciente</th>
                <th className="px-4 py-3 font-medium text-gray-500">Doctor</th>
                <th className="px-4 py-3 font-medium text-gray-500">Fecha y hora</th>
                <th className="px-4 py-3 font-medium text-gray-500">Previsión</th>
                <th className="px-4 py-3 font-medium text-gray-500">Estado</th>
                <th className="px-4 py-3 font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {citasFiltradas.map(c => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{c.codigoConfirmacion}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{c.pacienteNombre}</div>
                    <div className="text-xs text-gray-400">{c.pacienteRut}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-800">{c.doctor.nombre} {c.doctor.apellido}</div>
                    <div className="text-xs text-gray-400">{c.especialidad.nombre}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-800">
                      {new Date(c.fecha).toLocaleDateString('es-CL', { day:'2-digit', month:'2-digit', year:'numeric', timeZone: 'UTC' })}
                    </div>
                    <div className="text-xs text-gray-400">{c.hora} hrs</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.prevision}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${ESTADO_STYLES[c.estado]}`}>
                      {ESTADO_LABEL[c.estado]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {c.estado === 'PENDIENTE' && (
                        <>
                          <button
                            onClick={() => completar(c.id)}
                            disabled={accionando === c.id}
                            className="px-2 py-1 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-40"
                          >
                            Completar
                          </button>
                          <button
                            onClick={() => cancelar(c.id)}
                            disabled={accionando === c.id}
                            className="px-2 py-1 text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100 disabled:opacity-40"
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                      {c.estado === 'CONFIRMADA' && (
                        <button
                          onClick={() => completar(c.id)}
                          disabled={accionando === c.id}
                          className="px-2 py-1 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-40"
                        >
                          Completar
                        </button>
                      )}
                      {(c.estado === 'CANCELADA' || c.estado === 'COMPLETADA') && (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}