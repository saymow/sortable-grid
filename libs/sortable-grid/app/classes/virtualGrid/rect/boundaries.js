import { CollidableRect } from './rect.js';
import { SortableGridElement } from '../elements/element.js';
import { Boundaries } from './../dtos/index.js';
import { RectFactory } from './factory.js';
import { CellsFactory } from '../cells/factory.js';
import { GridRectSource } from './source.js';

export class RectStaticBoundaries {
  /**@type Boundaries */
  boundaries;

  /**
   * @param  {CollidableRect} stageRect
   * @param  {CollidableRect} originRect
   * @param  {CellsFactory} cellsFactory
   * @param  {RectFactory} rectFactory
   * @param  {GridRectSource} rectSource
   * @param  {StagesController} stagesController
   */
  constructor(stageRect, originRect, cellsFactory, rectFactory, rectSource, stagesController) {
    this.stageRect = stageRect;
    this.originRect = originRect;
    this.cellsFactory = cellsFactory;
    this.rectFactory = rectFactory;
    this.rectSource = rectSource;
    this.stagesController = stagesController;
    this.#build();
  }

  #build() {
    const { width, height } = this.cellsFactory.toSize(this.cellsFactory.fromStore(this.originRect.sgElement.type));
    const maxWidth = this.stageRect.right - this.originRect.left + this.cellsFactory.padding;
    const maxHeight = this.stageRect.bottom - this.originRect.top + this.cellsFactory.padding;
    this.boundaries = new Boundaries(width, maxWidth, height, maxHeight);

    if (this.rectFactory.collidablePartSource.isStageElement(this.originRect.sgElement)) this.#stagePatchBuild();
  }

  #stagePatchBuild() {
    const stageClassName = this.rectSource.toCssClass(this.rectFactory.collidablePartSource.ClassName.SORTABLE_STAGE);
    const stageElement = this.originRect.sgElement.element.querySelector(stageClassName);
    const oRect = this.originRect;
    let minHeight, minWidth;

    this.rectSource.getAllCollidableRects(new SortableGridElement(stageElement)).reduce((boundaries, nextCRect) => {
      minHeight = nextCRect.bottom - oRect.top;
      minWidth = nextCRect.right - oRect.left;

      boundaries.minHeight = Math.max(boundaries.minHeight, minHeight);
      boundaries.minWidth = Math.max(boundaries.minWidth, minWidth);

      return boundaries;
    }, this.boundaries);
  }
}

export class RectDynamicBoundaries {
  /**
   * @param  {RectStaticBoundaries} staticBoundaries
   */
  constructor(staticBoundaries) {
    this.originRect = staticBoundaries.originRect;
    this.staticBoundaries = staticBoundaries;
  }

  /**
   * @param  {CollidableRect[]} cRects
   * @returns {Boundaries}
   */
  refresh(cRects) {
    this.originRect.refresh();

    const dynamicBounds = this.#distanceBetweenClosestRect(
      cRects.filter((cRect) => cRect.sgElement.element !== this.originRect.sgElement.element)
    );

    return Object.assign(
      {
        maxHeight: this.#decrementInherentGap(dynamicBounds.maxHeight),
        maxWidth: this.#decrementInherentGap(dynamicBounds.maxWidth),
      },
      this.staticBoundaries
    );
  }

  /**
   * @param  {CollidableRect[]} cRects
   */
  #distanceBetweenClosestRect(cRects) {
    let { maxHeight, minHeight, maxWidth, minWidth } = this.staticBoundaries.boundaries;
    const oRect = this.originRect;
    let rect, supposedMaxHeight, supposedMaxWidth;

    for (let i = 0; i < cRects.length; i++) {
      rect = cRects[i];
      if (this.#isBetweenInclusive(oRect.left, oRect.right, rect.left, rect.right)) {
        supposedMaxHeight = this.#distance(rect.top, oRect.top);
        if (supposedMaxHeight > minHeight && (!maxHeight || supposedMaxHeight < maxHeight)) {
          maxHeight = supposedMaxHeight;
        }
      } else if (this.#isBetweenInclusive(oRect.top, oRect.bottom, rect.top, rect.bottom)) {
        supposedMaxWidth = this.#distance(rect.left, oRect.left);
        if (supposedMaxWidth > minWidth && (!maxWidth || supposedMaxWidth < maxWidth)) {
          maxWidth = supposedMaxWidth;
        }
      }
    }

    return { maxWidth, maxHeight };
  }

  #decrementInherentGap = (s) => s - this.staticBoundaries.cellsFactory.gap;
  #isBetweenInclusive = (a, b, c, d) => (c < a && d > b) || (c >= a && c <= b) || (d >= a && d <= b);
  #distance = (a, b) => a - b;
}
