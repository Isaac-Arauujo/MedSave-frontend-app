import { Link } from 'react-router-dom'

const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden min-h-[921px] flex items-center">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-container/20 to-secondary-container/20"></div>
        <img 
          alt="Pharmacy Background" 
          className="w-full h-full object-cover mix-blend-overlay opacity-30 grayscale"
          src="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=2069&auto=format&fit=crop"
        />
      </div>

      <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-12 items-center relative z-10">
        <div className="space-y-8">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-fixed/30 text-on-primary-fixed-variant text-sm font-semibold tracking-wide">
            <span className="material-symbols-outlined mr-2 text-base">verified</span>
            Cuidado Inteligente com o Planeta
          </div>
          
          <h1 className="text-6xl md:text-7xl font-headline font-extrabold text-tertiary leading-[1.1] -tracking-[0.03em]">
            💊 Remédios até 70% mais baratos perto de você
          </h1>
          
          <p className="text-xl text-on-surface-variant leading-relaxed max-w-xl">
            Economize no seu dia a dia e ajude a reduzir o desperdício de medicamentos. 
            Produtos de farmácias locais com desconto por validade — ideal para uso imediato.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              to="/catalog"
              className="px-10 py-5 bg-gradient-to-r from-primary to-secondary text-on-primary rounded-full font-bold text-lg shadow-xl hover:shadow-primary/20 transition-all active:scale-95 text-center"
            >
              Ver ofertas agora
            </Link>
            <Link 
              to="/about"
              className="px-10 py-5 border-2 border-outline-variant/30 text-primary rounded-full font-bold text-lg hover:bg-surface-container-low transition-colors text-center"
            >
              Como funciona
            </Link>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-4 bg-primary-fixed/20 rounded-xl blur-3xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
          <div className="relative glass-card p-4 rounded-lg overflow-hidden border border-white/20 shadow-2xl rotate-2 group-hover:rotate-0 transition-transform duration-500">
            <img 
              alt="Healthcare Professional" 
              className="rounded-lg w-full h-[500px] object-cover"
              src="https://images.unsplash.com/photo-1666214280557-f1b5022eb634?q=80&w=2070&auto=format&fit=crop"
            />
            <div className="absolute bottom-10 right-[-20px] glass-card p-6 rounded-lg shadow-xl max-w-[200px] border border-white/40">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Impacto Ambiental</p>
              <p className="text-lg font-headline font-bold text-tertiary">+2.5k kg</p>
              <p className="text-[10px] text-on-surface-variant">Medicamentos salvos do desperdício este mês.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection