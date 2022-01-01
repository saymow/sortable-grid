import {
  SortableGrid,
  PaginatorToolKit,
  GridConfig,
} from '../../libs/sortable-grid/app/index.js'
import { gridService } from '../services/grid.service.js'
import {
  GRID_COMPONENTS_CFG,
  SORTABLE_GRID_CFG,
} from '../config/grid-config.js'
import { makeComponent } from '../factories/components-factory.js'

const stageContainerEl = document.querySelector('[data-id="stage-container"]')
const stageWrapperEl = document.querySelector('[data-id="stage-wrapper"]')
const stageEl = document.querySelector('[data-id="stage"]')
const stagePageEl = document.querySelector('[data-id="stage-page"]')

let activeComponentIdSubject
let sgGrid

const makePaginatorToolKit = () => {
  return new PaginatorToolKit(
    rxjs.of({ active: 0, total: 1 }).pipe(rxjs.operators.shareReplay(1)),
    document.createElement('button'),
    document.createElement('button'),
    () => document.createElement('div'),
    500,
  ).withGlobalTriggers()
}

const makeSortableGridConfig = () => {
  const { UNIT_SIZE, gap, padding } = SORTABLE_GRID_CFG

  return new GridConfig(UNIT_SIZE.width, UNIT_SIZE.height, padding, gap)
}

const toCssGrid = (grid) =>
  `${grid.rowStart} / ${grid.columnStart} / ${grid.rowEnd} / ${grid.columnEnd}`

const getAllComponentEls = () =>
  Array.from(document.querySelectorAll('.component'))

export const setupSortableGrid = () => {
  sgGrid = new SortableGrid(
    stageEl,
    stageWrapperEl,
    stageContainerEl,
    (element) => element.cloneNode(true),
    makeSortableGridConfig(),
    GRID_COMPONENTS_CFG,
    [],
    makePaginatorToolKit(),
  )

  sgGrid.getElementCreateObservable().subscribe(handleCreateComponent)
  sgGrid.getElementChangeObservable().subscribe(handleChangeComponent)

  gridService.onAddComponent.subscribe(onCreateComponent)
  gridService.onUpdateComponent.subscribe(onChangeComponent)
  gridService.onRemoveComponent.subscribe(onRemoveComponent)

  trackActiveComponent()
}

const handleCreateComponent = (data) => {
  const { elementType, elementGridPosition } = data.payload

  gridService.addComponent(elementType, elementGridPosition)
}

const onCreateComponent = (component) => {
  const { id, typeName, gridPosition } = component
  const componentEl = makeComponent(typeName)

  componentEl.setAttribute('id', id)
  componentEl.style.setProperty('grid-area', toCssGrid(gridPosition))

  rxjs
    .fromEvent(componentEl, 'dblclick')
    .subscribe(() => activeComponentIdSubject.next(id))

  rxjs
    .fromEvent(componentEl.removeIconEl, 'click')
    .subscribe(handleRemoveComponent.bind(handleRemoveComponent, id))

  stagePageEl.append(componentEl)
}

const handleRemoveComponent = (id) => {
  gridService.removeComponent(id)
}

const onRemoveComponent = (id) => {
  const componentEl = document.getElementById(id)

  componentEl.remove()
}

const handleChangeComponent = (data) => {
  const { elementId, elementNewGridPosition } = data.payload.elementData

  gridService.updateComponent(elementId, elementNewGridPosition)
}

const onChangeComponent = (component) => {
  const { id, gridPosition } = component
  const componentEl = document.getElementById(id)

  componentEl.style.setProperty('grid-area', toCssGrid(gridPosition))
}

const trackActiveComponent = () => {
  activeComponentIdSubject = new rxjs.Subject().pipe(
    rxjs.operators.distinctUntilChanged(),
  )

  activeComponentIdSubject.subscribe(handleActiveComponent)
}

const handleActiveComponent = (componentId) => {
  sgGrid.setActiveElementById(componentId)
  getAllComponentEls().forEach((componentEl) => {
    if (componentEl.getAttribute('id') === componentId)
      componentEl.classList.add('active')
    else componentEl.classList.remove('active')
  })
}
