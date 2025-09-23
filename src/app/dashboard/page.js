'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({ users: 0, docs: 0, domains: 0 });

  useEffect(() => {
    if (session) {
      fetchStats();
    }
  }, [session]);

  const fetchStats = async () => {
    try {
      const [usersRes, docsRes, domainsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/docs'),
        fetch('/api/domains'),
      ]);

      if (usersRes.ok) {
        const users = await usersRes.json();
        setStats(prev => ({ ...prev, users: users.length }));
      }

      if (docsRes.ok) {
        const docs = await docsRes.json();
        setStats(prev => ({ ...prev, docs: docs.length }));
      }

      if (domainsRes.ok) {
        const domains = await domainsRes.json();
        setStats(prev => ({ ...prev, domains: domains.length }));
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  if (!session) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>لوحة التحكم</h1>
      
      <div style={{ margin: '2rem 0' }}>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.8' }}>
          مرحباً بك {session.user.username} في نظام توثيق الموقع. يمكنك من هنا إدارة المستخدمين والمستندات والمجالات حسب الصلاحيات الممنوحة لك.
        </p>
      </div>

      {/* Statistics Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1.5rem',
        marginTop: '2rem'
      }}>
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid #ddd',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#601f26', marginBottom: '0.5rem' }}>المستخدمين</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#191919' }}>{stats.users}</p>
        </div>

        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid #ddd',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#601f26', marginBottom: '0.5rem' }}>المستندات</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#191919' }}>{stats.docs}</p>
        </div>

        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid #ddd',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#601f26', marginBottom: '0.5rem' }}>المجالات</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#191919' }}>{stats.domains}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>إجراءات سريعة</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a href="/docs" className="btn">عرض المستندات</a>
          
          {(session.user.currentDomain.userRole === 'site_admin' || 
            session.user.currentDomain.userRole === 'doc_admin' || 
            session.user.currentDomain.userRole === 'superadmin') && (
            <a href="/users" className="btn">إدارة المستخدمين</a>
          )}
          
          {(session.user.currentDomain.userRole === 'doc_admin' || 
            session.user.currentDomain.userRole === 'superadmin') && (
            <a href="/domains" className="btn">إدارة المجالات</a>
          )}
        </div>
      </div>

      {/* Current Domain Info */}
      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        background: '#f8f9fa', 
        borderRadius: '0.5rem',
        border: '1px solid #dee2e6'
      }}>
        <h3 style={{ marginBottom: '0.5rem' }}>المجال الحالي</h3>
        <p style={{ margin: 0 }}>
          <strong>المجال:</strong> {session.user.currentDomain?.domainName || 'غير محدد'}
        </p>
        <p style={{ margin: 0 }}>
          <strong>الدور:</strong> {session.user.currentDomain?.userRole || 'غير محدد'}
        </p>
      </div>
    </div>
  );
}