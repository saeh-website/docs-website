'use client';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import UserForm from '@/components/UserForm';
import { Add, Edit, Delete } from '@mui/icons-material';

export default function Users() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [domains, setDomains] = useState([]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      fetchUsers();
      fetchDomains();
    }
  }, [session]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchDomains = async () => {
    try {
      const response = await fetch('/api/domains');
      if (response.ok) {
        const data = await response.json();
        setDomains(data);
      }
    } catch (error) {
      console.error('Error fetching domains:', error);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowUserForm(true);
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      // Note: You'll need to implement DELETE API endpoint
      const response = await fetch(`/api/users?id=${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchUsers();
      } else {
        alert('Error deleting user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  };

  const handleUserFormClose = () => {
    setShowUserForm(false);
    setEditingUser(null);
    fetchUsers(); // Refresh the list
  };

  if (!session) {
    return <div>Loading...</div>;
  }

  // Check if user has permission to access this page
  const allowedRoles = ['site_admin', 'doc_admin', 'superadmin'];
  if (!allowedRoles.includes(session.user.currentDomain.userRole)) {
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
        <h1>إدارة المستخدمين</h1>
        <button 
          className="btn"
          onClick={() => setShowUserForm(true)}
          disabled={loading}
        >
          <Add /> إضافة مستخدم
        </button>
      </div>

      {showUserForm && (
        <UserForm
          user={editingUser}
          domains={domains}
          currentUserRole={session.user.currentDomain.userRole}
          currentUserDomains={session.user.userDomains}
          onClose={handleUserFormClose}
        />
      )}

      <div style={{ display: 'grid', gap: '1rem' }}>
        {users.map(user => (
          <div key={user.id} style={{
            padding: '1rem',
            border: '1px solid #ddd',
            borderRadius: '0.5rem',
            background: 'white'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img 
                  src={user.profilePicture} 
                  alt={user.username}
                  style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = '/images/default-avatar.png';
                  }}
                />
                <div>
                  <h3 style={{ margin: 0 }}>{user.username}</h3>
                  <p style={{ margin: 0, color: '#666' }}>Joined: {new Date(user.createdAt).toLocaleDateString('ar-EG')}</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleEditUser(user)}
                  className="btn"
                  style={{ backgroundColor: '#ffc107', color: '#000' }}
                  title="Edit User"
                >
                  <Edit />
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="btn"
                  style={{ backgroundColor: '#dc3545' }}
                  title="Delete User"
                >
                  <Delete />
                </button>
              </div>
            </div>

            <div>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>المجالات والأدوار:</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {user.userDomains.map(userDomain => (
                  <span
                    key={userDomain.id}
                    style={{
                      padding: '0.25rem 0.5rem',
                      background: '#e9ecef',
                      borderRadius: '0.25rem',
                      fontSize: '0.8rem',
                      color: '#495057'
                    }}
                  >
                    {userDomain.domain.name} ({userDomain.userRole})
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && !showUserForm && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          <p>لا توجد مستخدمين مضافة حتى الآن.</p>
        </div>
      )}
    </div>
  );
}