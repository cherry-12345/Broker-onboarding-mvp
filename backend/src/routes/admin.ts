import { Router, Response } from 'express';
import prisma from '../config/database';
import { authenticate, authorizeAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// Type definitions for API responses
interface BrokerStats {
  id: string;
  fullName: string;
  email: string;
  createdAt: Date;
  customerCount: number;
}

interface AdminStats {
  totalBrokers: number;
  totalCustomers: number;
  exporters: number;
  importers: number;
}

// All admin routes require authentication + admin role
router.use(authenticate);
router.use(authorizeAdmin);

// Helper function for consistent error handling
const handleRouteError = (res: Response, context: string, error: unknown): void => {
  console.error(`${context} error:`, error);
  res.status(500).json({ error: 'Internal server error.' });
};

// GET /admin/stats - Overview statistics
router.get('/stats', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [totalBrokers, totalCustomers, exporters, importers] = await Promise.all([
      prisma.user.count({ where: { role: 'BROKER' } }),
      prisma.customer.count(),
      prisma.customer.count({ where: { entityType: 'EXPORTER' } }),
      prisma.customer.count({ where: { entityType: 'IMPORTER' } }),
    ]);

    const stats: AdminStats = {
      totalBrokers,
      totalCustomers,
      exporters,
      importers,
    };

    res.json({ stats });
  } catch (error) {
    handleRouteError(res, 'Admin stats', error);
  }
});

// GET /admin/brokers - List all brokers with customer counts
router.get('/brokers', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const brokers = await prisma.user.findMany({
      where: { role: 'BROKER' },
      select: {
        id: true,
        fullName: true,
        email: true,
        createdAt: true,
        _count: {
          select: { customers: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform to clean API response format with explicit typing
    const formattedBrokers: BrokerStats[] = brokers.map((broker: typeof brokers[number]) => ({
      id: broker.id,
      fullName: broker.fullName,
      email: broker.email,
      createdAt: broker.createdAt,
      customerCount: broker._count.customers,
    }));

    res.json({ brokers: formattedBrokers });
  } catch (error) {
    handleRouteError(res, 'Admin brokers', error);
  }
});

// GET /admin/customers - List all customers
router.get('/customers', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customers = await (prisma.customer as any).findMany({
      include: {
        broker: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ customers });
  } catch (error) {
    console.error('Admin customers error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
