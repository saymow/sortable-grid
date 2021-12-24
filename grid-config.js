export const GRID_PRESET = {
  gap: 1,
  padding: 3,
  size: {
    width: 640,
    height: 520,
  },
  cellsQty: {
    vertical: 52,
    horizontal: 64,
  },
  getCellSize() {
    return {
      width:
        (this.size.width -
          ((this.cellsQty.horizontal - 1) * this.gap + 2 * this.padding)) /
        this.cellsQty.horizontal,
      height:
        (this.size.height -
          ((this.cellsQty.vertical - 1) * this.gap + 2 * this.padding)) /
        this.cellsQty.vertical,
    }
  },
}

export const SORTABLE_GRID_CFG = {
  gap: GRID_PRESET.gap,
  padding: GRID_PRESET.padding,
  UNIT_SIZE: GRID_PRESET.getCellSize(),
}

export const GRID_COMPONENTS_CFG = {
  'a': {
    vertical: 6,
    horizontal: 8,
  },
  'b': {
    vertical: 15,
    horizontal: 7,
  },
  'c': {
    vertical: 9,
    horizontal: 5,
  },
  'd': {
    vertical: 17,
    horizontal: 12,
  },
}
