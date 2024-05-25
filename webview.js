import { Webview } from "webview-bun";

const index = Bun.file("index.html");
const script = Bun.file("out/tui.js");

const webview = new Webview();
async function init() {
    var html = await index.text();
    var js = await script.text();
    webview.setHTML(html);
    webview.run();
    webview.eval(js);
}

init();
