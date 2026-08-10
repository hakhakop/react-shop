"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { useEffect, useCallback, useRef, useState } from "react";
import { sanitizeHtml } from "@/lib/safeHtml";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Code2,
  Eye,
  Undo,
  Redo,
} from "lucide-react";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
};

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write...",
  minHeight = "120px",
}: RichTextEditorProps) {
  const [mode, setMode] = useState<"visual" | "html">("visual");
  const [sourceValue, setSourceValue] = useState(value);
  const visualWasEdited = useRef(false);
  const latestExternalValue = useRef(value);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      visualWasEdited.current = true;
      const html = sanitizeHtml(editor.getHTML());
      setSourceValue(html);
      onChange(html);
    },
  });

  useEffect(() => {
    if (value !== latestExternalValue.current) {
      latestExternalValue.current = value;
      if (mode === "html") return;
      setSourceValue(value);
      visualWasEdited.current = false;
      if (editor && value !== editor.getHTML()) {
        editor.commands.setContent(value, { emitUpdate: false });
      }
    }
  }, [value, editor, mode]);

  const toggleLink = useCallback(() => {
    if (!editor) return;
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
    } else {
      const url = window.prompt("Link URL:");
      if (url) {
        editor.chain().focus().setLink({ href: url }).run();
      }
    }
  }, [editor]);

  if (!editor) return null;

  const switchToHtml = () => {
    // Tiptap can represent the supported editing schema, but an imported
    // YOOtheme fragment can legitimately carry extra safe markup/classes.
    // Keep that original persisted source until Visual editing changes it.
    setSourceValue(visualWasEdited.current ? editor.getHTML() : value);
    setMode("html");
  };

  const switchToVisual = () => {
    const html = sanitizeHtml(sourceValue);
    latestExternalValue.current = html;
    setSourceValue(html);
    editor.commands.setContent(html, { emitUpdate: false });
    visualWasEdited.current = false;
    onChange(html);
    setMode("visual");
  };

  const updateSource = (html: string) => {
    setSourceValue(html);
    // Persist through the same safe HTML boundary as Visual mode. The raw
    // source remains visible while editing, so incomplete markup is not lost.
    const sanitized = sanitizeHtml(html);
    latestExternalValue.current = sanitized;
    onChange(sanitized);
  };

  return (
    <div className="richtext-editor">
      <div className="richtext-toolbar">
        <div className="richtext-mode-toggle" role="tablist" aria-label="Editor mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "visual"}
            className={mode === "visual" ? "is-active" : undefined}
            onClick={switchToVisual}
          >
            <Eye size={13} /> Visual
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "html"}
            className={mode === "html" ? "is-active" : undefined}
            onClick={switchToHtml}
          >
            <Code2 size={13} /> HTML
          </button>
        </div>
        {mode === "visual" && <>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <Bold size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <Italic size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline"
        >
          <UnderlineIcon size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Strikethrough"
        >
          <Strikethrough size={14} />
        </ToolbarButton>

        <div className="richtext-divider" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Heading"
        >
          <Heading1 size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="Subheading"
        >
          <Heading2 size={14} />
        </ToolbarButton>

        <div className="richtext-divider" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet list"
        >
          <List size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Ordered list"
        >
          <ListOrdered size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Blockquote"
        >
          <Quote size={14} />
        </ToolbarButton>

        <div className="richtext-divider" />

        <ToolbarButton
          onClick={toggleLink}
          active={editor.isActive("link")}
          title="Link"
        >
          <LinkIcon size={14} />
        </ToolbarButton>

        <div className="richtext-toolbar-spacer" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          active={false}
          title="Undo"
        >
          <Undo size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          active={false}
          title="Redo"
        >
          <Redo size={14} />
        </ToolbarButton>
        </>}
      </div>

      {mode === "visual" ? (
        <div className="richtext-content">
          <EditorContent editor={editor} style={{ minHeight }} />
        </div>
      ) : (
        <textarea
          className="richtext-source"
          aria-label="HTML source"
          spellCheck={false}
          value={sourceValue}
          onChange={(event) => updateSource(event.target.value)}
          style={{ minHeight }}
        />
      )}
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  active,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`richtext-toolbar-btn${active ? " is-active" : ""}`}
    >
      {children}
    </button>
  );
}
