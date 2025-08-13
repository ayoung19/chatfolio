import { db } from "@/lib/db/admin";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { z } from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const schema = z.object({
  messages: z.any(),
  portfolioId: z.string(),
});

export async function POST(req: Request) {
  const { messages, portfolioId } = schema.parse(await req.json());

  const [portfoliosQuery, resumeQuery] = await Promise.all([
    db.query({
      portfolios: {
        $: {
          where: {
            id: portfolioId,
          },
        },
        contexts: {},
      },
    }),
    db.query({
      $files: {
        $: {
          where: {
            path: `${portfolioId}/resume.pdf`,
          },
        },
      },
    }),
  ]);

  const portfolio = portfoliosQuery.portfolios[0];

  const openai = createOpenAI({
    apiKey: process.env.OPEN_AI_API_KEY,
  });

  const systemPrompt = `
You are an interactive portfolio. Your job is to teach people about the portfolio owner and their accomplishments.
You have the following data about the portfolio owner:
- Name: ${portfolio.name}
- About: ${portfolio.about}
- LinkedIn URL: ${portfolio.linkedin || "Not Provided"}
- Github URL: ${portfolio.github || "Not Provided"}
- Resume URL: ${resumeQuery.$files[0].url}
- Context items:
${portfolio.contexts.map((c) => `  • ${c.name}: ${c.value}`).join("\n")}

IMPORTANT: If the portfolio contains minimal information, spam content, or lacks meaningful context about the person's background, skills, or accomplishments, respond briefly with: "The portfolio owner hasn't provided enough information to share meaningful insights about their background and accomplishments. Please ask them to add more details to their portfolio."

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
