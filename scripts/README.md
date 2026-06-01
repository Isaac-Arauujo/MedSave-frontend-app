# Scripts de diagnóstico (local)

## validate-credit-card-checkout.mjs

Valida que o fluxo checkout → cartão de crédito → finalizar pedido **não** redireciona para `/login`.

Pré-requisitos: backend em `:8080`, frontend em `:5127`, Playwright instalado (`npm install --no-save playwright`).

```bash
node scripts/validate-credit-card-checkout.mjs
```

Saída: `e2e-artifacts/credit-card-post-fix/` (ignorado pelo git). Exit code `0` = sucesso.
