import crypto from "crypto";

export default function generateCode(type, length) {
    const charsets = {
        nums: "0123456789",
        password:
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+[]{}|;:,.<>?';",
    };
    const charset = charsets[type];
    if (!charset) throw new Error("Неверный тип для генерации кода");

    return Array.from({ length })
        .map(() => charset[crypto.randomInt(0, charset.length)])
        .join("");
}