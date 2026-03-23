import { WHATSAPP_NUMBER } from '../utils/constants'

const WhatsAppButton = () => {
  const handleClick = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}`, '_blank')
  }

  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-10 right-10 z-50 group"
    >
      <div className="absolute -inset-2 bg-primary-container rounded-full blur opacity-0 group-hover:opacity-40 transition duration-300"></div>
      <div className="relative w-16 h-16 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center shadow-2xl scale-100 active:scale-90 transition-transform">
        <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          chat
        </span>
      </div>
    </a>
  )
}

export default WhatsAppButton