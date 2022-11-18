"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.codeNote = void 0;
const mssql_1 = __importDefault(require("mssql"));
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const global_config_1 = require("../../global.config");
const insert_1 = require("../services/insert");
const decodeOdf_1 = require("../utils/decodeOdf");
const decryptedOdf_1 = require("../utils/decryptedOdf");
const unravelBarcode_1 = require("../utils/unravelBarcode");
const codeNote = async (req, res, next) => {
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    let dados = (0, unravelBarcode_1.unravelBarcode)(req.body.codigoBarras);
    const funcionario = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['FUNCIONARIO']))) || null;
    let codigoPeca = String('' || null);
    if (!funcionario || funcionario === '') {
        console.log("funcionarario /codenote/", funcionario);
        return res.json({ message: 'Acesso negado' });
    }
    if (!dados) {
        console.log("linha 24");
        const numeroOdfCookies = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['NUMERO_ODF']))) || null;
        const codigoOper = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['NUMERO_OPERACAO']))) || null;
        const codigoMaq = (0, decryptedOdf_1.decrypted)(String((0, sanitize_html_1.default)(req.cookies['CODIGO_MAQUINA']))) || null;
        dados.numOdf = numeroOdfCookies;
        dados.numOper = codigoOper;
        dados.codMaq = codigoMaq;
        const encodedOdfString = (0, decodeOdf_1.decodedBuffer)(String((0, sanitize_html_1.default)(req.cookies['encodedOdfString'])));
        if (encodedOdfString === numeroOdfCookies) {
            next();
        }
        else {
            return res.json({ message: 'Acesso negado' });
        }
    }
    console.log('linha 44', dados.numOdf);
    console.log('linha 44', dados.numOper);
    console.log('linha 44', dados.codMaq);
    try {
        console.log("linha 45 /codenote/");
        const codIdApontamento = await connection.query(`
            SELECT 
            TOP 1
            USUARIO,
            ODF,
            NUMOPE, 
            ITEM,
            CODAPONTA 
            FROM
            HISAPONTA
            (NOLOCK)
            WHERE 1 = 1 
            AND ODF = ${dados.numOdf}
            AND NUMOPE = '${dados.numOper}'
            AND ITEM = '${dados.codMaq}'
            ORDER BY DATAHORA DESC
            `)
            .then(result => result.recordset);
        console.log("linha 64 /codenote/");
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
        let numeroOdf = Number(dados.numOdf);
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
        var obj = {
            message: ''
        };
        console.log("linha 95 /code note/");
        if (codIdApontamento.length > 0) {
            if (codIdApontamento[0]?.CODAPONTA === 1) {
                req.body.message = `codeApont 1 setup iniciado`;
                next();
            }
            if (codIdApontamento[0]?.CODAPONTA === 2) {
                console.log("linha 100 /code note/");
                obj.message = `codeApont 2 setup finalizado`;
                req.body.message = `codeApont 2 setup finalizado`;
                next();
            }
            if (codIdApontamento[0]?.CODAPONTA === 3) {
                req.body.message = `codeApont 3 prod iniciado`;
                next();
            }
            if (codIdApontamento[0]?.CODAPONTA === 4) {
                req.body.message = `codeApont 4 prod finalzado`;
                next();
            }
            if (codIdApontamento[0]?.CODAPONTA === 5) {
                req.body.message = `codeApont 5 maquina parada`;
                next();
            }
            if (codIdApontamento[0]?.CODAPONTA === 6) {
                req.body.message = `codeApont 1 setup iniciado`;
                const insertResponse = await (0, insert_1.insertInto)(funcionario, numeroOdf, codigoPeca, revisao, dados.numOper, dados.codMaq, qtdLibMax, boas, ruins, codAponta, descricaoCodAponta, motivo, faltante, retrabalhada, tempoDecorrido);
                if (insertResponse === 'Algo deu errado') {
                    return res.json({ message: 'Algo deu errado' });
                }
                next();
            }
            if (codIdApontamento[0]?.CODAPONTA === 7) {
                req.body.message = `codeApont 1 setup iniciado`;
                next();
            }
            if (lastEmployee !== funcionario && codIdApontamento[0]?.CODAPONTA === 6) {
                console.log("chaamr outra função");
                req.body.message = `codeApont 1 setup iniciado`;
            }
        }
        if (codIdApontamento.length <= 0) {
            const resultInsert = await (0, insert_1.insertInto)(funcionario, numeroOdf, codigoPeca, revisao, dados.numOper, dados.codMaq, qtdLibMax, boas, ruins, codAponta, descricaoCodAponta, motivo, faltante, retrabalhada, tempoDecorrido);
            if (resultInsert === 'Algo deu errado') {
                return res.json({ message: 'Algo deu errado' });
            }
            next();
        }
    }
    catch (error) {
        return res.json({ message: 'Algo deu errado' });
    }
    finally {
    }
};
exports.codeNote = codeNote;
//# sourceMappingURL=codeNote.js.map