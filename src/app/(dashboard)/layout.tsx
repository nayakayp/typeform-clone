export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar will be implemented in the dashboard issue */}
      <aside className="bg-sidebar w-64 border-r">
        <div className="p-4 font-bold">Typeform Clone</div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
