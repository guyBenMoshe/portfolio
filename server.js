const http = require("http");
const fs = require("fs");
const path = require("path");

/*
  A simple static file server for the personal portfolio.  This server
  listens on the port specified by the PORT environment variable (or 3000
  by default) and serves files from the ./public folder.  It does not
  include any backend processing for uploads; all upload functionality
  happens entirely in the browser via the FileReader API and localStorage.

  You can start the server with `node server.js`.  Then visit
  http://localhost:3000/ in your browser to view the portfolio.
*/

const publicDir = path.join(__dirname, "public");

const mimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
};

const server = http.createServer((req, res) => {
  // Strip query parameters and normalise the URL
  let filePath = decodeURIComponent(req.url.split("?")[0]);
  if (filePath === "/" || filePath === "") {
    filePath = "/index.html";
  }
  const fullPath = path.join(publicDir, filePath);
  fs.stat(fullPath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.statusCode = 404;
      res.end("Not found");
      return;
    }
    const ext = path.extname(fullPath).toLowerCase();
    const contentType = mimeTypes[ext] || "application/octet-stream";
    res.statusCode = 200;
    res.setHeader("Content-Type", contentType);
    const stream = fs.createReadStream(fullPath);
    stream.pipe(res);
    stream.on("error", () => {
      res.statusCode = 500;
      res.end("Internal server error");
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Portfolio server is running at http://localhost:${PORT}/`);
});
