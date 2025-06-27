import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

export function Markdown({ content }: { content: string }) {
  return (
    <div className="prose prose-lg dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-4 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-4 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-3 scroll-m-20 text-2xl font-semibold tracking-tight">{children}</h3>
          ),
          p: ({ children }) => <p className="leading-7 [&:not(:first-child)]:mt-6">{children}</p>,
          ul: ({ children }) => <ul className="my-6 ml-6 list-disc [&>li]:mt-2">{children}</ul>,
          ol: ({ children }) => <ol className="my-6 ml-6 list-decimal [&>li]:mt-2">{children}</ol>,
          li: ({ children }) => <li className="mt-2">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="mt-6 border-l-2 pl-6 italic">{children}</blockquote>
          ),
          code: ({ children, className }) => {
            const isInline = !className?.includes("language-");

            if (isInline) {
              return (
                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                  {children}
                </code>
              );
            }

            return (
              <pre className="mb-4 mt-6 overflow-x-auto rounded-lg border bg-zinc-950 py-4">
                <code className="relative rounded px-4 font-mono text-sm text-zinc-50">
                  {children}
                </code>
              </pre>
            );
          },
          table: ({ children }) => (
            <div className="my-6 w-full overflow-y-auto">
              <table className="w-full">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead>{children}</thead>,
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => <tr className="m-0 border-t p-0 even:bg-muted">{children}</tr>,
          th: ({ children }) => (
            <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
