const { app, BrowserWindow, BrowserView, session, ipcMain } = require('electron');
const puppeteer = require('puppeteer-core');
const pie = require('puppeteer-in-electron');
const { Client } = require('whatsapp-web-electron.js');
const path = require('path');
//const sqlite3 = require('sqlite3').verbose();
const server = require('../app');

const Database = require('better-sqlite3');
const natural = require('natural');
const { v4: uuidv4 } = require('uuid');
const request = require("request");

const distance = require('google-distance-matrix');
distance.key('AIzaSyDH9nP0KFFro41ufDHWLSTAHp9Rxa__ofc');

const NodeGeocoder = require('node-geocoder');

const { MessageMedia } = require('whatsapp-web-electron.js');
const { getPost, getImage } = require('random-reddit')

const test = true;

const createApp = async () => {

    const { browser, window } = await createMainWindow(app);
    
    const { client, view } = await createWhatsappView(window, browser);

    const CHANNEL_NAME = 'main';

    ipcMain.on(CHANNEL_NAME, (event, data) => {

        if(data == "toggle-wha"){

            const views = window.getBrowserView();

            if(!views){

                window.setBrowserView(view);

                const size = window.getContentSize();

                const bounds = window.getBounds();

                const coordy = bounds.height - size[1];

                view.setBounds({ x: 0, y: coordy, width: bounds.width/2 , height: size[1]});

                view.setAutoResize({
                    width: true,
                    height: true,
                });

                window.addBrowserView(view);

            }else{

                window.removeBrowserView(view);

            }
        }
        else if(data == "close-wha"){

            const views = window.getBrowserView();

            if(views){

                window.removeBrowserView(view);
                
            }

        }

    });

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



const createWhatsappView = async(window, browser) => {

    const view = new BrowserView();

    await window.webContents.session.clearStorageData();
    await window.webContents.session.clearCache();

    const client = new Client( browser, view );
    
    client.on('ready', () => { 

        window.webContents.send('main', "whatsapp-connected");

    });

    client.on('message', async msg => {

        const db = new Database(path.join(__dirname, '..' , 'database' , 'clients.db'));

        const query = db.prepare('SELECT * FROM clients WHERE phone = ?');
        let clientInfo = query.get(msg.from);

        if( clientInfo == undefined ){

            clientInfo = [];

            registerPhone( msg );

            clientInfo.step = 1;

        } 
        
        const currentQuestion = nextQuestion( clientInfo.step );

        console.log({currentQuestion});
        console.log(currentQuestion.fourthAnswer);

        let respTres =  currentQuestion.thirdAnswer == '' ? '' : `\n➌ ${currentQuestion.thirdAnswer}`;
        let respCuatro = currentQuestion.fourthAnswer == '' ? '' : `\n➍ ${currentQuestion.fourthAnswer}`;

        let msgToSend = `${currentQuestion.question}\n➊ ${currentQuestion.firstAnswer} \n➋ ${currentQuestion.secondAnswer}${respTres}${respCuatro}`;
        
        


      
        db.pragma('journal_mode = WAL');

        if(msg.from == "status@broadcast" || msg.from.length > 18) return;

        if (msg.from == "5218712662748@c.us" || msg.from == "5218717978267@c.us" ){

            
            
            client.sendMessage(msg.from, msgToSend);

            command = db.prepare(`UPDATE clients
                                          SET step = ?

                                          WHERE
                                            phone = ? `);
        
            command.run(  clientInfo.step + 1, msg.from );


        }

    });

    client.initialize();

    return { view : view, client: client };

}

function searchIndexByField(array, field, value) {
    for (let i = 0; i < array.length; i++) {
      if (array[i][field] === value) {
        return i;
      }
    }
    return -1; // return -1 if the value is not found in the array
  }

function nextQuestion( step ){

    const db = new Database(path.join(__dirname, '..' , 'database' , 'questions.db'));

    const query = db.prepare('SELECT * FROM questionnaire');
    const preguntas = query.all();

    const indexPregunta = searchIndexByField(preguntas, 'sequence', step );

    console.log({preguntas});
    console.log({step});
    console.log({indexPregunta});

    return preguntas[indexPregunta] ;

}


function registerPhone( msg ){

    const{ from } = msg;

    const uuid = uuidv4();
  
    const db = new Database(path.join(__dirname, '..' , 'database' , 'clients.db'));
  
    db.pragma('journal_mode = WAL');
  
    const command = `INSERT INTO clients(id, phone, step) 
                    VALUES(@id, @phone, @step)`;
                            
    const insert = db.prepare(command);
    
    const insertbasics = db.transaction((config) => {
        
        insert.run(config);

    });

    const basics = {
        id: uuid,
        phone: from,
        step: 1
    };
    
    insertbasics(basics);

    db.close();

}


const createMainWindow = async (app) => {

    await pie.initialize(app);

    const browser = await pie.connect(app,puppeteer);

    const window = new BrowserWindow({

        width: 800,
        height: 700,
        webPreferences:{
            nodeIntegration : true,
            preload: path.join(__dirname, '..' , 'public', 'assets' , 'scripts' , 'inicio' , 'renderer.js'),
            contextIsolation: true,
        },
        useContentSize: true,
        show: false,

    });

    window.maximize();

    window.loadURL('http://localhost:3000');

    window.show();

    //window.webContents.openDevTools();

    return { browser: browser, window: window };

}

function containsOnlyNumbers(str) {

    return /^\d+$/.test(str);

}


module.exports = { createApp };