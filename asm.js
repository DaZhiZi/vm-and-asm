const number_end = function(code, index) {
    let digits = '0123456789'
    let n = ''
    let c = code[index]

    while (digits.indexOf(c) !== -1) {
        n += c
        index += 1
        if (index >= code.length) {
            break
        }
        c = code[index]
    }

    n = Number(n)
    return [n, index]
}

const annotation_end = function(code, index) {
    let newline = '\r\n'
    let c = code[index]

    while (newline.indexOf(c) === -1) {
        index += 1
        if (index >= code.length) {
            break
        }
        c = code[index]
    }

    index += 1
    return index
}


const var_end = function(code, index) {
    let end = [' ', '\r', '\n', '\t', ';']
    let s = ''
    let c = code[index]

    while (end.indexOf(c) === -1) {
        s += c
        index += 1
        if (index >= code.length) {
            break
        }
        c = code[index]
    }

    return [s, index]
}

const assembler = function(asm_code) {
    // asm_code 是汇编字符串
    let spaces = [' ', '\n', '\r', '\t']
    let annotation = ';'
    let digits = '0123456789'
    let letter = 'abcdefghijklmnopqrstuvwxyz'

    let ts = []
    let i = 0

    while (i < asm_code.length) {
        let c = asm_code[i]
        i += 1

        if (spaces.indexOf(c) !== -1) {
            continue
        } else if (annotation.indexOf(c) !== -1) {
            let end = annotation_end(asm_code, i)
            i = end
        } else if (digits.indexOf(c) !== -1) {
            let [n, end] = number_end(asm_code, i - 1)
            i = end
            ts.push(n)
        } else if (c === '@') {
            let [n, end] = number_end(asm_code, i)
            i = end
            ts.push(n)
        } else if (letter.indexOf(c) !== -1) {
            let d = {
                'pc': 0b0000000000000000,
                'x': 0b0000000100000000,
                'y': 0b0000001000000000,
                'z': 0b0000001100000000,
                'c1': 0b0000010000000000,
                'f': 0b0000010100000000,
                'set': 0b0000000000000000,
                'load': 0b0000000100000000,
                'add': 0b0000001000000000,
                'save': 0b0000001100000000,
                'compare': 0b0000010000000000,
                'jump': 0b0000010100000000,
                'jump_when_less': 0b0000011000000000,
                'save_from_register': 0b0000011100000000,
                'draw': 0b0000111100000000,
                'halt': 0b1111111111111111,
            }
            let [s, end] = var_end(asm_code, i - 1)
            i = end
            if (s in d) {
                let t = d[s]
                ts.push(t)
            } else {
                // 报错
            }
        } else {
            // 报错
        }
    }

    return ts
}
