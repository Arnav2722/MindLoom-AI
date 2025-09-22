import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
          <div className="max-w-md w-full bg-background brutal-border brutal-shadow p-8 text-center space-y-6">
            <div className="bg-destructive brutal-border p-4 mx-auto w-fit">
              <AlertTriangle className="w-12 h-12 text-destructive-foreground" />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-2xl font-black uppercase">Something Went Wrong</h1>
              <p className="text-sm font-bold text-muted-foreground">
                The application encountered an unexpected error. Please try refreshing the page.
              </p>
            </div>
            
            <Button 
              variant="brutal" 
              onClick={() => window.location.reload()}
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}