import { Stage } from './stage.js'
import { Sortable } from './classes/sortable.js'
import { StagesController } from './classes/stages-controller.js'
import { PaginatorToolKit } from './classes/paginator-tool-kit.js'
import helpers from './helpers/index.js'
import { CollisionError } from './errors/collision.js'
import {
  SortableGridElement,
  SortableGridStageElement,
  Size,
  CellsFactory,
  RectFactory,
  GridRectSource,
  VirtualGrid,
  Position,
  CollidablePartSource,
  VirtualGridResizeHelper,
} from './classes/virtualGrid/index.js'
import { MAIN_STAGE_ID } from './constants.js'
import { CreateView, ChangeView } from './views/index.js'

export default class SortableGrid {
  sgTypeNameAttr = 'sg-typename'
  sgElementsAttr = 'sg-component'
  sgElementsQuery = `[${this.sgElementsAttr}]`

  /**
   * @param {HTMLElement} stageEl
   * @param {HTMLElement} containmentEl
   * @param {(element: HTMLElement) => HTMLElement} helperCloneCreator
   * @param {{padding: number; gap: number; UNIT_SIZE: Size}} cConfig
   * @param {Object.<string, { vertical: number; horizontal: number; }>} storeObject
   * @param {string[]} gridGroupElements
   * @param {{nextPageBtn: HTMLElement; prevPageBtn: HTMLElement; paginatorObservable: any; pageFinder(pageIndex: number) => HTMLElement}} paginatorToolKitData
   */
  constructor(
    stageEl,
    containmentEl,
    helperCloneCreator,
    cConfig,
    storeObject,
    gridGroupElements,
    paginatorToolKitData,
  ) {
    const {
      paginatorObservable,
      nextPageBtn,
      prevPageBtn,
      pageFinder,
    } = paginatorToolKitData
    const {
      UNIT_SIZE: { width, height },
      gap,
      padding,
    } = cConfig

    this.cellsConfig = cConfig
    this.storeMap = helpers.objectToMap(storeObject)
    this.cellsFactory = new CellsFactory(
      width,
      height,
      gap,
      padding,
      this.storeMap,
    )
    this.sortable = new Sortable(
      stageEl,
      containmentEl,
      helperCloneCreator,
      this.sgElementsQuery,
      this.sgElementsAttr,
    )
    this.mainStage = new Stage(
      MAIN_STAGE_ID,
      new SortableGridStageElement(
        MAIN_STAGE_ID,
        stageEl,
        this.cellsFactory.fromElement(stageEl),
        cConfig,
      ),
    )
    this.stagesController = new StagesController(this.mainStage)
    this.rectFactory = new RectFactory(
      new CollidablePartSource(gridGroupElements),
      this.cellsFactory,
    )
    this.virtualGrid = new VirtualGrid(
      this.stagesController,
      this.rectFactory,
      this.cellsFactory,
      new GridRectSource(containmentEl, this.sgElementsQuery, this.rectFactory),
      this.mainStage,
    )
    this.paginatorToolKit = new PaginatorToolKit(
      paginatorObservable,
      nextPageBtn,
      prevPageBtn,
      pageFinder,
      500,
    ).withGlobalTriggers()
    this.virtualGridResizeHelper = new VirtualGridResizeHelper(
      this.virtualGrid,
      this.paginatorToolKit,
    )

    this.elementCreateSubject = new rxjs.Subject()
    this.elementChangeSubject = new rxjs.Subject()
    this.isBeingDraggedElementSubject = new rxjs.BehaviorSubject(null)

    this.sortable
      .getStartObservable()
      .pipe(rxjs.operators.tap(() => this.paginatorToolKit.enableListeners()))
      .subscribe(this.#handleDragStart.bind(this))
    this.sortable.getSortObservable().subscribe(this.#handleDragSort.bind(this))
    this.sortable
      .getBeforeStopObservable()
      .subscribe(this.#handleBeforeStop.bind(this))
    this.sortable
      .getStopObservable()
      .subscribe(
        this.paginatorToolKit.disableListeners.bind(this.paginatorToolKit),
      )
    this.sortable.getOutObservable().subscribe(this.#handleDragOut.bind(this))
    this.sortable
      .getReceiveObservable()
      .subscribe(this.#handleDragReceive.bind(this))
    this.sortable.getMoveObservable().subscribe(this.#handleDragMove.bind(this))
  }

  spawnChildStage(stageId, stageEl, parentId) {
    const childStage = new Stage(
      stageId,
      new SortableGridStageElement(
        stageId,
        stageEl,
        this.cellsFactory.fromElement(stageEl),
        this.cellsConfig,
        true,
      ),
    )

    this.stagesController.addAtGivenParent(stageId, childStage, parentId)
    this.#ensureStageInheritsDependencies(childStage)
  }

  /**
   * @param {Stage} stage
   */
  #ensureStageInheritsDependencies(stage) {
    if (
      stage.sgStageElement.element ===
      this.latestSetActiveElementData?.stage.sgStageElement.element
    ) {
      this.setActiveElement(stage, this.latestSetActiveElementData.element)
    }
  }

  refreshChildStage(stageId) {
    const stage = this.stagesController.get(stageId)
    stage.refreshStageCells(
      this.cellsFactory.fromElement(stage.sgStageElement.element),
    )
  }

  destroyChildStage(stageId) {
    this.stagesController.remove(stageId)
  }

  ensureCorrectContainment() {
    this.sortable.ensureCorrectContainment()
  }

  #handleDragStart({ element, dataHolder }) {
    this.isBeingDraggedElementSubject.next(element)
    new SortableGridElement(element).isDragging = true

    this.paginatorToolKit
      .getActivePageObservable()
      .pipe(rxjs.operators.take(1))
      .subscribe((activePage) =>
        dataHolder(({ originalElement }) => ({
          originStage: this.virtualGrid.getStageFromStageEl(
            new SortableGridElement(originalElement.parentElement),
          ),
          pagination: { initialPage: activePage },
        })),
      )
  }

  #handleDragSort({ element, position }) {
    try {
      if (this.#isGridElement(element))
        this.#dropAsGridElement(element, position)
      else this.#dropAsForeignElement(element, position)
    } catch (err) {
      this.#globalCatch(err, true)
    }
  }

  #handleDragOut() {
    this.virtualGrid.clearCollision()
    this.virtualGrid.clearDraggingPreview()
    this.virtualGrid.hideBackdrops()
  }

  #handleBeforeStop({ dataHolderInterceptor }) {
    this.isBeingDraggedElementSubject.next(null)
    this.paginatorToolKit
      .getActivePageObservable()
      .pipe(rxjs.operators.take(1))
      .subscribe((activePage) => {
        dataHolderInterceptor((heldData) => {
          heldData.pagination.finalPage = activePage

          return heldData
        })
      })
  }

  #handleDragReceive({ labelElement, position, heldData }) {
    try {
      const { finalPage } = heldData.pagination
      const { stage, gridPosition } = this.#dropAsForeignElement(
        labelElement,
        position,
      )
      const elementType = helpers.getElementTypeFromLabelEl(labelElement)
      const labelAttributesMap = helpers.getAttributesMap(labelElement)
      const inOnMainStage = stage === this.mainStage
      const location = inOnMainStage ? finalPage : stage.id
      const type = inOnMainStage ? 'MAIN' : 'CHILD'

      this.elementCreateSubject.next(
        CreateView.render(
          type,
          location,
          elementType,
          labelAttributesMap,
          gridPosition,
        ),
      )
    } catch (err) {
      this.#globalCatch(err)
    } finally {
      this.virtualGrid.clearDraggingPreview()
      this.virtualGrid.hideBackdrops()
    }
  }

  #handleDragMove({ element, position, heldData }) {
    const {
      pagination: { initialPage, finalPage },
      originStage,
    } = heldData

    try {
      new SortableGridElement(element).isDragging = false
      const { gridPosition, stage } = this.#dropAsGridElement(element, position)
      const elementId = element.getAttribute('id')
      const isSameStage = originStage === stage
      const origin =
        isSameStage && initialPage === finalPage ? 'INTERN' : 'EXTERN'
      const childId = isSameStage
        ? finalPage
        : stage.id === MAIN_STAGE_ID
        ? finalPage
        : stage.id

      this.elementChangeSubject.next(
        ChangeView.render('MOVE', elementId, gridPosition, origin, childId),
      )
      this.#afterDrag(stage, element)
    } catch (err) {
      this.#globalCatch(err)
      this.#afterDrag(originStage, element)
    } finally {
      this.virtualGrid.clearDraggingPreview()
      this.virtualGrid.hideBackdrops()
    }
  }

  #afterDrag(stage, origin) {
    if ($(origin).resizable('instance')) {
      $(origin).resizable('destroy')
      this.setActiveElement(stage, origin)
    }
  }

  /**
   * @param  {HTMLElement} element
   * @param  {Position} position
   */
  #dropAsForeignElement(element, position) {
    const rect = this.rectFactory.fromStore(
      position,
      helpers.getElementTypeFromLabelEl(element),
    )

    return this.virtualGrid.dropOrdinaryRect(
      rect,
      new SortableGridElement(element),
    )
  }

  /**
   * @param  {HTMLElement} element
   * @param  {Position} position
   */
  #dropAsGridElement(element, position) {
    const collidableRect = this.rectFactory.fromStaticElement(
      position,
      element,
      RectFactory.ShapesEnum.COLLIDABLE_RECT,
    )

    return this.virtualGrid.dropCollidableRect(collidableRect)
  }

  setActiveElementById(id) {
    const element = this.virtualGrid.rectSource
      .getAllCollidableRects()
      .find((cRect) => cRect.sgElement.element.id === id)?.sgElement.element

    if (!element) return

    const stage = this.stagesController.findBottomUp((__stage) =>
      __stage.sgStageElement.element.contains(element),
    )

    this.unsetActiveElement()
    this.latestSetActiveElementData = {
      id,
      stage,
      element,
    }

    this.setActiveElement(stage, element)
  }

  unsetActiveElement() {
    const { element } = this.latestSetActiveElementData ?? {}

    if (element && $(element).resizable('instance')) {
      $(element).resizable('destroy')
    }

    this.latestSetActiveElementData = undefined
  }

  setActiveElement(stage, element) {
    this.#configureActiveElement(stage, element)
  }

  #configureActiveElement(stage, element) {
    $(element).resizable({
      start: this.#handleResizeStart.bind(this, stage, element),
      resize: this.#handleResizing.bind(this, stage, element),
      stop: this.#handleResizeStop.bind(this, stage, element),
    })
  }

  #handleResizeStart(stage, element) {
    this.resizeCurrentStaticBounds = this.virtualGrid.getStaticBoundaries(
      stage,
      this.rectFactory.fromElement(
        element,
        RectFactory.ShapesEnum.COLLIDABLE_RECT,
      ),
    )
    $(element).resizable(this.resizeCurrentStaticBounds.boundaries)
  }

  /**
   * @param  {Stage} stage
   * @param  {HTMLElement} element
   */
  #handleResizing(stage, element) {
    try {
      const { boundaries } = this.virtualGrid.resizeCollidableRect(
        this.rectFactory.fromElement(
          element,
          RectFactory.ShapesEnum.COLLIDABLE_RECT,
        ),
        stage,
        this.resizeCurrentStaticBounds,
      )

      $(element).resizable(boundaries)
    } catch (err) {
      this.#globalCatch(err, true)
    }
  }

  /**
   * @param  {Stage} stage
   * @param  {HTMLElement} element
   */
  #handleResizeStop(stage, element) {
    try {
      const elementId = element.id
      const { gridPosition } = this.virtualGrid.resizeCollidableRect(
        this.rectFactory.fromElement(
          element,
          RectFactory.ShapesEnum.COLLIDABLE_RECT,
        ),
        stage,
        this.resizeCurrentStaticBounds,
      )
      const size = this.cellsFactory.toSize(
        this.cellsFactory.fromGridPosition(gridPosition),
      )

      $(element).outerWidth(`${size.width}px`)
      $(element).outerHeight(`${size.height}px`)
      $(element).resizable({
        minWidth: 'unset',
        maxWidth: 'unset',
        minHeight: 'unset',
        maxHeight: 'unset',
      })

      this.elementChangeSubject.next(
        ChangeView.render('RESIZE', elementId, gridPosition),
      )
    } catch (err) {
      this.#globalCatch(err)
    } finally {
      this.virtualGrid.hideBackdrops()
    }
  }

  registerGridElement(id, cells) {
    this.storeMap.set(id, cells)
  }

  /** @param  {Size} size */
  ensureStageWouldConfigureDimensions(size) {
    return this.virtualGridResizeHelper.checkExecutionViability(size)
  }
  /** @param  {Size} size */
  configureStageDimensions(size) {
    return this.virtualGridResizeHelper.execute(size)
  }

  #isGridElement(element) {
    return element.hasAttribute(this.sgElementsAttr)
  }

  /** @param  {boolean} shouldManipulate */
  #globalCatch(error, shouldManipulate) {
    if (error instanceof CollisionError) {
      if (shouldManipulate) {
        const { sgOrigin, sgTargets } = error

        sgTargets.forEach((sgTarget) => {
          sgTarget.isColliding = true
        })
      }
    } else {
      console.error(error)
    }
  }

  destroy() {
    this.unsetActiveElement()
    this.paginatorToolKit.destroy()
    this.sortable.destroy()
    this.stagesController.destroy()
    this.elementCreateSubject.complete()
    this.elementChangeSubject.complete()
    this.isBeingDraggedElementSubject.complete()
  }

  getElementCreateObservable() {
    if (!this.elementCreateObservable) {
      this.elementCreateObservable = this.elementCreateSubject.asObservable()
    }
    return this.elementCreateObservable
  }

  getElementChangeObservable() {
    if (!this.elementChangeObservable) {
      this.elementChangeObservable = this.elementChangeSubject.asObservable()
    }
    return this.elementChangeObservable
  }

  getIsBeingDraggedElementObservable() {
    if (!this.isBeingDraggedElementObservable) {
      this.isBeingDraggedElementObservable = this.isBeingDraggedElementSubject.asObservable()
    }

    return this.isBeingDraggedElementObservable
  }
}
