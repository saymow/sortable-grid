import { CollisionError } from '../../errors/collision.js';
import { CellsFactory } from './cells/index.js';
import { SortableGridElement } from './elements/index.js';
import {
  RectFactory,
  RectStaticBoundaries,
  RectDynamicBoundaries,
  Rect,
  CollidableRect,
  GridRectSource,
} from './rect/index.js';

export class VirtualGrid {
  /**
   * @param  {StagesController} stagesController
   * @param  {RectFactory} rectFactory
   * @param  {CellsFactory} cellsFactory
   * @param  {GridRectSource} rectSource
   * @param  {Stage} mainStage
   */
  constructor(stagesController, rectFactory, cellsFactory, rectSource, mainStage) {
    this.stagesController = stagesController;
    this.rectFactory = rectFactory;
    this.cellsFactory = cellsFactory;
    this.rectSource = rectSource;
    this.mainStage = mainStage;
  }

  /**
   *  @param {Rect} rect
   *  @param {SortableGridElement} origin
   *  @returns {{gridPosition: HtmlGrid; stage: Stage}}
   */
  dropOrdinaryRect(rect, origin) {
    const stage = this.getStageFromRect(rect);
    const stageRect = this.rectFactory.fromElement(stage.sgStageElement.element);
    const isStageRectPadded = stage.id === this.mainStage.id;
    const gridPosition = this.cellsFactory.toGridPosition(
      this.cellsFactory.fromRect(rect),
      rect.upperLeftCornerPosition,
      stageRect,
      isStageRectPadded
    );

    this.onDrop(stage, gridPosition, this.#rectFromGridPosition(gridPosition), origin);

    return {
      stage,
      gridPosition: gridPosition.htmlGrid,
    };
  }

  /**
   *  @param {CollidableRect} collidableRect
   *  @returns {{gridPosition: HtmlGrid; stage: Stage}}
   */
  dropCollidableRect(collidableRect) {
    const stage = this.getStageFromRect(collidableRect);
    const stageRect = this.rectFactory.fromElement(stage.sgStageElement.element);
    const isRectStagePadded = stage.id === this.mainStage.id;
    const gridPosition = this.cellsFactory.toGridPosition(
      this.cellsFactory.fromRect(collidableRect),
      collidableRect.upperLeftCornerPosition,
      stageRect,
      isRectStagePadded
    );

    this.onDrop(
      stage,
      gridPosition,
      this.#rectFromGridPosition(
        gridPosition,
        RectFactory.ShapesEnum.COLLIDABLE_RECT,
        collidableRect.sgElement.element
      ),
      collidableRect.sgElement
    );

    return {
      stage,
      gridPosition: gridPosition.htmlGrid,
    };
  }

  /**
   * @param  {CollidableRect|Rect} rect
   */
  getStageFromRect(rect) {
    return this.stagesController.findBottomUp(
      (stage) =>
        ((rect instanceof CollidableRect ? !rect.sgElement.contains(stage.sgStageElement.element) : true) &&
          this.rectFactory.fromElement(stage.sgStageElement.element).contains(rect.massCenter)) ||
        stage.id === this.mainStage.id
    );
  }

  /**
   * @param  {SortableGridElement} sgElement
   */
  getStageFromStageEl(sgElement) {
    return this.stagesController.findBottomUp(
      (stage) => stage.sgStageElement.element === sgElement.element || stage.id === this.mainStage.id
    );
  }

  /**
   * @param  {Stage} stage
   * @param  {GridPosition} gridPosition
   * @param  {CollidableRect|Rect} gridPositionRect
   * @param  {SortableGridElement} origin
   */
  onDrop(stage, gridPosition, gridPositionRect, origin) {
    this.handleBackdrops(gridPositionRect.massCenter, origin);
    this.clearCollision();
    this.handleCollision(gridPositionRect, origin);
    this.clearDraggingPreview();
    this.handleDraggingPreview(stage, gridPosition.htmlGrid);
  }

  /**
   * @param  {CollidableRect} collidableRect
   * @param  {Stage} stage
   * @param  {RectStaticBoundaries} staticBoundaries
   */
  resizeCollidableRect(collidableRect, stage, staticBoundaries) {
    const stageRect = this.rectFactory.fromElement(stage.sgStageElement.element);
    const isRectStagePadded = this.mainStage.id === stage.id;
    const gridPosition = this.cellsFactory.toGridPosition(
      this.cellsFactory.fromRect(collidableRect),
      collidableRect.upperLeftCornerPosition,
      stageRect,
      isRectStagePadded
    );
    const boundaries = new RectDynamicBoundaries(staticBoundaries).refresh(
      this.rectSource.getAllCollidableRects(stage.sgStageElement)
    );

    this.onResizeRect(
      stage,
      this.#rectFromGridPosition(
        gridPosition,
        RectFactory.ShapesEnum.COLLIDABLE_RECT,
        collidableRect.sgElement.element
      ),
      collidableRect.sgElement
    );

    return { gridPosition: gridPosition.htmlGrid, stage, boundaries };
  }

  /**
   * @param  {Stage} stage
   * @param  {Rect} gridPositionRect
   * @param  {SortableGridElement} origin
   */
  onResizeRect(stage, gridPositionRect, origin) {
    stage.showBackdrop(true);
    this.clearCollision();
    this.handleCollision(gridPositionRect, origin, stage);
  }

  /**
   * @param  {Stage} stage
   * @param  {CollidableRect} collidableRect
   */
  getStaticBoundaries(stage, collidableRect) {
    return new RectStaticBoundaries(
      this.rectFactory.fromElement(stage.sgStageElement.element),
      collidableRect,
      this.cellsFactory,
      this.rectFactory,
      this.rectSource,
      this.stagesController
    );
  }

  /**
   * @param  {Position} position
   * @param  {SortableGridElement} origin
   */
  handleBackdrops(position, origin) {
    this.stagesController.forEach((__stage) => {
      const shouldShowBackdrop =
        this.rectFactory.fromElement(__stage.sgStageElement.element).contains(position) &&
        !origin.contains(__stage.sgStageElement.element);

      __stage.sgStageElement[shouldShowBackdrop ? 'showBackdrop' : 'hideBackdrop'](true);
    });
  }

  hideBackdrops() {
    this.stagesController.forEach((__stage) => __stage.sgStageElement.hideBackdrop());
  }

  /**
   * @param  {Rect} rect
   * @param {SortableGridElement} origin
   * @param {Stage} stage?
   */
  handleCollision(rect, origin, stage) {
    const collidedParts = this.rectSource
      .getAllCollidableRects(stage?.sgStageElement)
      .flatMap((collidableRect) => collidableRect.handleCollision(rect));

    if (collidedParts.length !== 0) {
      throw new CollisionError(
        origin,
        collidedParts.map(({ sgElement }) => sgElement)
      );
    }
  }

  clearCollision() {
    this.rectSource.getAllCollidedRects().forEach((collidableRect) => {
      collidableRect.sgElement.isColliding = false;
    });
  }

  /**
   * @param  {Stage} stage
   * @param  {HtmlGrid} htmlGrid
   */
  handleDraggingPreview(stage, htmlGrid) {
    this.clearDraggingPreviewSignal = stage.sgStageElement.drawDraggingPreview(htmlGrid);
  }

  clearDraggingPreview() {
    this.clearDraggingPreviewSignal?.();
  }

  /**
   * @param  {GridPosition} gridPosition
   * @param {HTMLElement} element?
   */
  #rectFromGridPosition(gridPosition, shape = RectFactory.ShapesEnum.RECT, ...args) {
    let rect = this.cellsFactory.toRect(
      this.cellsFactory.fromGridPosition(gridPosition),
      gridPosition.upperLeftPosition
    );

    if (shape === RectFactory.ShapesEnum.COLLIDABLE_RECT) {
      const { left, top, right, bottom } = rect;

      rect = this.rectFactory.getInstance(left, top, right, bottom, RectFactory.ShapesEnum.COLLIDABLE_RECT, ...args);
    }

    return rect;
  }
}
