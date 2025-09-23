'use client';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Add, Delete } from '@mui/icons-material';

export default function DomainsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-right">النطاقات</h1>
      <p className="text-right text-lg">
        هنا سيتم عرض واجهة إدارة النطاقات، والتي ستكون متاحة فقط للمستخدمين ذوي الصلاحيات العالية.
      </p>
    </div>
  )
}