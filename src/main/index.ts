import { app, shell, BrowserWindow, ipcMain, dialog, Menu } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { promises as fs } from 'fs' // <-- Bulletproof File System import

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // --- 1. THE MENU TEMPLATE ---
  const template: any[] = [
    {
      label: 'File',
      submenu: [
        { 
          label: 'Open Graph (JSON)', 
          accelerator: 'CmdOrCtrl+O', 
          click: async () => {
            try {
              const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
                title: 'Open Flow Graph',
                properties: ['openFile'],
                filters: [{ name: 'Flow Graph', extensions: ['json'] }]
              })
          
              if (!canceled && filePaths.length > 0) {
                // Read the file directly here in the backend
                const content = await fs.readFile(filePaths[0], 'utf-8')
                // Send the raw text directly to React
                mainWindow.webContents.send('load-graph-data', content)
              }
            } catch (error) {
              console.error("Failed to open file natively:", error)
            }
          }
        },
        { 
          label: 'Save Graph (JSON)', 
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow.webContents.send('menu-command', 'save-as') 
        },
        { type: 'separator' },

        {
          label: 'Export to GameMaker (.gml)',
          click: () => { mainWindow.webContents.send('menu-command', 'export-gml'); }
        },
         
          { 
            label: 'Export to Harmony (.js)', 
            click: () => mainWindow.webContents.send('menu-command', 'export-js') 
          },
          { 
            label: 'Export to Maya (.py)', 
            click: () => mainWindow.webContents.send('menu-command', 'export-py') 
          },
          { 
            label: 'Export to Houdini (.py)', 
            click: () => mainWindow.webContents.send('menu-command', 'export-houdini') 
          },
          { 
            label: 'Export to C# (.cs)', 
            click: () => mainWindow.webContents.send('menu-command', 'export-cs') 
          },
          
          {
            label: 'Export Lua (Fusion)',
            click: () => { mainWindow.webContents.send('menu-command', 'export-lua'); }
          },
                    {
            label: 'Export Standard Python (.py)',
            click: () => { mainWindow.webContents.send('menu-command', 'export-py-std'); }
          },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' }, // Use this if we ever need to debug the UI!
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// --- 2. THE FILE WRITERS & READERS ---

// Save File
ipcMain.handle('save-as-dialog', async (event, { content, defaultName, filters }) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (!win) return false

  const { canceled, filePath } = await dialog.showSaveDialog(win, { // Attached to win!
    defaultPath: defaultName,
    filters
  })

  if (canceled || !filePath) return false

  await fs.writeFile(filePath, content)
  return true
})

// Open File
ipcMain.handle('open-file-dialog', async (event) => {
  try {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return null

    const { canceled, filePaths } = await dialog.showOpenDialog(win, { // Attached to win!
      title: 'Open Flow Graph',
      properties: ['openFile'],
      filters: [{ name: 'Flow Graph', extensions: ['json'] }]
    })

    if (canceled || filePaths.length === 0) return null

    const content = await fs.readFile(filePaths[0], 'utf-8')
    return content
  } catch (error) {
    console.error("Failed to open file:", error)
    return null
  }
})

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
  createWindow()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})