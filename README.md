# ShareSlide
ShareSlide is a typescript based cli-app for downloading slides from [Slideshare](https://www.slideshare.net/).
It can download slides without logging in. Images of each page is downloaded and then exported to required format.

## Supported formats:
  - jpg
  - ppt
  - pdf(coming soon)
  - docx(coming soon)

## Installation
Shareslide requires [Node.js](https://nodejs.org/) to run.
```sh
$ npm install -g shareslide
```
## Usage
```sh
$ shareslide -l https://slideshare.net/somerandomslide
```

## Argument list

| Argument | Default | Values |Description |
| ------ | ------ | ------ | ------ |
| -l | - | Slideshare URL | URL of the slide |
| -q | medium | low, medium, high|Resolution of image to download |
| -p | Current working directory | relative path |Download path |
| -f | jpg | jpg, pptx, pdf|Format for export |
| -c | 5 | n |Number of concurrent downloads |


## Todo

 - Add more export formats
 - Delete temp images after export

## Limitations
Slide is downloaded as an image so text cannot be selected or copied form the exported file. 
## License
MIT


**Free Software, Hell Yeah!**
