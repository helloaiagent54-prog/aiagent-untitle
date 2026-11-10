import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem } from '../../types';

export interface AppliedCoupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discount: number;
}

interface CartState {
  items: CartItem[];
  coupon: AppliedCoupon | null;
  isOpenDrawer: boolean;
}

const DEFAULT_CART_ITEMS: CartItem[] = [
  {
    id: 'seed-airpods-pro-2',
    productId: 'seed-airpods-pro-2',
    name: 'AirPods Pro 2',
    subtitle: 'Premium Wireless Earbuds',
    sku: 'APP2-WHT',
    price: 24990,
    originalPrice: 29990,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80',
    stock: 25,
    selected: true,
  },
  {
    id: 'seed-samsung-galaxy-s25',
    productId: 'seed-samsung-galaxy-s25',
    name: 'Samsung Galaxy S25',
    subtitle: 'Next Gen Smartphone',
    sku: 'SGS25-BLU',
    price: 79990,
    originalPrice: 89990,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=600&q=80',
    stock: 15,
    selected: true,
  },
  {
    id: 'seed-smart-watch-series-10',
    productId: 'seed-smart-watch-series-10',
    name: 'Smart Watch Series 10',
    subtitle: 'Smart Watch',
    sku: 'SWS10-BLK',
    price: 11990,
    originalPrice: 14990,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80',
    stock: 40,
    selected: true,
  },
];

const loadSavedCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem('novara_cart');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item) => ({
          ...item,
          selected: item.selected !== false,
        }));
      }
    }
    // Pre-seed matching reference image (৳116,970 total)
    localStorage.setItem('novara_cart', JSON.stringify(DEFAULT_CART_ITEMS));
    return DEFAULT_CART_ITEMS;
  } catch {
    return DEFAULT_CART_ITEMS;
  }
};

const initialState: CartState = {
  items: loadSavedCart(),
  coupon: null,
  isOpenDrawer: false,
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    toggleItemSelection: (state, action: PayloadAction<string>) => {
      const item = state.items.find((i) => i.id === action.payload);
      if (item) {
        item.selected = item.selected === false ? true : false;
        try {
          localStorage.setItem('novara_cart', JSON.stringify(state.items));
        } catch (e) {
          console.error(e);
        }
      }
    },

    selectAllItems: (state, action: PayloadAction<boolean>) => {
      state.items.forEach((item) => {
        item.selected = action.payload;
      });
      try {
        localStorage.setItem('novara_cart', JSON.stringify(state.items));
      } catch (e) {
        console.error(e);
      }
    },

    addToCart: (
      state,
      action: PayloadAction<{
        productId: string;
        variantId?: string;
        name: string;
        subtitle?: string;
        sku: string;
        price: number;
        originalPrice?: number;
        quantity: number;
        image: string;
        options?: Record<string, string>;
        stock: number;
      }>
    ) => {
      const payload = action.payload;
      const itemId = payload.variantId ? `${payload.productId}-${payload.variantId}` : payload.productId;

      const existingIndex = state.items.findIndex((i) => i.id === itemId);

      if (existingIndex > -1) {
        const item = state.items[existingIndex];
        const newQty = Math.min(item.stock, item.quantity + payload.quantity);
        item.quantity = newQty;
        item.selected = true;
      } else {
        state.items.push({
          id: itemId,
          productId: payload.productId,
          variantId: payload.variantId,
          name: payload.name,
          subtitle: payload.subtitle,
          sku: payload.sku,
          price: payload.price,
          originalPrice: payload.originalPrice,
          quantity: Math.min(payload.stock, Math.max(1, payload.quantity)),
          image: payload.image,
          options: payload.options,
          stock: payload.stock,
          selected: true,
        });
      }

      try {
        localStorage.setItem('novara_cart', JSON.stringify(state.items));
      } catch (e) {
        console.error(e);
      }
    },

    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((i) => i.id === id);
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter((i) => i.id !== id);
        } else {
          item.quantity = Math.min(item.stock, quantity);
        }
      }
      try {
        localStorage.setItem('novara_cart', JSON.stringify(state.items));
      } catch (e) {
        console.error(e);
      }
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
      try {
        localStorage.setItem('novara_cart', JSON.stringify(state.items));
      } catch (e) {
        console.error(e);
      }
    },

    clearCart: (state) => {
      state.items = [];
      state.coupon = null;
      try {
        localStorage.removeItem('novara_cart');
      } catch (e) {
        console.error(e);
      }
    },

    applyCoupon: (state, action: PayloadAction<AppliedCoupon>) => {
      state.coupon = action.payload;
    },

    removeCoupon: (state) => {
      state.coupon = null;
    },

    setCartDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpenDrawer = action.payload;
    },
  },
});

export const {
  toggleItemSelection,
  selectAllItems,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
  setCartDrawerOpen,
} = cartSlice.actions;

// Selectors
// Badge displays unique lines count per Rule 16
export const selectCartUniqueLinesCount = (state: { cart: CartState }) => state.cart.items.length;

export const selectCartSubtotal = (state: { cart: CartState }) =>
  state.cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

export const selectSelectedCartSubtotal = (state: { cart: CartState }) =>
  state.cart.items
    .filter((item) => item.selected !== false)
    .reduce((acc, item) => acc + item.price * item.quantity, 0);

export const selectCartDiscount = (state: { cart: CartState }) => {
  const subtotal = selectCartSubtotal(state);
  const coupon = state.cart.coupon;
  if (!coupon) return 0;
  if (coupon.discountType === 'percentage') {
    return Math.round((subtotal * coupon.discountValue) / 100);
  }
  return coupon.discountValue;
};

export const selectCartShippingFee = (state: { cart: CartState }, division: string = 'Dhaka') => {
  const subtotal = selectCartSubtotal(state);
  if (subtotal === 0) return 0;
  // Free shipping threshold: ৳1,000
  if (subtotal >= 1000) return 0;
  return division.toLowerCase() === 'dhaka' ? 60 : 120;
};

export const selectCartTotal = (state: { cart: CartState }, division: string = 'Dhaka') => {
  const subtotal = selectCartSubtotal(state);
  if (subtotal === 0) return 0;
  const discount = selectCartDiscount(state);
  const shipping = selectCartShippingFee(state, division);
  return Math.max(0, subtotal - discount + shipping);
};

export const selectSelectedCartTotal = (state: { cart: CartState }, division: string = 'Dhaka') => {
  const subtotal = selectSelectedCartSubtotal(state);
  if (subtotal === 0) return 0;
  const discount = selectCartDiscount(state);
  const shipping = subtotal >= 1000 ? 0 : (division.toLowerCase() === 'dhaka' ? 60 : 120);
  return Math.max(0, subtotal - discount + shipping);
};

export default cartSlice.reducer;
