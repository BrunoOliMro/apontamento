"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchBagde = void 0;
const select_1 = require("../services/select");
const cookieGenerator_1 = require("../utils/cookieGenerator");
const encryptOdf_1 = require("../utils/encryptOdf");
const sanitize_1 = require("../utils/sanitize");
const searchBagde = async (req, res) => {
    let matricula = String((0, sanitize_1.sanitize)(req.body["badge"])) || null;
    let lookForBadge = `SELECT TOP 1 [FUNCIONARIO], [CRACHA] FROM FUNCIONARIOS WHERE 1 = 1 AND [CRACHA] = '${matricula}' ORDER BY FUNCIONARIO`;
    if (!matricula || matricula === '0' || matricula === '00' || matricula === '000' || matricula === '0000' || matricula === '00000' || matricula === '000000') {
        return res.json({ message: "Empty badge" });
    }
    try {
        const selecionarMatricula = await (0, select_1.select)(lookForBadge);
        if (selecionarMatricula.length <= 0) {
            return res.json({ message: 'Crachá não encontrado' });
        }
        else if (selecionarMatricula.length >= 0) {
            let startSetupTime = (0, encryptOdf_1.encrypted)(String(new Date().getTime()));
            res.cookie('startSetupTime', startSetupTime, { httpOnly: true });
            await (0, cookieGenerator_1.cookieGenerator)(res, selecionarMatricula[0]);
            return res.json({ message: 'Badge found' });
        }
        else {
            return res.json({ message: 'Crachá não encontrado' });
        }
    }
    catch (error) {
        console.log(error);
        return res.json({ message: 'Crachá não encontrado' });
    }
};
exports.searchBagde = searchBagde;
//# sourceMappingURL=searchBadge.js.map