import { sanitize } from "./sanitize";
//import { RequestHandler } from "express";
//import mssql from "mssql";
//import { sqlConfig } from "../../global.config";

export function unravelBarcode(barcode: string) {
    barcode = String(sanitize(barcode)) //|| null;
    //console.log("barcode", barcode );
    // barcode = '4418184181818'

    // if (barcode === '' || barcode === undefined || barcode === null) {
    //     return {}
    // }
    //console.log("linha 7 /unravel/", barcode);

    //Reatribuiu o codigo caso o cado de barras seja maior
    const dados = {
        numOdf: String(barcode!.slice(10)),
        numOper: String(barcode!.slice(0, 5)),
        codMaq: String(barcode!.slice(5, 10)),
    }

    if (barcode!.length > 17) {
        dados.numOdf = barcode!.slice(11)
        dados.numOper = barcode!.slice(0, 5)
        dados.codMaq = barcode!.slice(5, 11)
    }

    //console.log("linha 25", dados);

    //console.log("barcode", barcode);
    //console.log("dados linha 32", dados);
    //console.log("dados linha 33 ", dados);
    return dados
}


