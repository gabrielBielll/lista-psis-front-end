const fs = require('fs');
const PNG = require('pngjs').PNG;

fs.createReadStream('bruna.png')
  .pipe(new PNG())
  .on('parsed', function() {
    // Top left pixel
    const idx = 0;
    const r = this.data[idx].toString(16).padStart(2, '0');
    const g = this.data[idx+1].toString(16).padStart(2, '0');
    const b = this.data[idx+2].toString(16).padStart(2, '0');
    console.log(`#${r}${g}${b}`.toUpperCase());
  });
