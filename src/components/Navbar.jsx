import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { authenticated, logout, isAdmin } = useAuth()

  const navLinks = [
    { path: '/', label: 'Início' },
    { path: '/catalog', label: 'Catálogo' },
    { path: '/impact', label: 'Impacto' },
    { path: '/about', label: 'Sobre' },
  ]

  const adminLinks = [
    { path: '/admin', label: 'Produtos' },
    { path: '/admin/farmacias', label: 'Farmácias' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsMenuOpen(false)
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="flex justify-between items-center px-4 sm:px-6 md:px-8 py-3 md:py-4 max-w-7xl mx-auto">
        <Link to="/" className="text-xl sm:text-2xl font-black tracking-tighter text-[#2f56c3] font-headline">
          MediSave
        </Link>

        {/* Desktop Menu - visível em telas médias e grandes */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8 font-headline font-bold text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`${
                location.pathname === link.path
                  ? 'text-[#006d35] border-b-2 border-[#006d35] pb-1'
                  : 'text-slate-600 hover:text-[#006d35] transition-colors'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {isAdmin() && (
            <div className="relative group">
              <button className="text-slate-600 hover:text-[#006d35] flex items-center gap-1">
                Admin
                <span className="material-symbols-outlined text-base">arrow_drop_down</span>
              </button>
              <div className="absolute top-full right-0 mt-2 w-40 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                {adminLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="block px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {authenticated ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-full text-sm font-bold hover:bg-red-600"
            >
              Sair
            </button>
          ) : (
            <div className="flex gap-2">
              <Link
                to="/login"
                className="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-bold hover:bg-green-700"
              >
                Entrar
              </Link>
              <Link
                to="/cadastro"
                className="px-4 py-2 border border-green-600 text-green-600 rounded-full text-sm font-bold hover:bg-green-50"
              >
                Cadastrar
              </Link>
            </div>
          )}
        </div>

        {/* Botão Mobile */}
        <button 
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="material-symbols-outlined text-[#2f56c3] text-2xl">
            {isMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* Menu Mobile - aparece apenas em telas pequenas */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 shadow-lg">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`py-2 text-base ${
                  location.pathname === link.path
                    ? 'text-[#006d35] font-bold'
                    : 'text-slate-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            {isAdmin() && (
              <>
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-400 uppercase mb-2">Admin</p>
                  {adminLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="block py-2 text-slate-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </>
            )}
            
            <div className="pt-2 border-t border-gray-100">
              {authenticated ? (
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-2 text-red-600 font-medium"
                >
                  Sair
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    className="py-2 text-green-600 font-medium text-center bg-green-50 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/cadastro"
                    className="py-2 text-green-600 font-medium text-center border border-green-600 rounded-lg"
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