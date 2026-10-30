type PropertiesPanelProps = {
  selectedCount: number; // 選択中の図形の数
  stroke: string; // 選択中の図形の線色
  onStrokeChange: (color: string) => void; // 線色を変更する処理
};

function PropertiesPanel(props: PropertiesPanelProps) {
  const selectedCount = props.selectedCount;

  return (
    <aside className = {`editor-properties-panel ${selectedCount > 0 ? "is-open" : ""}`}>
      <h3>プロパティ</h3>

      {selectedCount === 1 ? (
        <p>単体選択中</p>
      ) : selectedCount > 1 ? (
        <p>{selectedCount}個の図形を選択中</p>
      ) : null}

      {selectedCount > 0 && (
        <label>
          線の色
          <input
            type = "color"
            value = {props.stroke}
            onChange = {(e) => props.onStrokeChange(e.target.value)}
          />
        </label>
      )}
    </aside>
  );
}

export default PropertiesPanel;