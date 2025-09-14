import { getSession } from '../../../lib/auth';
import { query } from '../../../lib/db';

export default async function handler(req, res) {
  const session = await getSession(req);
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Only admins can upgrade
  if (session.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }

  const { slug } = req.query;

  // Verify the tenant slug matches the session
  if (slug !== session.tenantSlug) {
    return res.status(403).json({ message: 'Forbidden: Tenant mismatch' });
  }

  if (req.method === 'POST') {
    try {
      await query(
        'UPDATE tenants SET plan = $1 WHERE id = $2',
        ['pro', session.tenantId]
      );
      res.status(200).json({ message: 'Subscription upgraded to Pro' });
    } catch (error) {
      console.error('Error upgrading tenant:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}