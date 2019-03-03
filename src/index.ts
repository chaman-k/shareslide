import { Observable, from, range} from 'rxjs';
import { concatMap } from 'rxjs/operators';
import commandLineArgs = require('command-line-args');
import path = require('path');
import fs = require('fs');
import axios from 'axios';
import cheerio = require('cheerio');
let quality = 638;
let directory = path.dirname(process.argv[1]);
let format = 'jpg';


const observable1 = Observable.create((observer: any) => {
    observer.next("halo");
    observer.next("world");

});

observable1.subscribe(
    (x: any) => console.log(x)
);

const options = [
    {name: 'quality', alias: 'q', type: String},
    {name: 'link', alias: 'l', type: String},
    {name: 'path', alias: 'p', type: String},
    {name: 'format', alias: 'f', type: String}
  ];
  const args = commandLineArgs(options);
  console.log(args);
  
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
  if (['pdf', 'jpg'].includes(args.format)) {
    format = args.format;
  }
  if (args.quality) {
    switch (args.quality) {
      case 'low': quality = 320;
                  break;
      case 'medium':  quality = 638;
                      break;
      case 'high': quality = 1024;
                   break;
      default:  console.log("Specify quality as low, medium or high");
                process.exit(1);
                break;
    }
  }
  console.log("format: "+ format+ " quality: "+quality+" dir: "+directory);


function dl (link: string, end: number):Observable<any> {
  return from(range(1, end)).pipe(concatMap(id => {
    return Observable.create((observer: any) => {
      console.log("111111: "+link + id + '-' + quality + '.jpg');
      
    axios.get(link + id + '-' + quality + '.jpg',
    {responseType: 'stream'})
    .then((response) => {
      observer.next({res: response.data, id: id});
      observer.complete();
    })
    .catch((err) => {
      observer.error(err);
    })
  });
  }))
}

//const downloader = 
// fs.mkdtemp(path.join(directory, './'), (err, folder) => {
//   if (err) {
//       console.log(err);
//   }
//   if (folder) {
  let link = 'https://image.slidesharecdn.com/vtu5thsemcseoperatingsystemsnotes10cs53-150807221642-lva1-app6892/95/vtu-6th-sem-cse-operating-systems-notes-15cs64-1-1024.jpg';
  link = link.split('1-1024.jpg')[0];  
  dl(link, 50).subscribe( (data) => {
        let file = fs.createWriteStream('./test/'+data.id+'.jpg');
        data.res.pipe(file);
        file.on('finish', () => {
          file.close();      
        });

  
  });
//  }});



/*
dl('https://jsonplaceholder.typicode.com/users/').subscribe( (data) => {
  console.log( '[datadl] => ', data.id);
  });*/

  axios.get(args.link)
.then((response) => {
  //console.log(response);
  return response.data;
})
.then((response) => {
  const $ = cheerio.load(response);
  const title = $("title").text();
  $("#svPlayerId").filter(function (index: number, elem: CheerioElement) {
   // console.log(elem);
    
    var data = $(elem);
    //console.log(new Date().getTime());
    let end = data.find("#total-slides").text();
    let link = data.find(".slide_image").first().attr("data-full");
    console.log(link);    
    //console.log(new Date().getTime());
   //dload(link.split('1-1024')[0], end, title, quality);
   return true;
});
console.log(title);
})
.catch(function (error) {
  console.log(error);
});
/*

function dload(link: string, end: string, title: string, quality: number) {
  console.log("dlload");
  
  const source = range(1, 10);
//output: 1,2,3,4,5,6,7,8,9,10
//const example = source.subscribe(val => console.log(val));

from(range(1, 10)).pipe(
  c
)
.subscribe(val => console.log(val)
);
}
*/