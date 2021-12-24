const pulseObservable = (pulseTime) => rxjs.timer(pulseTime, pulseTime);

export class PaginatorToolKit {
  /**@type{rxjs.Observable} */
  #paginatorObservable;
  /**@type{HTMLElement} */
  #prevPageBtn;
  /**@type{HTMLElement} */
  #nextPageBtn;
  /**@type{(pageIdentifier: number) => HTMLElement} */
  #pageFinder;
  /**@type{number} */
  #pulserTime;

  getPaginatorObservable(isDetailed) {
    return this.#paginatorObservable.pipe(
      isDetailed
        ? rxjs.operators.map((data) =>
            Object.assign(data, {
              pageElements: new Array(data.total).fill(null).map((_, i) => this.#pageFinder(i)),
            })
          )
        : rxjs.identity
    );
  }

  getActivePageObservable() {
    return this.getPaginatorObservable().pipe(
      rxjs.operators.map((data) => data.active),
      rxjs.operators.distinctUntilChanged()
    );
  }

  getActivePageElementObservable() {
    return this.getActivePageObservable().pipe(
      rxjs.operators.map((pageIdentifier) => this.#pageFinder(pageIdentifier))
    );
  }

  constructor(paginatorObservable, nextPageBtn, prevPageBtn, pageFinder, pulserTime = 500) {
    this.#paginatorObservable = paginatorObservable;
    this.#prevPageBtn = prevPageBtn;
    this.#nextPageBtn = nextPageBtn;
    this.#pageFinder = pageFinder;
    this.#pulserTime = pulserTime;

    this.enableListeners = this.enableListeners.bind(this);
    this.disableListeners = this.disableListeners.bind(this);
  }

  withGlobalTriggers() {
    if (!this.areGlobalTriggersEnable) {
      this.areGlobalTriggersEnable = true;
      $(window).on('dragstart', this.enableListeners);
      $(window).on('dragstop', this.disableListeners);
    }
    return this;
  }

  enableListeners() {
    if (this.listenersSubscriptions && !this.listenersSubscriptions.closed) return;

    this.listenersSubscriptions = new rxjs.Subscription();
    [this.#prevPageBtn, this.#nextPageBtn].forEach((button) => {
      this.listenersSubscriptions.add(
        rxjs
          .fromEvent(button, 'mouseenter')
          .pipe(
            rxjs.operators.switchMap(() =>
              pulseObservable(this.#pulserTime).pipe(
                rxjs.operators.takeWhile(() => !button.disabled),
                rxjs.operators.takeUntil(rxjs.fromEvent(button, 'mouseleave').pipe(rxjs.operators.take(1)))
              )
            )
          )
          .subscribe(() => button.click())
      );
    });

    return this;
  }

  disableListeners() {
    this.listenersSubscriptions?.unsubscribe();
  }

  destroy() {
    this.disableListeners();
    if (this.areGlobalTriggersEnable) {
      $(window).off('dragstart', this.enableListeners);
      $(window).off('dragstop', this.disableListeners);
    }
  }

  paginateUntilReaches(pageIndex) {
    this.getActivePageObservable()
      .pipe(rxjs.operators.take(1))
      .subscribe((activePageIndex) => {
        const gap = pageIndex - activePageIndex;

        if (gap !== 0) {
          const button = gap > 0 ? this.#nextPageBtn : this.#prevPageBtn;

          for (let i = 0; i < Math.abs(gap); ++i) button.click();
        }
      });
  }
}
