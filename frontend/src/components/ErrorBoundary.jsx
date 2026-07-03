// A small error boundary so one misbehaving renderer degrades to a compact
// notice instead of blanking the whole app (React unmounts the entire tree on
// an uncaught render error). Wrap each variable renderer and the stage tabs.

import { Component } from "react";
import { Icon } from "./ui";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Surface it in dev; never crash the app.
    // eslint-disable-next-line no-console
    console.error("Renderer error:", this.props.label || "", error, info);
  }

  componentDidUpdate(prevProps) {
    // Recover automatically when the thing we're rendering changes (e.g. the
    // user scrubs to a different step).
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback(this.state.error);
      return (
        <div className="px-4 py-3 flex items-center gap-2 text-2xs text-danger">
          <Icon name="x" size={14} />
          <span className="truncate">
            {this.props.label ? this.props.label + ": " : ""}
            couldn&apos;t render ({String(this.state.error.message || this.state.error).slice(0, 80)})
          </span>
        </div>
      );
    }
    return this.props.children;
  }
}
