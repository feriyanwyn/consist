const OpenAI = require("openai");

const client = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY
});

module.exports = {
    generateSummary: async (text) => {
        try {
            const completion = await client.chat.completions.create({
                model: "deepseek-chat",
                messages: [
                    {
                        role: "system",
                        content: "You are an AI that generates short, clear summaries."
                    },
                    {
                        role: "user",
                        content: `Summarize this content:\n${text}`
                    }
                ]
            });

            return completion.choices[0].message.content;

        } catch (err) {
            console.error("DeepSeek API error:", err);
            return "(AI summary unavailable)";
        }
    }
};
