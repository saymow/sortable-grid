import SortableGrid from './libs/sortable-grid/app/index.js'
import {
  SORTABLE_GRID_CFG,
  GRID_COMPONENTS_CFG,
  GRID_PRESET,
} from './grid-config.js'
import { makeComponent, makeComponentWithInitialSize } from './components-factory.js'

const settingsBarEl = document.querySelector('.settings-bar')
const toggleBarBtnEl = document.querySelector('[data-id="bar-toggle"]')
const stageEl = document.querySelector('[data-id="stage"]')
const stageWrapperEl = document.querySelector('[data-id="stage-wrapper"]')
const componentLabels = document.querySelectorAll('.component-label')

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

toggleBarBtnEl.addEventListener('click', () => {
  settingsBarEl.classList.toggle('shortened')
})

componentLabels.forEach((labeEl) => {
  $(labeEl).draggable({
    connectToSortable: stageEl,
    helper: () =>  {
      const typeName = labeEl.getAttribute('data-type');
      const element = makeComponentWithInitialSize(typeName)
      element.setAttribute('data-type', typeName)

      return element;
    },
    cursor: 'move',
    appendTo: '.container',
    containment: 'body',
    start: function (_, ui) {
      $(labeEl).draggable('instance').offset.click = {
        left: Math.floor(ui.helper.width() / 2),
        top: Math.floor(ui.helper.height() / 2),
      }
    },
  })
})

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

const sgGrid = new SortableGrid(
  stageEl,
  stageWrapperEl,
  (element) => element.cloneNode(),
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

    componentEl.style.setProperty(
      'grid-area',
      `${rowStart} / ${columnStart} / ${rowEnd} / ${columnEnd}`,
    )

    stageEl.append(componentEl)
  })
