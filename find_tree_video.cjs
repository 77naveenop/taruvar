const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Tree sprouting & growing time-lapse videos (seedling -> branch -> tree)
const candidateUrls = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/person-bicycle-car-detection.mp4'
];

// Let's search and test reliable tree growth videos from open Wikimedia Commons / public domain archives
