import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  // @ts-ignore
  state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in RixVisuals app:', error, errorInfo);
  }

  public render() {
    // @ts-ignore
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white text-neutral-900 flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md space-y-6">
            <h1 className="text-2xl font-black tracking-widest uppercase">RIXVISUALS</h1>
            <p className="text-sm text-neutral-600 leading-relaxed font-light">
              Something went wrong loading this view. Please click below to reload the portfolio.
            </p>
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 text-xs font-mono text-neutral-500 overflow-auto text-left max-h-32">
              {/* @ts-ignore */}
              {this.state.error?.toString() || 'Unknown error'}
            </div>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="bg-black text-white text-xs font-bold font-mono uppercase tracking-widest px-8 py-3 rounded-full hover:bg-neutral-800 transition-all cursor-pointer"
            >
              Reset & Reload Website
            </button>
          </div>
        </div>
      );
    }

    // @ts-ignore
    return this.props.children;
  }
}
