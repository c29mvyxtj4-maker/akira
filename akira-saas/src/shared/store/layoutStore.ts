import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LayoutStore {
  sidebarOpen: boolean;
  controlPanelOpen: boolean;
  mobileMenuOpen: boolean;
  toggleSidebar: () => void;
  toggleControlPanel: () => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
}

export const useLayoutStore = create<LayoutStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      controlPanelOpen: false,
      mobileMenuOpen: false,

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      toggleControlPanel: () =>
        set((state) => ({ controlPanelOpen: !state.controlPanelOpen })),

      toggleMobileMenu: () =>
        set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),

      closeMobileMenu: () =>
        set({ mobileMenuOpen: false }),
    }),
    {
      name: 'layout-store',
    }
  )
);
