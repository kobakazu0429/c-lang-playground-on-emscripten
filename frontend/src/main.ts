import { templates } from "./template";
import { Waface } from "./wasface/index";

const sourceCodeArea = document.getElementById(
  "source-code"
) as HTMLTextAreaElement;
const templatesArea = document.getElementById("templates") as HTMLDivElement;
const sendButton = document.getElementById("send-button") as HTMLButtonElement;
const excuteButton = document.getElementById(
  "excute-button"
) as HTMLButtonElement;

templatesArea.append(
  ...Object.keys(templates).map((name) => {
    const button = document.createElement("button");
    button.innerText = name;
    button.onclick = () => (sourceCodeArea.value = templates[name]);
    return button;
  })
);

// sourceCodeArea.value = templates["simple print value"];
sourceCodeArea.value = templates.scanf;

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
  const { result, data } = await (
    await fetch("http://localhost:3000/c2wasm", param)
  ).json();

  console.log("compiled !");

  console.log(result);
  console.log(data);

  const app = new Waface();

  Object.keys(result).forEach((key) => {
    app.set(key, result[key]);
  });

  excuteButton.disabled = false;

  excuteButton.addEventListener("click", () => {
    console.log("excuting...");
    // @ts-ignore
    app.init(Uint8Array.from(data.data));
  });
});
