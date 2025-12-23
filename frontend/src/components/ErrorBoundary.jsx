import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--error-muted)' }}>
              <AlertTriangle size={32} style={{ color: 'var(--error)' }} />
            </div>
            
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Something went wrong
            </h1>
            
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              We've encountered an unexpected error. Please try refreshing the page or return to the dashboard.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 p-4 rounded-lg text-left text-sm overflow-auto" style={{ 
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-default)',
                maxHeight: '200px'
              }}>
                <p className="font-mono text-xs" style={{ color: 'var(--error)' }}>
                  {this.state.error.toString()}
                </p>
                <pre className="mt-2 text-xs opacity-70" style={{ color: 'var(--text-tertiary)' }}>
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="btn-primary inline-flex items-center gap-2"
            >
              <RefreshCw size={18} />
              Return to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
