'use strict';

const electron = require('electron');
const url = require('url');
const fs = require('fs');
const path = require('path');
const jsmediatags = require("jsmediatags");

const { app, BrowserWindow, Menu, ipcMain, globalShortcut } = electron;

const config = require('./config');
const utils = require('./utils/index');
const { id3Tags } = utils;

let mainWindow;

const isSecondInstance = app.makeSingleInstance((commandLine, workingDirectory) => {
    // If tried to load a second instance, we should focus our window.
    if (mainWindow) {
        if (mainWindow.isMinimized()) { mainWindow.restore(); }
        mainWindow.focus();
    }
});

if (isSecondInstance) {
    app.quit();
}

// Listen for app to be ready
app.on('ready', () => {

    // Global shortcut for play/pause
    globalShortcut.register('MediaPlayPause', () => {
        mainWindow.webContents.send('controls:playToggle');
    });

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

    if (fs.existsSync(app.getPath('userData') + config.dataFile)) {
        console.log("dataFile exists");
    }
    else {
        mainWindow.show();
        let songFiles = walkSync(app.getPath('music')).splice(0, 100);
        songFiles.forEach((songFile, i) => {
            id3Tags.getSongsTags(songFile).then((songTags) => {
                mainWindow.webContents.send('songs:add', songTags);
                // console.log(i);
            });
        });

        console.log(songFiles.length);
    }

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
if (config.debug) {
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
    return filelist.filter((file) => { return (file.indexOf(".mp3") > -1) });
}