
import { Component, GridPosition } from '../models/component.js'

class GridService {
  constructor() {
    /** @type{Component[]} */
    this.components = []

    this.componentsSubject = new rxjs.BehaviorSubject(this.components)

    this.onAddComponent = new rxjs.Subject()
    this.onUpdateComponent = new rxjs.Subject()
    this.onRemoveComponent = new rxjs.Subject()
  }
  
  /**
   * @param  {string} typeName
   * @param  {GridPosition} gridPosition
   */
  addComponent(typeName, gridPosition) {
    const component = new Component(typeName, gridPosition)

    this.components.push(component)

    this.componentsSubject.next(this.components)
    this.onAddComponent.next(component)
  }

  updateComponent(id, gridPosition) {
    const component = this.components.find(__component => __component.id === id)
  
    component.gridPosition = gridPosition;

    this.componentsSubject.next(this.components)
    this.onUpdateComponent.next(component)
  }

  removeComponent(id) {
    this.components = this.components.filter((component) => component.id !== id)

    this.componentsSubject.next(this.components)
    this.onRemoveComponent.next(id)
  }
}

export const gridService = new GridService()
