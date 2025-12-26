import { Link } from 'react-router-dom';

interface ToolInfo {
  path: string;
  icon: string;
  title: string;
  description: string;
}

interface ToolCategory {
  name: string;
  tools: ToolInfo[];
}

const toolCategories: ToolCategory[] = [
  {
    name: 'Text Tools',
    tools: [
      {
        path: '/diff',
        icon: '⚖️',
        title: 'Diff Checker',
        description: 'Compare two texts and highlight differences',
      },
      {
        path: '/regex',
        icon: '🔍',
        title: 'Regex Tester',
        description: 'Test regular expressions with real-time matching',
      },
    ],
  },
  {
    name: 'Formatters',
    tools: [
      {
        path: '/prettify',
        icon: '✨',
        title: 'JSON/YAML Prettifier',
        description: 'Format and beautify JSON or YAML data',
      },
      {
        path: '/schema',
        icon: '📋',
        title: 'Schema Validator',
        description: 'Validate JSON/YAML against schemas',
      },
    ],
  },
  {
    name: 'Decoders',
    tools: [
      {
        path: '/jwt',
        icon: '🔐',
        title: 'JWT Decoder',
        description: 'Decode and inspect JWT tokens',
      },
      {
        path: '/decode',
        icon: '🔓',
        title: 'String Decoder',
        description: 'Decode Base64, URL, Hex, and more',
      },
    ],
  },
  {
    name: 'Converters',
    tools: [
      {
        path: '/convert',
        icon: '🔄',
        title: 'JSON/YAML Converter',
        description: 'Convert between JSON and YAML formats',
      },
      {
        path: '/csv',
        icon: '📊',
        title: 'CSV/JSON Converter',
        description: 'Convert between CSV and JSON formats',
      },
    ],
  },
  {
    name: 'Date & Time',
    tools: [
      {
        path: '/epoch',
        icon: '⏰',
        title: 'Epoch Converter',
        description: 'Convert timestamps to human-readable dates',
      },
      {
        path: '/cron',
        icon: '📅',
        title: 'Cron Explainer',
        description: 'Understand cron expressions in plain English',
      },
    ],
  },
];

function Home() {
  return (
    <div className="home-container">
      <div className="home-hero">
        <h1 className="home-title">Dev Utils</h1>
        <p className="home-subtitle">
          Privacy-first developer tools that run entirely in your browser.
          No data ever leaves your machine.
        </p>
      </div>

      {toolCategories.map(({ name, tools }) => (
        <div key={name} className="tool-category">
          <h2 className="category-title">{name}</h2>
          <div className="tools-grid">
            {tools.map(({ path, icon, title, description }) => (
              <Link to={path} key={path} className="tool-card">
                <div className="tool-card-icon">{icon}</div>
                <h3 className="tool-card-title">{title}</h3>
                <p className="tool-card-desc">{description}</p>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Home;
