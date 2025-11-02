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
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        setUser(await res.json());
      } else {
        router.push('/auth/login');
      }
      setLoading(false);
    };
    fetchUser();
  }, [router]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return null;

  const tempExpiry = user.tempVerifiedUntil
    ? new Date(user.tempVerifiedUntil).toLocaleDateString()
    : null;

  // Owner sees admin dashboard
  const showAdmin = user.role === 'admin' || user.role === 'owner';

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        {showAdmin ? 'Admin Dashboard' : 'User Dashboard'}
      </h1>

      <div className="mb-8 p-4 border rounded">
        <p><strong>Welcome,</strong> {user.name}</p>
        <p><strong>Role:</strong> {user.role}</p>
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
          <strong>Plan:</strong> {user.isPremium ? '💎 Premium' : '🆓 Free'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Common Actions */}
        <div className="border rounded p-4">
          <h3 className="font-semibold mb-2">Actions</h3>
          <ul className="space-y-2">
            {!user.isPremium && (
              <li><Link href="/premium" className="text-blue-600 hover:underline">Upgrade to Premium</Link></li>
            )}
            <li>
              <button
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' });
                  router.push('/auth/login');
                }}
                className="text-red-600 hover:underline"
              >
                Log Out
              </button>
            </li>
          </ul>
        </div>

        {/* Artist Tools */}
        {(user.role === 'artist' || showAdmin) && (
          <div className="border rounded p-4">
            <h3 className="font-semibold mb-2">Artist Tools</h3>
            <ul className="space-y-2">
              <li><Link href="/artist/dashboard" className="text-blue-600 hover:underline">Upload Songs</Link></li>
              <li><Link href="/artist/earnings" className="text-blue-600 hover:underline">View Earnings</Link></li>
            </ul>
          </div>
        )}

        {/* Admin/Owner Panel */}
        {showAdmin && (
          <div className="border rounded p-4">
            <h3 className="font-semibold mb-2">Admin Controls</h3>
            <ul className="space-y-2">
              <li><Link href="/admin" className="text-blue-600 hover:underline">Admin Panel</Link></li>
              <li><Link href="/copyright" className="text-blue-600 hover:underline">Copyright Claims</Link></li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
