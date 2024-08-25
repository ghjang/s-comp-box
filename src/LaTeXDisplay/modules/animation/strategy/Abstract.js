export default class AbstractAnimationStrategy {
  constructor(container) {
    if (new.target === AbstractAnimationStrategy) {
      throw new TypeError("Cannot construct Abstract instances directly");
    }
    this.container = container;
    this.isAnimating = false;
    this.debug = false;
  }

  async init() {
    throw new Error("Must override method");
  }

  async animate(_exprs) {
    throw new Error("Must override method");
  }

  async stop() {
    throw new Error("Must override method");
  }
}
