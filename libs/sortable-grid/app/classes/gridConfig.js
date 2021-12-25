export class GridConfig {
  /**
   * @param  {number} cellWidth
   * @param  {number} cellHeight
   * @param  {number} padding
   * @param  {number} gap
   */
  constructor(cellWidth, cellHeight, padding, gap) {
    this.cellSize = {
      width: cellWidth,
      height: cellHeight,
    }
    this.padding = padding
    this.gap = gap
  }
}
