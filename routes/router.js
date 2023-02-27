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

router.post('/upload_producto', function(req, res, next) {

  const data = req.body;

  const{ productName, productPrice } = data;

  let variaciones = "";

  for(let key in data){


    const uuidChecker = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;

    if(uuidChecker.test(key)){

      variaciones += `${key},`;

    }

  }

  variaciones = variaciones != "" ? variaciones : null;

  const uuid = uuidv4();

  const db = new Database(path.join(__dirname, '..' , 'database' , 'main.db'));

  db.pragma('journal_mode = WAL');

  const command = `INSERT INTO productos(id, descripcion, precio, variaciones, estado) 
                  VALUES(@uuid, @productName, @productPrice, @variaciones, @estado)`;
                            
  const insert = db.prepare(command);
  
  const insertProduct = db.transaction((product) => {
    
    insert.run(product);

    res.send({state: "success" , message : "Producto agregado exitosamente."});

  });

  const product = {
    uuid: uuid,
    productName: productName,
    productPrice : productPrice,
    variaciones : variaciones,
    estado: "false"
  };
  
  insertProduct(product);

  db.close();

});

router.post('/upload_variacion', function(req, res, next) {

  const{ variacionName, variacionPrice } = req.body;
  
  const uuid = uuidv4();

  const db = new Database(path.join(__dirname, '..' , 'database' , 'main.db'));

  db.pragma('journal_mode = WAL');

  const command = `INSERT INTO variaciones(id, descripcion, precio_extra, estado) 
                  VALUES(@uuid, @variacionName, @variacionPrice, @estado)`;
                            
  const insert = db.prepare(command);
  
  const insertVariacion = db.transaction((product) => {
    
    insert.run(product);

    res.send({state: "success" , message : "Variación agregado exitosamente."});

  });

  const variacion = {
    uuid: uuid,
    variacionName: variacionName,
    variacionPrice : variacionPrice,
    estado: "false"
  };
  
  insertVariacion(variacion);

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

router.post('/update_state', function(req, res, next) {

  const data = req.body;

  const{ table, id, state } = data;

  const db = new Database(path.join(__dirname, '..' , 'database' , 'main.db'));

  db.pragma('journal_mode = WAL');

  const command = `UPDATE ${table}
                  SET estado = ?
                  WHERE id = ?`;
    
                            
  const prepare = db.prepare(command);
  
  const info = prepare.run(state, id);

  db.close();

});


module.exports = {routes: router}