import { app, BrowserWindow, screen } from 'electron';
import * as path from 'path';
import * as child_process from 'child_process';
import * as process from 'process';
import * as os from 'os';
import * as fs from 'fs';

let win: BrowserWindow = null;
let serverPid: any = null;

const args = process.argv.slice(1);
const serve = args.some((val) => val === '--serve');

const serverBinary = path.join(process.resourcesPath, 'extraResources', 'main');

function createWindow(): BrowserWindow {
  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      allowRunningInsecureContent: serve ? true : false,
      contextIsolation: false, // false if you want to run 2e2 test with Spectron
      enableRemoteModule: true, // true if you want to run 2e2 test  with Spectron or use remote module in renderer context (ie. Angular)
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (serve) {
    win.webContents.openDevTools();

    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`),
    });
    win.loadURL('http://localhost:4200');
  } else {
    // win.loadURL(url.format({
    //   pathname: path.join(__dirname, '/dist/index.html'),
    //   protocol: 'file:',
    //   slashes: true
    // }));
    win.loadFile(path.join(__dirname, '/dist/index.html'));
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  return win;
}

const startBinary = () => {
  const tmpPath = path.join(os.tmpdir(), 'octant');
  fs.mkdir(path.join(tmpPath), { recursive: true }, (err) => {
    if (err) {
      throw err;
    }
  });

  const out = fs.openSync(path.join(tmpPath, 'api.out.log'), 'a');
  const err = fs.openSync(path.join(tmpPath, 'api.err.log'), 'a');

  const server = child_process.spawn(serverBinary, [], {
    env: { NODE_ENV: 'production', PATH: process.env.PATH },
    detached: true,
    stdio: ['ignore', out, err],
  });

  serverPid = server.pid;
  server.unref();
};

try {
  app.on('before-quit', () => {
    process.kill(serverPid, 'SIGHUP');
  });
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window.
  // More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => {
    startBinary();
    setTimeout(createWindow, 400);
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });
} catch (e) {
  // Catch Error
  // throw e;
}
