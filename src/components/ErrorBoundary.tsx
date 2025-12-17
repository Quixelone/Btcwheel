import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "./ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-lg w-full text-white">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Si è verificato un errore</h1>
            <p className="mb-4 text-gray-300">
              L'applicazione ha riscontrato un problema imprevisto.
            </p>
            
            <div className="bg-gray-950 p-4 rounded border border-gray-700 mb-6 overflow-auto max-h-60 text-sm font-mono text-red-300">
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Ricarica Pagina
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="border-gray-600 hover:bg-gray-700"
              >
                Reset Totale
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
