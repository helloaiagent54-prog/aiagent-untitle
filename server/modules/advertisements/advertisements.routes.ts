import { Router, Request, Response } from 'express';
import { AdvertisementModel } from '../../database/models/Advertisement';
import { AuditLogModel } from '../../database/models/AuditLog';
import { AuthenticatedRequest, requireRole } from '../../middleware/auth';
import { requireDatabase } from '../../middleware/dbGuard';
import { isDatabaseConnected } from '../../database/connection';

export const advertisementsRouter = Router();

// GET /api/advertisements/public (Public eligible advertisements)
advertisementsRouter.get('/public', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConnected()) {
      return res.json({ success: true, advertisements: [] });
    }

    const now = new Date();
    const query: any = {
      status: 'published',
      $and: [
        { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
        { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
      ],
    };

    if (req.query.placement) {
      query.placements = req.query.placement;
    }

    if (req.query.device && req.query.device !== 'all') {
      query.$or = [{ deviceTargeting: 'all' }, { deviceTargeting: req.query.device }];
    }

    const advertisements = await AdvertisementModel.find(query).sort({ priority: 1, createdAt: -1 }).lean();
    res.json({ success: true, advertisements });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/advertisements/placement/:placement (Public advertisements by placement)
advertisementsRouter.get('/placement/:placement', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConnected()) {
      return res.json({ success: true, advertisements: [] });
    }

    const now = new Date();
    const query: any = {
      status: 'published',
      placements: req.params.placement,
      $and: [
        { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
        { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
      ],
    };

    if (req.query.device && req.query.device !== 'all') {
      query.$or = [{ deviceTargeting: 'all' }, { deviceTargeting: req.query.device }];
    }

    const advertisements = await AdvertisementModel.find(query).sort({ priority: 1, createdAt: -1 }).lean();
    res.json({ success: true, advertisements });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/advertisements/:id/impression (Public track impression)
advertisementsRouter.post('/:id/impression', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConnected()) return res.json({ success: true });
    await AdvertisementModel.findByIdAndUpdate(req.params.id, { $inc: { impressions: 1 } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/advertisements/:id/click (Public track CTA click)
advertisementsRouter.post('/:id/click', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConnected()) return res.json({ success: true });
    await AdvertisementModel.findByIdAndUpdate(req.params.id, { $inc: { clicks: 1 } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/advertisements (Admin list with stats & filtering)
advertisementsRouter.get(
  '/',
  requireDatabase,
  requireRole('super_admin', 'admin', 'catalog_manager'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { search, status, placement, deviceTargeting } = req.query;
      const query: any = {};

      if (status && status !== 'all') query.status = status;
      if (placement && placement !== 'all') query.placements = placement;
      if (deviceTargeting && deviceTargeting !== 'all') query.deviceTargeting = deviceTargeting;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { title: { $regex: search, $options: 'i' } },
        ];
      }

      const advertisements = await AdvertisementModel.find(query).sort({ priority: 1, createdAt: -1 }).lean();

      // Metrics
      const now = new Date();
      const totalCount = await AdvertisementModel.countDocuments();
      const activeCount = await AdvertisementModel.countDocuments({
        status: 'published',
        $and: [
          { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
          { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
        ],
      });
      const expiredCount = await AdvertisementModel.countDocuments({
        status: 'published',
        endDate: { $lt: now },
      });

      // Total impressions & clicks
      const agg = await AdvertisementModel.aggregate([
        { $group: { _id: null, totalImpressions: { $sum: '$impressions' }, totalClicks: { $sum: '$clicks' } } },
      ]);

      res.json({
        success: true,
        advertisements,
        stats: {
          total: totalCount,
          active: activeCount,
          expired: expiredCount,
          totalImpressions: agg[0]?.totalImpressions || 0,
          totalClicks: agg[0]?.totalClicks || 0,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// GET /api/advertisements/:id (Admin get single ad)
advertisementsRouter.get(
  '/:id',
  requireDatabase,
  async (req: Request, res: Response) => {
    try {
      const ad = await AdvertisementModel.findById(req.params.id);
      if (!ad) return res.status(404).json({ success: false, message: 'Advertisement not found' });
      res.json({ success: true, advertisement: ad });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// POST /api/advertisements (Admin create ad)
advertisementsRouter.post(
  '/',
  requireDatabase,
  requireRole('super_admin', 'admin', 'catalog_manager'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, title, mainImage } = req.body;
      if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Ad internal name is required' });
      if (!title || !title.trim()) return res.status(400).json({ success: false, message: 'Ad title is required' });
      if (!mainImage || !mainImage.trim()) return res.status(400).json({ success: false, message: 'Main advertisement image is required' });

      const newAd = new AdvertisementModel({
        ...req.body,
        name: name.trim(),
        title: title.trim(),
        startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      });

      await newAd.save();

      await AuditLogModel.create({
        action: 'CREATE_ADVERTISEMENT',
        module: 'Advertisement Management',
        actorName: req.user!.name,
        actorEmail: req.user!.email,
        actorRole: req.user!.role,
        details: `Created advertisement "${newAd.name}" (Title: ${newAd.title})`,
      });

      res.status(201).json({ success: true, message: 'Advertisement created successfully!', advertisement: newAd });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// PUT /api/advertisements/:id (Admin update ad)
advertisementsRouter.put(
  '/:id',
  requireDatabase,
  requireRole('super_admin', 'admin', 'catalog_manager'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const ad = await AdvertisementModel.findById(req.params.id);
      if (!ad) return res.status(404).json({ success: false, message: 'Advertisement not found' });

      Object.assign(ad, req.body);
      ad.startDate = req.body.startDate ? new Date(req.body.startDate) : undefined;
      ad.endDate = req.body.endDate ? new Date(req.body.endDate) : undefined;

      await ad.save();

      await AuditLogModel.create({
        action: 'UPDATE_ADVERTISEMENT',
        module: 'Advertisement Management',
        actorName: req.user!.name,
        actorEmail: req.user!.email,
        actorRole: req.user!.role,
        details: `Updated advertisement "${ad.name}"`,
      });

      res.json({ success: true, message: 'Advertisement updated successfully!', advertisement: ad });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// PATCH /api/advertisements/:id/status (Admin toggle status)
advertisementsRouter.patch(
  '/:id/status',
  requireDatabase,
  requireRole('super_admin', 'admin', 'catalog_manager'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { status } = req.body;
      if (!['draft', 'published', 'archived'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }

      const ad = await AdvertisementModel.findByIdAndUpdate(req.params.id, { status }, { new: true });
      if (!ad) return res.status(404).json({ success: false, message: 'Advertisement not found' });

      res.json({ success: true, message: `Advertisement status changed to ${status}`, advertisement: ad });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// POST /api/advertisements/:id/duplicate (Admin duplicate ad)
advertisementsRouter.post(
  '/:id/duplicate',
  requireDatabase,
  requireRole('super_admin', 'admin', 'catalog_manager'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const ad = await AdvertisementModel.findById(req.params.id).lean();
      if (!ad) return res.status(404).json({ success: false, message: 'Source ad not found' });

      delete (ad as any)._id;
      delete (ad as any).createdAt;
      delete (ad as any).updatedAt;
      ad.impressions = 0;
      ad.clicks = 0;

      const duplicatedAd = new AdvertisementModel({
        ...ad,
        name: `${ad.name} (Copy)`,
        title: `${ad.title} (Copy)`,
        status: 'draft',
      });

      await duplicatedAd.save();

      res.status(201).json({ success: true, message: 'Advertisement duplicated as draft!', advertisement: duplicatedAd });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// DELETE /api/advertisements/:id (Admin delete ad)
advertisementsRouter.delete(
  '/:id',
  requireDatabase,
  requireRole('super_admin', 'admin', 'catalog_manager'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const ad = await AdvertisementModel.findByIdAndDelete(req.params.id);
      if (!ad) return res.status(404).json({ success: false, message: 'Advertisement not found' });

      await AuditLogModel.create({
        action: 'DELETE_ADVERTISEMENT',
        module: 'Advertisement Management',
        actorName: req.user!.name,
        actorEmail: req.user!.email,
        actorRole: req.user!.role,
        details: `Deleted advertisement "${ad.name}"`,
      });

      res.json({ success: true, message: 'Advertisement deleted successfully!' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);
