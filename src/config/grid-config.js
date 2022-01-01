export const GRID_PRESET = {
  gap: 1,
  padding: 3,
  size: {
    width: 720,
    height: 500,
  },
  cellsQty: {
    vertical: 30,
    horizontal: 30,
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
    vertical: 3,
    horizontal: 4,
  },
  'b': {
    vertical: 3,
    horizontal: 5,
  },
  'c': {
    vertical: 4,
    horizontal: 4,
  },
  'd': {
    vertical: 4,
    horizontal: 5,
  },
}

export const SG_TYPENAME_ATTR = "sg-typename";
export const SG_COMPONENT_ATTR = "sg-component";