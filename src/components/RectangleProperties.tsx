
import type { Rectangle } from "./types";

type RectanglePropertiesProps = {
  item: Rectangle; // 編集する四角形のデータ
  onChange: (field: "x" | "y" | "width" | "height", value: number) => void; // 座標・サイズを変更する処理
};

function RectangleProperties(props: RectanglePropertiesProps) {
  // 編集する四角形のデータを取得する
  const item = props.item;

  return (
    <>
      {/* 四角形の左上座標とサイズを変更する */}
      {(["x", "y", "width", "height"] as const).map((field) => (
        <div className = "property-group" key = {field}>

          {/* 入力項目の名前 */}
          <label className = "property-label" htmlFor = {`rectangle-${field}`}>
            {field === "x" ? "X座標" :
             field === "y" ? "Y座標" :
             field === "width" ? "幅" : "高さ"}
          </label>

          {/* 数値入力で四角形の座標・サイズを変更する */}
          <input
            id = {`rectangle-${field}`}
            className = "property-number-input"
            type = "number"
            step = {1}
            min = {field === "width" || field === "height" ? 1 : undefined}
            value = {item[field]}
            onChange = {(e) => {
              // 入力された値を数値に変換する
              const value = Number(e.target.value);

              // 不正な数値は更新しない
              if (!Number.isFinite(value) || e.target.value === "") return;

              // 幅と高さは1以上に制限する
              if ((field === "width" || field === "height") && value < 1) return;

              // 選択中の四角形を更新する
              props.onChange(field, value);
            }}
          />
        </div>
      ))}
    </>
  );
}

export default RectangleProperties;
