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

router.get('/load_producto_table', function(req, res, next) {

/*
  const db = new Database(path.join(__dirname, '..' , 'database' , 'main.db'));

  db.pragma('journal_mode = WAL');

  const command = db.prepare('SELECT * FROM productos');
  const productos = command.all();

  let final_products = [];

  productos.forEach(producto => {
    let checkbox = "";

    if (producto.estado === 'true'){
      checkbox = `<div class="form-check form-switch" bis_skin_checked="1">
                          <input class="form-check-input" type="checkbox" checked>
                        </div>`;
    }else{
      checkbox = `<div class="form-check form-switch" bis_skin_checked="1">
                          <input class="form-check-input" type="checkbox">
                        </div>`;
    }

    producto.estado_checkbox = checkbox;
    final_products.push({...producto});

  });

  db.close();
  res.send({ rows: final_products });*/

});

router.get('/load_variaciones_table', function(req, res, next) {
/*
  const db = new Database(path.join(__dirname, '..' , 'database' , 'main.db'));

  db.pragma('journal_mode = WAL');

  const command = db.prepare('SELECT * FROM variaciones');
  const variaciones = command.all();

  let final_variaciones = [];

  variaciones.forEach(variacion => {
    let checkbox = "";

    if (variacion.estado === 'true'){
      checkbox = `<div class="form-check form-switch" bis_skin_checked="1">
                          <input class="form-check-input" type="checkbox" checked>
                        </div>`;
    }else{
      checkbox = `<div class="form-check form-switch" bis_skin_checked="1">
                          <input class="form-check-input" type="checkbox">
                        </div>`;
    }

    variacion.estado_checkbox = checkbox;
    final_variaciones.push({...variacion});

  });

  db.close();
  res.send({ rows: final_variaciones });*/

});




router.get('/load_settings', async function (req, res, next) { 

  const db = new Database(path.join(__dirname, '..' , 'database' , 'settings.db'));

  db.pragma('journal_mode = WAL');

  const command = db.prepare('SELECT * FROM settings');
  const settings = command.get();



  db.close();
  res.send({ res: settings });

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



router.get('/load_basics', async function (req, res, next) { 

  const db = new Database(path.join(__dirname, '..' , 'database' , 'questions.db'));

  db.pragma('journal_mode = WAL');

  const command = db.prepare('SELECT * FROM basics');
  const settings = command.get();



  db.close();
  res.send({ res: settings });

});


router.post('/upload_basics', function(req, res, next) {

    const{ firstMessage, lastMessage, wrongAnswer} = req.body;

    const db = new Database(path.join(__dirname, '..' , 'database' , 'questions.db'));

    command = db.prepare(`UPDATE basics
                                          SET id = 1,
                                              firstMessage = ?,
                                              lastMessage = ?,
                                              wrongAnswer = ?

                                          WHERE
                                              id = 1 `);
    
    command.run( firstMessage , lastMessage, wrongAnswer );

    res.send({state: "success" , message : "Actualizado exitosamente."});

    db.close();

});

router.post('/upload_question', function(req, res, next) {

  const{ pregunta } = req.body;

  let respuestas = req.body;

  delete respuestas['pregunta'];

  let cant_respuestas = Object.keys(respuestas).length;

  console.log({respuestas});
  console.log({pregunta});
  console.log({cant_respuestas});

  const db = new Database(path.join(__dirname, '..' , 'database' , 'questions.db'));


  const command = `INSERT INTO questions(pregunta, respuestas, cant_respuestas) 
                VALUES(@pregunta, @respuestas, @cant_respuestas)`;
                          
  const insert = db.prepare(command);
  
  const insertQuestion = db.transaction((config) => {
    
      insert.run(config);

      res.send({state: "success" , message : "Pregunta agregada exitosamente."});

  });

  const question = {
      pregunta: pregunta,
      respuestas: JSON.stringify(respuestas),
      cant_respuestas : cant_respuestas
  };
  
  insertQuestion(question);

  db.close();

  
});


module.exports = {routes: router}