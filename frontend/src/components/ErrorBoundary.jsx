import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service here
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
            <h2 className="text-xl font-bold text-red-600 mb-4">Fehler aufgetreten</h2>
            <div className="text-gray-700 mb-4">
              Die Anwendung hat einen unerwarteten Fehler festgestellt.
            </div>
            <div className="text-sm text-gray-500 mb-4">
              <strong> Fehler:</strong> {this.state.error && this.state.error.toString()}
            </div>
            <div className="space-y-2">
              <button 
                onClick={() => window.location.reload()} 
                className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Seite neu laden
              </button>
              <button 
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })} 
                className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Weiter
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;