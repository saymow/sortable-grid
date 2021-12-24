import { Size, GridPosition, Position } from '../dtos/index.js';
import { Cells } from './cells.js';
import { Rect } from '../rect/rect.js';

export class CellsFactory {
  /** @type Map<string, Cells> */
  storeMap;

  /**
   * @param  {number} width
   * @param  {number} height
   * @param  {number} gap
   * @param  {number} padding
   * @param  {Map<string, Cells>} storeMap
   */
  constructor(width, height, gap, padding, storeMap) {
    this.width = width;
    this.height = height;
    this.gap = gap;
    this.padding = padding;
    this.storeMap = storeMap;
  }

  /**
   * @param  {Size} size
   */
  getInstance({ width, height }) {
    return new Cells(
      Math.round((height + this.gap) / (this.gap + this.height)),
      Math.round((width + this.gap) / (this.gap + this.width))
    );
  }

  /**
   * @param  {Size} size
   */
  getPaddedInstance({ width, height }) {
    return this.getInstance({ width: width - 2 * this.padding, height: height - 2 * this.padding });
  }

  /**
   * @param  {Rect} rect
   */
  fromRect(rect) {
    return this.getInstance(new Size(rect.right - rect.left, rect.bottom - rect.top));
  }

  /**
   * @param  {Rect} rect
   */
  fromPaddedRect(rect) {
    return this.getPaddedInstance(new Size(rect.right - rect.left, rect.bottom - rect.top));
  }

  /**
   * @param {HTMLElement} element
   */
  fromElement(element) {
    const { width, height } = element.getBoundingClientRect();

    return this.getInstance(new Size(width, height));
  }

  /**
   * @param  {string} key
   */
  fromStore(key) {
    const rawCells = this.storeMap.get(key);

    if (!rawCells) throw new UnsubscribedError(key);

    return new Cells(rawCells.vertical, rawCells.horizontal);
  }

  /**
   * @param  {HtmlGrid} gridPosition
   */
  fromGridPosition(gridPosition) {
    const { rowStart, columnStart, rowEnd, columnEnd } = gridPosition;

    return new Cells(rowEnd - rowStart, columnEnd - columnStart);
  }

  /**
   * @param  {Cells} cells
   * @param  {Position} position
   */
  toRect(cells, position) {
    const { horizontal, vertical } = cells;
    const size = new Size(
      horizontal * this.width + (horizontal - 1) * this.gap,
      vertical * this.height + (vertical - 1) * this.gap
    );

    return new Rect(position.x, position.y, position.x + size.width, position.y + size.height);
  }

  /**
   * @param  {Cells} cells
   * @param  {Position} absPosition
   * @param  {Rect} boundaryRect
   * @param  {boolean} isBoundaryRectPadded
   */
  toGridPosition(cells, absPosition, boundaryRect, isBoundaryRectPadded) {
    const relativeToBoundaryPosition = new Position(
      Math.max(absPosition.x - boundaryRect.left, 0),
      Math.max(absPosition.y - boundaryRect.top, 0)
    );
    const boundaryCells = this[isBoundaryRectPadded ? 'fromPaddedRect' : 'fromRect'](boundaryRect);
    const rowStartBoundary = boundaryCells.vertical - cells.vertical;
    const columnStartBoundary = boundaryCells.horizontal - cells.horizontal;
    const rawRowStart = (relativeToBoundaryPosition.y - this.padding) / (this.height + this.gap);
    const rawColumnStart = (relativeToBoundaryPosition.x - this.padding) / (this.width + this.gap);
    const rowStart = Math.round(_.clamp(rawRowStart, 0, rowStartBoundary));
    const columnStart = Math.round(_.clamp(rawColumnStart, 0, columnStartBoundary));
    const boundaryPadding = isBoundaryRectPadded ? this.padding : 0;
    const relativePosition = new Position(
      boundaryRect.left + columnStart * this.width + columnStart * this.gap + boundaryPadding,
      boundaryRect.top + rowStart * this.height + rowStart * this.gap + boundaryPadding
    );

    return new GridPosition(
      Math.round(rowStart),
      Math.round(columnStart),
      Math.round(rowStart + cells.vertical),
      Math.round(columnStart + cells.horizontal),
      relativePosition
    );
  }

  /**
   * @param  {Cells} cells
   */
  toSize(cells) {
    const { horizontal, vertical } = cells;

    return new Size(
      horizontal * this.width + (horizontal - 1) * this.gap,
      vertical * this.height + (vertical - 1) * this.gap
    );
  }
}
