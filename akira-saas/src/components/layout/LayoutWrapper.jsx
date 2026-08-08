import { useLocation } from 'react-router-dom';
import { AppLayout } from './AppLayout';

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

export function LayoutWrapper({ children }) {
  const { pathname } = useLocation();

  // Don't use layout for home/inicio page
  if (pathname === '/inicio' || pathname === '/') {
    return children;
  }

  // Get title from mapping or derive from pathname
  const title =
    PAGE_TITLES[pathname] ||
    PAGE_TITLES[Object.keys(PAGE_TITLES).find((key) => pathname.startsWith(key))] ||
    'AKIRA';

  return <AppLayout title={title}>{children}</AppLayout>;
}
