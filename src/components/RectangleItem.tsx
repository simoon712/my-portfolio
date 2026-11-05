import type { Rectangle, ResizeDirection } from "./types";
import type { MouseEvent } from "react";

// 四角形コンポーネントに渡すデータの型
type RectangleItemProps = {
  item: Rectangle;
  selectedId: string | null;
  zoomScale: number; // SVGのズーム倍率
  onMouseDown: (e: MouseEvent<SVGRectElement>, item: Rectangle) => void;
  onResizeMouseDown: (e: MouseEvent<SVGRectElement>, item: Rectangle, direction: ResizeDirection) => void;
};

function RectangleItem(props: RectangleItemProps) {
  const item = props.item;
  const selectedId = props.selectedId;

  // 四角形の左上座標とサイズを取得する
  const x = props.item.x;
  const y = props.item.y;
  const width = props.item.width;
  const height = props.item.height;

  // ズーム倍率に合わせてハンドルの表示サイズを調整する
  const handleSize = 8 / props.zoomScale;

  // 8方向のリサイズハンドルの中心座標
  const resizeHandles: {
    direction: ResizeDirection;
    x: number;
    y: number;
  }[] = [
    { direction: "top-left", x: x, y: y },
    { direction: "top", x: x + width / 2, y: y },
    { direction: "top-right", x: x + width, y: y },
    { direction: "right", x: x + width, y: y + height / 2 },
    { direction: "bottom-right", x: x + width, y: y + height },
    { direction: "bottom", x: x + width / 2, y: y + height },
    { direction: "bottom-left", x: x, y: y + height },
    { direction: "left", x: x, y: y + height / 2 }
  ];

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
        strokeWidth = {item.strokeWidth}
        onMouseDown = {(e) => props.onMouseDown(e, item)}
        style = {{ cursor: "move" }}
        vectorEffect = "non-scaling-stroke"
      />

      {/* 選択中の四角形に8方向のリサイズハンドルを表示する */}
      {props.selectedId && resizeHandles.map((handle) => (
        <rect
          key = {handle.direction}
          x = {handle.x - handleSize / 2}
          y = {handle.y - handleSize / 2}
          width = {handleSize}
          height = {handleSize}
          fill = "#ffffff"
          stroke = "#2563eb"
          strokeWidth = {1.5}
          vectorEffect = "non-scaling-stroke"
          cursor = {handle.direction === "top-left" || handle.direction === "bottom-right" ? "nwse-resize" :
                    handle.direction === "top-right" || handle.direction === "bottom-left" ? "nesw-resize" :
                    handle.direction === "top" || handle.direction === "bottom" ? "ns-resize" : "ew-resize"}
          onMouseDown = {(e) => props.onResizeMouseDown(e, props.item, handle.direction)}
        />
      ))}
    </g>
  );
}

export default RectangleItem;