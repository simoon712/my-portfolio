import NumberInput from "./NumberInput";

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

        {/* 線幅は1〜20pxの範囲で、入力確定時に変更する */}
        <NumberInput
          id = "stroke-width"
          value = {props.strokeWidth}
          min = {1}
          max = {20}
          onChange = {props.onStrokeWidthChange}
        />
      </div>
    </>
  );
}

export default StrokeProperties;