import { encrypted } from './encryptOdf'

export const cookieGenerator = async (res: any, object: any) => {
    // Loop through an object to generate a cookie

    // console.log('obje', Object.entries(object[0]));

    for (const [key, value] of Object.entries(object)) {
        // console.log('key', key);
        // console.log('value', value);
        res.cookie(`${key}`, encrypted(String(value)), { httpOnly: true })
    }
}