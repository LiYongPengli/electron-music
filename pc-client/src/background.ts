import { app, protocol, BrowserWindow, Menu, ipcMain, Tray } from 'electron';
import { createDeskipWindow, createWindow, downLoadFile } from './systemscripts';
import path from 'path'
const isDevelopment = process.env.NODE_ENV !== 'production';
let win: BrowserWindow | null;
let appTray:Tray|null = null;
let isHide = false;
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      secure: true,
      standard: true
    }
  }
]);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    win = createWindow();
    win.on('closed', () => {
      win = null;
    });
  }
});

app.whenReady().then(async()=>{
  appTray = new Tray(path.join(__static,"./icon.ico"));
  appTray.setToolTip('我的音乐');
  let contextMenu = Menu.buildFromTemplate([{
    label:'退出',
    click(){
      app.quit();
    }
  }])
  appTray.setContextMenu(contextMenu);
  appTray.on('double-click',()=>{
    if(isHide){
      win!.show();
    }else{
      win!.hide();
    }
    isHide = !isHide;
  })
})

app.on('ready', async () => {
  win = createWindow();
  win.on('closed', () => {
    win = null;
  });
});

if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}

//桌面歌词容器创建
let deskipWin: BrowserWindow | null = null;
ipcMain.on('deskiptext', (e, data) => {
  if (data) {
    if (!deskipWin) {
      deskipWin = createDeskipWindow();
      deskipWin.on('closed', () => {
        deskipWin = null;
      })
    }

  } else {
    deskipWin!.close();
  }
})
export interface DonloadData {
  name:string;
  type:string;
  url:string;
  lrc:string;
  krc:string;
  savePath:string;
  id:string;
}
ipcMain.on('download',(e,data:string)=>{
  let res = JSON.parse(data) as DonloadData;
  downLoadFile(win!,res);
})

ipcMain.on('text', (e, data) => {
  if (deskipWin) deskipWin!.webContents.send('text', data);
})

//最小化
ipcMain.on('mini',(e,data)=>{
  win!.minimize()
})

ipcMain.on('hide',(e,data)=>{
  win!.hide();
  isHide = true;
})

ipcMain.on('exit',(e,data)=>{
  app.quit();
})

