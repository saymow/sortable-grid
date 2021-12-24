import { GridPosition } from '../classes/virtualGrid/index.js';

export default {
  /**
   * @param  {"MAIN"|"CHILD"} type
   * @param  {number|string} location
   * @param  {string} elementType
   * @param  {{[attr:string]:string}} labelAttributesMap
   * @param  {GridPosition} elementGridPosition
   */
  render: (type, location, elementType, labelAttributesMap, elementGridPosition) => ({
    type,
    location,
    payload: {
      elementType,
      labelAttributesMap,
      elementGridPosition,
    },
  }),
};
