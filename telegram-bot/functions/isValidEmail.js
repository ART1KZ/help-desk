import validator from "validator";

export default function isValidEmail(email) {
    return validator.isEmail(email);
}