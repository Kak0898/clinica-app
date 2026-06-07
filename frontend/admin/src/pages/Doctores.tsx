import { useEffect, useState } from 'react'
import api from '../lib/api'

interface Especialidad {
  id:     number
  nombre: string
}

interface Doctor {
  id:              number
  nombre:          string
  apellido:        string
  avatarIniciales: string
  avatarColor:     string
  avatarColorText: string
  activo:          boolean
  especialidad:    Especialidad
}

const COLORES = [
  { bg: '#B5D4F4', fg: '#0C447C' },
  { bg: '#C0DD97', fg: '#27500A' },
  { bg: '#FAC775', fg: '#633806' },
  { bg: '#F4C0D1', fg: '#721E3E' },
  { bg: '#CECBF6', fg: '#3C3489' },
  { bg: '#9FE1CB', fg: '#085041' },
  { bg: '#F5C4B3', fg: '#712B13' },
]

const FORM_VACIO = {
  nombre: '', apellido: '', avatarIniciales: '',
  avatarColor: '#B5D4F4', avatarColorText: '#0C447C',
  especialidadId: 0,
}

export default function Doctores() {
  const [doctores,      setDoctores]      = useState<Doctor[]>([])
  const [especialidades,setEspecialidades]= useState<Especialidad[]>([])
  const [loading,       setLoading]       = useState(true)
  const [modal,         setModal]         = useState(false)
  const [editando,      setEditando]      = useState<Doctor | null>(null)
  const [form,          setForm]          = useState(FORM_VACIO)
  const [guardando,     setGuardando]     = useState(false)
  const [error,         setError]         = useState('')
  const [busqueda,      setBusqueda]      = useState('')

  useEffect(() => { cargar() }, [])

  async function cargar() {
    try {
      setLoading(true)
      const [d, e] = await Promise.all([
        api.get('/doctores'),
        api.get('/especialidades'),
      ])
      setDoctores(d.data)
      setEspecialidades(e.data)
    } finally {
      setLoading(false)
    }
  }

  function abrirCrear() {
    setEditando(null)
    setForm({ ...FORM_VACIO, especialidadId: especialidades[0]?.id ?? 0 })
    setError('')
    setModal(true)
  }

  function abrirEditar(doc: Doctor) {
    setEditando(doc)
    setForm({
      nombre:          doc.nombre,
      apellido:        doc.apellido,
      avatarIniciales: doc.avatarIniciales,
      avatarColor:     doc.avatarColor,
      avatarColorText: doc.avatarColorText,
      especialidadId:  doc.especialidad.id,
    })
    setError('')
    setModal(true)
  }

  // Auto-generar iniciales al escribir nombre/apellido
  function handleNombre(val: string) {
    const ini = (val[0] ?? '') + (form.apellido[0] ?? '')
    setForm(f => ({ ...f, nombre: val, avatarIniciales: ini.toUpperCase() }))
  }
  function handleApellido(val: string) {
    const ini = (form.nombre[0] ?? '') + (val[0] ?? '')
    setForm(f => ({ ...f, apellido: val, avatarIniciales: ini.toUpperCase() }))
  }

  async function guardar() {
    if (!form.nombre || !form.apellido || !form.especialidadId) {
      setError('Completa todos los campos'); return
    }
    setGuardando(true); setError('')
    try {
      if (editando) {
        await api.put(`/doctores/${editando.id}`, form)
      } else {
        await api.post('/doctores', form)
      }
      setModal(false)
      await cargar()
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  async function desactivar(id: number, nombre: string) {
    if (!confirm(`¿Desactivar al Dr. ${nombre}?`)) return
    await api.delete(`/doctores/${id}`)
    await cargar()
  }

  const doctoresFiltrados = doctores.filter(d => {
    if (!busqueda) return true
    const q = busqueda.toLowerCase()
    return d.nombre.toLowerCase().includes(q) ||
           d.apellido.toLowerCase().includes(q) ||
           d.especialidad.nombre.toLowerCase().includes(q)
  })

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium text-gray-900">Doctores</h1>
        <button
          onClick={abrirCrear}
          className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
        >
          + Agregar doctor
        </button>
      </div>

      {/* Buscador */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre o especialidad..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
        />
      </div>

      {/* Grid de doctores */}
      {loading ? (
        <div className="text-center text-sm text-gray-400 py-12">Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctoresFiltrados.map(doc => (
            <div key={doc.id} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0"
                    style={{ background: doc.avatarColor, color: doc.avatarColorText }}
                  >
                    {doc.avatarIniciales}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">
                      {doc.nombre} {doc.apellido}
                    </div>
                    <div className="text-xs text-gray-400">{doc.especialidad.nombre}</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => abrirEditar(doc)}
                  className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
                >
                  Editar
                </button>
                <button
                  onClick={() => desactivar(doc.id, `${doc.nombre} ${doc.apellido}`)}
                  className="flex-1 px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                >
                  Desactivar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal crear/editar */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-medium text-gray-900 mb-5">
              {editando ? 'Editar doctor' : 'Agregar doctor'}
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Nombre</label>
                  <input
                    value={form.nombre}
                    onChange={e => handleNombre(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                    placeholder="Andrea"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Apellido</label>
                  <input
                    value={form.apellido}
                    onChange={e => handleApellido(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                    placeholder="Muñoz"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Especialidad</label>
                <select
                  value={form.especialidadId}
                  onChange={e => setForm(f => ({ ...f, especialidadId: Number(e.target.value) }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                >
                  {especialidades.map(e => (
                    <option key={e.id} value={e.id}>{e.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-2">Color del avatar</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORES.map(c => (
                    <button
                      key={c.bg}
                      onClick={() => setForm(f => ({ ...f, avatarColor: c.bg, avatarColorText: c.fg }))}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${form.avatarColor === c.bg ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                      style={{ background: c.bg }}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium"
                  style={{ background: form.avatarColor, color: form.avatarColorText }}
                >
                  {form.avatarIniciales || '??'}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">
                    {form.nombre || 'Nombre'} {form.apellido || 'Apellido'}
                  </div>
                  <div className="text-xs text-gray-400">
                    {especialidades.find(e => e.id === form.especialidadId)?.nombre}
                  </div>
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