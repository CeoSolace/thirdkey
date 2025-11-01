'use client';

import { useState, useEffect } from 'react';

export default function AdminPanel() {
  const [siteState, setSiteState] = useState('open');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/public/site-state')
      .then(res => res.json())
      .then(data => {
        setSiteState(data.state);
        setMessage(data.message);
      });

    fetch('/api/admin/audit-logs')
      .then(res => res.json())
      .then(data => setLogs(data.logs));
  }, []);

  const handleEmergencyAction = async (action: string) => {
    let secret: string | undefined;

    if (action === 'shutdown') {
      secret = prompt('Enter OWNER_SHARED_SECRET:') || undefined;
      if (!secret) return; // cancel if not provided
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          secret: action === 'shutdown' ? secret : undefined,
        }),
      });

      if (res.ok) {
        window.location.reload();
      } else {
        alert('Action failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Site State</h2>
          <p className="mb-2">
            Current: <strong>{siteState}</strong>
          </p>
          <p className="mb-4">{message}</p>
          <div className="flex gap-2">
            <button
              onClick={() => handleEmergencyAction('maintenance')}
              className="px-3 py-1 bg-yellow-500 text-white rounded"
              disabled={loading}
            >
              Maintenance Mode
            </button>
            <button
              onClick={() => handleEmergencyAction('close')}
              className="px-3 py-1 bg-red-500 text-white rounded"
              disabled={loading}
            >
              Close Temporarily
            </button>
            <button
              onClick={() => handleEmergencyAction('shutdown')}
              className="px-3 py-1 bg-black text-white rounded"
              disabled={loading}
            >
              Permanent Shutdown
            </button>
          </div>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Quick Actions</h2>
          <ul className="space-y-2">
            <li>
              <a href="/admin/verifications" className="text-primary hover:underline">
                Review Verifications
              </a>
            </li>
            <li>
              <a href="/admin/copyright" className="text-primary hover:underline">
                Copyright Claims
              </a>
            </li>
            <li>
              <a href="/admin/bans" className="text-primary hover:underline">
                Manage Bans
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Audit Logs</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Action</th>
                <th className="border p-2">Target</th>
                <th className="border p-2">Reason</th>
                <th className="border p-2">Owner Override</th>
                <th className="border p-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.slice(0, 10).map((log) => (
                <tr key={log._id}>
                  <td className="border p-2">{log.action}</td>
                  <td className="border p-2">
                    {log.targetType} ({String(log.targetId).slice(0, 6)}...)
                  </td>
                  <td className="border p-2">{log.reason || '—'}</td>
                  <td className="border p-2">{log.isOwnerOverride ? '✅' : '—'}</td>
                  <td className="border p-2">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
