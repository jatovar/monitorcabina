const {app, Menu, Tray, BrowserWindow, shell} = require('electron')
const { URL, URLSearchParams } = require('url');

let appIcon = null

// Module to control application life.
// Module to create native browser window.

const path = require('path')
const url = require('url')


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
//let mainWindow
let tray = null
let contextMenu = null 
let mainWindow


function createWindow () {
  var AutoLaunch = require('auto-launch');
  //var Tray = electron.Tray;
  var minecraftAutoLauncher = new AutoLaunch({
    name: 'Minecraft',
    path: '/Applications/Minecraft.app',
  });
  
  minecraftAutoLauncher.enable();
  
  //minecraftAutoLauncher.disable();
  
  
  minecraftAutoLauncher.isEnabled()
  .then(function(isEnabled){
    if(isEnabled){

      require('update-electron-app')();

      var signalR = require('signalr-client');
      var client  = new signalR.client(
        "http://192.0.1.53/WCF/Movil/v8/signalr",      
        ['MonitorCabinaHub'],
        10
      );
      client.on(
        // Hub Name (case insensitive)
        'MonitorCabinaHub',	
        // Method Name (case insensitive)
        'NuevoSiniestro',	
        // Callback function with parameters matching call from hub
        function(name, message) { 
          //console.log("revc => " + name + ": " + message); 
          var data = JSON.parse(name);
          var timbrar = 1;
          if(contextMenu.items[0].checked == false)
            timbrar = 0;
          const myURL = new URL('https://appmovil.elpotosi.com.mx/v8/Alerta/Index');
          myURL.searchParams.set('flag', timbrar);
          myURL.searchParams.set('poliza', data.Poliza);
          myURL.searchParams.set('causa', data.Descripcion);          
          myURL.searchParams.set('fecha', data.Fecha);
          myURL.searchParams.set('reporte', data.NumReporte);
          
         // console.log(myURL.href);
              
          shell.openExternal(myURL.href);
            
          tray.displayBalloon({
            icon: path.join(__dirname,"resources","favicon.png"),
            title: "Nuevo siniestro",
            content: "Un siniestro por la aplicación móvil se ha reportado."
          });

         // mainWindow.webContents.send('updateReport', 'do something for me');
          
        });
    }
    minecraftAutoLauncher.enable();
  })
  .catch(function(err){
      // handle error
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
 // console.log( path.join(__dirname,"resources", "favicon.png"));
  
  tray = new Tray(path.join(__dirname,"resources", "favicon.png"))
 contextMenu = Menu.buildFromTemplate([
    {
      label: 'Habilitar sonido', 
      type: 'checkbox', 
      checked: true
    },
  ])
  
  tray.setToolTip('Notificaciones Seguros El Potosi')
  
  tray.setContextMenu(contextMenu)

  createWindow();
})
// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  /*if (u.platform !== 'darwin') {
    app.quit()
  }
  */
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main u
// code. You can also put them in separate files and require them here.
