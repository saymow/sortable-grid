import {
  setupDraggableLabels,
  setupSortableGrid,
  setupStage,
  setupUiListeners,
} from './setups/index.js'

export class App {
  static init() {
    setupStage()
    setupDraggableLabels()
    setupUiListeners()
    setupSortableGrid()
  }
}
