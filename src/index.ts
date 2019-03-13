import commandLineArgs = require('command-line-args');
const pptxgenjs = require('pptxgenjs');
import * as path from 'path';
import { eachOfLimit} from 'async';
import * as https from 'https';
import * as fs from 'fs';
import * as cheerio from 'cheerio';
let quality = 638;
let directory = path.dirname(process.argv[1]);
let title = 'shareslide';
const supportedFormats = ['jpg', 'ppt'];
let format = 'jpg';
let tempFolder = '';
let files: string[] = [];
const options = [{
  name: 'quality',
  alias: 'q',
  type: String
 },
 {
  name: 'link',
  alias: 'l',
  type: String
 },
 {
  name: 'path',
  alias: 'p',
  type: String
 },
 {
  name: 'format',
  alias: 'f',
  type: String
 }
];
const args = commandLineArgs(options);

if (!(args.link && args.link.substring(0, 27) === "https://www.slideshare.net/")) {
 console.log("Specify slideshare URL");
 process.exit(1);
} else {
 if (args.path) {
  directory = path.join(path.dirname(process.argv[1]), args.path);
  console.log(directory);
  try {
   fs.statSync(directory);
  } catch (err) {
   if (err.code === 'ENOENT') {
    console.log("Invalid directory");
    process.exit(1);
   }
  }
 }
}

if (args.quality) {
 switch (args.quality) {
  case 'low':
   quality = 320;
   break;
  case 'medium':
   quality = 638;
   break;
  case 'high':
   quality = 1024;
   break;
  default:
   console.log("Specify quality as low, medium or high");
   process.exit(1);
   break;
 }
}

if (supportedFormats.includes(args.format)) {
  format = args.format;
} else {
  console.error(`Currently supported formats: ${supportedFormats}`);
  process.exit(1);
}

async function download() {
  return new Promise((resolve, reject) => {

 fs.mkdtemp(path.join(directory, title), (err, folder) => {
  if (err) {
   console.log(err);
  }
  if (folder) {
    tempFolder = folder;
    
   const req = https.get('https://www.slideshare.net/vtunotesbysree/vtu-5th-sem-cse-operating-systems-notes-10cs53', (res) => {
    res.setEncoding("utf8");
    let chunks = "";
    res.on("data", (chunk: any) => {
     chunks += chunk;
    });
    res.on("end", (chunk: any) => {
     const $ = cheerio.load(chunks);
     title = $("title").text();
     $("#svPlayerId").filter((index: number, element: CheerioElement) => {
      const data = $(element);
      const end = parseInt(data.find("#total-slides").text());
      const link = data.find(".slide_image").first().attr("data-full").split('1-1024.jpg')[0];
      for (let i = 1; i <= end; i++) {
       files.push(`${link}${i}-${quality}.jpg`);
      }
      eachOfLimit(files, 5, httpRequest, () => {
       console.log("Download complete");
       resolve(true);
      });
      return true;
     });
     req.end();
    });
   });
  }
 });
  });
}

async function httpRequest(url: any, index: any, callback: any) {
 return new Promise(function(resolve, reject) {
  try{
  let req = https.request(`${url}${index}-638.jpg`, (res) => {
   console.log("requesting: " + index);
   // reject on bad status
   /*  if (res.statusCode < 200 || res.statusCode >= 300) {
         return reject(new Error('statusCode=' + res.statusCode));
     }*/
   let file = fs.createWriteStream(path.join(tempFolder,`${index}.jpg`));
   res.pipe(file);
   file.on('finish', () => {
    file.close();
    resolve();
    callback();
   });
  });
  // reject on request error
  req.on('error', (err) => {
   // This is not a "Second reject", just a different sort of failure
   reject(err);
  });
  req.end();
} catch(err) {
  console.log(err);  
}
 });
}

function stitchPPT() {
  const pptx = new pptxgenjs();
  for (let i=0;i<files.length;i++) {
    pptx.addNewSlide().addImage({path: tempFolder+'/'+i+'.jpg',w: 10, h: 6});
  }
  pptx.save(title.substr(0, 250));
}

async function start() {
  if(await download()) {
    switch (format) {
      case 'ppt': stitchPPT();
        console.log("PPT Generated");
        break;
    
      default:  console.log('Done');      
        break;
    }
    
  }
}

start();