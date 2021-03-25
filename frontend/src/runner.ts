// import path from "path";
// import fs from "fs";

// @ts-ignore
import { GlobalHEAP } from "./HEAPContext";
// @ts-ignore
import { SYSTEM_STATUS } from "./system_status";
// @ts-ignore
import { _fd_write } from "./sys_calls";
// @ts-ignore
import { err } from "./stdout";

// const _scriptDir = import.meta.url;
// const _scriptDir = "file:///Users/kazu/workspace2/foo/src/mjs.mjs";
// const __dirname = path.dirname(new URL(_scriptDir).pathname);
// const scriptDirectory = __dirname + "/";

// function locateFile(_path: string) {
//   return scriptDirectory + _path;
// }

let readyPromiseResolve: (value: unknown) => void;
let readyPromiseReject: (reason?: any) => void;
new Promise(function (resolve, reject) {
  readyPromiseResolve = resolve;
  readyPromiseReject = reject;
});

// function shell_read(filename: string, binary: boolean) {
//   filename = path.normalize(filename);
//   return fs.readFileSync(filename, binary ? null : "utf8");
// }

// function readBinary(filename: string) {
//   let ret = shell_read(filename, true) as any;
//   if (!ret.buffer) {
//     ret = new Uint8Array(ret);
//   }
//   assert(ret.buffer);
//   return ret;
// }
class ExitStatus {
  public name: string;
  public message: string;
  public status: any;
  constructor(status: any) {
    this.name = "ExitStatus";
    this.message = "Program terminated with exit(" + status + ")";
    this.status = status;
  }
}

function assert(condition: unknown, text?: string) {
  if (!condition) {
    abort("Assertion failed: " + text);
  }
}

function abort(what: any) {
  what += "";
  err(what);
  SYSTEM_STATUS.ABORT = true;
  SYSTEM_STATUS.EXITSTATUS = 1;
  what = "abort(" + what + "). Build with -s ASSERTIONS=1 for more info.";
  var e = new WebAssembly.RuntimeError();
  readyPromiseReject(e);
  throw e;
}

// process["on"]("unhandledRejection", abort);
// process["on"]("uncaughtException", function (ex) {
//   if (!(ex instanceof ExitStatus)) {
//     throw ex;
//   }
// });

const quit_ = function (status: number, reason: any) {
  console.error(reason);
  // process.exit(status);
};

function getBinaryPromise(wasmBinary: Uint8Array) {
  // const wasmBinaryFileName = "tmp.wasm";
  // const wasmBinaryFile = locateFile(wasmBinaryFileName);

  return Promise.resolve().then(function () {
    // return readBinary(wasmBinaryFile);
    return wasmBinary;
  });
}

interface IModule {
  asm: any;
  _main: any;
}

export class CLangRunner {
  private noExitRuntime = true;
  private wasmMemory?: WebAssembly.Memory;
  private wasmTable?: WebAssembly.Table;
  private __ATINIT__: any[] = [];
  private ___wasm_call_ctors: any;

  private runDependencies = 0;
  private dependenciesFulfilled: any = null;
  private calledRun = false;

  private Module: IModule = {} as IModule;

  private addRunDependency() {
    this.runDependencies++;
  }

  private removeRunDependency() {
    this.runDependencies--;
    if (this.runDependencies === 0) {
      if (this.dependenciesFulfilled) {
        var callback = this.dependenciesFulfilled;
        this.dependenciesFulfilled = null;
        callback();
      }
    }
  }

  private updateGlobalBufferAndViews(
    store: Record<any, any>,
    buf: ArrayBuffer
  ) {
    store["HEAP8"] = new Int8Array(buf);
    store["HEAP16"] = new Int16Array(buf);
    store["HEAP32"] = GlobalHEAP.HEAP32 = new Int32Array(buf);
    store["HEAPU8"] = GlobalHEAP.HEAPU8 = new Uint8Array(buf);
    store["HEAPU16"] = new Uint16Array(buf);
    store["HEAPU32"] = new Uint32Array(buf);
    store["HEAPF32"] = new Float32Array(buf);
    store["HEAPF64"] = new Float64Array(buf);
  }

  private initRuntime() {
    this.callRuntimeCallbacks(this.__ATINIT__);
  }

  private exit(status: number, implicit: any) {
    if (implicit && this.noExitRuntime && status === 0) {
      return;
    }
    if (!this.noExitRuntime) {
      SYSTEM_STATUS.EXITSTATUS = status;
      SYSTEM_STATUS.ABORT = true;
    }
    quit_(status, new ExitStatus(status));
  }

  private callRuntimeCallbacks(callbacks: any[]) {
    while (callbacks.length > 0) {
      const callback = callbacks.shift();
      if (typeof callback == "function") {
        callback(this.Module);
        continue;
      }
      var func = callback.func;
      if (typeof func === "number") {
        if (callback.arg === undefined) {
          this.wasmTable!.get(func)!();
        } else {
          this.wasmTable!.get(func)!(callback.arg);
        }
      } else {
        func(callback.arg === undefined ? null : callback.arg);
      }
    }
  }

  public createWasm(wasmBinary: Uint8Array) {
    function _emscripten_memcpy_big(dest: number, src: number, num: number) {
      GlobalHEAP.HEAPU8.copyWithin(dest, src, src + num);
    }
    const asmLibraryArg = {
      b: _emscripten_memcpy_big,
      a: _fd_write,
    };
    const info = { a: asmLibraryArg };
    const receiveInstance = (instance: WebAssembly.Instance) => {
      const exports = instance.exports;
      this.Module["asm"] = exports;
      // @ts-ignore
      this.wasmMemory = this.Module["asm"]["c"];
      this.updateGlobalBufferAndViews(this.Module, this.wasmMemory!.buffer);
      // @ts-ignore
      this.wasmTable = this.Module["asm"]["f"];
      this.removeRunDependency();
    };
    this.addRunDependency();
    function receiveInstantiatedSource(output: any) {
      receiveInstance(output["instance"]);
    }
    function instantiateArrayBuffer(receiver: any) {
      return getBinaryPromise(wasmBinary)
        .then(function (binary) {
          return WebAssembly.instantiate(binary, info);
        })
        .then(receiver, function (reason) {
          err("failed to asynchronously prepare wasm: " + reason);
          abort(reason);
        });
    }

    instantiateArrayBuffer(receiveInstantiatedSource).catch(readyPromiseReject);
    return {};
  }

  public preRun() {
    this.___wasm_call_ctors = () =>
      // @ts-ignore
      this.Module["asm"]["d"].apply(null, arguments);
    // @ts-ignore
    this.Module["_main"] = () => this.Module["asm"]["e"].apply(null, arguments);

    this.__ATINIT__.push({
      func: () => {
        this.___wasm_call_ctors();
      },
    });

    const runCaller = () => {
      if (!this.calledRun) this.run();
      if (!this.calledRun) this.dependenciesFulfilled = runCaller;
    };
    this.dependenciesFulfilled = runCaller;
  }

  public callMain() {
    var entryFunction = this.Module["_main"];
    var argc = 0;
    var argv = 0;
    try {
      var ret = entryFunction(argc, argv);
      this.exit(ret, true);
    } catch (e) {
      if (e instanceof ExitStatus) {
        return;
      } else if (e == "unwind") {
        this.noExitRuntime = true;
        return;
      } else {
        var toLog = e;
        if (e && typeof e === "object" && e.stack) {
          toLog = [e, e.stack];
        }
        err("exception thrown: " + toLog);
        quit_(1, e);
      }
    }
  }

  public run() {
    if (this.runDependencies > 0) {
      return;
    }

    if (this.calledRun) return;
    this.calledRun = true;
    if (SYSTEM_STATUS.ABORT) return;
    this.initRuntime();
    readyPromiseResolve(this.Module);
    this.callMain();
  }
}

export async function main(wasmBinary: Uint8Array) {
  const runner = new CLangRunner();
  runner.createWasm(wasmBinary);

  let init = false;
  return () => {
    if (init === false) {
      runner.preRun();
      runner.run();
      init = true;
    } else {
      runner.callMain();
    }
  };
}
