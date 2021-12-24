import { GRID_PRESET } from '../config/grid-config.js'

const stageEl = document.querySelector('[data-id="stage"]')

export const setupStage = () => {
  stageEl.style.setProperty('width', `${GRID_PRESET.size.width}px`)
  stageEl.style.setProperty('height', `${GRID_PRESET.size.height}px`)
  stageEl.style.setProperty('padding', `${GRID_PRESET.padding}px`)
  stageEl.style.setProperty('grid-gap', `${GRID_PRESET.gap}px`)
  stageEl.style.setProperty(
    'grid-template-rows',
    `repeat(auto-fill, ${GRID_PRESET.getCellSize().width}px)`,
  )
  stageEl.style.setProperty(
    'grid-template-columns',
    `repeat(auto-fill, ${GRID_PRESET.getCellSize().height}px)`,
  )
}
