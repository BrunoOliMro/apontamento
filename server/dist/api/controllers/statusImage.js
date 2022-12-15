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
        var numpec = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["CODIGO_PECA"]))) || null;
        var revisao = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['REVISAO']))) || null;
        var statusImg = String("_status");
        var codeMachine = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['CODIGO_MAQUINA']))) || null;
        var operationNumber = (0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['NUMERO_OPERACAO']));
        var odfNumber = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["NUMERO_ODF"]))) || null;
        var employee = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['FUNCIONARIO'])));
        var lookOnProcess = `SELECT TOP 1 [NUMPEC], [IMAGEM] FROM PROCESSO (NOLOCK) WHERE 1 = 1 AND NUMPEC = '${numpec}' AND REVISAO = '${revisao}' AND IMAGEM IS NOT NULL`;
        var imgResult = [];
    }
    catch (error) {
        console.log('Error on StatusImage --cookies--', error);
        return res.json({ message: 'Algo deu errado' });
    }
    try {
        const x = await (0, codeNote_1.codeNote)(odfNumber, operationNumber, codeMachine, employee);
        if (x.message === 'Ini Prod' || x.message === 'Pointed' || x.message === 'Rip iniciated' || x.message === 'Machine has stopped') {
            const resource = await (0, select_1.select)(lookOnProcess);
            if (resource.length > 0) {
                try {
                    for await (const [i, record] of resource.entries()) {
                        const rec = await record;
                        const path = await pictures_1.pictures.getPicturePath(rec["NUMPEC"], rec["IMAGEM"], statusImg, String(i));
                        imgResult.push(path);
                    }
                    return res.status(200).json(imgResult);
                }
                catch (error) {
                    console.log('error - statusimage -', error);
                    return res.json({ error: true, message: "Erro no servidor." });
                }
            }
            else {
                return res.json({ message: 'Status image not found' });
            }
        }
        else {
            return res.json({ message: x.message });
        }
    }
    catch (error) {
        console.log(error);
        return res.json({ error: true, message: "Erro no servidor." });
    }
};
exports.statusImage = statusImage;
//# sourceMappingURL=statusImage.js.map