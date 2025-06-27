import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { z } from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const schema = z.object({
  messages: z.any(),
  portfolio: z.object({
    slug: z.string(),
    name: z.string(),
    about: z.string(),
  }),
  contexts: z.array(
    z.object({
      name: z.string(),
      value: z.string(),
    }),
  ),
});

export async function POST(req: Request) {
  const { messages, portfolio, contexts } = schema.parse(await req.json());

  const openai = createOpenAI({
    apiKey: process.env.OPEN_AI_API_KEY,
  });

  const systemPrompt = `
You are an interactive portfolio. Your job is to teach people about the portfolio owner and their accomplishments.
You have the following data about the portfolio owner:
- Name: ${portfolio.name}
- About: ${portfolio.about}
- Context items:
${contexts.map((c) => `  • ${c.name}: ${c.value}`).join("\n")}

Always answer questions using only this data.  
Feel free to mildly deduce unbiased information about the portfolio's owner.
No matter what you are asked try to answer it in a conversational way.
Be sure to highlight the impact and skills of the owner and make positive signals known.
Negative signals should be treated in a neutral manner.
You need to be an honest reflection to help people know the portfolio owner more.
When asked to summarize, produce a concise, bullet-point list of their key background, skills, and accomplishments.  
If a visitor asks about a specific context item, dive into that section exactly as provided.
`.trim();

  const result = streamText({
    model: openai("gpt-4-turbo"),
    system: systemPrompt,
    messages,
  });

  return result.toDataStreamResponse({
    getErrorMessage: (err) => JSON.stringify(err),
  });
}
