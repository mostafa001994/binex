"use client";

import { useState } from "react";
import type { JSONContent } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { TableKit } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { MediaPickerDialog } from "@/components/admin/media-picker-dialog";

export type RichEditorValue = {
  contentJson: JSONContent;
  contentHtml: string;
  contentText: string;
};

export function BlogRichEditor({
  value,
  fallbackHtml,
  onChange,
}: {
  value: unknown;
  fallbackHtml: string;
  onChange: (value: RichEditorValue) => void;
}) {
  const [preview, setPreview] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const editor = useEditor({
    immediatelyRender: false,
    content: (value && typeof value === "object"
      ? value
      : fallbackHtml || "<p></p>") as JSONContent,
    extensions: [
      StarterKit.configure({ link: false, underline: false }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
      Image.configure({ allowBase64: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "مقاله را از اینجا شروع کنید…" }),
      TableKit.configure({ table: { resizable: true } }),
    ],
    editorProps: {
      attributes: {
        dir: "rtl",
        class:
          "min-h-[460px] px-5 py-5 text-sm leading-8 outline-none sm:text-base",
      },
    },
    onUpdate: ({ editor: current }) => {
      onChange({
        contentJson: current.getJSON(),
        contentHtml: current.getHTML(),
        contentText: current.getText({ blockSeparator: "\n" }),
      });
    },
  });

  if (!editor)
    return (
      <div className="rounded-control border-border bg-surface-hover min-h-[520px] animate-pulse border" />
    );

  function setLink() {
    const previous = editor?.getAttributes("link").href as string | undefined;
    const href = window.prompt(
      "آدرس لینک را وارد کنید:",
      previous ?? "https://",
    );
    if (href === null) return;
    if (!href.trim())
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
    else
      editor
        ?.chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: href.trim(), target: "_blank" })
        .run();
  }

  return (
    <div className="rounded-control border-border bg-background focus-within:border-primary overflow-hidden border">
      <div
        className="border-border bg-surface-hover flex flex-wrap gap-1 border-b p-2"
        dir="rtl"
      >
        <Tool
          editor={editor}
          label="متن"
          active={editor.isActive("paragraph")}
          run={() => editor.chain().focus().setParagraph().run()}
        />
        <Tool
          editor={editor}
          label="عنوان ۲"
          active={editor.isActive("heading", { level: 2 })}
          run={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <Tool
          editor={editor}
          label="عنوان ۳"
          active={editor.isActive("heading", { level: 3 })}
          run={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        />
        <Divider />
        <Tool
          editor={editor}
          label="ضخیم"
          active={editor.isActive("bold")}
          run={() => editor.chain().focus().toggleBold().run()}
        />
        <Tool
          editor={editor}
          label="مورب"
          active={editor.isActive("italic")}
          run={() => editor.chain().focus().toggleItalic().run()}
        />
        <Tool
          editor={editor}
          label="زیرخط"
          active={editor.isActive("underline")}
          run={() => editor.chain().focus().toggleUnderline().run()}
        />
        <Tool
          editor={editor}
          label="خط‌خورده"
          active={editor.isActive("strike")}
          run={() => editor.chain().focus().toggleStrike().run()}
        />
        <Tool
          editor={editor}
          label="لینک"
          active={editor.isActive("link")}
          run={setLink}
        />
        <Divider />
        <Tool
          editor={editor}
          label="فهرست •"
          active={editor.isActive("bulletList")}
          run={() => editor.chain().focus().toggleBulletList().run()}
        />
        <Tool
          editor={editor}
          label="فهرست ۱"
          active={editor.isActive("orderedList")}
          run={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <Tool
          editor={editor}
          label="نقل‌قول"
          active={editor.isActive("blockquote")}
          run={() => editor.chain().focus().toggleBlockquote().run()}
        />
        <Tool
          editor={editor}
          label="کد"
          active={editor.isActive("codeBlock")}
          run={() => editor.chain().focus().toggleCodeBlock().run()}
        />
        <Tool
          editor={editor}
          label="خط جداکننده"
          run={() => editor.chain().focus().setHorizontalRule().run()}
        />
        <Tool
          editor={editor}
          label="افزودن تصویر"
          run={() => setMediaPickerOpen(true)}
        />
        <Divider />
        <Tool
          editor={editor}
          label="راست"
          active={editor.isActive({ textAlign: "right" })}
          run={() => editor.chain().focus().setTextAlign("right").run()}
        />
        <Tool
          editor={editor}
          label="وسط"
          active={editor.isActive({ textAlign: "center" })}
          run={() => editor.chain().focus().setTextAlign("center").run()}
        />
        <Tool
          editor={editor}
          label="چپ"
          active={editor.isActive({ textAlign: "left" })}
          run={() => editor.chain().focus().setTextAlign("left").run()}
        />
        <Tool
          editor={editor}
          label="دوطرفه"
          active={editor.isActive({ textAlign: "justify" })}
          run={() => editor.chain().focus().setTextAlign("justify").run()}
        />
        <Divider />
        <Tool
          editor={editor}
          label="جدول"
          run={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
        />
        <Tool
          editor={editor}
          label="+ سطر"
          run={() => editor.chain().focus().addRowAfter().run()}
        />
        <Tool
          editor={editor}
          label="− سطر"
          run={() => editor.chain().focus().deleteRow().run()}
        />
        <Tool
          editor={editor}
          label="+ ستون"
          run={() => editor.chain().focus().addColumnAfter().run()}
        />
        <Tool
          editor={editor}
          label="− ستون"
          run={() => editor.chain().focus().deleteColumn().run()}
        />
        <Tool
          editor={editor}
          label="حذف جدول"
          run={() => editor.chain().focus().deleteTable().run()}
        />
        <Divider />
        <Tool
          editor={editor}
          label="برگشت"
          run={() => editor.chain().focus().undo().run()}
        />
        <Tool
          editor={editor}
          label="جلو"
          run={() => editor.chain().focus().redo().run()}
        />
        <button
          type="button"
          onClick={() => setPreview((current) => !current)}
          className="text-primary hover:bg-primary/10 mr-auto rounded px-2.5 py-1.5 text-xs font-semibold"
        >
          {preview ? "ویرایش" : "پیش‌نمایش"}
        </button>
      </div>
      {preview ? (
        <div
          dir="rtl"
          className="[&_a]:text-primary [&_blockquote]:border-primary min-h-[460px] px-6 py-5 text-sm leading-8 [&_a]:underline [&_blockquote]:border-r-4 [&_blockquote]:pr-4 [&_h2]:my-5 [&_h2]:text-2xl [&_h2]:font-black [&_h3]:my-4 [&_h3]:text-xl [&_h3]:font-bold [&_img]:my-5 [&_img]:max-w-full [&_ol]:list-decimal [&_ol]:pr-7 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-slate-950 [&_pre]:p-4 [&_pre]:text-slate-100 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:p-2 [&_th]:border [&_th]:p-2 [&_ul]:list-disc [&_ul]:pr-7"
          dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
        />
      ) : (
        <EditorContent
          editor={editor}
          className="[&_.ProseMirror_p.is-editor-empty:first-child:before]:text-foreground-subtle [&_.ProseMirror_td]:border-border [&_.ProseMirror_th]:border-border [&_.ProseMirror_th]:bg-surface-hover [&_.ProseMirror_h2]:my-5 [&_.ProseMirror_h2]:text-2xl [&_.ProseMirror_h2]:font-black [&_.ProseMirror_h3]:my-4 [&_.ProseMirror_h3]:text-xl [&_.ProseMirror_h3]:font-bold [&_.ProseMirror_img]:my-5 [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pr-7 [&_.ProseMirror_p.is-editor-empty:first-child:before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child:before]:float-right [&_.ProseMirror_p.is-editor-empty:first-child:before]:h-0 [&_.ProseMirror_p.is-editor-empty:first-child:before]:content-[attr(data-placeholder)] [&_.ProseMirror_pre]:overflow-x-auto [&_.ProseMirror_pre]:rounded [&_.ProseMirror_pre]:bg-slate-950 [&_.ProseMirror_pre]:p-4 [&_.ProseMirror_pre]:text-slate-100 [&_.ProseMirror_table]:my-5 [&_.ProseMirror_table]:w-full [&_.ProseMirror_table]:border-collapse [&_.ProseMirror_td]:border [&_.ProseMirror_td]:p-2 [&_.ProseMirror_th]:border [&_.ProseMirror_th]:p-2 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pr-7"
        />
      )}
      <MediaPickerDialog
        open={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        title="افزودن تصویر به متن مقاله"
        onSelect={(item) =>
          editor
            .chain()
            .focus()
            .setImage({ src: item.url, alt: item.altText || item.fileName })
            .run()
        }
      />
    </div>
  );
}

function Tool({
  editor,
  label,
  active = false,
  run,
}: {
  editor: Editor;
  label: string;
  active?: boolean;
  run: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={!editor.isEditable}
      onClick={run}
      className={`rounded px-2.5 py-1.5 text-xs font-semibold transition ${active ? "bg-primary text-white" : "text-foreground-muted hover:bg-background hover:text-foreground"}`}
    >
      {label}
    </button>
  );
}

function Divider() {
  return <span className="bg-border mx-1 h-7 w-px" aria-hidden="true" />;
}
