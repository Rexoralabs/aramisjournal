import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "@tiptap/markdown";

// Keep journal storage as Markdown, never HTML. Only enable supported writing tools.
export const journalEditorExtensions = () => [
  StarterKit.configure({
    heading: { levels: [2] },
    link: false,
    underline: false,
    strike: false,
    code: false,
    codeBlock: false,
    horizontalRule: false,
  }),
  Markdown.configure({ markedOptions: { breaks: true, gfm: true } }),
];