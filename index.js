import { WasmPng, default as init } from "./pkg/wasm_png.js";

const file_input = document.getElementById("file-input");
const file_reader = new FileReader();
file_input.addEventListener("change", () => loadInput(file_input));

async function run() {
  // Initialize the wasm module.
  const wasm = await init("./pkg/wasm_png_bg.wasm");
  const wasm_png = WasmPng.new();

  // Transfer archive data to wasm when the file is loaded.
  file_reader.onload = () =>
    transferContent(file_reader.result, wasm_png, wasm);
}

function loadInput(input) {
  const file = input.files[0];
  file_reader.readAsArrayBuffer(file);
}

// Transfer archive data to wasm when the file is loaded.
function transferContent(arrayBuffer, wasm_png, wasm) {
  console.log("Copying file array buffer into wasm memory ...");
  wasm_png.allocate(arrayBuffer.byteLength);
  const wasm_buffer = new Uint8Array(wasm.memory.buffer);
  const start = wasm_png.memory_pos();
  const file_buffer = new Uint8Array(arrayBuffer);
  wasm_buffer.set(file_buffer, start);
  const t0 = performance.now();
  for (let i = 0; i < 100; i++) {
    wasm_png.decode_png_me();
  }
  const t1 = performance.now();
  for (let i = 0; i < 100; i++) {
    wasm_png.decode_png_me_bis();
  }
  const t2 = performance.now();
  for (let i = 0; i < 100; i++) {
    wasm_png.decode_png();
  }
  const t3 = performance.now();
  console.log("me: " + (t1 - t0) + " milliseconds.");
  console.log("me bis: " + (t2 - t1) + " milliseconds.");
  console.log("png crate: " + (t3 - t2) + " milliseconds.");
}

run();
