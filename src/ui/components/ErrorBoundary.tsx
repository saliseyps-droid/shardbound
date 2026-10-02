import { Component, type ErrorInfo, type ReactNode } from 'react';
import { t } from '@/i18n';

interface Props {
  children: ReactNode;
  /** Changing the key resets the boundary (e.g. on navigation). */
  resetKey?: string;
  fallbackTitle?: string;
}

interface State {
  error: Error | null;
}

/** Keeps one broken screen from taking down the whole application. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ui] screen crashed', error, info.componentStack);
  }

  componentDidUpdate(prev: Props) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="panel error-panel" role="alert">
        <h3>{this.props.fallbackTitle ?? t('This screen ran into a problem')}</h3>
        <p className="muted">{t('Your progress is saved. Try again, or return to the home screen.')}</p>
        <pre className="error-detail">{this.state.error.message}</pre>
        <div className="modal-actions">
          <button className="btn" onClick={() => this.setState({ error: null })}>
            {t('Try again')}
          </button>
          <a className="btn btn-primary" href="#/">
            {t('Go home')}
          </a>
        </div>
      </div>
    );
  }
}
