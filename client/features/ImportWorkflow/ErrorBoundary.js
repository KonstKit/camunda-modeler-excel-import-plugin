import React from 'react';
import { useNotifications } from '../Notifications/NotificationSystem';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Import workflow error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          error={this.state.error}
          onReset={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error, onReset }) => {
  const { addNotification } = useNotifications();

  React.useEffect(() => {
    addNotification('An unexpected error occurred. Please try again.', 'error');
  }, []);

  return (
    <div className="error-fallback">
      <h3>Something went wrong</h3>
      <p>{error.message}</p>
      <button onClick={onReset}>Try Again</button>
    </div>
  );
};
