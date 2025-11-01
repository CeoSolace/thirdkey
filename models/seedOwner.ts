import { dbConnect } from '../lib/dbConnect';
import { User } from '../models/User';

async function seedOwner() {
  await dbConnect();

  const ownerEmail = process.env.OWNER_EMAIL;
  const ownerPass = process.env.OWNER_INIT_PASS;

  if (!ownerEmail || !ownerPass) {
    console.error('OWNER_EMAIL and OWNER_INIT_PASS must be set');
    process.exit(1);
  }

  const existing = await User.findOne({ email: ownerEmail });
  if (existing) {
    console.log('Owner already exists');
    return;
  }

  await User.create({
    email: ownerEmail,
    password: ownerPass,
    name: 'Owner',
    role: 'owner',
    isEmailVerified: true,
  });

  console.log('Owner created');
  process.exit(0);
}

seedOwner();
