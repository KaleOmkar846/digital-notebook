import { useRef, useState, memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import html2pdf from "html2pdf.js";
import "katex/dist/katex.min.css";
import "./Preview.css";

function extractTitle(content) {
  if (!content) return "notes";
  const match = content.match(/^#{1,3}\s+(.+)$/m);
  if (!match) return "notes";
  // Sanitize: remove characters invalid in filenames and cap length
  return (
    match[1]
      .trim()
      .replace(/[\\/:*?"<>|]/g, "")
      .replace(/\s+/g, " ")
      .substring(0, 100) || "notes"
  );
}

function Preview({ content, expanded, onToggleExpand, style }) {
  const previewRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    const element = previewRef.current;
    if (!element || isGenerating) return;

    setIsGenerating(true);
    const pdfTitle = extractTitle(content);

    // Clone into a properly sized off-screen container
    const clone = element.cloneNode(true);
    clone.classList.add("pdf-rendering");

    // Strip inline overflow/width styles from ALL children so CSS can control layout
    clone.querySelectorAll("*").forEach((el) => {
      el.style.removeProperty("overflow");
      el.style.removeProperty("overflow-x");
      el.style.removeProperty("overflow-y");
      el.style.removeProperty("min-width");
      el.style.removeProperty("max-width");
      el.style.removeProperty("width");
    });

    // Force code blocks to wrap instead of scroll
    clone
      .querySelectorAll("pre, code, .code-block, .code-block-wrapper")
      .forEach((el) => {
        el.style.whiteSpace = "pre-wrap";
        el.style.wordBreak = "break-word";
        el.style.overflowWrap = "break-word";
        el.style.overflow = "hidden";
        el.style.maxWidth = "100%";
      });

    // A4 content area: 210mm - 2*10mm margins = 190mm ≈ 718px at 96 DPI
    const pdfWidth = 718;
    clone.style.cssText = `width:${pdfWidth}px;max-width:${pdfWidth}px;padding:10px;box-sizing:border-box;overflow:hidden;`;

    // Apply light theme CSS variables directly on clone to avoid flashing the whole page
    const lightVars = {
      "--bg-primary": "#ffffff",
      "--bg-secondary": "#fafafa",
      "--bg-tertiary": "#f5f5f5",
      "--text-primary": "#333333",
      "--text-secondary": "#444444",
      "--text-muted": "#888888",
      "--text-placeholder": "#aaaaaa",
      "--border-color": "#e0e0e0",
      "--accent-color": "#4a90d9",
      "--heading-h1": "#1d4ed8",
      "--heading-h2": "#0e7461",
      "--heading-h3": "#7e3abf",
      "--heading-h4": "#b94a1e",
      "--code-inline-bg": "#f0f0f0",
      "--code-inline-color": "#d63384",
      "--blockquote-bg": "#f8fafc",
      "--blockquote-text": "#555555",
      "--table-header-bg": "#4a90d9",
      "--table-even-row": "#f8f9fa",
      "--table-hover-row": "#e8f4fd",
      "--shadow-light": "rgba(0, 0, 0, 0.05)",
      "--shadow-medium": "rgba(0, 0, 0, 0.1)",
      "--shadow-heavy": "rgba(0, 0, 0, 0.15)",
      "--strong-color": "#1a1a1a",
      "--link-color": "#4a90d9",
    };
    Object.entries(lightVars).forEach(([k, v]) =>
      clone.style.setProperty(k, v),
    );
    clone.style.setProperty("background-color", "#ffffff");
    clone.style.setProperty("color", "#444444");

    const wrapper = document.createElement("div");
    wrapper.style.cssText = `position:fixed;left:-9999px;top:0;width:${pdfWidth}px;z-index:-9999;`;
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    // Wait for fonts to load and layout to settle
    await document.fonts.ready;
    await new Promise((r) => setTimeout(r, 100));

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${pdfTitle}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        logging: false,
        width: pdfWidth,
        windowWidth: pdfWidth,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
        compress: true,
      },
      pagebreak: { mode: ["css", "legacy"] },
    };

    try {
      await html2pdf().set(opt).from(clone).save();
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      try {
        document.body.removeChild(wrapper);
      } catch {}
      setIsGenerating(false);
    }
  };

  return (
    <div
      className={`preview ${expanded ? "preview-expanded" : ""}`}
      style={style}
    >
      <div className="preview-header">
        <span className="preview-title">Preview</span>
        <div className="preview-actions">
          <button
            className="download-btn"
            onClick={handleDownloadPDF}
            disabled={!content || isGenerating}
            title="Download as PDF"
          >
            {isGenerating ? "Generating..." : "Download PDF"}
          </button>
          <button
            className="expand-btn"
            onClick={onToggleExpand}
            title={expanded ? "Exit fullscreen" : "Fullscreen preview"}
          >
            {expanded ? "Collapse" : "Expand"}
          </button>
        </div>
      </div>
      <div className="preview-content" ref={previewRef}>
        {content ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              pre({ children }) {
                return <>{children}</>;
              },
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                const codeString = String(children).replace(/\n$/, "");
                if (match || codeString.includes("\n")) {
                  const lang = match ? match[1] : "text";
                  return (
                    <div className="code-block-wrapper">
                      <div className="code-block-header">
                        <span className="code-block-lang">{lang}</span>
                      </div>
                      <SyntaxHighlighter
                        style={oneDark}
                        language={lang}
                        PreTag="div"
                        className="code-block"
                        {...props}
                      >
                        {codeString}
                      </SyntaxHighlighter>
                    </div>
                  );
                }
                return (
                  <code className={`inline-code ${className || ""}`} {...props}>
                    {children}
                  </code>
                );
              },
              table({ children }) {
                return (
                  <div className="table-wrapper">
                    <table>{children}</table>
                  </div>
                );
              },
              input({ type, checked, ...props }) {
                if (type === "checkbox") {
                  return (
                    <input
                      type="checkbox"
                      checked={checked}
                      readOnly
                      className="task-checkbox"
                      {...props}
                    />
                  );
                }
                return <input type={type} {...props} />;
              },
              li({ children, className, ...props }) {
                const isTask = className === "task-list-item";
                return (
                  <li
                    className={isTask ? "task-list-item" : undefined}
                    {...props}
                  >
                    {children}
                  </li>
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
        ) : (
          <div className="preview-placeholder">
            <div className="placeholder-content">
              <h2>Your notes will appear here</h2>
              <p>Start typing in the editor to see a live preview.</p>
              <div className="placeholder-features">
                <div className="placeholder-feature">
                  <strong>Code</strong>
                  <span>Syntax-highlighted blocks with copy button</span>
                </div>
                <div className="placeholder-feature">
                  <strong>Math</strong>
                  <span>LaTeX formulas inline and block</span>
                </div>
                <div className="placeholder-feature">
                  <strong>Tables</strong>
                  <span>Formatted data tables</span>
                </div>
                <div className="placeholder-feature">
                  <strong>Tasks</strong>
                  <span>Checkbox task lists</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(Preview);
