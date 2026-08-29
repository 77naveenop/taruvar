const https = require('https');

const candidateUrls = [
  'https://raw.githubusercontent.com/bower-media-samples/big-buck-bunny-1080p-30fps/master/video.mp4',
  'https://raw.githubusercontent.com/scenaristeur/social-network/master/video/tree.mp4',
  'https://assets.codepen.io/3364143/7bbf8e0e20c023990527829534007219.mp4',
  'https://assets.codepen.io/6093409/river.mp4',
  'https://res.cloudinary.com/demo/video/upload/sprout.mp4',
  'https://res.cloudinary.com/demo/video/upload/tree.mp4'
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    }, (res) => {
      resolve({ url, status: res.statusCode, type: res.headers['content-type'], length: res.headers['content-length'] });
    }).on('error', (e) => resolve({ url, error: e.message }));
  });
}

async function run() {
  for (const u of candidateUrls) {
    const res = await checkUrl(u);
    console.log(JSON.stringify(res));
  }
}

run();
