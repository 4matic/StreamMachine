var BaseOutput, RawAudio, _u,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_u = require('underscore');

BaseOutput = require("./base");

module.exports = RawAudio = (function(_super) {
  __extends(RawAudio, _super);

  function RawAudio(stream, opts) {
    var headers;
    this.stream = stream;
    this.opts = opts;
    this.disconnected = false;
    RawAudio.__super__.constructor.call(this, "raw");
    this.pump = true;
    if (this.opts.req && this.opts.res) {
      this.client.offsetSecs = this.opts.req.param("offset") || -1;
      this.opts.res.chunkedEncoding = false;
      this.opts.res.useChunkedEncodingByDefault = false;
      headers = {
        "Content-Type": this.stream.opts.format === "mp3" ? "audio/mpeg" : this.stream.opts.format === "aac" ? "audio/aacp" : "unknown"
      };
      this.opts.res.writeHead(200, headers);
      this.opts.res._send('');
      process.nextTick((function(_this) {
        return function() {
          return _this.stream.startSession(_this.client, function(err, session_id) {
            _this.client.session_id = session_id;
            if (_this.stream.preroll && !_this.opts.req.param("preskip")) {
              _this.stream.log.debug("making preroll request", {
                stream: _this.stream.key
              });
              return _this.stream.preroll.pump(_this.socket, _this.socket, function() {
                return _this.connectToStream();
              });
            } else {
              return _this.connectToStream();
            }
          });
        };
      })(this));
    } else if (this.opts.socket) {
      this.pump = false;
      process.nextTick((function(_this) {
        return function() {
          return _this.connectToStream();
        };
      })(this));
    } else {
      this.stream.log.error("Listener passed without connection handles or socket.");
    }
    this.socket.on("end", (function(_this) {
      return function() {
        return _this.disconnect();
      };
    })(this));
    this.socket.on("close", (function(_this) {
      return function() {
        return _this.disconnect();
      };
    })(this));
    this.socket.on("error", (function(_this) {
      return function(err) {
        _this.stream.log.debug("Got client socket error: " + err);
        return _this.disconnect();
      };
    })(this));
  }

  RawAudio.prototype.disconnect = function() {
    var _ref, _ref1;
    if (!this.disconnected) {
      this.disconnected = true;
      if ((_ref = this.source) != null) {
        _ref.disconnect();
      }
      if (!this.socket.destroyed) {
        return (_ref1 = this.socket) != null ? _ref1.end() : void 0;
      }
    }
  };

  RawAudio.prototype.prepForHandoff = function(cb) {
    delete this.client.offsetSecs;
    return typeof cb === "function" ? cb() : void 0;
  };

  RawAudio.prototype.connectToStream = function() {
    if (!this.disconnected) {
      return this.stream.listen(this, {
        offsetSecs: this.client.offsetSecs,
        offset: this.client.offset,
        pump: this.pump,
        startTime: this.opts.startTime
      }, (function(_this) {
        return function(err, source) {
          var _ref;
          _this.source = source;
          if (err) {
            if (_this.opts.res != null) {
              _this.opts.res.status(500).end(err);
            } else {
              if ((_ref = _this.socket) != null) {
                _ref.end();
              }
            }
            return false;
          }
          _this.client.offset = _this.source.offset();
          return _this.source.pipe(_this.socket);
        };
      })(this));
    }
  };

  return RawAudio;

})(BaseOutput);

//# sourceMappingURL=raw_audio.js.map
