var http = require("http"),
    events = require("events"),
    path = require("path"),
    fs = require("fs"),
    util = require("util"),
    querystring = require('querystring'),
    crypto = require("crypto"),
    
    mime = require("./mime");

var Client = function () {};

/**
 * 
 * Type String
 * 
 * ------WebKitFormBoundaryBsuAv42gP0sS94Dt
 * Content-Disposition: form-data; name="test"
 * 
 * test
 * ------WebKitFormBoundaryBsuAv42gP0sS94Dt--
 * 
 * 
 * Type File
 * 
 * ------WebKitFormBoundaryvs0eA03BhgptJOgX
 * Content-Disposition: form-data; name="test"; filename="secondarytile.png"
 * Content-Type: image/png
 *
 * rtwertwertwertwertwertwertwertwertwertwertwertwertwertwertwertwertwertwert
 * ------WebKitFormBoundaryvs0eA03BhgptJOgX--
 * 
 * 
 */
Client.prototype.createPostBodyFormData = function (data) {
    
    var promise = new events.EventEmitter();
    
    if (Object.keys(data).length <= 0) {
        setTimeout(function() {
            promise.emit("success", "", "");
        }, 0);
    } else {    
        crypto.randomBytes(16, function(ex, buf) {
            var key,
                value,
                body = [],
                boundary = "----" + buf.toString('hex');
                
            for (key in data) {
                value = data[key];
                
                if (typeof value == "object" && value.type == "file") {
                    var filepath = path.join(process.cwd(), 'test/fixtures/', value.filename),
                        content = fs.readFileSync(filepath),
                        fileExtension = path.extname(value.filename).slice(1).toLowerCase();
                        
                    body.push(util.format("--%s\r\n", boundary));
                    body.push(util.format('form-data; name="%s"; filename="%s"' + "\r\n", key, value.filename));
                    body.push(util.format('Content-Type: %s' + "\r\n\r\n", mime.contentTypes[fileExtension] || 'application/octet-stream'));
                    body.push(content + "\r\n");
                    
                } else {
                    body.push(util.format("--%s\r\n", boundary));
                    body.push(util.format('Content-Disposition: form-data; name="%s"' + "\r\n\r\n", key));
                    body.push(value + "\r\n");
                }
            }
        
            body.push("--" + boundary + "--\r\n");
            
            console.log(body.join(""));
        
            promise.emit("success", body.join(""), boundary);
        });
    }
    return promise;
};

Client.prototype.createPostBodyUrledcoded = function (data) {
    
    var promise = new events.EventEmitter();
    
    setTimeout(function() {
        promise.emit("success", querystring.stringify(data));
    }, 0);
    
    return promise;
};

Client.prototype.get = function(path, callback) {
    http.request({ host: process.env.IP, port: process.env.PORT, method: "GET", path: path}, function(response) {
        callback.apply(this, [null, response]);
    }).end();
};

Client.prototype.post = function (path, data, type, callback) {
    var _data = type == "form-data" ? this.createPostBodyFormData(data) : this.createPostBodyUrledcoded(data);
    
    _data.on("success", function (postBody, boundary) {
        
        var headers = { 'Content-Length': 0 }
        
        if (type == "form-data") {        
            headers = postBody ? {
                'Content-Type': 'multipart/form-data; boundary=' + boundary,
                'Content-Length': Buffer.byteLength(postBody, 'utf8') 
            } : headers;
        } else {
            headers = postBody ? {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postBody, 'utf8') 
            } : headers;
        }
        
        var request = http.request({ 
            host: process.env.IP,
            port: process.env.PORT,
            method: "POST",
            path: path,
            headers: headers
        }, function(response) {
            callback.apply(this, [null, response]);        
        });
        
        if (postBody) {
            request.end(postBody);
        } else {
            request.end();
        }
    });
};

Client.prototype.head = function (path, callback) {
    http.request({ host: process.env.IP, port: process.env.PORT, method: "HEAD", path: path}, function(response) {
        callback.apply(this, [null, response]);
    }).end();
};

Client.prototype.put = function (path, callback) {
    http.request({ host: process.env.IP, port: process.env.PORT, method: "PUT", path: path}, function(response) {
        callback.apply(this, [null, response]);
    }).end();
};

Client.prototype.delete = function (path, callback) {
    http.request({ host: process.env.IP, port: process.env.PORT, method: "DELETE", path: path}, function(response) {
        callback.apply(this, [null, response]);
    }).end();
};

Client.prototype.patch = function (path, callback) {
    http.request({ host: process.env.IP, port: process.env.PORT, method: "PATCH", path: path}, function(response) {
        callback.apply(this, [null, response]);
    }).end();
};

Client.prototype.put = function (path, callback) {
    http.request({ host: process.env.IP, port: process.env.PORT, method: "PUT", path: path}, function(response) {
        callback.apply(this, [null, response]);
    }).end();
};

Client.prototype.options = function (path, callback) {
    http.request({ host: process.env.IP, port: process.env.PORT, method: "OPTIONS", path: path}, function(response) {
        callback.apply(this, [null, response]);
    }).end();
};

exports.client = new Client();
exports.Client = Client;

