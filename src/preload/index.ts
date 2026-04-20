import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for FlowPins
const api = {
  // 1. Sending the graph to the compiler
  exportGraph: (graphData: any) => ipcRenderer.invoke('run-compiler', graphData),

  // 2. Listening for messages coming BACK from Python/Main process
  // This passes the message to a function (callback) in your React UI
  onLog: (callback: (message: string) => void) => {
    // Listen for the 'compiler-log' channel
    ipcRenderer.on('compiler-log', (_event, value) => callback(value))
  }
}

// Use `contextBridge` to expose these functions to the "window.api" object in React
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (for development fallback)
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}