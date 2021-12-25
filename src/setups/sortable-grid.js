import {
  SortableGrid,
  PaginatorToolKit,
  GridConfig,
} from '../../libs/sortable-grid/app/index.js'
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

  sgGrid.getElementCreateObservable().subscribe(onCreateElement)

  sgGrid.getElementChangeObservable().subscribe(onChangeElement)

  trackActiveComponent()
}

const onCreateElement = (data) => {
  const { elementType, elementGridPosition } = data.payload
  const componentEl = makeComponent(elementType)
  const componentId = Math.random().toString('16')

  componentEl.setAttribute('id', componentId)
  componentEl.style.setProperty('grid-area', toCssGrid(elementGridPosition))

  rxjs
    .fromEvent(componentEl, 'dblclick')
    .subscribe(() => activeComponentIdSubject.next(componentId))

  stagePageEl.append(componentEl)
}

const onChangeElement = (data) => {
  const { elementId, elementNewGridPosition } = data.payload.elementData
  const componentEl = document.getElementById(elementId)

  componentEl.style.setProperty('grid-area', toCssGrid(elementNewGridPosition))
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
