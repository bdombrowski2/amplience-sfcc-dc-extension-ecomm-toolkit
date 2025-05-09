#!/usr/bin/env node

const fs = require('fs');

(function patchAmplienceDcIntegrationMiddleware() {
  const path = 'node_modules/@amplience/dc-integration-middleware/dist/codec/codecs/commerce/sfcc/index.js';

  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(/'large'/g, "'gridTileDesktop'");
  fs.writeFileSync(path, content, 'utf8');
})();
