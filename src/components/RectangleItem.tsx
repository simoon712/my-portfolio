import type { Rectangle } from "./types";
import type { MouseEvent } from "react";

// 四角形コンポーネントに渡すデータの型
type RectangleItemProps = {
  item: Rectangle;
  selectedId: number | null;
  onMouseDown: (e: MouseEvent<SVGRectElement>, item: Rectangle) => void;
  onResizeMouseDown: (e: MouseEvent<SVGRectElement>, item: Rectangle) => void;
};

function RectangleItem(props: RectangleItemProps) {
  const item = props.item;
  const selectedId = props.selectedId;
  return (
    <g>
      {/* 四角形本体 */}
      <rect
        x = {item.x}
        y = {item.y}
        width = {item.width}
        height = {item.height}
        fill = "none"
        stroke = {selectedId === item.id ? "blue" : "#222"}
        strokeWidth = {selectedId === item.id ? 2 : 1}
        onMouseDown = {(e) => props.onMouseDown(e, item)}
        style = {{ cursor: "move" }}
      />

      {/* 選択中のitemにリサイズハンドルを表示 */}
      {selectedId === item.id && (
        <rect
          x = {item.x + item.width - 5}
          y = {item.y + item.height - 5}
          width = {10}
          height = {10}
          fill = "blue"
          style = {{ cursor: "nwse-resize" }}
          onMouseDown = {(e) => props.onResizeMouseDown(e, item)}
        />
      )}
    </g>
  );
}

export default RectangleItem;