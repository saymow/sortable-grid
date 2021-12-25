import {
  GRID_COMPONENTS_CFG,
  GRID_PRESET,
  SG_COMPONENT_ATTR,
  SG_TYPENAME_ATTR
} from '../config/grid-config.js'

const makePureComponent = (typeName) => {
  const containerEl = document.createElement('div')
  const titleEl = document.createElement('h1')

  containerEl.setAttribute(SG_TYPENAME_ATTR, typeName)
  containerEl.classList.add('component', typeName)
  titleEl.textContent = `${typeName}`

  containerEl.append(titleEl)

  return containerEl
}

export const makeComponent = (typeName, id) => {
  const componentEl = makePureComponent(typeName)

  componentEl.setAttribute(SG_COMPONENT_ATTR, SG_COMPONENT_ATTR)

  return componentEl
}

const cellsToSize = (cells) => {
  const cellsSize = GRID_PRESET.getCellSize()

  return {
    width:
      cells.horizontal * cellsSize.width +
      (cells.horizontal - 1) * GRID_PRESET.gap,
    height:
      cells.vertical * cellsSize.height +
      (cells.vertical - 1) * GRID_PRESET.gap,
  }
}

export const makeMockedComponent = (typeName) => {
  const componentEl = makePureComponent(typeName)
  const cells = GRID_COMPONENTS_CFG[typeName]
  const size = cellsToSize(cells)

  componentEl.style.setProperty('width', `${size.width}px`)
  componentEl.style.setProperty('height', `${size.height}px`)

  return componentEl
}
