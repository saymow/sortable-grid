import { GridPosition } from '../classes/virtualGrid/index.js';

export default {
  /**
   * @param  {"MOVE"|"RESIZE"} type
   * @param  {string} elementId
   * @param  {GridPosition} elementNewGridPosition
   * @param  {"EXTERN"|"INTERN"} origin?
   * @param  {string|number} childId?
   */
  render: (type, elementId, elementNewGridPosition, origin, childId) => ({
    type,
    origin,
    payload: {
      childId,
      elementData: { elementId, elementNewGridPosition },
    },
  }),
};
