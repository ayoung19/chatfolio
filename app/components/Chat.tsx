import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { AppSchema } from "@/instant.schema";
import { useChat } from "@ai-sdk/react";
import { InstaQLEntity } from "@instantdb/react";
import { useEffect } from "react";

interface Props {
  portfolio: InstaQLEntity<AppSchema, "portfolios">;
  contexts: InstaQLEntity<AppSchema, "contexts">[];
}

export function Chat({ portfolio, contexts }: Props) {
  const { messages, input, append, handleInputChange, handleSubmit } = useChat({
    body: {
      portfolio,
      contexts,
    },
  });

  useEffect(() => {
    const visitorPrompt = `
Please concisely summarize ${portfolio.name}'s background, skills, and key accomplishments based on the provided context.
`.trim();

    append({
      role: "user",
      content: visitorPrompt,
    });
  }, []);

  return (
    <Card>
      <div className="px-6 py-4">
        {messages.map((message) => (
          <div key={message.id}>
            {message.role === "user" ? "User: " : "AI: "}
            {message.content}
          </div>
        ))}
        <form onSubmit={handleSubmit}>
          <Textarea
            name="prompt"
            value={input}
            placeholder="Ask anything"
            onChange={handleInputChange}
          />
          <button type="submit">Submit</button>
        </form>
      </div>
    </Card>
  );
}
