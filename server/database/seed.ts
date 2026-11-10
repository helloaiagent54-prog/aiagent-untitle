import { CategoryModel } from './models/Category';
import { ProductModel } from './models/Product';
import { UserModel } from './models/User';
import { ReviewModel } from './models/Review';
import { CouponModel } from './models/Coupon';
import { CMSConfigModel } from './models/CMS';
import { AttributeModel } from './models/Attribute';
import { BannerModel } from './models/Banner';
import { AdvertisementModel } from './models/Advertisement';
import { HeroSlideModel } from './models/HeroSlide';
import { initialCategories, initialProducts, initialReviews, initialCoupons, initialAttributes } from '../seeds/defaultData';
import { config } from '../config/env';

export async function seedDatabaseIfEmpty() {
  try {
    const categoryCount = await CategoryModel.countDocuments();
    if (categoryCount === 0) {
      console.log('🌱 Seeding initial categories into MongoDB Atlas...');
      await CategoryModel.insertMany(initialCategories);
    }

    // Seed attributes
    const attributeCount = await AttributeModel.countDocuments();
    if (attributeCount === 0) {
      console.log('🌱 Seeding universal product attributes...');
      await AttributeModel.insertMany(initialAttributes);
    }

    const productCount = await ProductModel.countDocuments();
    if (productCount === 0) {
      console.log('🌱 Seeding initial products into MongoDB Atlas...');
      await ProductModel.insertMany(initialProducts);
    } else {
      // Ensure Samsung Galaxy S25 Ultra 5G and new multi-category products exist with full variants
      for (const prod of initialProducts) {
        const existing = await ProductModel.findOne({ slug: prod.slug });
        if (!existing) {
          await ProductModel.create(prod);
        } else if (prod.slug === 'samsung-galaxy-s25-ultra' || prod.slug === 'samsung-galaxy-s25') {
          // Keep flagship product up to date with full highlights and variant matrix
          await ProductModel.updateOne({ _id: existing._id }, { $set: prod });
        }
      }
    }

    const targetAdminEmail = config.adminEmail?.trim().toLowerCase() || 'admin@novaracommerce.com';
    const targetAdminPassword = config.adminPassword?.trim() || 'admin123456';

    const adminUser = await UserModel.findOne({ email: targetAdminEmail });
    if (!adminUser) {
      console.log(`🌱 Bootstrapping configured Super Admin user (${targetAdminEmail})...`);
      await UserModel.create({
        name: 'Aurelia Super Admin',
        email: targetAdminEmail,
        password: targetAdminPassword,
        role: 'super_admin',
        phone: '+880 1712 345678',
        addresses: [
          {
            isDefault: true,
            label: 'Headquarters',
            recipientName: 'Aurelia Operations',
            phone: '+880 1712 345678',
            division: 'Dhaka',
            district: 'Dhaka',
            upazila: 'Gulshan',
            unionOrWard: 'Ward 19',
            streetAddress: 'House 42, Road 11, Block D, Banani',
          },
        ],
      });
    } else if (config.adminPassword && config.adminPassword.trim().length >= 6) {
      // If environment password was provided, keep database password synced
      adminUser.password = targetAdminPassword;
      adminUser.role = 'super_admin';
      await adminUser.save();
    }

    // Ensure test admin siam@gmail.com exists for regression test suites
    const siamAdmin = await UserModel.findOne({ email: 'siam@gmail.com' });
    if (!siamAdmin) {
      await UserModel.create({
        name: 'Siam Admin',
        email: 'siam@gmail.com',
        password: 'siam12345!',
        role: 'super_admin',
        phone: '+880 1712 112233',
      });
    }

    // Also create a demo customer for instant testing
    const demoCustomer = await UserModel.findOne({ email: 'customer@novara.com' });
    if (!demoCustomer) {
      console.log('🌱 Bootstrapping demo verified customer (customer@novara.com)...');
      await UserModel.create({
        name: 'Rafik Hasan',
        email: 'customer@novara.com',
        password: 'customer123',
        role: 'customer',
        phone: '+880 1819 000111',
        addresses: [
          {
            isDefault: true,
            label: 'Home',
            recipientName: 'Rafik Hasan',
            phone: '+880 1819 000111',
            division: 'Dhaka',
            district: 'Dhaka',
            upazila: 'Dhanmondi',
            unionOrWard: 'Ward 15',
            streetAddress: 'House 14, Road 27, Dhanmondi',
          },
        ],
      });
    }

    const reviewCount = await ReviewModel.countDocuments();
    const firstCustomer = await UserModel.findOne({ email: 'customer@novara.com' });
    if (reviewCount === 0) {
      console.log('🌱 Seeding verified customer reviews...');
      const reviewsWithUserId = initialReviews.map((r) => ({
        ...r,
        userId: firstCustomer ? firstCustomer._id.toString() : 'guest-seed',
      }));
      await ReviewModel.insertMany(reviewsWithUserId);
    } else {
      // Ensure flagship reviews exist
      const flagshipReview = await ReviewModel.findOne({ productId: 'samsung-galaxy-s25-ultra' });
      if (!flagshipReview) {
        const flagshipReviews = initialReviews
          .filter((r) => r.productId === 'samsung-galaxy-s25-ultra' || r.productId === 'samsung-galaxy-s25')
          .map((r) => ({
            ...r,
            userId: firstCustomer ? firstCustomer._id.toString() : 'guest-seed',
          }));
        if (flagshipReviews.length > 0) {
          await ReviewModel.insertMany(flagshipReviews);
        }
      }
    }

    const couponCount = await CouponModel.countDocuments();
    if (couponCount === 0) {
      console.log('🌱 Seeding promotional coupons...');
      await CouponModel.insertMany(initialCoupons);
    }

    const cmsConfig = await CMSConfigModel.findOne();
    if (!cmsConfig) {
      console.log('🌱 Creating default CMS and promotional configuration...');
      await CMSConfigModel.create({
        heroTitle: 'Upgrade Your Life with',
        heroHighlight: 'Aurelia',
        heroSubtitle: 'Premium Quality. Unbeatable Prices. Fast delivery across Bangladesh.',
        heroBadge: 'Limited Time Offer ⚡',
        heroCtaText: 'Shop Now',
        heroCtaLink: '/shop',
        announcementText: 'Free Shipping on Orders Over ৳1,000 · 30 Days Easy Return · Secure Payment',
        announcementPhone: '+880 1234 567890',
        announcementEmail: 'support@aurelia.com',
        heroSlides: [
          {
            id: 'slide-1',
            badge: 'Limited Time Offer ⚡',
            title: 'Upgrade Your Life with',
            highlight: 'Aurelia',
            subtitle: 'Premium Quality. Unbeatable Prices. Fast delivery across Bangladesh.',
            discountBadge: 'Up to 50% OFF',
            ctaText: 'Shop Now',
            ctaLink: '/shop',
            desktopImage: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=600&q=80',
            order: 1,
            isEnabled: true,
          },
          {
            id: 'slide-2',
            badge: 'New Flagship Launch 🔥',
            title: 'Next-Gen Tech & Audio with',
            highlight: 'Aurelia Studio',
            subtitle: 'Immersive sound, ultra-fast performance, and genuine brand warranties.',
            discountBadge: 'Up to 40% OFF',
            ctaText: 'Explore Tech',
            ctaLink: '/shop?category=electronics',
            desktopImage: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80',
            order: 2,
            isEnabled: true,
          },
        ],
        banners: [
          {
            id: 'banner-summer-sale',
            title: 'Big Summer Sale',
            subtitle: 'Up to 70% OFF',
            tagline: "Don't Miss Out On Hot Electronics & Lifestyle!",
            ctaText: 'Shop the Sale',
            ctaLink: '/shop?sort=discount',
            imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80',
            position: 'split_left',
            order: 1,
            isEnabled: true,
          },
          {
            id: 'banner-next-gen-tech',
            title: 'Next-Gen Tech',
            subtitle: 'Smarter. Faster. Better.',
            tagline: 'Exclusive discounts on ultrabooks & iPads',
            ctaText: 'Explore Tech',
            ctaLink: '/shop?category=electronics',
            imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=400&q=80',
            position: 'split_right',
            order: 2,
            isEnabled: true,
          },
          {
            id: 'banner-live-smarter',
            title: 'Live Smarter with Aurelia',
            subtitle: 'Discover the latest trends, unbeatable deals, and a better shopping experience curated for Bangladesh.',
            ctaText: 'Shop Now',
            ctaLink: '/shop',
            imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80',
            position: 'mid_banner',
            order: 3,
            isEnabled: true,
          },
        ],
        settings: {
          storeName: 'Aurelia',
          tagline: 'Shop Smart, Live Better',
          supportPhone: '+880 1234 567890',
          supportEmail: 'support@aurelia.com',
          currencySymbol: '৳',
          currencyCode: 'BDT',
          freeShippingThreshold: 1000,
          shippingDhaka: 60,
          shippingOutsideDhaka: 120,
          taxRate: 0,
          paymentMethods: {
            cod: true,
            bkash: true,
            nagad: true,
            card: true,
          },
        },
        sections: [
          { id: 'hero', title: 'Hero Carousel', isEnabled: true, order: 1 },
          { id: 'trust', title: 'Trust Badges', isEnabled: true, order: 2 },
          { id: 'categories', title: 'Shop by Category', isEnabled: true, order: 3 },
          { id: 'promo_banners', title: 'Split Promotional Banners', isEnabled: true, order: 4 },
          { id: 'trending', title: 'Trending Products', isEnabled: true, order: 5 },
          { id: 'feature_banner', title: 'Brand Feature Showcase', isEnabled: true, order: 6 },
          { id: 'reviews', title: 'Customer Testimonials', isEnabled: true, order: 7 },
          { id: 'newsletter', title: 'Newsletter Subscription', isEnabled: true, order: 8 },
        ],
        promotionalPlacement: {
          isEnabled: false,
          title: 'Special Flash Deals',
          subtitle: 'Limited-time offer on audio gear',
          imageUrl: '',
          destinationUrl: '/shop',
          ctaText: 'Claim Deal',
        },
      });
    }

    // Seed Image-Only Hero Slides
    const heroSlideCount = await HeroSlideModel.countDocuments();
    if (heroSlideCount === 0) {
      console.log('🌱 Seeding Image-Only Hero Slides (Strictly Image Assets, Zero Text Overlays)...');
      await HeroSlideModel.insertMany([
        {
          title: 'Galaxy S25 Ultra AI Flagship Launch',
          desktopImage: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1600&q=85',
          mobileImage: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=85',
          destinationUrl: '/product/samsung-galaxy-s25-ultra',
          target: '_self',
          order: 1,
          isActive: true,
        },
        {
          title: 'Next-Gen Ultra Gaming Laptops Showcase',
          desktopImage: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1600&q=85',
          mobileImage: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=85',
          destinationUrl: '/shop?category=electronics',
          target: '_self',
          order: 2,
          isActive: true,
        },
        {
          title: 'Studio Hi-Fi Audiophile Gear',
          desktopImage: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1600&q=85',
          mobileImage: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=85',
          destinationUrl: '/shop',
          target: '_self',
          order: 3,
          isActive: true,
        },
      ]);
    }

    // Seed Dynamic Banners
    const bannerCount = await BannerModel.countDocuments();
    if (bannerCount === 0) {
      console.log('🌱 Seeding enterprise Dynamic Banners with full layer configurations...');
      await BannerModel.insertMany([
        {
          name: 'Big Summer Sale Banner',
          slug: 'big-summer-sale',
          status: 'published',
          placements: ['split_left'],
          priority: 1,
          background: {
            type: 'combined',
            color: '#1e40af',
            opacity: 100,
            imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
            imagePosition: 'center',
            imageSize: 'cover',
            overlayColor: '#001736',
            overlayOpacity: 45,
            gradient: {
              type: 'linear',
              angle: 90,
              direction: 'to right',
              stops: [
                { color: '#001736', stop: 0 },
                { color: '#0284c7', stop: 100 },
              ],
              opacity: 90,
            },
          },
          layout: {
            width: '100%',
            height: 'auto',
            minHeight: '290px',
            padding: { top: 32, right: 32, bottom: 32, left: 32 },
            borderRadius: 24,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.15)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            contentAlign: 'left',
            verticalAlign: 'center',
            containerWidth: '65%',
          },
          layers: [
            {
              id: 'layer-badge-1',
              type: 'badge',
              text: 'BIG SUMMER SALE',
              fontFamily: 'Plus Jakarta Sans',
              fontSize: 11,
              fontWeight: '800',
              textColor: '#93c5fd',
              textAlign: 'left',
              opacity: 100,
              zIndex: 2,
              isVisible: true,
              position: { x: 0, y: 0, mode: 'flow' },
            },
            {
              id: 'layer-heading-1',
              type: 'heading',
              text: 'Up to 70% OFF',
              fontFamily: 'Plus Jakarta Sans',
              fontSize: 32,
              fontWeight: '900',
              textColor: '#ffffff',
              textAlign: 'left',
              opacity: 100,
              zIndex: 2,
              isVisible: true,
              position: { x: 0, y: 0, mode: 'flow' },
            },
            {
              id: 'layer-desc-1',
              type: 'description',
              text: "Don't Miss Out On Hot Electronics & Lifestyle! Exclusive discounts all week.",
              fontFamily: 'Plus Jakarta Sans',
              fontSize: 13,
              fontWeight: '400',
              textColor: '#e0f2fe',
              textAlign: 'left',
              opacity: 95,
              zIndex: 2,
              isVisible: true,
              position: { x: 0, y: 0, mode: 'flow' },
            },
          ],
          buttons: [
            {
              id: 'btn-1',
              label: 'Shop the Sale',
              url: '/shop?sort=discount',
              target: '_self',
              variant: 'primary',
              bgColor: '#ffffff',
              textColor: '#0369a1',
              borderRadius: 9999,
              paddingX: 20,
              paddingY: 10,
              fontSize: 12,
              fontWeight: '800',
              hoverAnimation: 'scale',
              icon: 'ArrowRight',
              iconPosition: 'right',
              isVisible: true,
            },
          ],
        },
        {
          name: 'Next-Gen Tech Banner',
          slug: 'next-gen-tech',
          status: 'published',
          placements: ['split_right'],
          priority: 2,
          background: {
            type: 'combined',
            color: '#001736',
            opacity: 100,
            imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
            imagePosition: 'center',
            imageSize: 'cover',
            overlayColor: '#001736',
            overlayOpacity: 70,
            gradient: {
              type: 'linear',
              angle: 90,
              direction: 'to right',
              stops: [
                { color: '#001736', stop: 0 },
                { color: '#002f6c', stop: 100 },
              ],
              opacity: 95,
            },
          },
          layout: {
            width: '100%',
            height: 'auto',
            minHeight: '290px',
            padding: { top: 32, right: 32, bottom: 32, left: 32 },
            borderRadius: 24,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.15)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            contentAlign: 'left',
            verticalAlign: 'center',
            containerWidth: '65%',
          },
          layers: [
            {
              id: 'layer-badge-2',
              type: 'badge',
              text: 'NEXT-GEN TECH',
              fontFamily: 'Plus Jakarta Sans',
              fontSize: 11,
              fontWeight: '800',
              textColor: '#67e8f9',
              textAlign: 'left',
              opacity: 100,
              zIndex: 2,
              isVisible: true,
              position: { x: 0, y: 0, mode: 'flow' },
            },
            {
              id: 'layer-heading-2',
              type: 'heading',
              text: 'Smarter. Faster. Better.',
              fontFamily: 'Plus Jakarta Sans',
              fontSize: 32,
              fontWeight: '900',
              textColor: '#ffffff',
              textAlign: 'left',
              opacity: 100,
              zIndex: 2,
              isVisible: true,
              position: { x: 0, y: 0, mode: 'flow' },
            },
            {
              id: 'layer-desc-2',
              type: 'description',
              text: 'Exclusive discounts on ultrabooks, tablets, and AI productivity devices.',
              fontFamily: 'Plus Jakarta Sans',
              fontSize: 13,
              fontWeight: '400',
              textColor: '#bfdbfe',
              textAlign: 'left',
              opacity: 95,
              zIndex: 2,
              isVisible: true,
              position: { x: 0, y: 0, mode: 'flow' },
            },
          ],
          buttons: [
            {
              id: 'btn-2',
              label: 'Explore Tech',
              url: '/shop?category=electronics',
              target: '_self',
              variant: 'primary',
              bgColor: '#2563eb',
              textColor: '#ffffff',
              borderRadius: 9999,
              paddingX: 20,
              paddingY: 10,
              fontSize: 12,
              fontWeight: '800',
              hoverAnimation: 'scale',
              icon: 'ArrowRight',
              iconPosition: 'right',
              isVisible: true,
            },
          ],
        },
        {
          name: 'Live Smarter Mid-Page Showcase',
          slug: 'live-smarter-aurelia',
          status: 'published',
          placements: ['mid_banner'],
          priority: 1,
          background: {
            type: 'combined',
            color: '#001736',
            opacity: 100,
            imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
            imagePosition: 'center',
            imageSize: 'cover',
            overlayColor: '#001128',
            overlayOpacity: 75,
            gradient: {
              type: 'linear',
              angle: 90,
              direction: 'to right',
              stops: [
                { color: '#001736', stop: 0 },
                { color: '#002b66', stop: 50 },
                { color: '#001a3a', stop: 100 },
              ],
              opacity: 95,
            },
          },
          layout: {
            width: '100%',
            height: 'auto',
            minHeight: '340px',
            padding: { top: 40, right: 40, bottom: 40, left: 40 },
            borderRadius: 32,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
            contentAlign: 'left',
            verticalAlign: 'center',
            containerWidth: '60%',
          },
          layers: [
            {
              id: 'layer-badge-3',
              type: 'badge',
              text: 'DISCOVER PREMIUM SHOPPING',
              fontFamily: 'Plus Jakarta Sans',
              fontSize: 11,
              fontWeight: '800',
              textColor: '#60a5fa',
              textAlign: 'left',
              opacity: 100,
              zIndex: 2,
              isVisible: true,
              position: { x: 0, y: 0, mode: 'flow' },
            },
            {
              id: 'layer-heading-3',
              type: 'heading',
              text: 'Live Smarter with Aurelia',
              fontFamily: 'Plus Jakarta Sans',
              fontSize: 36,
              fontWeight: '900',
              textColor: '#ffffff',
              textAlign: 'left',
              opacity: 100,
              zIndex: 2,
              isVisible: true,
              position: { x: 0, y: 0, mode: 'flow' },
            },
            {
              id: 'layer-desc-3',
              type: 'description',
              text: 'Discover the latest trends, unbeatable deals, and a better shopping experience curated for Bangladesh with genuine brand warranties.',
              fontFamily: 'Plus Jakarta Sans',
              fontSize: 14,
              fontWeight: '400',
              textColor: '#cbd5e1',
              textAlign: 'left',
              opacity: 95,
              zIndex: 2,
              isVisible: true,
              position: { x: 0, y: 0, mode: 'flow' },
            },
          ],
          buttons: [
            {
              id: 'btn-3',
              label: 'Shop Now',
              url: '/shop',
              target: '_self',
              variant: 'primary',
              bgColor: '#ffffff',
              textColor: '#0f172a',
              borderRadius: 9999,
              paddingX: 24,
              paddingY: 12,
              fontSize: 13,
              fontWeight: '800',
              hoverAnimation: 'scale',
              icon: 'ArrowRight',
              iconPosition: 'right',
              isVisible: true,
            },
          ],
        },
      ]);
    }

    // Seed Advertisements
    const adCount = await AdvertisementModel.countDocuments();
    if (adCount === 0) {
      console.log('🌱 Seeding verified Advertisements with placement targeting...');
      await AdvertisementModel.insertMany([
        {
          name: 'Samsung Galaxy S25 Ultra 5G Promo Ad',
          title: 'Flagship Galaxy S25 Ultra 5G',
          subtitle: 'Titanium Gray · 12GB RAM · 256GB Storage',
          description: 'Experience next-gen Galaxy AI, revolutionary 200MP camera resolution, and all-day intelligent battery.',
          promoBadge: 'Official Warranty',
          mainImage: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80',
          backgroundColor: '#051329',
          gradient: 'from-blue-950 via-slate-900 to-slate-950',
          textColor: '#ffffff',
          cta: {
            enabled: true,
            label: 'Order Galaxy S25 Ultra',
            url: '/product/samsung-galaxy-s25-ultra',
            target: '_self',
            variant: 'primary',
            bgColor: '#2563eb',
            textColor: '#ffffff',
          },
          closeButton: {
            enabled: true,
            position: 'top-right',
            appearance: 'circle',
            dismissalPolicy: 'session',
            dismissalDurationHours: 24,
          },
          placements: ['popup_modal', 'between_sections', 'homepage_hero', 'plp_top'],
          deviceTargeting: 'all',
          priority: 1,
          status: 'published',
        },
        {
          name: 'Audiophile Studio Sound Flash Sale',
          title: 'Acoustic Studio Pro Headphones',
          subtitle: 'Pure sound. Active noise cancelling. 40hr battery.',
          description: 'Upgrade your listening sessions with custom tuned 45mm neodymium drivers and ultra-soft memory foam cushions.',
          promoBadge: 'Limited Stock 🔥',
          mainImage: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80',
          backgroundColor: '#111827',
          gradient: 'from-purple-950 via-slate-900 to-slate-950',
          textColor: '#ffffff',
          cta: {
            enabled: true,
            label: 'Explore Audio Gear',
            url: '/shop?category=electronics',
            target: '_self',
            variant: 'secondary',
            bgColor: '#8b5cf6',
            textColor: '#ffffff',
          },
          closeButton: {
            enabled: true,
            position: 'top-right',
            appearance: 'circle',
            dismissalPolicy: 'duration',
            dismissalDurationHours: 24,
          },
          placements: ['plp_sidebar', 'pdp_bottom', 'footer'],
          deviceTargeting: 'all',
          priority: 2,
          status: 'published',
        },
      ]);
    }

    console.log('✅ Database initialization & verification complete.');
    return { success: true };
  } catch (err: any) {
    console.error('⚠️ [Database Seeding Notice]:', err.message);
    return { success: false, error: err.message };
  }
}

export const seedInitialDatabase = seedDatabaseIfEmpty;


