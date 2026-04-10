import { Link } from 'react-router-dom'

const About = () => {
  return (
    <main className="pt-24">
      {/* Hero Section */}
      <section className="relative px-8 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 z-10">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary-container/20 text-on-primary-fixed-variant text-xs font-semibold mb-6">
              EST. 2026 • MEDISAVE CURATOR
            </div>
            <h1 className="font-headline text-5xl md:text-7xl font-extrabold text-tertiary tracking-tight leading-[1.1] mb-8">
              Redefinindo o <span className="text-primary italic">Futuro</span> da Farmácia.
            </h1>
            <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed max-w-2xl mb-10">
              Nascemos da urgência de criar um ecossistema de saúde que respeite as pessoas e o planeta. 
              Combinamos curadoria clínica com responsabilidade ambiental.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="px-8 py-4 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-lg hover:opacity-90 transition-all active:scale-95">
                Nossa Jornada
              </button>
              <button className="px-8 py-4 rounded-full border border-outline-variant/30 text-primary font-bold hover:bg-surface-container-low transition-all active:scale-95">
                Falar Conosco
              </button>
            </div>
          </div>
          
          <div className="lg:col-span-5 relative">
            <div className="aspect-square rounded-xl overflow-hidden shadow-2xl rotate-3 scale-105">
              <img 
                className="w-full h-full object-cover" 
                alt="Professional pharmacist working"
                src="https://images.stockcake.com/public/9/9/1/99140e25-359d-4bde-bc00-7dbeb2802979_large/pharmacist-at-work-stockcake.jpg"
              />
            </div>
            <div className="absolute -bottom-10 -left-10 glass-card p-8 rounded-lg shadow-xl max-w-xs hidden md:block border border-white/20">
              <span className="material-symbols-outlined text-4xl text-primary mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
              <p className="font-headline font-bold text-tertiary text-lg">Eco-Impact Certified</p>
              <p className="text-sm text-on-surface-variant mt-2">Nossas operações são otimizadas para desperdício zero.</p>
            </div>
          </div>
        </div>
        
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 -z-10 w-1/3 h-full bg-gradient-to-l from-primary-container/10 to-transparent blur-3xl"></div>
      </section>

      {/* Our Story */}
      <section className="px-8 py-20 bg-surface-container-low">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-tertiary mb-4">A História da MediSave</h2>
            <div className="h-1.5 w-24 bg-primary rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-surface-container-lowest p-10 rounded-lg flex flex-col md:flex-row gap-8 items-center">
              <div className="w-48 h-48 rounded-full overflow-hidden flex-shrink-0 grayscale hover:grayscale-0 transition-all duration-500">
                <img 
                  className="w-full h-full object-cover" 
                  alt="Founder portrait"
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1974&auto=format&fit=crop"
                />
              </div>
              <div>
                <h3 className="font-headline text-2xl font-bold text-tertiary mb-2">Fundação Visionária</h3>
<p className="text-on-surface-variant leading-relaxed">
  A MediSave nasceu a partir de um projeto escolar, onde surgiu a ideia de reduzir o desperdício de medicamentos e torná-los mais acessíveis. O projeto se destacou tanto que três amigos decidiram se unir para transformar essa visão em realidade, dando início a uma jornada empreendedora com propósito e impacto social.
</p>
              </div>
            </div>

            <div className="bg-primary p-10 rounded-lg text-white flex flex-col justify-between">
              <span className="material-symbols-outlined text-5xl">inventory_2</span>
              <div>
                <p className="text-4xl font-black font-headline mb-1">-40%</p>
                <p className="text-sm opacity-90 font-medium">Redução média em desperdício de insumos clínicos.</p>
              </div>
            </div>

            <div className="bg-tertiary p-10 rounded-lg text-white">
              <h4 className="font-headline text-xl font-bold mb-4">Inovação Transparente</h4>
              <p className="text-sm opacity-80 leading-relaxed">
                Acreditamos que a tecnologia deve servir à humanidade, não apenas ao lucro. Por isso, cada algoritmo da MediSave prioriza o acesso antes da margem.
              </p>
            </div>

            <div className="md:col-span-2 relative rounded-lg overflow-hidden group">
              <img 
                className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105" 
                alt="Modern clean pharmacy"
                src="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=2069&auto=format&fit=crop"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                <p className="text-white font-headline font-bold text-xl">Ambiente de precisão, alma de natureza.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="px-8 py-32 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-secondary text-3xl">target</span>
              </div>
              <h3 className="font-headline text-2xl font-extrabold text-tertiary mb-4">Missão</h3>
              <p className="text-on-surface-variant leading-relaxed">
                Tornar medicamentos mais acessíveis e reduzir desperdício através de logística inteligente e curadoria clínica rigorosa.
              </p>
            </div>

            <div className="flex flex-col">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-primary text-3xl">visibility</span>
              </div>
              <h3 className="font-headline text-2xl font-extrabold text-tertiary mb-4">Visão</h3>
              <p className="text-on-surface-variant leading-relaxed">
                Ser referência em consumo inteligente e sustentável no setor de saúde, transformando a relação entre paciente e farmácia.
              </p>
            </div>

            <div className="flex flex-col">
              <div className="w-16 h-16 rounded-full bg-tertiary/10 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-tertiary text-3xl">verified</span>
              </div>
              <h3 className="font-headline text-2xl font-extrabold text-tertiary mb-4">Valores</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-on-surface-variant font-medium">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  Acessibilidade
                </li>
                <li className="flex items-center gap-3 text-on-surface-variant font-medium">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  Sustentabilidade
                </li>
                <li className="flex items-center gap-3 text-on-surface-variant font-medium">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  Inovação
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center -z-10 opacity-[0.03] select-none pointer-events-none">
          <span className="font-headline font-black text-[20vw] leading-none uppercase tracking-tighter">Impacto</span>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-8 py-20">
        <div className="max-w-5xl mx-auto rounded-xl bg-surface-container-highest p-12 md:p-20 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="font-headline text-4xl font-extrabold text-tertiary mb-6">Pronto para uma saúde mais inteligente?</h2>
            <p className="text-on-surface-variant mb-10 text-lg max-w-2xl mx-auto">
              Explore nosso catálogo curado e descubra como estamos mudando o acesso à saúde no Brasil.
            </p>
            <Link 
              to="/catalog"
              className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-primary text-white font-bold hover:scale-105 transition-transform"
            >
              Ver Catálogo Completo
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

export default About