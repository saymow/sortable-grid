import { Position } from '../dtos/index.js';
import { SortableGridElement } from '../elements/element.js';

export class Rect {
  get upperLeftCornerPosition() {
    return new Position(this.left, this.top);
  }

  /** @returns {Position} */
  get massCenter() {
    return new Position((this.left + this.right) / 2, (this.top + this.bottom) / 2);
  }

  /** @param  {Position} position */
  contains(position) {
    const { x, y } = position;

    return x >= this.left && x <= this.right && y >= this.top && y <= this.bottom;
  }

  /**
   * @param  {number} left
   * @param  {number} top
   * @param  {number} right
   * @param  {number} bottom
   */
  constructor(left, top, right, bottom) {
    this.left = left;
    this.top = top;
    this.right = right;
    this.bottom = bottom;
  }
}

export class CollidableRect extends Rect {
  refresh() {
    const { left, top, right, bottom } = this.sgElement.element.getBoundingClientRect();
    this.left = left;
    this.top = top;
    this.right = right;
    this.bottom = bottom;
  }

  /**
   * @param  {number} left
   * @param  {number} top
   * @param  {number} right
   * @param  {number} bottom
   * @param  {HTMLElement} element
   */
  constructor(left, top, right, bottom, element) {
    super(left, top, right, bottom);
    this.sgElement = new SortableGridElement(element);
  }

  /**
   * @param  {CollidablePart[]} collidableParts
   */
  withCollidableParts(collidableParts) {
    this.collidableParts = collidableParts;
    return this;
  }

  /**
   * @param  {Rect|CollidableRect} origin
   */
  handleCollision(origin) {
    if (origin instanceof CollidableRect) {
      return this.#handleCollidableRectCollision(origin);
    } else if (origin instanceof Rect) {
      return this.#handleOrdinaryRectCollision(origin);
    }

    return null;
  }

  /**
   * @param  {Rect} origin
   */
  #handleOrdinaryRectCollision(origin) {
    return this.#getCollidableParts().filter((collidablePart) =>
      collidablePart.hasCollision([
        [origin.left, origin.top],
        [origin.right, origin.bottom],
      ])
    );
  }

  /**
   * @param  {CollidableRect} origin
   */
  #handleCollidableRectCollision(origin) {
    return this.#getCollidableParts().filter(
      (collidablePart) =>
        !origin.sgElement.element.contains(collidablePart.sgElement.element) &&
        collidablePart.hasCollision([
          [origin.left, origin.top],
          [origin.right, origin.bottom],
        ])
    );
  }

  #getCollidableParts() {
    return this.collidableParts ?? [];
  }
}
