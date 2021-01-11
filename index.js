'use strict';

const electron = require('electron');
const {app, BrowserWindow, Menu, Tray, shell, ipcMain, systemPreferences} = electron;
const buildMenu = require(`${__dirname}/lib/menu`);

let context = {
    mainWindow: null
};
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

	context.mainWindow = new BrowserWindow({
        width,
        height,
        minWidth,
        minHeight,
        x: screen.width - width - padding,
        y: screen.height - height - padding,
        acceptFirstMouse: true,
        fullscreenable: false,
        frame: false,
        show: false,
        vibrancy: 'dark',
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    });
    context.mainWindow.once('ready-to-show', () => {
        setState({}, context.mainWindow.webContents);
        context.mainWindow.show();
    });
    context.mainWindow.on('resized', () => {
        if (state.miniPlayerMode) {
            const bounds = context.mainWindow.getBounds();

            if (bounds.height < 130) {
                context.mainWindow.setBounds({height: 76}, true);
            } else if (bounds.height < 220) {
                context.mainWindow.setBounds({height: 220}, true);
            }
        }
    });
	context.mainWindow.loadFile('static/index.html');
	context.mainWindow.once('closed', () => context.mainWindow = null);
}

function setState(change, webContents=context.mainWindow.webContents) {
    Object.assign(state, change);
    webContents.send('set-state', state);
}

function toggleWindowMode(webContents=context.mainWindow.webContents) {
    const enabled = !state.miniPlayerMode;

    setState({
        miniPlayerMode: enabled
    }, webContents);

    if (enabled) {
        context.mainWindow.setMinimumSize(280, 76);
        context.mainWindow.setMaximumSize(500, 10e3);
        context.mainWindow.setSize(280, 76);
    } else {
        const {width, height, minWidth, minHeight} = defaultSize();
        context.mainWindow.setMinimumSize(minWidth, minHeight);
        context.mainWindow.setMaximumSize(10e3, 10e3);
        context.mainWindow.setSize(width, height);
    }
}

app.on('ready', () => {
    const {menuTemplate, trayTemplate, events} = buildMenu(app, shell, context);
    Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));

    const tray = new Tray(`${__dirname}/static/assets/tray-icon-Template.png`);

    tray.on('click', () => {
        if (!context.mainWindow) {
            createWindow();
        }
        tray.popUpContextMenu(Menu.buildFromTemplate(trayTemplate));
    });

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

    ipcMain.on('timer-start', (event) => {
        trayTemplate[0].label = 'Stop Timer';
        trayTemplate[1].visible = true;
    });

    ipcMain.on('timer-stop', (event) => {
        trayTemplate[0].label = 'Start Timer';
        trayTemplate[1].visible = false;
    });

    ipcMain.on('update-timer', (event, timerString) => {
        tray.setTitle(timerString ? ` ${timerString}` : '');
    });
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (context.mainWindow === null) {
		createWindow();
	}
});
