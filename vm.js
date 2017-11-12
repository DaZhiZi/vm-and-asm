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
    }
    let canvas = GuaCanvas.new('#id-canvas')
    let displayStart = instructionsMax - 10000
    let i = register[pc]

    while (memory.length < instructionsMax) {
        memory.push(0)
    }

    while (i < instructionsMax) {
        let key = memory[i]
        func = instructions[key]
        if (func) {
            i = func(register, memory, i)
            drawDisplay(canvas, memory, displayStart)
            register[pc] = i
        } else if (key === 0b1111111111111111) {
            log('stop')
            break
        }
    }
}
