import { useSidebar } from '../context/SidebarContext';

export function SidebarToggle() {
  const { isCollapsed, toggleCollapsed } = useSidebar();

  return (
    <button
      className="sidebar-toggle"
      onClick={toggleCollapsed}
      aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      aria-expanded={!isCollapsed}
      aria-controls="sidebar"
      title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease'
        }}
      >
        <path
          d="M10 12L6 8L10 4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
