export class HtmlGrid {
  /**
   * @param {number} rowStart
   * @param {number} columnStart
   * @param {number} rowEnd
   * @param {number} columnEnd
   */
  constructor(rowStart, columnStart, rowEnd, columnEnd) {
    this.rowStart = rowStart;
    this.columnStart = columnStart;
    this.rowEnd = rowEnd;
    this.columnEnd = columnEnd;
  }
}

export class GridPosition extends HtmlGrid {
  get htmlGrid() {
    return new HtmlGrid(this.rowStart + 1, this.columnStart + 1, this.rowEnd + 1, this.columnEnd + 1);
  }

  /**
   * @param {number} rowStart
   * @param {number} columnStart
   * @param {number} rowEnd
   * @param {number} columnEnd
   * @param {number} upperLeftPosition
   */
  constructor(rowStart, columnStart, rowEnd, columnEnd, upperLeftPosition) {
    super(rowStart, columnStart, rowEnd, columnEnd);
    this.upperLeftPosition = upperLeftPosition;
  }
}

export class Size {
  /**
   * @param  {number} width
   * @param  {number} height
   */
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
}

export class Position {
  /**
   * @param  {number} x
   * @param  {number} y
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

export class Boundaries {
  /**
   * @param  {number} minWidth
   * @param  {number} maxWidth
   * @param  {number} minHeight
   * @param  {number} maxHeight
   */
  constructor(minWidth, maxWidth, minHeight, maxHeight) {
    this.minWidth = minWidth;
    this.maxWidth = maxWidth;
    this.minHeight = minHeight;
    this.maxHeight = maxHeight;
  }
}
