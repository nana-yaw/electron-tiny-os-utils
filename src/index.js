const { app, BrowserWindow } = require('electron');
const os = require('os-utils');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

let checkCPU;
let iconPath;

if (process.platform === "linux") {

  iconPath = __dirname + '/assets/images/icon.png'

} else if(process.platform === "win32") {

  iconPath = __dirname + '/assets/images/icon.ico'

}else{

  iconPath = __dirname + '/assets/images/icon.icns'

}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    icon: iconPath,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  mainWindow.webContents.on('did-finish-load', ()=>{
    
    checkCPU = setInterval(() => {
        
        os.cpuUsage((value) => {
          // console.log(`CPU Usage: ${value*100} %`);
          mainWindow.webContents.send('cpu',value*100)
          // console.log(`Memory Usage: ${os.freememPercentage()*100} %`);
          mainWindow.webContents.send('free-memory',os.freememPercentage()*100)
          // console.log(`Total Memory: ${os.totalmem()/1024} GB`);
          mainWindow.webContents.send('total-memory',os.totalmem()/1024)
          
        });
        
      }, 1000);

  })

  mainWindow.on('close', function(e){
    var choice = require('electron').dialog.showMessageBox(this,
        {
          type: 'question',
          buttons: ['Yes', 'No'],
          title: 'Confirm',
          message: 'Are you sure you want to quit?'
       });
       if(choice == 1){
         e.preventDefault();
       }else{
        clearInterval(checkCPU)
       }
    });

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
