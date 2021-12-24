import { SortableGridElement } from '../../elements/element.js';

export class CollidablePart {
  /**
   * @param  {SortableGridElement} sgElement
   * @param  {[[number, number], [number, number]]} rectVertices
   */
  constructor(sgElement, rectVertices) {
    this.sgElement = sgElement;
    this.rectVertices = rectVertices;
  }

  __isBetweenInclusive(ref, edgeA, edgeB) {
    return ref >= edgeA && ref <= edgeB;
  }

  __isBetweenExclusive(ref, edgeA, edgeB) {
    return ref > edgeA && ref < edgeB;
  }

  __isContainedBy(origin, incoming) {
    const [a, b] = origin;
    const [c, d] = incoming;

    return a >= c && b <= d;
  }

  __hasTangentialCollision(incomingRectVertices) {
    const [[aX, aY], [bX, bY]] = this.rectVertices;
    const [[cX, cY], [dX, dY]] = incomingRectVertices;

    return (
      (this.__isContainedBy([aX, bX], [cX, dX]) ||
        this.__isBetweenInclusive(cX, aX, bX) ||
        this.__isBetweenInclusive(dX, aX, bX)) &&
      (this.__isContainedBy([aY, bY], [cY, dY]) ||
        this.__isBetweenInclusive(cY, aY, bY) ||
        this.__isBetweenInclusive(dY, aY, bY))
    );
  }

  __getMassCenterPerVertices = ([[aX, aY], [bX, bY]]) => ({
    x: (aX + bX) / 2,
    y: (aY + bY) / 2,
  });

  __hasGivenPosCollided = (pos, [[aX, aY], [bX, bY]]) =>
    this.__isBetweenInclusive(pos.x, aX, bX) && this.__isBetweenInclusive(pos.y, aY, bY);

  isContained(incomingRectVertices) {
    const [[aX, aY], [bX, bY]] = this.rectVertices;
    const [[cX, cY], [dX, dY]] = incomingRectVertices;

    return this.__isBetweenInclusive(bX, cX, dX) && this.__isBetweenInclusive(bY, cY, dY);
  }
}
