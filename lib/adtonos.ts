// Use relative path since it's in same folder
import { cloudinary } from './cloudinary';

export const adtonosConfig = {
  enabled: !!process.env.ADTONOS_API_KEY,
  apiKey: process.env.ADTONOS_API_KEY,
  publisherId: process.env.ADTONOS_PUBLISHER_ID,
  streamId: process.env.ADTONOS_STREAM_ID,
};

export async function getAdUrl() {
  if (!adtonosConfig.enabled) return null;

  // In real app, call AdTonos API
  // For now, return null or placeholder
  return null;
}
