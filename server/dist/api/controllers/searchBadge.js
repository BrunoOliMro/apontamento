"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchBagde = void 0;
const select_1 = require("../services/select");
const encryptOdf_1 = require("../utils/encryptOdf");
const sanitize_1 = require("../utils/sanitize");
const searchBagde = async (req, res) => {
    let matricula = String((0, sanitize_1.sanitize)(req.body["badge"])) || null;
    let start = new Date() || 0;
    let lookForBadge = `SELECT TOP 1 [MATRIC], [FUNCIONARIO], [CRACHA] FROM FUNCIONARIOS WHERE 1 = 1 AND [CRACHA] = '${matricula}' ORDER BY FUNCIONARIO`;
    if (!matricula || matricula === '') {
        return res.json({ message: "Empty badge" });
    }
    try {
        const selecionarMatricula = await (0, select_1.select)(lookForBadge);
        if (selecionarMatricula) {
            const startSetupTime = (0, encryptOdf_1.encrypted)(String(start.getTime()));
            const encryptedEmployee = (0, encryptOdf_1.encrypted)(String(selecionarMatricula[0].FUNCIONARIO));
            const encryptedBadge = (0, encryptOdf_1.encrypted)(String(selecionarMatricula[0].CRACHA));
            res.cookie("startSetupTime", startSetupTime);
            res.cookie("employee", encryptedEmployee);
            res.cookie("badge", encryptedBadge);
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