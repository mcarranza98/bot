const express = require('express');
const router = express.Router();
//const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const Database = require('better-sqlite3');
const NodeGeocoder = require('node-geocoder');


/* GET the home page. */
router.get('/', function(req, res, next) {

  res.render('inicio');

});

router.get('/load_questions_table', function(req, res, next) {


  const db = new Database(path.join(__dirname, '..' , 'database' , 'questions.db'));

  db.pragma('journal_mode = WAL');

  const command = db.prepare('SELECT * FROM questionnaire');
  const questions = command.all();

  let final_question = [];

  questions.forEach(producto => {

    final_question.push({...producto});

  });

  db.close();
  res.send({ rows: final_question });

});


router.post('/search_coordinates', async function (req, res, next) { 

  const data = req.body;

  const{ address } = data;

  const options = {
      provider: 'google',
      apiKey: 'AIzaSyDH9nP0KFFro41ufDHWLSTAHp9Rxa__ofc', 
      formatter: null,
      limit: 1,
      countryCode: 'MX'
  };

  const geocoder = NodeGeocoder(options);

  const resp = await geocoder.geocode( address.trim() ) ;

  res.send({ res: resp });

});

router.post('/search_address', async function (req, res, next) { 

  const data = req.body;

  const{ address } = data;

  const options = {
      provider: 'google',
      apiKey: 'AIzaSyDH9nP0KFFro41ufDHWLSTAHp9Rxa__ofc', 
      formatter: null,
      limit: 1,
      countryCode: 'MX'
  };

  const geocoder = NodeGeocoder(options);
  
  const resp = await geocoder.reverse(address);

  res.send({ res: resp });

});

router.get('/load_settings', async function (req, res, next) { 

  const db = new Database(path.join(__dirname, '..' , 'database' , 'settings.db'));

  db.pragma('journal_mode = WAL');

  const command = db.prepare('SELECT * FROM settings');
  const settings = command.all();

  db.close();
  res.send({ res: settings });

});

router.post('/upload_basics', function(req, res, next) {

  const{ firstMessage, lastMessage, wrongAnswer } = req.body;

  const uuid = uuidv4();

  const db = new Database(path.join(__dirname, '..' , 'database' , 'questions.db'));

  const query = db.prepare('SELECT * FROM basics');
  const registro = query.all();

  db.pragma('journal_mode = WAL');
 
  if( registro.length == 0 ){

      const command = `INSERT INTO basics(id, firstMessage, lastMessage, wrongAnswer) 
                    VALUES(@id, @firstMessage, @lastMessage, @wrongAnswer)`;
                              
      const insert = db.prepare(command);
      
      const insertbasics = db.transaction((config) => {
        
        insert.run(config);

        res.send({state: "success" , message : "Respuestas actualizada exitosamente."});

      });

      const basics = {
        id: 1,
        firstMessage: firstMessage,
        lastMessage: lastMessage,
        wrongAnswer : wrongAnswer
      };
      
      insertbasics(basics);

      db.close();

  }else{

    command = db.prepare(`UPDATE settings
                                          SET id = 1,
                                              firstMessage = ?,
                                              lastMessage = ?,
                                              wrongAnswer = ?

                                          WHERE
                                              id = 1 `);
    
    command.run( firstMessage , lastMessage, wrongAnswer );

    res.send({state: "success" , message : "Respuestas actualizada exitosamente."});

    db.close();

  }
  
});

router.post('/upload_question', function(req, res, next) {

  const{ question, firstAnswer, secondAnswer, thirdAnswer, fourthAnswer } = req.body;

  const uuid = uuidv4();

  const db = new Database(path.join(__dirname, '..' , 'database' , 'questions.db'));

  const query = db.prepare('SELECT * FROM questionnaire');
  const registro = query.all();

  const sequence = registro.length + 1;
  let answerQuantity;

  if( fourthAnswer ){

      answerQuantity = 4;

  }else{

    answerQuantity = 3;

  }

  db.pragma('journal_mode = WAL');
 

      const command = `INSERT INTO questionnaire(id, sequence, question, firstAnswer, secondAnswer, thirdAnswer, fourthAnswer, answerQuantity) 
                    VALUES(@id, @sequence, @question, @firstAnswer, @secondAnswer, @thirdAnswer, @fourthAnswer, @answerQuantity)`;
                              
      const insert = db.prepare(command);
      
      const insertQuestion = db.transaction((config) => {
        
        insert.run(config);

        res.send({state: "success" , message : "Pregunta agregada exitosamente."});

      });

      const settings = {
        id: uuid,
        sequence: sequence,
        question: question,
        firstAnswer: firstAnswer,
        secondAnswer : secondAnswer,
        thirdAnswer: thirdAnswer,
        fourthAnswer: fourthAnswer,
        answerQuantity: answerQuantity
      };
      
      insertQuestion(settings);

      db.close();

  
});


router.post('/upload_settings', function(req, res, next) {

  const{ name, botNumber, secondaryNumber, email } = req.body;

  const uuid = uuidv4();

  const db = new Database(path.join(__dirname, '..' , 'database' , 'settings.db'));

  const query = db.prepare('SELECT * FROM settings');
  const registro = query.all();

  db.pragma('journal_mode = WAL');
 
  if( registro.length == 0 ){

      const command = `INSERT INTO settings(id, name, botNumber, secondaryNumber, email) 
                    VALUES(@id, @name, @botNumber, @secondaryNumber, @email)`;
                              
      const insert = db.prepare(command);
      
      const insertSettings = db.transaction((config) => {
        
        insert.run(config);

        res.send({state: "success" , message : "Configuración actualizada exitosamente."});

      });

      const settings = {
        id: 1,
        name: name,
        botNumber: botNumber,
        secondaryNumber : secondaryNumber,
        email: email,
      };
      
      insertSettings(settings);

      db.close();

  }else{

    command = db.prepare(`UPDATE settings
                                          SET id = 1,
                                              name = ?,
                                              botNumber = ?,
                                              secondaryNumber = ?,
                                              email = ?

                                          WHERE
                                              id = 1 `);
    
    command.run( name , botNumber, secondaryNumber , email  );

    res.send({state: "success" , message : "Configuración actualizada exitosamente."});

    db.close();

  }
  
});



module.exports = {routes: router}