/**
 * Reproduz fluxo PIX via API e imprime response bodies.
 */
const BASE = process.env.API_BASE_URL || 'http://localhost:8080';

async function main() {
  const ts = Date.now();
  const email = `pix.repro.${ts}@test.com`;
  const cpf = String(10000000000 + (ts % 89999999999)).padStart(11, '0').slice(0, 11);
  const password = 'Teste123!';

  const reg = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nome: 'Pix Repro',
      email,
      password,
      confirmPassword: password,
      cpf,
    }),
  });
  const auth = await reg.json();
  if (!auth.token) {
    console.error('REGISTER FAILED', reg.status, auth);
    process.exit(1);
  }
  const h = { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' };

  const listings = await (await fetch(`${BASE}/listings?page=0&size=1`)).json();
  const listing = listings.content?.[0];
  if (!listing) {
    console.error('No listings');
    process.exit(1);
  }

  await fetch(`${BASE}/cart/items`, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({ listingId: listing.id, quantity: 1 }),
  });

  const sessRes = await fetch(`${BASE}/checkout/session`, { method: 'POST', headers: h });
  const sess = await sessRes.json();
  const token = sess.sessionToken;
  console.log('SESSION', sessRes.status, { token });

  const delRes = await fetch(`${BASE}/checkout/session/${token}/delivery`, {
    method: 'PATCH',
    headers: h,
    body: JSON.stringify({ deliveryType: 'PICKUP' }),
  });
  console.log('DELIVERY', delRes.status, await delRes.text());

  const payRes = await fetch(`${BASE}/checkout/session/${token}/payment`, {
    method: 'PATCH',
    headers: h,
    body: JSON.stringify({ paymentMethod: 'PIX' }),
  });
  console.log('PAYMENT PATCH', payRes.status, await payRes.text());

  const orderRes = await fetch(`${BASE}/orders`, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({ checkoutSessionToken: token }),
  });
  const orderBody = await orderRes.text();
  console.log('ORDER', orderRes.status, orderBody);
  const order = JSON.parse(orderBody);

  const sessAfter = await fetch(`${BASE}/checkout/session/${token}`, { headers: h });
  console.log('SESSION AFTER ORDER', sessAfter.status, await sessAfter.text());

  const initRes = await fetch(`${BASE}/payments/initiate`, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({ orderId: order.id, method: 'PIX' }),
  });
  const initBody = await initRes.text();
  console.log('INITIATE', initRes.status, initBody);

  const getPayRes = await fetch(`${BASE}/payments/orders/${order.id}`, { headers: h });
  console.log('GET PAYMENT', getPayRes.status, await getPayRes.text());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
