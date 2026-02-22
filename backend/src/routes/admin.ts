import { Router, Response } from 'express';
import prisma from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /admin/overview - System-wide overview for admin dashboard
router.get('/overview', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [totalUsers, totalCustomers, recentUsers, recentCustomers] = await Promise.all([
      prisma.user.count(),
      prisma.customer.count(),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          fullName: true,
          email: true,
          createdAt: true,
        },
      }),
      prisma.customer.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          fullName: true,
          email: true,
          gstin: true,
          entityType: true,
          createdAt: true,
          broker: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      }),
    ]);

    res.json({
      stats: {
        totalUsers,
        totalCustomers,
      },
      recentUsers,
      recentCustomers,
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
