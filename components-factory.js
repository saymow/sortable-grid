import { GRID_COMPONENTS_CFG, GRID_PRESET } from './grid-config.js'

export const makeComponent = (typeName) => {
  const containerEl = document.createElement('div')
  const titleEl = document.createElement('h1')

  containerEl.classList.add('component', typeName)
  titleEl.textContent = `${typeName}`

  containerEl.append(titleEl)

  return containerEl
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

export const makeComponentWithInitialSize = (typeName) => {
  const componentEl = makeComponent(typeName)
  const cells = GRID_COMPONENTS_CFG[typeName]
  const size = cellsToSize(cells)

  componentEl.style.setProperty('width', `${size.width}px`)
  componentEl.style.setProperty('height', `${size.height}px`)

  return componentEl
}
