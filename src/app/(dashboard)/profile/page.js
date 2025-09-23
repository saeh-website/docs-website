'use client';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Edit, Save, Cancel } from '@mui/icons-material';

export default function Profile() {
  const { data: session, update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: session?.user?.username || '',
    profilePicture: session?.user?.profilePicture || '',
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        
        // Update session
        await update({
          ...session,
          user: {
            ...session.user,
            ...updatedUser,
          },
        });

        setMessage('Profile updated successfully!');
        setIsEditing(false);
      } else {
        const error = await response.json();
        setMessage(error.message || 'Error updating profile');
      }
    } catch (error) {
      setMessage('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: session?.user?.username || '',
      profilePicture: session?.user?.profilePicture || '',
    });
    setIsEditing(false);
    setMessage('');
  };

  if (!session) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>الملف الشخصي</h1>
        {!isEditing && (
          <button className="btn" onClick={() => setIsEditing(true)}>
            <Edit /> تعديل
          </button>
        )}
      </div>

      <div style={{ 
        background: 'white', 
        padding: '2rem', 
        borderRadius: '0.5rem', 
        border: '1px solid #ddd' 
      }}>
        {/* Profile Picture */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img
            src={session.user.profilePicture}
            alt="Profile"
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid #601f26',
            }}
            onError={(e) => {
              e.target.src = '/images/default-avatar.png';
            }}
          />
        </div>

        {/* Username */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            اسم المستخدم:
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
            disabled={!isEditing}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              backgroundColor: isEditing ? 'white' : '#f8f9fa',
            }}
          />
        </div>

        {/* Current Domain Info */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            المجال الحالي:
          </label>
          <div style={{
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '0.5rem',
            backgroundColor: '#f8f9fa',
          }}>
            <p style={{ margin: 0 }}>
              <strong>المجال:</strong> {session.user.currentDomain?.domainName || 'غير محدد'}
            </p>
            <p style={{ margin: 0 }}>
              <strong>الدور:</strong> {session.user.currentDomain?.userRole || 'غير محدد'}
            </p>
          </div>
        </div>

        {/* All Domains */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            جميع المجالات:
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {session.user.userDomains?.map(ud => (
              <span
                key={ud.domainId}
                style={{
                  padding: '0.25rem 0.5rem',
                  background: '#e9ecef',
                  borderRadius: '0.25rem',
                  fontSize: '0.8rem',
                  color: '#495057'
                }}
              >
                {ud.domainName} ({ud.userRole})
              </span>
            ))}
          </div>
        </div>

        {/* Creation Date */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            تاريخ الإنشاء:
          </label>
          <div style={{
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '0.5rem',
            backgroundColor: '#f8f9fa',
          }}>
            {new Date(session.user.createdAt || Date.now()).toLocaleDateString('ar-EG')}
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              className="btn"
              onClick={handleSave}
              disabled={isLoading}
              style={{ opacity: isLoading ? 0.6 : 1 }}
            >
              <Save /> {isLoading ? 'جارٍ الحفظ...' : 'حفظ'}
            </button>
            <button
              className="btn"
              onClick={handleCancel}
              style={{ backgroundColor: '#6c757d' }}
              disabled={isLoading}
            >
              <Cancel /> إلغاء
            </button>
          </div>
        )}

        {/* Message */}
        {message && (
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            background: message.includes('successfully') ? '#d4edda' : '#f8d7da',
            color: message.includes('successfully') ? '#155724' : '#721c24',
            border: `1px solid ${message.includes('successfully') ? '#c3e6cb' : '#f5c6cb'}`,
            borderRadius: '0.25rem',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
