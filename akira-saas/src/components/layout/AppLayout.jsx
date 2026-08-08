import { useMediaQuery } from '@/hooks/useMediaQuery';
import { TopNavBar } from './TopNavBar';
import { LeftSidebar } from './LeftSidebar';
import { MobileMenu } from './MobileMenu';

export const AppLayout = ({
  children,
  title,
  showLeftSidebar = true,
  showControlPanel = false,
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div className="app-layout">
      <TopNavBar title={title} />

      <div className="app-layout-main">
        {showLeftSidebar && !isMobile && <LeftSidebar />}

        <main className="app-layout-content">
          {children}
        </main>

        {showControlPanel && <div className="right-control-panel"></div>}
      </div>

      <MobileMenu />
    </div>
  );
};
