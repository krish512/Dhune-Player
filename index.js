'use strict';

const electron = require('electron');
const url = require('url');
const fs = require('fs');
const path = require('path');

const { app, BrowserWindow, Menu, ipcMain } = electron;

process.env.NODE_ENV = 'debug';

let mainWindow;

// Listen for app to be ready
app.on('ready', () => {

    // Create a new window
    mainWindow = new BrowserWindow({
        backgroundColor: '#fff',
        height: 700,
        width: 1100,
        // frame: false,
        titleBarStyle: 'hidden',
        title: 'Dhune Player',
        resizable: false,
        show: false
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow.webContents.setZoomFactor(1)
        mainWindow.webContents.setZoomLevel(0)
        mainWindow.show()
    })

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'app/index.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Quit app when closed
    mainWindow.on('closed', () => {
        app.quit();
    })

    // Set menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);

    let songs = [];
    songs = walkSync("/Users/krishna/Music/");

    console.log(songs.length);
    ipcMain.on('songs:update', (event, msg) => {
        mainWindow.webContents.send('songs:update', songs);
    });
});

// Main Menu template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Quit',
                accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click() {
                    app.quit();
                }
            }
        ]
    }
];

// Add empty object to main menu if MacOS
if (process.platform === 'darwin') {
    mainMenuTemplate.unshift({});
}


// Devtools for debug purpose
if (process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle Devtools',
                accelerator: process.platform === 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    })
}


const walkSync = (dir, filelist = []) => {
    fs.readdirSync(dir).forEach(file => {

        filelist = fs.statSync(path.join(dir, file)).isDirectory()
            ? walkSync(path.join(dir, file), filelist)
            : filelist.concat(path.join(dir, file));

    });
    return filelist.filter((file) => { return (file.indexOf(".mp3") > -1) }).map((file) => { return path.basename(file); });
}