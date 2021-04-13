const fs = require("fs/promises");
const { Parser } = require("acorn");

async function parse() {
  const raw = await fs.readFile("user.mjs", "utf8");
  const parsed = Parser.parse(raw, { ecmaVersion: "latest", sourceType: "module" });
  const bodys = parsed.body[0].declarations[0].init.callee.body.body[1].argument.body.body;
  const result = {
    caller: {},
    wasmRuntime: {}
  };

  bodys.forEach(body => {
    if (body.type === "VariableDeclaration") {
      const target = body.declarations[0];
      const name = target.id.name;
      if (name === "asmLibraryArg") {
        result.asmLibraryArg = target.init.properties.map(({ key, value }) => ({ key: key.value, value: value.name }));
      }

      if (
        name === "___wasm_call_ctors" ||
        name === "stackSave" ||
        name === "stackRestore" ||
        name === "stackAlloc" ||
        name.match(/^_[a-zA-Z0-9]*$/g)
      ) {
        const value = target.init.right.body.body[0].argument.callee.object.right.right.property.value;

        if (
          name === "___wasm_call_ctors" || name === "_main" ||
          name === "stackSave" || name === "stackRestore" || name === "stackAlloc"
        ) {
          result.caller[name] = value;
        } else {
          // maybe user define functions
          result.caller[name.slice(1)] = value;
        }
      }
    }

    if (body.type === "FunctionDeclaration") {
      body.body.body.forEach(body1 => {
        if (!body1.body?.body) return;
        body1.body.body.forEach(body2 => {
          const name = body2?.expression?.left?.name;
          if (name === "wasmTable" || name === "wasmMemory") {
            result.wasmRuntime[name] = body2.expression.right.property.value;
          }
        });
      });
    }
  });

  // console.log(JSON.stringify(result, null, 2));
  return result;
}

// parse()

module.exports = parse;
