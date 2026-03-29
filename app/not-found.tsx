import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-zinc-200 p-6">
      <h1 className="text-2xl font-semibold text-zinc-100">404</h1>
      <p className="mt-2 text-zinc-500">Page not found</p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
      >
        Back to Home
      </Link>
    </div>
  );
}
