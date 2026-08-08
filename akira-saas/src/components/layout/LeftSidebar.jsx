import { useNavigate, useLocation } from 'react-router-dom';
import { useLayout } from '@/hooks/useLayout';
import {
  SidebarItem,
  SidebarSection,
  SidebarSeparator,
} from '@/components/Sidebar';
import {
  Inbox,
  CheckSquare,
  Briefcase,
  Calendar,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
} from 'lucide-react';

export const LeftSidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { sidebarOpen, toggleSidebar } = useLayout();

  const isActive = (path) => pathname === path;

  return (
    <aside className={`left-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">M</div>
        <button
          className="sidebar-toggle"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* Main Menu */}
      <SidebarSection>
        <SidebarItem
          icon={<Inbox size={20} />}
          label="Inbox"
          onClick={() => navigate('/inbox')}
          active={isActive('/inbox')}
        />
        <SidebarItem
          icon={<CheckSquare size={20} />}
          label="Tareas"
          onClick={() => navigate('/tareas')}
          active={isActive('/tareas')}
        />
        <SidebarItem
          icon={<Briefcase size={20} />}
          label="Proyectos"
          onClick={() => navigate('/proyectos')}
          active={isActive('/proyectos')}
        />
        <SidebarItem
          icon={<Calendar size={20} />}
          label="Calendario"
          onClick={() => navigate('/calendar')}
          active={isActive('/calendar')}
        />
        <SidebarItem
          icon={<BookOpen size={20} />}
          label="Conocimiento"
          onClick={() => navigate('/knowledge')}
          active={isActive('/knowledge')}
        />
      </SidebarSection>

      {sidebarOpen && (
        <>
          {/* Recents */}
          <SidebarSeparator label="Recientes" />
          <SidebarSection>
            <SidebarItem
              icon={<Briefcase size={20} />}
              label="Proyecto AKIRA"
              onClick={() => navigate('/proyectos/akira')}
              isRecent
            />
            <SidebarItem
              icon={<Calendar size={20} />}
              label="YouTube"
              onClick={() => navigate('/youtube')}
              isRecent
            />
          </SidebarSection>

          {/* Favorites */}
          <SidebarSeparator label="Favoritos" />
          <SidebarSection>
            <SidebarItem
              icon={<CheckSquare size={20} />}
              label="Tareas urgentes"
              onClick={() => navigate('/tareas/urgent')}
              isFavorite
            />
            <SidebarItem
              icon={<Calendar size={20} />}
              label="Eventos"
              onClick={() => navigate('/calendar/events')}
              isFavorite
            />
          </SidebarSection>
        </>
      )}

      {/* Footer */}
      <div className="sidebar-footer">
        <button className="sidebar-new-chat">
          <MessageCircle size={20} />
          {sidebarOpen && <span>Nuevo chat</span>}
        </button>
      </div>
    </aside>
  );
};
