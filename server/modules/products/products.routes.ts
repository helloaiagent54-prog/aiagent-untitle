import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { ProductModel } from '../../database/models/Product';
import { AuthenticatedRequest, requireRole } from '../../middleware/auth';
import { requireDatabase } from '../../middleware/dbGuard';
import { escapeRegex } from '../../utils/regex';

export const productsRouter = Router();

// Apply requireDatabase to all product routes
productsRouter.use(requireDatabase);

const productVariantSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  sku: z.string().min(1),
  price: z.number().nonnegative().optional(),
  originalPrice: z.number().nonnegative().optional(),
  stock: z.number().int().nonnegative().default(0),
  options: z.record(z.string(), z.string()).optional(),
  attributes: z.record(z.string(), z.string()).optional(),
  image: z.string().optional(),
  barcode: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

const highlightSchema = z.object({
  label: z.string(),
  value: z.string(),
  icon: z.string().optional(),
});

const specificationSchema = z.object({
  label: z.string(),
  value: z.string(),
  group: z.string().optional(),
});

const faqSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

const productInputSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  subtitle: z.string().optional(),
  slug: z.string().min(2, 'Valid slug is required'),
  sku: z.string().min(2, 'SKU is required'),
  description: z.string().min(5, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  brand: z.string().min(1, 'Brand is required'),
  basePrice: z.number().positive('Base price must be greater than 0'),
  salePrice: z.number().positive('Sale price must be greater than 0'),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  variants: z.array(productVariantSchema).optional(),
  highlights: z.array(highlightSchema).optional(),
  specificationsTable: z.array(specificationSchema).optional(),
  faqs: z.array(faqSchema).optional(),
  specifications: z.record(z.string(), z.string()).optional(),
  attributes: z.record(z.string(), z.string()).optional(),
  badge: z.string().optional(),
  warranty: z.string().optional(),
  deliveryEstimate: z.string().optional(),
  tags: z.array(z.string()).optional(),
  banglaKeywords: z.array(z.string()).optional(),
  isTopSelling: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
  isBestRated: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  status: z.enum(['active', 'draft', 'archived']).optional(),
});

// GET /api/products/suggestions?q=... (Autocomplete, limit max 8)
productsRouter.get('/suggestions', async (req: Request, res: Response) => {
  try {
    const q = ((req.query.q as string) || '').trim();
    if (!q || q.length < 2) {
      return res.json({ success: true, suggestions: [] });
    }

    const safeRegex = new RegExp(escapeRegex(q), 'i');
    const products = await ProductModel.find({
      status: 'active',
      $or: [
        { name: safeRegex },
        { brand: safeRegex },
        { category: safeRegex },
        { sku: safeRegex },
        { banglaKeywords: { $in: [safeRegex] } },
      ],
    })
      .select('name slug salePrice basePrice images category brand')
      .limit(8)
      .lean();

    const formatted = products.map((p) => ({
      name: p.name,
      slug: p.slug,
      price: p.salePrice,
      originalPrice: p.basePrice > p.salePrice ? p.basePrice : undefined,
      image: p.images?.[0] || '',
      category: p.category,
      brand: p.brand,
    }));

    res.json({ success: true, suggestions: formatted });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products/trending
productsRouter.get('/trending', async (req: Request, res: Response) => {
  try {
    const topSelling = await ProductModel.find({ status: 'active', isTopSelling: true }).limit(8).lean();
    const newArrivals = await ProductModel.find({ status: 'active', isNewArrival: true }).limit(8).lean();
    const bestRated = await ProductModel.find({ status: 'active', isBestRated: true }).limit(8).lean();

    res.json({
      success: true,
      data: {
        topSelling,
        newArrivals,
        bestRated,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products (filter, search, sort, pagination)
productsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 12));
    const skip = (page - 1) * limit;

    const query: any = { status: 'active' };

    // Category filter
    if (req.query.category && req.query.category !== 'all') {
      query.category = new RegExp(`^${escapeRegex(String(req.query.category))}$`, 'i');
    }

    // Brand filter
    if (req.query.brand) {
      query.brand = new RegExp(`^${escapeRegex(String(req.query.brand))}$`, 'i');
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.salePrice = {};
      if (req.query.minPrice) query.salePrice.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.salePrice.$lte = Number(req.query.maxPrice);
    }

    // Rating filter
    if (req.query.minRating) {
      query.rating = { $gte: Number(req.query.minRating) };
    }

    // Search query with cross-lingual Bangla/English support
    const search = ((req.query.q as string) || '').trim();
    if (search) {
      const safeRegex = new RegExp(escapeRegex(search), 'i');
      query.$or = [
        { name: safeRegex },
        { brand: safeRegex },
        { category: safeRegex },
        { description: safeRegex },
        { sku: safeRegex },
        { banglaKeywords: { $in: [safeRegex] } },
      ];
    }

    // Sorting
    let sortOptions: any = { createdAt: -1 };
    switch (req.query.sort) {
      case 'price_asc':
        sortOptions = { salePrice: 1 };
        break;
      case 'price_desc':
        sortOptions = { salePrice: -1 };
        break;
      case 'rating':
        sortOptions = { rating: -1, reviewCount: -1 };
        break;
      case 'popular':
        sortOptions = { reviewCount: -1, rating: -1 };
        break;
      case 'newest':
      default:
        sortOptions = { createdAt: -1 };
        break;
    }

    const [products, total] = await Promise.all([
      ProductModel.find(query).sort(sortOptions).skip(skip).limit(limit).lean(),
      ProductModel.countDocuments(query),
    ]);

    // Available brands list for filters
    const availableBrands = await ProductModel.distinct('brand', { status: 'active' });

    res.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      availableBrands,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products/:slugOrId
productsRouter.get('/:slugOrId', async (req: Request, res: Response) => {
  try {
    const { slugOrId } = req.params;
    const targetSlug = slugOrId.toLowerCase();
    let product = await ProductModel.findOne({ slug: targetSlug }).lean();
    if (!product && (targetSlug === 'samsung-galaxy-s25' || targetSlug === 'samsung-galaxy-s25-ultra')) {
      product = await ProductModel.findOne({
        slug: { $in: ['samsung-galaxy-s25-ultra', 'samsung-galaxy-s25'] },
      }).lean();
    }
    if (!product && slugOrId.match(/^[0-9a-fA-F]{24}$/)) {
      product = await ProductModel.findById(slugOrId).lean();
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Also fetch related products in the same category, or fallback to trending active products
    let related = await ProductModel.find({
      category: product.category,
      _id: { $ne: product._id },
      status: 'active',
    })
      .limit(4)
      .lean();

    if (related.length < 4) {
      const additional = await ProductModel.find({
        _id: { $nin: [product._id, ...related.map((r) => r._id)] },
        status: 'active',
      })
        .limit(4 - related.length)
        .lean();
      related = [...related, ...additional];
    }

    res.json({ success: true, product, related });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/products (Admin create)
productsRouter.post(
  '/',
  requireRole('super_admin', 'admin', 'catalog_manager'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const parsed = productInputSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, errors: parsed.error.format() });
      }

      const product = await ProductModel.create(parsed.data);
      res.status(201).json({ success: true, message: 'Product created successfully', product });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

// PUT /api/products/:id (Admin update)
productsRouter.put(
  '/:id',
  requireRole('super_admin', 'admin', 'catalog_manager', 'inventory_manager'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const parsed = productInputSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, errors: parsed.error.format() });
      }

      const query = mongoose.Types.ObjectId.isValid(req.params.id)
        ? { _id: req.params.id }
        : { slug: req.params.id.toLowerCase() };

      const product = await ProductModel.findOneAndUpdate(query, parsed.data, { new: true });
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      res.json({ success: true, message: 'Product updated successfully', product });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

// POST /api/products/:id/duplicate (Admin duplicate product)
productsRouter.post(
  '/:id/duplicate',
  requireRole('super_admin', 'admin', 'catalog_manager'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const query = mongoose.Types.ObjectId.isValid(req.params.id)
        ? { _id: req.params.id }
        : { slug: req.params.id.toLowerCase() };

      const original = await ProductModel.findOne(query).lean();
      if (!original) return res.status(404).json({ success: false, message: 'Original product not found' });

      const rand = Math.floor(100 + Math.random() * 900);
      const duplicateData: any = {
        ...original,
        _id: new mongoose.Types.ObjectId(),
        name: `${original.name} (Copy)`,
        slug: `${original.slug}-copy-${rand}`,
        sku: `${original.sku}-CPY${rand}`,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      delete duplicateData.__v;

      const duplicateProduct = await ProductModel.create(duplicateData);
      res.status(201).json({ success: true, message: 'Product duplicated successfully', product: duplicateProduct });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// DELETE /api/products/:id (Admin delete/archive)
productsRouter.delete(
  '/:id',
  requireRole('super_admin', 'admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const query = mongoose.Types.ObjectId.isValid(req.params.id)
        ? { _id: req.params.id }
        : { slug: req.params.id.toLowerCase() };

      const product = await ProductModel.findOneAndDelete(query);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      res.json({ success: true, message: 'Product deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);
