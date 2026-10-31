
type StrokePropertiesProps = {
  stroke: string; // 線の色
  strokeWidth: number; // 線の太さ
  onStrokeChange: (color: string) => void; // 線の色を変更する処理
  onStrokeWidthChange: (width: number) => void; // 線の太さを変更する処理
};

function StrokeProperties(props: StrokePropertiesProps) {
  return (
    <>
      {/* 線の色を変更する */}
      <div className = "property-group">
        <label className = "property-label" htmlFor = "stroke-color">
          線の色
        </label>
        <input
          id = "stroke-color"
          className = "property-color-input"
          type = "color"
          value = {props.stroke}
          onChange = {(e) => props.onStrokeChange(e.target.value)}
        />
      </div>

      {/* 線の太さを変更する */}
      <div className = "property-group">
        <label className = "property-label" htmlFor = "stroke-width">
          線の太さ
        </label>
        <input
          id = "stroke-width"
          className = "property-number-input"
          type = "number"
          min = {1}
          max = {20}
          step = {1}
          value = {props.strokeWidth}
          onChange = {(e) => {
            // 入力された値を数値に変換する
            const width = Number(e.target.value);

            // 1〜20pxの範囲の場合だけ変更する
            if (width >= 1 && width <= 20) {
              props.onStrokeWidthChange(width);
            }
          }}
        />
      </div>
    </>
  );
}

export default StrokeProperties;