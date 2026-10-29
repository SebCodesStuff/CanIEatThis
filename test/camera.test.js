import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { attachOpenCamera, showCapturedPhoto } from "../docs/app.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const pagePath = path.join(root, "docs", "index.html");

function readPage() {
  return fs.readFileSync(pagePath, "utf8");
}

test("page has an Open camera button wired to the phone camera", () => {
  const html = readPage();

  assert.match(html, /<button[^>]*id="open-camera"[^>]*>\s*Open camera\s*<\/button>/);
  assert.match(html, /<input[^>]*id="camera-input"[^>]*>/);
  assert.match(html, /id="camera-input"[^>]*type="file"/);
  assert.match(html, /id="camera-input"[^>]*accept="image\/\*"/);
  assert.match(html, /id="camera-input"[^>]*capture="environment"/);
  assert.match(html, /<script[^>]*type="module"[^>]*src="app\.js"/);
});

test("clicking the button opens the camera input", () => {
  let opened = false;
  const button = {
    addEventListener(type, handler) {
      assert.equal(type, "click");
      this.handler = handler;
    },
  };
  const input = {
    click() {
      opened = true;
    },
  };

  attachOpenCamera(button, input);
  button.handler();

  assert.equal(opened, true);
});

test("a captured photo is shown in the preview", () => {
  const preview = { hidden: true, src: "", alt: "" };
  const file = { type: "image/jpeg" };

  showCapturedPhoto(preview, file, () => "blob:photo");

  assert.equal(preview.hidden, false);
  assert.equal(preview.src, "blob:photo");
});
