const { MSICreator } = require('electron-wix-msi');
const path = require('path');
 
const APP_DIR = path.resolve(__dirname, './cuestionario_bot');

const OUT_DIR = path.resolve(__dirname, './installer');

const { PRODUCT_NAME, SETUP_ICON: setupIcon } = process.env

const msiCreator = new MSICreator({
    appDirectory: APP_DIR,
    outputDirectory: OUT_DIR,
    icon: './public/assets/images/indix/indix-bold.ico',
    // Configure metadata
    description: 'Whatsapp bot para restaurante',
    setupExe: `${PRODUCT_NAME}.exe`,
    exe: 'cuentionario',
    name: 'cuentionario',
    manufacturer: 'Indix',
    version: '1.0.0',

    ui: {
        chooseDirectory: true
    },
});

msiCreator.create().then(function(){

    msiCreator.compile();

});