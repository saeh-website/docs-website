'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function UserRolesPage() {
  const { data: session } = useSession();
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Fetch user roles
  const fetchUserRoles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user-roles');
      
      if (!response.ok) {
        throw new Error('Failed to fetch user roles');
      }

      const data = await response.json();
      setUserRoles(data);
    } catch (error) {
      setError('Error loading user roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRoles();
  }, []);

  // Check permissions
  const userPermissions = session?.user?.currentDomain?.permissions || [];
  const hasReadPermission = userPermissions.some(p => p.name === 'userRole_read');
  const hasCreatePermission = userPermissions.some(p => p.name === 'userRole_create');
  const hasUpdatePermission = userPermissions.some(p => p.name === 'userRole_update');
  const hasDeletePermission = userPermissions.some(p => p.name === 'userRole_delete');

  if (!hasReadPermission) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          ليس لديك صلاحية لعرض الأدوار
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">إدارة الأدوار</h1>
        {hasCreatePermission && (
          <button 
            className="bg-[#e01f26] text-white px-4 py-2 rounded-lg hover:opacity-80 transition-opacity"
            onClick={() => {
              // TODO: Implement add role modal
              setMessage('إضافة الأدوار الجديدة ستكون متاحة قريباً');
            }}
          >
            إضافة دور جديد
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {message && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          {message}
          <button 
            onClick={() => setMessage('')}
            className="float-right text-blue-700 hover:text-blue-900"
          >
            ×
          </button>
        </div>
      )}

      {userRoles.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          لا توجد أدوار متاحة
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  اسم الدور
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الوصف
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الصلاحيات
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  عدد المستخدمين
                </th>
                {(hasUpdatePermission || hasDeletePermission) && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {userRoles.map((role) => (
                <tr key={role.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {role.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {role.description || 'لا يوجد وصف'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {role.rolePermissions.length > 0 ? (
                        role.rolePermissions.slice(0, 3).map((rp) => (
                          <span
                            key={rp.id}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {rp.permission.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-400">لا توجد صلاحيات</span>
                      )}
                      {role.rolePermissions.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{role.rolePermissions.length - 3} أخرى
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {role._count?.userDomains || 0}
                    </div>
                  </td>
                  {(hasUpdatePermission || hasDeletePermission) && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        {hasUpdatePermission && (
                          <button
                            onClick={() => {
                              // TODO: Implement edit role modal
                              setMessage('تعديل الأدوار سيكون متاحاً قريباً');
                            }}
                            className="text-[#e01f26] hover:text-[#b71c1c]"
                          >
                            تعديل
                          </button>
                        )}
                        {hasDeletePermission && role._count?.userDomains === 0 && (
                          <button
                            onClick={() => {
                              // TODO: Implement delete confirmation
                              setMessage('حذف الأدوار سيكون متاحاً قريباً');
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            حذف
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
