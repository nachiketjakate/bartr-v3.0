import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', background: '#fee2e2', color: '#991b1b', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>React Crashed! 💥</h1>
          <p style={{ fontSize: '1.2rem', marginTop: '1rem' }}>Please copy this exact error and paste it in the chat:</p>
          <pre style={{ background: '#7f1d1d', color: '#fca5a5', padding: '1rem', marginTop: '1rem', overflowX: 'auto', borderRadius: '8px' }}>
            {this.state.error && this.state.error.toString()}
            {'\n'}
            {this.state.error && this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootEl = document.getElementById('root');
if (!rootEl) {
  document.body.innerHTML = '<p style="padding:2rem;font-family:sans-serif">Root element #root not found.</p>';
} else {
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
}
