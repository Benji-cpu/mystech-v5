export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-start justify-center px-4 pt-[25vh] md:items-center md:pt-0">
      {children}
    </div>
  );
}
