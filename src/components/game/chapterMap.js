const chapterMap = {
    0: { 0: 1 },
    1: { 0: 263 },
    3: { 0: 9, 1: 15, 2: 22 },
    4: { 0: 14, 1: 21 },
    5: { 0: 13 },
    6: { 0: 16, 1: 84, 2: 115, 3: 57, 4: 34, 5: 96 },
    7: { 0: 119, 1: 125, 2: 107 },
    8: { 0: 23, 1: 38 },
    9: { 0: 22 },
    10: { 0: 18 },
    11: { 0: 17, 1: 24 },
    13: { 0: 64 },
    14: { 0: 31, 1: 75, 2: 63 },
    15: { 0: 22 },
    16: { 0: 25 },
    17: { 0: 30, 1: 37 },
    18: { 0: 33 },
    19: { 0: 58, 1: 52 },
    21: { 0: 31, 1: 75, 2: 63 },
    22: { 0: 28, 1: 11 },
    23: { 0: 233 },
    24: { 0: 43 },
    25: { 0: 16, 1: 84, 2: 115, 3: 57, 4: 34, 5: 96, 6: 3 },
    26: { 0: 64 },
    27: { 0: 117 },
    28: { 0: 35, 1: 41 },
    29: { 0: 120, 1: 42, 2: 42, 3: 36 },
    30: { 0: 37 },
    31: { 0: 39, 1: 51 },
    32: { 0: 58, 1: 52 },
    33: { 0: 44, 1: 40 },
    34: { 0: 46, 1: 25 },
    35: { 0: 54 },
    36: { 0: 48, 1: 55 },
    37: { 0: 43 },
    38: { 0: 233 },
    39: { 0: 63 },
    40: { 0: 50, 1: 80, 2: 90, 3: 65 },
    41: { 0: 54, 1: 47 },
    42: { 0: 61 },
    43: { 0: 56, 1: 49 },
    44: { 0: 53, 1: 40 },
    45: { 0: 64 },
    46: { 0: 25 },
    47: { 0: 11 },
    48: { 0: 61 },
    49: { 0: 56 },
    50: { 0: 270 },
    51: { 0: 63 },
    52: { 0: 64 },
    53: { 0: 109, 1: 123 },
    54: { 0: 60, 1: 85, 2: 103 },
    55: { 0: 67, 1: 73 },
    56: { 0: 180, 1: 62 },
    57: { 0: 69, 1: 25 },
    58: { 0: 64 },
    59: { 0: 71 },
    60: { 0: 66, 1: 72 },
    61: { 0: 120 },
    62: { 0: 68, 1: 180 },
    63: { 0: 154 },
    64: { 0: 70, 1: 78 },
    65: { 0: 77, 1: 93, 2: 77 },
    66: { 0: 79 },
    67: { 0: 82, 1: 92, 2: 92 },
    68: { 0: 74, 1: 81, 2: 88, 3: 94 },
    69: { 0: 25 },
    70: { 0: 78 },
    71: { 0: 102, 1: 226, 2: 239, 3: 249, 4: 265 },
    72: { 0: 79 },
    73: { 0: 92, 1: 82 },
    74: { 0: 99 },
    75: { 0: 86 },
    76: { 0: 58, 1: 52 },
    77: {},
    78: { 0: 83, 1: 126, 2: 219, 3: 29, 4: 7 },
    79: { 0: 240, 1: 234 },
    80: {},
    81: { 0: 99 },
    82: { 0: 108 },
    83: { 0: 95, 1: 89 },
    84: { 0: 25 },
    85: { 0: 91, 1: 97 },
    86: { 0: 100, 1: 121 },
    87: { 0: 181, 1: 160, 2: 187 },
    88: { 0: 99 },
    89: { 0: 95, 1: 101, 2: 120 },
    90: { 0: 198 },
    91: { 0: 79 },
    92: {},
    93: { 0: 77, 1: 137 },
    94: { 0: 99 },
    95: { 0: 114, 1: 120 },
    96: { 0: 106, 1: 25 },
    97: { 0: 79 },
    98: { 0: 158, 1: 164 },
    99: { 0: 111, 1: 105 },
    100: { 0: 63 },
    101: { 0: 108 },
    102: { 0: 128 },
    103: { 0: 110, 1: 116, 2: 122 },
    104: { 0: 205 },
    105: { 0: 180 },
    106: { 0: 25 },
    107: { 0: 152 },
    108: { 0: 104, 1: 113 },
    109: { 0: 123, 1: 137 },
    110: { 0: 143, 1: 129, 2: 149 },
    111: { 0: 118, 1: 124 },
    112: { 0: 192, 1: 212 },
    113: { 0: 205 },
    114: { 0: 120 },
    115: { 0: 127, 1: 135 },
    116: { 0: 136, 1: 129 },
    117: { 0: 10, 1: 148 },
    118: { 0: 124 },
    119: { 0: 132, 1: 139 },
    120: { 0: 83, 1: 126, 2: 219, 3: 29, 4: 7, 5: 98 },
    121: { 0: 141, 1: 130 },
    122: { 0: 79 },
    123: {},
    124: { 0: 180 },
    125: { 0: 146, 1: 139 },
    126: { 0: 133 },
    127: { 0: 142, 1: 160 },
    128: { 0: 144 },
    129: { 0: 79 },
    130: { 0: 63 },
    131: { 0: 157, 1: 163 },
    132: { 0: 152 },
    133: { 0: 147, 1: 140 },
    134: { 0: 261, 1: 261, 2: 59 },
    135: { 0: 150, 1: 160 },
    136: { 0: 79 },
    137: { 0: 156 },
    138: { 0: 145, 1: 151 },
    139: { 0: 108 },
    140: { 0: 120 },
    141: { 0: 63 },
    142: { 0: 191, 1: 160 },
    143: { 0: 79 },
    144: { 0: 174, 1: 162, 2: 194 },
    145: { 0: 157 },
    146: { 0: 152 },
    147: { 0: 153, 1: 120 },
    148: { 0: 18 },
    149: { 0: 155, 1: 173 },
    150: { 0: 172, 1: 87 },
    151: { 0: 157 },
    152: { 0: 211, 1: 216 },
    153: { 0: 165, 1: 159 },
    154: { 0: 166 },
    155: { 0: 161, 1: 167 },
    156: { 0: 168, 1: 185 },
    157: { 0: 224, 1: 230 },
    158: { 0: 7, 1: 170 },
    159: { 0: 120 },
    160: { 0: 25 },
    161: { 0: 79 },
    162: { 0: 194 },
    163: { 0: 157 },
    164: { 0: 108, 1: 176 },
    165: { 0: 177, 1: 184, 2: 190 },
    166: { 0: 178, 1: 192, 2: 192 },
    167: { 0: 179, 1: 186 },
    168: { 0: 185 },
    169: { 0: 175, 1: 182 },
    170: { 0: 108 },
    171: {},
    172: { 0: 142 },
    173: { 0: 193, 1: 201 },
    174: { 0: 194 },
    175: { 0: 188 },
    176: { 0: 189, 1: 183 },
    177: { 0: 197, 1: 202, 2: 120 },
    178: { 0: 112, 1: 192 },
    179: { 0: 186, 1: 193 },
    180: { 0: 131, 1: 138, 2: 200 },
    181: { 0: 191, 1: 160 },
    182: { 0: 157 },
    183: { 0: 108 },
    184: { 0: 120 },
    185: { 0: 171 },
    186: { 0: 79 },
    187: { 0: 181, 1: 160 },
    188: { 0: 195, 1: 203 },
    189: { 0: 204, 1: 196 },
    190: { 0: 108 },
    191: { 0: 199 },
    192: { 0: 218 },
    193: {},
    194: { 0: 267, 1: 251, 2: 257 },
    195: { 0: 210, 1: 217 },
    196: {},
    197: { 0: 207 },
    198: { 0: 209, 1: 65 },
    199: { 0: 206, 1: 214 },
    200: { 0: 169 },
    201: { 0: 79 },
    202: { 0: 207 },
    203: { 0: 45 },
    204: { 0: 152 },
    205: { 0: 27 },
    206: { 0: 221 },
    207: { 0: 213, 1: 190 },
    208: { 0: 222, 1: 228 },
    209: { 0: 220, 1: 255, 2: 243, 3: 231 },
    210: { 0: 236 },
    211: { 0: 223 },
    212: { 0: 192 },
    213: { 0: 120 },
    214: { 0: 221 },
    215: { 0: 264 },
    216: { 0: 229, 1: 235 },
    217: { 0: 45 },
    218: { 0: 6 },
    219: { 0: 225, 1: 232, 2: 120 },
    220: {},
    221: { 0: 227, 1: 237, 2: 245, 3: 253 },
    222: { 0: 13, 1: 228 },
    223: { 0: 171 },
    224: { 0: 26 },
    225: { 0: 244, 1: 238 },
    226: { 0: 128 },
    227: { 0: 259 },
    228: { 0: 246 },
    229: { 0: 223 },
    230: { 0: 248, 1: 254 },
    231: {},
    232: { 0: 244, 1: 238 },
    233: { 0: 134 },
    234: { 0: 208, 1: 215 },
    235: { 0: 241, 1: 247 },
    236: { 0: 242, 1: 157 },
    237: { 0: 259 },
    238: { 0: 120 },
    239: { 0: 128 },
    240: { 0: 234 },
    242: { 0: 157 },
    243: {},
    244: { 0: 250, 1: 120 },
    245: { 0: 259 },
    246: { 0: 252, 1: 258 },
    248: { 0: 58 },
    249: { 0: 128 },
    250: { 0: 256 },
    251: { 0: 267 },
    252: { 0: 13 },
    253: { 0: 160 },
    254: { 0: 260, 1: 266 },
    255: {},
    256: { 0: 108, 1: 262 },
    257: { 0: 267 },
    258: { 0: 13 },
    259: { 0: 160 },
    260: { 0: 19, 1: 32 },
    261: { 0: 71 },
    262: { 0: 268, 1: 2, 2: 12 },
    263: { 0: 8 },
    264: { 0: 269, 1: 5 },
    265: { 0: 128 },
    266: { 0: 76, 1: 58, 2: 52, 3: 26 },
    267: { 0: 4 },
    269: { 0: 13 },
    270: {}
};

export default chapterMap;
