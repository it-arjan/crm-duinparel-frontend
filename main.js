//import { app, BrowserWindow, ipcMain } from 'electron';
//import * as path from 'path';
//import * as url from 'url';
//import * as fs from 'fs';
//import * as sqlite3 from 'sqlite3';
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const url = require("url");
const fs = require("fs");
const sqlite3 = require('sqlite3');
//const electron = require("electron")
// Enable live reload for all the files inside your project directory
// require('electron-reload')(__dirname, {
//   electron: path.join(__dirname, 'node_modules', '.bin', 'electron.cmd', ),
//   hardResetMethod: 'exit'
// });
let win, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');
function createWindow() {
    win = new BrowserWindow({ width: 1200, height: 600 });
    win.loadURL(`http://localhost:4200/index.html`);
    if (serve) { // load url from ng serve
        win.loadURL('http://localhost:4200');
    }
    else { //load index.html from file system
        win.loadURL(url.format({
            pathname: path.join(__dirname, `/dist/index.html`),
            protocol: "file:",
            slashes: true
        }));
    }
    // The following is optional and will open the DevTools:
    win.webContents.openDevTools();
    win.on("closed", () => {
        win = null;
    });
}
app.on("ready", createWindow);
// callback code
ipcMain.on("CreateDb", (event, arg) => {
    let db = new sqlite3.Database('data/Duinparel-Crm.db');
    let i = 0;
    db.serialize(() => {
        //db.run("CREATE TABLE Products (name, barcode, quantity)");
        db.run("INSERT INTO Products VALUES (?, ?, ?)", ['product001', 'xxxxx', 20]);
        db.run("INSERT INTO Products VALUES (?, ?, ?)", ['product002', 'xxxxx', 40]);
        db.run("INSERT INTO Products VALUES (?, ?, ?)", ['product003', 'xxxxx', 60]);
        db.each("SELECT * FROM Products", (err, row) => {
            i++;
            console.log(i);
            console.log(row);
        });
        let result = i === 0 ? 'mislukt :(' : 'succes (:';
        console.log(i + ', ' + result);
        win.webContents.send("CreateDbResponse", result);
    });
});
