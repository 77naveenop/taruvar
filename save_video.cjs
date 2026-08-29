const https = require('https');
const fs = require('fs');
const path = require('path');

const url = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
const dest = path.join(__dirname, 'public', 'hero-tree.mp4');

const file = fs.createWriteStream(dest);
https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  res.pipe(file);
  file.on('finish', () => {
    file.close(() => {
      const stats = fs.statSync(dest);
      console.log(`Downloaded hero-tree.mp4 successfully! Size: ${(stats.size / 1024).toFixed(1)} KB`);
    });
  });
}).on('error', (err) => {
  console.error(err.message);
});
