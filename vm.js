const instructionsMax = Math.pow(2, 16)
const pc = 0b0000000000000000
const x = 0b0000000100000000
const y = 0b0000001000000000
const z = 0b0000001100000000
const c1 = 0b0000010000000000
const f = 0b0000010100000000

const set = function(register, memory, i) {
    let r = memory[i + 1]
    let v = memory[i + 2]
    register[r] = v
    i += 3
    return i
}

const load = function(register, memory, i) {
    let index = memory[i + 1]
    let r = memory[i + 2]
    register[r] = memory[index]
    i += 3
    return i
}

const add = function(register, memory, i) {
    let r1 = memory[i + 1]
    let r2 = memory[i + 2]
    let r3 = memory[i + 3]
    register[r3] = register[r1] + register[r2]
    i += 4
    return i
}

const save = function(register, memory, i) {
    let r = memory[i + 1]
    let index = memory[i + 2]
    memory[index] = register[r]
    i += 3
    return i
}

const compare = function(register, memory, i) {
    let r1 = register[x]
    let r2 = register[y]
    let result = undefined
    if (r1 < r2) {
        result = 0
    } else if (r1 === r2) {
        result = 1
    } else {
        result = 2
    }
    register[c1] = result
    i += 1
    return i
}

const jump = function(register, memory, i) {
    i = memory[i + 1]
    // 直接返回要跳转的地址
    return i
}

const jumpWhenLess = function(register, memory, i) {
    let r = register[c1]
    // 如果小于 pc就跳转到这个地址
    if (r === 0) {
        i = memory[i + 1]
    } else {
        i += 1
    }
    return i
}

const saveFromRegister = function(register, memory, i) {
    let r1 = memory[i + 1]
    let r2 = memory[i + 2]
    let index = register[r2]
    memory[index] = register[r1]
    i += 3
    return i
}

const drawDisplay = function(canvas, memory, displayStart) {
    let {context, pixels} = canvas
    // 获取像素数据, data 是一个数组
    let data = pixels.data
    // 一个像素 4 字节, 分别表示 r g b a
    for (let i = 0, n = displayStart; i < data.length; i += 4, n += 1) {
        let [r, g, b, a] = data.slice(i, i + 4)
        let rgba = memory[n]

        r = Math.floor(rgba / Math.pow(2, 12)) * 17
        rgba %= Math.pow(2, 12)
        g = Math.floor(rgba / Math.pow(2, 8)) * 17
        rgba %= Math.pow(2, 8)
        b = Math.floor(rgba / Math.pow(2, 4)) * 17
        rgba %= Math.pow(2, 4)
        a = Math.floor(rgba / Math.pow(2, 0)) * 17
        data[i] = r
        data[i+1] = g
        data[i+2] = b
        data[i+3] = a
    }
    context.putImageData(pixels, 0, 0)
}

const draw = function(register, memory, i, displayStart) {
    let index = memory[i + 1]
    let offset = memory[i + 2]
    let p = []
    let p1 = []
    let p2 = []
    // + 2是为了跳过开头的 jump 指令
    index = index * 2 + 2
    let char1 = memory[index]
    let char2 = memory[index + 1]
    if (offset > 28) {
        offset += 256 - 32
    }

    let loadPixel = function(pixels, char) {
        let p = []
        while (p.length < 16) {
            if (char >= 1) {
                let n = char % 2
                p.push(n)
                char = Math.floor(char / 2)
            } else {
                p.push(0)
            }
        }
        // 重新排序一次
        pixels.push(p.slice(8, 16))
        pixels.push(p.slice(0, 8))
        return pixels
    }
    loadPixel(p, char1)
    loadPixel(p, char2)
    // 红色
    let color = 61455
    // displayStart
    for (let j = 0; j < 4; j++) {
        for (let k = 0; k < 8; k++) {
            if (p[j][k] === 1) {
                // 计算偏移量
                let index = displayStart + (j * 1) + (k * 32) + offset
                // 设置像素
                memory[index] = color
            }
        }
    }

    i += 3
    return i
}

const run = function(memory) {
    // register -> [pc, x, y, z, c1, f]
    let register = {
        0b0000000000000000: 0,
        0b0000000100000000: undefined,
        0b0000001000000000: undefined,
        0b0000001100000000: undefined,
        0b0000010000000000: undefined,
        0b0000010100000000: undefined,
    }
    let instructions = {
        0b0000000000000000: set,
        0b0000000100000000: load,
        0b0000001000000000: add,
        0b0000001100000000: save,
        0b0000010000000000: compare,
        0b0000010100000000: jump,
        0b0000011000000000: jumpWhenLess,
        0b0000011100000000: saveFromRegister,
        0b0000111100000000: draw,
    }
    let canvas = GuaCanvas.new('#id-canvas')
    // let displayStart = instructionsMax - 10000
    let displayStart = 256
    let i = register[pc]

    while (memory.length < instructionsMax) {
        memory.push(0)
    }

    // 自动刷新屏幕 一分钟60次
    setInterval(function() {
        drawDisplay(canvas, memory, displayStart)
    }, 1000 / 60)

    while (i < instructionsMax) {
        let key = memory[i]
        func = instructions[key]
        if (func) {
            if (func === draw) {
                i = func(register, memory, i, displayStart)
            } else {
                i = func(register, memory, i)
            }
            register[pc] = i
        } else if (key === 0b1111111111111111) {
            log('stop')
            break
        }
    }

}
