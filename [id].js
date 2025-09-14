import { getSession } from '../../lib/auth';
import { query } from '../../lib/db';

export default async function handler(req, res) {
  const session = await getSession(req);
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.query;

  try {
    // Verify the note belongs to the tenant
    const noteResult = await query(
      'SELECT * FROM notes WHERE id = $1 AND tenant_id = $2',
      [id, session.tenantId]
    );

    if (noteResult.rows.length === 0) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (req.method === 'GET') {
      res.status(200).json(noteResult.rows[0]);
    } else if (req.method === 'PUT') {
      const { title, content } = req.body;
      const updatedNote = await query(
        'UPDATE notes SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND tenant_id = $4 RETURNING *',
        [title, content, id, session.tenantId]
      );
      res.status(200).json(updatedNote.rows[0]);
    } else if (req.method === 'DELETE') {
      await query(
        'DELETE FROM notes WHERE id = $1 AND tenant_id = $2',
        [id, session.tenantId]
      );
      res.status(204).end();
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error with note operation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}