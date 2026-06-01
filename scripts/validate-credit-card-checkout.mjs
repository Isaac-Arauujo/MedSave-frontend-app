/**
 * Validação pós-correção: checkout cartão não deve redirecionar para /login
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACTS = path.join(__dirname, '..', 'e2e-artifacts', 'credit-card-post-fix');
const BASE_URL = 'http://localhost:5127';
const ts = Date.now();
const EMAIL = `e2e.card.${ts}@test.com`;
const PASSWORD = 'Teste123!';

fs.mkdirSync(ARTIFACTS, { recursive: true });

const evidence = { email: EMAIL, network: [], consoleErrors: [] };

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') evidence.consoleErrors.push(msg.text());
  });
  page.on('response', async (response) => {
    const url = response.url();
    if (!url.includes('localhost:8080')) return;
    let body = '';
    try {
      body = (await response.text()).slice(0, 1500);
    } catch {
      body = '';
    }
    const req = response.request();
    const headers = req.headers();
    evidence.network.push({
      method: req.method(),
      url,
      status: response.status(),
      requestPayload: req.postDataJSON?.() ?? req.postData(),
      responseBody: body,
      authorizationSent: Boolean(headers.authorization),
    });
  });

  await page.goto(`${BASE_URL}/register`);
  await page.locator('#firstName').fill('E2E');
  await page.locator('#lastName').fill('Card');
  await page.locator('#email').fill(EMAIL);
  await page.locator('#cpf').fill('52998224725');
  await page.locator('#password').fill(PASSWORD);
  await page.locator('#confirmPassword').fill(PASSWORD);
  await page.getByRole('main').getByRole('button', { name: 'Cadastrar' }).click();
  await page.waitForURL(/\/(listings|customer)/, { timeout: 20000 });

  await page.goto(`${BASE_URL}/listings`);
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).first().click();
  await page.waitForTimeout(800);
  await page.goto(`${BASE_URL}/cart`);
  await page.getByRole('button', { name: 'Ir para checkout' }).click();
  await page.waitForURL('**/checkout**');

  await page.getByRole('button', { name: /Retirada na farmácia/i }).first().click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.waitForTimeout(1500);

  await page.getByRole('button', { name: 'Cartão de crédito' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.waitForTimeout(1000);

  const authBefore = await page.evaluate(() => localStorage.getItem('auth-storage'));
  await page.screenshot({ path: path.join(ARTIFACTS, 'before-finalize.png'), fullPage: true });
  await page.getByRole('button', { name: 'Finalizar pedido' }).click();
  await page.waitForTimeout(5000);
  await page.screenshot({ path: path.join(ARTIFACTS, 'after-finalize.png'), fullPage: true });

  const authAfter = await page.evaluate(() => localStorage.getItem('auth-storage'));
  const parsedAfter = authAfter ? JSON.parse(authAfter) : null;

  evidence.urls = { final: page.url() };
  evidence.redirectedToLogin = page.url().includes('/login');
  evidence.authKept = Boolean(parsedAfter?.state?.token);
  evidence.onPaymentPage = page.url().includes('/checkout/payment');

  fs.writeFileSync(path.join(ARTIFACTS, 'evidence.json'), JSON.stringify(evidence, null, 2));
  console.log(JSON.stringify(evidence, null, 2));

  await browser.close();
  process.exit(evidence.redirectedToLogin ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
