const { app, BrowserWindow, BrowserView, session, ipcMain, dialog, webContents } = require('electron');
const puppeteer = require('puppeteer-core');
const pie = require('puppeteer-in-electron');
const { Client, LocalAuth  } = require('whatsapp-web.js');
const path = require('path');
//const sqlite3 = require('sqlite3').verbose();
const server = require('../app');

const Database = require('better-sqlite3');
const natural = require('natural');
const { v4: uuidv4 } = require('uuid');
const request = require("request");

const minutes4reset = 120 
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
                        '¡Hola! Gracias por comunicarte conmigo. \nMe gustaría que te tomarás un momento de responder las siguientes preguntas. 😃', 
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

    //Números a los cuales el bot puede responder:
    const allowedPhones = [
        '5218712662748@c.us',
        '5218717978267@c.us',
        '5218713427215@c.us',
        '5218711675842@c.us',
    ]

    
    client.on('message', async msg => {

        if(msg.from == "status@broadcast" || msg.from.length > 18) return;

        if ( allowedPhones.includes(msg.from) ){

            if( msg.body == 'RESET' ){
                
                eliminarNumero( msg.from )
            
            }

            let userMessage = userFirstMessage(msg.from);


            if( userMessage == 'usuario creado'){

                let mensaje = bienvenidaUsuario();

                client.sendMessage(msg.from, mensaje.firstMessage);

                let preguntaCruda = comenzarEncuesta();

                let preguntaFormulada = formularPregunta( preguntaCruda );

                //Tiempo de espera de un segundos entre el mensaje de bienvenida y la primer pregunta
                setTimeout(function(){
                    client.sendMessage(msg.from, preguntaFormulada);
                }, 1000)
                

            }else{

                const regex = /^[1-9]$/;

                if(regex.test(msg.body)){

                    let respuesta;

                    let respuestaNumerica = continuarEncuesta( msg.from, msg.body );

                    respuesta = respuestaNumerica.error ?? formularPregunta(respuestaNumerica.sigPregunta);  

                    client.sendMessage(msg.from, respuesta);

                }else{

                    let mensaje = mensajeErroneo();

                    client.sendMessage(msg.from, mensaje.wrongAnswer);

                    return;

                }

                //let mensaje = despedidaUsuario();

                //client.sendMessage(msg.from, mensaje.lastMessage);

            }



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
        icon: path.resolve(__dirname, '..', 'public', 'assets' , 'images' , 'indix' , 'Indix-bold.ico')

    });

    console.log(path.resolve(__dirname, '..', 'public', 'assets' , 'images' , 'indix' , 'Indix-bold.ico'));

    window.maximize();

    window.loadURL('http://localhost:3000');

    window.show();

    //window.webContents.openDevTools();

    return { browser: browser, window: window };

}

function bienvenidaUsuario(){

    const db = new Database(path.join(__dirname, '..' , 'database' , 'questions.db'));

    db.pragma('journal_mode = WAL');
  
    const command = db.prepare('SELECT firstMessage FROM basics WHERE id = 1');
    const firstMessage = command.get();

    return firstMessage;

}

function mensajeErroneo(){

    const db = new Database(path.join(__dirname, '..' , 'database' , 'questions.db'));

    db.pragma('journal_mode = WAL');
  
    const command = db.prepare('SELECT wrongAnswer FROM basics WHERE id = 1');
    const wrongAnswer = command.get();

    return wrongAnswer ;

}

function despedidaUsuario(){

    const db = new Database(path.join(__dirname, '..' , 'database' , 'questions.db'));

    db.pragma('journal_mode = WAL');
  
    const command = db.prepare('SELECT lastMessage FROM basics WHERE id = 1');
    const lastMessage = command.get();

    return lastMessage;

}

function comenzarEncuesta(){

    const db = new Database(path.join(__dirname, '..' , 'database' , 'questions.db'));

    db.pragma('journal_mode = WAL');
  
    const command = db.prepare('SELECT * FROM questions WHERE id = 1');
    const question = command.get();

    return question;

}

function eliminarNumero( phone ){

    const db = new Database(path.join(__dirname, '..' , 'database' , 'users.db'));

    db.pragma('journal_mode = WAL');
  
    const command = db.prepare('DELETE FROM users WHERE phone = ?');
    command.run(phone);

}


function continuarEncuesta(phone, msg){

    const db_user = new Database(path.join(__dirname, '..' , 'database' , 'users.db'));
    
    const userTable = db_user.prepare('SELECT * FROM users WHERE phone = ?');
    const userInfo = userTable.get(phone);

    console.log({userInfo});

    let stepActual = userInfo.step_question + 1;

    //Revisar en que pregunta está el usuario, guardar su respuesta a esa pregunta, aumentarle el paso en pase_pregunta y enviar la siguiente. 
    //Si ya no se pueden mandar más preguntas mandar el mensaje de despedida. 

    const db_question = new Database(path.join(__dirname, '..' , 'database' , 'questions.db'));

    db_question.pragma('journal_mode = WAL');
  
    const queryPregunta = db_question.prepare('SELECT * FROM questions WHERE id =  ?');
    const question = queryPregunta.get( stepActual );

    if( msg <= question.cant_respuestas ){

        if( !isUltimaPregunta( stepActual ) ){

            console.log({question});

                let newQuestionStep = userInfo.step_question + 1;
        
                const queryUser = db_user.prepare(`UPDATE users
                                                        SET step_message = ?,
                                                            step_question = ?,
                                                            answers = ?

                                                        WHERE
                                                            phone = ? `);
                
                queryUser.run( 'questions' , newQuestionStep , '{resp}' , phone  );

                const sigPregunta = queryPregunta.get(newQuestionStep + 1);

                return {sigPregunta};

            

        }else{

            let despedida = despedidaUsuario();
            return {error: despedida.lastMessage};
        
        }

    }else{
        return {error: 'Esa respuesta no era una opción'};
    }

}


function isUltimaPregunta(PreguntaActual){


    const db = new Database(path.join(__dirname, '..' , 'database' , 'questions.db'));

    db.pragma('journal_mode = WAL');

    const queryCont = db.prepare('SELECT * FROM questions');
    const contQuery = queryCont.all();
    let isUltima = PreguntaActual < contQuery.length ? false : true;

    return isUltima;
}


function formularPregunta(objeto){

    let preguntaRespuestas = objeto.pregunta + '\n';

    const respuestas = JSON.parse(objeto.respuestas);
  
    const optionsMap = {
        'respuesta-1': '1️⃣',
        'respuesta-2': '2️⃣',
        'respuesta-3': '3️⃣',
        'respuesta-4': '4️⃣',
        'respuesta-5': '5️⃣',
        'respuesta-6': '6️⃣',
        'respuesta-7': '7️⃣',
        'respuesta-8': '8️⃣',
        'respuesta-9': '9️⃣',

    }

    Object.entries(respuestas).forEach(([key, value]) => {
        preguntaRespuestas += optionsMap[key] + ' ' + value + '\n';
    });
  
    return preguntaRespuestas.trim();
}



function userFirstMessage(phone) {
  
    const db = new Database(path.join(__dirname, '..' , 'database' , 'users.db'));
    
    const userTable = db.prepare('SELECT * FROM users WHERE phone = ?');
    const userInfo = userTable.get(phone);

    if( userInfo ){

        return userInfo;

    }else{

        const command = `INSERT INTO users(id, phone, step_message, step_question, answers) 
        VALUES(@id, @phone, @step_message, @step_question, @answers)`;
                  
        const insert = db.prepare(command);

        const insertUser = db.transaction((config) => {

            insert.run(config);

        });

        const question = {
            id:uuidv4(),
            phone: phone,
            step_message: 'firstMessage',
            step_question : 0,
            answers:'{}'
        };

        insertUser(question);

        return 'usuario creado';

    }
    
    return userVerification;
  
};

module.exports = { createApp };