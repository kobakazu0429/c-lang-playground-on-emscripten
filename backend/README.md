## Backend

so simple server
recieve a source code(c lang) → compile to wasm → send wasm only

### Usage

```
yarn install
yarn start
```

example command

```
$ curl -X POST -H "Content-Type: application/json" -d '{"src":"#include <stdio.h>\n\nint main() {\n  printf(\"Hello, World!\\n\");\n  return 0;\n}\n"}' http://localhost:3000/c2wasm -o user.wasm
```
