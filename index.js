'use strict';

const electron = require('electron');
const {app, BrowserWindow, Menu, shell, ipcMain} = electron;
const defaultMenu = require('electron-default-menu');

let mainWindow;
let miniPlayerMode = false;

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
        if (miniPlayerMode) {
            setMiniPlayer(mainWindow.webContents, miniPlayerMode);
        }
        mainWindow.show();
    });
	mainWindow.loadFile('static/index.html');
	mainWindow.once('closed', () => mainWindow = null);
}

function setMiniPlayer(webContents, enabled) {
    miniPlayerMode = enabled;
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
    webContents.send('set-state', {
        miniPlayerMode
    });
}

app.on('ready', () => {
    const menu = defaultMenu(app, shell);
    menu.forEach(m => {
        if (m.label === 'View') {
            m.submenu = m.submenu.filter(s => {
                return s.label !== 'Reload';
            });
        }
    })
    Menu.setApplicationMenu(Menu.buildFromTemplate(menu));

    createWindow();

    ipcMain.on('close', (event, enabled) => {
        const window = BrowserWindow.fromWebContents(event.sender);
        window.close();
    });

    ipcMain.on('toggle-window-mode', (event) => {
        setMiniPlayer(event.sender, !miniPlayerMode);
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
