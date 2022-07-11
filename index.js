const ChromeLauncher = require("chrome-launcher");
const debounce = require("debounce");
const chc = require("chrome-har-capturer");
const express = require("express");
const compression = require("compression");
const bodyParser = require("body-parser");

const app = express();
const port = 5678;

app.set("view engine", "pug");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(compression());

let runner = null;
const killChromeDebounced = debounce(async () => {
  await ChromeLauncher.killAll();
  runner = null;
}, 1000 * 60 * 2);

async function ensureChromeAndRun(url, options) {
  if (!runner) {
    const opts = { chromeFlags: ["--headless", "--no-first-run"] };
    runner = await ChromeLauncher.launch(opts);
  }
  killChromeDebounced();
  return chc.run([url], { port: runner.port, ...options });
}

app.use("/api", async (req, res) => {
  const url = req.body.url;
  if (!url) {
    return res.status(404).send("missing url");
  }
  const filterMT = req.body.filterMimeType;
  const wait = parseInt(req.body.wait);
  const postHook = wait
    ? () => new Promise((r) => setTimeout(r, wait))
    : undefined;
  const r = await ensureChromeAndRun(url, { content: true, postHook });
  r.on("har", (har) => {
    const filtered = har.log.entries.filter((e) => {
      if (!filterMT) {
        return true;
      }
      return e.response.content.mimeType
        .toLowerCase()
        .includes(filterMT.toLowerCase());
    });
    res.render("har", { data: filtered });
  });
});

app.get("/", (req, res) => res.render("index", { chromeRunning: !!runner }));

// 500
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("500");
});
// 404
app.use((req, res, next) => {
  res.status(404).send("404");
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Example app listening on http://localhost:${port}`);
});
