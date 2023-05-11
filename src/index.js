const { createApp } = require('./main');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const Database = require('better-sqlite3');

createApp();


/*SETUP DATABASE */

const db_main = new Database(path.join(__dirname, '..' , 'database' , 'questions.db'));

const initOrders = `CREATE TABLE IF NOT EXISTS basics (
                    id  BIT NOT NULL,
                    firstMessage TEXT NOT NULL, 
                    lastMessage TEXT NOT NULL, 
                    wrongAnswer TEXT NOT NULL
                    )`;

db_main.prepare(initOrders).run();

const initProducts = `CREATE TABLE IF NOT EXISTS questionnaire (
                    id TEXT NOT NULL UNIQUE, 
                    descripcion TEXT NOT NULL, 
                    precio FLOAT NOT NULL,
                    variaciones TEXT,
                    estado BOOL
                    )`;

db_main.prepare(initProducts).run();

db_main.close();

const db_settings = new Database(path.join(__dirname, '..' , 'database' , 'settings.db'));

const initSettings = `CREATE TABLE IF NOT EXISTS settings (
                    id  BIT NOT NULL,
                    name TEXT NOT NULL,
                    botNumber TEXT NOT NULL, 
                    secondaryNumber TEXT,
                    email TEXT
                    )`;

db_settings.prepare(initSettings).run();

db_settings.close();





