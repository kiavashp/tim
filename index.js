'use strict';

const electron = require('electron');
const {app, BrowserWindow, Menu, shell, ipcMain} = electron;
const buildMenu = require(`${__dirname}/lib/menu`);

let mainWindow;
let state = {
    miniPlayerMode: false,
    reportsOpen: false
};

function defaultSize() {
    return {
        width: 520,
        height: 460,
        minWidth: 520,
        minHeight: 380
    };
};

function createWindow() {
    const screen = electron.screen.getPrimaryDisplay().bounds;
    const {width, height, minWidth, minHeight} = defaultSize();
    const padding = 20;

	mainWindow = new BrowserWindow({
        width,
        height,
        minWidth,
        minHeight,
        x: screen.width - width - padding,
        y: screen.height - height - padding,
        acceptFirstMouse: true,
        fullscreenable: false,
        frame: false,
        show: false
    });
    mainWindow.once('ready-to-show', () => {
        setState({}, mainWindow.webContents);
        mainWindow.show();
    });
	mainWindow.loadFile('static/index.html');
	mainWindow.once('closed', () => mainWindow = null);
}

function setState(change, webContents=mainWindow.webContents) {
    Object.assign(state, change);
    webContents.send('set-state', state);
}

function toggleWindowMode(webContents=mainWindow.webContents) {
    const enabled = !state.miniPlayerMode;

    setState({
        miniPlayerMode: enabled
    }, webContents);

    if (enabled) {
        mainWindow.setMinimumSize(280, 76);
        mainWindow.setMaximumSize(500, 76);
        mainWindow.setSize(280, 76);
    } else {
        const {width, height, minWidth, minHeight} = defaultSize();
        mainWindow.setMinimumSize(minWidth, minHeight);
        mainWindow.setMaximumSize(10e3, 10e3);
        mainWindow.setSize(width, height);
    }
}

app.on('ready', () => {
    const {template, events} = buildMenu(app, shell, state, setState);
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));

    events.on('toggle-reports', (browserWindow, event) => {
        event.preventDefault();
        if (browserWindow) {
            setState({reportsOpen: !state.reportsOpen}, browserWindow.webContents);
        }
    });

    events.on('toggle-window-mode', (browserWindow, event) => {
        event.preventDefault();
        if (browserWindow) {
            toggleWindowMode(browserWindow.webContents);
        }
    });

    createWindow();

    ipcMain.on('close', (event, enabled) => {
        const window = BrowserWindow.fromWebContents(event.sender);
        window.close();
    });

    ipcMain.on('toggle-window-mode', (event) => {
        toggleWindowMode(event.sender);
    });
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (mainWindow === null) {
		createWindow();
	}
});
