export const ANONYMOUS_CART_STORAGE_KEY = 'medisave_anonymous_cart';
export const ANONYMOUS_CART_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export interface AnonymousCartItem {
  listingId: number;
  quantity: number;
  addedAt: string;
}

export interface AnonymousCartData {
  version: 1;
  pharmacyId?: number;
  pharmacyName?: string;
  items: AnonymousCartItem[];
}

export interface AnonymousAddItemInput {
  listingId: number;
  quantity: number;
  pharmacyId: number;
  pharmacyName: string;
}

export interface AnonymousPharmacyConflict {
  listingId: number;
  quantity: number;
  currentPharmacyName: string;
  incomingPharmacyName: string;
}

const emptyCart = (): AnonymousCartData => ({
  version: 1,
  items: [],
});

const isExpired = (addedAt: string): boolean => {
  const addedTime = Date.parse(addedAt);
  if (Number.isNaN(addedTime)) {
    return true;
  }
  return Date.now() - addedTime > ANONYMOUS_CART_TTL_MS;
};

const pruneExpiredItems = (cart: AnonymousCartData): AnonymousCartData => {
  const items = cart.items.filter((item) => !isExpired(item.addedAt));
  if (items.length === 0) {
    return emptyCart();
  }
  return { ...cart, items };
};

export const loadAnonymousCart = (): AnonymousCartData => {
  try {
    const raw = localStorage.getItem(ANONYMOUS_CART_STORAGE_KEY);
    if (!raw) {
      return emptyCart();
    }
    const parsed = JSON.parse(raw) as AnonymousCartData;
    if (parsed.version !== 1 || !Array.isArray(parsed.items)) {
      return emptyCart();
    }
    return pruneExpiredItems(parsed);
  } catch {
    return emptyCart();
  }
};

export const saveAnonymousCart = (cart: AnonymousCartData): void => {
  const pruned = pruneExpiredItems(cart);
  if (pruned.items.length === 0) {
    localStorage.removeItem(ANONYMOUS_CART_STORAGE_KEY);
    return;
  }
  localStorage.setItem(ANONYMOUS_CART_STORAGE_KEY, JSON.stringify(pruned));
};

export const clearAnonymousCart = (): void => {
  localStorage.removeItem(ANONYMOUS_CART_STORAGE_KEY);
};

export const getAnonymousItemCount = (): number =>
  loadAnonymousCart().items.reduce((sum, item) => sum + item.quantity, 0);

export const addAnonymousCartItem = (
  input: AnonymousAddItemInput
): AnonymousPharmacyConflict | null => {
  const cart = loadAnonymousCart();

  if (cart.items.length > 0 && cart.pharmacyId && cart.pharmacyId !== input.pharmacyId) {
    return {
      listingId: input.listingId,
      quantity: input.quantity,
      currentPharmacyName: cart.pharmacyName ?? 'outra farmácia',
      incomingPharmacyName: input.pharmacyName,
    };
  }

  const now = new Date().toISOString();
  const existing = cart.items.find((item) => item.listingId === input.listingId);

  const nextItems = existing
    ? cart.items.map((item) =>
        item.listingId === input.listingId
          ? { ...item, quantity: item.quantity + input.quantity, addedAt: now }
          : item
      )
    : [...cart.items, { listingId: input.listingId, quantity: input.quantity, addedAt: now }];

  saveAnonymousCart({
    version: 1,
    pharmacyId: cart.pharmacyId ?? input.pharmacyId,
    pharmacyName: cart.pharmacyName ?? input.pharmacyName,
    items: nextItems,
  });

  return null;
};

export const updateAnonymousCartItemQuantity = (listingId: number, quantity: number): void => {
  const cart = loadAnonymousCart();
  if (quantity <= 0) {
    removeAnonymousCartItem(listingId);
    return;
  }

  saveAnonymousCart({
    ...cart,
    items: cart.items.map((item) =>
      item.listingId === listingId ? { ...item, quantity, addedAt: item.addedAt } : item
    ),
  });
};

export const removeAnonymousCartItem = (listingId: number): void => {
  const cart = loadAnonymousCart();
  const items = cart.items.filter((item) => item.listingId !== listingId);
  if (items.length === 0) {
    clearAnonymousCart();
    return;
  }
  saveAnonymousCart({ ...cart, items });
};

export const getAnonymousCartItemsForMerge = (): { listingId: number; quantity: number }[] =>
  loadAnonymousCart().items.map((item) => ({
    listingId: item.listingId,
    quantity: item.quantity,
  }));
