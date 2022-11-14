export const sanitize = (input?: string) => {
    const allowedChars = /[A-Za-z0-9' '.,-]/;
    return input && input.split("").map((char) => (allowedChars.test(char) ? char : "")).join("");
}