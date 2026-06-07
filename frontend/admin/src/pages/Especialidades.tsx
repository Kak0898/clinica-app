import { useEffect, useState } from 'react'
import api from '../lib/api'

interface Especialidad {
  id:          number
  nombre:      string
  descripcion: string
  icono:       string
  activo:      boolean
  _count?:     { doctores: number }
}

const ICONOS = [
  'ti-stethoscope', 'ti-heart-rate-monitor', 'ti-baby-carriage',
  'ti-bone', 'ti-microscope', 'ti-gender-female', 'ti-brain',
  'ti-eye', 'ti-tooth', 'ti-lungs', 'ti-pill', 'ti-vaccine',
]

const FORM_VACIO = { nombre: '', descripcion: '', icono: 'ti-stethoscope' }

export default function Especialidades() {
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([])
  const [loading,        setLoading]        = useState(true)
  const [modal,          setModal]          = useState(false)
  const [editando,       setEditando]       = useState<Especialidad | null>(null)
  const [form,           setForm]           = useState(FORM_VACIO)
  const [guardando,      setGuardando]      = useState(false)
  const [error,          setError]          = useState('')

  useEffect(() => { cargar() }, [])

  async function cargar() {
    try {
      setLoading(true)
      const { data } = await api.get('/especialidades?todas=true')
      setEspecialidades(data)
    } finally {
      setLoading(false)
    }
  }

  function abrirCrear() {
    setEditando(null)
    setForm(FORM_VACIO)
    setError('')
    setModal(true)
  }

  function abrirEditar(esp: Especialidad) {
    setEditando(esp)
    setForm({ nombre: esp.nombre, descripcion: esp.descripcion, icono: esp.icono })
    setError('')
    setModal(true)
  }

  async function guardar() {
    if (!form.nombre || !form.descripcion || !form.icono) {
      setError('Completa todos los campos'); return
    }
    setGuardando(true); setError('')
    try {
      if (editando) {
        await api.put(`/especialidades/${editando.id}`, form)
      } else {
        await api.post('/especialidades', form)
      }
      setModal(false)
      await cargar()
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  async function toggleActivo(esp: Especialidad) {
    const accion = esp.activo ? 'desactivar' : 'activar'
    if (!confirm(`¿${accion.charAt(0).toUpperCase() + accion.slice(1)} "${esp.nombre}"?`)) return
    await api.put(`/especialidades/${esp.id}`, { activo: !esp.activo })
    await cargar()
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium text-gray-900">Especialidades</h1>
        <button
          onClick={abrirCrear}
          className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
        >
          + Agregar especialidad
        </button>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="text-center text-sm text-gray-400 py-12">Cargando...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-4 py-3 font-medium text-gray-500">Especialidad</th>
                <th className="px-4 py-3 font-medium text-gray-500">Descripción</th>
                <th className="px-4 py-3 font-medium text-gray-500">Doctores</th>
                <th className="px-4 py-3 font-medium text-gray-500">Estado</th>
                <th className="px-4 py-3 font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {especialidades.map(esp => (
                <tr key={esp.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <i className={`ti ${esp.icono} text-gray-600`} />
                      </div>
                      <span className="font-medium text-gray-800">{esp.nombre}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{esp.descripcion}</td>
                  <td className="px-4 py-3 text-gray-600">{esp._count?.doctores ?? 0}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      esp.activo ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {esp.activo ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => abrirEditar(esp)}
                        className="px-3 py-1 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => toggleActivo(esp)}
                        className={`px-3 py-1 text-xs rounded-lg ${
                          esp.activo
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        {esp.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-medium text-gray-900 mb-5">
              {editando ? 'Editar especialidad' : 'Agregar especialidad'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nombre</label>
                <input
                  value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  placeholder="Cardiología"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Descripción</label>
                <input
                  value={form.descripcion}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  placeholder="Corazón y circulación"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-2">Ícono</label>
                <div className="grid grid-cols-6 gap-2">
                  {ICONOS.map(ic => (
                    <button
                      key={ic}
                      onClick={() => setForm(f => ({ ...f, icono: ic }))}
                      className={`h-9 rounded-lg flex items-center justify-center border transition-all ${
                        form.icono === ic
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      <i className={`ti ${ic} text-base`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                  <i className={`ti ${form.icono} text-gray-600`} />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">{form.nombre || 'Nombre'}</div>
                  <div className="text-xs text-gray-400">{form.descripcion || 'Descripción'}</div>
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModal(false)}
                className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={guardar}
                disabled={guardando}
                className="flex-1 px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-40"
              >
                {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}