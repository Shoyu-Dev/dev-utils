import { Outlet, NavLink, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useSidebar } from '../context/SidebarContext';
import { ResizeHandle } from './ResizeHandle';
import { SidebarToggle } from './SidebarToggle';

interface NavItem {
  path: string;
  label: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const toolCategories: NavSection[] = [
  {
    title: 'Text Tools',
    items: [
      { path: '/diff', label: 'Diff Checker' },
      { path: '/regex', label: 'Regex Tester' },
    ],
  },
  {
    title: 'Formatters',
    items: [
      { path: '/prettify', label: 'JSON/YAML Prettifier' },
      { path: '/schema', label: 'Schema Validator' },
    ],
  },
  {
    title: 'Decoders',
    items: [
      { path: '/jwt', label: 'JWT Decoder' },
      { path: '/decode', label: 'String Decoder' },
    ],
  },
  {
    title: 'Converters',
    items: [
      { path: '/convert', label: 'JSON/YAML Converter' },
      { path: '/csv', label: 'CSV/JSON Converter' },
    ],
  },
  {
    title: 'Date & Time',
    items: [
      { path: '/epoch', label: 'Epoch Converter' },
      { path: '/cron', label: 'Cron Explainer' },
    ],
  },
];

const infoPages: NavItem[] = [
  { path: '/privacy', label: 'Privacy Guarantee' },
  { path: '/verify', label: 'How to Verify' },
];

function Layout() {
  const { theme, toggleTheme } = useTheme();
  const { width, isCollapsed, isResizing } = useSidebar();

  const sidebarClasses = `sidebar ${isCollapsed ? 'sidebar-collapsed' : ''} ${
    isResizing ? 'sidebar-resizing' : ''
  }`;

  const sidebarStyle = {
    width: isCollapsed ? '60px' : `${width}px`,
  };

  return (
    <div className="app-layout">
      <aside id="sidebar" className={sidebarClasses} style={sidebarStyle}>
        <div className="sidebar-header">
          <div className="sidebar-logo-wrapper">
            <Link to="/" className="sidebar-logo">
              Dev Utils
            </Link>
            <span className="privacy-badge">Offline</span>
          </div>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            )}
          </button>
        </div>

        <nav>
          {toolCategories.map(({ title, items }) => (
            <div className="nav-section" key={title}>
              <h3 className="nav-section-title">{title}</h3>
              <ul className="nav-list">
                {items.map(({ path, label }) => (
                  <li key={path}>
                    <NavLink
                      to={path}
                      className={({ isActive }) =>
                        `nav-link ${isActive ? 'active' : ''}`
                      }
                    >
                      <span className="nav-icon">{label.charAt(0)}</span>
                      <span className="nav-text">{label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="nav-section">
            <h3 className="nav-section-title">Info</h3>
            <ul className="nav-list">
              {infoPages.map(({ path, label }) => (
                <li key={path}>
                  <NavLink
                    to={path}
                    className={({ isActive }) =>
                      `nav-link ${isActive ? 'active' : ''}`
                    }
                  >
                    <span className="nav-icon">{label.charAt(0)}</span>
                    <span className="nav-text">{label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>
        <ResizeHandle />
      </aside>

      <SidebarToggle />

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
