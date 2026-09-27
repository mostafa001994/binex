import type { ReactNode } from "react";

function inline(text: string): ReactNode {
  return text;
}

export function MarkdownContent({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  return (
    <div className="space-y-5 text-[15px] leading-9 text-marketing-text-muted sm:text-base">
      {lines.map((raw, index) => {
        const line = raw.trim();
        if (!line) return <div key={index} className="h-1" aria-hidden="true" />;
        if (line.startsWith("### ")) return <h3 key={index} className="pt-4 font-display text-xl font-bold text-marketing-text">{inline(line.slice(4))}</h3>;
        if (line.startsWith("## ")) return <h2 key={index} className="pt-6 font-display text-2xl font-black text-marketing-text">{inline(line.slice(3))}</h2>;
        if (line.startsWith("# ")) return <h2 key={index} className="pt-6 font-display text-2xl font-black text-marketing-text">{inline(line.slice(2))}</h2>;
        if (line.startsWith("> ")) return <blockquote key={index} className="rounded-control border-r-4 border-primary bg-primary/5 px-5 py-3 text-marketing-text">{inline(line.slice(2))}</blockquote>;
        if (/^[-*] /.test(line)) return <div key={index} className="flex gap-3 pr-3"><span className="mt-3 size-1.5 shrink-0 rounded-full bg-primary" /><span>{inline(line.slice(2))}</span></div>;
        return <p key={index}>{inline(line)}</p>;
      })}
    </div>
  );
}

