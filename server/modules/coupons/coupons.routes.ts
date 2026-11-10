import { Router, Request, Response } from 'express';
import { CouponModel } from '../../database/models/Coupon';
import { AuthenticatedRequest, requireRole } from '../../middleware/auth';
import { requireDatabase } from '../../middleware/dbGuard';

export const couponsRouter = Router();

couponsRouter.use(requireDatabase);

// POST /api/coupons/validate (Public / Customer)
couponsRouter.post('/validate', async (req: Request, res: Response) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const coupon = await CouponModel.findOne({
      code: code.toUpperCase().trim(),
      isActive: true,
      validUntil: { $gte: new Date() },
    });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code.' });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'This coupon has reached its maximum usage limit.' });
    }

    const orderSubtotal = Number(subtotal) || 0;
    if (orderSubtotal < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ৳${coupon.minOrderAmount.toLocaleString()} required for this coupon.`,
      });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round((orderSubtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    res.json({
      success: true,
      message: `Coupon applied! You saved ৳${discount.toLocaleString()}`,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discount,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/coupons (Admin list)
couponsRouter.get(
  '/',
  requireRole('super_admin', 'admin', 'catalog_manager'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const coupons = await CouponModel.find().sort({ createdAt: -1 }).lean();
      res.json({ success: true, coupons });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// POST /api/coupons (Admin create)
couponsRouter.post(
  '/',
  requireRole('super_admin', 'admin', 'catalog_manager'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const coupon = await CouponModel.create(req.body);
      res.status(201).json({ success: true, message: 'Coupon created successfully', coupon });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

// PUT /api/coupons/:id (Admin update)
couponsRouter.put(
  '/:id',
  requireRole('super_admin', 'admin', 'catalog_manager'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const coupon = await CouponModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
      res.json({ success: true, message: 'Coupon updated successfully', coupon });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

// DELETE /api/coupons/:id (Admin delete)
couponsRouter.delete(
  '/:id',
  requireRole('super_admin', 'admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const coupon = await CouponModel.findByIdAndDelete(req.params.id);
      if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
      res.json({ success: true, message: 'Coupon deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);
