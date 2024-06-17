import { load as loadYaml } from "js-yaml";

import MathJaxAnimationStrategy from './animation/strategy/MathJax.js';
import { Triggers } from './animation/trigger/Triggers.js';
import OpacityToggleTransition from './animation/transition/OpacityToggle.js';


const privateConstructor = Symbol('privateConstructor');


export default class ExprAnimator {
    #container;
    #animationStrategy;
    #trigger;
    #transition;

    constructor(symbol) {
        if (symbol !== privateConstructor) {
            throw new Error("Use ExprAnimator.create() instead");
        }
        this.debug = false;
    }

    static create(container, trigger = Triggers.default, transition = new OpacityToggleTransition()) {
        const obj = new ExprAnimator(privateConstructor);

        obj.#container = container;
        obj.#trigger = trigger;
        obj.#transition = transition;

        return obj;
    }

    async run(source, opts = {}) {
        if (this.#animationStrategy?.isAnimating) {
            throw new Error('Already animating. Please wait until the current animation is finished.');
        }

        try {
            let exprs = source;
            if (typeof source === 'string') {
                exprs = await this.#fetchExpr(source);
            }

            // THINK: 'fetch'한 결과에 따라서 적절한 추가적인 'AnimationStrategy'를 사용하도록 변경할 수 있을까?
            this.#animationStrategy = new MathJaxAnimationStrategy(this.#container);
            await this.#animationStrategy.init(opts);

            this.#animationStrategy.debug = this.debug;

            this.#animationStrategy.isAnimating = true;
            await this.#animationStrategy.animate(exprs, this.#trigger, this.#transition);
        } finally {
            if (this.#animationStrategy != null) {
                this.#animationStrategy.isAnimating = false;
            }
        }
    }

    async #fetchExpr(resourceUrl) {
        const response = await fetch(resourceUrl);
        const yamlText = await response.text();
        const data = loadYaml(yamlText);
        return data.steps;
    }
}
