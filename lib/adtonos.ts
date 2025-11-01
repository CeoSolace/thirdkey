// 📁 `lib/adtonos.ts`
import { cloudinary } from './cloudinary';

export const adtonosConfig = {
  enabled: !!process.env.ADTONOS_API_KEY,
  apiKey: process.env.ADTONOS_API_KEY,
  publisherId: process.env.ADTONOS_PUBLISHER_ID,
  streamId: process.env.ADTONOS_STREAM_ID,
};

// Simulate ad insertion (in real app, call AdTonos API)
export async function getAdUrl() {
  if (!adtonosConfig.enabled) return null;

  // In production, fetch from AdTonos
  // For demo, return a placeholder audio
  const result = await cloudinary.uploader.upload(
    'https://example.com/ad.mp3', // replace with real ad
    { resource_type: 'video', folder: 'thirdkey/ads' }
  );
  return result.secure_url;
}
