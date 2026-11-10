import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WishlistItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  discountBadge?: string;
  image: string;
  rating?: number;
  reviewCount?: number | string;
  category?: string;
  inStock?: boolean;
}

interface WishlistState {
  items: WishlistItem[];
}

const STORAGE_KEY = 'aurelia_wishlist';

// Pre-seed initial default items if nothing is saved yet so the page immediately displays rich products matching reference image
const DEFAULT_WISHLIST_ITEMS: WishlistItem[] = [
  {
    productId: 'seed-airpods-pro-2',
    name: 'AirPods Pro 2',
    slug: 'airpods-pro-2',
    price: 24990,
    originalPrice: 29990,
    discountBadge: '-17%',
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    reviewCount: '12k reviews',
    category: 'Electronics',
    inStock: true,
  },
  {
    productId: 'seed-smart-watch-series-10',
    name: 'Smart Watch Series 10',
    slug: 'smart-watch-series-10',
    price: 11990,
    originalPrice: 14990,
    discountBadge: '-20%',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
    reviewCount: '8k reviews',
    category: 'Electronics',
    inStock: true,
  },
  {
    productId: 'seed-bluetooth-speaker',
    name: 'Bluetooth Speaker',
    slug: 'bluetooth-speaker',
    price: 3999,
    originalPrice: 5999,
    discountBadge: '-25%',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80',
    rating: 4.6,
    reviewCount: '7k reviews',
    category: 'Electronics',
    inStock: true,
  },
  {
    productId: 'seed-backpack-pro',
    name: 'Backpack',
    slug: 'ergonomic-travel-backpack',
    price: 2999,
    originalPrice: 3799,
    discountBadge: '-22%',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
    reviewCount: '7k reviews',
    category: 'Fashion',
    inStock: true,
  },
];

const loadSavedWishlist = (): WishlistItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
    // Default initial seed matching the reference image (4 items)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_WISHLIST_ITEMS));
    return DEFAULT_WISHLIST_ITEMS;
  } catch {
    return DEFAULT_WISHLIST_ITEMS;
  }
};

const initialState: WishlistState = {
  items: loadSavedWishlist(),
};

export const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist: (state, action: PayloadAction<WishlistItem>) => {
      const exists = state.items.some((i) => i.productId === action.payload.productId);
      if (!exists) {
        state.items.push(action.payload);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
        } catch (e) {
          console.error(e);
        }
      }
    },

    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i.productId !== action.payload);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
      } catch (e) {
        console.error(e);
      }
    },

    toggleWishlist: (state, action: PayloadAction<WishlistItem>) => {
      const index = state.items.findIndex((i) => i.productId === action.payload.productId);
      if (index > -1) {
        state.items.splice(index, 1);
      } else {
        state.items.push(action.payload);
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
      } catch (e) {
        console.error(e);
      }
    },

    clearWishlist: (state) => {
      state.items = [];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      } catch (e) {
        console.error(e);
      }
    },

    setWishlistItems: (state, action: PayloadAction<WishlistItem[]>) => {
      state.items = action.payload;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
      } catch (e) {
        console.error(e);
      }
    },
  },
});

export const {
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  clearWishlist,
  setWishlistItems,
} = wishlistSlice.actions;

// Selectors
export const selectWishlistItems = (state: { wishlist: WishlistState }) => state.wishlist.items;
export const selectWishlistCount = (state: { wishlist: WishlistState }) => state.wishlist.items.length;
export const selectIsInWishlist = (productId: string) => (state: { wishlist: WishlistState }) =>
  state.wishlist.items.some((item) => item.productId === productId);

export default wishlistSlice.reducer;
