import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [editingNote, setEditingNote] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user'));
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    
    setUser(userData);
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notes', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const notesData = await response.json();
        setNotes(notesData);
      } else {
        if (response.status === 401) {
          router.push('/login');
        } else {
          setError('Failed to fetch notes');
        }
      }
    } catch (error) {
      setError('An error occurred while fetching notes');
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newNote),
      });

      if (response.ok) {
        const createdNote = await response.json();
        setNotes([...notes, createdNote]);
        setNewNote({ title: '', content: '' });
        setMessage('Note created successfully');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create note');
      }
    } catch (error) {
      setError('An error occurred while creating note');
    }
  };

  const updateNote = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/notes/${editingNote.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editingNote),
      });

      if (response.ok) {
        const updatedNote = await response.json();
        setNotes(notes.map(note => note.id === updatedNote.id ? updatedNote : note));
        setEditingNote(null);
        setMessage('Note updated successfully');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update note');
      }
    } catch (error) {
      setError('An error occurred while updating note');
    }
  };

  const deleteNote = async (id) => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        setNotes(notes.filter(note => note.id !== id));
        setMessage('Note deleted successfully');
      } else {
        setError('Failed to delete note');
      }
    } catch (error) {
      setError('An error occurred while deleting note');
    }
  };

  const upgradePlan = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tenants/${user.tenant.slug}/upgrade`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        setMessage('Plan upgraded to Pro successfully');
        // Update user in local storage
        const updatedUser = {...user, tenant: {...user.tenant, plan: 'pro'}};
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to upgrade plan');
      }
    } catch (error) {
      setError('An error occurred while upgrading plan');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const startEdit = (note) => {
    setEditingNote({...note});
    setError('');
    setMessage('');
  };

  const cancelEdit = () => {
    setEditingNote(null);
  };

  if (!user) {
    return (
      <div className="container">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <header>
        <h1>Notes Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user.email} ({user.role})</span>
          <span>Tenant: {user.tenant.slug} ({user.tenant.plan} plan)</span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      {user.role === 'admin' && user.tenant.plan === 'free' && (
        <div className="upgrade-section">
          <h3>Upgrade to Pro Plan</h3>
          <p>Get unlimited notes and premium features</p>
          <button onClick={upgradePlan}>Upgrade to Pro</button>
        </div>
      )}

      {user.tenant.plan === 'free' && notes.length >= 3 && (
        <div className="limit-warning">
          <strong>Limit Reached:</strong> You've reached the maximum of 3 notes on the Free plan. 
          {user.role === 'admin' ? ' Upgrade to Pro to add more notes.' : ' Contact your admin to upgrade.'}
        </div>
      )}

      {message && <div className="message">{message}</div>}
      {error && <div className="error">{error}</div>}

      {!editingNote ? (
        <form onSubmit={createNote} className="note-form">
          <h2>Create New Note</h2>
          <div>
            <label>Title:</label>
            <input
              type="text"
              value={newNote.title}
              onChange={(e) => setNewNote({...newNote, title: e.target.value})}
              required
              disabled={user.tenant.plan === 'free' && notes.length >= 3}
            />
          </div>
          <div>
            <label>Content:</label>
            <textarea
              value={newNote.content}
              onChange={(e) => setNewNote({...newNote, content: e.target.value})}
              required
              disabled={user.tenant.plan === 'free' && notes.length >= 3}
            />
          </div>
          <button 
            type="submit" 
            disabled={user.tenant.plan === 'free' && notes.length >= 3}
          >
            Create Note
          </button>
        </form>
      ) : (
        <form onSubmit={updateNote} className="note-form">
          <h2>Edit Note</h2>
          <div>
            <label>Title:</label>
            <input
              type="text"
              value={editingNote.title}
              onChange={(e) => setEditingNote({...editingNote, title: e.target.value})}
              required
            />
          </div>
          <div>
            <label>Content:</label>
            <textarea
              value={editingNote.content}
              onChange={(e) => setEditingNote({...editingNote, content: e.target.value})}
              required
            />
          </div>
          <div className="form-actions">
            <button type="submit">Update Note</button>
            <button type="button" onClick={cancelEdit} className="cancel-btn">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="notes-list">
        <h2>Your Notes ({notes.length}{user.tenant.plan === 'free' ? '/3' : ''})</h2>
        
        {loading ? (
          <p>Loading notes...</p>
        ) : notes.length === 0 ? (
          <p>No notes yet. Create your first note above.</p>
        ) : (
          <ul>
            {notes.map(note => (
              <li key={note.id}>
                <h3>{note.title}</h3>
                <p>{note.content}</p>
                <div className="note-meta">
                  <span>Created: {new Date(note.created_at).toLocaleString()}</span>
                  <span>Updated: {new Date(note.updated_at).toLocaleString()}</span>
                  <div className="note-actions">
                    <button 
                      onClick={() => startEdit(note)}
                      className="edit-btn"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => deleteNote(note.id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <style jsx>{`
        .container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
        }
        
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
        }
        
        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 5px;
        }
        
        .user-info button {
          background-color: #e74c3c;
          padding: 8px 12px;
        }
        
        .user-info button:hover {
          background-color: #c0392b;
        }
        
        .upgrade-section {
          margin-bottom: 20px;
          padding: 15px;
          background-color: #fff3cd;
          border-radius: 4px;
          border: 1px solid #ffeaa7;
        }
        
        .upgrade-section button {
          background-color: #f39c12;
          margin-top: 10px;
        }
        
        .upgrade-section button:hover {
          background-color: #e67e22;
        }
        
        .limit-warning {
          margin-bottom: 20px;
          padding: 15px;
          background-color: #f8d7da;
          color: #721c24;
          border-radius: 4px;
          border: 1px solid #f5c6cb;
        }
        
        .note-form {
          margin-bottom: 30px;
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 4px;
        }
        
        .note-form div {
          margin-bottom: 15px;
        }
        
        .note-form label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
        
        .note-form input,
        .note-form textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        }
        
        .note-form textarea {
          min-height: 100px;
          resize: vertical;
        }
        
        .form-actions {
          display: flex;
          gap: 10px;
        }
        
        .cancel-btn {
          background-color: #95a5a6;
        }
        
        .cancel-btn:hover {
          background-color: #7f8c8d;
        }
        
        .notes-list ul {
          list-style-type: none;
        }
        
        .notes-list li {
          padding: 15px;
          margin-bottom: 15px;
          background-color: #f8f9fa;
          border-radius: 4px;
          border-left: 4px solid #3498db;
        }
        
        .note-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
          font-size: 14px;
          color: #7f8c8d;
        }
        
        .note-actions {
          display: flex;
          gap: 10px;
        }
        
        .edit-btn {
          background-color: #3498db;
          padding: 5px 10px;
          font-size: 14px;
        }
        
        .edit-btn:hover {
          background-color: #2980b9;
        }
        
        .delete-btn {
          background-color: #e74c3c;
          padding: 5px 10px;
          font-size: 14px;
        }
        
        .delete-btn:hover {
          background-color: #c0392b;
        }
        
        .message {
          color: #27ae60;
          padding: 10px;
          background-color: #d5f4e6;
          border-radius: 4px;
          margin-bottom: 15px;
        }
        
        .error {
          color: #e74c3c;
          padding: 10px;
          background-color: #fadbd8;
          border-radius: 4px;
          margin-bottom: 15px;
        }
      `}</style>
    </div>
  );
}