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

export const setupSortableGrid = () => {
  const sgGrid = new SortableGrid(
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
}

const onCreateElement = (data) => {
  const { elementType, elementGridPosition } = data.payload
  const componentEl = makeComponent(elementType)
  
  componentEl.setAttribute('id', Math.random().toString('16'))
  componentEl.style.setProperty('grid-area', toCssGrid(elementGridPosition))

  stagePageEl.append(componentEl)
}

const onChangeElement = (data) => {
  const { elementId, elementNewGridPosition } = data.payload.elementData
  const componentEl = document.getElementById(elementId)

  componentEl.style.setProperty('grid-area', toCssGrid(elementNewGridPosition))
}
