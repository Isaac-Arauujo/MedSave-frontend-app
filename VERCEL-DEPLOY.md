# Frontend na Vercel + API no Railway

## Problema comum

Se `VITE_API_BASE_URL` apontar para `https://medisave.app.br`, o browser chama o **site React na Vercel**, não o Spring Boot no Railway. A página abre, mas listagens/login não carregam.

## Variáveis na Vercel (obrigatório)

Project → **Settings** → **Environment Variables**:

| Nome | Valor | Ambientes |
|------|--------|-----------|
| `VITE_API_BASE_URL` | `https://medsave-app-production.up.railway.app` | Production, Preview, Development |
| `VITE_MERCADOPAGO_PUBLIC_KEY` | Public Key **produção** do Mercado Pago | Production |

**Sem barra no final** da URL da API.

Depois de salvar: **Deployments** → último deploy → **⋯** → **Redeploy** (variáveis `VITE_*` entram no **build**, não em runtime).

## Railway (CORS)

No serviço **MedSave-app**:

```
CORS_ALLOWED_ORIGIN_PATTERNS=https://medisave.app.br,https://www.medisave.app.br,https://*.vercel.app
```

## Teste rápido

1. Abra `https://medsave-app-production.up.railway.app/listings?page=0&size=1` → JSON.
2. Abra `https://medisave.app.br` → site React.
3. No site, F12 → Network → requisições devem ir para `medsave-app-production.up.railway.app`, **não** para `medisave.app.br`.
