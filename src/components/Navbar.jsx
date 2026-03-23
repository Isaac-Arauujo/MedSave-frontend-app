import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { authenticated, user, logout, isAdmin } = useAuth()

  const navLinks = [
    { path: '/', label: 'Início' },
    { path: '/catalog', label: 'Catálogo' },
    { path: '/impact', label: 'Impacto' },
    { path: '/about', label: 'Sobre Nós' },
  ]

  const adminLinks = [
    { path: '/admin', label: 'Produtos' },
    { path: '/admin/farmacias', label: 'Farmácias' },
  ]

  const isAdminPage = location.pathname.startsWith('/admin')
  const isAdminUser = isAdmin()

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsMenuOpen(false)
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl shadow-sm">
      <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
        <Link to="/" className="text-2xl font-black tracking-tighter text-[#2f56c3] font-headline">
          MedSave
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8 font-headline font-bold tracking-tight text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`${
                location.pathname === link.path
                  ? 'text-[#006d35] border-b-2 border-[#006d35] pb-1'
                  : 'text-slate-600 font-medium hover:text-[#006d35] transition-colors'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Admin Menu - só aparece se for admin */}
          {isAdminUser && (
            <div className="relative group">
              <button
                className={`flex items-center gap-1 ${
                  isAdminPage
                    ? 'text-[#006d35] border-b-2 border-[#006d35] pb-1'
                    : 'text-slate-600 font-medium hover:text-[#006d35] transition-colors'
                }`}
              >
                Admin
                <span className="material-symbols-outlined text-base group-hover:rotate-180 transition-transform">
                  arrow_drop_down
                </span>
              </button>
              
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {adminLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block px-4 py-3 text-sm hover:bg-surface-container-low first:rounded-t-lg last:rounded-b-lg ${
                      location.pathname === link.path
                        ? 'text-[#006d35] font-bold bg-surface-container-low'
                        : 'text-slate-600'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Login/Logout Buttons */}
          {authenticated ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-error text-white rounded-full text-sm font-bold hover:bg-error/90 transition-colors"
            >
              Sair
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 bg-primary text-white rounded-full text-sm font-bold hover:bg-primary/90 transition-colors"
              >
                Entrar
              </Link>
              <Link
                to="/cadastro"
                className="px-4 py-2 border border-primary text-primary rounded-full text-sm font-bold hover:bg-primary/10 transition-colors"
              >
                Cadastrar
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 hover:bg-slate-50 rounded-full"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="material-symbols-outlined text-[#006d35]">
              {isMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl px-8 py-4 border-t border-outline-variant/20">
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`${
                  location.pathname === link.path
                    ? 'text-[#006d35] font-bold'
                    : 'text-slate-600 font-medium'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Admin section in mobile */}
            {isAdminUser && (
              <div className="pt-2 border-t border-outline-variant/20">
                <p className="text-xs font-bold text-outline uppercase mb-2">Admin</p>
                {adminLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block py-2 ${
                      location.pathname === link.path
                        ? 'text-[#006d35] font-bold'
                        : 'text-slate-600'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
            
            {/* Login/Logout mobile */}
            <div className="pt-2 border-t border-outline-variant/20">
              {authenticated ? (
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-2 text-error font-medium"
                >
                  Sair
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    className="block py-2 text-primary font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/cadastro"
                    className="block py-2 text-primary font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Cadastrar
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar