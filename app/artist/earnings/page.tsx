'use client';

import { useEffect, useState } from 'react';

export default function ArtistEarnings() {
  const [earnings, setEarnings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/artist/earnings')
      .then(res => res.json())
      .then(data => {
        setEarnings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading earnings...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Your Earnings</h1>
      {!earnings ? (
        <p>No earnings data yet.</p>
      ) : (
        <div className="space-y-4">
          <div className="p-4 border rounded">
            <h2 className="font-semibold">Ad Revenue</h2>
            <p>£{(earnings.adRevenue / 100).toFixed(2)}</p>
            <p className="text-sm text-gray-600">
              {earnings.thresholdMet ? 'Payout eligible' : '£25 threshold not met'}
            </p>
          </div>
          <div className="p-4 border rounded">
            <h2 className="font-semibold">Premium Revenue</h2>
            <p>£{(earnings.premiumRevenue / 100).toFixed(2)}</p>
          </div>
          <div className="p-4 border rounded">
            <h2 className="font-semibold">Total Earned</h2>
            <p className="text-lg font-bold">£{((earnings.adRevenue + earnings.premiumRevenue) / 100).toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
