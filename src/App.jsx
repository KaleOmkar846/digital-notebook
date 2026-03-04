import { useState } from "react";
import "./App.css";
import Editor from "./components/Editor";
import Preview from "./components/Preview";

function App() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  return (
    <div className="app">
      <main className="main-content">
        <header className="header">
          <input
            type="text"
            className="title-input"
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </header>

        <div className="editor-preview-container">
          <Editor content={content} onChange={setContent} />
          <Preview content={content} title={title} />
        </div>
      </main>
    </div>
  );
}

export default App;
