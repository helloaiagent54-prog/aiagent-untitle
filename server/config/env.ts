import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  mongodbUri: (process.env.MONGODB_URI || '').trim(),
  adminEmail: process.env.ADMIN_EMAIL || 'admin@novaracommerce.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin123456',
  jwtSecret: process.env.JWT_SECRET || 'novara_commerce_default_super_secret_jwt_key_2026',
  jwtExpiresIn: '7d',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY || '',
    emailFrom: process.env.EMAIL_FROM || 'orders@novaracommerce.com',
  },
};

/**
 * Validates that production environments supply a valid MONGODB_URI.
 */
export function validateEnvironment(): void {
  if (config.env === 'production') {
    if (!config.mongodbUri) {
      throw new Error(
        'FATAL CONFIGURATION ERROR: MONGODB_URI environment variable is not defined. ' +
        'A valid MongoDB Atlas connection string is required in production environments.'
      );
    }
    if (config.mongodbUri.includes('YOUR_PASSWORD') || config.mongodbUri.includes('YOUR_USERNAME')) {
      throw new Error(
        'FATAL CONFIGURATION ERROR: MONGODB_URI contains unconfigured placeholder credentials. ' +
        'Please supply your real MongoDB Atlas connection string.'
      );
    }
  }
}
