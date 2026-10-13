/**
 * 纯 TypeScript 实现 Code 128 条形码编码器（无需外部依赖）
 * 支持 Code 128 B Charset，生成 SVG 字符串
 */

/** Code 128 B charset 编码表：value -> pattern (11 bits) */
const CODE128B_TABLE: string[] = [
  '11011001100', // 0
  '11001101100', // 1
  '11001100110', // 2
  '10010011000', // 3
  '10010001100', // 4
  '10001001100', // 5
  '10011001000', // 6
  '10011000100', // 7
  '10001100100', // 8
  '11001001000', // 9
  '11001000100', // 10
  '11000100100', // 11
  '10110011100', // 12
  '10011011100', // 13
  '10011001110', // 14
  '10111001100', // 15
  '10011101100', // 16
  '10011100110', // 17
  '11001110010', // 18
  '11001011100', // 19
  '11001001110', // 20
  '11011100100', // 21
  '11001110100', // 22
  '11101101110', // 23
  '11101001100', // 24
  '11100101100', // 25
  '11100100110', // 26
  '11101100100', // 27
  '11100110100', // 28
  '11100110010', // 29
  '11011011000', // 30
  '11011000110', // 31
  '11000110110', // 32 (Space)
  '10100011000', // 33
  '10001011000', // 34
  '10001000110', // 35
  '10110001000', // 36
  '10001101000', // 37
  '10001100010', // 38
  '11010001000', // 39
  '11000101000', // 40
  '11000100010', // 41
  '10110111000', // 42
  '10110001110', // 43
  '10001101110', // 44
  '10111011000', // 45
  '10111000110', // 46
  '10001110110', // 47
  '11101110110', // 48
  '11010001110', // 49
  '11000101110', // 50
  '11011101000', // 51
  '11011100010', // 52
  '11011101110', // 53
  '11101011000', // 54
  '11101000110', // 55
  '11100010110', // 56
  '11101101000', // 57
  '11101100010', // 58
  '11100011010', // 59
  '11101111010', // 60
  '11010000100', // 61
  '11010010000', // 62
  '11010011100', // 63
  '1100011101011', // 64 (FNC1 - we use pattern for CODE B Start: 104+104=208)
  '11010111000', // 65 A
  '11011000010', // 66 B
  '11000011110', // 67 C
  '10001111010', // 68 D
  '10100111100', // 69 E
  '10100011110', // 70 F
  '10011110010', // 71 G
  '10011100010', // 72 H
  '10011000010', // 73 I
  '10110000110', // 74 J
  '10110010000', // 75 K
  '10110011000', // 76 L
  '10011010100', // 77 M
  '10011011000', // 78 N
  '10011000100', // 79 O
  '10001100100', // 80 P
  '11001011010', // 81 Q
  '11001001110', // 82 R
  '11110001100', // 83 S
  '11100011100', // 84 T
  '11100010010', // 85 U
  '10001111000', // 86 V
  '10100111000', // 87 W
  '10010111000', // 88 X
  '10010011110', // 89 Y
  '10001011110', // 90 Z
  '11101011100', // 91 [
  '11111010100', // 92 \
  '11111001010', // 93 ]
  '11111000100', // 94 ^
  '10001110000', // 95 _
  '10001110100', // 96 `
  '10111010000', // 97 a
  '10111001000', // 98 b
  '10011010100', // 99 c
  '10011010010', // 100 d
  '11001010000', // 101 e
  '11001010110', // 102 f
  '10000011010', // 103 g
]

const START_CODE_B = 104
const STOP_CODE = 106

/** 获取字符的 Code 128 B 值 */
function charToCode128B(char: string): number {
  const code = char.charCodeAt(0)
  // 空格(32) -> 42, A-Z(65-90) -> 65-90, a-z(97-122) -> 97-122
  if (code >= 32 && code <= 127) {
    return code - 32 // 空格(32) -> 0, DEL(127) -> 95, 但我们处理 32-95 范围
  }
  // 空格 = 42, A-Z = 65-90 -> 33-58, a-z = 97-122 -> 65-90
  if (code >= 64) {
    return code - 32
  }
  return 0
}

/** 编码字符串为 Code 128 B */
function encodeCode128B(text: string): string {
  if (!text || text.length === 0) return ''

  const values: number[] = [START_CODE_B]
  let checksum = START_CODE_B

  for (let i = 0; i < text.length; i++) {
    const val = charToCode128B(text[i])
    values.push(val)
    checksum += val * (i + 1)
  }

  const checksumVal = checksum % 103
  values.push(checksumVal)
  values.push(STOP_CODE)

  // 构建 SVG 路径
  let bars = ''
  let x = 0
  for (let i = 0; i < values.length; i++) {
    const pattern = CODE128B_TABLE[values[i]] || CODE128B_TABLE[0]
    for (let j = 0; j < pattern.length; j++) {
      if (pattern[j] === '1') {
        bars += `<rect x="${x}" y="0" width="1" height="HEIGHT" />`
      }
      x += 1
    }
  }

  return bars
}

/**
 * 生成 Code 128 条形码 SVG 字符串
 * @param text 条码文本
 * @param options 可选参数
 */
export function generateBarcodeSVG(
  text: string,
  options: {
    height?: number
    unitWidth?: number
    margin?: number
  } = {}
): string {
  const { height = 60, unitWidth = 2, margin = 10 } = options
  const bars = encodeCode128B(text)

  if (!bars) return ''

  // 计算总宽度
  const patternLen = bars.split('<rect').length - 1
  const totalWidth = patternLen * unitWidth + margin * 2

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1"
    width="${totalWidth}" height="${height + 16}"
    viewBox="0 0 ${totalWidth} ${height + 16}">
    <text x="${totalWidth / 2}" y="${height + 12}"
      font-family="Consolas, 'SF Mono', monospace"
      font-size="11" text-anchor="middle" fill="#111827">${text}</text>
    <g transform="translate(${margin}, 0) scale(${unitWidth}, 1)">
      ${bars.replace(/HEIGHT/g, String(height))}
    </g>
  </svg>`

  return svg
}

/**
 * 生成条形码 PNG data URL（用于打印）
 */
export function generateBarcodeDataURL(
  text: string,
  options: {
    height?: number
    unitWidth?: number
    margin?: number
    bgColor?: string
    barColor?: string
  } = {}
): string {
  const { height = 60, unitWidth = 2, margin = 10, bgColor = '#ffffff', barColor = '#111827' } = options
  const bars = encodeCode128B(text)
  if (!bars) return ''

  const patternLen = bars.split('<rect').length - 1
  const totalWidth = patternLen * unitWidth + margin * 2
  const svg = generateBarcodeSVG(text, { height, unitWidth, margin })

  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}
