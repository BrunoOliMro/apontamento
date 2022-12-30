"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchBagde = void 0;
const select_1 = require("../services/select");
const cookieGenerator_1 = require("../utils/cookieGenerator");
const sanitize_1 = require("../utils/sanitize");
const searchBagde = async (req, res) => {
    const message = {
        generalError: 'Ocorreu um erro, tente novamente...',
        badgeSuccess: 'Success',
        badgeNotFound: 'Crachá não encontrado'
    };
    const badge = String((0, sanitize_1.sanitize)(req.body['values'])) || null;
    const lookForBadge = `SELECT TOP 1 [FUNCIONARIO], [CRACHA] FROM FUNCIONARIOS WHERE 1 = 1 AND [CRACHA] = '${badge}' ORDER BY FUNCIONARIO`;
    if (!badge) {
        return res.json({ message: message.badgeNotFound });
    }
    try {
        const resultBadgeSearch = await (0, select_1.select)(lookForBadge);
        if (resultBadgeSearch.length <= 0) {
            return res.json({ message: message.badgeNotFound });
        }
        else if (resultBadgeSearch.length > 0) {
            await (0, cookieGenerator_1.cookieGenerator)(res, resultBadgeSearch[0]);
            return res.json({ message: message.badgeSuccess });
        }
        else {
            return res.json({ message: message.badgeNotFound });
        }
    }
    catch (error) {
        console.log('Error on SearchBadge ', error);
        return res.json({ message: message.generalError });
    }
};
exports.searchBagde = searchBagde;
//# sourceMappingURL=searchBadge.js.map