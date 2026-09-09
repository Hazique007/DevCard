export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-lg font-semibold tracking-tight font-mono">Devcards</span>
        </div>
        <div className="rounded-lg border border-neutral-200 p-6">
          {children}
        </div>
      </div>
    </div>
  );
}