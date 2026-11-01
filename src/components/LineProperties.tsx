
import type { Line } from "./types";
import NumberInput from "./NumberInput";

type LinePropertiesProps = {
  item: Line; // 編集する直線のデータ
  onChange: (field: "x1" | "y1" | "x2" | "y2", value: number) => void; // 始点・終点の座標を変更する処理
};

function LineProperties(props: LinePropertiesProps) {
  // 編集する直線のデータを取得する
  const item = props.item;

  return (
    <>
      {/* 直線の始点・終点の座標を変更する */}
      {(["x1", "y1", "x2", "y2"] as const).map((field) => (
        <div className = "property-group" key = {field}>

          {/* 入力する座標の名前 */}
          <label className = "property-label" htmlFor = {`line-${field}`}>
            {field === "x1" ? "始点X" :
             field === "y1" ? "始点Y" :
             field === "x2" ? "終点X" : "終点Y"}
          </label>

          {/* 数値入力で直線の始点・終点を変更する */}
          <NumberInput
            id = {`line-${field}`}
            value = {item[field]}
            onChange = {(value) => props.onChange(field, value)}
          />
        </div>
      ))}
    </>
  );
}

export default LineProperties;
