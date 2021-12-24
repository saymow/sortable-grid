import { CollidablePartSource } from './collidableParts/index.js';
import { CollidableRect, Rect } from './rect.js';
import { CellsFactory } from '../cells/factory.js';

export class RectFactory {
  /** @typedef {"RECT" | "COLLIDABLE_RECT"} Shapes */

  static ShapesEnum = {
    RECT: 'RECT',
    COLLIDABLE_RECT: 'COLLIDABLE_RECT',
  };

  /**
   * @param  {CollidablePartSource} collidablePartSource
   * @param  {CellsFactory} cellsFactory
   */
  constructor(collidablePartSource, cellsFactory) {
    this.collidablePartSource = collidablePartSource.withFromElementRectCreator(this.fromElement.bind(this));
    this.cellsFactory = cellsFactory;
  }

  /**
   * @param  {number} left
   * @param  {number} top
   * @param  {number} right
   * @param  {number} bottom
   * @param {Shapes} shape
   * @param {HTMLElement} element?
   * @returns {Rect|CollidableRect}
   */
  getInstance(left, top, right, bottom, shape = RectFactory.ShapesEnum.RECT, ...args) {
    if (shape === RectFactory.ShapesEnum.RECT) {
      return new Rect(left, top, right, bottom);
    } else if (shape === RectFactory.ShapesEnum.COLLIDABLE_RECT) {
      const collidableRect = new CollidableRect(left, top, right, bottom, ...args);

      return collidableRect.withCollidableParts(this.collidablePartSource.getParts(collidableRect));
    }

    return null;
  }

  /**
   * @param  {Position} position
   * @param  {HTMLElement} element
   * @param  {Shapes} shape
   */
  fromStaticElement(position, element, shape = RectFactory.ShapesEnum.RECT) {
    const { width, height } = element.getBoundingClientRect();
    const left = position.x;
    const top = position.y;
    const right = position.x + width;
    const bottom = position.y + height;

    return this.getInstance(left, top, right, bottom, shape, element);
  }

  /**
   * @param {HTMLElement} element
   * @param {Shapes} shape
   */
  fromElement(element, shape = RectFactory.ShapesEnum.RECT) {
    const { left, top, right, bottom } = element.getBoundingClientRect();

    return this.getInstance(left, top, right, bottom, shape, element);
  }

  /**
   * @param  {Position} position
   * @param  {string} key
   */
  fromStore(position, key) {
    return this.cellsFactory.toRect(this.cellsFactory.fromStore(key), position);
  }
}
