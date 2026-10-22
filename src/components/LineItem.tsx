import type { Line } from "./types";
import type { MouseEvent } from "react";

// 直線コンポーネントに渡すデータの型
type LineItemProps = {
  item: Line;
  selectedId: number | null;
  onMouseDown: (e: MouseEvent<SVGLineElement>, item: Line) => void;
  // 直線の終点をドラッグしてリサイズを開始する
  onResizeMouseDown: (e: MouseEvent<SVGCircleElement>, item: Line) => void;
};

function LineItem(props: LineItemProps) {
  const item = props.item;
  const selectedId = props.selectedId;

  return (
    <g>
      <line
        x1 = {item.x1}
        y1 = {item.y1}
        x2 = {item.x2}
        y2 = {item.y2}
        stroke = {selectedId === item.id ? "blue" : "#222"}
        strokeWidth = {selectedId === item.id ? 3 : 2}
        onMouseDown = {(e) => props.onMouseDown(e, item)}
      />

      {/* 選択中の直線の終点にハンドルを表示 */}
      {selectedId === item.id && (
        <circle
          cx = {item.x2}
          cy = {item.y2}
          r = {5}
          fill = "blue"
          style = {{ cursor: "nwse-resize" }}
          onMouseDown = {(e) => props.onResizeMouseDown(e, item)}
        />
      )}
    </g>
  );
}

export default LineItem;