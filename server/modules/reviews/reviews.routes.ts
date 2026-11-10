import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ReviewModel } from '../../database/models/Review';
import { OrderModel } from '../../database/models/Order';
import { ProductModel } from '../../database/models/Product';
import { AuthenticatedRequest, requireAuth, requireRole } from '../../middleware/auth';
import { requireDatabase } from '../../middleware/dbGuard';

export const reviewsRouter = Router();

reviewsRouter.use(requireDatabase);

// GET /api/reviews (Public: approved reviews for a product or all approved)
reviewsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const query: any = { status: 'approved' };
    if (req.query.productId) {
      query.productId = req.query.productId;
    }

    const reviews = await ReviewModel.find(query).sort({ createdAt: -1 }).limit(20).lean();

    // Calculate rating breakdown
    let ratingBreakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let averageRating = 5;
    if (reviews.length > 0) {
      let totalStars = 0;
      reviews.forEach((r) => {
        totalStars += r.rating;
        ratingBreakdown[r.rating] = (ratingBreakdown[r.rating] || 0) + 1;
      });
      averageRating = Number((totalStars / reviews.length).toFixed(1));
    }

    res.json({
      success: true,
      reviews,
      stats: {
        totalReviews: reviews.length,
        averageRating,
        breakdown: ratingBreakdown,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/reviews (Customer submit review - requires auth & verifies purchase)
reviewsRouter.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { productId, rating, comment, photos } = req.body;
    if (!productId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Product, rating, and review comment are required' });
    }

    // Check if customer actually purchased this product in a delivered or confirmed order
    const hasOrdered = await OrderModel.findOne({
      customerId: req.user!.id,
      'items.productId': productId,
      orderStatus: { $in: ['confirmed', 'processing', 'packed', 'shipped', 'delivered'] },
    });

    const isVerifiedPurchase = !!hasOrdered;

    const newReview = await ReviewModel.create({
      productId,
      userId: req.user!.id,
      userName: req.user!.name,
      rating: Number(rating),
      comment,
      photos: Array.isArray(photos) ? photos : [],
      isVerifiedPurchase,
      status: 'approved', // instant approved or pending
    });

    // Update product rating aggregate if product exists in DB
    const allApproved = await ReviewModel.find({ productId, status: 'approved' });
    const avg = allApproved.reduce((acc, r) => acc + r.rating, 0) / (allApproved.length || 1);
    if (mongoose.Types.ObjectId.isValid(productId)) {
      await ProductModel.findByIdAndUpdate(productId, {
        rating: Number(avg.toFixed(1)),
        reviewCount: allApproved.length,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been published.',
      review: newReview,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/reviews/:id/helpful (Increment helpful counter)
reviewsRouter.post('/:id/helpful', async (req: Request, res: Response) => {
  try {
    const review = await ReviewModel.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpfulCount: 1 } },
      { new: true }
    );
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, helpfulCount: review.helpfulCount });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/reviews/admin (Admin list all reviews for moderation)
reviewsRouter.get(
  '/admin',
  requireRole('super_admin', 'admin', 'customer_support'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const reviews = await ReviewModel.find().sort({ createdAt: -1 }).lean();
      res.json({ success: true, reviews });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// PATCH /api/reviews/:id/status (Admin approve/reject)
reviewsRouter.patch(
  '/:id/status',
  requireRole('super_admin', 'admin', 'customer_support'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { status, reason } = req.body;
      const review = await ReviewModel.findByIdAndUpdate(
        req.params.id,
        { status, rejectionReason: reason },
        { new: true }
      );
      if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
      res.json({ success: true, message: `Review ${status}`, review });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);
