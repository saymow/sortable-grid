import { SortableGridElement } from '../elements/element.js'
import { RectFactory } from './factory.js'
import { SG } from '../../../constants.js'

export class GridRectSource {
  /**
   * @param  {HTMLElement} containmentEL
   * @param  {RectFactory} rectFactory
   */
  constructor(containmentEL, rectFactory) {
    this.containmentEl = containmentEL
    this.rectFactory = rectFactory
  }

  /**
   * @returns {Array<Rect>}
   */
  getAllRects() {
    return Array.from(this.containmentEl.querySelectorAll(SG.elementsQuery))
      .filter(
        (el) => el.style.display !== 'none' && el.style.visibility !== 'hidden',
      )
      .map((element) =>
        this.rectFactory.fromElement(element, RectFactory.ShapesEnum.RECT),
      )
  }

  /**
   * @param  {SortableGridElement} sgOriginElement?
   * @returns {Array<CollidableRect>}
   */
  getAllCollidableRects(sgOriginElement) {
    return Array.from(
      (sgOriginElement?.element ?? this.containmentEl).querySelectorAll(
        SG.elementsQuery,
      ),
    )
      .filter(
        (el) => el.style.display !== 'none' && el.style.visibility !== 'hidden',
      )
      .map((element) =>
        this.rectFactory.fromElement(
          element,
          RectFactory.ShapesEnum.COLLIDABLE_RECT,
        ),
      )
  }

  /**
   * @param  {Stage} stage?
   * @returns {Array<CollidableRect>}
   */
  getAllCollidedRects(stage) {
    return Array.from(
      (stage?.sgStageElement?.element ?? this.containmentEl).querySelectorAll(
        this.toCssClass(SortableGridElement.ClassNames.IS_COLLIDING),
      ),
    )
      .filter(
        (el) => el.style.display !== 'none' && el.style.visibility !== 'hidden',
      )
      .map((element) =>
        this.rectFactory.fromElement(
          element,
          RectFactory.ShapesEnum.COLLIDABLE_RECT,
        ),
      )
  }

  toCssClass = (className) => `.${className}`
}
