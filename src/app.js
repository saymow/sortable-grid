import {
  setupDraggableLabels,
  setupSortableGrid,
  setupStage,
  setupUiListeners,
  setupGridServiceLogger
} from './setups/index.js'

export class App {
  static init() {
    setupStage()
    setupDraggableLabels()
    setupUiListeners()
    setupSortableGrid()
    setupGridServiceLogger()
  }
}
