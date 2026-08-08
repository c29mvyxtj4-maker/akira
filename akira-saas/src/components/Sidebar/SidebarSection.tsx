import { FC, ReactNode } from 'react';

interface SidebarSectionProps {
  children: ReactNode;
}

export const SidebarSection: FC<SidebarSectionProps> = ({ children }) => {
  return <div className="sidebar-section">{children}</div>;
};
