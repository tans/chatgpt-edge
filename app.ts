import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { Configuration, OpenAIApi } from "https://esm.sh/openai-edge@0.3.2";
import { encode } from "https://deno.land/x/gpt_2_3_tokenizer@v0.0.2/mod.js";

const router = new Router();

/**
 * Processes chat requests by sending them to the OpenAI GPT-3 API and returning the response.
 * Expects a JSON body with the following properties:
 * - key: OpenAI API key
 * - content: user message content
 * - prefix: optional prefix to add to the conversation
 * Returns TEXT
 */

const processChatRequest = async (ctx: any) => {
    const body = await ctx.request.body({ type: "json" }).value;
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

            ctx.response.body = data.error
                ? data.error.message
                : data.choices[0].message.content;
        } catch (error) {
            ctx.response.body = "服务出错,请重试";
            console.log(error);
            console.log(body);
            console.log(res);
        }
    } else {
        ctx.response.body = "你好";
    }
};

router.post("/api/chat", processChatRequest);

router.get("/", async (ctx) => {
    ctx.response.body = "运行中";
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener("listen", (e) =>
    console.log("Listening on http://localhost:8000")
);
await app.listen({ port: 8000 });
