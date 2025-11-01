import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';
import { Song } from '@/models/Song';
import { cloudinary } from '@/lib/cloudinary';
import crypto from 'crypto';

export const maxDuration = 300; // 5 minutes for upload
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  await dbConnect();

  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await User.findOne({ email: session.user.email });
  if (!user || user.role !== 'artist') {
    return NextResponse.json({ error: 'Artist access required' }, { status: 403 });
  }

  const formData = await req.formData();
  const title = formData.get('title') as string;
  const audioFile = formData.get('audio') as File;
  const artworkFile = formData.get('artwork') as File | null;

  if (!title || !audioFile) {
    return NextResponse.json({ error: 'Title and audio required' }, { status: 400 });
  }

  try {
    // Upload audio
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    const audioHash = crypto.createHash('sha256').update(audioBuffer).digest('hex');

    const audioUpload = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: 'video', folder: 'thirdkey/audio' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(audioBuffer);
    });

    let artworkUrl = '';
    if (artworkFile) {
      const artworkBuffer = Buffer.from(await artworkFile.arrayBuffer());
      const artworkUpload = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { resource_type: 'image', folder: 'thirdkey/artwork' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(artworkBuffer);
      });
      artworkUrl = (artworkUpload as any).secure_url;
    }

    // Check for duplicate fingerprint
    const existingSong = await Song.findOne({ fingerprint: audioHash });
    if (existingSong) {
      return NextResponse.json({ error: 'Duplicate song detected' }, { status: 409 });
    }

    await Song.create({
      title,
      artistId: user._id,
      audioUrl: (audioUpload as any).secure_url,
      artworkUrl,
      fingerprint: audioHash,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
