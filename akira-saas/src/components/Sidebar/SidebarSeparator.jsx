export const SidebarSeparator = ({ label }) => {
  return (
    <div className="sidebar-separator">
      {label && <span className="sidebar-separator-label">{label}</span>}
    </div>
  );
};
