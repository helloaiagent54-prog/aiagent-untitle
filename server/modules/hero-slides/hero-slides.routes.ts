import { Router, Request, Response } from 'express';
import { HeroSlideModel } from '../../database/models/HeroSlide';
import { AuditLogModel } from '../../database/models/AuditLog';
import { AuthenticatedRequest, requireRole } from '../../middleware/auth';
import { requireDatabase } from '../../middleware/dbGuard';
import { isDatabaseConnected } from '../../database/connection';

export const heroSlidesRouter = Router();

// GET /api/hero-slides/public (Public active image-only slides)
heroSlidesRouter.get('/public', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConnected()) {
      return res.json({ success: true, slides: [] });
    }

    const now = new Date();
    const slides = await HeroSlideModel.find({
      isActive: true,
      $and: [
        { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
        { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
      ],
    })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    res.json({ success: true, slides });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/hero-slides (Admin list)
heroSlidesRouter.get(
  '/',
  requireDatabase,
  requireRole('super_admin', 'admin', 'catalog_manager'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const slides = await HeroSlideModel.find().sort({ order: 1, createdAt: 1 }).lean();
      res.json({ success: true, slides, total: slides.length });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// GET /api/hero-slides/:id (Admin get single slide)
heroSlidesRouter.get(
  '/:id',
  requireDatabase,
  async (req: Request, res: Response) => {
    try {
      const slide = await HeroSlideModel.findById(req.params.id);
      if (!slide) return res.status(404).json({ success: false, message: 'Slide not found' });
      res.json({ success: true, slide });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// POST /api/hero-slides (Admin create slide)
heroSlidesRouter.post(
  '/',
  requireDatabase,
  requireRole('super_admin', 'admin', 'catalog_manager'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { title, desktopImage, destinationUrl } = req.body;
      if (!title || !title.trim()) {
        return res.status(400).json({ success: false, message: 'Slide title is required for reference.' });
      }
      if (!desktopImage || !desktopImage.trim()) {
        return res.status(400).json({ success: false, message: 'Desktop slide image is required.' });
      }

      // Safe URL check if destinationUrl provided
      if (destinationUrl && destinationUrl.trim().toLowerCase().startsWith('javascript:')) {
        return res.status(400).json({ success: false, message: 'Unsafe destination URL provided.' });
      }

      const count = await HeroSlideModel.countDocuments();
      const newSlide = new HeroSlideModel({
        title: title.trim(),
        desktopImage: desktopImage.trim(),
        mobileImage: req.body.mobileImage ? req.body.mobileImage.trim() : '',
        destinationUrl: destinationUrl ? destinationUrl.trim() : '',
        target: req.body.target === '_blank' ? '_blank' : '_self',
        order: Number(req.body.order) || count + 1,
        isActive: req.body.isActive !== false,
        startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      });

      await newSlide.save();

      await AuditLogModel.create({
        action: 'CREATE_HERO_IMAGE_SLIDE',
        module: 'Hero Image Slider',
        actorName: req.user!.name,
        actorEmail: req.user!.email,
        actorRole: req.user!.role,
        details: `Created hero image slide "${newSlide.title}"`,
      });

      res.status(201).json({ success: true, message: 'Slide created successfully!', slide: newSlide });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// PUT /api/hero-slides/:id (Admin update slide)
heroSlidesRouter.put(
  '/:id',
  requireDatabase,
  requireRole('super_admin', 'admin', 'catalog_manager'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const slide = await HeroSlideModel.findById(req.params.id);
      if (!slide) return res.status(404).json({ success: false, message: 'Slide not found' });

      if (req.body.title) slide.title = req.body.title.trim();
      if (req.body.desktopImage) slide.desktopImage = req.body.desktopImage.trim();
      if (typeof req.body.mobileImage === 'string') slide.mobileImage = req.body.mobileImage.trim();
      if (typeof req.body.destinationUrl === 'string') {
        if (req.body.destinationUrl.trim().toLowerCase().startsWith('javascript:')) {
          return res.status(400).json({ success: false, message: 'Unsafe destination URL provided.' });
        }
        slide.destinationUrl = req.body.destinationUrl.trim();
      }
      if (req.body.target) slide.target = req.body.target;
      if (typeof req.body.order === 'number') slide.order = req.body.order;
      if (typeof req.body.isActive === 'boolean') slide.isActive = req.body.isActive;
      slide.startDate = req.body.startDate ? new Date(req.body.startDate) : undefined;
      slide.endDate = req.body.endDate ? new Date(req.body.endDate) : undefined;

      await slide.save();

      await AuditLogModel.create({
        action: 'UPDATE_HERO_IMAGE_SLIDE',
        module: 'Hero Image Slider',
        actorName: req.user!.name,
        actorEmail: req.user!.email,
        actorRole: req.user!.role,
        details: `Updated hero slide "${slide.title}"`,
      });

      res.json({ success: true, message: 'Slide updated successfully!', slide });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// PATCH /api/hero-slides/reorder (Bulk reorder)
heroSlidesRouter.patch(
  '/reorder',
  requireDatabase,
  requireRole('super_admin', 'admin', 'catalog_manager'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { items } = req.body; // array of { id: string, order: number }
      if (!Array.isArray(items)) {
        return res.status(400).json({ success: false, message: 'Expected array of items for reorder' });
      }

      await Promise.all(
        items.map((item) =>
          HeroSlideModel.findByIdAndUpdate(item.id, { order: item.order })
        )
      );

      res.json({ success: true, message: 'Slide order updated successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// PATCH /api/hero-slides/:id/status (Toggle active)
heroSlidesRouter.patch(
  '/:id/status',
  requireDatabase,
  requireRole('super_admin', 'admin', 'catalog_manager'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const slide = await HeroSlideModel.findById(req.params.id);
      if (!slide) return res.status(404).json({ success: false, message: 'Slide not found' });

      slide.isActive = req.body.isActive !== undefined ? !!req.body.isActive : !slide.isActive;
      await slide.save();

      res.json({
        success: true,
        message: `Slide is now ${slide.isActive ? 'active' : 'inactive'}`,
        slide,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// DELETE /api/hero-slides/:id (Delete slide)
heroSlidesRouter.delete(
  '/:id',
  requireDatabase,
  requireRole('super_admin', 'admin', 'catalog_manager'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const slide = await HeroSlideModel.findByIdAndDelete(req.params.id);
      if (!slide) return res.status(404).json({ success: false, message: 'Slide not found' });

      await AuditLogModel.create({
        action: 'DELETE_HERO_IMAGE_SLIDE',
        module: 'Hero Image Slider',
        actorName: req.user!.name,
        actorEmail: req.user!.email,
        actorRole: req.user!.role,
        details: `Deleted hero slide "${slide.title}"`,
      });

      res.json({ success: true, message: 'Slide deleted successfully!' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);
