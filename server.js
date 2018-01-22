// 导入模块
const http = require("http");
const url = require('url');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

// 定义待解析文档类型json
const types = {
    "css": "text/css",
    "gif": "image/gif",
    "html": "text/html",
    "ico": "image/x-icon",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "js": "text/javascript",
    "json": "application/json",
    "pdf": "application/pdf",
    "png": "image/png",
    "svg": "image/svg+xml",
    "swf": "application/x-shockwave-flash",
    "tiff": "image/tiff",
    "txt": "text/plain",
    "wav": "audio/x-wav",
    "wma": "audio/x-ms-wma",
    "wmv": "video/x-ms-wmv",
    "xml": "text/xml"
};
// 定义动态路由json
const routes = {
    "/login/check": (req, res) => {
        res.writeHead(200, {"content-type":"text/html; charset=utf-8"});
        res.write("<h1>信息已输出到控制台</h1>");
        console.log(req.body);
        res.end();
    },
    "/register": (req,res) => {
        res.writeHead(200, {"content-type":"text/html; charset=utf-8"});
        res.write("<h1>注册界面</h1>");
        console.log(req.body);
        res.end();
    },
    "/a": (req, res) => {
        res.writeHead(200, {"content-type":"text/html; charset=utf-8"});
        res.write("/a");
        console.log(req.body);
        res.end();
    }
}

// 创建服务器
const server = http.createServer((req, res) => {
    parseRoute(req, res);
});
server.listen(8000, "127.0.0.1");
console.log("Server running at http://127.0.0.1:8000");

// 解析静态路由
const parseStaticRoute = (staticRoute, req, res) => {
    let urlObj = url.parse(req.url);
    if(urlObj.pathname === "/"){
        urlObj.pathname +="index.html";
    }
    let filePath = path.join(staticRoute, urlObj.pathname);
    fs.readFile(filePath, "binary", (err, fileContent) => {
        if(err){
            res.writeHead(404, {"content-type":"text/html; charset=utf-8"});
            res.write("<h1>资源未找到</h1>");
            res.end();
        }else{
            let fileSuffix = path.extname(filePath).slice(1);
            let contentType = types[fileSuffix] || "text/plain";
            res.writeHead(200, {"content-type": contentType});
            res.write(fileContent, "binary");
            res.end();
        }
    });
}

// 解析动态路由
const parseDynaRoute = (req, res, urlObj, func) => {
    req.body = {};
    if(req.method.toUpperCase() === "GET"){
        req.body = urlObj.query;
        func(req, res);
    }else{
        let str = "";
        req.on("data", (chunk) => {
            str += chunk.toString();
        });
        req.on("end", () => {
            // querystring.parse()方法会把一个字符串解析成一个键值对的集合
            req.body = querystring.parse(str);
            func(req, res);
        });
    }
}

// 解析路由
const parseRoute = (req, res) =>{
    let urlObj = url.parse(req.url, true);
    let handleFunc = routes[urlObj.pathname];
    if(handleFunc && handleFunc !== "undefined"){
        parseDynaRoute(req, res, urlObj, handleFunc);
    }else{
        parseStaticRoute(__dirname, req, res);
    }
}
