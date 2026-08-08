import { FC, useRef, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Zap,
  Settings,
  UserPlus,
  User,
  Plus,
  Check,
  LogOut,
} from 'lucide-react';

interface UserDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserDropdown: FC<UserDropdownProps> = ({ isOpen, onClose }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, profile, logout } = useAuth();
  const [workspaces, setWorkspaces] = useState<Array<{ id: string; name: string }>>([
    { id: '1', name: 'Personal' },
  ]);
  const [activeWorkspace, setActiveWorkspace] = useState(workspaces[0]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div ref={dropdownRef} className="user-dropdown">
      {/* User Info Header */}
      <div className="dropdown-header">
        <div className="dropdown-avatar">{profile?.first_name?.charAt(0) || 'U'}</div>
        <div>
          <div className="dropdown-name">
            {profile?.first_name} {profile?.last_name}
          </div>
          <div className="dropdown-email">{user?.email}</div>
        </div>
      </div>

      <div className="dropdown-divider"></div>

      {/* Menu Items */}
      <div className="dropdown-section">
        <button className="dropdown-item">
          <Settings className="dropdown-icon" size={16} />
          <span>Settings</span>
        </button>
        <button className="dropdown-item">
          <Zap className="dropdown-icon" size={16} />
          <span>Upgrade</span>
        </button>
        <button className="dropdown-item">
          <UserPlus className="dropdown-icon" size={16} />
          <span>Invite</span>
        </button>
      </div>

      <div className="dropdown-divider"></div>

      {/* Workspace Selector */}
      <div className="dropdown-section">
        <div className="dropdown-label">Workspaces</div>
        {workspaces.map((workspace) => (
          <button
            key={workspace.id}
            className="dropdown-workspace"
            onClick={() => setActiveWorkspace(workspace)}
          >
            <span>{workspace.name}</span>
            {activeWorkspace.id === workspace.id && (
              <Check size={16} className="dropdown-check" />
            )}
          </button>
        ))}
        <button className="dropdown-item">
          <Plus className="dropdown-icon" size={16} />
          <span>New Workspace</span>
        </button>
      </div>

      <div className="dropdown-divider"></div>

      {/* Logout */}
      <div className="dropdown-section">
        <button
          className="dropdown-item dropdown-item-danger"
          onClick={logout}
        >
          <LogOut className="dropdown-icon" size={16} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
};
