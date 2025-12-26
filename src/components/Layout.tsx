import { Outlet, NavLink, Link } from 'react-router-dom';

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
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo">
            Dev Utils
            <span className="privacy-badge">Offline</span>
          </Link>
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
                      {label}
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
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
