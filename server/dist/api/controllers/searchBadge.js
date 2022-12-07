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
    if (!matricula || matricula === '') {
        return res.json({ message: "Empty badge" });
    }
    try {
        const selecionarMatricula = await (0, select_1.select)(lookForBadge);
        if (selecionarMatricula) {
            selecionarMatricula[0].startSetupTime = (0, encryptOdf_1.encrypted)(String(new Date().getTime()));
            await (0, cookieGenerator_1.cookieGenerator)(res, selecionarMatricula[0]);
            return res.json({ message: 'Badge found' });
        }
        else if (!selecionarMatricula) {
            return res.json({ message: 'Badge not found' });
        }
        else {
            return res.json({ message: 'Badge not found' });
        }
    }
    catch (error) {
        console.log(error);
        return res.json({ message: 'Error on searching for badge' });
    }
};
exports.searchBagde = searchBagde;
//# sourceMappingURL=searchBadge.js.map