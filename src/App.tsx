
import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Editor from "./pages/Editor";

function App() {
  return (
    <HashRouter>
      <Routes>
        {/* ポートフォリオのトップページ */}
        <Route
          path = "/"
          element = {
            <div className = "home-page">
              <Home />
            </div>
          }
        />

        {/* Drawing Editorのページ */}
        <Route
          path = "/editor"
          element = {
            <div className = "editor-page">
              <Editor />
            </div>
          }
        />
      </Routes>
    </HashRouter>
  );
}

export default App;
