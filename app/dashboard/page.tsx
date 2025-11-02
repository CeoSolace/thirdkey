'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type User = {
  email: string;
  name: string;
  role: 'user' | 'artist' | 'admin' | 'owner';
  isPremium: boolean;
  isEmailVerified: boolean;
  tempVerified: boolean;
  tempVerifiedUntil: string | null;
  isBanned: boolean;
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else if (res.status === 401) {
          router.push('/auth/login');
        } else {
          setError('Failed to load dashboard');
        }
      } catch (err) {
        setError('Network error');
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  if (!user) return null;

  const isVerified = user.isEmailVerified || user.tempVerified;
  const tempExpiry = user.tempVerifiedUntil
    ? new Date(user.tempVerifiedUntil).toLocaleDateString()
    : null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* User Info */}
      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Profile</h2>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
        <p><strong>Status:</strong> {user.isBanned ? '❌ Banned' : '✅ Active'}</p>
        <p>
          <strong>Verification:</strong>{' '}
          {user.isEmailVerified
            ? '✅ Permanent'
            : user.tempVerified
            ? `🕒 Temporary (expires ${tempExpiry})`
            : '⚠️ Not verified'}
        </p>
        <p>
          <strong>Subscription:</strong>{' '}
          {user.isPremium ? '💎 Premium' : '🆓 Free'}
        </p>
      </div>

      {/* Role-Based Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Common Actions */}
        <div className="border rounded p-4">
          <h3 className="font-semibold mb-3">Actions</h3>
          <ul className="space-y-2">
            {!user.isPremium && (
              <li>
                <Link
                  href="/premium"
                  className="text-primary hover:underline"
                >
                  ➕ Upgrade to Premium
                </Link>
              </li>
            )}
            <li>
              <button
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' });
                  router.push('/auth/login');
                }}
                className="text-red-600 hover:underline"
              >
                🔒 Log Out
              </button>
            </li>
          </ul>
        </div>

        {/* Artist Section */}
        {(user.role === 'artist' || user.role === 'admin' || user.role === 'owner') && (
          <div className="border rounded p-4">
            <h3 className="font-semibold mb-3">Artist Tools</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/artist/dashboard" className="text-primary hover:underline">
                  🎵 Upload & Manage Songs
                </Link>
              </li>
              <li>
                <Link href="/artist/earnings" className="text-primary hover:underline">
                  💰 View Earnings
                </Link>
              </li>
            </ul>
          </div>
        )}

        {/* Admin/Owner Section */}
        {(user.role === 'admin' || user.role === 'owner') && (
          <div className="border rounded p-4">
            <h3 className="font-semibold mb-3">
              {user.role === 'owner' ? 'Owner' : 'Admin'} Controls
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/admin" className="text-primary hover:underline">
                  🛠️ Admin Panel
                </Link>
              </li>
              <li>
                <Link href="/copyright" className="text-primary hover:underline">
                  ⚖️ Copyright Claims
                </Link>
              </li>
            </ul>
          </div>
        )}

        {/* User Section */}
        {user.role === 'user' && !user.isEmailVerified && (
          <div className="border rounded p-4 bg-yellow-50">
            <h3 className="font-semibold mb-2">❗ Action Required</h3>
            <p className="text-sm">
              You have temporary access for 365 days. To unlock full features permanently, 
              request artist verification or contact support.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
