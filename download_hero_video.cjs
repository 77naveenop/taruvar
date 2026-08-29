const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const candidateUrls = [
  'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c2/Time_lapse_of_mung_beans_germination_and_growth.webm/Time_lapse_of_mung_beans_germination_and_growth.webm.480p.vp9.webm',
  'https://ia802808.us.archive.org/17/items/PlantGrowth_201601/PlantGrowth.mp4',
  'https://ia600300.us.archive.org/21/items/PlantGrowthTimeLapse/PlantGrowthTimeLapse_512kb.mp4'
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          const stats = fs.statSync(dest);
          if (stats.size > 50000) {
            resolve(stats.size);
          } else {
            reject(new Error('File too small'));
          }
        });
      });
    });
    req.on('error', reject);
    req.setTimeout(25000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function run() {
  const dest = path.join(__dirname, 'public', 'hero-tree.mp4');
  for (const url of candidateUrls) {
    try {
      console.log(`Trying: ${url}`);
      const size = await download(url, dest);
      console.log(`Successfully downloaded hero video! Size: ${(size / (1024 * 1024)).toFixed(2)} MB`);
      process.exit(0);
    } catch (err) {
      console.log(`Failed ${url}: ${err.message}`);
    }
  }
  console.log('All candidate URLs failed.');
}

run();
