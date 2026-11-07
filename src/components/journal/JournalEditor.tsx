import { useEffect, useRef } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { journalEditorExtensions } from "@/lib/journalEditor";
import { cn } from "@/lib/utils";

interface JournalEditorProps {
  content: string;
  onChange: (content: string) => void;
  documentKey: string;
  titleField?: React.ReactNode;
}

export function JournalEditor({ content, onChange, documentKey, titleField }: JournalEditorProps) {
  const lastEmitted = useRef(content);
  const editor = useEditor({
    extensions: journalEditorExtensions(),
    content,
    contentType: "markdown",
    autofocus: "end",
    editorProps: {
      attributes: {
        class: "journal-editor w-full bg-transparent text-foreground leading-relaxed focus:outline-none",
        role: "textbox",
        "aria-label": "Journal entry",
        "aria-multiline": "true",
        "data-placeholder": "Start writing your thoughts...",
      },
    },
    onUpdate: ({ editor: current }) => {
      const markdown = current.isEmpty ? "" : current.getMarkdown();
      lastEmitted.current = markdown;
      onChange(markdown);
    },
  });

  useEffect(() => {
    if (!editor || content === lastEmitted.current) return;
    lastEmitted.current = content;
    editor.commands.setContent(content, { contentType: "markdown", emitUpdate: false });
  }, [content, editor]);

  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current?.isActive("bold") ?? false,
      italic: current?.isActive("italic") ?? false,
      heading: current?.isActive("heading", { level: 2 }) ?? false,
      list: current?.isActive("bulletList") ?? false,
      quote: current?.isActive("blockquote") ?? false,
    }),
  });

  const tools = [
    { name: "Bold", icon: "ph:text-b-bold", active: state?.bold, run: () => editor?.chain().focus().toggleBold().run() },
    { name: "Italic", icon: "ph:text-italic", active: state?.italic, run: () => editor?.chain().focus().toggleItalic().run() },
    { name: "Heading", icon: "ph:text-h", active: state?.heading, run: () => editor?.chain().focus().toggleHeading({ level: 2 }).run() },
    { name: "List", icon: "ph:list-bullets", active: state?.list, run: () => editor?.chain().focus().toggleBulletList().run() },
    { name: "Quote", icon: "ph:quotes", active: state?.quote, run: () => editor?.chain().focus().toggleBlockquote().run() },
  ];

  return (
    <>
      <div role="toolbar" aria-label="Text formatting" className="flex items-center gap-1 px-1">
        {tools.map(tool => (
          <Tooltip key={tool.name}>
            <TooltipTrigger asChild>
              <Button type="button" variant="bare" size="inline" aria-label={tool.name}
                aria-pressed={tool.active} disabled={!editor}
                onMouseDown={event => event.preventDefault()} onClick={tool.run}
                className={cn("h-8 w-8 p-2 rounded-lg hover:bg-muted", tool.active && "bg-muted text-foreground")}>
                <Icon icon={tool.icon} className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{tool.name}</TooltipContent>
          </Tooltip>
        ))}
      </div>
      {titleField}
      <EditorContent editor={editor} />
    </>
  );
}