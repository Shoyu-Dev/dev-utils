import '@testing-library/jest-dom';

// Mock TextEncoder/TextDecoder for Node.js environment
if (typeof TextEncoder === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const util = require('util');
  global.TextEncoder = util.TextEncoder;
  global.TextDecoder = util.TextDecoder;
}
