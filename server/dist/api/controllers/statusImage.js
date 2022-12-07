"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusImage = void 0;
const pictures_1 = require("../pictures");
const select_1 = require("../services/select");
const codeNote_1 = require("../utils/codeNote");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const sanitize_1 = require("../utils/sanitize");
const statusImage = async (req, res) => {
    const numpec = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["CODIGO_PECA"]))) || null;
    const revisao = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['REVISAO']))) || null;
    const statusImg = String("_status");
    const codeMachine = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['CODIGO_MAQUINA']))) || null;
    const operationNumber = (0, decryptedOdf_1.decrypted)((0, sanitize_1.sanitize)(req.cookies['NUMERO_OPERACAO']));
    let odfNumber = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["NUMERO_ODF"]))) || null;
    const lookOnProcess = `SELECT TOP 1 [NUMPEC], [IMAGEM] FROM PROCESSO (NOLOCK) WHERE 1 = 1 AND NUMPEC = '${numpec}' AND REVISAO = '${revisao}' AND IMAGEM IS NOT NULL`;
    let imgResult = [];
    try {
        const x = await (0, codeNote_1.codeNote)(odfNumber, operationNumber, codeMachine);
        if (x === 'Ini Prod' || x === 'Pointed' || x === 'Rip iniciated') {
            const resource = await (0, select_1.select)(lookOnProcess);
            if (resource.length > 0) {
                try {
                    for await (let [i, record] of resource.entries()) {
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
            return res.json({ message: x });
        }
    }
    catch (error) {
        console.log(error);
        return res.json({ error: true, message: "Erro no servidor." });
    }
};
exports.statusImage = statusImage;
//# sourceMappingURL=statusImage.js.map