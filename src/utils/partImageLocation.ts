/**
 * 部位图像位置：归一化矩形区域 (x, y, w, h)，均为 0～1 相对图像宽高
 */
export interface PartImageRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function parsePartImageLocation(value: string | null | undefined): PartImageRect | null {
  if (!value || typeof value !== 'string') return null;
  try {
    const o = JSON.parse(value) as PartImageRect;
    if (
      typeof o.x === 'number' &&
      typeof o.y === 'number' &&
      typeof o.w === 'number' &&
      typeof o.h === 'number'
    ) {
      return o;
    }
  } catch {
    // ignore
  }
  return null;
}

export function stringifyPartImageLocation(rect: PartImageRect): string {
  return JSON.stringify(rect);
}

/**
 * 判断归一化点 (nx, ny) 是否在矩形内
 */
export function isPointInRect(nx: number, ny: number, rect: PartImageRect): boolean {
  return (
    nx >= rect.x &&
    nx <= rect.x + rect.w &&
    ny >= rect.y &&
    ny <= rect.y + rect.h
  );
}

/**
 * 根据在图像上的点击位置（归一化 0-1）从部位列表中找出包含该点的部位
 * 若有多个重叠，返回第一个匹配的
 */
export function findPartByNormalizedPoint(
  normalizedX: number,
  normalizedY: number,
  parts: Array<{ id?: string; name?: string; imageLocation?: string | null }>
): typeof parts[0] | null {
  const rects = parts.map((p) => ({ part: p, rect: parsePartImageLocation(p.imageLocation ?? '') }));
  for (const { part, rect } of rects) {
    if (rect && isPointInRect(normalizedX, normalizedY, rect)) return part;
  }
  return null;
}
