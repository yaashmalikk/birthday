import React, { Component, ErrorInfo, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "./pages/Home";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B0C1E] text-slate-100 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md rounded-3xl border border-pink-500/20 bg-[#151632]/80 p-8 backdrop-blur-xl shadow-[0_8px_32px_rgba(255,117,143,0.15)]">
            <span className="text-5xl">🎂</span>
            <h2 className="mt-4 text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm text-pink-200/70">
              {this.state.error?.message || "An unexpected error occurred while loading the celebration."}
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-2.5 font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                Reload Page 🔄
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="rounded-full border border-pink-500/30 px-6 py-2 text-xs font-medium text-pink-300 hover:bg-pink-500/10 transition-colors"
              >
                Reset Saved State &amp; Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Home />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
