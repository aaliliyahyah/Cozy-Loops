const fs = require('node:fs');
const path = require('node:path');
const worker = require.resolve('pdfjs-dist/build/pdf.worker.min.mjs');
fs.mkdirSync(path.resolve('public'), { recursive: true });
fs.copyFileSync(worker, path.resolve('public/pdf.worker.min.mjs'));
