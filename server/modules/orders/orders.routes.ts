import { Router, Response } from 'express';
import { z } from 'zod';
import { OrderModel, OrderStatus, PaymentStatus } from '../../database/models/Order';
import { ProductModel } from '../../database/models/Product';
import { CouponModel } from '../../database/models/Coupon';
import { AuthenticatedRequest, requireAuth, requireRole } from '../../middleware/auth';
import { requireDatabase } from '../../middleware/dbGuard';
import { escapeRegex } from '../../utils/regex';

import mongoose from 'mongoose';

export const ordersRouter = Router();

// Require database for all order operations
ordersRouter.use(requireDatabase);

const checkoutOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().optional(),
        name: z.string().optional(),
        sku: z.string().optional(),
        price: z.number().optional(),
        quantity: z.number().int().min(1),
        options: z.record(z.string(), z.string()).optional(),
        variant: z.record(z.string(), z.string()).optional(),
        image: z.string().optional(),
      })
    )
    .min(1, 'At least one item is required in the cart to place an order'),
  shippingAddress: z.object({
    recipientName: z.string().min(2, 'Recipient name is required'),
    phone: z.string().min(6, 'Valid phone number is required'),
    division: z.string().min(2, 'Division is required'),
    district: z.string().min(2, 'District is required'),
    upazila: z.string().min(2, 'Upazila/Thana is required'),
    unionOrWard: z.string().optional(),
    streetAddress: z.string().min(5, 'Detailed street address is required'),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }),
  paymentMethod: z.enum(['cod', 'card', 'bkash', 'nagad']),
  couponCode: z.string().optional(),
  customerEmail: z.string().optional(),
  customerName: z.string().optional(),
  notes: z.string().optional(),
});

// POST /api/orders (Create order - supports both authenticated users and guests)
ordersRouter.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parse = checkoutOrderSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ success: false, errors: parse.error.format() });
    }

    const { items: cartItems, shippingAddress, paymentMethod, couponCode } = parse.data;

    // Validate every item against live database, fetch authentic price & check stock
    let subtotal = 0;
    const resolvedItems = [];

    for (const item of cartItems) {
      let product = null;
      if (mongoose.Types.ObjectId.isValid(item.productId)) {
        product = await ProductModel.findById(item.productId);
      } else {
        product = await ProductModel.findOne({
          $or: [{ slug: item.productId }, { sku: item.productId }],
        });
      }

      if (!product || product.status !== 'active') {
        if (item.price && item.name) {
          const itemTotal = Number(item.price) * item.quantity;
          subtotal += itemTotal;
          resolvedItems.push({
            productId: item.productId,
            variantId: item.variantId,
            name: item.name,
            sku: item.sku || 'SKU-AURELIA',
            price: Number(item.price),
            quantity: item.quantity,
            image: item.image || '',
            options: item.options || {},
          });
          continue;
        }
        return res.status(400).json({
          success: false,
          message: `Product ${item.name || item.productId} is not available for purchase.`,
        });
      }

      // Check stock
      let unitPrice = product.salePrice;
      let availableStock = product.stock;
      let sku = product.sku;
      let itemName = product.name;
      let resolvedVariantId: string | undefined = undefined;

      if ((item.variantId || item.sku || item.variant) && product.variants?.length) {
        const variant = product.variants.find((v: any) =>
          (item.variantId && v.id === item.variantId) ||
          (item.sku && v.sku === item.sku) ||
          (item.variant && Object.keys(item.variant).length && Object.entries(item.variant).every(([k, val]) => v.options?.[k] === val))
        );
        if (variant) {
          if (variant.price) unitPrice = variant.price;
          availableStock = variant.stock;
          sku = variant.sku;
          itemName = `${product.name} (${variant.name})`;
          resolvedVariantId = variant.id;
        }
      }

      if (availableStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${itemName}". Only ${availableStock} unit(s) remaining.`,
        });
      }

      const itemTotal = unitPrice * item.quantity;
      subtotal += itemTotal;

      resolvedItems.push({
        productId: product._id.toString(),
        variantId: resolvedVariantId || item.variantId,
        name: itemName,
        sku,
        price: unitPrice,
        quantity: item.quantity,
        image: product.images?.[0] || '',
        options: item.options || item.variant || {},
      });
    }

    // Server-side discount calculation with Coupon validation
    let discount = 0;
    let validCouponCode = '';
    if (couponCode) {
      const coupon = await CouponModel.findOne({
        code: couponCode.toUpperCase().trim(),
        isActive: true,
        validUntil: { $gte: new Date() },
      });

      if (coupon) {
        if (subtotal >= coupon.minOrderAmount) {
          if (coupon.discountType === 'percentage') {
            discount = Math.round((subtotal * coupon.discountValue) / 100);
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
              discount = coupon.maxDiscount;
            }
          } else {
            discount = coupon.discountValue;
          }
          validCouponCode = coupon.code;
          // Increment coupon usage
          coupon.usedCount += 1;
          await coupon.save();
        }
      }
    }

    // Shipping fee rule: Free shipping for orders over ৳1,000, otherwise ৳60 (Dhaka) or ৳120 (outside Dhaka)
    let shippingFee = 0;
    if (subtotal < 1000) {
      shippingFee = shippingAddress.division.toLowerCase() === 'dhaka' ? 60 : 120;
    }

    const tax = 0;
    const total = Math.max(0, subtotal - discount + shippingFee + tax);

    // Concurrency-safe atomic stock decrement (both product and variant if applicable)
    for (const item of resolvedItems) {
      if (mongoose.Types.ObjectId.isValid(item.productId)) {
        await ProductModel.updateOne(
          { _id: item.productId, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } }
        );

        if (item.variantId) {
          await ProductModel.updateOne(
            { _id: item.productId, 'variants.id': item.variantId },
            { $inc: { 'variants.$.stock': -item.quantity } }
          );
        } else if (item.sku) {
          await ProductModel.updateOne(
            { _id: item.productId, 'variants.sku': item.sku },
            { $inc: { 'variants.$.stock': -item.quantity } }
          );
        }
      }
    }

    // Unique order number generation: NOV-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `NOV-${dateStr}-${randomSuffix}`;

    const customerId = req.user ? req.user.id : 'guest_' + Date.now();
    const customerName = req.user ? req.user.name : (shippingAddress.recipientName || 'Guest Customer');
    const customerEmail = req.user ? req.user.email : (req.body.customerEmail || req.body.email || 'guest@aurelia.com');

    const newOrder = await OrderModel.create({
      orderNumber,
      customerId,
      customerName,
      customerEmail,
      customerPhone: shippingAddress.phone,
      items: resolvedItems,
      shippingAddress,
      pricing: {
        subtotal,
        discount,
        shippingFee,
        tax,
        total,
        couponCode: validCouponCode || undefined,
      },
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      orderStatus: 'confirmed',
      timeline: [
        {
          status: 'confirmed',
          timestamp: new Date(),
          note: `Order placed via ${paymentMethod.toUpperCase()}`,
          actor: customerName,
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully!',
      order: newOrder,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to place order.' });
  }
});

// GET /api/orders/my-orders (Customer orders)
ordersRouter.get('/my-orders', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orders = await OrderModel.find({ customerId: req.user!.id }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, orders });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/orders/:idOrNumber (Single order details)
ordersRouter.get('/:idOrNumber', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { idOrNumber } = req.params;
    let order = await OrderModel.findOne({ orderNumber: idOrNumber.toUpperCase() }).lean();
    if (!order && idOrNumber.match(/^[0-9a-fA-F]{24}$/)) {
      order = await OrderModel.findById(idOrNumber).lean();
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Authorization: customer can only read their own order; staff can read all
    if (order.customerId !== req.user!.id && req.user!.role === 'customer') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, order });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/orders/:id/cancel (Customer cancels their own pending or confirmed order)
ordersRouter.post('/:id/cancel', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    let order = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      order = await OrderModel.findById(req.params.id);
    } else {
      order = await OrderModel.findOne({ orderNumber: req.params.id });
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.customerId !== req.user!.id && req.user!.role === 'customer') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (order.orderStatus !== 'pending' && order.orderStatus !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled in status "${order.orderStatus}". Please contact support.`,
      });
    }

    order.orderStatus = 'cancelled';
    order.timeline.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: (req.body.reason as string) || 'Order cancelled by customer',
      actor: req.user!.name,
    });

    // Restore stock safely
    for (const item of order.items) {
      if (mongoose.Types.ObjectId.isValid(item.productId)) {
        await ProductModel.updateOne({ _id: item.productId }, { $inc: { stock: item.quantity } });
        if (item.variantId) {
          await ProductModel.updateOne(
            { _id: item.productId, 'variants.id': item.variantId },
            { $inc: { 'variants.$.stock': item.quantity } }
          );
        } else if (item.sku) {
          await ProductModel.updateOne(
            { _id: item.productId, 'variants.sku': item.sku },
            { $inc: { 'variants.$.stock': item.quantity } }
          );
        }
      }
    }

    await order.save();
    res.json({ success: true, message: 'Order successfully cancelled', order });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/orders (Admin list all orders)
ordersRouter.get(
  '/',
  requireRole('super_admin', 'admin', 'order_manager', 'finance'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
      const skip = (page - 1) * limit;

      const query: any = {};
      if (req.query.status && req.query.status !== 'all') {
        query.orderStatus = req.query.status;
      }
      if (req.query.paymentStatus && req.query.paymentStatus !== 'all') {
        query.paymentStatus = req.query.paymentStatus;
      }
      if (req.query.search) {
        const clean = escapeRegex(String(req.query.search).trim());
        const regex = new RegExp(clean, 'i');
        query.$or = [{ orderNumber: regex }, { customerName: regex }, { customerEmail: regex }, { customerPhone: regex }];
      }

      const [orders, total] = await Promise.all([
        OrderModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        OrderModel.countDocuments(query),
      ]);

      res.json({
        success: true,
        orders,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// PATCH /api/orders/:id/status (Admin update status)
ordersRouter.patch(
  '/:id/status',
  requireRole('super_admin', 'admin', 'order_manager'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { status, note, paymentStatus } = req.body;
      let order = null;
      if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        order = await OrderModel.findById(req.params.id);
      } else {
        order = await OrderModel.findOne({ orderNumber: req.params.id });
      }
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

      if (status) {
        order.orderStatus = status as OrderStatus;
        order.timeline.push({
          status: status as OrderStatus,
          timestamp: new Date(),
          note: note || `Status updated to ${status}`,
          actor: req.user!.name,
        });

        // If cancelled, restore stock safely
        if (status === 'cancelled') {
          for (const item of order.items) {
            if (mongoose.Types.ObjectId.isValid(item.productId)) {
              await ProductModel.updateOne({ _id: item.productId }, { $inc: { stock: item.quantity } });
              if (item.variantId) {
                await ProductModel.updateOne(
                  { _id: item.productId, 'variants.id': item.variantId },
                  { $inc: { 'variants.$.stock': item.quantity } }
                );
              } else if (item.sku) {
                await ProductModel.updateOne(
                  { _id: item.productId, 'variants.sku': item.sku },
                  { $inc: { 'variants.$.stock': item.quantity } }
                );
              }
            }
          }
        }
      }

      if (paymentStatus) {
        order.paymentStatus = paymentStatus as PaymentStatus;
      }

      if (note) {
        order.staffNotes = (order.staffNotes ? order.staffNotes + '\n' : '') + `[${new Date().toLocaleDateString()}] ${note}`;
      }

      await order.save();
      res.json({ success: true, message: 'Order status updated', order });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);
