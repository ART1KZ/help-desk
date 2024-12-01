import fs from "fs/promises";
import "dotenv/config"

export default async function loadUsers() {
    try {
        const data = await fs.readFile(process.env.USERS_PATH, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Ошибка загрузки пользователей:", error);
        return {};
    }
}