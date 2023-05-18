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

const initQuestions = `CREATE TABLE IF NOT EXISTS questions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT, 
                    pregunta TEXT NOT NULL, 
                    respuestas TEXT NOT NULL,
                    cant_respuestas INTEGER NOT NULL
                    )`;

db_main.prepare(initQuestions).run();

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


const db_users = new Database(path.join(__dirname, '..' , 'database' , 'users.db'));

const initusers = `CREATE TABLE IF NOT EXISTS users (
                    id  TEXT NOT NULL,
                    phone TEXT NOT NULL,
                    step_message TEXT NOT NULL, 
                    step_question INTEGER,
                    answers TEXT
                    )`;

db_users.prepare(initusers).run();

const initFinishUSer = `CREATE TABLE IF NOT EXISTS finished (
                    id  TEXT NOT NULL,
                    phone TEXT NOT NULL,
                    answers TEXT,
                    timestamp DATETIME
                    )`;

db_users.prepare(initFinishUSer).run();

db_users.close();





