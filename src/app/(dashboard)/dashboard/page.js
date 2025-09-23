'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-right">لوحة التحكم</h1>
      <p className="text-right text-lg">
        مرحباً بك في لوحة التحكم الخاصة بك. من هنا يمكنك إدارة المستندات والمستخدمين والنطاقات الخاصة بك.
      </p>
      <p className="text-right text-lg mt-4">
        استخدم القائمة الجانبية للتنقل بين الأقسام المختلفة.
      </p>
    </div>
  )
}