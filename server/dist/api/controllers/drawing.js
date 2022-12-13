"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawing = void 0;
const pictures_1 = require("../pictures");
const select_1 = require("../services/select");
const codeNote_1 = require("../utils/codeNote");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const sanitize_1 = require("../utils/sanitize");
const drawing = async (req, res) => {
    const odfNumber = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["NUMERO_ODF"]))) || null;
    const operationNumber = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['NUMERO_OPERACAO']))) || null;
    const codeMachine = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['CODIGO_MAQUINA']))) || null;
    const revisao = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['REVISAO']))) || null;
    const numpec = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies["CODIGO_PECA"]))) || null;
    const desenho = String("_desenho");
    const employee = (0, decryptedOdf_1.decrypted)(String((0, sanitize_1.sanitize)(req.cookies['FUNCIONARIO']))) || null;
    const lookForImages = `SELECT DISTINCT [NUMPEC], [IMAGEM] FROM QA_LAYOUT (NOLOCK) WHERE 1 = 1 AND NUMPEC = '${numpec}' AND REVISAO = ${revisao} AND IMAGEM IS NOT NULL`;
    try {
        const x = await (0, codeNote_1.codeNote)(odfNumber, operationNumber, codeMachine, employee);
        if (x.message === 'Ini Prod' || x.message === 'Pointed' || x.message === 'Rip iniciated' || x.message === 'Machine has stopped') {
            const resource = await (0, select_1.select)(lookForImages);
            const imgResult = [];
            for await (const [i, record] of resource.entries()) {
                const rec = await record;
                const path = await pictures_1.pictures.getPicturePath(rec["NUMPEC"], rec["IMAGEM"], desenho, String(i));
                imgResult.push(path);
            }
            return res.status(200).json(imgResult);
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
exports.drawing = drawing;
//# sourceMappingURL=drawing.js.map