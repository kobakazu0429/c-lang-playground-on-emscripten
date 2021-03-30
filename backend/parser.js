// import * as fs from "fs/promises";
// import { Parser } from "acorn";
const fs = require("fs/promises");
const { Parser } = require("acorn");

module.exports = async function () {
  const raw = await fs.readFile("user.mjs", "utf8");
  // console.log(raw);
  const parsed = Parser.parse(raw, { ecmaVersion: "latest", sourceType: "module" });
  const bodys = parsed.body[0].declarations[0].init.callee.body.body[1].argument.body.body;
  const result = {};

  bodys.forEach(body => {
    if (body.declarations) {
      if (body.declarations[0].id.name === "asmLibraryArg") {
        result.asmLibraryArg = body.declarations[0].init.properties.map(({ key, value }) => ({ key: key.value, value: value.name }));
      }
    }
  });

  // console.log(JSON.stringify(result, null, 2));
  return result;
}
