export class GridPosition {
  /** @type {number} */
  rowStart;
  
  /** @type {number} */
  rowEnd;
  
  /** @type {number} */
  columnStart;
  
  /** @type {number} */
  columnEnd;
}

export class Component {
  /**
   * @param  {string} typeName
   * @param  {GridPosition} gridPosition
   */
  constructor(typeName, gridPosition) {
    this.id =  Math.random().toString('16');
    this.typeName = typeName;
    this.gridPosition = gridPosition;
  }
}