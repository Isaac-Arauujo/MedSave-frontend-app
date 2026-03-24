import { useState } from 'react'
import HeroSection from '../components/HeroSection'
import SearchFilters from '../components/SearchFilters'
import ProductList from '../components/ProductList'

const Home = () => {
  const [filters, setFilters] = useState({})

  const handleSearch = (term) => {
    setFilters(prev => ({ ...prev, search: term }))
  }

  const handleFilter = (filterType) => {
    setFilters(prev => ({ ...prev, filter: filterType }))
  }

  return (
    <>
      <HeroSection />
      <SearchFilters onSearch={handleSearch} onFilter={handleFilter} />
      
      {/* Ofertas em Destaque */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-24">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-headline font-bold text-[#2f56c3]">
              Ofertas em Destaque
            </h2>
            <p className="text-sm text-gray-500">
              Economia imediata para você e para o meio ambiente.
            </p>
          </div>
          <a 
            href="/catalog" 
            className="text-green-600 font-bold flex items-center gap-1 text-sm hover:underline"
          >
            Ver todo o catálogo 
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </a>
        </div>

        <ProductList filters={filters} />
      </section>

      {/* Eco Section - mantém design original, adapta para mobile */}
      <section className="py-12 md:py-24 bg-[#2f56c3] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 grid md:grid-cols-2 gap-8 md:gap-20 items-center">
          <div className="relative order-2 md:order-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="h-32 md:h-48 rounded-lg bg-green-400/20 overflow-hidden">
                  <img 
                    alt="Nature" 
                    className="w-full h-full object-cover"
                    src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop"
                  />
                </div>
                <div className="h-24 md:h-32 rounded-lg bg-teal-400/30 flex items-center justify-center p-4 text-center">
                  <p className="text-xs font-bold leading-tight">Consumo Consciente como Prioridade</p>
                </div>
              </div>
              <div className="space-y-4 pt-4 md:pt-8">
                <div className="h-24 md:h-32 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center p-4 text-center border border-white/10">
                  <p className="text-xs font-bold leading-tight">Economia Circular na Saúde</p>
                </div>
                <div className="h-32 md:h-48 rounded-lg bg-green-500/40 overflow-hidden">
                  <img 
                    alt="Recycle" 
                    className="w-full h-full object-cover"
                    src="https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=2670&auto=format&fit=crop"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4 md:space-y-8 order-1 md:order-2 text-center md:text-left">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-headline font-extrabold leading-tight">
              Você não está apenas economizando — está ajudando o planeta 🌍
            </h2>
            <div className="space-y-4 md:space-y-6 text-sm md:text-base">
              <div className="flex gap-3 md:gap-4">
                <span className="material-symbols-outlined text-green-300 shrink-0">recycling</span>
                <p>Toneladas de medicamentos são descartados anualmente apenas por atingirem a data de validade em prateleiras, gerando poluição do solo e água.</p>
              </div>
              <div className="flex gap-3 md:gap-4">
                <span className="material-symbols-outlined text-green-300 shrink-0">local_shipping</span>
                <p>Ao comprar produtos próximos ao vencimento para uso imediato, você evita novas produções desnecessárias e reduz a pegada de carbono logística.</p>
              </div>
              <div className="flex gap-3 md:gap-4">
                <span className="material-symbols-outlined text-green-300 shrink-0">savings</span>
                <p>O acesso à saúde torna-se mais democrático através de preços justos, combatendo o desperdício sistêmico do setor farmacêutico.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works - 3 passos */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-24">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-2xl md:text-4xl font-headline font-extrabold text-[#2f56c3]">Como Funciona</h2>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">Sua jornada de economia consciente em 3 passos simples.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {[
            { icon: 'medication', title: '1. Escolha o medicamento', text: 'Busque pelo nome ou categoria no nosso catálogo de ofertas locais atualizado diariamente.' },
            { icon: 'analytics', title: '2. Veja desconto e validade', text: 'Transparência total sobre a data de vencimento e o desconto aplicado para sua segurança.' },
            { icon: 'chat_bubble', title: '3. Compre via WhatsApp', text: 'Finalize sua reserva diretamente com a farmácia pelo WhatsApp para entrega ou retirada rápida.' }
          ].map((step, i) => (
            <div key={i} className="text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-2xl md:text-3xl text-green-600">{step.icon}</span>
              </div>
              <h3 className="font-bold text-base md:text-xl">{step.title}</h3>
              <p className="text-xs md:text-sm text-gray-500 mt-2 px-2">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-gray-50 py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex flex-wrap justify-center md:justify-between items-center gap-6 md:gap-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-green-600 text-sm md:text-base">verified_user</span>
            </div>
            <div>
              <h4 className="font-bold text-xs md:text-sm">Farmácias verificadas</h4>
              <p className="text-[10px] md:text-xs text-gray-500">Apenas parceiros certificados</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-green-600 text-sm md:text-base">visibility</span>
            </div>
            <div>
              <h4 className="font-bold text-xs md:text-sm">Validade transparente</h4>
              <p className="text-[10px] md:text-xs text-gray-500">Datas claras em todas ofertas</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-green-600 text-sm md:text-base">lock</span>
            </div>
            <div>
              <h4 className="font-bold text-xs md:text-sm">Compra segura</h4>
              <p className="text-[10px] md:text-xs text-gray-500">Garantia total de origem</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-24">
        <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-8 md:p-12 text-center text-white shadow-2xl">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-headline font-extrabold mb-4 md:mb-6">
            Economize agora e faça parte de uma solução inteligente
          </h2>
          <p className="text-sm md:text-base opacity-90 mb-6 md:mb-10 max-w-2xl mx-auto">
            Junte-se a milhares de pessoas que já economizam enquanto protegem o planeta.
          </p>
          <a 
            href="/catalog"
            className="inline-block bg-white text-green-600 px-6 py-3 md:px-12 md:py-5 rounded-full font-bold text-sm md:text-xl shadow-xl hover:scale-105 transition-all"
          >
            Ver ofertas no WhatsApp
          </a>
        </div>
      </section>
    </>
  )
}

export default Home