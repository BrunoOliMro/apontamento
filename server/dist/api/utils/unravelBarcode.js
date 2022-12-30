"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unravelBarcode = void 0;
const sanitize_1 = require("./sanitize");
function unravelBarcode(barcode) {
    barcode = (0, sanitize_1.sanitize)(barcode).trim();
    let response = {
        message: '',
        data: {
            odfNumber: '',
            opNumber: '',
            machineCod: '',
        },
    };
    if (!barcode || barcode.length <= 16 || barcode.length > 18) {
        return response.message = '';
    }
    const dados = {
        numOdf: String(barcode.slice(10)),
        numOper: String(barcode.slice(0, 5)),
        codMaq: String(barcode.slice(5, 10)),
    };
    if (barcode.length > 17) {
        dados.numOdf = barcode.slice(11);
        dados.numOper = barcode.slice(0, 5);
        dados.codMaq = barcode.slice(5, 11);
    }
    response.message = 'Success';
    response.data.odfNumber = dados.numOdf;
    response.data.opNumber = dados.numOper;
    response.data.machineCod = dados.codMaq;
    return response;
}
exports.unravelBarcode = unravelBarcode;
//# sourceMappingURL=unravelBarcode.js.map