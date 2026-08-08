import { Outlet, useLocation } from 'react-router-dom';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { TopNavBar } from './TopNavBar';
import { LeftSidebar } from './LeftSidebar';
import { MobileMenu } from './MobileMenu';

const PAGE_TITLES = {
  '/inbox': 'Inbox',
  '/dashboard': 'Dashboard',
  '/clients': 'Clients',
  '/projects': 'Projects',
  '/services': 'Services',
  '/subscriptions': 'Subscriptions',
  '/finance': 'Finance',
  '/invoices': 'Documents',
  '/documents': 'Documents',
  '/quotes': 'Quotes',
  '/time': 'Time Tracking',
  '/operatives': 'AI Operatives',
  '/calendar': 'Calendar',
  '/knowledge': 'Knowledge Base',
  '/brain': 'AKIRA Assistant',
  '/automation': 'Automation',
  '/youtube': 'YouTube Projects',
  '/settings': 'Settings',
  '/offers': 'Offers',
  '/mensajes': 'Messages',
};

export const AppLayoutContainer = () => {
  const { pathname } = useLocation();
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Don't use layout for home/inicio page
  if (pathname === '/inicio' || pathname === '/') {
    return <Outlet />;
  }

  // Get title from mapping or derive from pathname
  const title =
    PAGE_TITLES[pathname] ||
    PAGE_TITLES[Object.keys(PAGE_TITLES).find((key) => pathname.startsWith(key))] ||
    'AKIRA';

  return (
    <div className="app-layout">
      <TopNavBar title={title} />

      <div className="app-layout-main">
        {!isMobile && <LeftSidebar />}

        <main className="app-layout-content">
          <Outlet />
        </main>
      </div>

      <MobileMenu />
    </div>
  );
};
