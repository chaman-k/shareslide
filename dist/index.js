#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var commandLineArgs = require("command-line-args");
var pptxgenjs = require('pptxgenjs');
var path = require("path");
var async_1 = require("async");
var https = require("https");
var fs = require("fs");
var cheerio = require("cheerio");
var quality = 638;
var directory = process.cwd();
var title = 'shareslide';
var supportedFormats = ['jpg', 'ppt'];
var format = '';
var tempFolder = '';
var files = [];
var options = [{
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
var args = commandLineArgs(options);
if (!(args.link && args.link.substring(0, 27) === "https://www.slideshare.net/")) {
    console.log("Specify slideshare URL");
    process.exit(1);
}
else {
    if (args.path) {
        directory = path.join(process.cwd(), args.path);
        console.log(directory);
        try {
            fs.statSync(directory);
        }
        catch (err) {
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
if (!args.format) {
    format = 'jpg';
}
else if (supportedFormats.includes(args.format)) {
    format = args.format;
}
else {
    console.error("Currently supported formats: " + supportedFormats);
    process.exit(1);
}
function download() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    fs.mkdtemp(path.join(directory, title), function (err, folder) {
                        if (err) {
                            console.log(err);
                        }
                        if (folder) {
                            tempFolder = folder;
                            var req_1 = https.get(args.link, function (res) {
                                res.setEncoding("utf8");
                                var chunks = "";
                                res.on("data", function (chunk) {
                                    chunks += chunk;
                                });
                                res.on("end", function (chunk) {
                                    var $ = cheerio.load(chunks);
                                    title = $("title").text();
                                    $("#svPlayerId").filter(function (index, element) {
                                        var data = $(element);
                                        var end = parseInt(data.find("#total-slides").text());
                                        var link = data.find(".slide_image").first().attr("data-full").split('1-1024.jpg')[0];
                                        for (var i = 1; i <= end; i++) {
                                            files.push("" + link + i + "-" + quality + ".jpg");
                                        }
                                        async_1.eachOfLimit(files, 5, httpRequest, function () {
                                            console.log("Download complete");
                                            resolve(true);
                                        });
                                        return true;
                                    });
                                    req_1.end();
                                });
                            });
                        }
                    });
                })];
        });
    });
}
function httpRequest(url, index, callback) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    try {
                        var req = https.request("" + url + index + "-" + quality + ".jpg", function (res) {
                            console.log("requesting: " + index);
                            // reject on bad status
                            /*  if (res.statusCode < 200 || res.statusCode >= 300) {
                                  return reject(new Error('statusCode=' + res.statusCode));
                              }*/
                            var file = fs.createWriteStream(path.join(tempFolder, index + ".jpg"));
                            res.pipe(file);
                            file.on('finish', function () {
                                file.close();
                                resolve();
                                callback();
                            });
                        });
                        // reject on request error
                        req.on('error', function (err) {
                            // This is not a "Second reject", just a different sort of failure
                            reject(err);
                        });
                        req.end();
                    }
                    catch (err) {
                        console.log(err);
                    }
                })];
        });
    });
}
function stitchPPT() {
    var pptx = new pptxgenjs();
    for (var i = 0; i < files.length; i++) {
        pptx.addNewSlide().addImage({ path: tempFolder + '/' + i + '.jpg', w: 10, h: 6 });
    }
    pptx.save(title.substr(0, 250));
}
function start() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, download()];
                case 1:
                    if (_a.sent()) {
                        switch (format) {
                            case 'ppt':
                                stitchPPT();
                                console.log("PPT Generated");
                                break;
                            default:
                                console.log('Done');
                                break;
                        }
                    }
                    return [2 /*return*/];
            }
        });
    });
}
start();
