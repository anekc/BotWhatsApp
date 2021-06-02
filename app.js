const fs = require('fs');
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const ora = require('ora');
const chalk = require('chalk');
let client;
let sessionData;

const SESSION_FILE_PATH = './session.json';
const withSession = () => {

    // si existe el archivo json con las credenciales

    const spinner = ora(`Cargando ${chalk.yellow('Validando sesión con whatsApp')}`);
    sessionData = require(SESSION_FILE_PATH);
    spinner.start();
    client = new Client({ session: sessionData });

    client.on('ready', () => {
        console.log('  client is ready');
        spinner.stop();
    });

    client.on('auth_failure', () => {
        spinner.stop();
        console.log('Error de auntenticación vuelve a generar el QRCode');
    });

    client.initialize();

};

/**
 * Esta función genera el QR
 */
const withOutSession = () => {
    console.log('sesion no guardada');
    client = new Client();
    client.on('qr', (qr) => {
        // Generamos el qr para escanearlo
        qrcode.generate(qr, { small: true });
    });

    client.on('authenticated', (session) => {
        sessionData = session;
        fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function(err) {
            if (err) {
                console.log(err);
            }
        });
    });

    client.initialize();
};

/**
 * Esta funcion see ncarga de 
 */

/** */
(fs.existsSync(SESSION_FILE_PATH)) ? withSession(): withOutSession();