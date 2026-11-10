import mongoose from 'mongoose';
import { config } from '../config/env';

// Disable query buffering so disconnected queries fail fast instead of hanging
mongoose.set('bufferCommands', false);

export interface DatabaseStatus {
  isConnected: boolean;
  statusText: string;
  host?: string;
  databaseName?: string;
  error?: string;
}

export let dbStatus: DatabaseStatus = {
  isConnected: false,
  statusText: 'Disconnected. MongoDB Atlas URI not configured or initializing.',
};

/**
 * Checks whether Mongoose has an active, connected session to MongoDB Atlas.
 */
export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

/**
 * Sanitizes a MongoDB connection URI to mask credentials for safe logging.
 */
export function sanitizeMongoUri(uri: string): string {
  if (!uri) return '';
  return uri.replace(/\/\/(.*?):(.*?)@/, '//***:***@');
}

/**
 * Validates a MongoDB Atlas connection string for structure and placeholder detection.
 */
export function validateMongoUri(uri?: string): { valid: boolean; reason?: string } {
  if (!uri || typeof uri !== 'string' || uri.trim() === '') {
    return { valid: false, reason: 'MONGODB_URI is empty or undefined.' };
  }

  const trimmed = uri.trim();
  if (!trimmed.startsWith('mongodb://') && !trimmed.startsWith('mongodb+srv://')) {
    return {
      valid: false,
      reason: 'Invalid protocol. MongoDB connection string must begin with "mongodb+srv://" or "mongodb://".',
    };
  }

  const placeholders = [
    'YOUR_USERNAME',
    'YOUR_PASSWORD',
    'YOUR_CLUSTER',
    'YOUR_DATABASE_NAME',
    '<username>',
    '<password>',
    '<cluster>',
    '<database>',
  ];

  for (const placeholder of placeholders) {
    if (trimmed.includes(placeholder)) {
      return {
        valid: false,
        reason: `Connection string contains unreplaced template placeholder: "${placeholder}".`,
      };
    }
  }

  return { valid: true };
}

// In-flight connection promise to prevent race conditions during concurrent connection attempts
let activeConnectionPromise: Promise<boolean> | null = null;

/**
 * Centralized, production-ready MongoDB Atlas connection manager.
 * Connects exclusively to MongoDB Atlas with connection pooling and lifecycle resilience.
 * ZERO in-memory fallback, ZERO mock database providers.
 */
export async function connectToDatabase(customUri?: string): Promise<boolean> {
  const targetUri = (customUri || config.mongodbUri || '').trim();

  // If already connected to the requested URI, reuse existing connection
  if (mongoose.connection.readyState === 1 && !customUri) {
    return true;
  }

  // Prevent race conditions: return ongoing connection promise if in flight
  if (activeConnectionPromise) {
    return activeConnectionPromise;
  }

  activeConnectionPromise = (async () => {
    const validation = validateMongoUri(targetUri);
    if (!validation.valid) {
      const errorMsg = `MongoDB Atlas configuration error: ${validation.reason}`;
      console.error(`❌ [MongoDB Atlas Error] ${errorMsg}`);
      dbStatus = {
        isConnected: false,
        statusText: 'Disconnected. Invalid or missing MongoDB Atlas URI.',
        error: validation.reason,
      };
      return false;
    }

    try {
      const sanitized = sanitizeMongoUri(targetUri);
      console.log(`⏳ Connecting to MongoDB Atlas cluster at ${sanitized}...`);

      // Disconnect cleanly if already in another state
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }

      await mongoose.connect(targetUri, {
        maxPoolSize: 50,
        minPoolSize: 5,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        retryWrites: true,
        w: 'majority',
      });

      const conn = mongoose.connection;
      dbStatus = {
        isConnected: true,
        statusText: 'Connected to MongoDB Atlas',
        host: conn.host,
        databaseName: conn.name,
      };

      console.log(`✅ [MongoDB Atlas Connected] Host: ${conn.host}, Database: ${conn.name}`);
      return true;
    } catch (err: any) {
      console.error('❌ [MongoDB Atlas Connection Failed]:', err.message);
      dbStatus = {
        isConnected: false,
        statusText: 'Failed to connect to MongoDB Atlas',
        error: err.message,
      };
      return false;
    } finally {
      activeConnectionPromise = null;
    }
  })();

  return activeConnectionPromise;
}

/**
 * Gracefully terminates MongoDB Atlas connection pool on application shutdown.
 */
export async function disconnectFromDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    console.log('🔌 Closing MongoDB Atlas connection pool...');
    await mongoose.connection.close();
    dbStatus = {
      isConnected: false,
      statusText: 'Disconnected from MongoDB Atlas',
    };
    console.log('✅ MongoDB Atlas connection closed.');
  }
}

// Global Mongoose connection lifecycle listeners
mongoose.connection.on('connected', () => {
  dbStatus.isConnected = true;
  dbStatus.statusText = 'Connected to MongoDB Atlas';
  dbStatus.host = mongoose.connection.host;
  dbStatus.databaseName = mongoose.connection.name;
  console.log(`📡 [MongoDB Event: connected] Host: ${mongoose.connection.host}, DB: ${mongoose.connection.name}`);
});

mongoose.connection.on('disconnected', () => {
  dbStatus.isConnected = false;
  dbStatus.statusText = 'Disconnected from MongoDB Atlas';
  console.warn('⚠️ [MongoDB Event: disconnected] Lost connection to MongoDB Atlas.');
});

mongoose.connection.on('reconnected', () => {
  dbStatus.isConnected = true;
  dbStatus.statusText = 'Connected to MongoDB Atlas';
  console.log('🔄 [MongoDB Event: reconnected] Reconnected to MongoDB Atlas cluster.');
});

mongoose.connection.on('error', (err) => {
  dbStatus.isConnected = false;
  dbStatus.error = err.message;
  console.error('❌ [MongoDB Event: error]:', err.message);
});
