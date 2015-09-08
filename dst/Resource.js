"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _HANDLERS;

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _jsPrivate = require("js.private");

var _jsPrivate2 = _interopRequireDefault(_jsPrivate);

var _jsEvent_emitter = require("js.event_emitter");

var _jsEvent_emitter2 = _interopRequireDefault(_jsEvent_emitter);

var _Api = require("./Api");

var _Api2 = _interopRequireDefault(_Api);

var _Events = require("./Events");

var nextId = 0;

var Resource = (function (_EventEmitter) {
  _inherits(Resource, _EventEmitter);

  function Resource(name) {
    var params = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, Resource);

    _get(Object.getPrototypeOf(Resource.prototype), "constructor", this).call(this);
    $(this).id = nextId++;
    $(this).name = name;
    $(this).params = params;
    $(this).data = null;
    $(this).switchHandlersTo("on");
    $(this).sync();
  }

  _createClass(Resource, [{
    key: "get",
    value: function get(name) {
      return $(this).params[name];
    }
  }, {
    key: "set",
    value: function set(params) {
      var isChanged = false;
      for (name in params) {
        if (!params.hasOwnProperty(name) || $(this).params[name] == params[name]) continue;
        $(this).params[name] = params[name];
        isChanged = true;
      }
      if (isChanged) $(this).sync();
      return this;
    }
  }, {
    key: "unset",
    value: function unset(name) {
      delete $(this).params[name];
      $(this).sync();
      return this;
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.off();
      $(this).switchHandlersTo("off");
      _Api2["default"].send(_Events.RESOURCE.DESTROY, { id: $(this).id });
      $.destroy(this);
      return this;
    }
  }, {
    key: "onChange",
    value: function onChange(callback, context) {
      this.on(_Events.RESOURCE.CHANGE, callback, context);
      return this;
    }
  }, {
    key: "oneChange",
    value: function oneChange(callback, context) {
      this.one(_Events.RESOURCE.CHANGE, callback, context);
      return this;
    }
  }, {
    key: "offChange",
    value: function offChange(callback, context) {
      this.off(_Events.RESOURCE.CHANGE, callback, context);
      return this;
    }
  }, {
    key: "onError",
    value: function onError(callback, context) {
      this.on(_Events.RESOURCE.ERROR, callback, context);
      return this;
    }
  }, {
    key: "oneError",
    value: function oneError(callback, context) {
      this.one(_Events.RESOURCE.ERROR, callback, context);
      return this;
    }
  }, {
    key: "offError",
    value: function offError(callback, context) {
      this.off(_Events.RESOURCE.ERROR, callback, context);
      return this;
    }
  }, {
    key: "name",
    get: function get() {
      return $(this).name;
    }
  }, {
    key: "data",
    get: function get() {
      return $(this).data;
    }
  }]);

  return Resource;
})(_jsEvent_emitter2["default"]);

var $ = (0, _jsPrivate2["default"])({

  id: null,
  name: null,
  params: null,
  data: null,
  jsonData: '',

  switchHandlersTo: function switchHandlersTo(method) {
    _Api2["default"][method](_Events.API.READY, HANDLERS[_Events.API.READY], this);
    _Api2["default"][method](_Events.RESOURCE.SYNC, HANDLERS[_Events.RESOURCE.SYNC], this);
  },

  sync: function sync() {
    var id = $(this).id;
    var name = $(this).name;
    var params = $(this).params;

    _Api2["default"].send(_Events.RESOURCE.SYNC, { id: id, name: name, params: params });
  },

  applyDataPatch: function applyDataPatch(patch) {
    var _patch = _slicedToArray(patch, 2);

    var del = _patch[0];
    var add = _patch[1];
    var jsonDataArr = $(this).jsonData.split("");
    for (var index in del) {
      jsonDataArr.splice(index, del[index]);
    }for (var index in add) {
      Array.prototype.splice.apply(jsonDataArr, [index, 0].concat(add[index].split("")));
    }var jsonData = jsonDataArr.join("");
    $(this).jsonData = jsonData;
    $(this).replaceData(JSON.parse(jsonData));
  },

  applyDataFull: function applyDataFull(data) {
    $(this).jsonData = JSON.stringify(data);
    $(this).replaceData(data);
  },

  replaceData: function replaceData(data) {
    $(this).data = data;
    this.trigger(_Events.RESOURCE.CHANGE);
  }

});

var HANDLERS = (_HANDLERS = {}, _defineProperty(_HANDLERS, _Events.API.READY, function (data) {
  $(this).sync.call(this);
}), _defineProperty(_HANDLERS, _Events.RESOURCE.SYNC, function (data) {
  if (data.id == $(this).id) {
    if (data.patch) $(this).applyDataPatch(data.patch);else if (data.full) $(this).applyDataFull(data.full);else if (data.error) this.trigger(_Events.RESOURCE.ERROR, data.error);
  }
}), _HANDLERS);

exports["default"] = Resource;
module.exports = exports["default"];
