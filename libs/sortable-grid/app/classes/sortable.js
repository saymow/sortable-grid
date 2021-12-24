export class Sortable {
  constructor(stageEl, containmentEl, helperCloneCreator, registeredElements) {
    this.registeredElements = registeredElements;
    this.stageEl = stageEl;
    this.containmentEl = containmentEl;
    this.initialized = false;

    $(this.stageEl).sortable({
      containment: containmentEl,
      helper: (_, element) => helperCloneCreator(element[0]),
      appendTo: containmentEl,
      cursor: 'move',
      items: registeredElements.join(', '),
      start: this.onStart.bind(this),
      sort: this.onSort.bind(this),
      out: this.onOut.bind(this),
      beforeStop: this.onBeforeStop.bind(this),
      stop: this.onStop.bind(this),
      receive: (_, ui) => ui.helper[0].remove(),
    });

    this.onStartSubject = new rxjs.Subject();
    this.onSortSubject = new rxjs.Subject();
    this.onBeforeStopSubject = new rxjs.Subject();
    this.onMoveSubject = new rxjs.Subject();
    this.onReceiveSubject = new rxjs.Subject();
    this.onOverSubject = new rxjs.Subject();
    this.onOutSubject = new rxjs.Subject();
  }

  ensureCorrectContainment() {
    if (this.initialized) {
      $(this.stageEl).sortable('option', 'containment', this.containmentEl);
      $(this.stageEl).data('uiSortable')._setContainment();
    }
  }

  onStart(_, ui) {
    this.initialized = true;

    const element = ui.helper[0];
    const originalElement = ui.item[0];

    $(this.stageEl).sortable('option', 'cursorAt', {
      left: Math.floor(ui.helper.width() / 2),
      top: Math.floor(ui.helper.height() / 2),
    });

    this.onStartSubject.next({
      element,
      dataHolder: (dataHolder) => {
        this.heldData = dataHolder({ originalElement });
      },
    });
  }

  onSort(_, ui) {
    const { position } = this.getPositionsFromJqueryUi(ui);
    const element = ui.helper[0];

    this.onSortSubject.next({ element, position });
  }

  onBeforeStop() {
    this.onBeforeStopSubject.next({
      heldData: this.heldData,
      dataHolderInterceptor: (dataHolder) => {
        this.heldData = dataHolder(this.heldData);
      },
    });
  }

  onStop(_, ui) {
    const { position } = this.getPositionsFromJqueryUi(ui);
    const element = ui.item[0];

    if (this.isGridElement(element)) {
      $(this.stageEl).sortable('cancel');

      this.onMoveSubject.next({ element, position, heldData: this.heldData });
    } else {
      this.onReceiveSubject.next({ labelElement: element, position, heldData: this.heldData });
    }

    this.heldData = null;
  }

  onOver(_, ui) {
    const { position } = this.getPositionsFromJqueryUi(ui);
    const element = ui.helper[0];

    this.onOverSubject.next({ element, position });
  }

  onOut(_, ui) {
    const { position } = this.getPositionsFromJqueryUi(ui);
    const element = ui.item[0];

    this.onOutSubject.next({ element, position });
  }

  getPositionsFromJqueryUi(ui) {
    return {
      position: { x: ui.offset.left, y: ui.offset.top },
    };
  }

  isGridElement(element) {
    return this.registeredElements.includes(element?.tagName?.toLowerCase());
  }

  destroy() {
    if ($(this.stageEl).sortable('instance')) $(this.stageEl).sortable('destroy');
    this.onStartSubject.complete();
    this.onSortSubject.complete();
    this.onBeforeStopSubject.complete();
    this.onMoveSubject.complete();
    this.onReceiveSubject.complete();
    this.onOverSubject.complete();
    this.onOutSubject.complete();
  }

  getStartObservable() {
    if (!this.startObservable) {
      this.startObservable = this.onStartSubject.asObservable();
    }

    return this.startObservable;
  }

  getSortObservable() {
    if (!this.sortObservable) {
      this.sortObservable = this.onSortSubject.asObservable();
    }

    return this.sortObservable;
  }

  getMoveObservable() {
    if (!this.moveObservable) {
      this.moveObservable = this.onMoveSubject.asObservable();
    }

    return this.moveObservable;
  }

  getReceiveObservable() {
    if (!this.receiveObservable) {
      this.receiveObservable = this.onReceiveSubject.asObservable();
    }

    return this.receiveObservable;
  }

  getOverObservable() {
    if (!this.overObservable) {
      this.overObservable = this.onOverSubject.asObservable();
    }

    return this.overObservable;
  }

  getBeforeStopObservable() {
    if (!this.beforeStopObservable) {
      this.beforeStopObservable = this.onBeforeStopSubject.asObservable();
    }

    return this.beforeStopObservable;
  }

  getStopObservable() {
    return rxjs.merge(this.getReceiveObservable(), this.getMoveObservable());
  }

  getOutObservable() {
    if (!this.outObservable) {
      this.outObservable = this.onOutSubject.asObservable();
    }

    return this.outObservable;
  }
}
