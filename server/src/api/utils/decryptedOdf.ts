export const decrypted = (numeroOdfCookies: string) =>{
    const crypto = require('crypto')
    const algorithm = process.env['ALGORITH_ENCRYPTED']
    const key = process.env['SECRET_ODF_KEY']
    const iv = process.env['IV']
    const decypher = crypto.createDecipheriv(algorithm, key, iv)
    var decrypted = decypher.update(numeroOdfCookies, 'hex', 'utf-8')
    decrypted += decypher.final('utf-8')
    return decrypted
}