import type { EditorItem } from "./types";
import RectangleProperties from "./RectangleProperties";
import LineProperties from "./LineProperties";
import StrokeProperties from "./StrokeProperties";

type PropertiesPanelProps = {
  selectedCount: number; // 選択中の図形の数
  stroke: string; // 選択中の図形の線の色
  strokeWidth: number; // 選択中の図形の線の太さ
  selectedItem?: EditorItem; // 単体選択中の図形データ
  onStrokeChange: (color: string) => void; // 線の色を変更する処理
  onStrokeWidthChange: (width: number) => void; // 線の太さを変更する処理
  onRectangleChange: (field: "x" | "y" | "width" | "height", value: number) => void; // 四角形の座標・サイズを変更する処理
  onLineChange: (field: "x1" | "y1" | "x2" | "y2", value: number) => void; // 直線の始点・終点座標を変更する処理
};

function PropertiesPanel(props: PropertiesPanelProps) {
  // 選択中の図形の数を取得する
  const selectedCount = props.selectedCount;

  // 選択中の四角形を取得する
  const rectangle = props.selectedItem?.type === "rectangle"
    ? props.selectedItem
    : null;

  // 選択中の直線を取得する
  const line = props.selectedItem?.type === "line"
    ? props.selectedItem
    : null;

  return (
    // 図形が選択されたら右側からスライド表示する
    <aside className = {`editor-properties-panel ${selectedCount > 0 ? "is-open" : ""}`}>
      <div className = "properties-panel-content">

        {/* 単体選択時のメニュー */}
        {selectedCount === 1 ? (
          <>
            <h3 className = "properties-panel-title">図形のプロパティ</h3>
            <p className = "properties-panel-status">単体選択中</p>

            {/* 単体選択中の図形情報を表示する */}
            {props.selectedItem && (
              <div className = "property-group">

                {/* 図形の種類を表示する */}
                <p>
                  種類：{props.selectedItem.type === "rectangle" ? "四角形" : "直線"}
                </p>

                {/* 四角形と直線で表示内容を切り替える */}
                {rectangle ? (
                  <RectangleProperties
                    item = {rectangle}
                    onChange = {props.onRectangleChange}
                  />
                ) : line ? (
                  <LineProperties
                    item = {line}
                    onChange = {props.onLineChange}
                  />
                ) : null}
              </div>
            )}

            {/* 線の色と太さを変更する共通メニュー */}
            <StrokeProperties
              stroke = {props.stroke}
              strokeWidth = {props.strokeWidth}
              onStrokeChange = {props.onStrokeChange}
              onStrokeWidthChange = {props.onStrokeWidthChange}
            />
          </>
        ) : selectedCount > 1 ? (
          <>
            {/* 複数選択時のメニュー */}
            <h3 className = "properties-panel-title">一括編集</h3>
            <p className = "properties-panel-status">
              {selectedCount}個の図形を選択中
            </p>

            {/* 線の色と太さを変更する共通メニュー */}
            <StrokeProperties
              stroke = {props.stroke}
              strokeWidth = {props.strokeWidth}
              onStrokeChange = {props.onStrokeChange}
              onStrokeWidthChange = {props.onStrokeWidthChange}
            />
          </>
        ) : null}

      </div>
    </aside>
  );
}

export default PropertiesPanel;
