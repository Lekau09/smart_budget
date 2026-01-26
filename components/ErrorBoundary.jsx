import React from 'react';

export default class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 m-4 bg-red-50 rounded-lg">
          <h2 className="text-red-800 font-bold">Something went wrong</h2>
          <pre className="mt-2 text-red-600 text-sm">{this.state.error?.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
