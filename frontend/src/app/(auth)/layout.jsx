export default function AuthLayout({ children }) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-sidebar px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[-25%] h-[560px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sidebar-primary/30 via-transparent to-transparent blur-3xl"
      />
      <div className="relative w-full max-w-sm">{children}</div>
    </div>
  );
}
