import { Component, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('[ErrorBoundary]', error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                    <div className="bg-slate-800/80 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-slate-700 text-center">
                        <div className="text-5xl mb-4">:(</div>
                        <h1 className="text-xl font-bold text-white mb-2">Something went wrong</h1>
                        <p className="text-slate-400 mb-6">An unexpected error occurred.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg px-6 py-3 hover:opacity-90 transition-opacity"
                        >
                            Reload
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
