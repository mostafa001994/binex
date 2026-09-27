export function RichBlogContent({ html }: { html: string }) {
  return (
    <div
      className="text-[15px] leading-9 text-marketing-text-muted sm:text-base [&_a]:font-semibold [&_a]:text-primary [&_a]:underline [&_blockquote]:my-6 [&_blockquote]:rounded-control [&_blockquote]:border-r-4 [&_blockquote]:border-primary [&_blockquote]:bg-primary/5 [&_blockquote]:px-5 [&_blockquote]:py-3 [&_code]:rounded [&_code]:bg-black/5 [&_code]:px-1.5 [&_h2]:mb-4 [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-black [&_h2]:text-marketing-text [&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-marketing-text [&_h4]:mb-3 [&_h4]:mt-7 [&_h4]:font-bold [&_h4]:text-marketing-text [&_hr]:my-8 [&_img]:my-7 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-card [&_li]:my-1 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pr-7 [&_p]:my-5 [&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:rounded-card [&_pre]:bg-slate-950 [&_pre]:p-5 [&_pre]:text-left [&_pre]:text-slate-100 [&_table]:my-7 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-marketing-border [&_td]:p-3 [&_th]:border [&_th]:border-marketing-border [&_th]:bg-black/5 [&_th]:p-3 [&_ul]:my-5 [&_ul]:list-disc [&_ul]:pr-7"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
