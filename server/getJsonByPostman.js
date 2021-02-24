var extend = require("node.extend");

var obj2StrParams = function (obj) {
  var param = [];

  for (var prop in obj) {
    param.push(prop + "=" + encodeURIComponent(obj[prop]));
  }

  return param.join("&");
};

module.exports = function (mock2easy, callback, postman, req) {
  var http;

  var options = {
    host: postman.getDomain(req),
    port: postman.port,
    path: req.originalUrl,
    method: req.method,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      cookie: postman.Cookie,
    },
  };

  if (postman.protocol == "https") {
    http = require("https");
    // 如果是https 忽略证书
    options.rejectUnauthorized = false;
  } else {
    http = require("http");
  }

  var _write = obj2StrParams(extend(true, {}, req.body, postman.parameter));

  if (req.method == "POST") {
    options.headers["Content-Length"] = _write ? _write.length : 0;
  }

  var _req = http.request(options, function (_res) {
    var data = "";
    _res.on("data", function (chunk) {
      data += chunk;
    });
    _res.on("end", function () {
      callback(null, data);
    });
  });

  _req.on("error", function (e) {
    mock2easy.log(e);
  });

  if (req.method == "POST" && _write) {
    _req.write(_write);
  }

  _req.end();
};
