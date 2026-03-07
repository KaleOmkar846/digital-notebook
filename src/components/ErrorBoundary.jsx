import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          color: "var(--text-muted)",
        }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
              Preview failed to render
            </p>
            <p style={{ fontSize: 13 }}>
              Check your markdown for syntax errors.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              style={{
                marginTop: 12,
                padding: "6px 16px",
                border: "1px solid var(--border-color)",
                borderRadius: 6,
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
