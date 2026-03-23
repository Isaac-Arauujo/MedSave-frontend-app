import { Link } from 'react-router-dom'

const Impact = () => {
  return (
    <main className="pt-24">
      {/* Hero Section */}
      <section className="relative px-8 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="z-10">
            <span className="inline-block px-4 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold mb-6 tracking-widest uppercase">
              Eco-Impact Certified
            </span>
            <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-tertiary leading-[1.1] mb-8 tracking-tighter">
              Economizar nunca fez tão bem para o planeta 🌍
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed mb-10 max-w-xl">
              Nossa missão clínica vai além do cuidado com o paciente; cuidamos do ecossistema que sustenta a vida. 
              Através da curadoria inteligente, evitamos o desperdício de medicamentos e reduzimos a pegada de carbono da saúde.
            </p>
            <div className="flex flex-wrap gap-4">
              <a 
                href="https://drive.google.com/file/d/SEU_LINK_AQUI/view"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-full font-bold shadow-lg hover:scale-105 transition-transform inline-block"
              >
                Ver Relatório de Sustentabilidade
              </a>
              <a 
                href="https://wa.me/5511999999999?text=Olá! Preciso de ajuda com o site MedSave."
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-green-100 text-green-800 rounded-full font-bold flex items-center gap-2 hover:bg-green-200 transition-colors inline-flex"
              >
                <span className="material-symbols-outlined">chat</span>
                WhatsApp Support
              </a>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-green-100 rounded-full blur-3xl"></div>
            <div className="relative rounded-xl overflow-hidden shadow-2xl">
              <img 
                alt="Eco-friendly medical curation" 
                className="w-full h-[500px] object-cover rounded-xl"
                src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2013&auto=format&fit=crop"
              />
              <div className="absolute bottom-6 left-6 right-6 bg-white/80 backdrop-blur-md p-6 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white">
                    <span className="material-symbols-outlined">eco</span>
                  </div>
                  <div>
                    <p className="font-headline font-bold text-green-800">Compromisso Curador</p>
                    <p className="text-xs text-gray-600">Práticas clínicas com zero desperdício</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bento Grid */}
      <section className="px-8 py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center lg:text-left">
            <h2 className="font-headline text-3xl font-extrabold text-tertiary mb-4">Impacto em Números</h2>
            <p className="text-gray-600 max-w-2xl">Transparência clínica e ambiental em cada prescrição e entrega.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card Principal */}
            <div className="md:col-span-2 bg-white p-10 rounded-lg shadow-md flex flex-col justify-between relative overflow-hidden group">
              <div className="z-10">
                <span className="material-symbols-outlined text-green-600 text-5xl mb-6">pill</span>
                <h3 className="font-headline text-6xl font-black text-green-600 mb-2 tracking-tighter">Mais de 2.000</h3>
                <p className="text-xl font-bold text-tertiary mb-4">medicamentos salvos</p>
                <p className="text-gray-600 leading-relaxed max-w-md">
                  Através do nosso sistema de curadoria, redirecionamos medicamentos próximos ao vencimento para quem precisa, evitando o descarte químico inadequado.
                </p>
              </div>
              <div className="absolute right-0 bottom-0 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <span className="material-symbols-outlined text-[200px]">recycling</span>
              </div>
            </div>

            {/* Card Verde */}
            <div className="bg-gradient-to-br from-teal-600 to-green-600 p-10 rounded-lg text-white">
              <span className="material-symbols-outlined text-4xl mb-6">local_pharmacy</span>
              <h3 className="font-headline text-4xl font-bold mb-4 tracking-tight">Redução de desperdício</h3>
              <p className="text-green-100 mb-8">Otimizamos o estoque de farmácias locais, reduzindo em 35% o descarte anual de excedentes.</p>
              <div className="pt-6 border-t border-white/20">
                <p className="text-xs font-bold uppercase tracking-widest">Farmácias Parceiras</p>
                <p className="text-3xl font-black mt-2">150+</p>
              </div>
            </div>

            {/* Card Água */}
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-teal-600">water_drop</span>
              </div>
              <h4 className="font-headline text-xl font-bold text-tertiary mb-2">Água Preservada</h4>
              <p className="text-sm text-gray-600">Evitamos a contaminação de lençóis freáticos por descarte incorreto de fármacos.</p>
            </div>

            {/* Card Logística */}
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-green-600">energy_savings_leaf</span>
              </div>
              <h4 className="font-headline text-xl font-bold text-tertiary mb-2">Logística Verde</h4>
              <p className="text-sm text-gray-600">Entregas roteirizadas por IA para minimizar a emissão de CO2 em cada km percorrido.</p>
            </div>

            {/* Card Embalagem */}
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-blue-600">compost</span>
              </div>
              <h4 className="font-headline text-xl font-bold text-tertiary mb-2">Embalagem Eco</h4>
              <p className="text-sm text-gray-600">Utilizamos materiais 100% biodegradáveis e recicláveis em todos os envios nacionais.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-8 pb-32">
        <div className="max-w-5xl mx-auto rounded-xl bg-gray-100 p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-teal-50 pointer-events-none"></div>
          <h2 className="font-headline text-4xl font-extrabold text-tertiary mb-6 relative z-10">
            Faça parte da revolução sustentável na saúde.
          </h2>
          <p className="text-gray-600 mb-10 max-w-2xl mx-auto relative z-10">
            Junte-se a milhares de pacientes e profissionais que escolheram a MedSave para uma vida mais saudável e um planeta mais verde.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center relative z-10">
            <Link 
              to="/cadastro"
              className="px-10 py-4 bg-green-600 text-white rounded-full font-bold hover:shadow-xl hover:bg-green-700 transition-all inline-block"
            >
              Cadastrar Agora
            </Link>
            <Link 
              to="/catalog"
              className="px-10 py-4 border border-green-600 text-green-600 rounded-full font-bold hover:bg-green-50 transition-colors inline-block"
            >
              Conhecer o Catálogo
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Impact