import path from 'path';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { authenticate } from './middleware/auth';
import { authRouter } from './modules/auth/auth.routes';
import { productsRouter } from './modules/products/products.routes';
import { categoriesRouter } from './modules/categories/categories.routes';
import { ordersRouter } from './modules/orders/orders.routes';
import { couponsRouter } from './modules/coupons/coupons.routes';
import { reviewsRouter } from './modules/reviews/reviews.routes';
import { cmsRouter } from './modules/cms/cms.routes';
import { supportRouter } from './modules/support/support.routes';
import { uploadRouter } from './modules/upload/upload.routes';
import { healthRouter } from './modules/health/health.routes';
import { adminRouter } from './modules/admin/admin.routes';
import { wishlistRouter } from './modules/wishlist/wishlist.routes';
import { cartRouter } from './modules/cart/cart.routes';
import { attributesRouter } from './modules/attributes/attributes.routes';
import { bannersRouter } from './modules/banners/banners.routes';
import { advertisementsRouter } from './modules/advertisements/advertisements.routes';
import { heroSlidesRouter } from './modules/hero-slides/hero-slides.routes';

export function createExpressApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Static uploads directory for permanent image storage
  const uploadsPath = path.join(process.cwd(), 'public', 'uploads');
  app.use('/uploads', express.static(uploadsPath));

  app.use(authenticate);

  // Mount API routers
  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/products', productsRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/attributes', attributesRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/coupons', couponsRouter);
  app.use('/api/reviews', reviewsRouter);
  app.use('/api/cms', cmsRouter);
  app.use('/api/banners', bannersRouter);
  app.use('/api/advertisements', advertisementsRouter);
  app.use('/api/hero-slides', heroSlidesRouter);
  app.use('/api/support', supportRouter);
  app.use('/api/upload', uploadRouter);
  app.use('/api/wishlist', wishlistRouter);
  app.use('/api/cart', cartRouter);


  // Unhandled API route 404
  app.all('/api/*', (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      code: 'API_ENDPOINT_NOT_FOUND',
      message: `The requested endpoint ${req.method} ${req.path} does not exist.`,
    });
  });

  // Centralized JSON error handling middleware
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled Server Error:', err);
    if (res.headersSent) {
      return next(err);
    }
    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: err.message || 'Internal server error occurred.',
      ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {}),
    });
  });

  return app;
}
