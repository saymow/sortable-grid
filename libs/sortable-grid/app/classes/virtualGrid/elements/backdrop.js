import { HtmlGrid } from '../dtos/index.js'
import { Cells } from '../cells/index.js'

export class SortableGridStageBackdrop {
  ClassNames = {
    SHOW: 'show',
    ANIMATE: 'SG-BACKDROP-ANIMATION',
    FILLED_FILLER: 'filled',
    HIGHLIGHTED_FILLER: 'supposed-area',
  }

  /**
   * @param  {string} id
   * @param  {Cells} cells
   * @param  {GridCfg} gridCfg
   * @param  {HTMLElement} stageEl
   */
  constructor(id, cells, gridCfg, stageEl) {
    this.id = id
    this.cells = cells
    this.gridCfg = gridCfg
    this.stageEl = stageEl
    this.element = SortableGridStageBackdropElBuilder.ensureGridBackdrop(
      id,
      cells,
      gridCfg,
    )
    this.#ensureIsBound()
  }

  refresh(cells) {
    this.cells = cells
    this.element = SortableGridStageBackdropElBuilder.ensureGridBackdrop(
      this.id,
      cells,
      this.gridCfg,
    )
    this.#ensureIsBound()
  }

  show() {
    this.element.classList.add(this.ClassNames.SHOW)
  }

  hide() {
    this.element.classList.remove(this.ClassNames.SHOW)
    this.element.classList.remove(this.ClassNames.ANIMATE)
  }

  animate() {
    this.element.classList.add(this.ClassNames.ANIMATE)
  }

  /**
   * @param  {HtmlGrid} htmlGrid
   */
  drawPreview(htmlGrid) {
    this.#draw(htmlGrid, this.ClassNames.FILLED_FILLER)
  }

  erasePreview() {
    this.#eraseDraw(this.ClassNames.FILLED_FILLER)
  }

  /**
   * @param  {HtmlGrid} htmlGrid
   */
  drawHighlight(htmlGrid) {
    this.#draw(htmlGrid, this.ClassNames.HIGHLIGHTED_FILLER)
  }

  eraseHighlight() {
    this.#eraseDraw(this.ClassNames.HIGHLIGHTED_FILLER)
  }

  #draw(htmlGrid, className) {
    const { rowStart, columnStart, rowEnd, columnEnd } = htmlGrid
    const backdropCellsEls = this.element.children
    const limit = backdropCellsEls.length - 1
    let position

    for (let row = rowStart - 1; row < rowEnd - 1; ++row) {
      for (let column = columnStart - 1; column < columnEnd - 1; ++column) {
        position = Math.min(row * this.cells.horizontal + column, limit)
        backdropCellsEls[position].classList.add(className)
      }
    }
  }

  #eraseDraw(className) {
    this.element.querySelectorAll(`.${className}`).forEach((backdropCellEl) => {
      backdropCellEl.classList.remove(className)
    })
  }

  #ensureIsBound() {
    if (!this.stageEl.parentElement.contains(this.element)) {
      this.stageEl.parentElement.prepend(this.element)
    }
  }
}

export class SortableGridStageBackdropElBuilder {
  static ClassNames = {
    SG_BACKDROP: 'SG-BACKDROP',
    SG_BACKDROP_FILLER: 'SG-BACKDROP-FILLER',
  }

  /**
   * @param  {string} id
   * @param  {Cells} cells
   * @param  {CellsCfg} cellsCfg
   * @return {HTMLElement}
   */
  static ensureGridBackdrop(id, cells, cellsCfg) {
    const backdropElId = this.#getBackdropId(id)

    return this.#configureGridBackdrop(
      document.getElementById(backdropElId) ||
        this.#createGridBackdrop(backdropElId),
      cells,
      cellsCfg,
    )
  }

  static #getBackdropId = (id) => `SG-BACKDROP-${id}`

  static #createGridBackdrop(id) {
    const backdropEl = document.createElement('div')

    backdropEl.setAttribute('id', id)
    backdropEl.style.display = 'grid'
    backdropEl.classList.add(this.ClassNames.SG_BACKDROP)

    return backdropEl
  }

  static #configureGridBackdrop(backdropEl, cells, cellsCfg) {
    const { horizontal, vertical } = cells
    const {
      cellSize: { width, height },
      gap,
      padding,
    } = cellsCfg

    backdropEl.style.gridTemplateColumns = `repeat(${horizontal}, ${width}px)`
    backdropEl.style.gridTemplateRows = `repeat(${vertical}, ${height}px)`
    backdropEl.style.gridGap = `${gap}px`
    backdropEl.style.padding = `${padding}px`
    this.#configureGridBackdropFillers(backdropEl, this.#getFillersQty(cells))

    return backdropEl
  }

  static #getFillersQty = ({ horizontal, vertical }) => horizontal * vertical

  static #configureGridBackdropFillers(backdropEl, fillersQty) {
    const fillersDiff = fillersQty - backdropEl.children.length
    const qty = Math.abs(fillersDiff)

    if (fillersDiff > 0) this.#addBackdropFiller(backdropEl, qty)
    else this.#removeBackdropFiller(backdropEl, qty)
  }

  static #addBackdropFiller(backdropEl, qty) {
    for (let i = 0; i < qty; ++i) {
      backdropEl.appendChild(this.#createGridBackdropFiller())
    }
  }

  static #createGridBackdropFiller() {
    const bdFillerEl = document.createElement('span')
    bdFillerEl.classList.add(this.ClassNames.SG_BACKDROP_FILLER)

    return bdFillerEl
  }

  static #removeBackdropFiller(backdropEl, qty) {
    for (let i = 0; i < qty; ++i) {
      backdropEl.removeChild(backdropEl.lastElementChild)
    }
  }
}
