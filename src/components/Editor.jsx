import { useRef, useEffect, useCallback, useMemo } from "react";
import "./Editor.css";

function Editor({
  content,
  onChange,
  expanded,
  onToggleExpand,
  darkMode,
  onToggleDarkMode,
  style,
}) {
  const textareaRef = useRef(null);
  const contentRef = useRef(content);
  contentRef.current = content;

  const insertAtCursor = useCallback(
    (before, after = "", placeholder = "") => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentContent = contentRef.current;
      const selectedText = currentContent.substring(start, end);
      const text = selectedText || placeholder;

      const newText =
        currentContent.substring(0, start) +
        before +
        text +
        after +
        currentContent.substring(end);
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
          textarea.setSelectionRange(start + before.length, cursorPos);
        }
      }, 0);
    },
    [onChange],
  );

  const insertHeading = useCallback(
    (level) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentContent = contentRef.current;
      const selectedText = currentContent.substring(start, end);
      const beforeText = currentContent.substring(0, start);
      const afterText = currentContent.substring(end);

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
    },
    [onChange],
  );

  const insertBold = useCallback(
    () => insertAtCursor("**", "**", "bold text"),
    [insertAtCursor],
  );
  const insertItalic = useCallback(
    () => insertAtCursor("*", "*", "italic text"),
    [insertAtCursor],
  );
  const insertStrikethrough = useCallback(
    () => insertAtCursor("~~", "~~", "strikethrough"),
    [insertAtCursor],
  );
  const insertInlineCode = useCallback(
    () => insertAtCursor("`", "`", "code"),
    [insertAtCursor],
  );
  const insertLink = useCallback(
    () => insertAtCursor("[", "](url)", "link text"),
    [insertAtCursor],
  );
  const insertImage = useCallback(
    () => insertAtCursor("![", "](url)", "alt text"),
    [insertAtCursor],
  );

  const insertCodeBlock = useCallback(
    (lang = "javascript") => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentContent = contentRef.current;
      const selectedText = currentContent.substring(start, end);

      const before = "```" + lang + "\n";
      const after = "\n```";
      const text = selectedText || "// code here";

      const newText =
        currentContent.substring(0, start) +
        before +
        text +
        after +
        currentContent.substring(end);
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
    },
    [onChange],
  );

  const insertList = useCallback(
    (ordered = false) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const currentContent = contentRef.current;
      const prefix = ordered ? "1. " : "- ";
      const newText =
        currentContent.substring(0, start) +
        "\n" +
        prefix +
        currentContent.substring(start);
      onChange(newText);

      setTimeout(() => {
        textarea.focus();
        const pos = start + 1 + prefix.length;
        textarea.setSelectionRange(pos, pos);
      }, 0);
    },
    [onChange],
  );

  const insertBlockquote = useCallback(
    () => insertAtCursor("\n> ", "", "quote"),
    [insertAtCursor],
  );

  const insertHr = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const currentContent = contentRef.current;
    const newText =
      currentContent.substring(0, start) +
      "\n\n---\n\n" +
      currentContent.substring(start);
    onChange(newText);
    setTimeout(() => {
      textarea.focus();
      const pos = start + 6;
      textarea.setSelectionRange(pos, pos);
    }, 0);
  }, [onChange]);

  const insertTable = useCallback(() => {
    const table =
      "\n| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n";
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const currentContent = contentRef.current;
    const newText =
      currentContent.substring(0, start) +
      table +
      currentContent.substring(start);
    onChange(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + table.length, start + table.length);
    }, 0);
  }, [onChange]);

  const insertTaskList = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const currentContent = contentRef.current;
    const taskList =
      "\n- [ ] Task item\n- [ ] Another task\n- [x] Completed task\n";
    const newText =
      currentContent.substring(0, start) +
      taskList +
      currentContent.substring(start);
    onChange(newText);
    setTimeout(() => {
      textarea.focus();
      const pos = start + taskList.length;
      textarea.setSelectionRange(pos, pos);
    }, 0);
  }, [onChange]);

  // Keyboard shortcuts — stable handler via refs
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
      if (e.key === "Tab") {
        e.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentContent = contentRef.current;
        const newText =
          currentContent.substring(0, start) +
          "  " +
          currentContent.substring(end);
        onChange(newText);
        setTimeout(() => {
          textarea.setSelectionRange(start + 2, start + 2);
        }, 0);
      }
    };

    textarea.addEventListener("keydown", handleKeyDown);
    return () => textarea.removeEventListener("keydown", handleKeyDown);
  }, [insertBold, insertItalic, insertLink, insertInlineCode, onChange]);

  const stats = useMemo(() => {
    if (!content) return { words: 0, chars: 0 };
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    return { words, chars: content.length };
  }, [content]);

  return (
    <div
      className={`editor ${expanded ? "editor-expanded" : ""}`}
      style={style}
    >
      <div className="editor-header">
        <span className="editor-title">Editor</span>
        <div className="editor-header-right">
          <span className="editor-stats">
            {stats.words} words · {stats.chars} chars
          </span>
          <button
            className="theme-toggle-btn"
            onClick={onToggleDarkMode}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? "Light" : "Dark"}
          </button>
          <button
            className="expand-btn"
            onClick={onToggleExpand}
            title={expanded ? "Exit fullscreen" : "Fullscreen editor"}
          >
            {expanded ? "Collapse" : "Expand"}
          </button>
        </div>
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
          <CodeBlockDropdown onInsert={insertCodeBlock} />
          <button
            className="toolbar-btn"
            onClick={insertLink}
            title="Link (Ctrl+K)"
          >
            Link
          </button>
          <button className="toolbar-btn" onClick={insertImage} title="Image">
            Img
          </button>
        </div>
        <div className="toolbar-divider" />
        <div className="toolbar-group">
          <button
            className="toolbar-btn"
            onClick={() => insertList(false)}
            title="Bullet List"
          >
            List
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
            onClick={insertTaskList}
            title="Task List (checkboxes)"
          >
            Task
          </button>
          <button
            className="toolbar-btn"
            onClick={insertBlockquote}
            title="Blockquote"
          >
            Quote
          </button>
          <button className="toolbar-btn" onClick={insertTable} title="Table">
            Table
          </button>
          <button
            className="toolbar-btn"
            onClick={insertHr}
            title="Horizontal Rule"
          >
            HR
          </button>
        </div>
      </div>
      <textarea
        ref={textareaRef}
        className="editor-textarea"
        placeholder={`Start typing your notes here...

Use Markdown to format:
  # Heading 1    ## Heading 2    ### Heading 3
  **bold**  *italic*  \`inline code\`
  - bullet list    1. numbered list
  - [ ] task list  - [x] done task

Code blocks with syntax highlighting:
  \`\`\`python
  def binary_search(arr, target):
      lo, hi = 0, len(arr) - 1
      while lo <= hi:
          mid = (lo + hi) // 2
          if arr[mid] == target: return mid
          elif arr[mid] < target: lo = mid + 1
          else: hi = mid - 1
      return -1
  \`\`\`

Math with LaTeX:  $O(n \\log n)$  or block:
  $$\\sum_{i=0}^{n} i = \\frac{n(n+1)}{2}$$

Tables, blockquotes, links, and more!`}
        value={content}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

const LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "c",
  "cpp",
  "csharp",
  "go",
  "rust",
  "html",
  "css",
  "sql",
  "bash",
  "json",
  "yaml",
  "markdown",
];

function CodeBlockDropdown({ onInsert }) {
  const detailsRef = useRef(null);

  const handleSelect = (lang) => {
    onInsert(lang);
    if (detailsRef.current) detailsRef.current.open = false;
  };

  return (
    <details className="code-dropdown" ref={detailsRef}>
      <summary className="toolbar-btn" title="Code Block (choose language)">
        {"{ }"}
      </summary>
      <div className="code-dropdown-menu">
        {LANGUAGES.map((lang) => (
          <button
            key={lang}
            className="code-dropdown-item"
            onClick={() => handleSelect(lang)}
          >
            {lang}
          </button>
        ))}
      </div>
    </details>
  );
}

export default Editor;
