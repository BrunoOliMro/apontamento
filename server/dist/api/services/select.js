"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectDrawing = void 0;
const selectDrawing = (numpec, revisao) => {
    const queryDrawing = `
    SELECT
    DISTINCT
        [NUMPEC],
        [IMAGEM],
        [REVISAO]
    FROM  QA_LAYOUT(NOLOCK) 
    WHERE 1 = 1 
        AND NUMPEC = '${numpec}'
        AND REVISAO = ${revisao}
        AND IMAGEM IS NOT NULL`;
    return queryDrawing;
};
exports.selectDrawing = selectDrawing;
//# sourceMappingURL=select.js.map