"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.codeNote = void 0;
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const insert_1 = require("../services/insert");
const select_1 = require("../services/select");
const cookieGenerator_1 = require("../utils/cookieGenerator");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const encryptOdf_1 = require("../utils/encryptOdf");
const unravelBarcode_1 = require("../utils/unravelBarcode");
const codeNote = async (req, res, next) => {
    let dados = (0, unravelBarcode_1.unravelBarcode)(req.body.barcode);
    let numeroOper = Number(dados.numOper.replaceAll('000', '')) || 0;
    let odfNumber = Number(dados.numOdf) || 0;
    let codMaq = String(dados.codMaq) || null;
    const funcionario = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['CRACHA']))) || null;
    let codigoPeca = String('' || null);
    if (!funcionario || funcionario === '') {
        console.log("funcionarario /codenote/", funcionario);
        return res.json({ message: 'Acesso negado' });
    }
    try {
        const lookForHisaponta = `SELECT TOP 1 USUARIO, NUMOPE, ITEM, CODAPONTA FROM HISAPONTA WHERE 1 = 1 AND ODF = ${odfNumber} AND NUMOPE = ${numeroOper} AND ITEM = '${codMaq}' ORDER BY DATAHORA DESC`;
        const codIdApontamento = await (0, select_1.select)(lookForHisaponta);
        let lastEmployee = codIdApontamento[0]?.USUARIO;
        let numeroOdfDB = codIdApontamento[0]?.ODF;
        let codigoOperDB = codIdApontamento[0]?.NUMOPE;
        let codigoMaqDB = codIdApontamento[0]?.ITEM;
        if (lastEmployee !== funcionario
            && dados.numOdf === numeroOdfDB
            && dados.numOper === codigoOperDB
            && dados.codMaq === codigoMaqDB) {
            console.log("usuario diferente");
            return res.json({ message: 'usuario diferente' });
        }
        let tempoDecorrido = 0;
        let revisao = String('' || null);
        let qtdLibMax = 0;
        let boas = 0;
        let ruins = 0;
        let faltante = Number(0);
        let retrabalhada = 0;
        let codAponta = 1;
        let descricaoCodAponta = 'Ini Setup.';
        let motivo = String('');
        let y = `SELECT TOP 1 * FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO WHERE 1 = 1 AND NUMERO_ODF = ${dados.numOdf} AND NUMERO_OPERACAO = ${numeroOper} AND CODIGO_MAQUINA = '${dados.codMaq}'`;
        if (codIdApontamento.length > 0) {
            const x = await (0, select_1.select)(y);
            if (codIdApontamento[0]?.CODAPONTA === 1 || codIdApontamento[0]?.CODAPONTA === 6) {
                req.body.message = `codeApont 1 setup iniciado`;
                next();
            }
            if (codIdApontamento[0]?.CODAPONTA === 2) {
                console.log("linha 100 /code note/");
                let descricaoCodigoAponta3 = '';
                let codAponta3 = 3;
                await (0, insert_1.insertInto)(funcionario, odfNumber, codigoPeca, revisao, dados.numOper, dados.codMaq, qtdLibMax, boas, ruins, codAponta3, descricaoCodigoAponta3, motivo, faltante, retrabalhada, Number(new Date().getTime() || 0));
                return res.json({ message: 'ferramentas selecionadas com successo' });
            }
            if (codIdApontamento[0]?.CODAPONTA === 3) {
                const z = await (0, encryptOdf_1.encrypted)(String(new Date().getDate()));
                res.cookie('startProd', z);
                await (0, cookieGenerator_1.cookieGenerator)(res, x[0]);
                return res.json({ message: `codeApont 3 prod Ini.` });
            }
            if (codIdApontamento[0]?.CODAPONTA === 4) {
                const z = await (0, encryptOdf_1.encrypted)(String(new Date().getDate()));
                res.cookie('startRip', z);
                await (0, cookieGenerator_1.cookieGenerator)(res, x[0]);
                return res.json({ message: `codeApont 4 prod finalzado` });
            }
            if (codIdApontamento[0]?.CODAPONTA === 5) {
                await (0, cookieGenerator_1.cookieGenerator)(res, x[0]);
                return res.json({ message: `codeApont 5 inicio de rip` });
            }
            if (codIdApontamento[0]?.CODAPONTA === 7) {
                return res.json({ message: `codigo de apontamento: 7 = máquina parada` });
            }
        }
        if (codIdApontamento.length <= 0) {
            const resultInsert = await (0, insert_1.insertInto)(funcionario, odfNumber, codigoPeca, revisao, dados.numOper, dados.codMaq, qtdLibMax, boas, ruins, codAponta, descricaoCodAponta, motivo, faltante, retrabalhada, tempoDecorrido);
            if (resultInsert === 'Algo deu errado') {
                return res.json({ message: 'Algo deu errado' });
            }
            next();
        }
    }
    catch (error) {
        return res.json({ message: 'Algo deu errado' });
    }
};
exports.codeNote = codeNote;
//# sourceMappingURL=codeNote.js.map