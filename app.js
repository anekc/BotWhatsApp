const fs = require('fs');
const { Client, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const ora = require('ora');
const chalk = require('chalk');
const exceljs = require('exceljs');
const moment = require('moment');
const SESSION_FILE_PATH = './session.json';
let client;
let sessionData;

const app = express();


app.use(express.urlencoded({ extended: true }));




const withSession = () => {

    // si existe el archivo json con las credenciales

    const spinner = ora(`Cargando ${chalk.yellow('Validando sesión con whatsApp')}`);
    sessionData = require(SESSION_FILE_PATH);
    spinner.start();
    client = new Client({ session: sessionData });

    client.on('ready', () => {
        console.log('  client is ready');
        spinner.stop();
        listenMessage();

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
 * Esta funcion see ncarga de escuchar cuando recibimos un mensaje
 */

const listenMessage = () => {
    client.on('message', (msg) => {
        const { from, to, body } = msg;

        /**Preguntas frecuentes */

        switch (body.toLowerCase()) {
            case 'hola':
                sendMedia(from, 'LFD.png');
                sendMessage(from, 'Gracias por contactarnos, Yo puedo ayudarte con tu trámite');
                break;
            case 'info':
                sendMessage(from, 'Que trámite necesitas? Nuevo ingreso , Refrendo, Categoría adicional');
                break;
            case 'adios':
                sendMessage(from, 'Cuidate, hasta pronto');
                break;

            case 'nuevo ingreso':
                sendMessage(from, 'Para esto necesitas IFE, CURP, ACTA DE NACIMIENTO, COMPORBANTE DE DOMICILIO, y una licencia estatal ');
                break;
            case 'refrendo':
                sendMessage(from, 'Para esto necesitas IFE, CURP, ACTA DE NACIMIENTO, COMPORBANTE DE DOMICILIO, y tu Licencia Federal ');
                break;
            case '1':
                sendMessage(from, 'Para esto necesitas IFE, CURP, ACTA DE NACIMIENTO, COMPORBANTE DE DOMICILIO, y una licencia estatal ');
                break;

            case 'ola':
                sendMessage(from, 'Ola es una Onda de gran amplitud que se forma en la superficie del agua a causa del viento o de las corrientes , Hola es para saludar escriba  bien señor ');
                break;

            case 'medico tercero':
                sendMessage(from, 'Ola es una Onda de gran amplitud que se forma en la superficie del agua a causa del viento o de las corrientes , Hola es para saludar escriba  bien señor ');
                break;


        }

        saveHistory(from, body);
        console.log(`${chalk.yellow(body) }`);


    });
};


const sendMedia = (to, file) => {
    const mediaFile = MessageMedia.fromFilePath(`./media/${file}`);
    client.sendMessage(to, mediaFile);

};

const sendMessage = (to, message) => {

    client.sendMessage(to, message);
};

const saveHistory = (number, message) => {

    const pathChat = `./chats/${ number}.xlsx`;
    const workbook = new exceljs.Workbook();
    const today = moment().format('DD-MM-YYY hh:mm');
    if (fs.existsSync(pathChat)) {
        workbook.xlsx.readFile(pathChat)
            .then(() => {
                const worksheet = workbook.getWorksheet(1);
                const lastRow = worksheet.lastRow;
                let getRowInsert = worksheet.getRow(++(lastRow.number));
                getRowInsert.getCell('A').value = today;
                getRowInsert.getCell('B').value = message;
                getRowInsert.commit();
                workbook.xlsx.writeFile(pathChat)
                    .then(() => {
                        console.log('Se agrego chat');
                    })
                    .catch(() => {
                        console.log('Error al guardar');

                    });
            });

    } else {
        const worksheet = workbook.addWorksheet('Chats');
        worksheet.colums = [{
                header: 'Fecha',
                key: 'date'
            },
            {
                header: 'Mensaje',
                key: 'message'

            }
        ];
        worksheet.addRow([today, message]);
        workbook.xlsx.writeFile(pathChat)
            .then(() => {
                console.log('Historial Creado');
            })
            .catch(() => {
                console.log('algo falló!');
            });
    }
}

/** */
(fs.existsSync(SESSION_FILE_PATH)) ? withSession(): withOutSession();