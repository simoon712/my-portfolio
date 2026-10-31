// 四角形の定義
export type Rectangle = {
  uuid: string;
  type: "rectangle"; // 図形の種類
  x:  number;
  y:  number;
  width: number;
  height: number;
  stroke: string; // 線の色
  strokeWidth: number; // 線の太さ
};

// 直線のデータを表す型
export type Line = {
  uuid: string;
  type: "line";
  x1: number; // 始点のX座標
  y1: number; // 始点のY座標
  x2: number; // 終点のX座標
  y2: number; // 終点のY座標
  stroke: string; // 線の色
  strokeWidth: number; // 線の太さ
};

// エディタで扱うすべての図形の型
export type EditorItem = Rectangle | Line;

// マウス操作時の位置や移動量を表す型
export type DragOffset = {
  x: number;
  y: number;
};

// 現在の操作状態
export type EditorAction =
  | { type: "none" }
  | { type: "drag"; uuid: string }
  | { type: "resize"; uuid: string }
  | { type: "pan" }
  | { type: "resize-line"; uuid: string; endpoint: "start" | "end" };

// SVGの表示範囲
export type ViewBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type EditorHistory = {
  past: EditorItem[][];    // 過去の図形データ
  present: EditorItem[];   // 現在の図形データ
  future: EditorItem[][];  // やり直し用の図形データ
};