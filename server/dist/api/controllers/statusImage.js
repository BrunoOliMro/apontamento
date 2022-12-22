"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusImage = void 0;
const pictures_1 = require("../pictures");
const select_1 = require("../services/select");
const codeNote_1 = require("../utils/codeNote");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const sanitize_1 = require("../utils/sanitize");
const statusImage = async (req, res) => {
    try {
        var partCode = String((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['CODIGO_PECA'])))) || null;
        var revision = String((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['REVISAO'])))) || null;
        var machineCode = String((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['CODIGO_MAQUINA'])))) || null;
        var operationNumber = Number((0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['NUMERO_OPERACAO'])).replaceAll(' ', '')) || null;
        var odfNumber = Number((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['NUMERO_ODF'])))) || null;
        var employee = String((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['FUNCIONARIO'])))) || null;
        var stringSelectProcess = `SELECT TOP 1 [NUMPEC], [IMAGEM] FROM PROCESSO (NOLOCK) WHERE 1 = 1 AND NUMPEC = '${partCode}' AND REVISAO = '${revision}' AND IMAGEM IS NOT NULL`;
        var statuString = String('_status');
        var imgResult = [];
    }
    catch (error) {
        console.log('Error on StatusImage --cookies--', error);
        return res.json({ message: 'Algo deu errado' });
    }
    try {
        const pointCode = await (0, codeNote_1.codeNote)(odfNumber, operationNumber, machineCode, employee);
        if (pointCode.message === 'Ini Prod' || pointCode.message === 'Pointed' || pointCode.message === 'Rip iniciated' || pointCode.message === 'Machine has stopped') {
            const lookOnProcess = await (0, select_1.select)(stringSelectProcess);
            if (lookOnProcess.length > 0) {
                try {
                    for await (const [i, record] of lookOnProcess.entries()) {
                        const rec = await record;
                        const path = await pictures_1.pictures.getPicturePath(rec['NUMPEC'], rec['IMAGEM'], statuString, String(i));
                        imgResult.push(path);
                    }
                    return res.status(200).json(imgResult);
                }
                catch (error) {
                    console.log('Error - statusimage -', error);
                    return res.json({ error: true, message: 'Error' });
                }
            }
            else {
                return res.json({ message: 'Not found' });
            }
        }
        else {
            return res.json({ message: pointCode.message });
        }
    }
    catch (error) {
        console.log('Error on StatusImage', error);
        return res.json({ error: true, message: 'Error' });
    }
};
exports.statusImage = statusImage;
//# sourceMappingURL=statusImage.js.map