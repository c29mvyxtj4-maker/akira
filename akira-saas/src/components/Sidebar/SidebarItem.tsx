import { FC, ReactNode } from 'react';

interface SidebarItemProps {
  icon?: ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  isRecent?: boolean;
  isFavorite?: boolean;
}

export const SidebarItem: FC<SidebarItemProps> = ({
  icon,
  label,
  onClick,
  active,
  isRecent,
  isFavorite,
}) => {
  return (
    <button
      onClick={onClick}
      className={`sidebar-item ${active ? 'active' : ''} ${
        isRecent ? 'recent' : ''
      } ${isFavorite ? 'favorite' : ''}`}
    >
      {icon && <span className="sidebar-item-icon">{icon}</span>}
      <span className="sidebar-item-label">{label}</span>
    </button>
  );
};
