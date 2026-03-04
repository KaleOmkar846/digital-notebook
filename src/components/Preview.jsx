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

function Preview({ content, title }) {
  const previewRef = useRef(null);

  const handleDownloadPDF = () => {
    const element = previewRef.current;
    if (!element) return;

    const opt = {
      margin: [10, 15, 10, 15],
      filename: `${title || "note"}.pdf`,
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
    <div className="preview">
      <div className="preview-header">
        <span className="preview-title">👁️ Preview</span>
        <div className="preview-actions">
          <button
            className="download-btn"
            onClick={handleDownloadPDF}
            disabled={!content}
            title="Download as PDF"
          >
            📥 Download PDF
          </button>
          <span className="preview-hint">Formatted output</span>
        </div>
      </div>
      <div className="preview-content" ref={previewRef}>
        {content ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              code({ node, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                const isInline =
                  !match &&
                  (!node?.children?.length ||
                    node?.children?.every(
                      (c) => c.type === "text" && !c.value?.includes("\n"),
                    ));
                return !isInline && match ? (
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                    className="code-block"
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
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
            }}
          >
            {content}
          </ReactMarkdown>
        ) : (
          <div className="preview-placeholder">
            <p>Your formatted notes will appear here...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(Preview);
