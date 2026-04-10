import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="w-full bg-[#e0e3e5] tonal-shift">
      <div className="flex flex-col md:flex-row justify-between items-center px-12 py-16 w-full max-w-7xl mx-auto">
        <div className="mb-8 md:mb-0">
          <div className="text-xl font-bold text-[#2f56c3] mb-4 font-headline">
            MediSave
          </div>
          <p className="font-body text-sm leading-relaxed text-slate-500 max-w-xs">
            © 2026 MediSave. Economia consciente para um futuro mais saudável.
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-8 font-body text-sm">
          <Link to="/privacy" className="text-slate-500 hover:text-[#1BC768] transition-colors">
            Privacy Policy
          </Link>
          <Link to="/terms" className="text-slate-500 hover:text-[#1BC768] transition-colors">
            Terms of Service
          </Link>
          <Link to="/sustainability" className="text-slate-500 hover:text-[#1BC768] transition-colors">
            Sustainability Report
          </Link>
          <a 
            href="https://wa.me/5511953970812" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#006d35] font-semibold hover:text-[#1BC768] transition-colors"
          >
            WhatsApp Support
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer