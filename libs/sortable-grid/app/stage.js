import { SortableGridStageElement, Cells } from './classes/virtualGrid/index.js';

export class Stage {
  /**
   * @param {string} id
   * @param {SortableGridStageElement} sgStageElement
   */
  constructor(id, sgStageElement) {
    this.id = id;
    this.sgStageElement = sgStageElement;
  }

  hideBackdrop() {
    this.sgStageElement.backdrop.hide();
  }

  showBackdrop(havingAnimation) {
    this.sgStageElement.backdrop.show();
    if (havingAnimation) this.sgStageElement.backdrop.animate();
  }

  /**
   * @param  {Cells} cells
   */
  refreshStageCells(cells) {
    this.sgStageElement.refreshCells(cells);
  }
}
