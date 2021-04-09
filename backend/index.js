"use strict";

const path = require("path");
const fs = require("fs").promises;
const express = require("express");
const cors = require('cors')
const spawn = require('child_process').spawn;

const parser = require("./parser");

const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cors())

const port = 3000;

const options = [
  "-Oz"
];

const mainCommand = [
  "emcc user.c",
  ...options,
  "-o user.mjs"
]

const compileToWasm = async (src, res) => {
  // console.log(src);
  await fs.writeFile("user.c", src);

  const p = spawn("docker", ["run", "--rm", "-v $(pwd):/src", "-u $(id -u):$(id -g)", "emscripten/emsdk", ...mainCommand], { shell: true });
  p.stdout.on('data', payload => console.log(`[spawn/stdout]: ${payload.toString().trim()}`))
  p.stderr.on('data', payload => console.log(`[spawn/stderr]: ${payload.toString().trim()}`))
  p.on('exit', async exit_code => {
    console.log(`[spawn/exit] ${exit_code}`)
    const [wasm, result] = await Promise.all([
      fs.readFile("user.wasm"),
      parser()
    ]).catch((error) => {
      console.log(error);
      res.status(404).end();
      return;
    });

    console.log(result);
    res.send({ result, data: wasm });
  })
}

app.post("/c2wasm", async (req, res) => {
  const { src } = req.body;
  await compileToWasm(src, res);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
  console.log(`http://localhost:${port}/c2wasm`)
});
