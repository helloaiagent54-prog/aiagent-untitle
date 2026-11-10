import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { UserModel, IUserAddress } from '../../database/models/User';
import { config } from '../../config/env';
import { AuthenticatedRequest, requireAuth } from '../../middleware/auth';
import { requireDatabase } from '../../middleware/dbGuard';

export const authRouter = Router();

// Require database for all auth routes
authRouter.use(requireDatabase);

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const addressSchema = z.object({
  recipientName: z.string().min(2),
  phone: z.string().min(6),
  division: z.string().min(2),
  district: z.string().min(2),
  upazila: z.string().min(2),
  unionOrWard: z.string().optional(),
  streetAddress: z.string().min(5),
  label: z.string().optional(),
  isDefault: z.boolean().optional(),
});

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

// POST /api/auth/register
authRouter.post('/register', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parse = registerSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ success: false, errors: parse.error.format() });
    }

    const { name, email, password, phone } = parse.data;
    const existing = await UserModel.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const user = await UserModel.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      role: 'customer',
      addresses: [],
    });

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role, name: user.name },
      config.jwtSecret as jwt.Secret,
      { expiresIn: '7d' } as jwt.SignOptions
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Registration failed.' });
  }
});

// Rate limiter map for administrative login: IP or email -> { count: number, resetAt: number }
const loginAttemptMap = new Map<string, { count: number; resetAt: number }>();

function checkAdminRateLimit(key: string): { allowed: boolean; waitMinutes?: number } {
  const now = Date.now();
  const entry = loginAttemptMap.get(key);
  if (!entry) return { allowed: true };

  if (now > entry.resetAt) {
    loginAttemptMap.delete(key);
    return { allowed: true };
  }

  if (entry.count >= 5) {
    const waitMinutes = Math.ceil((entry.resetAt - now) / 60000);
    return { allowed: false, waitMinutes };
  }

  return { allowed: true };
}

function recordAdminFailedAttempt(key: string) {
  const now = Date.now();
  const entry = loginAttemptMap.get(key);
  const resetAt = entry && now < entry.resetAt ? entry.resetAt : now + 15 * 60 * 1000;
  const count = entry && now < entry.resetAt ? entry.count + 1 : 1;
  loginAttemptMap.set(key, { count, resetAt });
}

function resetAdminAttempts(key: string) {
  loginAttemptMap.delete(key);
}

// POST /api/auth/admin/login
authRouter.post('/admin/login', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ success: false, message: 'Invalid credentials format.', errors: parse.error.format() });
    }

    const { email, password } = parse.data;
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const rateLimitKey = `${clientIp}_${email.toLowerCase()}`;

    const rateCheck = checkAdminRateLimit(rateLimitKey);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        success: false,
        message: `Too many failed login attempts. Please wait ${rateCheck.waitMinutes} minute(s) before trying again.`,
      });
    }

    const targetEmail = email.toLowerCase().trim();
    let user = await UserModel.findOne({ email: targetEmail });

    // Check if credentials match environment-configured admin
    const envAdminEmail = config.adminEmail?.toLowerCase().trim();
    const envAdminPass = config.adminPassword?.trim();
    const isEnvAdminConfigured = envAdminEmail && envAdminPass && envAdminPass.length >= 6;

    let isAuthenticated = false;

    if (isEnvAdminConfigured && targetEmail === envAdminEmail && password === envAdminPass) {
      isAuthenticated = true;
      if (!user) {
        user = await UserModel.create({
          name: 'Aurelia Super Admin',
          email: envAdminEmail,
          password: envAdminPass,
          role: 'super_admin',
          phone: '+880 1712 345678',
          addresses: [],
        });
      }
    } else if (user) {
      const isMatch = await user.comparePassword(password);
      if (isMatch) {
        isAuthenticated = true;
      }
    }

    if (!isAuthenticated || !user) {
      recordAdminFailedAttempt(rateLimitKey);
      return res.status(401).json({ success: false, message: 'Invalid administrative email or password.' });
    }

    // Role check: Only administrative / staff roles can log in through the Admin Portal
    const adminRoles = ['super_admin', 'admin', 'order_manager', 'inventory_manager', 'catalog_manager', 'customer_support', 'finance'];
    if (!adminRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Customer accounts cannot access the administrative dashboard.',
      });
    }

    resetAdminAttempts(rateLimitKey);

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role, name: user.name },
      config.jwtSecret as jwt.Secret,
      { expiresIn: '7d' } as jwt.SignOptions
    );

    // Set secure HttpOnly cookie for session security
    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.json({
      success: true,
      message: 'Admin authentication successful.',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Admin login failed.' });
  }
});

// POST /api/auth/admin/logout
authRouter.post('/admin/logout', (req: Request, res: Response) => {
  res.clearCookie('admin_token', { path: '/' });
  res.json({ success: true, message: 'Administrative session ended.' });
});

// GET /api/auth/admin/me
authRouter.get('/admin/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const adminRoles = ['super_admin', 'admin', 'order_manager', 'inventory_manager', 'catalog_manager', 'customer_support', 'finance'];
  if (!req.user || !adminRoles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Unauthorized administrative access.' });
  }
  res.json({
    success: true,
    user: req.user,
  });
});

// POST /api/auth/login
authRouter.post('/login', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ success: false, errors: parse.error.format() });
    }

    const { email, password } = parse.data;
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role, name: user.name },
      config.jwtSecret as jwt.Secret,
      { expiresIn: '7d' } as jwt.SignOptions
    );

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Login failed.' });
  }
});

// GET /api/auth/me
authRouter.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await UserModel.findById(req.user!.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/auth/profile (Update name & phone)
authRouter.put('/profile', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parse = profileSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ success: false, errors: parse.error.format() });
    }

    const user = await UserModel.findById(req.user!.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.name = parse.data.name;
    if (parse.data.phone !== undefined) {
      user.phone = parse.data.phone;
    }
    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/auth/change-password
authRouter.put('/change-password', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parse = changePasswordSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ success: false, errors: parse.error.format() });
    }

    const user = await UserModel.findById(req.user!.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isMatch = await user.comparePassword(parse.data.currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = parse.data.newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully!' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/addresses
authRouter.post('/addresses', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parse = addressSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ success: false, errors: parse.error.format() });
    }

    const user = await UserModel.findById(req.user!.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const newAddress: IUserAddress = {
      recipientName: parse.data.recipientName,
      phone: parse.data.phone,
      division: parse.data.division,
      district: parse.data.district,
      upazila: parse.data.upazila,
      unionOrWard: parse.data.unionOrWard || '',
      streetAddress: parse.data.streetAddress,
      label: parse.data.label || 'Home',
      isDefault: parse.data.isDefault || user.addresses.length === 0,
    };

    if (newAddress.isDefault) {
      user.addresses.forEach((a: IUserAddress) => (a.isDefault = false));
    }

    user.addresses.push(newAddress);
    await user.save();

    res.json({ success: true, message: 'Address saved successfully', addresses: user.addresses });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/auth/addresses/:addressId/default (Set default address)
authRouter.patch('/addresses/:addressId/default', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await UserModel.findById(req.user!.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    let found = false;
    user.addresses.forEach((a: any) => {
      if (a._id?.toString() === req.params.addressId) {
        a.isDefault = true;
        found = true;
      } else {
        a.isDefault = false;
      }
    });

    if (!found) return res.status(404).json({ success: false, message: 'Address not found' });

    await user.save();
    res.json({ success: true, message: 'Default address updated', addresses: user.addresses });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/auth/addresses/:addressId
authRouter.delete('/addresses/:addressId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await UserModel.findById(req.user!.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.addresses = user.addresses.filter((a: any) => a._id?.toString() !== req.params.addressId);
    if (user.addresses.length > 0 && !user.addresses.some((a: IUserAddress) => a.isDefault)) {
      user.addresses[0].isDefault = true;
    }
    await user.save();

    res.json({ success: true, message: 'Address removed', addresses: user.addresses });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
