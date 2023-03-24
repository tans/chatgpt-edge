import { Configuration, OpenAIApi } from "https://esm.sh/openai-edge@0.3.2";
import { encode } from "https://deno.land/x/gpt_2_3_tokenizer@v0.0.2/mod.js";

export default async (request: Request) => {
    const body = await request.json();
    console.log(body);
    const { key, content, prefix, conversations } = body;
    let data: any = "";
    let res: any = "";

    const createSystemMessage = (messageContent: string) => ({
        role: "system",
        content: messageContent,
    });

    if (content && key) {
        const currentTimeMessage = createSystemMessage(
            "当前时间:" + new Date().toLocaleString()
        );
        const prefixMessage = prefix ? createSystemMessage(prefix) : null;
        const userMessage = { role: "user", content: content };

        const messages: any = [currentTimeMessage, prefixMessage].filter(
            Boolean
        );
        if (conversations && conversations.length > 0) {
            messages.push(...conversations);
        }
        messages.push(userMessage);

        try {
            const configuration = new Configuration({ apiKey: key });
            const openai = new OpenAIApi(configuration);
            const totalTokens = 4000;
            const messagesTokens = messages.reduce(
                (acc, message) => acc + encode(message.content).length,
                0
            );
            const maxTokens = totalTokens - messagesTokens;

            res = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                max_tokens: maxTokens,
                stream: false,
                messages: messages,
            });

            data = await res.json();

            console.log(data);

            return new Response(
                data.error
                    ? data.error.message
                    : data.choices[0].message.content
            );
        } catch (error) {
            console.log(error);
            console.log(body);
            console.log(res);
            return new Response("服务出错,请重试");
        }
    } else {
        return new Response("你好");
    }
};

export const config = { path: "/api/chat" };
