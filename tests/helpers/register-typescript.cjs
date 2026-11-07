const ts = require('typescript');
const fs = require('node:fs');
const Module = require('node:module');
// Compile only our pure TypeScript modules; no React Native runtime is needed.
Module._extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, filename);
