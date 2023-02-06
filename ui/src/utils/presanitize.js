export default function blockForbiddenChars (e) {
    e.target.value = preSanitize(e.target.value);
};

const preSanitize = (input) => {
    const allowedChars = /[A-Za-z0-9.]/;
    const sanitizedOutput = input
        .split("")
        .map((char) => (allowedChars.test(char) ? char : ""))
        .join("");
    return sanitizedOutput;
};
