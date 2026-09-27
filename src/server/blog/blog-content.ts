import sanitizeHtml from "sanitize-html";

const allowedTags = ["p", "h2", "h3", "h4", "strong", "em", "u", "s", "ul", "ol", "li", "blockquote", "pre", "code", "a", "img", "table", "tbody", "tr", "th", "td", "br", "hr"];
const NODE_TYPES = new Set(["doc", "paragraph", "text", "heading", "bulletList", "orderedList", "listItem", "blockquote", "codeBlock", "horizontalRule", "hardBreak", "image", "table", "tableRow", "tableHeader", "tableCell"]);
const MARK_TYPES = new Set(["bold", "italic", "underline", "strike", "code", "link"]);
const BLOCK_TYPES = new Set(["paragraph", "heading", "listItem", "blockquote", "codeBlock", "tableRow"]);
const MAX_DOCUMENT_BYTES = 250_000;
const MAX_NODES = 10_000;
const MAX_DEPTH = 40;

type BlogMark = { type: string; attrs?: Record<string, unknown> };
type BlogNode = { type: string; text?: string; attrs?: Record<string, unknown>; marks?: BlogMark[]; content?: BlogNode[] };

function safeUrl(value: unknown, image = false) {
  const url = String(value ?? "").trim();
  if (image && url.startsWith("/api/blog/media/")) return url;
  try {
    const parsed = new URL(url);
    if (image ? ["http:", "https:"].includes(parsed.protocol) : ["http:", "https:", "mailto:"].includes(parsed.protocol)) return url;
  } catch { /* handled below */ }
  throw new Error(image ? "آدرس تصویر داخل محتوا معتبر نیست." : "لینک داخل محتوا معتبر نیست.");
}

function validateAttrs(node: BlogNode) {
  const attrs = node.attrs ?? {};
  if (node.type === "heading" && ![2, 3, 4].includes(Number(attrs.level))) throw new Error("سطح تیتر باید ۲، ۳ یا ۴ باشد.");
  if (attrs.textAlign != null && !["left", "right", "center", "justify"].includes(String(attrs.textAlign))) throw new Error("تراز متن معتبر نیست.");
  if (node.type === "image") {
    safeUrl(attrs.src, true);
    if (String(attrs.alt ?? "").length > 255 || String(attrs.title ?? "").length > 255) throw new Error("متن تصویر بیش از حد طولانی است.");
  }
  if (["tableHeader", "tableCell"].includes(node.type)) {
    for (const key of ["colspan", "rowspan"]) {
      const value = Number(attrs[key] ?? 1);
      if (!Number.isInteger(value) || value < 1 || value > 20) throw new Error("ساختار جدول معتبر نیست.");
    }
  }
}

function validateMark(mark: BlogMark) {
  if (!mark || typeof mark !== "object" || !MARK_TYPES.has(mark.type)) throw new Error("قالب‌بندی ناشناخته در محتوا وجود دارد.");
  if (mark.type === "link") {
    safeUrl(mark.attrs?.href);
    if (mark.attrs?.target != null && mark.attrs.target !== "_blank") throw new Error("هدف لینک معتبر نیست.");
  }
}

function validateNode(value: unknown, depth: number, counter: { value: number }): BlogNode {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("گره محتوای مقاله معتبر نیست.");
  if (depth > MAX_DEPTH || ++counter.value > MAX_NODES) throw new Error("ساختار مقاله بیش از حد پیچیده است.");
  const node = value as BlogNode;
  if (!NODE_TYPES.has(node.type)) throw new Error(`نوع محتوای «${String(node.type)}» پشتیبانی نمی‌شود.`);
  if (node.type === "text") {
    if (typeof node.text !== "string" || node.text.length > 100_000) throw new Error("متن داخل مقاله معتبر نیست.");
  } else if (node.text !== undefined) throw new Error("ساختار متن مقاله معتبر نیست.");
  if (node.marks !== undefined) {
    if (!Array.isArray(node.marks) || node.marks.length > 12) throw new Error("قالب‌بندی متن معتبر نیست.");
    node.marks.forEach(validateMark);
  }
  if (node.content !== undefined) {
    if (!Array.isArray(node.content)) throw new Error("فرزندان محتوای مقاله معتبر نیستند.");
    node.content.forEach((child) => validateNode(child, depth + 1, counter));
  }
  validateAttrs(node);
  return node;
}

function escapeHtml(value: unknown) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function style(node: BlogNode) { return node.attrs?.textAlign ? ` style="text-align:${escapeHtml(node.attrs.textAlign)}"` : ""; }
function serializeMarks(text: string, marks: BlogMark[] = []) {
  return marks.reduce((html, mark) => {
    if (mark.type === "bold") return `<strong>${html}</strong>`;
    if (mark.type === "italic") return `<em>${html}</em>`;
    if (mark.type === "underline") return `<u>${html}</u>`;
    if (mark.type === "strike") return `<s>${html}</s>`;
    if (mark.type === "code") return `<code>${html}</code>`;
    if (mark.type === "link") return `<a href="${escapeHtml(safeUrl(mark.attrs?.href))}"${mark.attrs?.target === "_blank" ? ' target="_blank"' : ""} rel="noopener noreferrer">${html}</a>`;
    return html;
  }, escapeHtml(text));
}
function serializeNode(node: BlogNode): string {
  const children = (node.content ?? []).map(serializeNode).join("");
  if (node.type === "doc") return children;
  if (node.type === "text") return serializeMarks(node.text ?? "", node.marks);
  if (node.type === "paragraph") return `<p${style(node)}>${children || "<br>"}</p>`;
  if (node.type === "heading") return `<h${Number(node.attrs?.level)}${style(node)}>${children}</h${Number(node.attrs?.level)}>`;
  if (node.type === "bulletList") return `<ul>${children}</ul>`;
  if (node.type === "orderedList") return `<ol>${children}</ol>`;
  if (node.type === "listItem") return `<li>${children}</li>`;
  if (node.type === "blockquote") return `<blockquote>${children}</blockquote>`;
  if (node.type === "codeBlock") return `<pre><code>${children}</code></pre>`;
  if (node.type === "horizontalRule") return "<hr>";
  if (node.type === "hardBreak") return "<br>";
  if (node.type === "image") {
    const attrs = node.attrs ?? {};
    return `<img src="${escapeHtml(safeUrl(attrs.src, true))}" alt="${escapeHtml(attrs.alt)}"${attrs.title ? ` title="${escapeHtml(attrs.title)}"` : ""}>`;
  }
  if (node.type === "table") return `<table><tbody>${children}</tbody></table>`;
  if (node.type === "tableRow") return `<tr>${children}</tr>`;
  if (["tableHeader", "tableCell"].includes(node.type)) {
    const tag = node.type === "tableHeader" ? "th" : "td";
    const colspan = Number(node.attrs?.colspan ?? 1); const rowspan = Number(node.attrs?.rowspan ?? 1);
    return `<${tag}${colspan > 1 ? ` colspan="${colspan}"` : ""}${rowspan > 1 ? ` rowspan="${rowspan}"` : ""}>${children}</${tag}>`;
  }
  return children;
}
function extractText(node: BlogNode): string {
  if (node.type === "text") return node.text ?? "";
  if (node.type === "hardBreak") return "\n";
  const value = (node.content ?? []).map(extractText).join("");
  return BLOCK_TYPES.has(node.type) ? `${value}\n` : value;
}

export function sanitizeBlogHtml(value: string) {
  return sanitizeHtml(value, {
    allowedTags,
    allowedAttributes: { a: ["href", "target", "rel"], img: ["src", "alt", "title", "width", "height"], p: ["style"], h2: ["style"], h3: ["style"], h4: ["style"], th: ["colspan", "rowspan"], td: ["colspan", "rowspan"] },
    allowedStyles: { "*": { "text-align": [/^(left|right|center|justify)$/] } },
    allowedSchemes: ["http", "https", "mailto"], allowProtocolRelative: false,
    transformTags: { a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }) },
  }).trim();
}

export function parseBlogDocument(value: unknown): BlogNode {
  const serialized = JSON.stringify(value);
  if (!serialized || serialized.length > MAX_DOCUMENT_BYTES) throw new Error("ساختار مقاله بیش از حد بزرگ یا خالی است.");
  if (!value || typeof value !== "object" || Array.isArray(value) || (value as { type?: unknown }).type !== "doc") throw new Error("سند مقاله باید یک document معتبر باشد.");
  const document = validateNode(value, 0, { value: 0 });
  return document;
}

export function renderBlogDocument(value: unknown) {
  const document = parseBlogDocument(value);
  const html = sanitizeBlogHtml(serializeNode(document));
  const text = extractText(document).replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  return { document, html, text };
}
