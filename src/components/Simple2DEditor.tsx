import { useState } from "react";
type Rectangle = {
  id: number;
  x:  number;
  y:  number;
};

function Simple2DEditor() {
  // Rectangleを管理
  const [rectangles, setRectangles] = useState<Rectangle[]>([]);
  function addRectangle() {
    // ここで新しいRectangleを作る
    const newRectangle: Rectangle = {
      id: rectangles.length + 1,
      x: 50,
      y: 50,
    };
    setRectangles([
      ...rectangles,
      newRectangle
    ]);
  }
  return (
    <>
      <h2>Simple 2D Editor</h2>
      <button
        onClick = {addRectangle}
      >
        Add Rectangle
      </button>

      <div className = "editor-area">
        {rectangles.map((rect) => (
          <div
            key = {rect.id}
            className = "rectangle"
            style = {{
              left: rect.x,
              top: rect.y
            }}
          >
          </div>
        ))}
      </div>
    </>
  );
}
export default Simple2DEditor;