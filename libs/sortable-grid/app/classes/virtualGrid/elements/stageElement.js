import { SortableGridElement } from './element.js';
import { SortableGridStageBackdrop } from './backdrop.js';

export class SortableGridStageElement extends SortableGridElement {
  /**
   * @typedef {{horizontal: number; vertical: number}} Cells
   * @typedef {{cellSize: Size padding: number; gap: number;}} gridCfg
   */

  /** @type string */
  #id;
  /** @type SortableGridStageBackdrop */
  #backdrop;

  ClassNames = {
    GRID_SORTABLE_STAGE: 'grid-sortable-stage',
  };

  get id() {
    return this.#id;
  }

  get backdrop() {
    return this.#backdrop;
  }

  /**
   * @param  {string} id
   * @param  {HTMLElement} element
   * @param  {Cells} cells
   * @param  {gridCfg} gridConfig
   * @param {boolean} isPaddingLess
   */
  constructor(id, element, cells, gridConfig, isPaddingLess) {
    super(element);
    this.#id = id;
    this.#backdrop = new SortableGridStageBackdrop(
      id,
      cells,
      Object.assign({}, gridConfig, isPaddingLess ? { padding: 0 } : {}),
      element
    );

    element.classList.add(this.ClassNames.GRID_SORTABLE_STAGE);
  }

  /**
   * @param  {Cells} cells
   */
  refreshCells(cells) {
    this.#backdrop.refresh(cells);
  }

  hideBackdrop() {
    this.#backdrop.hide();
  }

  showBackdrop(havingAnimation) {
    this.#backdrop.show();
    if (havingAnimation) this.#backdrop.animate();
  }

  /**
   * @param  {HtmlGrid} htmlGrid
   */
  drawHighlight(htmlGrid) {
    this.backdrop.drawHighlight(htmlGrid);
    return () => this.backdrop.eraseHighlight();
  }

  /**
   * @param  {HtmlGrid} htmlGrid
   */
  drawDraggingPreview(htmlGrid) {
    this.backdrop.drawPreview(htmlGrid);
    return () => this.backdrop.erasePreview();
  }
}
