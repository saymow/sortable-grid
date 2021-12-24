import { makeComponentWithInitialSize } from '../factories/components-factory.js'

const stageEl = document.querySelector('[data-id="stage"]')
const componentLabels = document.querySelectorAll('.component-label')

export const setupDraggableLabels = () => {
  componentLabels.forEach((labeEl) => {
    $(labeEl).draggable({
      connectToSortable: stageEl,
      helper: () => {
        const typeName = labeEl.getAttribute('data-type')
        const element = makeComponentWithInitialSize(typeName)
        element.setAttribute('data-type', typeName)

        return element
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
}
