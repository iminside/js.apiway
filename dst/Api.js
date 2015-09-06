"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _HANDLERS;

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x4, _x5, _x6) { var _again = true; _function: while (_again) { var object = _x4, property = _x5, receiver = _x6; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x4 = parent; _x5 = property; _x6 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _nativePromiseOnly = require("native-promise-only");

var _nativePromiseOnly2 = _interopRequireDefault(_nativePromiseOnly);

var _jsPrivate = require("js.private");

var _jsPrivate2 = _interopRequireDefault(_jsPrivate);

var _jsEvent_emitter = require("js.event_emitter");

var _jsEvent_emitter2 = _interopRequireDefault(_jsEvent_emitter);

var _Events = require("./Events");

var Api = (function (_EventEmitter) {
  _inherits(Api, _EventEmitter);

  function Api() {
    _classCallCheck(this, Api);

    _get(Object.getPrototypeOf(Api.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(Api, [{
    key: "connect",
    value: function connect(address) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      this.address = address;
      this.aliveDelay = options.aliveDelay || 0;
      $(this).dispatch();
      return this;
    }
  }, {
    key: "beforeReadyPromise",
    value: function beforeReadyPromise(callback) {
      $(this).beforeReadyPromiseCallback = callback;
      return this;
    }
  }, {
    key: "send",
    value: function send(event) {
      var data = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      if ($(this).dispatcher.readyState === $(this).dispatcher.OPEN) $(this).dispatcher.send(JSON.stringify({ event: event, data: data }));
      return this;
    }
  }, {
    key: "query",
    value: function query(to) {
      var params = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var _to$split = to.split(".");

      var _to$split2 = _slicedToArray(_to$split, 2);

      var name = _to$split2[0];
      var action = _to$split2[1];
      var callbacks = {};
      var query_id = $(this).journal.push(callbacks) - 1;
      this.send(_Events.API.QUERY, { name: name, action: action, params: params, query_id: query_id });
      return new _nativePromiseOnly2["default"](function (resolve, reject) {
        var _ref = [resolve, reject];
        callbacks.success = _ref[0];
        callbacks.failure = _ref[1];
      });
    }
  }, {
    key: "disconnect",
    value: function disconnect() {
      $(this).dispatcher.close();
      return this;
    }
  }, {
    key: "onReady",
    value: function onReady(callback, context) {
      this.on(_Events.API.READY, callback, context);
      return this;
    }
  }, {
    key: "oneReady",
    value: function oneReady(callback, context) {
      this.one(_Events.API.READY, callback, context);
      return this;
    }
  }, {
    key: "offReady",
    value: function offReady(callback, context) {
      this.off(_Events.API.READY, callback, context);
      return this;
    }
  }, {
    key: "onUnready",
    value: function onUnready(callback, context) {
      this.on(_Events.API.UNREADY, callback, context);
      return this;
    }
  }, {
    key: "oneUnready",
    value: function oneUnready(callback, context) {
      this.one(_Events.API.UNREADY, callback, context);
      return this;
    }
  }, {
    key: "offUnready",
    value: function offUnready(callback, context) {
      this.off(_Events.API.UNREADY, callback, context);
      return this;
    }
  }]);

  return Api;
})(_jsEvent_emitter2["default"]);

var $ = (0, _jsPrivate2["default"])({

  dispatcher: null,
  journal: [],
  aliveTimer: 0,
  reconnectDelay: 0,

  beforeReadyPromiseCallback: function beforeReadyPromiseCallback() {
    return _nativePromiseOnly2["default"].resolve();
  },

  dispatch: function dispatch(e) {
    $(this).dispatcher = new WebSocket(this.address);
    $(this).dispatcher.onopen = $(this).onOpen;
    $(this).dispatcher.onclose = $(this).onClose;
    $(this).dispatcher.onerror = $(this).onError;
    $(this).dispatcher.onmessage = $(this).onMessage;
  },

  onOpen: function onOpen(e) {
    var _this = this;

    console.info("Api connected to \"" + this.address + "\"");
    $(this).reconnectDelay = 0;
    $(this).callHandler(_Events.API.ALIVE);
    var beforeReadyPromise = $(this).beforeReadyPromiseCallback();
    if (beforeReadyPromise instanceof _nativePromiseOnly2["default"]) {
      beforeReadyPromise.then(function (e) {
        _this.trigger(_Events.API.READY, e);
      }, function (e) {
        _this.trigger(_Events.API.UNREADY, e);
      });
    } else console.warn("BeforeReadyPromise must be return instance of Promise");
  },

  onError: function onError(e) {
    console.warn("Api connection error");
    this.trigger(_Events.API.ERROR, e);
  },

  onClose: function onClose(e) {
    console.warn("Api disconnected from \"" + this.address + "\"");
    setTimeout($(this).dispatch.bind(this), $(this).reconnectDelay * 100);
    $(this).reconnectDelay += 1;
    this.trigger(_Events.API.DISCONNECT, e);
  },

  onMessage: function onMessage(e) {
    var message = JSON.parse(e.data);
    $(this).callHandler(message.event, message.data);
  },

  callHandler: function callHandler(event, args) {
    var handler = HANDLERS[event];
    if (handler) handler.call(this, args);
  }

});

var HANDLERS = (_HANDLERS = {}, _defineProperty(_HANDLERS, _Events.API.ALIVE, function (data) {
  var _this2 = this;

  if ($(this).aliveTimer) clearTimeout($(this).aliveTimer);
  if (this.aliveDelay) $(this).aliveTimer = setTimeout(function () {
    $(_this2).aliveTimer = null;_this2.send(_Events.API.ALIVE);
  }, this.aliveDelay);
}), _defineProperty(_HANDLERS, _Events.API.SUCCESS, function (data) {
  $(this).journal[data.query_id].success.call(this, data.result);
  delete $(this).journal[data.query_id];
}), _defineProperty(_HANDLERS, _Events.API.FAILURE, function (data) {
  $(this).journal[data.query_id].failure.call(this, data.result);
  delete $(this).journal[data.query_id];
}), _defineProperty(_HANDLERS, _Events.API.TRIGGER, function (data) {
  this.trigger.apply(this, data.args);
}), _HANDLERS);

exports["default"] = new Api();
module.exports = exports["default"];
