"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
var path = require("path");
var child_process = require("child_process");
var process = require("process");
var os = require("os");
var fs = require("fs");
var win = null;
var serverPid = null;
var args = process.argv.slice(1);
var local = args.some(function (val) { return val === '--local'; });
function createWindow() {
    var electronScreen = electron_1.screen;
    var size = electronScreen.getPrimaryDisplay().workAreaSize;
    // Create the browser window.
    win = new electron_1.BrowserWindow({
        x: 0,
        y: 0,
        width: size.width,
        height: size.height,
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false,
            allowRunningInsecureContent: true,
            contextIsolation: false,
            enableRemoteModule: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });
    if (local) {
        win.webContents.openDevTools();
    }
    win.loadFile(path.join(__dirname, '/dist/index.html'));
    // Emitted when the window is closed.
    win.on('closed', function () {
        // Dereference the window object, usually you would store window
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });
    return win;
}
var startBinary = function () {
    var tmpPath = path.join(os.tmpdir(), 'octant');
    fs.mkdir(path.join(tmpPath), { recursive: true }, function (err) {
        if (err) {
            throw err;
        }
    });
    var out = fs.openSync(path.join(tmpPath, 'api.out.log'), 'a');
    var err = fs.openSync(path.join(tmpPath, 'api.err.log'), 'a');
    var serverBinary;
    if (local) {
        serverBinary = path.join(__dirname, 'extraResources', 'main');
    }
    else {
        serverBinary = path.join(process.resourcesPath, 'extraResources', 'main');
    }
    var server = child_process.spawn(serverBinary, [], {
        env: { NODE_ENV: 'production', PATH: process.env.PATH },
        detached: true,
        stdio: ['ignore', out, err]
    });
    serverPid = server.pid;
    server.unref();
};
try {
    electron_1.app.on('before-quit', function () {
        process.kill(serverPid, 'SIGHUP');
    });
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    // Added 400 ms to fix the black background issue while using transparent window.
    // More detais at https://github.com/electron/electron/issues/15947
    electron_1.app.on('ready', function () {
        startBinary();
        setTimeout(createWindow, 400);
    });
    // Quit when all windows are closed.
    electron_1.app.on('window-all-closed', function () {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            electron_1.app.quit();
        }
    });
    electron_1.app.on('activate', function () {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (win === null) {
            createWindow();
        }
    });
}
catch (e) {
    // Catch Error
    // throw e;
}
