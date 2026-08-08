import { FC } from 'react';

interface SidebarSeparatorProps {
  label?: string;
}

export const SidebarSeparator: FC<SidebarSeparatorProps> = ({ label }) => {
  return (
    <div className="sidebar-separator">
      {label && <span className="sidebar-separator-label">{label}</span>}
    </div>
  );
};
