"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchBagde = void 0;
const select_1 = require("../services/select");
const cookieGenerator_1 = require("../utils/cookieGenerator");
const encryptOdf_1 = require("../utils/encryptOdf");
const sanitize_1 = require("../utils/sanitize");
const searchBagde = async (req, res) => {
    let badge = String((0, sanitize_1.sanitize)(req.body['badge'])) || null;
    let lookForBadge = `SELECT TOP 1 [FUNCIONARIO], [CRACHA] FROM FUNCIONARIOS WHERE 1 = 1 AND [CRACHA] = '${badge}' ORDER BY FUNCIONARIO`;
    if (!badge || badge === '0' || badge === '00' || badge === '000' || badge === '0000' || badge === '00000' || badge === '000000') {
        return res.json({ message: 'Crachá não encontrado' });
    }
    try {
        const findBadge = await (0, select_1.select)(lookForBadge);
        if (findBadge.length <= 0) {
            return res.json({ message: 'Crachá não encontrado' });
        }
        else if (findBadge.length > 0) {
            let startSetupTime = (0, encryptOdf_1.encrypted)(String(new Date().getTime()));
            res.cookie('startSetupTime', startSetupTime, { httpOnly: true });
            await (0, cookieGenerator_1.cookieGenerator)(res, findBadge[0]);
            return res.json({ message: 'Badge found' });
        }
        else {
            return res.json({ message: 'Crachá não encontrado' });
        }
    }
    catch (error) {
        console.log('Error on SearchBadge ', error);
        return res.json({ message: 'Crachá não encontrado' });
    }
};
exports.searchBagde = searchBagde;
//# sourceMappingURL=searchBadge.js.map