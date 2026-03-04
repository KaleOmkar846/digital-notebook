import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import "./Editor.css";

const Editor = forwardRef(function Editor({ content, onChange }, ref) {
  const textareaRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getTextarea: () => textareaRef.current,
  }));

  const insertAtCursor = (before, after = "", placeholder = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const text = selectedText || placeholder;

    const newText =
      content.substring(0, start) +
      before +
      text +
      after +
      content.substring(end);
    onChange(newText);

    const cursorPos = start + before.length + text.length;
    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(
          cursorPos + after.length,
          cursorPos + after.length,
        );
      } else {
        // Select placeholder so user can type over it
        textarea.setSelectionRange(start + before.length, cursorPos);
      }
    }, 0);
  };

  const insertHeading = (level) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const beforeText = content.substring(0, start);
    const afterText = content.substring(end);

    const lineStart = beforeText.lastIndexOf("\n") + 1;
    const beforeLine = beforeText.substring(lineStart);
    const headingPrefix = "#".repeat(level) + " ";

    let newText;
    let cursorPosition;

    if (selectedText) {
      newText = beforeText + headingPrefix + selectedText + afterText;
      cursorPosition = start + headingPrefix.length + selectedText.length;
    } else {
      if (beforeLine.trim() === "") {
        newText = beforeText + headingPrefix + afterText;
        cursorPosition = start + headingPrefix.length;
      } else {
        newText = beforeText + "\n" + headingPrefix + afterText;
        cursorPosition = start + headingPrefix.length + 1;
      }
    }

    onChange(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    }, 0);
  };

  const insertBold = () => insertAtCursor("**", "**", "bold text");
  const insertItalic = () => insertAtCursor("*", "*", "italic text");
  const insertStrikethrough = () => insertAtCursor("~~", "~~", "strikethrough");
  const insertInlineCode = () => insertAtCursor("`", "`", "code");
  const insertLink = () => insertAtCursor("[", "](url)", "link text");
  const insertImage = () => insertAtCursor("![", "](url)", "alt text");

  const insertCodeBlock = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    const before = "```javascript\n";
    const after = "\n```";
    const text = selectedText || "// code here";

    const newText =
      content.substring(0, start) +
      before +
      text +
      after +
      content.substring(end);
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      if (!selectedText) {
        textarea.setSelectionRange(
          start + before.length,
          start + before.length + text.length,
        );
      }
    }, 0);
  };

  const insertList = (ordered = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const prefix = ordered ? "1. " : "- ";
    const newText =
      content.substring(0, start) + "\n" + prefix + content.substring(start);
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      const pos = start + 1 + prefix.length;
      textarea.setSelectionRange(pos, pos);
    }, 0);
  };

  const insertBlockquote = () => insertAtCursor("\n> ", "", "quote");
  const insertHr = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const newText =
      content.substring(0, start) + "\n\n---\n\n" + content.substring(start);
    onChange(newText);
    setTimeout(() => {
      textarea.focus();
      const pos = start + 6;
      textarea.setSelectionRange(pos, pos);
    }, 0);
  };

  const insertTable = () => {
    const table =
      "\n| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n";
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const newText =
      content.substring(0, start) + table + content.substring(start);
    onChange(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + table.length, start + table.length);
    }, 0);
  };

  // Editor keyboard shortcuts
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "b":
            e.preventDefault();
            insertBold();
            break;
          case "i":
            e.preventDefault();
            insertItalic();
            break;
          case "k":
            e.preventDefault();
            insertLink();
            break;
          case "`":
            e.preventDefault();
            insertInlineCode();
            break;
          default:
            break;
        }
      }
      // Tab support
      if (e.key === "Tab") {
        e.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newText =
          content.substring(0, start) + "  " + content.substring(end);
        onChange(newText);
        setTimeout(() => {
          textarea.setSelectionRange(start + 2, start + 2);
        }, 0);
      }
    };

    textarea.addEventListener("keydown", handleKeyDown);
    return () => textarea.removeEventListener("keydown", handleKeyDown);
  }, [content]);

  return (
    <div className="editor">
      <div className="editor-header">
        <span className="editor-title">✏️ Editor</span>
        <span className="editor-hint">Markdown supported · Tab for indent</span>
      </div>
      <div className="editor-toolbar">
        <div className="toolbar-group">
          <button
            className="toolbar-btn"
            onClick={() => insertHeading(1)}
            title="Heading 1"
          >
            H1
          </button>
          <button
            className="toolbar-btn"
            onClick={() => insertHeading(2)}
            title="Heading 2"
          >
            H2
          </button>
          <button
            className="toolbar-btn"
            onClick={() => insertHeading(3)}
            title="Heading 3"
          >
            H3
          </button>
        </div>
        <div className="toolbar-divider" />
        <div className="toolbar-group">
          <button
            className="toolbar-btn"
            onClick={insertBold}
            title="Bold (Ctrl+B)"
          >
            <strong>B</strong>
          </button>
          <button
            className="toolbar-btn"
            onClick={insertItalic}
            title="Italic (Ctrl+I)"
          >
            <em>I</em>
          </button>
          <button
            className="toolbar-btn"
            onClick={insertStrikethrough}
            title="Strikethrough"
          >
            <s>S</s>
          </button>
        </div>
        <div className="toolbar-divider" />
        <div className="toolbar-group">
          <button
            className="toolbar-btn"
            onClick={insertInlineCode}
            title="Inline Code (Ctrl+`)"
          >
            &lt;/&gt;
          </button>
          <button
            className="toolbar-btn"
            onClick={insertCodeBlock}
            title="Code Block"
          >
            {"{ }"}
          </button>
          <button
            className="toolbar-btn"
            onClick={insertLink}
            title="Link (Ctrl+K)"
          >
            🔗
          </button>
          <button className="toolbar-btn" onClick={insertImage} title="Image">
            🖼️
          </button>
        </div>
        <div className="toolbar-divider" />
        <div className="toolbar-group">
          <button
            className="toolbar-btn"
            onClick={() => insertList(false)}
            title="Bullet List"
          >
            •≡
          </button>
          <button
            className="toolbar-btn"
            onClick={() => insertList(true)}
            title="Numbered List"
          >
            1.
          </button>
          <button
            className="toolbar-btn"
            onClick={insertBlockquote}
            title="Blockquote"
          >
            ❝
          </button>
          <button className="toolbar-btn" onClick={insertTable} title="Table">
            ⊞
          </button>
          <button
            className="toolbar-btn"
            onClick={insertHr}
            title="Horizontal Rule"
          >
            ―
          </button>
        </div>
      </div>
      <textarea
        ref={textareaRef}
        className="editor-textarea"
        placeholder={`# Your Study Notes

Start typing or paste your notes here...

## Markdown Supported:
- **Bold** and *italic* text
- Code blocks with syntax highlighting
- Tables, lists, and more!

\`\`\`javascript
// Code blocks are highlighted
const hello = "world";
console.log(hello);
\`\`\`
`}
        value={content}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
});

export default Editor;
