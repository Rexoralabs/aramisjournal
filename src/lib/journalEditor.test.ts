import { Editor } from "@tiptap/core";
import { describe, expect, it, afterEach } from "vitest";
import { journalEditorExtensions } from "./journalEditor";

let editor: Editor | undefined;
afterEach(() => editor?.destroy());
function open(content = "A quiet moment") {
  editor = new Editor({ extensions: journalEditorExtensions(), content, contentType: "markdown" });
  return editor;
}

describe("Compose formatting", () => {
  it("toggles bold on a selected phrase without losing the selection", () => {
    const entry = open();
    entry.commands.setTextSelection({ from: 3, to: 8 });
    entry.commands.toggleBold();
    expect(entry.getMarkdown()).toBe("A **quiet** moment");
    entry.commands.toggleBold();
    expect(entry.getMarkdown()).toBe("A quiet moment");
  });
  it("lets italic apply to subsequent typing at the caret", () => {
    const entry = open("");
    entry.commands.toggleItalic();
    entry.commands.insertContent("Reflection");
    expect(entry.getMarkdown()).toBe("*Reflection*");
  });
  it("toggles headings rather than repeatedly inserting markers", () => {
    const entry = open();
    entry.commands.toggleHeading({ level: 2 });
    expect(entry.getMarkdown()).toBe("## A quiet moment");
    entry.commands.toggleHeading({ level: 2 });
    expect(entry.getMarkdown()).toBe("A quiet moment");
  });
  it("applies a list to multiple selected paragraphs", () => {
    const entry = open("First\n\nSecond");
    entry.commands.selectAll();
    entry.commands.toggleBulletList();
    expect(entry.getMarkdown()).toBe("- First\n- Second");
    entry.commands.toggleBulletList();
    expect(entry.getMarkdown()).toBe("First\n\nSecond");
  });
  it("toggles quotes on and off", () => {
    const entry = open();
    entry.commands.toggleBlockquote();
    expect(entry.getMarkdown()).toBe("> A quiet moment");
    entry.commands.toggleBlockquote();
    expect(entry.getMarkdown()).toBe("A quiet moment");
  });
  it("supports undo and redo of formatting", () => {
    const entry = open();
    entry.commands.selectAll();
    entry.commands.toggleBold();
    entry.commands.undo();
    expect(entry.getMarkdown()).toBe("A quiet moment");
    entry.commands.redo();
    expect(entry.getMarkdown()).toBe("**A quiet moment**");
  });
  it("reopens saved Markdown with the original marks and line breaks", () => {
    const entry = open("## Today\n\n**quiet** and *calm*\nNext line\n\n- One\n- Two\n\n> Remember");
    expect(entry.getText()).toContain("Next line");
    const saved = entry.getMarkdown();
    entry.commands.setContent(saved, { contentType: "markdown" });
    expect(entry.getMarkdown()).toBe(saved);
    const nodes = entry.getJSON().content || [];
    expect(nodes.map(node => node.type)).toEqual(["heading", "paragraph", "bulletList", "blockquote"]);
    expect(nodes[1].content?.[0].marks?.[0].type).toBe("bold");
  });
});