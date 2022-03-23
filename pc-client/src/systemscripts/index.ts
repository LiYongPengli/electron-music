import { BrowserWindow, Menu } from 'electron';
import http from 'http';
import fs from 'fs';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import { DonloadData } from '@/background';

export function createWindow() {
    if(!process.env.WEBPACK_DEV_SERVER_URL) Menu.setApplicationMenu(null);
    let win: BrowserWindow | null = new BrowserWindow({
        frame: process.env.WEBPACK_DEV_SERVER_URL?true:false, // 无边框
        hasShadow: false,
        resizable: false,
        // transparent: true, // 透明
        width: 1200,
        height: 800,
        webPreferences: {
            webSecurity:false,
            enableRemoteModule: true,
            nodeIntegration: true,
            contextIsolation: false
        }
    });


    if (process.env.WEBPACK_DEV_SERVER_URL) {
        win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
        if (!process.env.IS_TEST) win.webContents.openDevTools();
    } else {
        createProtocol('app');
        win.loadURL('app://./index.html');
    }

    return win;
}

export function createDeskipWindow() {
    let desk: BrowserWindow | null = new BrowserWindow({
        width: 800,
        height: 100,
        frame: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        transparent: true,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false
        }
    })
    if (process.env.WEBPACK_DEV_SERVER_URL) {
        desk.loadURL(process.env.WEBPACK_DEV_SERVER_URL + '/#/deskiptext');
        // if (!process.env.IS_TEST) desk.webContents.openDevTools();
    } else {
        desk.loadURL('app://./index.html/#/deskiptext');
    }

    return desk;
}

//文件下载
export function downLoadFile(win:BrowserWindow,data:DonloadData){
    let url = data.url;
    if(data.lrc) url += "&lrc=true";
    let req = http.get(url,res=>{
        let contentLength = parseInt(res.headers['content-length']!);
        let downloadLength = 0;
        let savePath = data.savePath+'\\'+data.name+'@'+data.id+data.type;
        let stat;
        let resdata:Buffer;
        try{
            stat = fs.statSync(savePath);
            if(!stat.isDirectory()) return;
        }catch(err){}
        let writer = fs.createWriteStream(savePath);
        res.on('data',chunk=>{
            downloadLength+=chunk.length;
            if(resdata){
                resdata = Buffer.concat([resdata,chunk])
            }else{
                resdata = chunk;
            }
            win.webContents.send('download',JSON.stringify({
                size:contentLength,
                current:downloadLength
            }))
        })
        res.on('end',()=>{
            let index = resdata.indexOf('@split@');
            let music,lrc
            if(index!=-1){
                music = resdata.slice(0,index);
                lrc = resdata.slice(index+7);
                let writelrc = fs.createWriteStream(data.savePath+'\\'+data.name+'@'+data.id+'.lrc');
                writelrc.write(lrc,err=>{
                    writelrc.end();
                    writelrc.close();
                });
            }else{
                music = resdata;
            }
            writer.write(music,err=>{
                writer.end();
                writer.close();
            })
        })
    })
    req.end();
}