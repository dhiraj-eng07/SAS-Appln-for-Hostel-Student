import { initDb } from '../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      await initDb();
      res.status(200).json({ message: 'Database initialized' });
    } catch (error) {
      console.error('Init error:', error);
      res.status(500).json({ message: 'Error initializing database' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}