import { Router, Request, Response } from 'express';
import { SupportEnquiryModel } from '../../database/models/SupportEnquiry';
import { AuthenticatedRequest, requireRole } from '../../middleware/auth';
import { requireDatabase } from '../../middleware/dbGuard';

export const supportRouter = Router();

supportRouter.use(requireDatabase);

// POST /api/support (Public contact submission)
supportRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All required fields must be completed.' });
    }

    const enquiry = await SupportEnquiryModel.create({
      name,
      email,
      phone: phone || '',
      subject,
      message,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your enquiry has been received. Our support team will reach out shortly.',
      enquiryId: enquiry._id,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/support (Admin list enquiries)
supportRouter.get(
  '/',
  requireRole('super_admin', 'admin', 'customer_support'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const enquiries = await SupportEnquiryModel.find().sort({ createdAt: -1 }).lean();
      res.json({ success: true, enquiries });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);
