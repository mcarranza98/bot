// ./build_installer.js

// 1. Import Modules
const { MSICreator } = require('electron-wix-msi');
const path = require('path');

// 2. Define input and output directory.
// Important: the directories must be absolute, not relative e.g
// appDirectory: "C:\\Users\sdkca\Desktop\OurCodeWorld-win32-x64", 
const APP_DIR = path.resolve(__dirname, './Tecsom_Whatsapp-win32-x64');
// outputDirectory: "C:\\Users\sdkca\Desktop\windows_installer", 
const OUT_DIR = path.resolve(__dirname, './windows_installer');

const { PRODUCT_NAME, SETUP_ICON: setupIcon } = process.env

// 3. Instantiate the MSICreator
const msiCreator = new MSICreator({
    appDirectory: APP_DIR,
    outputDirectory: OUT_DIR,
    icon: './public/assets/images/icons/tecsomlogowhite.ico',
    // Configure metadata
    description: 'Whatsapp bot para restaurante',
    setupExe: `${PRODUCT_NAME}.exe`,
    exe: 'Tecsom_Whatsapp',
    name: 'Tecsom Whatsapp',
    manufacturer: 'Tecsom MX',
    version: '1.0.0',

    // Configure installer User Interface
    ui: {
        chooseDirectory: true
    },
});

// 4. Create a .wxs template file
msiCreator.create().then(function(){

    // Step 5: Compile the template to a .msi file
    msiCreator.compile();
});