import { CollidablePart } from './collidable-part.js';

export class MassCenterCollidablePart extends CollidablePart {
  __contains(incoming) {
    const [[aX, aY], [bX, bY]] = this.rectVertices;
    const [[cX, cY], [dX, dY]] = incoming;

    return (
      this.__isContainedBy([Math.round(cX), Math.round(dX)], [Math.round(aX), Math.round(bX)]) &&
      this.__isContainedBy([Math.round(cY), Math.round(dY)], [Math.round(aY), Math.round(bY)])
    );
  }

  hasCollision(incomingRectVertices) {
    const massCenter = this.__getMassCenterPerVertices(incomingRectVertices);

    return (
      this.__hasTangentialCollision(incomingRectVertices) &&
      (!this.__contains(incomingRectVertices) || !this.__hasGivenPosCollided(massCenter, this.rectVertices))
    );
  }
}
