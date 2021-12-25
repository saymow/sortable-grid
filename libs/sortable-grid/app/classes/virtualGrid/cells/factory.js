import { Size, GridPosition, Position } from '../dtos/index.js'
import { Cells } from './cells.js'
import { Rect } from '../rect/rect.js'

export class CellsFactory {
  /** @type Map<string, Cells> */
  storeMap

  /**
   * @param  {{cellSize: {width: number; height: number}; padding: number; gap: number}} gridConfig
   * @param  {Map<string, Cells>} storeMap
   */
  constructor(gridConfig, storeMap) {
    this.grid = gridConfig
    this.storeMap = storeMap
  }

  /**
   * @param  {Size} size
   */
  getInstance({ width, height }) {
    return new Cells(
      Math.round(
        (height + this.grid.gap) / (this.grid.gap + this.grid.cellSize.height),
      ),
      Math.round(
        (width + this.grid.gap) / (this.grid.gap + this.grid.cellSize.width),
      ),
    )
  }

  /**
   * @param  {Size} size
   */
  getPaddedInstance({ width, height }) {
    return this.getInstance({
      width: width - 2 * this.grid.padding,
      height: height - 2 * this.grid.padding,
    })
  }

  /**
   * @param  {Rect} rect
   */
  fromRect(rect) {
    return this.getInstance(
      new Size(rect.right - rect.left, rect.bottom - rect.top),
    )
  }

  /**
   * @param  {Rect} rect
   */
  fromPaddedRect(rect) {
    return this.getPaddedInstance(
      new Size(rect.right - rect.left, rect.bottom - rect.top),
    )
  }

  /**
   * @param {HTMLElement} element
   */
  fromElement(element) {
    const { width, height } = element.getBoundingClientRect()

    return this.getInstance(new Size(width, height))
  }

  /**
   * @param  {string} key
   */
  fromStore(key) {
    const rawCells = this.storeMap.get(key)

    if (!rawCells) throw new UnsubscribedError(key)

    return new Cells(rawCells.vertical, rawCells.horizontal)
  }

  /**
   * @param  {HtmlGrid} gridPosition
   */
  fromGridPosition(gridPosition) {
    const { rowStart, columnStart, rowEnd, columnEnd } = gridPosition

    return new Cells(rowEnd - rowStart, columnEnd - columnStart)
  }

  /**
   * @param  {Cells} cells
   * @param  {Position} position
   */
  toRect(cells, position) {
    const { horizontal, vertical } = cells
    const size = new Size(
      horizontal * this.grid.cellSize.width + (horizontal - 1) * this.grid.gap,
      vertical * this.grid.cellSize.height + (vertical - 1) * this.grid.gap,
    )

    return new Rect(
      position.x,
      position.y,
      position.x + size.width,
      position.y + size.height,
    )
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
      Math.max(absPosition.y - boundaryRect.top, 0),
    )
    const boundaryCells = this[
      isBoundaryRectPadded ? 'fromPaddedRect' : 'fromRect'
    ](boundaryRect)
    const rowStartBoundary = boundaryCells.vertical - cells.vertical
    const columnStartBoundary = boundaryCells.horizontal - cells.horizontal
    const rawRowStart =
      (relativeToBoundaryPosition.y - this.grid.padding) /
      (this.grid.cellSize.height + this.grid.gap)
    const rawColumnStart =
      (relativeToBoundaryPosition.x - this.grid.padding) /
      (this.grid.cellSize.width + this.grid.gap)
    const rowStart = Math.round(_.clamp(rawRowStart, 0, rowStartBoundary))
    const columnStart = Math.round(
      _.clamp(rawColumnStart, 0, columnStartBoundary),
    )
    const boundaryPadding = isBoundaryRectPadded ? this.grid.padding : 0
    const relativePosition = new Position(
      boundaryRect.left +
        columnStart * this.grid.cellSize.width +
        columnStart * this.grid.gap +
        boundaryPadding,
      boundaryRect.top +
        rowStart * this.grid.cellSize.height +
        rowStart * this.grid.gap +
        boundaryPadding,
    )

    return new GridPosition(
      Math.round(rowStart),
      Math.round(columnStart),
      Math.round(rowStart + cells.vertical),
      Math.round(columnStart + cells.horizontal),
      relativePosition,
    )
  }

  /**
   * @param  {Cells} cells
   */
  toSize(cells) {
    const { horizontal, vertical } = cells

    return new Size(
      horizontal * this.grid.cellSize.width + (horizontal - 1) * this.grid.gap,
      vertical * this.grid.cellSize.height + (vertical - 1) * this.grid.gap,
    )
  }
}
