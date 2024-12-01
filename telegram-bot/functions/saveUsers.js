import fs from "fs/promises";
import "dotenv/config"

export default async function saveUsers(users) {
    try {
        await fs.writeFile(process.env.USERS_PATH, JSON.stringify(users, null, 4));
    } catch (error) {
        console.error("Ошибка сохранения пользователей:", error);
    }
}