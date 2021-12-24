import { MassCenterCollidablePart } from './mass-center-collidable-part.js';
import { TangentialCollidablePart } from './tangential-collidable-part.js';
import { SortableGridElement } from '../../elements/element.js';

export class CollidablePartSource {
  ClassName = {
    SORTABLE_STAGE: 'grid-sortable-stage',
  };
  StageUnsafePartsQuery = ':scope > *:not(.sortable-container-wrapper, .ui-resizable-handle)';

  /**
   * @param  {string[]} stageElements
   */
  constructor(stageElements) {
    this.stageElements = stageElements;
  }

  /**
   * @param  {(arg0:HTMLElement) => Rect} getRectFromElement
   */
  withFromElementRectCreator(getRectFromElement) {
    this.getRectFromElement = getRectFromElement;
    return this;
  }

  /**
   * @param  {CollidableRect} collidableRect
   */
  getParts(collidableRect) {
    if (this.isStageElement(collidableRect.sgElement)) {
      return this.#getPartsFromStageElement(collidableRect);
    } else {
      return this.#getPartsFromOrdinaryElement(collidableRect);
    }
  }

  /**
   * @param  {CollidableRect} collidableRect
   */
  #getPartsFromOrdinaryElement(collidableRect) {
    const { sgElement, left, top, right, bottom } = collidableRect;

    return [
      new TangentialCollidablePart(sgElement, [
        [left, top],
        [right, bottom],
      ]),
    ];
  }

  /**
   * @param  {CollidableRect} collidableRect
   */
  #getPartsFromStageElement(collidableRect) {
    const { element } = collidableRect.sgElement;
    const stageEl = element.querySelector(this.toCssClass(this.ClassName.SORTABLE_STAGE));
    const parts = Array.from(element.querySelectorAll(this.StageUnsafePartsQuery)).map((unsafeElement) => {
      const { left, top, right, bottom } = this.getRectFromElement?.(unsafeElement);
      return new TangentialCollidablePart(new SortableGridElement(unsafeElement), [
        [left, top],
        [right, bottom],
      ]);
    });
    const stageRect = this.getRectFromElement?.(stageEl);
    parts.push(
      new MassCenterCollidablePart(new SortableGridElement(stageEl), [
        [stageRect.left, stageRect.top],
        [stageRect.right, stageRect.bottom],
      ])
    );

    return parts;
  }

  /**
   * @param  {SortableGridElement} sgElement
   */
  isStageElement(sgElement) {
    return this.stageElements.includes(sgElement.element.tagName.toLowerCase());
  }

  toCssClass = (className) => `.${className}`;
}
