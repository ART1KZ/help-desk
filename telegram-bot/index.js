import { Telegraf, Markup } from "telegraf";
import { createClient } from "@supabase/supabase-js";

import loadUsers from "./functions/loadUsers.js";
import saveUsers from "./functions/saveUsers.js";
import generateCode from "./functions/generateCode.js";
import isValidEmail from "./functions/isValidEmail.js";
import sendVerificationEmail from "./functions/sendVerificationEmail.js";

import "dotenv/config";


const bot = new Telegraf(process.env.BOT_TOKEN);
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_AUTH
);

const webAppURL = "https://probka-project.ru/"

bot.start(async (ctx) => {

    // загрузка из users.json
    const users = await loadUsers();
    const { data, error } = await supabase
        .from("users")
        .select()
        // проверка на наличие пользователя в базе
        .eq("telegram_id", String(ctx.from.id));

    if (error) console.error("Ошибка Supabase:", error);

    if (!data || data.length === 0) {
        users[ctx.from.id] = {
            phone: null,
            email: null,
            status: "awaiting_phone",
        }; // Новый статус
        await saveUsers(users);
        return ctx.reply(
            'Добро пожаловать в Help Desk!\nЧтобы начать, отправьте свой номер телефона, используя кнопку "Зарегистрироваться".',
            Markup.keyboard([
                Markup.button.contactRequest("Зарегистрироваться"),
            ]).resize()
        );
    }

    ctx.reply(
        `С возвращением, ${ctx.from.first_name}!`,
        Markup.inlineKeyboard([
            Markup.button.webApp(
                "Открыть Help Desk",
                webAppURL
            ),
        ])
    );
});

// ответ на получение контакта (номера телефона)
bot.on("contact", async (ctx) => {
    const users = await loadUsers();
    const user = users[ctx.from.id];

    if (!user || user.status !== "awaiting_phone") {
        return ctx.reply(
            "Пожалуйста, зарегистрируйтесь, используя команду /start."
        );
    }

    user.phone = ctx.update.message.contact.phone_number;
    user.status = "awaiting_email"; // переход к следующему этапу
    await saveUsers(users);

    ctx.reply(
        "Мы получили ваш номер телефона. Теперь введите ваш email для завершения регистрации. Пример: example@gmail.com",
        Markup.removeKeyboard()
    );
});

bot.on('callback_query', async ctx => {
    const buttonClass = ctx.callbackQuery.data

    if (buttonClass === 'ai') {
        ctx.reply(
            "Введите ваш вопрос: ",
            Markup.removeKeyboard()
        );
    }
})

// обработка текстовых сообщений (email и код)
bot.on("text", async (ctx) => {
    const users = await loadUsers();
    const user = users[ctx.from.id];

    // проверка на наличие пользователя в базе данных
    // const { data, error } = await supabase
    //     .from("users")
    //     .select()
    //     .eq("telegram_id", String(ctx.from.id));

    // if (!data || data.length === 0) {
    //     // Если пользователь не найден в базе, просьба зарегистрироваться
    //     return ctx.reply('Пожалуйста, зарегистрируйтесь, используя команду /start');
    // }

    const text = ctx.message.text.trim();

    // проверяем статус пользователя перед тем, как валидировать email
    if (user?.status === "awaiting_email") {
        if (isValidEmail(text)) {
            // если email корректный, продолжаем регистрацию
            const code = generateCode("nums", 5);
            user.code = code;
            user.email = text;
            user.status = "awaiting_code";
            await saveUsers(users);

            const emailSent = await sendVerificationEmail(text, code);
            if (emailSent) {
                return ctx.reply(
                    "Мы отправили код подтверждения на ваш email. Пожалуйста, проверьте почту и введите код ниже."
                );
            } else {
                return ctx.reply(
                    "Произошла ошибка при отправке письма. Убедитесь, что ваш email указан верно или попробуйте позже. " +
                        "Чтобы повторить попытку регистрации введите команду /start"
                );
            }
        } else {
            // если email некорректный
            return ctx.reply(
                "Неверный формат email. Пожалуйста, введите корректный адрес. Пример: example@gmail.com"
            );
        }
    } else if (user?.status === "awaiting_code") {
        // обработка кода подтверждения
        if (text === user.code) {
            ctx.reply(
                "Ваш email подтвержден. Вы успешно зарегистрированы!",
                Markup.inlineKeyboard([ 
                    Markup.button.webApp("Открыть Help Desk", webAppURL)
                ])
            );

            const { error } = await supabase.from("users").insert({
                telegram_id: ctx.from.id,
                phone_number: user.phone,
                email: user.email,
            });

            if (error)
                console.error("Ошибка сохранения данных в Supabase:", error);

            delete users[ctx.from.id];
            await saveUsers(users);
        } else {
            return ctx.reply(
                "Неверный код подтверждения. Пожалуйста, проверьте код и попробуйте снова."
            );
        }
    } else {
        return ctx.reply(
            "Пожалуйста, следуйте инструкциям бота. Чтобы начать заново, используйте команду /start."
        );
    }
});

bot.launch(); 