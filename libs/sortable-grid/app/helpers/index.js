import { IncompatibleElementCreatorError } from '../errors/incompatible-element-creator.js';

export default class Helpers {
  static objectToMap = (object) => {
    return Object.entries(object).reduce((map, [key, value]) => {
      map.set(key, value);

      return map;
    }, new Map());
  };

  static getAttributesMap = (element) =>
    Array.from(element.attributes).reduce((map, token) => {
      map[token.nodeName] = token.nodeValue;
      return map;
    }, {});

  static getElementTypeFromLabelEl(element) {
    const elementType = element.getAttribute('data-type')?.toLowerCase();
    if (!elementType) throw new IncompatibleElementCreatorError(element, 'missing data-type attribute');

    return elementType;
  }
}
