import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar />
      {/* 
        On desktop: sidebar is 260px fixed on the left.
        We push the main content area with a reliable inline marginLeft.
      */}
      <main
        id="dashboard-main"
        style={{
          flex: 1,
          minWidth: 0,
          marginLeft: '260px',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg)',
        }}
      >
        {/* Tablet/Mobile override is handled via a <style> tag below */}
        <style>{`
          @media (max-width: 1023px) {
            #dashboard-main {
              margin-left: 0 !important;
            }
          }
        `}</style>
        <div
          style={{
            flex: 1,
            padding: '40px 40px',
            boxSizing: 'border-box',
          }}
        >
          {/* Mobile top padding — so content doesn't hide under hamburger button */}
          <div style={{ height: 12 }} className="lg:hidden" />
          {children}
        </div>
      </main>
    </div>
  );
}
