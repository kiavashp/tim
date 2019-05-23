'use strict';

const EventEmitter = require('events');

module.exports = function(app, shell) {
	const events = new EventEmitter();
	const bind = (eventName) => {
		return (menuItem, browserWindow, event) => {
            event.preventDefault = () => event.defaultPrevented = true;
			events.emit(eventName, browserWindow, event);
            if (browserWindow && !event.defaultPrevented) {
                browserWindow.webContents.send(eventName);
            }
		};
	};
	const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Toggle Timer',
                    accelerator: 'Ctrl+Space',
                    click: bind('toggle-timer')
                },
                {
                    label: 'Cancel Timer',
                    accelerator: 'Ctrl+C',
                    click: bind('cancel-timer')
                }
            ]
        },
		{
			label: 'Edit',
			submenu: [
				{
					label: 'Undo',
					accelerator: 'CmdOrCtrl+Z',
					role: 'undo'
				},
				{
					label: 'Redo',
					accelerator: 'Shift+CmdOrCtrl+Z',
					role: 'redo'
				},
				{
					type: 'separator'
				},
				{
					label: 'Cut',
					accelerator: 'CmdOrCtrl+X',
					role: 'cut'
				},
				{
					label: 'Copy',
					accelerator: 'CmdOrCtrl+C',
					role: 'copy'
				},
				{
					label: 'Paste',
					accelerator: 'CmdOrCtrl+V',
					role: 'paste'
				},
				{
					label: 'Select All',
					accelerator: 'CmdOrCtrl+A',
					role: 'selectall'
				}
			]
		},
		{
			label: 'View',
			submenu: [
				{
					label: 'Toggle Reports',
					accelerator: 'CmdOrCtrl+\\',
					click: bind('toggle-reports')
				},
				{
					label: 'Toggle Full Screen',
					accelerator: process.platform === 'darwin' ? 'Ctrl+Command+F' : 'F11',
					click: function(item, focusedWindow) {
						if (focusedWindow) {
							focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
						}
					}
				},
				{
					label: 'Toggle Developer Tools',
					accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
					click: function(item, focusedWindow) {
						if (focusedWindow)
						focusedWindow.toggleDevTools();
					}
				}
			]
		},
		{
			label: 'Window',
			role: 'window',
			submenu: [
				{
					label: 'Toggle Mini Player',
					accelerator: 'CmdOrCtrl+Shift+M',
					click: bind('toggle-window-mode')
				},
				{
					label: 'Minimize',
					accelerator: 'CmdOrCtrl+M',
					role: 'minimize'
				},
				{
					label: 'Close',
					accelerator: 'CmdOrCtrl+W',
					role: 'close'
				}
			]
		},
		{
			label: 'Help',
			role: 'help',
			submenu: [
				{
					label: 'Learn More',
					click: function() { shell.openExternal('https://electronjs.org') }
				}
			]
		}
	];

	if (process.platform === 'darwin') {
		const name = app.getName();
		template.unshift({
			label: name,
			submenu: [
				{
					label: 'About ' + name,
					role: 'about'
				},
				{
					type: 'separator'
				},
				{
					label: 'Services',
					role: 'services',
					submenu: []
				},
				{
					type: 'separator'
				},
				{
					label: 'Hide ' + name,
					accelerator: 'Command+H',
					role: 'hide'
				},
				{
					label: 'Hide Others',
					accelerator: 'Command+Shift+H',
					role: 'hideothers'
				},
				{
					label: 'Show All',
					role: 'unhide'
				},
				{
					type: 'separator'
				},
				{
					label: 'Quit',
					accelerator: 'Command+Q',
					click: function() { app.quit(); }
				}
			]
		});

		const windowMenu = template.find(function(m) { return m.role === 'window' });
		if (windowMenu) {
			windowMenu.submenu.push(
				{
					type: 'separator'
				},
				{
					label: 'Bring All to Front',
					role: 'front'
				}
			);
		}
	};

	return {template, events};
};
