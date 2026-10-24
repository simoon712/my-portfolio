import type { EditorItem } from "../types";

// 同じ図形が存在する場合は座標をずらす
export function offsetDuplicateItem(newItem: EditorItem, items: EditorItem[]): EditorItem {
  // ずらす距離
  const offset = 5;

  // 追加する図形のコピーを作成する
  let item = { ...newItem };

  // 同じ図形が存在する間は座標をずらす
  while (items.some((existing) => {
    if (existing.type !== item.type) return false;

    if (existing.type === "rectangle" && item.type === "rectangle") {
      return (
        existing.x === item.x &&
        existing.y === item.y &&
        existing.width === item.width &&
        existing.height === item.height
      );
    }

    if (existing.type === "line" && item.type === "line") {
      return (
        existing.x1 === item.x1 &&
        existing.y1 === item.y1 &&
        existing.x2 === item.x2 &&
        existing.y2 === item.y2
      );
    }

    return false;
  })) {
    // 四角形の場合
    if (item.type === "rectangle") {
      item = { ...item, x: item.x + offset, y: item.y + offset };
    }

    // 直線の場合
    if (item.type === "line") {
      item = {
        ...item,
        x1: item.x1 + offset,
        y1: item.y1 + offset * 2,
        x2: item.x2 + offset,
        y2: item.y2 + offset * 2
      };
    }
  }

  return item;
}