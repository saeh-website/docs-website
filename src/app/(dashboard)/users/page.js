'use client';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import UserForm from '@/components/UserForm';
import { Add, Edit, Delete } from '@mui/icons-material';

export default function UsersPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-right">المستخدمون</h1>
      <p className="text-right text-lg">
        هنا سيتم عرض قائمة بالمستخدمين لإدارتهم، وهذا يعتمد على صلاحيات المستخدم الذي قام بتسجيل الدخول.
      </p>
    </div>
  )
}