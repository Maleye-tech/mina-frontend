import type { ReactNode } from "react";

const INLINE_PATTERN = /(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  for (const match of text.matchAll(INLINE_PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) nodes.push(text.slice(lastIndex, index));
    const token = match[0];
    if (token.startsWith("**")) {
      nodes.push(<strong key={`b${key++}`}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`")) {
      nodes.push(
        <code
          key={`c${key++}`}
          className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[12px] dark:bg-white/10"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("[")) {
      const split = token.indexOf("](");
      const label = token.slice(1, split);
      const href = token.slice(split + 2, -1);
      nodes.push(
        <a
          key={`a${key++}`}
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          className="font-bold text-care underline underline-offset-2"
        >
          {label}
        </a>,
      );
    } else {
      nodes.push(<em key={`i${key++}`}>{token.slice(1, -1)}</em>);
    }
    lastIndex = index + token.length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

type Block =
  | { type: "heading"; level: number; text: string }
  | { type: "bullets"; items: string[] }
  | { type: "ordered"; items: string[] }
  | { type: "paragraph"; lines: string[] };

function parseBlocks(content: string): Block[] {
  const blocks: Block[] = [];
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  let paragraph: string[] = [];

  const flush = () => {
    if (paragraph.length > 0) {
      blocks.push({ type: "paragraph", lines: paragraph });
      paragraph = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (line === "") {
      flush();
      continue;
    }
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      flush();
      blocks.push({ type: "heading", level: heading[1].length, text: heading[2] });
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      flush();
      const last = blocks[blocks.length - 1];
      if (last && last.type === "bullets") last.items.push(line.replace(/^[-*]\s+/, ""));
      else blocks.push({ type: "bullets", items: [line.replace(/^[-*]\s+/, "")] });
      continue;
    }
    if (/^\d+[.)]\s+/.test(line)) {
      flush();
      const last = blocks[blocks.length - 1];
      const item = line.replace(/^\d+[.)]\s+/, "");
      if (last && last.type === "ordered") last.items.push(item);
      else blocks.push({ type: "ordered", items: [item] });
      continue;
    }
    paragraph.push(line);
  }
  flush();
  return blocks;
}

export function Markdown({ content }: { content: string }) {
  const blocks = parseBlocks(content);
  return (
    <div className="space-y-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
      {blocks.map((block, i) => {
        if (block.type === "heading") {
          const cls =
            block.level <= 2
              ? "text-base font-extrabold text-ink dark:text-white"
              : "text-sm font-extrabold text-ink dark:text-white";
          return (
            <p key={i} className={cls}>
              {renderInline(block.text)}
            </p>
          );
        }
        if (block.type === "bullets") {
          return (
            <ul key={i} className="list-disc space-y-1 pl-5">
              {block.items.map((item, j) => (
                <li key={j}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }
        if (block.type === "ordered") {
          return (
            <ol key={i} className="list-decimal space-y-1 pl-5">
              {block.items.map((item, j) => (
                <li key={j}>{renderInline(item)}</li>
              ))}
            </ol>
          );
        }
        return (
          <p key={i} className="whitespace-pre-wrap">
            {block.lines.map((line, j) => (
              <span key={j}>
                {j > 0 && " "}
                {renderInline(line)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
