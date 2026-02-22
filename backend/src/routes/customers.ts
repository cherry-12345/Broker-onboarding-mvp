import { Router, Response } from 'express';
import { validationResult } from 'express-validator';
import prisma from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { customerValidation } from '../middleware/validators';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /customers/stats - Get dashboard stats for the broker
router.get('/stats', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const brokerId = req.user!.userId;

    const [total, exporters, importers, recentCustomers] = await Promise.all([
      prisma.customer.count({ where: { brokerId } }),
      prisma.customer.count({ where: { brokerId, entityType: 'EXPORTER' } }),
      prisma.customer.count({ where: { brokerId, entityType: 'IMPORTER' } }),
      prisma.customer.findMany({
        where: { brokerId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    res.json({
      stats: {
        total,
        exporters,
        importers,
      },
      recentCustomers,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /customers - Create a new customer
router.post('/', customerValidation, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { fullName, email, gstin, entityType } = req.body;
    const brokerId = req.user!.userId;

    // Check unique GSTIN per broker
    const existingCustomer = await prisma.customer.findUnique({
      where: {
        brokerId_gstin: {
          brokerId,
          gstin: gstin.toUpperCase(),
        },
      },
    });

    if (existingCustomer) {
      res.status(409).json({ error: 'A customer with this GSTIN already exists under your account.' });
      return;
    }

    const customer = await prisma.customer.create({
      data: {
        brokerId,
        fullName,
        email,
        gstin: gstin.toUpperCase(),
        entityType,
      },
    });

    res.status(201).json({
      message: 'Customer onboarded successfully.',
      customer,
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
