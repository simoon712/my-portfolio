import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

type NumberInputProps = {
  id: string; // 入力欄のID
  value: number; // 現在の図形データの値
  min?: number; // 入力できる最小値
  max?: number; // 入力できる最大値
  onChange: (value: number) => void; // 確定した値を反映する処理
};

// 数値を小数点以下2桁までに整形する
function formatNumber(value: number): string {
  return String(Number(value.toFixed(2)));
}

function NumberInput(props: NumberInputProps) {
  // 入力途中の文字列を管理する
  const [inputValue, setInputValue] = useState<string>(formatNumber(props.value));

  // Escapeキーによるキャンセルかどうかを管理する
  const isCancelingRef = useRef(false);

  // 図形の値が外部から変更された場合は入力欄にも反映する
  useEffect(() => {
    setInputValue(formatNumber(props.value));
  }, [props.value]);

  // Enterキーまたはフォーカス解除時に値を確定する
  function commitValue() {
    // Escapeキーによるキャンセルの場合は変更しない
    if (isCancelingRef.current) {
      isCancelingRef.current = false;
      setInputValue(formatNumber(props.value));
      return;
    }

    // 空欄や数値以外の入力は元の値に戻す
    if (inputValue.trim() === "") {
      setInputValue(formatNumber(props.value));
      return;
    }

    const value = Number(inputValue);

    // 数値が不正、または指定範囲外なら元の値に戻す
    if (
      !Number.isFinite(value) ||
      (props.min !== undefined && value < props.min) ||
      (props.max !== undefined && value > props.max)
    ) {
      setInputValue(formatNumber(props.value));
      return;
    }

    // 値が変わった場合だけ図形データを更新する
    if (value !== props.value) {
      props.onChange(value);
    }

    // 入力欄を確定した数値に統一する
    setInputValue(String(value));
  }

  // Enterキーを押したら入力を確定する
  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }

    // Escapeキーで編集をキャンセルする
    if (e.key === "Escape") {
      // フォーカス解除時に変更を確定しないようにする
      isCancelingRef.current = true;

      // 入力欄を元の値に戻してフォーカスを外す
      setInputValue(formatNumber(props.value));
      e.currentTarget.blur();
    }
  }

  return (
    <input
      id = {props.id}
      className = "property-number-input"
      type = "number"
      step = {1}
      min = {props.min}
      max = {props.max}
      value = {inputValue}
      onChange = {(e) => setInputValue(e.target.value)}
      onBlur = {commitValue}
      onKeyDown = {handleKeyDown}
    />
  );
}

export default NumberInput;
