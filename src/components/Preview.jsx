import { useRef, memo } from "react";
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
  return match ? match[1].trim() : "notes";
}

function Preview({ content, expanded, onToggleExpand, style }) {
  const previewRef = useRef(null);

  const handleDownloadPDF = () => {
    const element = previewRef.current;
    if (!element) return;

    const pdfTitle = extractTitle(content);

    const opt = {
      margin: [10, 15, 10, 15],
      filename: `${pdfTitle}.pdf`,
      image: { type: "jpeg", quality: 0.95 },
      html2canvas: {
        scale: 3,
        useCORS: true,
        letterRendering: true,
        logging: false,
        windowWidth: element.scrollWidth,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
        compress: true,
        putOnlyUsedFonts: true,
      },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    html2pdf().set(opt).from(element).save();
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
            disabled={!content}
            title="Download as PDF"
          >
            Download PDF
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
