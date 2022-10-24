"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.returnedValue = void 0;
const mssql_1 = __importDefault(require("mssql"));
const global_config_1 = require("../../global.config");
const returnedValue = async (req, res) => {
    console.log(req.body);
    const connection = await mssql_1.default.connect(global_config_1.sqlConfig);
    let choosenOption = req.body['quantity'];
    let supervisor = req.body['supervisor'];
    let someC = req.body['returnValueStorage'];
    let boas;
    let ruins;
    req.body["codigoBarrasReturn"] = sanitize(req.body["codigoBarrasReturn"]);
    let barcode = req.body["codigoBarrasReturn"];
    function sanitize(input) {
        const allowedChars = /[A-Za-z0-9]/;
        return input && input.split("").map((char) => (allowedChars.test(char) ? char : "")).join("");
    }
    barcode = sanitize(barcode);
    if (barcode === undefined) {
        return res.redirect("/#/codigobarras?error=invalidBarcode");
    }
    if (barcode == '') {
        return res.redirect("/#/codigobarras?error=invalidBarcode");
    }
    if (supervisor === '') {
        return res.json({ message: "supervisor esta vazio" });
    }
    if (someC === 'BOAS') {
        boas = choosenOption;
    }
    if (someC === 'RUINS') {
        ruins = choosenOption;
    }
    if (boas === undefined) {
        boas = 0;
    }
    if (ruins === undefined) {
        ruins = 0;
    }
    const dados = {
        numOdf: Number(barcode.slice(10)),
        numOper: String(barcode.slice(0, 5)),
        codMaq: String(barcode.slice(5, 10)),
    };
    if (barcode.length > 17) {
        dados.numOdf = barcode.slice(11);
        dados.numOper = barcode.slice(0, 5);
        dados.codMaq = barcode.slice(5, 11);
    }
    choosenOption = sanitize(req.body["quantity"]);
    supervisor = sanitize(req.body["supervisor"]);
    let funcionario = String(req.cookies['FUNCIONARIO']);
    const resourceOdfData = await connection.query(`
    SELECT TOP 1
            [NUMERO_ODF],
            [NUMERO_OPERACAO],
            [CODIGO_MAQUINA],
            [CODIGO_CLIENTE],
            [QTDE_ODF],
            [CODIGO_PECA],
            [DT_INICIO_OP],
            [DT_FIM_OP],
            [QTDE_ODF],
            [QTDE_APONTADA],
            [DT_ENTREGA_ODF],
            [QTD_REFUGO],
            [HORA_INICIO],
            [HORA_FIM],
            [REVISAO]
            FROM VW_APP_APTO_PROGRAMACAO_PRODUCAO
            WHERE 1 = 1
            AND [NUMERO_ODF] = ${dados.numOdf}
            AND [CODIGO_MAQUINA] = '${dados.codMaq}'
            AND [NUMERO_OPERACAO] = ${dados.numOper}
            ORDER BY NUMERO_OPERACAO ASC`.trim()).then(result => result.recordset);
    if (resourceOdfData.length > 0) {
        let codigoPeca = String(resourceOdfData[0].CODIGO_PECA);
        let revisao = Number(resourceOdfData[0].REVISAO);
        let qtdLibMax = String(resourceOdfData[0].QTDE_ODF[0]);
        let faltante = Number(0);
        let retrabalhada = Number(0);
        const selectSuper = await connection.query(`
        SELECT TOP 1 CRACHA FROM VIEW_GRUPO_APT WHERE 1 = 1 AND CRACHA  = '${supervisor}'`).then(result => result.recordset);
        if (selectSuper.length > 0) {
            try {
                const insertHisCodReturned = await connection.query(`
                INSERT INTO HISAPONTA(DATAHORA, USUARIO, ODF, PECA, REVISAO, NUMOPE, NUMSEQ, CONDIC, ITEM, QTD, PC_BOAS, PC_REFUGA, ID_APONTA, LOTE, CODAPONTA, CAMPO1, CAMPO2,  TEMPO_SETUP, APT_TEMPO_OPERACAO, EMPRESA_RECNO, CST_PC_FALTANTE, CST_QTD_RETRABALHADA) 
                VALUES (GETDATE(), '${funcionario}', '${dados.numOdf}', '${codigoPeca}', ${revisao}, ${dados.numOper}, ${dados.numOper}, 'D', '${dados.codMaq}', ${qtdLibMax} , '0', '0', '${funcionario}', '0', '7', '7', 'Valor Estorn.', '0', '0', '1', ${faltante},${retrabalhada})`)
                    .then(record => record.recordset);
                await connection.query(`
                UPDATE PCP_PROGRAMACAO_PRODUCAO SET QTDE_APONTADA = QTDE_APONTADA - '${boas}', QTD_REFUGO = QTD_REFUGO - ${ruins} WHERE 1 = 1 AND NUMERO_ODF = '${dados.numOdf}' AND CAST (LTRIM(NUMERO_OPERACAO) AS INT) = '${dados.numOper}' AND CODIGO_MAQUINA = '${dados.codMaq}'`)
                    .then(record => record.recordset);
                if (!insertHisCodReturned) {
                    return res.json({ message: 'erro ao fazer estorno feito' });
                }
                else {
                    return res.status(200).json({ message: 'estorno feito' });
                }
            }
            catch (error) {
                console.log(error);
            }
            finally {
                await connection.close();
            }
            return res.status(400).redirect("/#/codigobarras?error=returnederror");
        }
    }
    else {
        return res.redirect("/#/codigobarras?error=returnederror");
    }
};
exports.returnedValue = returnedValue;
//# sourceMappingURL=returnedValue.js.map