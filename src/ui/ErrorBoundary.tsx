import React from 'react';

interface Props {
  children: React.ReactNode;
}
interface State {
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, color: '#ff8a8a', fontFamily: 'monospace', fontSize: 13, whiteSpace: 'pre-wrap' }}>
          <b>渲染错误：</b>
          {String(this.state.error?.message)}
          {'\n\n'}
          {String(this.state.error?.stack)}
        </div>
      );
    }
    return this.props.children;
  }
}
