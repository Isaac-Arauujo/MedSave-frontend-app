import { Link } from 'react-router-dom'

const HeroSection = () => {
  return (
    <section className="relative pt-28 md:pt-32 pb-12 md:pb-20 overflow-hidden bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
        <div className="space-y-4 md:space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold mx-auto lg:mx-0">
            <span className="material-symbols-outlined text-sm mr-1">verified</span>
            Cuidado Inteligente com o Planeta
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-headline font-extrabold text-[#2f56c3] leading-tight">
            💊 Remédios até 70% mais baratos perto de você
          </h1>
          
          <p className="text-sm md:text-base lg:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0">
            Economize no seu dia a dia e ajude a reduzir o desperdício de medicamentos. Produtos de farmácias locais com desconto por validade — ideal para uso imediato.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <Link 
              to="/catalog"
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-full font-bold text-sm md:text-base shadow-lg hover:scale-105 transition-all text-center"
            >
              Ver ofertas agora
            </Link>
            <Link 
              to="/about"
              className="px-6 py-3 border-2 border-gray-300 text-green-600 rounded-full font-bold text-sm md:text-base hover:bg-gray-50 transition-colors text-center"
            >
              Como funciona
            </Link>
          </div>
        </div>

        {/* Imagem - visível em telas médias e grandes, oculta em mobile pequeno */}
        <div className="hidden md:block relative">
          <div className="absolute -inset-4 bg-green-100 rounded-xl blur-3xl opacity-50"></div>
          <div className="relative bg-white/80 backdrop-blur-sm p-2 rounded-xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
            <img 
              alt="Healthcare Professional" 
              className="rounded-lg w-full h-auto object-cover"
              src="https://images.unsplash.com/photo-1666214280557-f1b5022eb634?q=80&w=2070&auto=format&fit=crop"
            />
            <div className="absolute bottom-4 right-4 bg-white/90 p-3 rounded-lg shadow-lg">
              <p className="text-xs font-bold text-green-600 uppercase">+2.5k kg</p>
              <p className="text-[10px] text-gray-500">Medicamentos salvos</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection