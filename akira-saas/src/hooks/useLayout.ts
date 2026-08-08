import { useLayoutStore } from '@/store/layoutStore';

export const useLayout = () => {
  const sidebarOpen = useLayoutStore((state) => state.sidebarOpen);
  const controlPanelOpen = useLayoutStore(
    (state) => state.controlPanelOpen
  );
  const mobileMenuOpen = useLayoutStore((state) => state.mobileMenuOpen);
  const toggleSidebar = useLayoutStore((state) => state.toggleSidebar);
  const toggleControlPanel = useLayoutStore(
    (state) => state.toggleControlPanel
  );
  const toggleMobileMenu = useLayoutStore((state) => state.toggleMobileMenu);
  const closeMobileMenu = useLayoutStore((state) => state.closeMobileMenu);

  return {
    sidebarOpen,
    controlPanelOpen,
    mobileMenuOpen,
    toggleSidebar,
    toggleControlPanel,
    toggleMobileMenu,
    closeMobileMenu,
  };
};
