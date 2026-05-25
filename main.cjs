const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      contextIsolation: true,
    },
  });

  // 👇 CAMINHO CORRETO PARA PRODUÇÃO (.exe)
  const startUrl = path.join(__dirname, 'dist', 'index.html');

  win.loadFile(startUrl);

  // Debug (opcional)
  win.webContents.openDevTools();
}

app.whenReady().then(createWindow);