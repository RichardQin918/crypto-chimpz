let hasInitZIndex = false;
let zIndex = void 0;

const PopupManager = {
    nextZIndex: function nextZIndex() {
        return PopupManager.zIndex++;
    },
}

Object.defineProperty(PopupManager, 'zIndex', {
    configurable: true,
    get: function get() {
        if (!hasInitZIndex) {
            zIndex = zIndex || 2000;
            hasInitZIndex = true;
        }
        return zIndex;
    },
    set: function set(value) {
        zIndex = value;
    }
});

export default PopupManager
