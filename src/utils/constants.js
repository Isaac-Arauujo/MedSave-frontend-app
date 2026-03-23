export const WHATSAPP_NUMBER = '5511953970812' // Substitua pelo seu número

export const WHATSAPP_MESSAGE = (product) => {
  return encodeURIComponent(
    `Olá, tenho interesse no produto:\n` +
    `${product.nome}\n` + // Mudou de name para nome
    `Valor: R$ ${(product.precoDesconto || product.precoOriginal)?.toFixed(2)}\n` + // Mudou para precoDesconto/precoOriginal
    `Validade: ${new Date(product.dataValidade).toLocaleDateString('pt-BR')}` // Mudou para dataValidade
  )
}

export const WHATSAPP_LINK = (product) => {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE(product)}`
}