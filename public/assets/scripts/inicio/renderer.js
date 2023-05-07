const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld(
  "api", {
      send: (channel, data) => {
          // whitelist channels
          let validChannels = ["PRINT_CHANNEL","ORDER_TABLE","SEND_WHA","SETTINGS","WHA_HANDLE_NOTIFICATION","RELOAD_WHATSAPP","W_QR_UPDATES", "W_CONNECTION","LOAD_PRINTERS"];
          if (validChannels.includes(channel)) {
              ipcRenderer.send(channel, data);

          }
      },
      receive: (channel, func) => {
          let validChannels = ["PRINT_CHANNEL","ORDER_TABLE","SEND_WHA","SETTINGS","WHA_HANDLE_NOTIFICATION", "RELOAD_WHATSAPP","W_QR_UPDATES","W_CONNECTION","LOAD_PRINTERS"];
          if (validChannels.includes(channel)) {
              // Deliberately strip event as it includes `sender` 
              ipcRenderer.on(channel, (event, ...args) => func(...args));
          }
      }
  }
);
/*
ipcRenderer.on(CHANNEL_NAME, (event, data) => {
 
  if( data.res = "printers array" ){


    console.log( data.printers );

    const printers = data.printers;
    var Opciones = '';

    printers.forEach(printer => {

      Opciones += `<option value="${printer.name}">${printer.name}</option>` 

    });

    console.log(Opciones)
    document.querySelector("#selectPrinter").innerHTML = Opciones;

  }

});
*/

window.onload = (event) => {

  //const $ = require('jquery');
  
  
  window.$ = window.jquery = require('jquery');
  window.dt = require('datatables.net')();
  //window.$('#table_id').DataTable();
  toArray = require("toarray")

  document.querySelector('#whatsapp-btn').onclick = function(){ 

    let message = 'toggle-wha';
    ipcRenderer.send(CHANNEL_NAME, message);

  };

  document.body.addEventListener("click", function (e) {

    if(e.target.id != "whatsapp-btn" && e.target.id != "whatsapp-icon" && e.target.id != 'dropdownWhatsApp'){
      let message = 'close-wha';
      ipcRenderer.send(CHANNEL_NAME, message);
    }

  });

  document.querySelector('#btnSettings').onclick = function(){ 

    let message = 'print';
    ipcRenderer.send(CHANNEL_NAME, message);

    //$('#selectPrinter option').remove();

  };

  document.querySelector('.btnReload').onclick = function(){ 

    let message = 'print';
    ipcRenderer.send(CHANNEL_NAME, message);

  };

};




