export interface PhotoCrop { width: number; height: number; x: number; y: number; zoom: number }
export function validPhotoCrop(value: unknown): value is PhotoCrop {
  if (!value || typeof value !== 'object') return false;
  const crop = value as PhotoCrop;
  return [crop.width, crop.height, crop.x, crop.y, crop.zoom].every(Number.isFinite) && crop.width > 0 && crop.height > 0 && Math.abs(crop.x) <= 1 && Math.abs(crop.y) <= 1 && crop.zoom >= 1 && crop.zoom <= 4;
}
export function zoomPhoto(crop: PhotoCrop, zoom: number): PhotoCrop {
  return { ...crop, zoom: Math.max(1, Math.min(4, zoom)) };
}
export function photoLayout(crop: PhotoCrop, width: number, height: number) {
  const side = Math.min(crop.width, crop.height) / crop.zoom;
  const scale = Math.max(width, height) / side;
  const left = (crop.width - side) * (crop.x + 1) / 2;
  const top = (crop.height - side) * (crop.y + 1) / 2;
  return { width: crop.width * scale, height: crop.height * scale, left: (width - side * scale) / 2 - left * scale, top: (height - side * scale) / 2 - top * scale };
}
export function movePhoto(crop: PhotoCrop, dx: number, dy: number, previewSize: number): PhotoCrop {
  const size = Math.min(crop.width, crop.height) / crop.zoom;
  const scale = previewSize / size;
  const xRange = (crop.width - size) * scale;
  const yRange = (crop.height - size) * scale;
  const clamp = (value: number) => Math.max(-1, Math.min(1, value));
  return { ...crop, x: xRange > 0 ? clamp(crop.x - 2 * dx / xRange) : 0, y: yRange > 0 ? clamp(crop.y - 2 * dy / yRange) : 0 };
}

export interface PhotoPoint { x: number; y: number }
export function gesturePhoto(crop: PhotoCrop, before: readonly PhotoPoint[], after: readonly PhotoPoint[], previewSize: number): PhotoCrop {
  if (!before.length || before.length !== after.length || previewSize <= 0) return crop;
  const center = (points: readonly PhotoPoint[]) => points.length === 1 ? points[0] : { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 };
  const distance = (points: readonly PhotoPoint[]) => Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
  let zoom = crop.zoom;
  if (before.length > 1) {
    const initialDistance = distance(before);
    if (initialDistance < 1) return crop;
    zoom = zoomPhoto(crop, crop.zoom * distance(after) / initialDistance).zoom;
  }
  const from = center(before); const to = center(after);
  const oldSide = Math.min(crop.width, crop.height) / crop.zoom;
  const side = Math.min(crop.width, crop.height) / zoom;
  // Keep the source point between the fingers under their moving midpoint.
  const sourceX = (crop.width - oldSide) * (crop.x + 1) / 2 + from.x * oldSide / previewSize;
  const sourceY = (crop.height - oldSide) * (crop.y + 1) / 2 + from.y * oldSide / previewSize;
  const x = sourceX - to.x * side / previewSize;
  const y = sourceY - to.y * side / previewSize;
  const clamp = (value: number) => Math.max(-1, Math.min(1, value));
  return { ...crop, zoom, x: crop.width > side ? clamp(2 * x / (crop.width - side) - 1) : 0, y: crop.height > side ? clamp(2 * y / (crop.height - side) - 1) : 0 };
}
