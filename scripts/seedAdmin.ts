// 📁 `scripts/seedAdmin.ts`
import { dbConnect } from '../lib/dbConnect';
import { User } from '../models/User';

async function seedAdmin() {
  await dbConnect();

  const adminEmail = 'admin@thirdkey.com';
  const adminPass = 'AdminPass123!';

  const existing = await User.findOne({ email: adminEmail });
  if (existing) {
    console.log('Admin already exists');
    return;
  }

  await User.create({
    email: adminEmail,
    password: adminPass,
    name: 'Admin User',
    role: 'admin',
    isEmailVerified: true,
  });

  console.log('Admin created');
  process.exit(0);
}

seedAdmin();
