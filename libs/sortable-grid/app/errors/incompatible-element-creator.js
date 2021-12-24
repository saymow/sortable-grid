export class IncompatibleElementCreatorError extends Error {
  /**
   * @param  {HTMLElement} origin
   * @param  {string} detailedMessage
   */
  constructor(origin, detailedMessage) {
    super(`Element ${origin.id} isn't compatible to be a grid element creator: ${detailedMessage}`);
  }
}
