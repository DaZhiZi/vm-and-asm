class GuaCanvas extends GuaObject {
    constructor(selector) {
        super()
        let canvas = _e(selector)
        this.canvas = canvas
        this.context = canvas.getContext('2d')
        this.w = canvas.width
        this.h = canvas.height
        this.pixels = this.context.getImageData(0, 0, this.w, this.h)
        this.bytesPerPixel = 4
        this.pixelBuffer = this.pixels.data
        this.elements = []
    }
    render() {
        // 执行这个函数后, 才会实际地把图像画出来
        let {pixels, context} = this
        context.putImageData(pixels, 0, 0)
    }
    clear(color=GuaColor.white()) {
        // color GuaColor
        // 用 color 填充整个 canvas
        // 遍历每个像素点, 设置像素点的颜色
        let {w, h} = this
        for (let x = 0; x < w; x++) {
            for (let y = 0; y < h; y++) {
                this._setPixel(x, y, color)
            }
        }
        this.render()
    }
    saveBuffer() {
        // 保存缓冲区
        this.pixelBuffer = []
        let data = this.pixels.data
        for (var i = 0; i < data.length; i++) {
            this.pixelBuffer.push(data[i])
        }
    }
    loadBuffer() {
        // 读取缓冲区
        let data = this.pixels.data
        for (var i = 0; i < data.length; i++) {
            data[i] = this.pixelBuffer[i]
        }
    }
    _setPixel(x, y, color) {
        // color: GuaColor
        // 这个函数用来设置像素点, _ 开头表示这是一个内部函数, 这是我们的约定
        // 浮点转 int
        let int = Math.floor
        x = int(x)
        y = int(y)
        // 用座标算像素下标
        let i = (y * this.w + x) * this.bytesPerPixel
        // 设置像素
        let p = this.pixels.data
        let {r, g, b, a} = color
        // 一个像素 4 字节, 分别表示 r g b a
        p[i] = r
        p[i+1] = g
        p[i+2] = b
        p[i+3] = a
    }
    drawPoint(point, color=GuaColor.black()) {
        // point: GuaPoint
        let {w, h} = this
        let p = point
        if (p.x >= 0 && p.x <= w) {
            if (p.y >= 0 && p.y <= h) {
                this._setPixel(p.x, p.y, color)
            }
        }
    }
    drawLine(p1, p2, color=GuaColor.black()) {
        // p1 p2 分别是起点和终点, GuaPoint 类型
        // color GuaColor
        // 使用 drawPoint 函数来画线
        let xDistance = p2.x - p1.x
        let yDistance = p2.y - p1.y
        // log("x & y", xDistance, yDistance)
        let distance = Math.abs(Math.abs(xDistance) > Math.abs(yDistance)? xDistance: yDistance)
        let {x, y} = p1
        let p = null
        for (let i = 0; i < distance; i++) {
            // log('x & y', x, y)
            p = GuaPoint.new(x, y)
            this.drawPoint(p, color)
            x += xDistance / distance
            y += yDistance / distance
        }
    }
    drawRect(upperLeft, size, fillColor=null, borderColor=GuaColor.black()) {
        // upperLeft: GuaPoint, 矩形左上角座标
        // size: GuaSize, 矩形尺寸
        // fillColor: GuaColor, 矩形的填充颜色, 默认为空, 表示不填充
        // borderColor: GuaColor, 矩形的的边框颜色, 默认伪黑色
        let {x, y} = upperLeft
        let {w, h} = size
        if (fillColor !== null) {
            this._drawRectContent(x, y, w, h, fillColor)
        }
        this._drawRectBorder(x, y, w, h, borderColor)
    }
    _drawRectContent(x, y, w, h, fillColor) {
        let p = null
        for (let i = 0; i < w; i++) {
            for (let j = 0; j < h; j++) {
                p = GuaPoint.new(x + i, y + j)
                this.drawPoint(p, fillColor)
            }
        }
    }
    _drawRectBorder(x, y, w, h, borderColor) {
        let p = null
        for (let i = 0; i < w; i++) {
            p = GuaPoint.new(x + i, y)
            this.drawPoint(p, borderColor)
            p = GuaPoint.new(x + i, y + h)
            this.drawPoint(p, borderColor)
        }
        for (let i = 0; i < h; i++) {
            p = GuaPoint.new(x, y + i)
            this.drawPoint(p, borderColor)
            p = GuaPoint.new(x + w, y + i)
            this.drawPoint(p, borderColor)
        }
    }
    isPointInRect(point) {
        let {x, y} = point
        for (var i = 0; i < this.elements.length; i++) {
            let {position, size} = this.elements[i]
            // 检测 x 坐标是否在矩形内
            let testX = (position.x <= x && x <= position.x + size.w)
            // 检测 y 坐标是否在矩形内
            let testY = (position.y <= y && y <= position.y + size.h)
            if (testX && testY) {
                return this.elements[i]
            }
        }
        return false
    }
    addElement(e) {
        let name = e.constructor.name
        if (name == 'GuaButton') {
            this.drawRect(e.position, e.size)
            this.elements.push(e)
        }
    }
    __debug_draw_demo() {
        let {context, pixels} = this
        // 获取像素数据, data 是一个数组
        let data = pixels.data
        // 一个像素 4 字节, 分别表示 r g b a
        for (let i = 0; i < data.length; i += 4) {
            let [r, g, b, a] = data.slice(i, i + 4)
            r = 255
            a = 255
            data[i] = r
            data[i+3] = a
        }
        context.putImageData(pixels, 0, 0)
    }
}
