"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pointBagde = void 0;
const select_1 = require("../services/select");
const encryptOdf_1 = require("../utils/encryptOdf");
const sanitize_1 = require("../utils/sanitize");
const pointBagde = async (req, res) => {
    let matricula = String((0, sanitize_1.sanitize)(req.body["cracha"])) || null;
    let start = new Date() || 0;
    if (!matricula) {
        return res.json({ message: "codigo de matricula vazia" });
    }
    try {
        let table = `FUNCIONARIOS`;
        let top = `TOP 1`;
        let column = `[MATRIC], [FUNCIONARIO], [CRACHA]`;
        let where = `AND [CRACHA] = '${matricula}'`;
        let orderBy = `ORDER BY FUNCIONARIO`;
        const selecionarMatricula = await (0, select_1.select)(table, top, column, where, orderBy);
        if (selecionarMatricula.length > 0) {
            const strStartTime = (0, encryptOdf_1.encrypted)(String(start.getTime()));
            const encryptedEmployee = (0, encryptOdf_1.encrypted)(String(selecionarMatricula[0].FUNCIONARIO));
            const encryptedBadge = (0, encryptOdf_1.encrypted)(String(selecionarMatricula[0].CRACHA));
            res.cookie("starterBarcode", strStartTime);
            res.cookie("FUNCIONARIO", encryptedEmployee);
            res.cookie("CRACHA", encryptedBadge);
            return res.json({ message: 'cracha encontrado' });
        }
        else {
            return res.json({ message: 'cracha não encontrado' });
        }
    }
    catch (error) {
        console.log(error);
        return res.json({ message: 'erro ao tentar localizar cracha' });
    }
    finally {
    }
};
exports.pointBagde = pointBagde;
//# sourceMappingURL=pointBagde.js.map