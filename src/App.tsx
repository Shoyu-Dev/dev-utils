import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import PrivacyGuarantee from './pages/PrivacyGuarantee';
import HowToVerify from './pages/HowToVerify';

// Tool imports
import DiffChecker from './tools/DiffChecker';
import RegexTester from './tools/RegexTester';
import JsonYamlPrettifier from './tools/JsonYamlPrettifier';
import SchemaValidator from './tools/SchemaValidator';
import JwtDecoder from './tools/JwtDecoder';
import EncodedStringDecoder from './tools/EncodedStringDecoder';
import JsonYamlConverter from './tools/JsonYamlConverter';
import CsvJsonConverter from './tools/CsvJsonConverter';
import EpochConverter from './tools/EpochConverter';
import CronExplainer from './tools/CronExplainer';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="privacy" element={<PrivacyGuarantee />} />
        <Route path="verify" element={<HowToVerify />} />

        {/* Tools */}
        <Route path="diff" element={<DiffChecker />} />
        <Route path="regex" element={<RegexTester />} />
        <Route path="prettify" element={<JsonYamlPrettifier />} />
        <Route path="schema" element={<SchemaValidator />} />
        <Route path="jwt" element={<JwtDecoder />} />
        <Route path="decode" element={<EncodedStringDecoder />} />
        <Route path="convert" element={<JsonYamlConverter />} />
        <Route path="csv" element={<CsvJsonConverter />} />
        <Route path="epoch" element={<EpochConverter />} />
        <Route path="cron" element={<CronExplainer />} />
      </Route>
    </Routes>
  );
}

export default App;
