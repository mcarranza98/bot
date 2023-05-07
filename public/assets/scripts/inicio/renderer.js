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
