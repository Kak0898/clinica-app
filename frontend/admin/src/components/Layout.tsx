import { Outlet, NavLink, useNavigate } from 'react-router-dom'

export default function Layout() {
  const navigate = useNavigate()
  const admin = JSON.parse(localStorage.getItem('admin') ?? '{}')

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('admin')
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-5 border-b border-gray-100">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Clínica Central</div>
          <div className="text-sm font-medium text-gray-800">Panel Admin</div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {[
            { to: '/',               label: 'Dashboard',      icon: '▦' },
            { to: '/citas',          label: 'Citas',          icon: '📋' },
            { to: '/doctores',       label: 'Doctores',       icon: '👨‍⚕️' },
            { to: '/especialidades', label: 'Especialidades', icon: '🏥' },
          ].map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <div className="text-xs text-gray-500 px-3 mb-2">{admin.nombre}</div>
          <button
            onClick={logout}
            className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}