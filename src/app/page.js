import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800">
      <div className="text-center">
        <h1 className="text-5xl font-extrabold mb-4">Welcome to Your Documentation Site</h1>
        <p className="text-xl mb-8">
          This is the starting point for your project. Please log in to access the dashboard.
        </p>
        <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out">
          Go to Login
        </Link>
      </div>
    </div>
  );
}
