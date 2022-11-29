export const encrypted = (numeroOdf: string | number) =>{
    const crypto = require('crypto')
    const algorithm = process.env['ALGORITH_ENCRYPTED']
    const key = process.env['SECRET_ODF_KEY']
    const iv = process.env['IV']
    const anotherCrypto = crypto.createCipheriv(algorithm, key, iv)
    let criptoOdfString = anotherCrypto.update(numeroOdf, 'utf-8', 'hex')
    criptoOdfString += anotherCrypto.final('hex')
    return criptoOdfString
}