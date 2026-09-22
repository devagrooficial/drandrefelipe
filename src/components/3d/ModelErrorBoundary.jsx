import { Component } from "react";

/**
 * Catches load failures from useGLTF (e.g. /knee.glb not deployed yet)
 * so the hero never renders a blank canvas or crashes the island.
 */
export default class ModelErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.warn("[KneeModel] falling back to placeholder:", error?.message ?? error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}
