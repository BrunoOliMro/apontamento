import { decrypted } from "../utils/decryptedOdf"
import { sanitize } from "../utils/sanitize";

export const inicializer = async (req: any) => {
    var response: any = {
        body: {},
        cookies: {},
    }

    if (Object.keys(req.body).length > 0) {
        for (const [key, value] of Object.entries(req.body.values)) {
            response.body[key] = !sanitize(value) ? null : sanitize(value);
        }
    }

    if (Object.keys(req.cookies).length > 0) {
        for (const [key, value] of Object.entries(req.cookies)) {
            response.cookies[key] = !decrypted(sanitize(value)) ? null : decrypted(sanitize(value));
        }
    }

    return response
}