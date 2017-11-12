class GuaButton extends GuaObject {
    // 表示颜色的类
    constructor() {
        super()
        this.action = []
        this.position = undefined
        this.size = undefined
    }

    addAction(func) {
        this.action.push(func)
    }
}
