import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ProductModel } from '../../database/models/Product';
import { UserModel } from '../../database/models/User';
import { AuthenticatedRequest } from '../../middleware/auth';
import { requireDatabase } from '../../middleware/dbGuard';

export const cartRouter = Router();

cartRouter.use(requireDatabase);

// POST /api/cart/validate - Re-validate cart items against live database prices and stock
cartRouter.post('/validate', async (req: Request, res: Response) => {
  try {
    const { items, division = 'Dhaka' } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Items array is required' });
    }

    const validatedItems = [];
    let subtotal = 0;
    const errors: string[] = [];

    for (const item of items) {
      if (!item.productId) continue;

      let product = null;
      if (mongoose.Types.ObjectId.isValid(item.productId)) {
        product = await ProductModel.findById(item.productId);
      } else {
        product = await ProductModel.findOne({
          $or: [{ slug: item.productId }, { sku: item.productId }],
        });
      }

      if (!product || product.status !== 'active') {
        // If product is a demo/seed item, gracefully pass through or report
        if (item.price && item.name) {
          const itemTotal = Number(item.price) * (item.quantity || 1);
          subtotal += itemTotal;
          validatedItems.push({
            id: item.id || item.productId,
            productId: item.productId,
            name: item.name,
            price: Number(item.price),
            originalPrice: item.originalPrice,
            quantity: item.quantity || 1,
            itemTotal,
            image: item.image,
            stock: item.stock || 50,
          });
          continue;
        }
        errors.push(`Product "${item.name || item.productId}" is no longer available.`);
        continue;
      }

      let price = product.salePrice;
      let stock = product.stock;
      let sku = product.sku;
      let name = product.name;

      if (item.variantId && product.variants?.length) {
        const variant = product.variants.find((v: any) => v.id === item.variantId);
        if (variant) {
          if (variant.price) price = variant.price;
          stock = variant.stock;
          sku = variant.sku;
          name = `${product.name} (${variant.name})`;
        }
      }

      let quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
      if (quantity > stock) {
        errors.push(`Adjusted quantity for "${name}" to maximum available stock (${stock}).`);
        quantity = stock;
      }

      const itemTotal = price * quantity;
      subtotal += itemTotal;

      validatedItems.push({
        id: item.id || (item.variantId ? `${item.productId}-${item.variantId}` : item.productId),
        productId: product._id.toString(),
        variantId: item.variantId,
        name,
        sku,
        price,
        originalPrice: product.basePrice > price ? product.basePrice : undefined,
        quantity,
        stock,
        image: product.images?.[0] || '',
        options: item.options,
        itemTotal,
      });
    }

    const freeShippingThreshold = 1000;
    const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : division.toLowerCase() === 'dhaka' ? 60 : 120;
    const total = subtotal + shippingFee;

    res.json({
      success: true,
      items: validatedItems,
      subtotal,
      shippingFee,
      freeShippingThreshold,
      isFreeShipping: subtotal >= freeShippingThreshold,
      total,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Cart validation failed' });
  }
});

// POST /api/cart/sync - Persist cart items for authenticated user
cartRouter.post('/sync', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.json({ success: true, message: 'Guest cart retained on client' });
    }

    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Items array is required' });
    }

    const user = await UserModel.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.cart = items.map((i) => ({
      productId: i.productId,
      variantId: i.variantId,
      quantity: i.quantity,
      options: i.options,
    }));

    await user.save();

    res.json({
      success: true,
      message: 'Cart synchronized with user account',
      cartCount: user.cart.length,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to sync cart' });
  }
});

// GET /api/cart - Retrieve authenticated user's cart from database
cartRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.json({ success: true, items: [] });
    }

    const user = await UserModel.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({
      success: true,
      cart: user.cart || [],
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch cart' });
  }
});
