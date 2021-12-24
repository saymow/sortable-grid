export class UnsubscribedError extends Error {
  /**
   * @param  {any} elementType
   */
  constructor(elementType) {
    super(`Element ${elementType} isn't available in element subscription map.`);
  }
}
