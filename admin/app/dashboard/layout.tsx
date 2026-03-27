import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar />
      {/* Dashboard Main Content */}
      <main
        id="dashboard-main"
        className="flex-1 flex flex-col min-w-0 bg-[var(--bg)]"
        style={{ marginLeft: '260px' }}
      >
        <style>{`
          @media (max-width: 1023px) {
            #dashboard-main {
              margin-left: 0 !important;
            }
          }
        `}</style>
        <div className="flex-1 px-4 py-6 md:px-8 md:py-8 lg:px-10 lg:py-10 box-border">
          {/* Mobile top padding — so content doesn't hide under hamburger button */}
          <div className="h-12 lg:hidden" />
          {children}
        </div>
      </main>
    </div>
  );
}
