import { Stage } from '../stage.js';
import { MAIN_STAGE_ID } from '../constants.js';

class StagesOrphanage extends Map {
  add(parentId, stageNode) {
    if (this.has(parentId)) {
      this.get(parentId).push(stageNode);
    } else {
      this.set(parentId, [stageNode]);
    }
  }

  pop(parentId) {
    const stageNodes = super.get(parentId) || [];
    this.delete(parentId);

    return stageNodes;
  }
}

class StageNode {
  /**
   * @param  {string} id
   * @param  {Stage} stage
   * @param  {Stage[]} children
   */
  constructor(id, stage) {
    this.id = id;
    this.stage = stage;
    this.children = [];
  }

  setChildren(children) {
    this.children = children;
  }

  addChild(stageNode) {
    this.children.push(stageNode);
  }

  clearChildren() {
    this.children = [];
  }

  destroy() {
    this.clearChildren();
  }
}

export class StagesController {
  constructor(stage) {
    this.mainStageNode = new StageNode(MAIN_STAGE_ID, stage);
    this.stagesOrphanage = new StagesOrphanage();
  }

  #storeChild(parentNodeId, stageNode) {
    this.stagesOrphanage.add(parentNodeId, stageNode);
  }

  #getStoredChildren(parentId) {
    return this.stagesOrphanage.pop(parentId);
  }

  /**
   * @param {(stage: Stage) => boolean} cb
   * */
  forEach(cb) {
    cb(this.mainStageNode.stage);
    this.#forEach(this.mainStageNode, cb);
  }

  #forEach(stageNode, cb) {
    for (let i = 0; i < stageNode.children.length; ++i) {
      cb(stageNode.children[i].stage);
      this.#forEach(stageNode.children[i], cb);
    }
  }

  addAtGivenParent(id, sortableStage, parentNodeId = MAIN_STAGE_ID) {
    const stageNode = new StageNode(id, sortableStage);
    stageNode.setChildren(this.#getStoredChildren(id));

    if (parentNodeId === MAIN_STAGE_ID) {
      this.mainStageNode.addChild(stageNode);
      return true;
    }
    if (this.#addAtGivenParentRecursively(this.mainStageNode, stageNode, parentNodeId)) {
      return true;
    }

    this.#storeChild(parentNodeId, stageNode);

    return false;
  }

  #addAtGivenParentRecursively(parentNode, stageNode, parentNodeId) {
    let tmp;

    for (let i = 0; i < parentNode.children.length; ++i) {
      tmp = parentNode.children[i];
      if (tmp.id === parentNodeId) {
        tmp.addChild(stageNode);
        return true;
      }

      if (this.#addAtGivenParentRecursively(tmp, stageNode, parentNodeId)) {
        return true;
      }
    }

    return false;
  }

  /**
   * @param {(stage: Stage) => boolean} cb
   * @return {Stage}
   * */
  findBottomUp(cb) {
    const stageNode = this.#findBottomUpRecursively(this.mainStageNode, cb);
    if (stageNode) return stageNode;
    if (cb(this.mainStageNode.stage)) return this.mainStageNode.stage;

    return null;
  }

  #findBottomUpRecursively(parentNode, cb) {
    let tmp;

    for (let i = 0; i < parentNode.children.length; ++i) {
      tmp = this.#findBottomUpRecursively(parentNode.children[i], cb);
      if (tmp) return tmp;

      tmp = parentNode.children[i].stage;
      if (cb(tmp)) return tmp;
    }

    return null;
  }

  /** @return {Stage} */
  get(id) {
    return this.#getRecursively(this.mainStageNode, id);
  }

  #getRecursively(parentNode, id) {
    let tmp;

    for (let i = 0; i < parentNode.children.length; ++i) {
      tmp = parentNode.children[i];
      if (tmp.id === id) return tmp.stage;

      tmp = this.#getRecursively(tmp, id);
      if (tmp) return tmp;
    }

    return null;
  }

  remove(id) {
    return this.#removeRecursively(this.mainStageNode, id);
  }

  #removeRecursively(parentNode, id) {
    let tmp;

    for (let i = 0; i < parentNode.children.length; ++i) {
      tmp = parentNode.children[i];

      if (tmp.id === id) {
        tmp.destroy();
        parentNode.children.splice(i, 1);
        return true;
      }

      if (this.#removeRecursively(tmp, id)) return true;
    }

    return false;
  }

  destroy() {
    this.#destroyRecursively(this.mainStageNode);
    this.mainStageNode.destroy();
  }

  #destroyRecursively(parentNode) {
    let tmp;

    for (let i = 0; i < parentNode.children.length; ++i) {
      tmp = parentNode.children[i];
      this.#destroyRecursively(tmp);
      tmp.destroy();
    }
  }
}
