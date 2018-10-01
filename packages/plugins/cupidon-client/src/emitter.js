export default class Emitter {
    constructor() {
        this.listeners = [];
    }

    on(listener) {
        this.listeners.push(listener);
    }

    off(listener) {
        var index = this.listeners.indexOf(listener);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }

    emit(data) {
        for (let subscriber of this.listeners) {
            subscriber(data);
        }
    }
}
