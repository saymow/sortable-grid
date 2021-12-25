import SortableGrid from '../../libs/sortable-grid/app/index.js'
import {
  GRID_COMPONENTS_CFG,
  SORTABLE_GRID_CFG,
} from '../config/grid-config.js'
import { makeComponent } from '../factories/components-factory.js'

const stageEl = document.querySelector('[data-id="stage"]')
const stagePageEl = document.querySelector('[data-id="stage-page"]')
const stageContainerEl = document.querySelector('[data-id="stage-container"]')

const createMockedPaginatorCfg = () => {
  return {
    nextPageBtn: document.createElement('button'),
    prevPageBtn: document.createElement('button'),
    paginatorObservable: rxjs
      .of({ active: 0, total: 1 })
      .pipe(rxjs.operators.shareReplay(1)),
    pageFinder: () => document.createElement('div'),
  }
}

export const setupSortableGrid = () => {
  const sgGrid = new SortableGrid(
    stageEl,
    stageContainerEl,
    (element) => element.cloneNode(true),
    SORTABLE_GRID_CFG,
    GRID_COMPONENTS_CFG,
    [],
    createMockedPaginatorCfg(),
  )

  sgGrid
    .getElementCreateObservable()
    .pipe()
    .subscribe((data) => {
      const { elementType, elementGridPosition } = data.payload
      const { rowStart, columnStart, rowEnd, columnEnd } = elementGridPosition

      const componentEl = makeComponent(elementType)
      componentEl.setAttribute('id', Math.random().toString("16"))

      componentEl.style.setProperty(
        'grid-area',
        `${rowStart} / ${columnStart} / ${rowEnd} / ${columnEnd}`,
      )

      stagePageEl.append(componentEl)
    })

  sgGrid
    .getElementChangeObservable()
    .pipe()
    .subscribe((data) => {
      const {elementId, elementNewGridPosition} = data.payload.elementData;
      const { rowStart, columnStart, rowEnd, columnEnd } = elementNewGridPosition

      document.getElementById(elementId).style.setProperty('grid-area', `${rowStart} / ${columnStart} / ${rowEnd} / ${columnEnd}`)
    })
}
