import { useLayout } from '@/shared/hooks/useLayout';
import { LeftSidebar } from './LeftSidebar';
import { X } from 'lucide-react';

export const MobileMenu = () => {
  const { mobileMenuOpen, closeMobileMenu } = useLayout();

  if (!mobileMenuOpen) return null;

  return (
    <div className="mobile-menu-overlay">
      <div className="mobile-menu-container">
        <div className="mobile-menu-header">
          <button
            className="mobile-menu-close"
            onClick={closeMobileMenu}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>
        <LeftSidebar />
      </div>
      <div
        className="mobile-menu-backdrop"
        onClick={closeMobileMenu}
        aria-hidden="true"
      ></div>
    </div>
  );
};

