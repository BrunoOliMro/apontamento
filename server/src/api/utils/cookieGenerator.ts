import { message } from '../services/message'
import { encrypted } from './encryptOdf'

export const cookieGenerator = async (res: any, object: any) => {
    // Loop through an object to generate a cookie
    if(!object){
        return message(0)
    }
    
    for (const [key, value] of Object.entries(object)) {
        if(key === 'NUMERO_ODF'){
            res.cookie(`${key}`, encrypted(String(value)))
        } else {
            res.cookie(`${key}`, encrypted(String(value)), { httpOnly: true })
        }
    }
}