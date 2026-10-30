import type { Rectangle } from "./types";
import type { MouseEvent } from "react";

// 四角形コンポーネントに渡すデータの型
type RectangleItemProps = {
  item: Rectangle;
  selectedId: string | null;
  zoomScale: number; // SVGのズーム倍率
  onMouseDown: (e: MouseEvent<SVGRectElement>, item: Rectangle) => void;
  onResizeMouseDown: (e: MouseEvent<SVGRectElement>, item: Rectangle) => void;
};

function RectangleItem(props: RectangleItemProps) {
  const item = props.item;
  const selectedId = props.selectedId;
  // ズームしても画面上で10px角になるように調整する
  const handleSize = 10 / props.zoomScale;
  return (
    <g>
      {/* 四角形本体 */}
      <rect
        x = {item.x}
        y = {item.y}
        width = {item.width}
        height = {item.height}
        fill = "none"
        stroke = {selectedId === item.uuid ? "blue" : item.stroke}
        strokeWidth = {selectedId === item.uuid ? 2 : 1}
        onMouseDown = {(e) => props.onMouseDown(e, item)}
        style = {{ cursor: "move" }}
        vectorEffect = "non-scaling-stroke"
      />

      {/* 選択中のitemにリサイズハンドルを表示 */}
      {selectedId === item.uuid && (
        <rect
          x = {item.x + item.width - handleSize / 2}
          y = {item.y + item.height - handleSize / 2}
          width = {handleSize}
          height = {handleSize}
          fill = "blue"
          style = {{ cursor: "nwse-resize" }}
          vectorEffect = "non-scaling-stroke"
          onMouseDown = {(e) => props.onResizeMouseDown(e, item)}
        />
      )}
    </g>
  );
}

export default RectangleItem;