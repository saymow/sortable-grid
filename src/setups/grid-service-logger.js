import {gridService} from '../services/grid.service.js'

const loggerContainer = document.querySelector('[data-id="grid-service-logger-container"]')

export const setupGridServiceLogger = () => {
  gridService.componentsSubject.subscribe(onGridServiceChanges)
}

const onGridServiceChanges = (state) => {
  loggerContainer.innerText = JSON.stringify(state, null, 2)
} 