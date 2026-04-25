import { Component, type ErrorInfo, type ReactNode } from "react";
import { ErrorState } from "./ErrorState";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <ErrorState
          message={`Something went wrong: ${this.state.error.message}`}
          onRetry={this.reset}
        />
      );
    }
    return this.props.children;
  }
}
