'use client';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Add, Delete } from '@mui/icons-material';

export default function Domains() {
  const { data: session } = useSession();
  const [domains, setDomains] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session) {
      fetchDomains();
    }
  }, [session]);

  const fetchDomains = async () => {
    try {
      const response = await fetch('/api/domains');
      if (response.ok) {
        const data = await response.json();
        setDomains(data);
      }
    } catch (error) {
      console.error('Error fetching domains:', error);
      setError('Error loading domains');
    }
  };

  const handleAddDomain = async (e) => {
    e.preventDefault();
    if (!newDomain.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/domains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newDomain.trim() }),
      });

      if (response.ok) {
        setNewDomain('');
        setShowAddForm(false);
        fetchDomains();
      } else {
        const errorText = await response.text();
        setError(errorText);
      }
    } catch (error) {
      console.error('Error adding domain:', error);
      setError('Error adding domain');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDomain = async (domainId) => {
    if (!confirm('Are you sure you want to delete this domain?')) return;

    try {
      const response = await fetch(`/api/domains?id=${domainId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchDomains();
      } else {
        const errorText = await response.text();
        alert(errorText);
      }
    } catch (error) {
      console.error('Error deleting domain:', error);
      alert('Error deleting domain');
    }
  };

  if (!session) {
    return <div>Loading...</div>;
  }

  // Check if user has permission to access this page
  if (!['doc_admin', 'superadmin'].includes(session.user.currentDomain.userRole)) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h1>Access Denied</h1>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>إدارة المجالات</h1>
        <button 
          className="btn"
          onClick={() => setShowAddForm(true)}
          disabled={loading}
        >
          <Add /> إضافة مجال
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '1rem', padding: '0.5rem', background: '#ffe6e6', borderRadius: '0.25rem' }}>
          {error}
        </div>
      )}

      {showAddForm && (
        <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '0.5rem' }}>
          <form onSubmit={handleAddDomain}>
            <div className="form-group">
              <label>اسم المجال:</label>
              <input
                type="text"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                className="form-control"
                placeholder="أدخل اسم المجال"
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn" disabled={loading}>
                {loading ? 'جاري الإضافة...' : 'إضافة'}
              </button>
              <button 
                type="button" 
                className="btn"
                onClick={() => {
                  setShowAddForm(false);
                  setNewDomain('');
                  setError('');
                }}
                style={{ backgroundColor: '#6c757d' }}
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gap: '1rem' }}>
        {domains.map(domain => (
          <div key={domain.id} style={{
            padding: '1rem',
            border: '1px solid #ddd',
            borderRadius: '0.5rem',
            background: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h3 style={{ margin: 0 }}>{domain.name}</h3>
              <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontSize: '0.9rem' }}>
                المستخدمين: {domain._count?.userDomains || 0} | 
                المستندات: {domain._count?.docs || 0} |
                Created: {new Date(domain.createdAt).toLocaleDateString('ar-EG')}
              </p>
            </div>
            <div>
              <button
                onClick={() => handleDeleteDomain(domain.id)}
                className="btn"
                style={{ backgroundColor: '#dc3545' }}
                title="Delete Domain"
              >
                <Delete />
              </button>
            </div>
          </div>
        ))}
      </div>

      {domains.length === 0 && !showAddForm && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          <p>لا توجد مجالات مضافة حتى الآن.</p>
        </div>
      )}
    </div>
  );
}