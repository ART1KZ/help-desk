import { Mistral } from "@mistralai/mistralai";

const mistral = new Mistral({
  apiKey: "MpmnR58kloi5lMzbPT1RG6DxoCZe5l5k",
});

async function getResponseFromAI(prompt) {
  const result = await mistral.chat.complete({
    model: "mistral-small-latest",
    messages: [
      {
        content:
          "Обязательно ответь на мой промпт в виде строки без форматирования, просто текст: " + prompt ,
        role: "user",
      },
    ],
  });

  // Handle the result
  console.log(result.choices[0].message.content);
  return result.choices[0].message.content;
}

await getResponseFromAI("топ стран по ввп")