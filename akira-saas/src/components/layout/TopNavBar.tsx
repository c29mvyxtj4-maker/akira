import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLayout } from '@/hooks/useLayout';
import { UserDropdown } from './UserDropdown';
import { Menu, Home, ChevronDown } from 'lucide-react';

interface TopNavBarProps {
  title?: string;
}

export const TopNavBar: FC<TopNavBarProps> = ({ title }) => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toggleMobileMenu } = useLayout();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="topnavbar">
      <div className="topnavbar-left">
        <button
          onClick={() => navigate('/')}
          className="topnavbar-home-btn"
          title="Go to Home"
        >
          <Home size={20} />
        </button>
      </div>

      {title && <div className="topnavbar-title">{title}</div>}

      <div className="topnavbar-right">
        <div className="topnavbar-mobile-menu">
          <button
            onClick={toggleMobileMenu}
            className="topnavbar-mobile-btn"
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </button>
        </div>

        <div className="topnavbar-user-menu">
          <button
            className="topnavbar-user-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="topnavbar-avatar">
              {profile?.first_name?.charAt(0) || 'U'}
            </div>
            <span className="topnavbar-username">
              {profile?.first_name || 'User'}
            </span>
            <ChevronDown size={16} />
          </button>

          <UserDropdown isOpen={dropdownOpen} onClose={() => setDropdownOpen(false)} />
        </div>
      </div>
    </nav>
  );
};
