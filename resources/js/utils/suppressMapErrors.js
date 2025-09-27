// Suppress harmless Google Maps DOM manipulation errors and browser extension errors
const originalError = console.error;
const originalWarn = console.warn;

// Override console.error to filter out browser extension and Maps errors
console.error = function(...args) {
  // Convert all arguments to string to catch any type
  const errorString = args.map(arg => {
    if (typeof arg === 'string') return arg;
    if (arg && typeof arg === 'object') {
      try {
        return JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    }
    return String(arg);
  }).join(' ');

  // Check for extension and maps errors - more comprehensive patterns
  const suppressPatterns = [
    'removeChild',
    'insertBefore',
    'Node.*not a child',
    'above error occurred.*MapErrorBoundary',
    'React will try to recreate',
    'runtime\\.lastError',
    'extension port',
    'back/forward cache',
    'message channel is closed',
    'Unchecked runtime\\.lastError',
    'Extension context invalidated',
    'Could not establish connection',
    'message port closed before a response was received',
    'chrome\\.runtime',
    'browser\\.runtime',
    'manifest\\.json',
    'Extension.*disconnected',
    'The page keeping the extension port is moved into back/forward cache',
    'No tab with id:',
    'extension port is moved into back/forward cache'
  ];

  // Check if error matches any suppression pattern
  const shouldSuppress = suppressPatterns.some(pattern => {
    const regex = new RegExp(pattern, 'i');
    return regex.test(errorString);
  });

  // Also check first argument directly for common extension errors
  if (args[0] && typeof args[0] === 'string') {
    const firstArg = args[0].toLowerCase();
    if (firstArg.includes('unchecked runtime.lasterror') ||
        firstArg.includes('extension') ||
        firstArg.includes('chrome.runtime') ||
        firstArg.includes('browser.runtime')) {
      return;
    }
  }

  if (shouldSuppress) {
    // Suppress these harmless errors
    return;
  }

  // Log all other errors normally
  originalError.apply(console, args);
};

// Also suppress browser extension errors globally
console.warn = function(...args) {
  const warnString = args.map(arg => {
    if (typeof arg === 'string') return arg;
    if (arg && typeof arg === 'object') {
      try {
        return JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    }
    return String(arg);
  }).join(' ');

  // Use same suppression patterns as console.error
  const suppressPatterns = [
    'runtime\\.lastError',
    'extension port',
    'back/forward cache',
    'message channel is closed',
    'Unchecked runtime\\.lastError',
    'Extension context invalidated',
    'Could not establish connection',
    'message port closed before a response was received',
    'chrome\\.runtime',
    'browser\\.runtime',
    'manifest\\.json',
    'Extension.*disconnected',
    'The page keeping the extension port is moved into back/forward cache',
    'No tab with id:',
    'extension port is moved into back/forward cache'
  ];

  const shouldSuppress = suppressPatterns.some(pattern => {
    const regex = new RegExp(pattern, 'i');
    return regex.test(warnString);
  });

  if (shouldSuppress) {
    // Suppress these harmless warnings
    return;
  }

  // Log all other warnings normally
  originalWarn.apply(console, args);
};

// Handle browser extension messages that might log to console
if (typeof window !== 'undefined') {
  // Override console methods to filter extension errors
  const originalLog = console.log;
  console.log = function(...args) {
    const logString = args.map(arg => {
      if (typeof arg === 'string') return arg;
      if (arg && typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');

    // Use same suppression patterns as console.error
    const suppressPatterns = [
      'runtime\\.lastError',
      'extension port',
      'back/forward cache',
      'message channel is closed',
      'Unchecked runtime\\.lastError',
      'Extension context invalidated',
      'Could not establish connection',
      'message port closed before a response was received',
      'chrome\\.runtime',
      'browser\\.runtime',
      'manifest\\.json',
      'Extension.*disconnected',
      'The page keeping the extension port is moved into back/forward cache',
      'No tab with id:',
      'extension port is moved into back/forward cache'
    ];

    const shouldSuppress = suppressPatterns.some(pattern => {
      const regex = new RegExp(pattern, 'i');
      return regex.test(logString);
    });

    if (shouldSuppress) {
      // Suppress these harmless logs
      return;
    }

    // Log all other messages normally
    originalLog.apply(console, args);
  };
}

export default {};