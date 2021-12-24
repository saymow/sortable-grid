import { Size, Position } from './dtos/index.js';
import { RectFactory } from './rect/factory.js';

export class NBCTask {
  /**
   * @param {() => Promise<void>} task
   */
  constructor(task) {
    this.task = task;
  }

  execute() {
    return this.task();
  }
}

export class NBCTaskError extends Error {
  /**
   * @param  {string} pageId
   * @param  {SortableGridElement[]} sgElements
   */
  constructor(pageId, sgElements) {
    super('SgElementsOutOfBoundariesError');
    this.pageId = pageId;
    this.sgElements = sgElements;
  }
}

export class VirtualGridResizeHelper {
  BREAKING_CHANGES_HIGHLIGHT_DURATION = 5000;

  /**
   * @param  {VirtualGrid} virtualGrid
   * @param  {PaginatorToolKit} paginatorToolKit
   */
  constructor(virtualGrid, paginatorToolKit) {
    this.virtualGrid = virtualGrid;
    this.paginatorToolKit = paginatorToolKit;
  }

  /**
   * @param  {Size} size
   */
  execute(size) {
    const NBCpromise = this.#ensureNoBreakingChanges(size);
    const cells = this.virtualGrid.cellsFactory.getInstance(size);

    NBCpromise.then(() => {
      this.eraseBreakingChangesRegistry?.anticipate();
      this.virtualGrid.mainStage.refreshStageCells(cells);
    }).catch((error) => {
      if (error instanceof NBCTaskError) {
        this.paginatorToolKit.paginateUntilReaches(error.pageId);
        this.#showBreakingChanges(cells, error.sgElements);
      } else {
        console.error(error);
      }
    });

    return NBCpromise;
  }

  /**
   * @param  {Size} size
   */
  checkExecutionViability(size) {
    const NBCpromise = this.#ensureNoBreakingChanges(size);
    const cells = this.virtualGrid.cellsFactory.getInstance(size);

    NBCpromise.then(() => {
      this.eraseBreakingChangesRegistry?.anticipate();
    }).catch((error) => {
      if (error instanceof NBCTaskError) {
        this.paginatorToolKit.paginateUntilReaches(error.pageId);
        this.#showBreakingChanges(cells, error.sgElements);
      } else {
        console.error(error);
      }
    });

    return NBCpromise;
  }

  /**
   * @param  {Size} size
   */
  async #ensureNoBreakingChanges(size) {
    const { pageElements, active } = await this.paginatorToolKit
      .getPaginatorObservable(true)
      .pipe(rxjs.operators.take(1))
      .toPromise();

    await this.#handleBreakingChanges(size, pageElements, active);
  }

  async #handleBreakingChanges(size, pageElements, activePage) {
    const NBCTasks = this.#getTasksOrder(pageElements, activePage).map((pageEl) =>
      this.#buildTask(pageElements.indexOf(pageEl), pageEl, size)
    );

    for (const NBCtask of NBCTasks) {
      await NBCtask.execute();
    }
  }

  #getTasksOrder(pages, activePageIndex) {
    return [pages[activePageIndex]].concat(pages.filter((_, i) => i !== activePageIndex));
  }

  /**
   * @param  {string} id
   * @param  {HTMLElement} pageEl
   * @param  {Size} newSize
   */
  #buildTask(id, pageEl, newSize) {
    const { left, top } = pageEl.getBoundingClientRect();
    const right = left + newSize.width;
    const bottom = top + newSize.height;
    const pageCollidableRect = this.virtualGrid.rectFactory.getInstance(
      left,
      top,
      right,
      bottom,
      RectFactory.ShapesEnum.COLLIDABLE_RECT,
      pageEl
    );

    return new NBCTask(this.#handleTask.bind(this, id, pageCollidableRect));
  }

  /**
   * @param  {number} pageId
   * @param  {CollidableRect} pageCollidableRect
   */
  #handleTask(pageId, pageCollidableRect) {
    const affectedParts = this.#ensurePageRectWillContainSgElements(pageCollidableRect);

    if (affectedParts.length !== 0) {
      throw new NBCTaskError(
        pageId,
        affectedParts.map(({ sgElement }) => sgElement)
      );
    }
  }

  /**
   * @param  {CollidableRect} pageCollidableRect
   */
  #ensurePageRectWillContainSgElements(pageCollidableRect) {
    const { left, top, right, bottom } = pageCollidableRect;

    return this.virtualGrid.rectSource
      .getAllCollidableRects(pageCollidableRect.sgElement)
      .flatMap((collidableRect) => this.virtualGrid.rectFactory.collidablePartSource.getParts(collidableRect))
      .filter(
        (cPart) =>
          !cPart.isContained([
            [left, top],
            [right, bottom],
          ])
      );
  }

  /**
   * @param  {Cells} cells
   * @param  {SortableGridElement[]} affectedSgElements
   */
  #showBreakingChanges(cells, affectedSgElements) {
    const position = new Position(0, 0);
    const mainStageRect = this.virtualGrid.rectFactory.fromElement(this.virtualGrid.mainStage.sgStageElement.element);
    const { htmlGrid } = this.virtualGrid.cellsFactory.toGridPosition(cells, position, mainStageRect, true);

    this.eraseBreakingChangesRegistry?.anticipate();

    const eraseHighlightSignal = this.virtualGrid.mainStage.sgStageElement.drawHighlight(htmlGrid);
    this.virtualGrid.mainStage.showBackdrop(true);
    affectedSgElements.forEach((sgElement) => (sgElement.isOnBreakingChanges = true));

    this.eraseBreakingChangesRegistry = new TimeoutRegistry(() => {
      this.#eraseBreakingChanges(eraseHighlightSignal, affectedSgElements);
      this.eraseBreakingChangesRegistry = null;
    }, this.BREAKING_CHANGES_HIGHLIGHT_DURATION);
  }

  #eraseBreakingChanges(eraseHighlightSignal, affectedSgElements) {
    eraseHighlightSignal();
    this.virtualGrid.mainStage.hideBackdrop();
    affectedSgElements.forEach((sgElement) => (sgElement.isOnBreakingChanges = false));
  }
}

export class TimeoutRegistry {
  /**
   * @param  {()=>{}} handler
   * @param  {number} delay
   */
  constructor(handler, delay) {
    this.handler = handler;
    this.timeoutId = setTimeout(handler, delay);
  }

  abort() {
    clearTimeout(this.timeoutId);
  }

  anticipate() {
    this.abort();
    this.handler();
  }
}
