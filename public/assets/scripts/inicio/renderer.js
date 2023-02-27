const { ipcRenderer } = require('electron');

const CHANNEL_NAME = 'main';

ipcRenderer.on(CHANNEL_NAME, (event, data) => {
  if(data == "whatsapp-connected"){
    replaceClass("whatsapp-btn", "btn-danger", "btn-success");
    document.querySelector("#whatsapp-btn").innerHTML = `<i class='bx bxl-whatsapp'></i>Whatsapp (Conectado)`;
  }
});

window.onload = (event) => {

  document.querySelector('#whatsapp-btn').onclick = function(){ 

    let message = 'toggle-wha';
    ipcRenderer.send(CHANNEL_NAME, message);

  };

  document.body.addEventListener("click", function (e) {

    if(e.target.id != "whatsapp-btn"){
      let message = 'close-wha';
      ipcRenderer.send(CHANNEL_NAME, message);
    }

  });

};

function replaceClass(id, oldClass, newClass) {
  var elem = document.getElementById(id);
  elem.classList.remove(oldClass);
  elem.classList.add(newClass);
}
