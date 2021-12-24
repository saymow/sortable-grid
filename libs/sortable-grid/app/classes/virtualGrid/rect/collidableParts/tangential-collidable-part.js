import { CollidablePart } from './collidable-part.js';

export class TangentialCollidablePart extends CollidablePart {
  hasCollision(incomingRectVertices) {
    return this.__hasTangentialCollision(incomingRectVertices);
  }
}
