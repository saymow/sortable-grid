export class SortableGridElement {
  /**@type {HTMLElement} */
  #element;

  static ClassNames = {
    IS_DRAGGING: 'is-dragging',
    IS_COLLIDING: 'is-colliding',
    BREAKING_CHANGES_HIGHLIGHT: 'is-on-breaking-changes-highlight',
  };

  get element() {
    return this.#element;
  }

  /**
   * @param  {HTMLElement} element
   */
  contains(element) {
    return this.#element.contains(element);
  }

  get type() {
    return this.#element.tagName.toLowerCase();
  }

  set isDragging(bool) {
    this.#element.classList[bool ? 'add' : 'remove'](SortableGridElement.ClassNames.IS_DRAGGING);
  }

  get isColliding() {
    return this.#element.classList.contains(SortableGridElement.ClassNames.IS_COLLIDING);
  }

  set isColliding(bool) {
    this.#element.classList[bool ? 'add' : 'remove'](SortableGridElement.ClassNames.IS_COLLIDING);
  }

  set isOnBreakingChanges(bool) {
    this.#element.classList[bool ? 'add' : 'remove'](SortableGridElement.ClassNames.BREAKING_CHANGES_HIGHLIGHT);
  }

  /**
   * @param  {HTMLElement} element
   */
  constructor(element) {
    this.#element = element;
  }
}
