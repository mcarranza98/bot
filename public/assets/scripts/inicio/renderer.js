const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld(
  "api", {
      send: (channel, data) => {
          let validChannels = ["RELOAD_WHATSAPP","W_QR_UPDATES", "W_CONNECTION"];
          if (validChannels.includes(channel)) {
              ipcRenderer.send(channel, data);

          }
      },
      receive: (channel, func) => {
          let validChannels = [ "RELOAD_WHATSAPP","W_QR_UPDATES","W_CONNECTION"];
          if (validChannels.includes(channel)) {
              ipcRenderer.on(channel, (event, ...args) => func(...args));
          }
      }
  }
);
