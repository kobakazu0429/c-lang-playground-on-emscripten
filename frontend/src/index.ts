import { templates } from "./template";
import { main } from "./runner";
const sourceCodeArea = document.getElementById("source-code");
const templatesArea = document.getElementById("templates");
const sendButton = document.getElementById("send-button");
const excuteButton = document.getElementById("excute-button");

templatesArea.append(
  ...Object.keys(templates).map((name) => {
    const button = document.createElement("button");
    button.innerText = name;
    button.onclick = () => (sourceCodeArea.value = templates[name]);
    return button;
  })
);

sourceCodeArea.value = templates["simple print value"];

sendButton.addEventListener("click", async (e) => {
  console.log("sending...");
  excuteButton.disabled = true;

  const param = {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({ src: sourceCodeArea.value }),
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
