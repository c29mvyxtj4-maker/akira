export const SidebarItem = ({
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
