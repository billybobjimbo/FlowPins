/// <reference types="vite/client" />
export {}
declare module '*.css';
declare global {
  interface Window {
    // This tells TypeScript that "api" exists on the window object
    api: {
      
      exportGraph: (graphData: any) => Promise<{ success: boolean; error?: string }>;
      onLog: (callback: (message: string) => void) => void;
    }
  }
}