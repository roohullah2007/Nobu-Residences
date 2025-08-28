// Suppress harmless Google Maps DOM manipulation errors in development
if (import.meta.env.DEV) {
  const originalError = console.error;
  
  console.error = function(...args) {
    // Check if this is a Google Maps DOM manipulation error
    const errorString = args.join(' ');
    
    if (
      errorString.includes('removeChild') ||
      errorString.includes('insertBefore') ||
      errorString.includes('Node') && errorString.includes('not a child') ||
      errorString.includes('above error occurred') && errorString.includes('MapErrorBoundary') ||
      errorString.includes('React will try to recreate')
    ) {
      // Suppress these harmless errors
      return;
    }
    
    // Log all other errors normally
    originalError.apply(console, args);
  };
}

export default {};