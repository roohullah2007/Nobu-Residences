import React from 'react';

class MapErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorCount: 0 };
  }

  static getDerivedStateFromError(error) {
    // Completely ignore DOM manipulation errors
    if (error?.message?.includes('removeChild') || 
        error?.message?.includes('insertBefore') ||
        error?.message?.includes('Node') ||
        error?.message?.includes('DOM')) {
      // Don't update state for these harmless errors
      return null;
    }
    // For other errors, show fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Silently ignore DOM manipulation errors
    if (error?.message?.includes('removeChild') || 
        error?.message?.includes('insertBefore') ||
        error?.message?.includes('Node') ||
        error?.message?.includes('DOM')) {
      // These are harmless errors from Google Maps + React HMR
      // Don't log them
      return;
    }
    
    // Log other errors
    if (import.meta.env.DEV) {
      console.error('Map Error:', error, errorInfo);
    }
  }
  
  componentDidUpdate(prevProps, prevState) {
    // Reset error state when switching views
    if (this.state.hasError && prevProps.children !== this.props.children) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="w-full h-full bg-gray-100 rounded-lg border flex items-center justify-center">
          <div className="text-center p-8">
            <div className="text-gray-500 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Map temporarily unavailable</h3>
            <p className="text-sm text-gray-600">Please refresh the page</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default MapErrorBoundary;