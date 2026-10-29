import type { Line } from "./types";
import type { MouseEvent } from "react";

// 直線コンポーネントに渡すデータの型
type LineItemProps = {
  item: Line;
  selectedId: string | null;
  onMouseDown: (e: MouseEvent<SVGLineElement>, item: Line) => void;
  // 直線をドラッグしてリサイズを開始する
  onResizeMouseDown: (e: MouseEvent<SVGCircleElement>, item: Line, endpoint: 'start' | 'end') => void;
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
        stroke = {selectedId === item.uuid ? "blue" : "#222"}
        strokeWidth = {selectedId === item.uuid ? 3 : 2}
        onMouseDown = {(e) => props.onMouseDown(e, item)}
        style = {{ cursor: "move" }}
        vectorEffect = "non-scaling-stroke"
      />

      {/* 選択中の直線の両端にハンドルを表示 */}
      {selectedId === item.uuid && (
        <>
          {/* 始点のハンドル */}
          <circle
            cx = {item.x1}
            cy = {item.y1}
            r = {5}
            fill = "blue"
            style = {{ cursor: "crosshair" }}
            onMouseDown = {(e) => props.onResizeMouseDown(e, item, 'start')}
          />

          {/* 終点のハンドル */}
          <circle
            cx = {item.x2}
            cy = {item.y2}
            r = {5}
            fill = "blue"
            style = {{ cursor: "crosshair" }}
            onMouseDown = {(e) => props.onResizeMouseDown(e, item, 'end')}
          />
        </>
      )}
    </g>
  );
}

export default LineItem;