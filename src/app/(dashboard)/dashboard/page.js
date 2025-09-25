'use client';
import { useSession } from 'next-auth/react';

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="text-center text-lg">
        جاري التحميل...
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="text-center text-lg text-red-600">
        خطأ في جلب بيانات المستخدم
      </div>
    );
  }

  const user = session.user;
  const currentDomain = user.currentDomain;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-right">لوحة التحكم</h1>
      
      {/* Personalized welcome message */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-right mb-4 text-gray-800">
          مرحباً {user.username}
        </h2>
        {currentDomain ? (
          <div className="text-right text-lg text-gray-700">
            <p className="mb-2">
              أهلاً بك في نطاق: <span className="font-semibold text-[#e01f26]">{currentDomain.domain?.name}</span>
            </p>
            <p>
              دورك الحالي: <span className="font-semibold text-blue-600">{currentDomain.roleName}</span>
            </p>
          </div>
        ) : (
          <div className="text-right text-lg text-gray-600">
            <p>لم يتم تحديد نطاق حالي</p>
            <p className="text-sm mt-1">يرجى اختيار نطاق من القائمة الجانبية</p>
          </div>
        )}
      </div>
    </div>
  )
}