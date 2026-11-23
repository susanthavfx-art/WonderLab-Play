/* =========================================================
   WonderLab Play — Self-Contained QR Code SVG Generator
   js/qr.js  ·  Zero dependencies, ES5/Smart-TV safe
   ISO/IEC 18004 Byte Mode, Error Correction Level M (v1–v10)
   ========================================================= */
(function (global) {
  'use strict';

  // Total data codewords and EC codewords per block for EC Level M, versions 1..10
  // Format: [version, totalDataBytes, ecBytesPerBlock, numBlocksGroup1, dataPerBlockG1, numBlocksGroup2, dataPerBlockG2]
  var VERSION_TABLE_M = [
    null,
    [1,  16, 10, 1, 16, 0, 0],
    [2,  28, 16, 1, 28, 0, 0],
    [3,  44, 26, 1, 44, 0, 0],
    [4,  64, 18, 2, 32, 0, 0],
    [5,  86, 24, 2, 43, 0, 0],
    [6, 108, 16, 4, 27, 0, 0],
    [7, 124, 18, 4, 31, 0, 0],
    [8, 154, 22, 2, 38, 2, 39],
    [9, 182, 22, 3, 36, 2, 37],
    [10, 216, 26, 4, 43, 1, 44]
  ];

  var ALIGNMENT_POS = [
    null,
    [],
    [6, 18],
    [6, 22],
    [6, 26],
    [6, 30],
    [6, 34],
    [6, 22, 38],
    [6, 24, 42],
    [6, 26, 46],
    [6, 28, 50]
  ];

  // GF(256) tables with primitive polynomial 0x11d
  var GF_EXP = new Array(512);
  var GF_LOG = new Array(256);
  (function initGF() {
    var x = 1, i;
    for (i = 0; i < 255; i++) {
      GF_EXP[i] = x;
      GF_LOG[x] = i;
      x <<= 1;
      if (x & 0x100) x ^= 0x11d;
    }
    for (i = 255; i < 512; i++) {
      GF_EXP[i] = GF_EXP[i - 255];
    }
  })();

  function gfMul(a, b) {
    if (a === 0 || b === 0) return 0;
    return GF_EXP[GF_LOG[a] + GF_LOG[b]];
  }

  function rsGeneratorPoly(degree) {
    var poly = [1];
    for (var i = 0; i < degree; i++) {
      var next = new Array(poly.length + 1);
      for (var k = 0; k < next.length; k++) next[k] = 0;
      var root = GF_EXP[i];
      for (var j = 0; j < poly.length; j++) {
        next[j] ^= poly[j];
        next[j + 1] ^= gfMul(poly[j], root);
      }
      poly = next;
    }
    return poly;
  }

  function rsEncode(data, ecLen) {
    var gen = rsGeneratorPoly(ecLen);
    var rem = new Array(ecLen);
    var i, j;
    for (i = 0; i < ecLen; i++) rem[i] = 0;
    for (i = 0; i < data.length; i++) {
      var factor = data[i] ^ rem[0];
      rem.shift();
      rem.push(0);
      if (factor !== 0) {
        for (j = 0; j < ecLen; j++) {
          rem[j] ^= gfMul(gen[j + 1], factor);
        }
      }
    }
    return rem;
  }

  function utf8Bytes(str) {
    var out = [];
    for (var i = 0; i < str.length; i++) {
      var c = str.charCodeAt(i);
      if (c < 0x80) {
        out.push(c);
      } else if (c < 0x800) {
        out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
      } else if (c >= 0xd800 && c <= 0xdbff && i + 1 < str.length) {
        var c2 = str.charCodeAt(++i);
        var cp = 0x10000 + (((c & 0x3ff) << 10) | (c2 & 0x3ff));
        out.push(
          0xf0 | (cp >> 18),
          0x80 | ((cp >> 12) & 0x3f),
          0x80 | ((cp >> 6) & 0x3f),
          0x80 | (cp & 0x3f)
        );
      } else {
        out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
      }
    }
    return out;
  }

  function pickVersion(byteLen) {
    for (var v = 1; v <= 10; v++) {
      var countBits = v <= 9 ? 8 : 16;
      var maxBytes = VERSION_TABLE_M[v][1] - Math.ceil((4 + countBits) / 8);
      if (byteLen <= maxBytes) return v;
    }
    return -1;
  }

  function buildCodewords(bytes, spec) {
    var ver = spec[0];
    var totalData = spec[1];
    var ecLen = spec[2];
    var g1Blocks = spec[3], g1Len = spec[4];
    var g2Blocks = spec[5], g2Len = spec[6];

    var bits = [];
    function pushBits(val, len) {
      for (var i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1);
    }

    // Mode indicator: Byte = 0100
    pushBits(0x4, 4);
    pushBits(bytes.length, ver <= 9 ? 8 : 16);
    for (var i = 0; i < bytes.length; i++) pushBits(bytes[i], 8);

    var capacityBits = totalData * 8;
    var term = Math.min(4, capacityBits - bits.length);
    pushBits(0, term);
    while (bits.length % 8 !== 0) bits.push(0);

    var dataBytes = [];
    for (var b = 0; b < bits.length; b += 8) {
      var byteVal = 0;
      for (var k = 0; k < 8; k++) byteVal = (byteVal << 1) | bits[b + k];
      dataBytes.push(byteVal);
    }
    var padToggle = 0;
    while (dataBytes.length < totalData) {
      dataBytes.push(padToggle ? 0x11 : 0xec);
      padToggle ^= 1;
    }

    // Split into blocks & compute RS EC
    var dataBlocks = [];
    var ecBlocks = [];
    var offset = 0;
    var blk;
    for (blk = 0; blk < g1Blocks; blk++) {
      var d1 = dataBytes.slice(offset, offset + g1Len);
      offset += g1Len;
      dataBlocks.push(d1);
      ecBlocks.push(rsEncode(d1, ecLen));
    }
    for (blk = 0; blk < g2Blocks; blk++) {
      var d2 = dataBytes.slice(offset, offset + g2Len);
      offset += g2Len;
      dataBlocks.push(d2);
      ecBlocks.push(rsEncode(d2, ecLen));
    }

    // Interleave data codewords then EC codewords
    var result = [];
    var maxDataLen = Math.max(g1Len, g2Len);
    var col, row;
    for (col = 0; col < maxDataLen; col++) {
      for (row = 0; row < dataBlocks.length; row++) {
        if (col < dataBlocks[row].length) result.push(dataBlocks[row][col]);
      }
    }
    for (col = 0; col < ecLen; col++) {
      for (row = 0; row < ecBlocks.length; row++) {
        result.push(ecBlocks[row][col]);
      }
    }
    return result;
  }

  function makeMatrix(ver) {
    var size = ver * 4 + 17;
    var modules = [];
    var isFunc = [];
    for (var r = 0; r < size; r++) {
      modules[r] = new Array(size);
      isFunc[r] = new Array(size);
      for (var c = 0; c < size; c++) {
        modules[r][c] = false;
        isFunc[r][c] = false;
      }
    }

    function setFunction(r, c, dark) {
      if (r < 0 || r >= size || c < 0 || c >= size) return;
      modules[r][c] = !!dark;
      isFunc[r][c] = true;
    }

    function drawFinder(topR, leftC) {
      for (var dr = -1; dr <= 7; dr++) {
        for (var dc = -1; dc <= 7; dc++) {
          var rr = topR + dr, cc = leftC + dc;
          if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
          var inOuter = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6;
          var inRing = dr === 0 || dr === 6 || dc === 0 || dc === 6;
          var inCenter = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
          setFunction(rr, cc, inOuter && (inRing || inCenter));
        }
      }
    }

    drawFinder(0, 0);
    drawFinder(0, size - 7);
    drawFinder(size - 7, 0);

    // Timing patterns
    for (var i = 8; i < size - 8; i++) {
      setFunction(6, i, i % 2 === 0);
      setFunction(i, 6, i % 2 === 0);
    }

    // Alignment patterns
    var pos = ALIGNMENT_POS[ver];
    for (var a = 0; a < pos.length; a++) {
      for (var b = 0; b < pos.length; b++) {
        var ar = pos[a], ac = pos[b];
        if ((ar === 6 && ac === 6) || (ar === 6 && ac === size - 7) || (ar === size - 7 && ac === 6)) continue;
        for (var dr2 = -2; dr2 <= 2; dr2++) {
          for (var dc2 = -2; dc2 <= 2; dc2++) {
            var dist = Math.max(Math.abs(dr2), Math.abs(dc2));
            setFunction(ar + dr2, ac + dc2, dist !== 1);
          }
        }
      }
    }

    // Reserve format info areas
    for (var f = 0; f <= 8; f++) {
      if (f !== 6) {
        setFunction(8, f, false);
        setFunction(f, 8, false);
      }
    }
    for (var f2 = 0; f2 < 8; f2++) {
      setFunction(8, size - 1 - f2, false);
      setFunction(size - 1 - f2, 8, false);
    }
    // Dark module
    setFunction(size - 8, 8, true);

    // Version info for v7..10
    if (ver >= 7) {
      var rem = ver;
      for (var vi = 0; vi < 12; vi++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
      var vBits = (ver << 12) | rem;
      for (var bit = 0; bit < 18; bit++) {
        var dark = ((vBits >>> bit) & 1) === 1;
        var vr = Math.floor(bit / 3);
        var vc = size - 11 + (bit % 3);
        setFunction(vr, vc, dark);
        setFunction(vc, vr, dark);
      }
    }

    return { size: size, modules: modules, isFunc: isFunc };
  }

  function drawFormatBits(m, mask) {
    // EC Level M = 00
    var data = (0 << 3) | mask;
    var rem = data;
    for (var i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    var bits = ((data << 10) | rem) ^ 0x5412;
    var size = m.size;

    function bit(idx) { return ((bits >>> idx) & 1) === 1; }

    for (var j = 0; j <= 5; j++) m.modules[8][j] = bit(14 - j);
    m.modules[8][7] = bit(8);
    m.modules[8][8] = bit(7);
    m.modules[7][8] = bit(6);
    for (var k = 9; k < 15; k++) m.modules[14 - k][8] = bit(14 - k);

    for (var a = 0; a < 8; a++) m.modules[8][size - 1 - a] = bit(a);
    for (var b = 0; b < 7; b++) m.modules[size - 7 + b][8] = bit(8 + b);
    m.modules[size - 8][8] = true;
  }

  function placeCodewords(m, codewords) {
    var size = m.size;
    var bitIdx = 0;
    var totalBits = codewords.length * 8;
    var upward = true;

    for (var right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (var vert = 0; vert < size; vert++) {
        var r = upward ? size - 1 - vert : vert;
        for (var j = 0; j < 2; j++) {
          var c = right - j;
          if (!m.isFunc[r][c]) {
            var dark = false;
            if (bitIdx < totalBits) {
              dark = ((codewords[bitIdx >>> 3] >>> (7 - (bitIdx & 7))) & 1) === 1;
              bitIdx++;
            }
            m.modules[r][c] = dark;
          }
        }
      }
      upward = !upward;
    }
  }

  function maskTest(mask, r, c) {
    switch (mask) {
      case 0: return (r + c) % 2 === 0;
      case 1: return r % 2 === 0;
      case 2: return c % 3 === 0;
      case 3: return (r + c) % 3 === 0;
      case 4: return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
      case 5: return ((r * c) % 2) + ((r * c) % 3) === 0;
      case 6: return (((r * c) % 2) + ((r * c) % 3)) % 2 === 0;
      default: return (((r + c) % 2) + ((r * c) % 3)) % 2 === 0;
    }
  }

  function cloneModules(mods) {
    var out = new Array(mods.length);
    for (var r = 0; r < mods.length; r++) out[r] = mods[r].slice();
    return out;
  }

  function penaltyScore(mods) {
    var n = mods.length;
    var score = 0, r, c;
    // Adjacent modules in row/col
    for (r = 0; r < n; r++) {
      var runR = 1, runC = 1;
      for (c = 1; c < n; c++) {
        if (mods[r][c] === mods[r][c - 1]) { runR++; if (runR === 5) score += 3; else if (runR > 5) score++; }
        else runR = 1;
        if (mods[c][r] === mods[c - 1][r]) { runC++; if (runC === 5) score += 3; else if (runC > 5) score++; }
        else runC = 1;
      }
    }
    // 2x2 blocks
    for (r = 0; r < n - 1; r++) {
      for (c = 0; c < n - 1; c++) {
        var v = mods[r][c];
        if (v === mods[r][c + 1] && v === mods[r + 1][c] && v === mods[r + 1][c + 1]) score += 3;
      }
    }
    return score;
  }

  function encodeMatrix(text) {
    var bytes = utf8Bytes(String(text || ''));
    var ver = pickVersion(bytes.length);
    if (ver < 0) throw new Error('QR text too long');
    var codewords = buildCodewords(bytes, VERSION_TABLE_M[ver]);
    var base = makeMatrix(ver);
    placeCodewords(base, codewords);

    var bestMask = 0;
    var bestPenalty = 1e9;
    var bestModules = null;

    for (var mask = 0; mask < 8; mask++) {
      var copy = { size: base.size, modules: cloneModules(base.modules), isFunc: base.isFunc };
      for (var r = 0; r < copy.size; r++) {
        for (var c = 0; c < copy.size; c++) {
          if (!copy.isFunc[r][c] && maskTest(mask, r, c)) {
            copy.modules[r][c] = !copy.modules[r][c];
          }
        }
      }
      drawFormatBits(copy, mask);
      var p = penaltyScore(copy.modules);
      if (p < bestPenalty) {
        bestPenalty = p;
        bestMask = mask;
        bestModules = copy.modules;
      }
    }
    return { size: base.size, modules: bestModules, mask: bestMask };
  }

  function toSvg(text, opts) {
    opts = opts || {};
    var margin = typeof opts.margin === 'number' ? opts.margin : 3;
    var dark = opts.dark || '#070a19';
    var light = opts.light || '#ffffff';
    var qr = encodeMatrix(text);
    var total = qr.size + margin * 2;
    var path = '';
    for (var r = 0; r < qr.size; r++) {
      for (var c = 0; c < qr.size; c++) {
        if (qr.modules[r][c]) {
          path += 'M' + (c + margin) + ',' + (r + margin) + 'h1v1h-1z';
        }
      }
    }
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + total + ' ' + total + '" ' +
      'shape-rendering="crispEdges" role="img" aria-label="QR Code">' +
      '<rect width="' + total + '" height="' + total + '" rx="2" fill="' + light + '"/>' +
      '<path d="' + path + '" fill="' + dark + '"/>' +
      '</svg>'
    );
  }

  global.WonderQR = { toSvg: toSvg, encodeMatrix: encodeMatrix };
})(typeof window !== 'undefined' ? window : globalThis);
