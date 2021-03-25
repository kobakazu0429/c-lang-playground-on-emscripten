import { main } from "./runner";
const sourceCodeArea = document.getElementById("source-code");
const sendButton = document.getElementById("send-button");
const excuteButton = document.getElementById("excute-button");

const templateCode = `#include <stdio.h>

int main() {
  int a = 429;
  float b = 3.141592;
  char c = 'A';
  char d[] = "Hello, World!";

  printf("%d\\n", a);
  printf("%04d\\n", a);
  printf("%f\\n", b);
  printf("%3.2f\\n", b);
  printf("%c\\n", c);
  printf("%s\\n", d);
  return 0;
}`;
sourceCodeArea.textContent = templateCode;

sendButton.addEventListener("click", async () => {
  console.log("sending...");
  const param = {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({ src: sourceCodeArea.textContent }),
  };
  const res = await fetch("http://localhost:3000/c2wasm", param);
  const binary = await res.arrayBuffer();
  const runner = await main(new Uint8Array(binary));
  excuteButton.disabled = false;

  excuteButton.addEventListener("click", () => {
    console.log("excuting...");
    runner();
  });
});
