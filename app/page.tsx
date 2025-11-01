import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-6">ThirdKey</h1>
      <p className="text-lg mb-8">Stream music. Support artists.</p>
      <div className="flex gap-4">
        <Link href="/auth/login" className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
          Log In
        </Link>
        <Link href="/auth/signup" className="px-4 py-2 border border-primary rounded-md">
          Sign Up
        </Link>
      </div>
    </div>
  );
}
