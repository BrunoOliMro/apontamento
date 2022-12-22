"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawing = void 0;
const pictures_1 = require("../pictures");
const select_1 = require("../services/select");
const codeNote_1 = require("../utils/codeNote");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const sanitize_1 = require("../utils/sanitize");
const drawing = async (req, res) => {
    try {
        var odfNumber = Number((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['NUMERO_ODF'])))) || null;
        var operationNumber = Number((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['NUMERO_OPERACAO']))).replaceAll(' ', '')) || null;
        var machineCode = String((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['CODIGO_MAQUINA'])))) || null;
        var revision = String((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['REVISAO'])))) || null;
        var partCode = String((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['CODIGO_PECA'])))) || null;
        var drawingString = String('_desenho');
        var employee = String((0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['FUNCIONARIO'])))) || null;
        var lookForImages = `SELECT DISTINCT [NUMPEC], [IMAGEM] FROM QA_LAYOUT (NOLOCK) WHERE 1 = 1 AND NUMPEC = '${partCode}' AND REVISAO = ${revision} AND IMAGEM IS NOT NULL`;
    }
    catch (error) {
        console.log('Error on Drawing --cookies--', error);
        return res.json({ message: 'Algo deu errado' });
    }
    try {
        const pointedCode = await (0, codeNote_1.codeNote)(odfNumber, operationNumber, machineCode, employee);
        if (pointedCode.message === 'Ini Prod' || pointedCode.message === 'Pointed' || pointedCode.message === 'Rip iniciated' || pointedCode.message === 'Machine has stopped') {
            const resource = await (0, select_1.select)(lookForImages);
            const imgResult = [];
            for await (const [i, record] of resource.entries()) {
                const rec = await record;
                const path = await pictures_1.pictures.getPicturePath(rec['NUMPEC'], rec['IMAGEM'], drawingString, String(i));
                imgResult.push(path);
            }
            return res.status(200).json(imgResult);
        }
        else {
            return res.json({ message: pointedCode.message });
        }
    }
    catch (error) {
        console.log(error);
        return res.json({ error: true, message: 'Algo deu errado' });
    }
};
exports.drawing = drawing;
//# sourceMappingURL=drawing.js.map