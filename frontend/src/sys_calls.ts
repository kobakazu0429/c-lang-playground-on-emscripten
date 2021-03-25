// @ts-nocheck
import { GlobalHEAP } from "./HEAPContext";
import { UTF8ArrayToString, UTF8ToString } from "./UTF8Decoder";
import { out, err } from "./stdout";

const SYSCALLS = {
  mappings: {},
  buffers: [null, [], []] as any[],
  printChar: function (stream: number, curr: number) {
    var buffer = SYSCALLS.buffers[stream];
    if (curr === 0 || curr === 10) {
      (stream === 1 ? out : err)(UTF8ArrayToString(buffer, 0));
      buffer.length = 0;
    } else {
      buffer.push(curr);
    }
  },
  varargs: undefined,
  get: function () {
    // @ts-ignore
    SYSCALLS.varargs += 4;
    // @ts-ignore
    var ret = GlobalHEAP.HEAP32[(SYSCALLS.varargs - 4) >> 2];
    return ret;
  },
  getStr: function (ptr: any) {
    var ret = UTF8ToString(ptr);
    return ret;
  },
  get64: function (low: any) {
    return low;
  },
};

export function _fd_write(fd: any, iov: any, iovcnt: any, pnum: any) {
  var num = 0;
  for (var i = 0; i < iovcnt; i++) {
    var ptr = GlobalHEAP.HEAP32[(iov + i * 8) >> 2];
    var len = GlobalHEAP.HEAP32[(iov + (i * 8 + 4)) >> 2];
    for (var j = 0; j < len; j++) {
      SYSCALLS.printChar(fd, GlobalHEAP.HEAPU8[ptr + j]);
    }
    num += len;
  }
  GlobalHEAP.HEAP32[pnum >> 2] = num;
  return 0;
}
