export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="daylight flex min-h-screen items-start justify-center px-6 pt-[18vh] md:items-center md:pt-0"
      style={{ background: "var(--paper)" }}
    >
      {children}
    </div>
  );
}
