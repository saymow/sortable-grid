export class CollisionError extends Error {
  /**
   * @param  {SortableGridElement} sgOrigin
   * @param  {Array<SortableGridElement>} sgTargets
   */
  constructor(sgOrigin, sgTargets) {
    super('CollisionError');
    this.sgOrigin = sgOrigin;
    this.sgTargets = sgTargets;
  }
}
