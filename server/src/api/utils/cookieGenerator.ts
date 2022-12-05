import { encrypted } from "./encryptOdf"

export const cookieGenerator = async (res: any, object: any) => {
    // Loop through an object to generate a cookie
    for (const [key, value] of Object.entries(object)) {
        console.log(`${key} and ${value}`);
        res.cookie(`${key}`, encrypted(String(value)), { httpOnly: true })
    }
}