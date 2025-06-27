import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { AppSchema } from "@/instant.schema";
import { useChat } from "@ai-sdk/react";
import { InstaQLEntity } from "@instantdb/react";
import { useInViewport } from "@mantine/hooks";
import { ArrowDown, Send } from "lucide-react";
import { useEffect, useRef } from "react";
import { Markdown } from "./Markdown";

interface Props {
  portfolio: InstaQLEntity<AppSchema, "portfolios">;
  contexts: InstaQLEntity<AppSchema, "contexts">[];
}

export function Chat({ portfolio, contexts }: Props) {
  const { ref, inViewport } = useInViewport();
  const anchorRef = useRef<HTMLDivElement>(null);

  const { messages, input, append, handleInputChange, handleSubmit } = useChat({
    body: {
      portfolio,
      contexts,
    },
  });

  useEffect(() => {
    const visitorPrompt = `
Please concisely describe ${portfolio.name}'s background, skills, and key accomplishments based on the provided context.
`.trim();

    append({
      role: "user",
      content: visitorPrompt,
    });
  }, []);

  const scrollToBottom = () =>
    anchorRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });

  return (
    <Card className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col">
        <ScrollArea className="relative min-h-0 flex-1 overflow-auto px-6">
          {!inViewport && (
            <div className="absolute inset-x-0 bottom-0 flex justify-center pb-2">
              <Button size="icon" onClick={() => scrollToBottom()}>
                <ArrowDown size="1rem" />
              </Button>
            </div>
          )}
          {messages.map((message) => (
            <div key={message.id}>
              {message.role === "user" ? (
                <div className="flex justify-end">
                  <Card className="my-4 max-w-[600px] border-gray-100 bg-gray-100 shadow-none">
                    <div className="px-4 py-2">
                      <p>{message.content}</p>
                    </div>
                  </Card>
                </div>
              ) : (
                <Markdown content={message.content} />
              )}
            </div>
          ))}
          <div ref={ref}>
            <div ref={anchorRef} />
          </div>
        </ScrollArea>
        <form
          onSubmit={(e) => {
            handleSubmit(e);
            scrollToBottom();
          }}
          className="px-6 pb-4"
        >
          <div className="flex items-center gap-6">
            <Textarea
              name="prompt"
              value={input}
              placeholder="Ask anything"
              onChange={handleInputChange}
            />
            <Button type="submit" size="icon">
              <Send size="1rem" />
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}
