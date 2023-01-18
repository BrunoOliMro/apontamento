import { decrypted } from "../utils/decryptedOdf"
import { sanitize } from "../utils/sanitize"

export const inicializer = async (req: any) => {
    // console.log('sanitize,', sanitize(req.body.values));
    var response: any = {
        body: {},
        cookies: {},
    }

    // console.log('req.body', req.body);
    // console.log('req.cookis', req.cookies);
    
    if (Object.keys(req.body).length > 0) {
        for (const [key, value] of Object.entries(req.body.values)) {
            const sanitizedValue: any = !sanitize(value) ? null : sanitize(value);
            response.body[key] = sanitizedValue
        }
    }

    if (Object.keys(req.cookies).length > 0) {
        for (const [key, value] of Object.entries(req.cookies)) {
            const sanitizedValue: any = !decrypted(sanitize(value)) ? null : decrypted(sanitize(value));
            response.cookies[key] = sanitizedValue
        }
    }

    return response
}