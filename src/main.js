const { app, BrowserWindow, BrowserView, session, ipcMain, dialog, webContents } = require('electron');
const puppeteer = require('puppeteer-core');
const pie = require('puppeteer-in-electron');
const { Client, LocalAuth, MessageMedia } = require('tecsom-whatsapp-web.js');
const path = require('path');
//const sqlite3 = require('sqlite3').verbose();
const server = require('../app');

const Database = require('better-sqlite3');
const natural = require('natural');
const { v4: uuidv4 } = require('uuid');
const request = require("request");

const {PosPrinter} = require("electron-pos-printer");

const distance = require('google-distance-matrix');
distance.key('AIzaSyDH9nP0KFFro41ufDHWLSTAHp9Rxa__ofc');

const NodeGeocoder = require('node-geocoder');

const minutes4reset = 120 
const CryptoJS = require('crypto-js');
const { start } = require('repl');
const { contextIsolated } = require('process');
var admitedUser = true

const initialTimestamp = Math.floor(Date.now() / 1000);

const createApp = async () => {

    const { browser, window } = await createMainWindow(app);

    //window.removeMenu()


    
    const { client, view } = await createWhatsappView(window, browser);

    //const intervalID = setInterval(checkAutocompleteOrder, 5000, window, client); //corre cada 5 segundo para comprobar ordenes pendientes y autocompletarlas


   

    attachView_Whatsapp(client,window,view,browser);

    const CHANNEL_NAME = 'main';

    ipcMain.on('PRINT_CHANNEL', (event, data) => {

        const db_order = new Database(path.resolve(__dirname, '..', 'database' , 'orders.db'));
        let command = db_order.prepare('SELECT * FROM orders WHERE telefono = ? AND timestamp = ?' );
        const orders = command.all(data.telefono, data.timestamp);

        let comando2 = db_order.prepare('SELECT * FROM order_data WHERE telefono = ? AND timestamp = ?' );
        const order_data = comando2.get(data.telefono, data.timestamp);

        const db_setings = new Database(path.resolve(__dirname,'..','database' , 'settings.db'));

        printOrder(order_data, orders, db_setings)

    });

    // COMMENT TEST
    app.on('resize', function(e,x,y){

        window.setSize(x, y);

    });
    
    app.on('window-all-closed', function () {

        if (process.platform !== 'darwin') {
        
            app.quit();
            
        }
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow(app);
        }
    });

    
};

function isClientConnected(client){
    if(!client.pupPage) {
        console.log("no inicializado")
    }else{
        console.log("inicializado")
    }
    
    
}



function attachView_Whatsapp(client,window){

    ipcMain.removeAllListeners(["main"]);
    ipcMain.removeAllListeners(["SEND_WHA"]);
    ipcMain.removeAllListeners(["RELOAD_WHATSAPP"]);

    ipcMain.on('RELOAD_WHATSAPP', async (event, data) => {
        
        client.logout()

    })


    ipcMain.on("main", (event, data) => {

       
        if(data == "print"){

            var res = {};
            res.message = "printers array";
            res.printers = window.webContents.getPrinters()

            window.webContents.send('main', res);

        }

    });


    ipcMain.on("LOAD_PRINTERS",async function(){

        const printers = await window.webContents.getPrintersAsync();
        window.webContents.send('LOAD_PRINTERS', printers);

    })

}


const createWhatsappView = async (window) => {

    console.log("view");


    const db_questions = new Database(path.resolve(__dirname, '..', 'database' , 'questions.db'));
    let command = db_questions.prepare('SELECT * FROM basics' );
    const orders = command.all();

    console.log({orders:orders.length});

    if( orders.length == 0 ){

        const initialMessages = `INSERT INTO basics (id, firstMessage, lastMessage, wrongAnswer)
                    VALUES (
                        1,
                        '¡Hola! Gracias por comunicarte conmigo.', 
                        'Gracias por tomarte el tiempo de responder, pronto recibirás noticias!', 
                        'Lo lamento, no comprendí tu respuesta, podrías reenviarla por favor.')`;

        db_questions.prepare(initialMessages).run();

    }

    const view = new BrowserView();

    await window.webContents.session.clearStorageData();
    await window.webContents.session.clearCache();

    const client = new Client({
        authStrategy: new LocalAuth()
    });
    
    
    client.on('ready', () => { 

        isClientConnected(client)
        //window.webContents.send('main', "whatsapp-connected");
        window.webContents.send('W_CONNECTION', {connection:"connected"});



    });

    client.on('qr', (qr) => {
        // Generate and scan this code with your phone
        console.log({qr})
        window.webContents.send('W_QR_UPDATES', {qr});

    });

    client.on('disconnected', async () => { 

        console.log("disconnected");

        window.webContents.send('W_CONNECTION', {connection:"disconnected"});
        await createWhatsappView(window);

    });

    client.on('change_state', (state) => { 

        console.log(state);
      

    });

    

    
    client.on('message', msg => {

        console.log( {msg} );
        if(msg.from == "status@broadcast" || msg.from.length > 18) return;

        if (msg.from == "5218712662748@c.us" || msg.from == "5218717978267@c.us"  || msg.from == "5218713427215@c.us" ){

            
            console.log('mandar mensaje');

            client.sendMessage(msg.from, 'Este es un mensaje de prueba para comprobar que si funciona el wats');

            db_conversaciones.close();
            db_main.close();

        }

    });

    client.initialize();

    return {client}

}

const createMainWindow = async (app) => {

    await pie.initialize(app);

    const browser = await pie.connect(app,puppeteer);

    const window = new BrowserWindow({

        width: 800,
        height: 700,
        webPreferences:{
            nodeIntegration : true,
            preload: path.resolve(__dirname, '..', 'public', 'assets' , 'scripts' , 'inicio' , 'renderer.js'),
            contextIsolation: true,
        },
        useContentSize: true,
        show: false,
        icon: path.resolve(__dirname, '..', 'public', 'assets' , 'images' , 'icons' , 'tecsomlogowhite.ico')

    });

    console.log(path.resolve(__dirname, '..', 'public', 'assets' , 'images' , 'icons' , 'tecsomlogowhite.ico'));

    window.maximize();

    window.loadURL('http://localhost:3000');

    window.show();

    //window.webContents.openDevTools();

    return { browser: browser, window: window };

}

module.exports = { createApp };