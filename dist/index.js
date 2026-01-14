'use strict';

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var eventemitter3 = {exports: {}};

var hasRequiredEventemitter3;

function requireEventemitter3 () {
	if (hasRequiredEventemitter3) return eventemitter3.exports;
	hasRequiredEventemitter3 = 1;
	(function (module) {

		var has = Object.prototype.hasOwnProperty
		  , prefix = '~';

		/**
		 * Constructor to create a storage for our `EE` objects.
		 * An `Events` instance is a plain object whose properties are event names.
		 *
		 * @constructor
		 * @private
		 */
		function Events() {}

		//
		// We try to not inherit from `Object.prototype`. In some engines creating an
		// instance in this way is faster than calling `Object.create(null)` directly.
		// If `Object.create(null)` is not supported we prefix the event names with a
		// character to make sure that the built-in object properties are not
		// overridden or used as an attack vector.
		//
		if (Object.create) {
		  Events.prototype = Object.create(null);

		  //
		  // This hack is needed because the `__proto__` property is still inherited in
		  // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
		  //
		  if (!new Events().__proto__) prefix = false;
		}

		/**
		 * Representation of a single event listener.
		 *
		 * @param {Function} fn The listener function.
		 * @param {*} context The context to invoke the listener with.
		 * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
		 * @constructor
		 * @private
		 */
		function EE(fn, context, once) {
		  this.fn = fn;
		  this.context = context;
		  this.once = once || false;
		}

		/**
		 * Add a listener for a given event.
		 *
		 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
		 * @param {(String|Symbol)} event The event name.
		 * @param {Function} fn The listener function.
		 * @param {*} context The context to invoke the listener with.
		 * @param {Boolean} once Specify if the listener is a one-time listener.
		 * @returns {EventEmitter}
		 * @private
		 */
		function addListener(emitter, event, fn, context, once) {
		  if (typeof fn !== 'function') {
		    throw new TypeError('The listener must be a function');
		  }

		  var listener = new EE(fn, context || emitter, once)
		    , evt = prefix ? prefix + event : event;

		  if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
		  else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
		  else emitter._events[evt] = [emitter._events[evt], listener];

		  return emitter;
		}

		/**
		 * Clear event by name.
		 *
		 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
		 * @param {(String|Symbol)} evt The Event name.
		 * @private
		 */
		function clearEvent(emitter, evt) {
		  if (--emitter._eventsCount === 0) emitter._events = new Events();
		  else delete emitter._events[evt];
		}

		/**
		 * Minimal `EventEmitter` interface that is molded against the Node.js
		 * `EventEmitter` interface.
		 *
		 * @constructor
		 * @public
		 */
		function EventEmitter() {
		  this._events = new Events();
		  this._eventsCount = 0;
		}

		/**
		 * Return an array listing the events for which the emitter has registered
		 * listeners.
		 *
		 * @returns {Array}
		 * @public
		 */
		EventEmitter.prototype.eventNames = function eventNames() {
		  var names = []
		    , events
		    , name;

		  if (this._eventsCount === 0) return names;

		  for (name in (events = this._events)) {
		    if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
		  }

		  if (Object.getOwnPropertySymbols) {
		    return names.concat(Object.getOwnPropertySymbols(events));
		  }

		  return names;
		};

		/**
		 * Return the listeners registered for a given event.
		 *
		 * @param {(String|Symbol)} event The event name.
		 * @returns {Array} The registered listeners.
		 * @public
		 */
		EventEmitter.prototype.listeners = function listeners(event) {
		  var evt = prefix ? prefix + event : event
		    , handlers = this._events[evt];

		  if (!handlers) return [];
		  if (handlers.fn) return [handlers.fn];

		  for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
		    ee[i] = handlers[i].fn;
		  }

		  return ee;
		};

		/**
		 * Return the number of listeners listening to a given event.
		 *
		 * @param {(String|Symbol)} event The event name.
		 * @returns {Number} The number of listeners.
		 * @public
		 */
		EventEmitter.prototype.listenerCount = function listenerCount(event) {
		  var evt = prefix ? prefix + event : event
		    , listeners = this._events[evt];

		  if (!listeners) return 0;
		  if (listeners.fn) return 1;
		  return listeners.length;
		};

		/**
		 * Calls each of the listeners registered for a given event.
		 *
		 * @param {(String|Symbol)} event The event name.
		 * @returns {Boolean} `true` if the event had listeners, else `false`.
		 * @public
		 */
		EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
		  var evt = prefix ? prefix + event : event;

		  if (!this._events[evt]) return false;

		  var listeners = this._events[evt]
		    , len = arguments.length
		    , args
		    , i;

		  if (listeners.fn) {
		    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

		    switch (len) {
		      case 1: return listeners.fn.call(listeners.context), true;
		      case 2: return listeners.fn.call(listeners.context, a1), true;
		      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
		      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
		      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
		      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
		    }

		    for (i = 1, args = new Array(len -1); i < len; i++) {
		      args[i - 1] = arguments[i];
		    }

		    listeners.fn.apply(listeners.context, args);
		  } else {
		    var length = listeners.length
		      , j;

		    for (i = 0; i < length; i++) {
		      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

		      switch (len) {
		        case 1: listeners[i].fn.call(listeners[i].context); break;
		        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
		        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
		        case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
		        default:
		          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
		            args[j - 1] = arguments[j];
		          }

		          listeners[i].fn.apply(listeners[i].context, args);
		      }
		    }
		  }

		  return true;
		};

		/**
		 * Add a listener for a given event.
		 *
		 * @param {(String|Symbol)} event The event name.
		 * @param {Function} fn The listener function.
		 * @param {*} [context=this] The context to invoke the listener with.
		 * @returns {EventEmitter} `this`.
		 * @public
		 */
		EventEmitter.prototype.on = function on(event, fn, context) {
		  return addListener(this, event, fn, context, false);
		};

		/**
		 * Add a one-time listener for a given event.
		 *
		 * @param {(String|Symbol)} event The event name.
		 * @param {Function} fn The listener function.
		 * @param {*} [context=this] The context to invoke the listener with.
		 * @returns {EventEmitter} `this`.
		 * @public
		 */
		EventEmitter.prototype.once = function once(event, fn, context) {
		  return addListener(this, event, fn, context, true);
		};

		/**
		 * Remove the listeners of a given event.
		 *
		 * @param {(String|Symbol)} event The event name.
		 * @param {Function} fn Only remove the listeners that match this function.
		 * @param {*} context Only remove the listeners that have this context.
		 * @param {Boolean} once Only remove one-time listeners.
		 * @returns {EventEmitter} `this`.
		 * @public
		 */
		EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
		  var evt = prefix ? prefix + event : event;

		  if (!this._events[evt]) return this;
		  if (!fn) {
		    clearEvent(this, evt);
		    return this;
		  }

		  var listeners = this._events[evt];

		  if (listeners.fn) {
		    if (
		      listeners.fn === fn &&
		      (!once || listeners.once) &&
		      (!context || listeners.context === context)
		    ) {
		      clearEvent(this, evt);
		    }
		  } else {
		    for (var i = 0, events = [], length = listeners.length; i < length; i++) {
		      if (
		        listeners[i].fn !== fn ||
		        (once && !listeners[i].once) ||
		        (context && listeners[i].context !== context)
		      ) {
		        events.push(listeners[i]);
		      }
		    }

		    //
		    // Reset the array, or remove it completely if we have no more listeners.
		    //
		    if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
		    else clearEvent(this, evt);
		  }

		  return this;
		};

		/**
		 * Remove all listeners, or those of the specified event.
		 *
		 * @param {(String|Symbol)} [event] The event name.
		 * @returns {EventEmitter} `this`.
		 * @public
		 */
		EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
		  var evt;

		  if (event) {
		    evt = prefix ? prefix + event : event;
		    if (this._events[evt]) clearEvent(this, evt);
		  } else {
		    this._events = new Events();
		    this._eventsCount = 0;
		  }

		  return this;
		};

		//
		// Alias methods names because people roll like that.
		//
		EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
		EventEmitter.prototype.addListener = EventEmitter.prototype.on;

		//
		// Expose the prefix.
		//
		EventEmitter.prefixed = prefix;

		//
		// Allow `EventEmitter` to be imported as module namespace.
		//
		EventEmitter.EventEmitter = EventEmitter;

		//
		// Expose the module.
		//
		{
		  module.exports = EventEmitter;
		} 
	} (eventemitter3));
	return eventemitter3.exports;
}

var eventemitter3Exports = requireEventemitter3();
var EventEmitter = /*@__PURE__*/getDefaultExportFromCjs(eventemitter3Exports);

class FactoryMaker {
    static bindInstance(clsName, instance) {
        FactoryMaker.instances.set(clsName, { instance });
    }
    static bindLazyInstance(clsName, builder) {
        FactoryMaker.instances.set(clsName, { builder });
    }
    static bindInstanceIfNotExists(clsName, instance) {
        if (FactoryMaker.instances.has(clsName)) {
            return;
        }
        FactoryMaker.instances.set(clsName, { instance });
    }
    static getInstance(clsName) {
        var _a;
        const item = FactoryMaker.instances.get(clsName);
        if (item === null || item === undefined) {
            throw new Error(`Trying to get a non existing instance for ${clsName}`);
        }
        if (!item.instance && item.builder) {
            item.instance = (_a = item.builder) === null || _a === void 0 ? void 0 : _a.call(item);
        }
        return item.instance;
    }
    static createInstance(clsName) {
        var _a;
        const item = FactoryMaker.instances.get(clsName);
        if (item === null || item === undefined) {
            throw new Error(`Trying to get a non existing instance for ${clsName}`);
        }
        const proxyInstance = (_a = item.builder) === null || _a === void 0 ? void 0 : _a.call(item);
        if (proxyInstance === undefined) {
            throw new Error(`item.builder?.() returned undefined for ${clsName}`);
        }
        return proxyInstance;
    }
}
FactoryMaker.instances = new Map();

function createEventEmitter() {
    const ee = new EventEmitter();
    FactoryMaker.bindInstanceIfNotExists('EventEmitter', ee);
}

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __decorate$2(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __awaiter$2(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

class BaseController {
    get _proxy() {
        return FactoryMaker.getInstance(this.proxyName);
    }
    constructor(proxyName) {
        this.eventEmitter = FactoryMaker.getInstance('EventEmitter');
        this.proxyName = proxyName;
    }
}
class BaseNativeProxy {
    constructor() {
        this.eventEmitter = FactoryMaker.getInstance('EventEmitter');
    }
}
/**
 * JS Proxy hook to act as middleware to all the calls performed by an AdvancedNativeProxy instance
 * This will allow AdvancedNativeProxy to call dynamically the methods defined in the interface defined
 * as parameter in createAdvancedNativeProxy function
 */
const advancedNativeProxyHook = {
    /**
     * Dynamic property getter for the AdvancedNativeProxy
     * In order to call a native method this needs to be preceded by the `$` symbol on the name, ie `$methodName`
     * In order to set a native event handler this needs to be preceded by `on$` prefix, ie `on$eventName`
     * @param advancedNativeProxy
     * @param prop
     */
    get(advancedNativeProxy, prop) {
        // Early return if prop is not a string
        if (typeof prop !== 'string') {
            return undefined;
        }
        // Important: $ and on$ are required since if they are not added all
        // properties present on AdvancedNativeProxy will be redirected to the
        // advancedNativeProxy._call, which will call native even for the own
        // properties of the class
        // All the methods with the following structure
        // $methodName will be redirected to the special _call
        // method on AdvancedNativeProxy
        if (prop.startsWith("$")) {
            if (prop in advancedNativeProxy) {
                return advancedNativeProxy[prop];
            }
            return (args) => {
                return advancedNativeProxy._call(prop.substring(1), args);
            };
            // All methods with the following structure
            // on$methodName will trigger the event handler properties
        }
        else if (prop.startsWith("on$")) {
            return advancedNativeProxy[prop.substring(3)];
            // Everything else will be taken as a property
        }
        else {
            return advancedNativeProxy[prop];
        }
    }
};
/**
 * AdvancedNativeProxy will provide an easy way to communicate between native proxies
 * and other parts of the architecture such as the controller layer
 */
class AdvancedNativeProxy extends BaseNativeProxy {
    constructor(nativeCaller, events = []) {
        super();
        this.nativeCaller = nativeCaller;
        this.events = events;
        this.eventSubscriptions = new Map();
        this.events.forEach((event) => __awaiter$2(this, void 0, void 0, function* () {
            yield this._registerEvent(event);
        }));
        // Wrapping the AdvancedNativeProxy instance with the JS proxy hook
        return new Proxy(this, advancedNativeProxyHook);
    }
    dispose() {
        return __awaiter$2(this, void 0, void 0, function* () {
            for (const event of this.events) {
                yield this._unregisterEvent(event);
            }
            this.eventSubscriptions.clear();
            this.events = [];
        });
    }
    _call(fnName, args) {
        return this.nativeCaller.callFn(fnName, args);
    }
    _registerEvent(event) {
        return __awaiter$2(this, void 0, void 0, function* () {
            const handler = (args) => __awaiter$2(this, void 0, void 0, function* () {
                this.eventEmitter.emit(event.nativeEventName, args);
            });
            this.eventEmitter.on(event.nativeEventName, (args) => __awaiter$2(this, void 0, void 0, function* () {
                // Call to the special method defined on the JS Proxy hook
                try {
                    const hookArg = this.nativeCaller.eventHook(args);
                    yield this[`on$${event.name}`](hookArg);
                }
                catch (e) {
                    console.error(`Error while trying to execute handler for ${event.nativeEventName}`, e);
                    throw e;
                }
            }));
            const subscription = yield this.nativeCaller.registerEvent(event.nativeEventName, handler);
            this.eventSubscriptions.set(event.name, subscription);
        });
    }
    _unregisterEvent(event) {
        return __awaiter$2(this, void 0, void 0, function* () {
            const subscription = this.eventSubscriptions.get(event.name);
            yield this.nativeCaller.unregisterEvent(event.nativeEventName, subscription);
            this.eventEmitter.off(event.nativeEventName);
            this.eventSubscriptions.delete(event.name);
        });
    }
}
/**
 * Function to create a custom AdvancedNativeProxy. This will return an object which will provide dynamically the
 * methods specified in the PROXY interface.
 *
 * The Proxy interface implemented in order to call native methods will require a special mark
 * `$methodName` for method calls
 * `on$methodName` for the listeners added to the events defined in eventsEnum
 * @param nativeCaller
 * @param eventsEnum
 */
function createAdvancedNativeProxy(nativeCaller, eventsEnum = undefined) {
    const eventsList = eventsEnum == null ? [] : Object.entries(eventsEnum).map(([key, value]) => ({
        name: key,
        nativeEventName: value
    }));
    return new AdvancedNativeProxy(nativeCaller, eventsList);
}
/**
 * Function to create a custom AdvancedNativeProxy. This will return an object which will provide dynamically the
 * methods specified in the PROXY interface.
 *
 * The Proxy interface implemented in order to call native methods will require a special mark
 * `$methodName` for method calls
 * `on$methodName` for the listeners added to the events defined in eventsEnum
 * @param klass
 * @param nativeCaller
 * @param eventsEnum
 */
function createAdvancedNativeFromCtorProxy(klass, nativeCaller, eventsEnum = undefined) {
    const eventsList = Object.entries(eventsEnum).map(([key, value]) => ({
        name: key,
        nativeEventName: value
    }));
    return new klass(nativeCaller, eventsList);
}

function getCoreDefaults() {
    return FactoryMaker.getInstance('CoreDefaults');
}

function ignoreFromSerialization(target, propertyName) {
    target.ignoredProperties = target.ignoredProperties || [];
    target.ignoredProperties.push(propertyName);
}

function nameForSerialization(customName) {
    return (target, propertyName) => {
        target.customPropertyNames = target.customPropertyNames || {};
        target.customPropertyNames[propertyName] = customName;
    };
}

function ignoreFromSerializationIfNull(target, propertyName) {
    target.ignoredIfNullProperties = target.ignoredIfNullProperties || [];
    target.ignoredIfNullProperties.push(propertyName);
}

function serializationDefault(defaultValue) {
    return (target, propertyName) => {
        target.customPropertyDefaults = target.customPropertyDefaults || {};
        target.customPropertyDefaults[propertyName] = defaultValue;
    };
}

class DefaultSerializeable {
    toJSON() {
        const properties = Object.keys(this);
        // use @ignoreFromSerialization to ignore properties
        const ignoredProperties = this.ignoredProperties || [];
        // use @ignoreFromSerializationIfNull to ignore properties if they're null
        const ignoredIfNullProperties = this.ignoredIfNullProperties || [];
        // use @nameForSerialization('customName') to rename properties in the JSON output
        const customPropertyNames = this.customPropertyNames || {};
        // use @serializationDefault({}) to use a different value in the JSON output if they're null
        const customPropertyDefaults = this.customPropertyDefaults || {};
        return properties.reduce((json, property) => {
            if (ignoredProperties.includes(property)) {
                return json;
            }
            let value = this[property];
            if (value === undefined) {
                return json;
            }
            // Ignore if it's null and should be ignored.
            // This is basically responsible for not including optional properties in the JSON if they're null,
            // as that's not always deserialized to mean the same as not present.
            if (value === null && ignoredIfNullProperties.includes(property)) {
                return json;
            }
            if (value === null && customPropertyDefaults[property] !== undefined) {
                value = customPropertyDefaults[property];
            }
            // Serialize if serializeable
            if (value != null && value.toJSON) {
                value = value.toJSON();
            }
            // Serialize the array if the elements are serializeable
            if (Array.isArray(value)) {
                value = value.map(e => e.toJSON ? e.toJSON() : e);
            }
            const propertyName = customPropertyNames[property] || property;
            json[propertyName] = value;
            return json;
        }, {});
    }
}

class TapToFocus extends DefaultSerializeable {
    constructor() {
        super();
        this.type = 'tapToFocus';
    }
}

class PrivateFocusGestureDeserializer {
    static fromJSON(json) {
        if (json && json.type === new TapToFocus().type) {
            return new TapToFocus();
        }
        else {
            return null;
        }
    }
}

class SwipeToZoom extends DefaultSerializeable {
    constructor() {
        super();
        this.type = 'swipeToZoom';
    }
}

class PrivateZoomGestureDeserializer {
    static fromJSON(json) {
        if (json && json.type === new SwipeToZoom().type) {
            return new SwipeToZoom();
        }
        else {
            return null;
        }
    }
}

exports.FrameSourceState = void 0;
(function (FrameSourceState) {
    FrameSourceState["On"] = "on";
    FrameSourceState["Off"] = "off";
    FrameSourceState["Starting"] = "starting";
    FrameSourceState["Stopping"] = "stopping";
    FrameSourceState["Standby"] = "standby";
    FrameSourceState["BootingUp"] = "bootingUp";
    FrameSourceState["WakingUp"] = "wakingUp";
    FrameSourceState["GoingToSleep"] = "goingToSleep";
    FrameSourceState["ShuttingDown"] = "shuttingDown";
})(exports.FrameSourceState || (exports.FrameSourceState = {}));

class ImageBuffer {
    get width() {
        return this._width;
    }
    get height() {
        return this._height;
    }
    get data() {
        return this._data;
    }
}

class FrameDataSettings extends DefaultSerializeable {
    constructor() {
        super();
        // Enables the file system cache for the frame.
        this._isFileSystemCacheEnabled = false;
        // The quality of the image. 0-100.
        this._imageQuality = 100;
        // Enables the auto-rotation of the frame.
        this._isAutoRotateEnabled = false;
    }
    get isFileSystemCacheEnabled() {
        return this._isFileSystemCacheEnabled;
    }
    set isFileSystemCacheEnabled(enabled) {
        this._isFileSystemCacheEnabled = enabled;
    }
    get imageQuality() {
        return this._imageQuality;
    }
    set imageQuality(quality) {
        if (quality < 0 || quality > 100) {
            throw new Error('Image quality must be between 0 and 100');
        }
        this._imageQuality = quality;
    }
    get isAutoRotateEnabled() {
        return this._isAutoRotateEnabled;
    }
    set isAutoRotateEnabled(enabled) {
        this._isAutoRotateEnabled = enabled;
    }
}
__decorate$2([
    nameForSerialization('sc_frame_isFileSystemCacheEnabled')
], FrameDataSettings.prototype, "_isFileSystemCacheEnabled", void 0);
__decorate$2([
    nameForSerialization('sc_frame_imageQuality')
], FrameDataSettings.prototype, "_imageQuality", void 0);
__decorate$2([
    nameForSerialization('sc_frame_autoRotate')
], FrameDataSettings.prototype, "_isAutoRotateEnabled", void 0);

class FrameDataSettingsBuilder {
    constructor(settings) {
        this.settings = settings;
    }
    enableFileSystemCache(enabled) {
        this.settings.isFileSystemCacheEnabled = enabled;
        return this;
    }
    setImageQuality(quality) {
        this.settings.imageQuality = quality;
        return this;
    }
    enableAutoRotate(enabled) {
        this.settings.isAutoRotateEnabled = enabled;
        return this;
    }
}

var FrameSourceListenerEvents;
(function (FrameSourceListenerEvents) {
    FrameSourceListenerEvents["didChangeState"] = "FrameSourceListener.onStateChanged";
})(FrameSourceListenerEvents || (FrameSourceListenerEvents = {}));

var FontFamily;
(function (FontFamily) {
    FontFamily["SystemDefault"] = "systemDefault";
    FontFamily["ModernMono"] = "modernMono";
    FontFamily["SystemSans"] = "systemSans";
})(FontFamily || (FontFamily = {}));

var TextAlignment;
(function (TextAlignment) {
    TextAlignment["Left"] = "left";
    TextAlignment["Right"] = "right";
    TextAlignment["Center"] = "center";
    TextAlignment["Start"] = "start";
    TextAlignment["End"] = "end";
})(TextAlignment || (TextAlignment = {}));

class Point extends DefaultSerializeable {
    get x() {
        return this._x;
    }
    get y() {
        return this._y;
    }
    static fromJSON(json) {
        return new Point(json.x, json.y);
    }
    constructor(x, y) {
        super();
        this._x = x;
        this._y = y;
    }
}
__decorate$2([
    nameForSerialization('x')
], Point.prototype, "_x", void 0);
__decorate$2([
    nameForSerialization('y')
], Point.prototype, "_y", void 0);

class Quadrilateral extends DefaultSerializeable {
    get topLeft() {
        return this._topLeft;
    }
    get topRight() {
        return this._topRight;
    }
    get bottomRight() {
        return this._bottomRight;
    }
    get bottomLeft() {
        return this._bottomLeft;
    }
    static fromJSON(json) {
        return new Quadrilateral(Point.fromJSON(json.topLeft), Point.fromJSON(json.topRight), Point.fromJSON(json.bottomRight), Point.fromJSON(json.bottomLeft));
    }
    constructor(topLeft, topRight, bottomRight, bottomLeft) {
        super();
        this._topLeft = topLeft;
        this._topRight = topRight;
        this._bottomRight = bottomRight;
        this._bottomLeft = bottomLeft;
    }
}
__decorate$2([
    nameForSerialization('topLeft')
], Quadrilateral.prototype, "_topLeft", void 0);
__decorate$2([
    nameForSerialization('topRight')
], Quadrilateral.prototype, "_topRight", void 0);
__decorate$2([
    nameForSerialization('bottomRight')
], Quadrilateral.prototype, "_bottomRight", void 0);
__decorate$2([
    nameForSerialization('bottomLeft')
], Quadrilateral.prototype, "_bottomLeft", void 0);

class NumberWithUnit extends DefaultSerializeable {
    get value() {
        return this._value;
    }
    get unit() {
        return this._unit;
    }
    static fromJSON(json) {
        return new NumberWithUnit(json.value, json.unit);
    }
    constructor(value, unit) {
        super();
        this._value = value;
        this._unit = unit;
    }
}
__decorate$2([
    nameForSerialization('value')
], NumberWithUnit.prototype, "_value", void 0);
__decorate$2([
    nameForSerialization('unit')
], NumberWithUnit.prototype, "_unit", void 0);

exports.MeasureUnit = void 0;
(function (MeasureUnit) {
    MeasureUnit["DIP"] = "dip";
    MeasureUnit["Pixel"] = "pixel";
    MeasureUnit["Fraction"] = "fraction";
})(exports.MeasureUnit || (exports.MeasureUnit = {}));

class PointWithUnit extends DefaultSerializeable {
    get x() {
        return this._x;
    }
    get y() {
        return this._y;
    }
    static fromJSON(json) {
        return new PointWithUnit(NumberWithUnit.fromJSON(json.x), NumberWithUnit.fromJSON(json.y));
    }
    static get zero() {
        return new PointWithUnit(new NumberWithUnit(0, exports.MeasureUnit.Pixel), new NumberWithUnit(0, exports.MeasureUnit.Pixel));
    }
    constructor(x, y) {
        super();
        this._x = x;
        this._y = y;
    }
}
__decorate$2([
    nameForSerialization('x')
], PointWithUnit.prototype, "_x", void 0);
__decorate$2([
    nameForSerialization('y')
], PointWithUnit.prototype, "_y", void 0);

class Rect extends DefaultSerializeable {
    get origin() {
        return this._origin;
    }
    get size() {
        return this._size;
    }
    constructor(origin, size) {
        super();
        this._origin = origin;
        this._size = size;
    }
}
__decorate$2([
    nameForSerialization('origin')
], Rect.prototype, "_origin", void 0);
__decorate$2([
    nameForSerialization('size')
], Rect.prototype, "_size", void 0);

class RectWithUnit extends DefaultSerializeable {
    get origin() {
        return this._origin;
    }
    get size() {
        return this._size;
    }
    constructor(origin, size) {
        super();
        this._origin = origin;
        this._size = size;
    }
}
__decorate$2([
    nameForSerialization('origin')
], RectWithUnit.prototype, "_origin", void 0);
__decorate$2([
    nameForSerialization('size')
], RectWithUnit.prototype, "_size", void 0);

class ScanditIcon extends DefaultSerializeable {
    static fromJSON(json) {
        if (!json) {
            return null;
        }
        const scanditIcon = new ScanditIcon(json.iconColor || null, json.backgroundColor || null, json.backgroundShape || null, json.icon || null, json.backgroundStrokeColor || null, json.backgroundStrokeWidth);
        return scanditIcon;
    }
    constructor(iconColor, backgroundColor, backgroundShape, icon, backgroundStrokeColor, backgroundStrokeWidth) {
        super();
        this._backgroundStrokeWidth = 3.0;
        this._iconColor = iconColor;
        this._backgroundColor = backgroundColor;
        this._backgroundShape = backgroundShape;
        this._icon = icon;
        this._backgroundStrokeColor = backgroundStrokeColor;
        this._backgroundStrokeWidth = backgroundStrokeWidth;
    }
    get backgroundColor() {
        return this._backgroundColor;
    }
    get backgroundShape() {
        return this._backgroundShape;
    }
    get icon() {
        return this._icon;
    }
    get iconColor() {
        return this._iconColor;
    }
    get backgroundStrokeColor() {
        return this._backgroundStrokeColor;
    }
    get backgroundStrokeWidth() {
        return this._backgroundStrokeWidth;
    }
}
__decorate$2([
    nameForSerialization('backgroundColor'),
    ignoreFromSerializationIfNull
], ScanditIcon.prototype, "_backgroundColor", void 0);
__decorate$2([
    nameForSerialization('backgroundShape'),
    ignoreFromSerializationIfNull
], ScanditIcon.prototype, "_backgroundShape", void 0);
__decorate$2([
    nameForSerialization('icon'),
    ignoreFromSerializationIfNull
], ScanditIcon.prototype, "_icon", void 0);
__decorate$2([
    nameForSerialization('iconColor'),
    ignoreFromSerializationIfNull
], ScanditIcon.prototype, "_iconColor", void 0);
__decorate$2([
    nameForSerialization('backgroundStrokeColor'),
    ignoreFromSerializationIfNull
], ScanditIcon.prototype, "_backgroundStrokeColor", void 0);
__decorate$2([
    nameForSerialization('backgroundStrokeWidth')
], ScanditIcon.prototype, "_backgroundStrokeWidth", void 0);

class ScanditIconBuilder {
    constructor() {
        this._iconColor = null;
        this._backgroundColor = null;
        this._backgroundShape = null;
        this._icon = null;
        this._backgroundStrokeColor = null;
        this._backgroundStrokeWidth = 3.0;
    }
    withIconColor(iconColor) {
        this._iconColor = iconColor;
        return this;
    }
    withBackgroundColor(backgroundColor) {
        this._backgroundColor = backgroundColor;
        return this;
    }
    withBackgroundShape(backgroundShape) {
        this._backgroundShape = backgroundShape;
        return this;
    }
    withIcon(iconType) {
        this._icon = iconType;
        return this;
    }
    withBackgroundStrokeColor(backgroundStrokeColor) {
        this._backgroundStrokeColor = backgroundStrokeColor;
        return this;
    }
    withBackgroundStrokeWidth(backgroundStrokeWidth) {
        this._backgroundStrokeWidth = backgroundStrokeWidth;
        return this;
    }
    build() {
        return new ScanditIcon(this._iconColor, this._backgroundColor, this._backgroundShape, this._icon, this._backgroundStrokeColor, this._backgroundStrokeWidth);
    }
}

var ScanditIconShape;
(function (ScanditIconShape) {
    ScanditIconShape["Circle"] = "circle";
    ScanditIconShape["Square"] = "square";
})(ScanditIconShape || (ScanditIconShape = {}));

var ScanditIconType;
(function (ScanditIconType) {
    ScanditIconType["ArrowRight"] = "arrowRight";
    ScanditIconType["ArrowLeft"] = "arrowLeft";
    ScanditIconType["ArrowUp"] = "arrowUp";
    ScanditIconType["ArrowDown"] = "arrowDown";
    ScanditIconType["ToPick"] = "toPick";
    ScanditIconType["Checkmark"] = "checkmark";
    ScanditIconType["XMark"] = "xmark";
    ScanditIconType["QuestionMark"] = "questionMark";
    ScanditIconType["ExclamationMark"] = "exclamationMark";
    ScanditIconType["LowStock"] = "lowStock";
    ScanditIconType["ExpiredItem"] = "expiredItem";
    ScanditIconType["WrongItem"] = "wrongItem";
    ScanditIconType["FragileItem"] = "fragileItem";
    ScanditIconType["StarFilled"] = "starFilled";
    ScanditIconType["StarHalfFilled"] = "starHalfFilled";
    ScanditIconType["ChevronUp"] = "chevronUp";
    ScanditIconType["ChevronDown"] = "chevronDown";
    ScanditIconType["ChevronLeft"] = "chevronLeft";
    ScanditIconType["ChevronRight"] = "chevronRight";
    ScanditIconType["InspectItem"] = "inspectItem";
    ScanditIconType["StarOutlined"] = "starOutlined";
    ScanditIconType["Print"] = "print";
})(ScanditIconType || (ScanditIconType = {}));

class Size extends DefaultSerializeable {
    get width() {
        return this._width;
    }
    get height() {
        return this._height;
    }
    static fromJSON(json) {
        return new Size(json.width, json.height);
    }
    constructor(width, height) {
        super();
        this._width = width;
        this._height = height;
    }
}
__decorate$2([
    nameForSerialization('width')
], Size.prototype, "_width", void 0);
__decorate$2([
    nameForSerialization('height')
], Size.prototype, "_height", void 0);

class SizeWithAspect extends DefaultSerializeable {
    get size() {
        return this._size;
    }
    get aspect() {
        return this._aspect;
    }
    constructor(size, aspect) {
        super();
        this._size = size;
        this._aspect = aspect;
    }
}
__decorate$2([
    nameForSerialization('size')
], SizeWithAspect.prototype, "_size", void 0);
__decorate$2([
    nameForSerialization('aspect')
], SizeWithAspect.prototype, "_aspect", void 0);

class SizeWithUnit extends DefaultSerializeable {
    get width() {
        return this._width;
    }
    get height() {
        return this._height;
    }
    constructor(width, height) {
        super();
        this._width = width;
        this._height = height;
    }
}
__decorate$2([
    nameForSerialization('width')
], SizeWithUnit.prototype, "_width", void 0);
__decorate$2([
    nameForSerialization('height')
], SizeWithUnit.prototype, "_height", void 0);

exports.SizingMode = void 0;
(function (SizingMode) {
    SizingMode["WidthAndHeight"] = "widthAndHeight";
    SizingMode["WidthAndAspectRatio"] = "widthAndAspectRatio";
    SizingMode["HeightAndAspectRatio"] = "heightAndAspectRatio";
    SizingMode["ShorterDimensionAndAspectRatio"] = "shorterDimensionAndAspectRatio";
})(exports.SizingMode || (exports.SizingMode = {}));

class SizeWithUnitAndAspect {
    constructor() {
        this._widthAndHeight = null;
        this._widthAndAspectRatio = null;
        this._heightAndAspectRatio = null;
        this._shorterDimensionAndAspectRatio = null;
    }
    get widthAndHeight() {
        return this._widthAndHeight;
    }
    get widthAndAspectRatio() {
        return this._widthAndAspectRatio;
    }
    get heightAndAspectRatio() {
        return this._heightAndAspectRatio;
    }
    get shorterDimensionAndAspectRatio() {
        return this._shorterDimensionAndAspectRatio;
    }
    get sizingMode() {
        if (this.widthAndAspectRatio) {
            return exports.SizingMode.WidthAndAspectRatio;
        }
        if (this.heightAndAspectRatio) {
            return exports.SizingMode.HeightAndAspectRatio;
        }
        if (this.shorterDimensionAndAspectRatio) {
            return exports.SizingMode.ShorterDimensionAndAspectRatio;
        }
        return exports.SizingMode.WidthAndHeight;
    }
    static sizeWithWidthAndHeight(widthAndHeight) {
        const sizeWithUnitAndAspect = new SizeWithUnitAndAspect();
        sizeWithUnitAndAspect._widthAndHeight = widthAndHeight;
        return sizeWithUnitAndAspect;
    }
    static sizeWithWidthAndAspectRatio(width, aspectRatio) {
        const sizeWithUnitAndAspect = new SizeWithUnitAndAspect();
        sizeWithUnitAndAspect._widthAndAspectRatio = new SizeWithAspect(width, aspectRatio);
        return sizeWithUnitAndAspect;
    }
    static sizeWithHeightAndAspectRatio(height, aspectRatio) {
        const sizeWithUnitAndAspect = new SizeWithUnitAndAspect();
        sizeWithUnitAndAspect._heightAndAspectRatio = new SizeWithAspect(height, aspectRatio);
        return sizeWithUnitAndAspect;
    }
    static sizeWithShorterDimensionAndAspectRatio(shorterDimension, aspectRatio) {
        const sizeWithUnitAndAspect = new SizeWithUnitAndAspect();
        sizeWithUnitAndAspect._shorterDimensionAndAspectRatio = new SizeWithAspect(shorterDimension, aspectRatio);
        return sizeWithUnitAndAspect;
    }
    static fromJSON(json) {
        if (json.width && json.height) {
            return this.sizeWithWidthAndHeight(new SizeWithUnit(NumberWithUnit.fromJSON(json.width), NumberWithUnit.fromJSON(json.height)));
        }
        else if (json.width && json.aspect) {
            return this.sizeWithWidthAndAspectRatio(NumberWithUnit.fromJSON(json.width), json.aspect);
        }
        else if (json.height && json.aspect) {
            return this.sizeWithHeightAndAspectRatio(NumberWithUnit.fromJSON(json.height), json.aspect);
        }
        else if (json.shorterDimension && json.aspect) {
            return this.sizeWithShorterDimensionAndAspectRatio(NumberWithUnit.fromJSON(json.shorterDimension), json.aspect);
        }
        else {
            throw new Error(`SizeWithUnitAndAspectJSON is malformed: ${JSON.stringify(json)}`);
        }
    }
    toJSON() {
        switch (this.sizingMode) {
            case exports.SizingMode.WidthAndAspectRatio:
                return {
                    width: this.widthAndAspectRatio.size.toJSON(),
                    aspect: this.widthAndAspectRatio.aspect,
                };
            case exports.SizingMode.HeightAndAspectRatio:
                return {
                    height: this.heightAndAspectRatio.size.toJSON(),
                    aspect: this.heightAndAspectRatio.aspect,
                };
            case exports.SizingMode.ShorterDimensionAndAspectRatio:
                return {
                    shorterDimension: this.shorterDimensionAndAspectRatio.size.toJSON(),
                    aspect: this.shorterDimensionAndAspectRatio.aspect,
                };
            default:
                return {
                    width: this.widthAndHeight.width.toJSON(),
                    height: this.widthAndHeight.height.toJSON(),
                };
        }
    }
}
__decorate$2([
    nameForSerialization('widthAndHeight')
], SizeWithUnitAndAspect.prototype, "_widthAndHeight", void 0);
__decorate$2([
    nameForSerialization('widthAndAspectRatio')
], SizeWithUnitAndAspect.prototype, "_widthAndAspectRatio", void 0);
__decorate$2([
    nameForSerialization('heightAndAspectRatio')
], SizeWithUnitAndAspect.prototype, "_heightAndAspectRatio", void 0);
__decorate$2([
    nameForSerialization('shorterDimensionAndAspectRatio')
], SizeWithUnitAndAspect.prototype, "_shorterDimensionAndAspectRatio", void 0);

class MarginsWithUnit extends DefaultSerializeable {
    get left() {
        return this._left;
    }
    get right() {
        return this._right;
    }
    get top() {
        return this._top;
    }
    get bottom() {
        return this._bottom;
    }
    static fromJSON(json) {
        return new MarginsWithUnit(NumberWithUnit.fromJSON(json.left), NumberWithUnit.fromJSON(json.right), NumberWithUnit.fromJSON(json.top), NumberWithUnit.fromJSON(json.bottom));
    }
    static get zero() {
        return new MarginsWithUnit(new NumberWithUnit(0, exports.MeasureUnit.Pixel), new NumberWithUnit(0, exports.MeasureUnit.Pixel), new NumberWithUnit(0, exports.MeasureUnit.Pixel), new NumberWithUnit(0, exports.MeasureUnit.Pixel));
    }
    constructor(left, right, top, bottom) {
        super();
        this._left = left;
        this._right = right;
        this._top = top;
        this._bottom = bottom;
    }
}
__decorate$2([
    nameForSerialization('left')
], MarginsWithUnit.prototype, "_left", void 0);
__decorate$2([
    nameForSerialization('right')
], MarginsWithUnit.prototype, "_right", void 0);
__decorate$2([
    nameForSerialization('top')
], MarginsWithUnit.prototype, "_top", void 0);
__decorate$2([
    nameForSerialization('bottom')
], MarginsWithUnit.prototype, "_bottom", void 0);

class Color {
    get redComponent() {
        return this.hexadecimalString.slice(0, 2);
    }
    get greenComponent() {
        return this.hexadecimalString.slice(2, 4);
    }
    get blueComponent() {
        return this.hexadecimalString.slice(4, 6);
    }
    get alphaComponent() {
        return this.hexadecimalString.slice(6, 8);
    }
    get red() {
        return Color.hexToNumber(this.redComponent);
    }
    get green() {
        return Color.hexToNumber(this.greenComponent);
    }
    get blue() {
        return Color.hexToNumber(this.blueComponent);
    }
    get alpha() {
        return Color.hexToNumber(this.alphaComponent);
    }
    static fromHex(hex) {
        return new Color(Color.normalizeHex(hex));
    }
    static fromRGBA(red, green, blue, alpha = 1) {
        const hexString = [red, green, blue, this.normalizeAlpha(alpha)]
            .reduce((hex, colorComponent) => hex + this.numberToHex(colorComponent), '');
        return new Color(hexString);
    }
    static hexToNumber(hex) {
        return parseInt(hex, 16);
    }
    static fromJSON(json) {
        return Color.fromHex(json);
    }
    static numberToHex(x) {
        x = Math.round(x);
        let hex = x.toString(16);
        if (hex.length === 1) {
            hex = '0' + hex;
        }
        return hex.toUpperCase();
    }
    static normalizeHex(hex) {
        // remove leading #
        if (hex[0] === '#') {
            hex = hex.slice(1);
        }
        // double digits if single digit
        if (hex.length < 6) {
            hex = hex.split('').map(s => s + s).join('');
        }
        // add alpha if missing
        if (hex.length === 6) {
            hex = hex + 'FF';
        }
        return '#' + hex.toUpperCase();
    }
    static normalizeAlpha(alpha) {
        if (alpha > 0 && alpha <= 1) {
            return 255 * alpha;
        }
        return alpha;
    }
    constructor(hex) {
        this.hexadecimalString = hex;
    }
    withAlpha(alpha) {
        const newHex = this.hexadecimalString.slice(0, 6) + Color.numberToHex(Color.normalizeAlpha(alpha));
        return Color.fromHex(newHex);
    }
    toJSON() {
        return this.hexadecimalString;
    }
}

class Brush extends DefaultSerializeable {
    static get transparent() {
        const transparentBlack = Color.fromRGBA(255, 255, 255, 0);
        return new Brush(transparentBlack, transparentBlack, 0);
    }
    get fillColor() {
        return this.fill.color;
    }
    get strokeColor() {
        return this.stroke.color;
    }
    get strokeWidth() {
        return this.stroke.width;
    }
    get copy() {
        return new Brush(this.fillColor, this.strokeColor, this.strokeWidth);
    }
    constructor(fillColor = Brush.defaults.fillColor, strokeColor = Brush.defaults.strokeColor, strokeWidth = Brush.defaults.strokeWidth) {
        super();
        this.fill = { color: fillColor };
        this.stroke = { color: strokeColor, width: strokeWidth };
    }
    static fromJSON(brushJson) {
        return new Brush(Color.fromHex(brushJson.fillColor), Color.fromHex(brushJson.strokeColor), brushJson.strokeWidth);
    }
}

exports.Anchor = void 0;
(function (Anchor) {
    Anchor["TopLeft"] = "topLeft";
    Anchor["TopCenter"] = "topCenter";
    Anchor["TopRight"] = "topRight";
    Anchor["CenterLeft"] = "centerLeft";
    Anchor["Center"] = "center";
    Anchor["CenterRight"] = "centerRight";
    Anchor["BottomLeft"] = "bottomLeft";
    Anchor["BottomCenter"] = "bottomCenter";
    Anchor["BottomRight"] = "bottomRight";
})(exports.Anchor || (exports.Anchor = {}));

exports.Orientation = void 0;
(function (Orientation) {
    Orientation["Unknown"] = "unknown";
    Orientation["Portrait"] = "portrait";
    Orientation["PortraitUpsideDown"] = "portraitUpsideDown";
    Orientation["LandscapeRight"] = "landscapeRight";
    Orientation["LandscapeLeft"] = "landscapeLeft";
})(exports.Orientation || (exports.Orientation = {}));

exports.Direction = void 0;
(function (Direction) {
    Direction["None"] = "none";
    Direction["Horizontal"] = "horizontal";
    Direction["LeftToRight"] = "leftToRight";
    Direction["RightToLeft"] = "rightToLeft";
    Direction["Vertical"] = "vertical";
    Direction["TopToBottom"] = "topToBottom";
    Direction["BottomToTop"] = "bottomToTop";
})(exports.Direction || (exports.Direction = {}));

exports.ScanIntention = void 0;
(function (ScanIntention) {
    ScanIntention["Manual"] = "manual";
    ScanIntention["Smart"] = "smart";
    ScanIntention["SmartSelection"] = "smartSelection";
})(exports.ScanIntention || (exports.ScanIntention = {}));

class EventDataParser {
    static parse(data) {
        if (data == null) {
            return null;
        }
        return JSON.parse(data);
    }
}

class Observable extends DefaultSerializeable {
    constructor() {
        super(...arguments);
        this.listeners = [];
    }
    addListener(listener) {
        this.listeners.push(listener);
    }
    removeListener(listener) {
        this.listeners = this.listeners.filter(l => l !== listener);
    }
    notifyListeners(property, value) {
        this.listeners.forEach(listener => listener(property, value));
    }
}
__decorate$2([
    ignoreFromSerialization
], Observable.prototype, "listeners", void 0);

class HtmlElementPosition {
    constructor(top, left) {
        this.top = 0;
        this.left = 0;
        this.top = top;
        this.left = left;
    }
    didChangeComparedTo(other) {
        if (!other)
            return true;
        return this.top !== other.top || this.left !== other.left;
    }
}
class HtmlElementSize {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
    didChangeComparedTo(other) {
        if (!other)
            return true;
        return this.width !== other.width || this.height !== other.height;
    }
}
class HTMLElementState {
    constructor() {
        this.isShown = false;
        this.position = null;
        this.size = null;
        this.shouldBeUnderContent = false;
    }
    get isValid() {
        return this.isShown !== undefined && this.isShown !== null
            && this.position !== undefined && this.position !== null
            && this.size !== undefined && this.size !== null
            && this.shouldBeUnderContent !== undefined && this.shouldBeUnderContent !== null;
    }
    didChangeComparedTo(other) {
        var _a, _b, _c, _d;
        if (!other)
            return true;
        const positionChanged = (_b = (_a = this.position) === null || _a === void 0 ? void 0 : _a.didChangeComparedTo(other.position)) !== null && _b !== void 0 ? _b : (this.position !== other.position);
        const sizeChanged = (_d = (_c = this.size) === null || _c === void 0 ? void 0 : _c.didChangeComparedTo(other.size)) !== null && _d !== void 0 ? _d : (this.size !== other.size);
        return positionChanged || sizeChanged || this.shouldBeUnderContent !== other.shouldBeUnderContent;
    }
}

class BaseNewController {
    get _proxy() {
        return this._cachedProxy;
    }
    constructor(proxyName) {
        this._cachedProxy = FactoryMaker.createInstance(proxyName);
    }
}

class ImageFrameSourceController extends BaseNewController {
    constructor(imageFrameSource) {
        super('ImageFrameSourceProxy');
        this.handleDidChangeStateEventWrapper = (ev) => {
            return this.handleDidChangeStateEvent(ev);
        };
        this.imageFrameSource = imageFrameSource;
        this.subscribeListener();
    }
    get privateImageFrameSource() {
        return this.imageFrameSource;
    }
    getCurrentState() {
        return __awaiter$2(this, void 0, void 0, function* () {
            const result = yield this._proxy.$getCurrentCameraState({ position: this.privateImageFrameSource.position });
            if (result == null) {
                return exports.FrameSourceState.Off;
            }
            return result.data;
        });
    }
    switchCameraToDesiredState(desiredStateJson) {
        return this._proxy.$switchCameraToDesiredState({ desiredStateJson });
    }
    subscribeListener() {
        return __awaiter$2(this, void 0, void 0, function* () {
            yield this._proxy.$registerListenerForCameraEvents();
            this._proxy.subscribeForEvents([FrameSourceListenerEvents.didChangeState]);
            this._proxy.eventEmitter.on(FrameSourceListenerEvents.didChangeState, this.handleDidChangeStateEventWrapper);
        });
    }
    unsubscribeListener() {
        return __awaiter$2(this, void 0, void 0, function* () {
            yield this._proxy.$unregisterListenerForCameraEvents();
            this._proxy.unsubscribeFromEvents([FrameSourceListenerEvents.didChangeState]);
            this._proxy.eventEmitter.off(FrameSourceListenerEvents.didChangeState, this.handleDidChangeStateEventWrapper);
        });
    }
    dispose() {
        this.unsubscribeListener();
        this._proxy.dispose();
    }
    handleDidChangeStateEvent(ev) {
        const event = EventDataParser.parse(ev.data);
        if (event === null) {
            console.error('ImageFrameSourceController didChangeState payload is null');
            return;
        }
        const newState = event.state;
        this.privateImageFrameSource.listeners.forEach(listener => {
            if (listener.didChangeState) {
                listener.didChangeState(this.imageFrameSource, newState);
            }
        });
    }
}

class ImageFrameSource extends DefaultSerializeable {
    set context(newContext) {
        if (newContext == null) {
            this.controller.unsubscribeListener();
        }
        else if (this._context == null) {
            this.controller.subscribeListener();
        }
        this._context = newContext;
    }
    get context() {
        return this._context;
    }
    get desiredState() {
        return this._desiredState;
    }
    static create(image) {
        const imageFrameSource = new ImageFrameSource();
        imageFrameSource.image = image;
        return imageFrameSource;
    }
    static fromJSON(json) {
        return ImageFrameSource.create(json.image);
    }
    constructor() {
        super();
        this.type = 'image';
        this.image = '';
        this._id = `${Date.now()}`;
        this._desiredState = exports.FrameSourceState.Off;
        this.listeners = [];
        this._context = null;
        this.controller = new ImageFrameSourceController(this);
    }
    didChange() {
        if (this.context) {
            return this.context.update();
        }
        else {
            return Promise.resolve();
        }
    }
    switchToDesiredState(state) {
        this._desiredState = state;
        return this.controller.switchCameraToDesiredState(state);
    }
    addListener(listener) {
        if (listener == null) {
            return;
        }
        if (this.listeners.includes(listener)) {
            return;
        }
        this.listeners.push(listener);
    }
    removeListener(listener) {
        if (listener == null) {
            return;
        }
        if (!this.listeners.includes(listener)) {
            return;
        }
        this.listeners.splice(this.listeners.indexOf(listener), 1);
    }
    getCurrentState() {
        return this.controller.getCurrentState();
    }
}
__decorate$2([
    nameForSerialization('id')
], ImageFrameSource.prototype, "_id", void 0);
__decorate$2([
    nameForSerialization('desiredState')
], ImageFrameSource.prototype, "_desiredState", void 0);
__decorate$2([
    ignoreFromSerialization
], ImageFrameSource.prototype, "listeners", void 0);
__decorate$2([
    ignoreFromSerialization
], ImageFrameSource.prototype, "_context", void 0);
__decorate$2([
    ignoreFromSerialization
], ImageFrameSource.prototype, "controller", void 0);

class PrivateFrameData {
    get imageBuffers() {
        return this._imageBuffers;
    }
    get orientation() {
        return this._orientation;
    }
    static fromJSON(json) {
        const frameData = new PrivateFrameData();
        frameData._imageBuffers = json.imageBuffers.map((imageBufferJSON) => {
            const imageBuffer = new ImageBuffer();
            imageBuffer._width = imageBufferJSON.width;
            imageBuffer._height = imageBufferJSON.height;
            imageBuffer._data = imageBufferJSON.data;
            return imageBuffer;
        });
        frameData._orientation = json.orientation;
        return frameData;
    }
    static empty() {
        const frameData = new PrivateFrameData();
        frameData._imageBuffers = [];
        frameData._orientation = 90;
        return frameData;
    }
}

exports.CameraPosition = void 0;
(function (CameraPosition) {
    CameraPosition["WorldFacing"] = "worldFacing";
    CameraPosition["UserFacing"] = "userFacing";
    CameraPosition["Unspecified"] = "unspecified";
})(exports.CameraPosition || (exports.CameraPosition = {}));

exports.TorchState = void 0;
(function (TorchState) {
    TorchState["On"] = "on";
    TorchState["Off"] = "off";
    TorchState["Auto"] = "auto";
})(exports.TorchState || (exports.TorchState = {}));

/**
 * Camera lifecycle and operation handling:
 *
 * Phase 1 - Initial State (before native creation starts):
 *   - Camera object exists in TypeScript but not yet being created on native side
 *   - State changes (torch, desired state, settings) only update TypeScript properties
 *   - No native calls are triggered
 *
 * Phase 2 - Native Creation In Progress (after setFrameSource, before context set):
 *   - setFrameSource() called on DataCaptureContext, triggering setNativeFrameSourceIsBeingCreated()
 *   - A promise is created that will resolve when the native camera is ready
 *   - State changes during this phase await the native ready promise before executing
 *   - Native camera is created asynchronously
 *
 * Phase 3 - Active State (after context set):
 *   - Native camera is ready and available
 *   - The native ready promise is resolved
 *   - All state changes execute immediately on native side
 */
class Camera extends DefaultSerializeable {
    static get coreDefaults() {
        return getCoreDefaults();
    }
    set context(newContext) {
        this._context = newContext;
        if (newContext) {
            // Phase 3: Native camera is ready, resolve the promise so waiting operations can proceed
            if (this.nativeReadyTimeout) {
                clearTimeout(this.nativeReadyTimeout);
                this.nativeReadyTimeout = null;
            }
            if (this.nativeReadyResolver) {
                this.nativeReadyResolver();
                this.nativeReadyResolver = null;
                this.nativeReadyRejecter = null;
                this.nativeReadyPromise = null;
            }
        }
        else {
            // When context is removed, reset everything
            if (this.nativeReadyTimeout) {
                clearTimeout(this.nativeReadyTimeout);
                this.nativeReadyTimeout = null;
            }
            this.nativeReadyResolver = null;
            this.nativeReadyRejecter = null;
            this.nativeReadyPromise = null;
        }
    }
    get context() {
        return this._context;
    }
    setNativeFrameSourceIsBeingCreated() {
        this.nativeReadyPromise = new Promise((resolve, reject) => {
            this.nativeReadyResolver = resolve;
            this.nativeReadyRejecter = reject;
            this.nativeReadyTimeout = setTimeout(() => {
                this.nativeReadyTimeout = null;
                if (this.nativeReadyRejecter) {
                    this.nativeReadyRejecter(new Error('Camera native initialization timed out after 5 seconds'));
                    this.nativeReadyResolver = null;
                    this.nativeReadyRejecter = null;
                    this.nativeReadyPromise = null;
                }
            }, 5000);
        });
    }
    get isActiveCamera() {
        return this._context !== null;
    }
    static get default() {
        const defaultPosition = Camera.coreDefaults.Camera.defaultPosition;
        if (!defaultPosition) {
            return null;
        }
        return Camera.atPosition(defaultPosition);
    }
    static withSettings(settings) {
        return Camera.create(undefined, settings);
    }
    static asPositionWithSettings(cameraPosition, settings) {
        return Camera.create(cameraPosition, settings);
    }
    static atPosition(cameraPosition) {
        if (!Camera.coreDefaults.Camera.availablePositions.includes(cameraPosition)) {
            return null;
        }
        const existingCamera = Camera._cameraInstances.get(cameraPosition);
        if (existingCamera) {
            return existingCamera;
        }
        return Camera.create(cameraPosition);
    }
    get desiredState() {
        return this._desiredState;
    }
    set desiredTorchState(desiredTorchState) {
        this._desiredTorchState = desiredTorchState;
        if (this.nativeReadyPromise) {
            // Phase 2: Wait for native camera to be ready, then update
            this.nativeReadyPromise.then(() => this.didChange());
        }
        else if (this.isActiveCamera) {
            // Phase 3: Execute immediately
            this.didChange();
        }
        // Phase 1: Just update the property, no action needed
    }
    get desiredTorchState() {
        return this._desiredTorchState;
    }
    constructor(position, settings, desiredTorchState, desiredState) {
        super();
        this.type = 'camera';
        this.settings = null;
        this._desiredTorchState = exports.TorchState.Off;
        this._desiredState = exports.FrameSourceState.Off;
        this.currentCameraState = exports.FrameSourceState.Off;
        this.listeners = [];
        this._context = null;
        this.nativeReadyResolver = null;
        this.nativeReadyRejecter = null;
        this.nativeReadyPromise = null;
        this.nativeReadyTimeout = null;
        this.position = position || Camera.coreDefaults.Camera.defaultPosition;
        this.settings = settings || null;
        this._desiredTorchState = desiredTorchState || exports.TorchState.Off;
        this._desiredState = desiredState || exports.FrameSourceState.Off;
        this.controller = new CameraController(this);
    }
    static create(position, settings, desiredTorchState, desiredState) {
        const cameraPosition = position || Camera.coreDefaults.Camera.defaultPosition;
        if (!cameraPosition) {
            return null;
        }
        const existingCamera = Camera._cameraInstances.get(cameraPosition);
        if (existingCamera) {
            existingCamera.resetPhaseState();
            if (settings !== undefined) {
                existingCamera.settings = settings;
            }
            if (desiredTorchState !== undefined) {
                existingCamera._desiredTorchState = desiredTorchState;
                existingCamera.didChange();
            }
            if (desiredState !== undefined) {
                existingCamera._desiredState = desiredState;
                existingCamera.controller.switchCameraToDesiredState(desiredState);
            }
            return existingCamera;
        }
        if (!Camera.coreDefaults.Camera.availablePositions.includes(cameraPosition)) {
            return null;
        }
        const camera = new Camera(cameraPosition, settings, desiredTorchState, desiredState);
        Camera._cameraInstances.set(cameraPosition, camera);
        return camera;
    }
    switchToDesiredState(state) {
        return __awaiter$2(this, void 0, void 0, function* () {
            this._desiredState = state;
            if (this.nativeReadyPromise) {
                // Phase 2: Wait for native camera to be ready, then switch state
                yield this.nativeReadyPromise;
                yield this.controller.switchCameraToDesiredState(state);
                return;
            }
            if (!this.isActiveCamera) {
                // Phase 1: Not yet added to context
                console.warn('The current camera is not added to the DataCaptureContext. Add camera to the DataCaptureContext first.');
                return;
            }
            // Phase 3: Execute immediately
            yield this.controller.switchCameraToDesiredState(state);
        });
    }
    getCurrentState() {
        return Promise.resolve(this.currentCameraState);
    }
    getIsTorchAvailable() {
        return this.controller.getIsTorchAvailable();
    }
    addListener(listener) {
        if (listener == null) {
            return;
        }
        if (this.listeners.includes(listener)) {
            return;
        }
        this.listeners.push(listener);
    }
    removeListener(listener) {
        if (listener == null) {
            return;
        }
        if (!this.listeners.includes(listener)) {
            return;
        }
        this.listeners.splice(this.listeners.indexOf(listener), 1);
    }
    applySettings(settings) {
        return __awaiter$2(this, void 0, void 0, function* () {
            this.settings = settings;
            if (this.nativeReadyPromise) {
                // Phase 2: Wait for native camera to be ready, then apply settings
                yield this.nativeReadyPromise;
                yield this.didChange();
            }
            else if (this.isActiveCamera) {
                // Phase 3: Execute immediately
                yield this.didChange();
            }
            // Phase 1: Just update the property, no action needed
        });
    }
    didChange() {
        return __awaiter$2(this, void 0, void 0, function* () {
            if (this.context) {
                yield this.context.update();
            }
        });
    }
    resetPhaseState() {
        if (this.nativeReadyTimeout) {
            clearTimeout(this.nativeReadyTimeout);
            this.nativeReadyTimeout = null;
        }
        this.nativeReadyResolver = null;
        this.nativeReadyRejecter = null;
        this.nativeReadyPromise = null;
    }
}
Camera._cameraInstances = new Map();
__decorate$2([
    serializationDefault({})
], Camera.prototype, "settings", void 0);
__decorate$2([
    nameForSerialization('desiredTorchState')
], Camera.prototype, "_desiredTorchState", void 0);
__decorate$2([
    nameForSerialization('desiredState')
], Camera.prototype, "_desiredState", void 0);
__decorate$2([
    ignoreFromSerialization
], Camera.prototype, "currentCameraState", void 0);
__decorate$2([
    ignoreFromSerialization
], Camera.prototype, "listeners", void 0);
__decorate$2([
    ignoreFromSerialization
], Camera.prototype, "_context", void 0);
__decorate$2([
    ignoreFromSerialization
], Camera.prototype, "nativeReadyResolver", void 0);
__decorate$2([
    ignoreFromSerialization
], Camera.prototype, "nativeReadyRejecter", void 0);
__decorate$2([
    ignoreFromSerialization
], Camera.prototype, "nativeReadyPromise", void 0);
__decorate$2([
    ignoreFromSerialization
], Camera.prototype, "nativeReadyTimeout", void 0);
__decorate$2([
    ignoreFromSerialization
], Camera.prototype, "controller", void 0);
__decorate$2([
    ignoreFromSerialization
], Camera, "_cameraInstances", void 0);
__decorate$2([
    ignoreFromSerialization
], Camera, "coreDefaults", null);

class CameraOwnershipManager {
    constructor() {
        this.owners = new Map();
        this.waitingQueue = new Map();
        this.protectedCameras = new Set();
    }
    static getInstance() {
        if (!CameraOwnershipManager.instance) {
            CameraOwnershipManager.instance = new CameraOwnershipManager();
        }
        return CameraOwnershipManager.instance;
    }
    requestOwnership(position, owner) {
        const currentOwner = this.owners.get(position);
        if (currentOwner && currentOwner.id !== owner.id) {
            return false; // Already owned by someone else
        }
        this.owners.set(position, owner);
        this.enableProtectionForOwner(position, owner);
        return true;
    }
    requestOwnershipAsync(position, owner, timeoutMs) {
        return __awaiter$2(this, void 0, void 0, function* () {
            // Try immediate acquisition first
            if (this.requestOwnership(position, owner)) {
                return true;
            }
            // If not available, wait in queue
            return new Promise((resolve) => {
                const request = { owner, resolve };
                if (!this.waitingQueue.has(position)) {
                    this.waitingQueue.set(position, []);
                }
                this.waitingQueue.get(position).push(request);
                // Optional timeout
                if (timeoutMs && timeoutMs > 0) {
                    setTimeout(() => {
                        this.removeFromQueue(position, request);
                        resolve(false); // Timeout - ownership not acquired
                    }, timeoutMs);
                }
            });
        });
    }
    releaseOwnership(position, owner) {
        const currentOwner = this.owners.get(position);
        if (!currentOwner || currentOwner.id !== owner.id) {
            return false; // Not the owner
        }
        this.owners.delete(position);
        this.disableProtectionForPosition(position);
        this.processWaitingQueue(position);
        return true;
    }
    isOwner(position, owner) {
        const currentOwner = this.owners.get(position);
        return (currentOwner === null || currentOwner === void 0 ? void 0 : currentOwner.id) === owner.id;
    }
    getCurrentOwner(position) {
        return this.owners.get(position) || null;
    }
    checkOwnership(position, owner) {
        return this.isOwner(position, owner);
    }
    getOwnedPosition(owner) {
        for (const [position, currentOwner] of this.owners.entries()) {
            if (currentOwner.id === owner.id) {
                return position;
            }
        }
        return null;
    }
    getAllOwnedPositions(owner) {
        const positions = [];
        for (const [position, currentOwner] of this.owners.entries()) {
            if (currentOwner.id === owner.id) {
                positions.push(position);
            }
        }
        return positions;
    }
    enableProtectionForOwner(position, owner) {
        const camera = Camera.atPosition(position);
        if (!camera || this.protectedCameras.has(camera)) {
            return; // Camera not available or already protected
        }
        this.protectCameraForOwner(camera, position, owner);
        this.protectedCameras.add(camera);
    }
    disableProtectionForPosition(position) {
        const camera = Camera.atPosition(position);
        if (!camera || !this.protectedCameras.has(camera)) {
            return;
        }
        this.unprotectCamera(camera);
        this.protectedCameras.delete(camera);
    }
    processWaitingQueue(position) {
        const queue = this.waitingQueue.get(position);
        if (!queue || queue.length === 0) {
            return;
        }
        // Give ownership to the first in queue
        const nextRequest = queue.shift();
        this.owners.set(position, nextRequest.owner);
        this.enableProtectionForOwner(position, nextRequest.owner);
        nextRequest.resolve(true);
        // Clean up empty queue
        if (queue.length === 0) {
            this.waitingQueue.delete(position);
        }
    }
    removeFromQueue(position, requestToRemove) {
        const queue = this.waitingQueue.get(position);
        if (!queue)
            return;
        const index = queue.indexOf(requestToRemove);
        if (index > -1) {
            queue.splice(index, 1);
        }
        if (queue.length === 0) {
            this.waitingQueue.delete(position);
        }
    }
    protectCameraForOwner(camera, position, _owner) {
        var _a, _b, _c;
        const originalSwitchToDesiredState = camera.switchToDesiredState.bind(camera);
        const originalApplySettings = camera.applySettings.bind(camera);
        const originalSetDesiredTorchState = (_b = (_a = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(camera), 'desiredTorchState')) === null || _a === void 0 ? void 0 : _a.set) === null || _b === void 0 ? void 0 : _b.bind(camera);
        // Protect switchToDesiredState - only owner can call it
        camera.switchToDesiredState = (state) => __awaiter$2(this, void 0, void 0, function* () {
            const currentOwner = this.getCurrentOwner(position);
            if (!currentOwner) {
                throw new Error(`Camera operation denied: No owner for camera at ${position}`);
            }
            // Allow operation - the owner is the only one who should have access to this camera instance
            return originalSwitchToDesiredState(state);
        });
        // Protect applySettings - only owner can call it
        camera.applySettings = (settings) => __awaiter$2(this, void 0, void 0, function* () {
            const currentOwner = this.getCurrentOwner(position);
            if (!currentOwner) {
                throw new Error(`Camera operation denied: No owner for camera at ${position}`);
            }
            return originalApplySettings(settings);
        });
        // Protect desiredTorchState setter - only owner can set it
        if (originalSetDesiredTorchState) {
            Object.defineProperty(camera, 'desiredTorchState', {
                set: (value) => {
                    const currentOwner = this.getCurrentOwner(position);
                    if (!currentOwner) {
                        throw new Error(`Camera operation denied: No owner for camera at ${position}`);
                    }
                    originalSetDesiredTorchState(value);
                },
                get: (_c = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(camera), 'desiredTorchState')) === null || _c === void 0 ? void 0 : _c.get,
                configurable: true
            });
        }
        // Store originals for restoration
        camera.__originalMethods = {
            switchToDesiredState: originalSwitchToDesiredState,
            applySettings: originalApplySettings,
            setDesiredTorchState: originalSetDesiredTorchState
        };
    }
    unprotectCamera(camera) {
        var _a;
        const originals = camera.__originalMethods;
        if (!originals)
            return;
        // Restore original methods
        camera.switchToDesiredState = originals.switchToDesiredState;
        camera.applySettings = originals.applySettings;
        if (originals.setDesiredTorchState) {
            Object.defineProperty(camera, 'desiredTorchState', {
                set: originals.setDesiredTorchState,
                get: (_a = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(camera), 'desiredTorchState')) === null || _a === void 0 ? void 0 : _a.get,
                configurable: true
            });
        }
        delete camera.__originalMethods;
    }
}

class CameraOwnershipHelper {
    /**
     * Get camera instance for the owner (only works if you own it)
     */
    static getCamera(position, owner) {
        // Check ownership
        if (!this.ownershipManager.checkOwnership(position, owner)) {
            console.warn(`Camera access denied: ${owner.id} does not own camera at ${position}`);
            return null;
        }
        return Camera.atPosition(position);
    }
    /**
     * Safely execute camera operations (only works if you own the camera)
     */
    static withCamera(position, owner, operation) {
        return __awaiter$2(this, void 0, void 0, function* () {
            const camera = this.getCamera(position, owner);
            if (!camera) {
                return null;
            }
            try {
                const result = yield operation(camera);
                return result;
            }
            catch (error) {
                console.error(`Camera operation failed for ${owner.id}:`, error);
                throw error;
            }
        });
    }
    /**
     * Execute camera operations, waiting for ownership if necessary
     */
    static withCameraWhenAvailable(position, owner, operation, timeoutMs) {
        return __awaiter$2(this, void 0, void 0, function* () {
            // Try to get ownership, wait if necessary
            const acquired = yield this.requestOwnership(position, owner, timeoutMs);
            if (!acquired) {
                console.warn(`Could not acquire camera ownership for ${owner.id} within timeout`);
                return null;
            }
            const camera = Camera.atPosition(position);
            if (!camera) {
                console.warn(`Camera not available at position ${position}`);
                return null;
            }
            try {
                const result = yield operation(camera);
                return result;
            }
            catch (error) {
                console.error(`Camera operation failed for ${owner.id}:`, error);
                throw error;
            }
        });
    }
    /**
     * Request ownership and wait if necessary
     */
    static requestOwnership(position, owner, timeoutMs) {
        return __awaiter$2(this, void 0, void 0, function* () {
            return this.ownershipManager.requestOwnershipAsync(position, owner, timeoutMs);
        });
    }
    /**
     * Release ownership
     */
    static releaseOwnership(position, owner) {
        return this.ownershipManager.releaseOwnership(position, owner);
    }
    /**
     * Check if owner has ownership
     */
    static hasOwnership(position, owner) {
        return this.ownershipManager.checkOwnership(position, owner);
    }
    /**
     * Get the camera position currently owned by the owner (if any)
     */
    static getOwnedPosition(owner) {
        return this.ownershipManager.getOwnedPosition(owner);
    }
    /**
     * Get all camera positions currently owned by the owner
     */
    static getAllOwnedPositions(owner) {
        return this.ownershipManager.getAllOwnedPositions(owner);
    }
    /**
     * Release ownership of all cameras owned by the owner
     */
    static releaseAllOwnerships(owner) {
        const ownedPositions = this.getAllOwnedPositions(owner);
        for (const position of ownedPositions) {
            this.releaseOwnership(position, owner);
        }
    }
}
CameraOwnershipHelper.ownershipManager = CameraOwnershipManager.getInstance();

class CameraController extends BaseNewController {
    static get _proxy() {
        return FactoryMaker.getInstance('CameraProxy');
    }
    constructor(camera) {
        super('CameraProxy');
        // Arrow function wrapper to avoid .bind(this) and always use current class state
        this.handleDidChangeStateEventWrapper = (ev) => {
            return this.handleDidChangeStateEvent(ev);
        };
        this.camera = camera;
        this.subscribeListener();
    }
    get privateCamera() {
        return this.camera;
    }
    static getFrame(frameId) {
        return __awaiter$2(this, void 0, void 0, function* () {
            const result = yield CameraController._proxy.$getFrame({ frameId });
            if (result == null) {
                return PrivateFrameData.empty();
            }
            const frameDataJSON = JSON.parse(result.data);
            return PrivateFrameData.fromJSON(frameDataJSON);
        });
    }
    static getFrameOrNull(frameId) {
        return __awaiter$2(this, void 0, void 0, function* () {
            const result = yield CameraController._proxy.$getFrame({ frameId });
            if (result == null) {
                return null;
            }
            const frameDataJSON = JSON.parse(result.data);
            return PrivateFrameData.fromJSON(frameDataJSON);
        });
    }
    getCurrentState() {
        return __awaiter$2(this, void 0, void 0, function* () {
            const result = yield this._proxy.$getCurrentCameraState({ position: this.privateCamera.position });
            if (result == null) {
                return exports.FrameSourceState.Off;
            }
            return result.data;
        });
    }
    getIsTorchAvailable() {
        return __awaiter$2(this, void 0, void 0, function* () {
            const result = yield this._proxy.$isTorchAvailable({ position: this.privateCamera.position });
            if (result == null) {
                return false;
            }
            return result.data === 'true';
        });
    }
    switchCameraToDesiredState(desiredState) {
        return this._proxy.$switchCameraToDesiredState({ desiredStateJson: desiredState.toString() });
    }
    subscribeListener() {
        return __awaiter$2(this, void 0, void 0, function* () {
            yield this._proxy.$registerListenerForCameraEvents();
            this._proxy.subscribeForEvents([FrameSourceListenerEvents.didChangeState]);
            this._proxy.eventEmitter.on(FrameSourceListenerEvents.didChangeState, this.handleDidChangeStateEventWrapper);
        });
    }
    unsubscribeListener() {
        return __awaiter$2(this, void 0, void 0, function* () {
            yield this._proxy.$unregisterListenerForCameraEvents();
            this._proxy.unsubscribeFromEvents([FrameSourceListenerEvents.didChangeState]);
            this._proxy.eventEmitter.off(FrameSourceListenerEvents.didChangeState, this.handleDidChangeStateEventWrapper);
        });
    }
    dispose() {
        this.unsubscribeListener();
        this._proxy.dispose();
    }
    handleDidChangeStateEvent(ev) {
        const event = EventDataParser.parse(ev.data);
        if (event) {
            if (event.cameraPosition !== this.privateCamera.position || !this.privateCamera.isActiveCamera) {
                return;
            }
            this.privateCamera.currentCameraState = event.state;
            this.privateCamera.listeners.forEach(listener => {
                var _a;
                (_a = listener === null || listener === void 0 ? void 0 : listener.didChangeState) === null || _a === void 0 ? void 0 : _a.call(listener, this.camera, this.privateCamera._desiredState);
            });
        }
    }
}

class ControlImage extends DefaultSerializeable {
    constructor(type, data, name) {
        super();
        this.type = type;
        this._data = data;
        this._name = name;
    }
    static fromBase64EncodedImage(data) {
        if (data === null)
            return null;
        return new ControlImage("base64", data, null);
    }
    static fromResourceName(resource) {
        return new ControlImage("resource", null, resource);
    }
    isBase64EncodedImage() {
        return this.type === "base64";
    }
    get data() {
        return this._data;
    }
}
__decorate$2([
    ignoreFromSerializationIfNull,
    nameForSerialization('data')
], ControlImage.prototype, "_data", void 0);
__decorate$2([
    ignoreFromSerializationIfNull,
    nameForSerialization('name')
], ControlImage.prototype, "_name", void 0);

class ContextStatus {
    static fromJSON(json) {
        const status = new ContextStatus();
        status._code = json.code;
        status._message = json.message;
        status._isValid = json.isValid;
        return status;
    }
    get message() {
        return this._message;
    }
    get code() {
        return this._code;
    }
    get isValid() {
        return this._isValid;
    }
}

class DataCaptureContextSettings extends DefaultSerializeable {
    constructor() {
        super();
        this._frameSettings = new FrameDataSettings();
    }
    get frameDataSettings() {
        return this._frameSettings;
    }
    set frameDataSettings(settings) {
        this._frameSettings = settings;
    }
    frameDataSettingsBuilder() {
        return new FrameDataSettingsBuilder(this._frameSettings);
    }
    setProperty(name, value) {
        this[name] = value;
    }
    getProperty(name) {
        return this[name];
    }
}
__decorate$2([
    nameForSerialization('frameDataSettings')
], DataCaptureContextSettings.prototype, "_frameSettings", void 0);

class OpenSourceSoftwareLicenseInfo {
    constructor(licenseText) {
        this._licenseText = licenseText;
    }
    get licenseText() {
        return this._licenseText;
    }
}

var DataCaptureContextEvents;
(function (DataCaptureContextEvents) {
    DataCaptureContextEvents["didChangeStatus"] = "DataCaptureContextListener.onStatusChanged";
    DataCaptureContextEvents["didStartObservingContext"] = "DataCaptureContextListener.onObservationStarted";
})(DataCaptureContextEvents || (DataCaptureContextEvents = {}));
class DataCaptureContextController extends BaseNewController {
    get framework() {
        return this._proxy.framework;
    }
    get frameworkVersion() {
        return this._proxy.frameworkVersion;
    }
    get privateContext() {
        return this.context;
    }
    static forDataCaptureContext(context) {
        const controller = new DataCaptureContextController();
        controller.context = context;
        return controller;
    }
    constructor() {
        super('DataCaptureContextProxy');
        this._listenerRegistered = false;
    }
    updateContextFromJSON() {
        return __awaiter$2(this, void 0, void 0, function* () {
            try {
                yield this._proxy.$updateContextFromJSON({ contextJson: JSON.stringify(this.context.toJSON()) });
            }
            catch (error) {
                this.notifyListenersOfDeserializationError(error);
                throw error;
            }
        });
    }
    addModeToContext(mode) {
        return this._proxy.$addModeToContext({ modeJson: JSON.stringify(mode.toJSON()) });
    }
    removeModeFromContext(mode) {
        return this._proxy.$removeModeFromContext({ modeJson: JSON.stringify(mode.toJSON()) });
    }
    removeAllModesFromContext() {
        return this._proxy.$removeAllModes();
    }
    dispose() {
        this.unsubscribeListener();
        this._proxy.$disposeContext();
        this._proxy.dispose();
    }
    unsubscribeListener() {
        if (!this._listenerRegistered) {
            return;
        }
        this._proxy.$unsubscribeContextListener();
        this._proxy.unsubscribeFromEvents(Object.values(DataCaptureContextEvents));
        this._proxy.eventEmitter.off(DataCaptureContextEvents.didChangeStatus, this.handleDidChangeStatusEvent.bind(this));
        this._proxy.eventEmitter.off(DataCaptureContextEvents.didStartObservingContext, this.handleDidStartObservingContextEvent.bind(this));
        this._listenerRegistered = false;
    }
    initialize() {
        return this.initializeContextFromJSON();
    }
    initializeContextFromJSON() {
        return __awaiter$2(this, void 0, void 0, function* () {
            try {
                yield this._proxy.$contextFromJSON({ contextJson: JSON.stringify(this.context.toJSON()) });
            }
            catch (error) {
                this.notifyListenersOfDeserializationError(error);
                throw error;
            }
        });
    }
    static getOpenSourceSoftwareLicenseInfo() {
        return __awaiter$2(this, void 0, void 0, function* () {
            const proxy = FactoryMaker.getInstance('DataCaptureContextProxy');
            const result = yield proxy.$getOpenSourceSoftwareLicenseInfo();
            return new OpenSourceSoftwareLicenseInfo(result.data);
        });
    }
    subscribeListener() {
        if (this._listenerRegistered) {
            return;
        }
        this._proxy.$subscribeContextListener();
        this._proxy.subscribeForEvents(Object.values(DataCaptureContextEvents));
        this._proxy.eventEmitter.on(DataCaptureContextEvents.didChangeStatus, this.handleDidChangeStatusEvent.bind(this));
        this._proxy.eventEmitter.on(DataCaptureContextEvents.didStartObservingContext, this.handleDidStartObservingContextEvent.bind(this));
        this._listenerRegistered = true;
    }
    handleDidChangeStatusEvent(eventPayload) {
        const event = EventDataParser.parse(eventPayload.data);
        if (event === null) {
            console.error('DataCaptureContextController didChangeStatus payload is null');
            return;
        }
        const contextStatus = ContextStatus.fromJSON(JSON.parse(event.status));
        this.notifyListenersOfDidChangeStatus(contextStatus);
    }
    handleDidStartObservingContextEvent() {
        this.privateContext.listeners.forEach(listener => {
            var _a;
            (_a = listener.didStartObservingContext) === null || _a === void 0 ? void 0 : _a.call(listener, this.context);
        });
    }
    notifyListenersOfDeserializationError(error) {
        const contextStatus = ContextStatus
            .fromJSON({
            message: error,
            code: -1,
            isValid: true,
        });
        this.notifyListenersOfDidChangeStatus(contextStatus);
    }
    notifyListenersOfDidChangeStatus(contextStatus) {
        this.privateContext.listeners.forEach(listener => {
            if (listener.didChangeStatus) {
                listener.didChangeStatus(this.context, contextStatus);
            }
        });
    }
}

class DataCaptureContext extends DefaultSerializeable {
    static get sharedInstance() {
        if (DataCaptureContext._instance == null) {
            DataCaptureContext._instance = new DataCaptureContext('', '', null);
        }
        return DataCaptureContext._instance;
    }
    static get coreDefaults() {
        return getCoreDefaults();
    }
    get frameSource() {
        return this._frameSource;
    }
    static get deviceID() {
        return DataCaptureContext.coreDefaults.deviceID;
    }
    static forLicenseKey(licenseKey) {
        const instance = DataCaptureContext.create(licenseKey, null, null);
        // Call initialize to ensure the shared instance is updated.
        instance.controller.initialize();
        return instance;
    }
    static forLicenseKeyWithSettings(licenseKey, settings) {
        const instance = DataCaptureContext.create(licenseKey, null, settings);
        // Call initialize to ensure the shared instance is updated.
        instance.controller.initialize();
        return instance;
    }
    static forLicenseKeyWithOptions(licenseKey, options) {
        const instance = DataCaptureContext.create(licenseKey, options, null);
        // Call initialize to ensure the shared instance is updated.
        instance.controller.initialize();
        return instance;
    }
    static initialize(licenseKey, options = null, settings = null) {
        DataCaptureContext.create(licenseKey, options, settings);
        DataCaptureContext.sharedInstance.controller.initialize();
        return DataCaptureContext.sharedInstance;
    }
    static create(licenseKey, options, settings) {
        DataCaptureContext.sharedInstance.licenseKey = licenseKey;
        DataCaptureContext.sharedInstance.deviceName = (options === null || options === void 0 ? void 0 : options.deviceName) || '';
        DataCaptureContext.sharedInstance.settings = settings || new DataCaptureContextSettings();
        return DataCaptureContext.sharedInstance;
    }
    constructor(licenseKey, deviceName, settings) {
        super();
        this.licenseKey = licenseKey;
        this.deviceName = deviceName;
        this._framework = 'unknown';
        this._frameworkVersion = 'unknown';
        this.settings = new DataCaptureContextSettings();
        this._frameSource = null;
        this.view = null;
        this.modes = [];
        this.listeners = [];
        this.licenseKey = licenseKey;
        this.deviceName = deviceName;
        if (settings) {
            this.settings = settings;
        }
        if (this.controller == null) {
            this.controller = DataCaptureContextController.forDataCaptureContext(this);
            this._framework = this.controller.framework;
            this._frameworkVersion = this.controller.frameworkVersion;
        }
    }
    setFrameSource(frameSource) {
        return __awaiter$2(this, void 0, void 0, function* () {
            if (this._frameSource) {
                this._frameSource.context = null;
            }
            this._frameSource = frameSource;
            if (frameSource) {
                // Set the flag to indicate that the native frame source is being created
                frameSource.setNativeFrameSourceIsBeingCreated();
            }
            yield this.update();
            // Make camera active once the set on native side is complete
            if (frameSource) {
                frameSource.context = this;
            }
        });
    }
    addListener(listener) {
        if (this.listeners.length === 0) {
            this.controller.subscribeListener();
        }
        if (this.listeners.includes(listener)) {
            return;
        }
        this.listeners.push(listener);
    }
    removeListener(listener) {
        if (!this.listeners.includes(listener)) {
            return;
        }
        this.listeners.splice(this.listeners.indexOf(listener), 1);
        if (this.listeners.length === 0) {
            this.controller.unsubscribeListener();
        }
    }
    addMode(mode) {
        return __awaiter$2(this, void 0, void 0, function* () {
            yield this.addModeInternal(mode);
        });
    }
    setMode(mode) {
        return __awaiter$2(this, void 0, void 0, function* () {
            yield this.removeAllModes();
            yield this.addModeInternal(mode);
        });
    }
    addModeInternal(mode) {
        return __awaiter$2(this, void 0, void 0, function* () {
            if (!this.modes.includes(mode)) {
                this.modes.push(mode);
                yield this.controller.addModeToContext(mode);
                mode._context = this;
            }
        });
    }
    removeCurrentMode() {
        return __awaiter$2(this, void 0, void 0, function* () {
            if (this.modes.length === 0) {
                return;
            }
            if (this.modes.length > 1) {
                console.warn('removeCurrentMode() called with multiple modes active. Consider using removeMode() for specific mode removal. Only the first mode will be removed.');
            }
            yield this.removeModeInternal(this.modes[0]);
        });
    }
    removeMode(mode) {
        return __awaiter$2(this, void 0, void 0, function* () {
            yield this.removeModeInternal(mode);
        });
    }
    removeModeInternal(mode) {
        return __awaiter$2(this, void 0, void 0, function* () {
            const index = this.modes.indexOf(mode);
            if (index !== -1) {
                this.modes.splice(index, 1);
            }
            mode._context = null;
            yield this.controller.removeModeFromContext(mode);
        });
    }
    removeAllModes() {
        return __awaiter$2(this, void 0, void 0, function* () {
            if (this.modes.length === 0) {
                return;
            }
            this.modes.forEach(mode => {
                mode._context = null;
            });
            this.modes = [];
            yield this.controller.removeAllModesFromContext();
        });
    }
    dispose() {
        return __awaiter$2(this, void 0, void 0, function* () {
            var _a;
            if (!this.controller) {
                return;
            }
            (_a = this.view) === null || _a === void 0 ? void 0 : _a.dispose();
            yield this.removeAllModes();
            this.controller.dispose();
        });
    }
    applySettings(settings) {
        return __awaiter$2(this, void 0, void 0, function* () {
            this.settings = settings;
            yield this.update();
        });
    }
    static getOpenSourceSoftwareLicenseInfo() {
        return __awaiter$2(this, void 0, void 0, function* () {
            return DataCaptureContextController.getOpenSourceSoftwareLicenseInfo();
        });
    }
    update() {
        return __awaiter$2(this, void 0, void 0, function* () {
            if (!this.controller) {
                return;
            }
            yield this.controller.updateContextFromJSON();
        });
    }
}
__decorate$2([
    ignoreFromSerialization
], DataCaptureContext.prototype, "controller", void 0);
__decorate$2([
    nameForSerialization('framework')
], DataCaptureContext.prototype, "_framework", void 0);
__decorate$2([
    nameForSerialization('frameworkVersion')
], DataCaptureContext.prototype, "_frameworkVersion", void 0);
__decorate$2([
    nameForSerialization('frameSource')
], DataCaptureContext.prototype, "_frameSource", void 0);
__decorate$2([
    ignoreFromSerialization
], DataCaptureContext.prototype, "view", void 0);
__decorate$2([
    ignoreFromSerialization
], DataCaptureContext.prototype, "modes", void 0);
__decorate$2([
    ignoreFromSerialization
], DataCaptureContext.prototype, "listeners", void 0);
__decorate$2([
    ignoreFromSerialization
], DataCaptureContext, "_instance", void 0);
__decorate$2([
    ignoreFromSerialization
], DataCaptureContext, "coreDefaults", null);

var DataCaptureViewEvents;
(function (DataCaptureViewEvents) {
    DataCaptureViewEvents["didChangeSize"] = "DataCaptureViewListener.onSizeChanged";
})(DataCaptureViewEvents || (DataCaptureViewEvents = {}));
class DataCaptureViewController extends BaseController {
    constructor(view) {
        super('DataCaptureViewProxy');
        this.view = view;
    }
    viewPointForFramePoint(point) {
        return __awaiter$2(this, void 0, void 0, function* () {
            const result = yield this._proxy.viewPointForFramePoint({ viewId: this.view.viewId, pointJson: JSON.stringify(point.toJSON()) });
            return Point.fromJSON(JSON.parse(result.data));
        });
    }
    viewQuadrilateralForFrameQuadrilateral(quadrilateral) {
        return __awaiter$2(this, void 0, void 0, function* () {
            const result = yield this._proxy.viewQuadrilateralForFrameQuadrilateral({ viewId: this.view.viewId, quadrilateralJson: JSON.stringify(quadrilateral.toJSON()) });
            return Quadrilateral.fromJSON(JSON.parse(result.data));
        });
    }
    setPositionAndSize(top, left, width, height, shouldBeUnderWebView) {
        return this._proxy.setPositionAndSize(top, left, width, height, shouldBeUnderWebView);
    }
    show() {
        if (!this.isViewCreated())
            return Promise.resolve();
        return this._proxy.show();
    }
    hide() {
        if (!this.isViewCreated())
            return Promise.resolve();
        return this._proxy.hide();
    }
    createNativeView() {
        return __awaiter$2(this, void 0, void 0, function* () {
            yield this.createView();
            this.subscribeListener();
        });
    }
    removeNativeView() {
        return this._proxy.removeView(this.view.viewId);
    }
    createView() {
        return this._proxy.createView(JSON.stringify(this.view.toJSON()));
    }
    updateView() {
        if (!this.isViewCreated())
            return Promise.resolve();
        return this._proxy.updateView(JSON.stringify(this.view.toJSON()));
    }
    dispose() {
        this.unsubscribeListener();
    }
    subscribeListener() {
        var _a, _b;
        this._proxy.registerListenerForViewEvents(this.view.viewId);
        (_b = (_a = this._proxy).subscribeDidChangeSize) === null || _b === void 0 ? void 0 : _b.call(_a);
        this.eventEmitter.on(DataCaptureViewEvents.didChangeSize, (data) => {
            const event = EventDataParser.parse(data);
            if (event === null) {
                console.error('DataCaptureViewController didChangeSize payload is null');
                return;
            }
            if (event.viewId !== this.view.viewId) {
                return;
            }
            const size = Size.fromJSON(event.size);
            const orientation = event.orientation;
            this.view.listeners.forEach(listener => {
                if (listener.didChangeSize) {
                    listener.didChangeSize(this.view.viewComponent, size, orientation);
                }
            });
        });
    }
    unsubscribeListener() {
        this._proxy.unregisterListenerForViewEvents(this.view.viewId);
        this.eventEmitter.removeAllListeners(DataCaptureViewEvents.didChangeSize);
    }
    isViewCreated() {
        return this.view.viewId > 0;
    }
}

class BaseDataCaptureView extends DefaultSerializeable {
    get context() {
        return this._context;
    }
    set context(context) {
        if (!(context instanceof DataCaptureContext || context == null)) {
            // This should never happen, but let's just be sure
            throw new Error('The context for a capture view must be a DataCaptureContext');
        }
        this._context = context;
        if (this._context) {
            this._context.view = this;
        }
    }
    get coreDefaults() {
        return getCoreDefaults();
    }
    get scanAreaMargins() {
        return this._scanAreaMargins;
    }
    get viewId() {
        var _a;
        return (_a = this._viewId) !== null && _a !== void 0 ? _a : -1;
    }
    set viewId(newValue) {
        this._viewId = newValue;
    }
    set scanAreaMargins(newValue) {
        this._scanAreaMargins = newValue;
        this.controller.updateView();
    }
    get pointOfInterest() {
        return this._pointOfInterest;
    }
    set pointOfInterest(newValue) {
        this._pointOfInterest = newValue;
        this.controller.updateView();
    }
    get logoAnchor() {
        return this._logoAnchor;
    }
    set logoAnchor(newValue) {
        this._logoAnchor = newValue;
        this.controller.updateView();
    }
    get logoOffset() {
        return this._logoOffset;
    }
    set logoOffset(newValue) {
        this._logoOffset = newValue;
        this.controller.updateView();
    }
    get focusGesture() {
        return this._focusGesture;
    }
    set focusGesture(newValue) {
        this._focusGesture = newValue;
        this.controller.updateView();
    }
    get zoomGesture() {
        return this._zoomGesture;
    }
    set zoomGesture(newValue) {
        this._zoomGesture = newValue;
        this.controller.updateView();
    }
    get logoStyle() {
        return this._logoStyle;
    }
    set logoStyle(newValue) {
        this._logoStyle = newValue;
        this.controller.updateView();
    }
    get privateContext() {
        return this.context;
    }
    static forContext(context) {
        const view = new BaseDataCaptureView(context);
        view.context = context;
        return view;
    }
    constructor(context) {
        super();
        this._context = null;
        this._viewId = -1;
        this.parentId = null;
        this.overlays = [];
        this.controls = [];
        this.listeners = [];
        this.isViewCreated = false;
        this.context = context;
        this._scanAreaMargins = this.coreDefaults.DataCaptureView.scanAreaMargins;
        this._pointOfInterest = this.coreDefaults.DataCaptureView.pointOfInterest;
        this._logoAnchor = this.coreDefaults.DataCaptureView.logoAnchor;
        this._logoOffset = this.coreDefaults.DataCaptureView.logoOffset;
        this._focusGesture = this.coreDefaults.DataCaptureView.focusGesture;
        this._zoomGesture = this.coreDefaults.DataCaptureView.zoomGesture;
        this._logoStyle = this.coreDefaults.DataCaptureView.logoStyle;
        this.controller = new DataCaptureViewController(this);
    }
    addOverlay(overlay) {
        return __awaiter$2(this, void 0, void 0, function* () {
            if (this.overlays.includes(overlay)) {
                return;
            }
            overlay.view = this;
            this.overlays.push(overlay);
            yield this.controller.updateView();
        });
    }
    removeOverlay(overlay) {
        return __awaiter$2(this, void 0, void 0, function* () {
            if (!this.overlays.includes(overlay)) {
                return;
            }
            overlay.view = null;
            this.overlays.splice(this.overlays.indexOf(overlay), 1);
            yield this.controller.updateView();
        });
    }
    removeAllOverlays() {
        if (this.overlays.length === 0) {
            return;
        }
        const overlaysCopy = [...this.overlays];
        for (const overlay of overlaysCopy) {
            overlay.view = null;
            this.overlays.splice(this.overlays.indexOf(overlay), 1);
        }
        this.controller.updateView();
    }
    addListener(listener) {
        if (!this.listeners.includes(listener)) {
            this.listeners.push(listener);
        }
    }
    removeListener(listener) {
        if (this.listeners.includes(listener)) {
            this.listeners.splice(this.listeners.indexOf(listener), 1);
        }
    }
    viewPointForFramePoint(point) {
        return this.controller.viewPointForFramePoint(point);
    }
    viewQuadrilateralForFrameQuadrilateral(quadrilateral) {
        return this.controller.viewQuadrilateralForFrameQuadrilateral(quadrilateral);
    }
    addControl(control) {
        if (!this.controls.includes(control)) {
            control.view = this;
            this.controls.push(control);
            this.controller.updateView();
        }
    }
    addControlWithAnchorAndOffset(control, anchor, offset) {
        if (!this.controls.includes(control)) {
            control.view = this;
            control.anchor = anchor;
            control.offset = offset;
            this.controls.push(control);
            this.controller.updateView();
        }
    }
    removeControl(control) {
        if (this.controls.includes(control)) {
            control.view = null;
            this.controls.splice(this.controls.indexOf(control), 1);
            this.controller.updateView();
        }
    }
    controlUpdated() {
        this.controller.updateView();
    }
    createNativeView(viewId) {
        return __awaiter$2(this, void 0, void 0, function* () {
            if (this.isViewCreated) {
                return Promise.resolve();
            }
            this.viewId = viewId;
            yield this.controller.createNativeView();
            this.isViewCreated = true;
        });
    }
    removeNativeView() {
        return __awaiter$2(this, void 0, void 0, function* () {
            if (!this.isViewCreated) {
                return Promise.resolve();
            }
            this.controller.removeNativeView();
            this.isViewCreated = false;
        });
    }
    dispose() {
        this.removeAllOverlays();
        this.listeners.forEach(listener => this.removeListener(listener));
        this.controller.dispose();
        this.viewId = -1;
        this.isViewCreated = false;
    }
    // HTML Views only
    setFrame(frame, isUnderContent = false) {
        return this.setPositionAndSize(frame.origin.y, frame.origin.x, frame.size.width, frame.size.height, isUnderContent);
    }
    setPositionAndSize(top, left, width, height, shouldBeUnderWebView) {
        return this.controller.setPositionAndSize(top, left, width, height, shouldBeUnderWebView);
    }
    show() {
        if (!this.context) {
            throw new Error('There should be a context attached to a view that should be shown');
        }
        return this.controller.show();
    }
    hide() {
        if (!this.context) {
            throw new Error('There should be a context attached to a view that should be shown');
        }
        return this.controller.hide();
    }
}
__decorate$2([
    ignoreFromSerialization
], BaseDataCaptureView.prototype, "_context", void 0);
__decorate$2([
    ignoreFromSerialization
], BaseDataCaptureView.prototype, "viewComponent", void 0);
__decorate$2([
    ignoreFromSerialization
], BaseDataCaptureView.prototype, "coreDefaults", null);
__decorate$2([
    nameForSerialization('scanAreaMargins')
], BaseDataCaptureView.prototype, "_scanAreaMargins", void 0);
__decorate$2([
    nameForSerialization('viewId')
], BaseDataCaptureView.prototype, "_viewId", void 0);
__decorate$2([
    nameForSerialization('parentId'),
    ignoreFromSerializationIfNull
], BaseDataCaptureView.prototype, "parentId", void 0);
__decorate$2([
    nameForSerialization('pointOfInterest')
], BaseDataCaptureView.prototype, "_pointOfInterest", void 0);
__decorate$2([
    nameForSerialization('logoAnchor')
], BaseDataCaptureView.prototype, "_logoAnchor", void 0);
__decorate$2([
    nameForSerialization('logoOffset')
], BaseDataCaptureView.prototype, "_logoOffset", void 0);
__decorate$2([
    nameForSerialization('focusGesture')
], BaseDataCaptureView.prototype, "_focusGesture", void 0);
__decorate$2([
    nameForSerialization('zoomGesture')
], BaseDataCaptureView.prototype, "_zoomGesture", void 0);
__decorate$2([
    nameForSerialization('logoStyle')
], BaseDataCaptureView.prototype, "_logoStyle", void 0);
__decorate$2([
    ignoreFromSerialization
], BaseDataCaptureView.prototype, "controller", void 0);
__decorate$2([
    ignoreFromSerialization
], BaseDataCaptureView.prototype, "listeners", void 0);
__decorate$2([
    ignoreFromSerialization
], BaseDataCaptureView.prototype, "isViewCreated", void 0);

class ZoomSwitchControl extends DefaultSerializeable {
    constructor() {
        super(...arguments);
        this.type = 'zoom';
        this.icon = {
            zoomedOut: { default: null, pressed: null },
            zoomedIn: { default: null, pressed: null },
        };
        this.view = null;
        this.anchor = null;
        this.offset = null;
    }
    get zoomedOutImage() {
        var _a, _b;
        if (((_a = this.icon.zoomedOut.default) === null || _a === void 0 ? void 0 : _a.isBase64EncodedImage()) == true) {
            return (_b = this.icon.zoomedOut.default) === null || _b === void 0 ? void 0 : _b.data;
        }
        return null;
    }
    set zoomedOutImage(zoomedOutImage) {
        var _a;
        this.icon.zoomedOut.default = ControlImage.fromBase64EncodedImage(zoomedOutImage);
        (_a = this.view) === null || _a === void 0 ? void 0 : _a.controlUpdated();
    }
    get zoomedInImage() {
        var _a, _b;
        if (((_a = this.icon.zoomedIn.default) === null || _a === void 0 ? void 0 : _a.isBase64EncodedImage()) == true) {
            return (_b = this.icon.zoomedIn.default) === null || _b === void 0 ? void 0 : _b.data;
        }
        return null;
    }
    set zoomedInImage(zoomedInImage) {
        var _a;
        this.icon.zoomedIn.default = ControlImage.fromBase64EncodedImage(zoomedInImage);
        (_a = this.view) === null || _a === void 0 ? void 0 : _a.controlUpdated();
    }
    get zoomedInPressedImage() {
        var _a, _b;
        if (((_a = this.icon.zoomedIn.pressed) === null || _a === void 0 ? void 0 : _a.isBase64EncodedImage()) == true) {
            return (_b = this.icon.zoomedIn.pressed) === null || _b === void 0 ? void 0 : _b.data;
        }
        return null;
    }
    set zoomedInPressedImage(zoomedInPressedImage) {
        var _a;
        this.icon.zoomedIn.pressed = ControlImage.fromBase64EncodedImage(zoomedInPressedImage);
        (_a = this.view) === null || _a === void 0 ? void 0 : _a.controlUpdated();
    }
    get zoomedOutPressedImage() {
        var _a, _b;
        if (((_a = this.icon.zoomedOut.pressed) === null || _a === void 0 ? void 0 : _a.isBase64EncodedImage()) == true) {
            return (_b = this.icon.zoomedOut.pressed) === null || _b === void 0 ? void 0 : _b.data;
        }
        return null;
    }
    set zoomedOutPressedImage(zoomedOutPressedImage) {
        var _a;
        this.icon.zoomedOut.pressed = ControlImage.fromBase64EncodedImage(zoomedOutPressedImage);
        (_a = this.view) === null || _a === void 0 ? void 0 : _a.controlUpdated();
    }
    setZoomedInImage(resource) {
        var _a;
        this.icon.zoomedIn.default = ControlImage.fromResourceName(resource);
        (_a = this.view) === null || _a === void 0 ? void 0 : _a.controlUpdated();
    }
    setZoomedInPressedImage(resource) {
        var _a;
        this.icon.zoomedIn.pressed = ControlImage.fromResourceName(resource);
        (_a = this.view) === null || _a === void 0 ? void 0 : _a.controlUpdated();
    }
    setZoomedOutImage(resource) {
        var _a;
        this.icon.zoomedOut.default = ControlImage.fromResourceName(resource);
        (_a = this.view) === null || _a === void 0 ? void 0 : _a.controlUpdated();
    }
    setZoomedOutPressedImage(resource) {
        var _a;
        this.icon.zoomedOut.pressed = ControlImage.fromResourceName(resource);
        (_a = this.view) === null || _a === void 0 ? void 0 : _a.controlUpdated();
    }
}
__decorate$2([
    ignoreFromSerialization
], ZoomSwitchControl.prototype, "view", void 0);

class TorchSwitchControl extends DefaultSerializeable {
    constructor() {
        super(...arguments);
        this.type = 'torch';
        this.icon = {
            on: { default: null, pressed: null },
            off: { default: null, pressed: null },
        };
        this.view = null;
        this.anchor = null;
        this.offset = null;
    }
    get torchOffImage() {
        var _a, _b;
        if (((_a = this.icon.off.default) === null || _a === void 0 ? void 0 : _a.isBase64EncodedImage()) == true) {
            return (_b = this.icon.off.default) === null || _b === void 0 ? void 0 : _b.data;
        }
        return null;
    }
    set torchOffImage(torchOffImage) {
        var _a;
        this.icon.off.default = ControlImage.fromBase64EncodedImage(torchOffImage);
        (_a = this.view) === null || _a === void 0 ? void 0 : _a.controlUpdated();
    }
    get torchOffPressedImage() {
        var _a, _b;
        if (((_a = this.icon.off.pressed) === null || _a === void 0 ? void 0 : _a.isBase64EncodedImage()) == true) {
            return (_b = this.icon.off.pressed) === null || _b === void 0 ? void 0 : _b.data;
        }
        return null;
    }
    set torchOffPressedImage(torchOffPressedImage) {
        var _a;
        this.icon.off.pressed = ControlImage.fromBase64EncodedImage(torchOffPressedImage);
        (_a = this.view) === null || _a === void 0 ? void 0 : _a.controlUpdated();
    }
    get torchOnImage() {
        var _a, _b;
        if (((_a = this.icon.on.default) === null || _a === void 0 ? void 0 : _a.isBase64EncodedImage()) == true) {
            return (_b = this.icon.on.default) === null || _b === void 0 ? void 0 : _b.data;
        }
        return null;
    }
    set torchOnImage(torchOnImage) {
        var _a;
        this.icon.on.default = ControlImage.fromBase64EncodedImage(torchOnImage);
        (_a = this.view) === null || _a === void 0 ? void 0 : _a.controlUpdated();
    }
    get torchOnPressedImage() {
        var _a, _b;
        if (((_a = this.icon.on.pressed) === null || _a === void 0 ? void 0 : _a.isBase64EncodedImage()) == true) {
            return (_b = this.icon.on.pressed) === null || _b === void 0 ? void 0 : _b.data;
        }
        return null;
    }
    setTorchOffImage(resource) {
        var _a;
        this.icon.off.default = ControlImage.fromResourceName(resource);
        (_a = this.view) === null || _a === void 0 ? void 0 : _a.controlUpdated();
    }
    setTorchOffPressedImage(resource) {
        var _a;
        this.icon.off.pressed = ControlImage.fromResourceName(resource);
        (_a = this.view) === null || _a === void 0 ? void 0 : _a.controlUpdated();
    }
    setTorchOnImage(resource) {
        var _a;
        this.icon.on.default = ControlImage.fromResourceName(resource);
        (_a = this.view) === null || _a === void 0 ? void 0 : _a.controlUpdated();
    }
    setTorchOnPressedImage(resource) {
        var _a;
        this.icon.on.pressed = ControlImage.fromResourceName(resource);
        (_a = this.view) === null || _a === void 0 ? void 0 : _a.controlUpdated();
    }
    setImageResource(resource) {
        var _a;
        this.icon.off.default = ControlImage.fromResourceName(resource);
        this.icon.off.pressed = ControlImage.fromResourceName(resource);
        this.icon.on.default = ControlImage.fromResourceName(resource);
        this.icon.on.pressed = ControlImage.fromResourceName(resource);
        (_a = this.view) === null || _a === void 0 ? void 0 : _a.controlUpdated();
    }
    set torchOnPressedImage(torchOnPressedImage) {
        var _a;
        this.icon.on.pressed = ControlImage.fromBase64EncodedImage(torchOnPressedImage);
        (_a = this.view) === null || _a === void 0 ? void 0 : _a.controlUpdated();
    }
}
__decorate$2([
    ignoreFromSerialization
], TorchSwitchControl.prototype, "view", void 0);

exports.VideoResolution = void 0;
(function (VideoResolution) {
    /** @deprecated Auto is deprecated. Please use the capture mode's recommendedCameraSettings for the best results. */
    VideoResolution["Auto"] = "auto";
    VideoResolution["HD"] = "hd";
    VideoResolution["FullHD"] = "fullHd";
    VideoResolution["UHD4K"] = "uhd4k";
})(exports.VideoResolution || (exports.VideoResolution = {}));

exports.FocusRange = void 0;
(function (FocusRange) {
    FocusRange["Full"] = "full";
    FocusRange["Near"] = "near";
    FocusRange["Far"] = "far";
})(exports.FocusRange || (exports.FocusRange = {}));

exports.FocusGestureStrategy = void 0;
(function (FocusGestureStrategy) {
    FocusGestureStrategy["None"] = "none";
    FocusGestureStrategy["Manual"] = "manual";
    FocusGestureStrategy["ManualUntilCapture"] = "manualUntilCapture";
    FocusGestureStrategy["AutoOnLocation"] = "autoOnLocation";
})(exports.FocusGestureStrategy || (exports.FocusGestureStrategy = {}));

exports.LogoStyle = void 0;
(function (LogoStyle) {
    LogoStyle["Minimal"] = "minimal";
    LogoStyle["Extended"] = "extended";
})(exports.LogoStyle || (exports.LogoStyle = {}));

class CameraSettings extends DefaultSerializeable {
    static get coreDefaults() {
        return getCoreDefaults();
    }
    get focusRange() {
        return this.focus.range;
    }
    set focusRange(newRange) {
        this.focus.range = newRange;
    }
    get focusGestureStrategy() {
        return this.focus.focusGestureStrategy;
    }
    set focusGestureStrategy(newStrategy) {
        this.focus.focusGestureStrategy = newStrategy;
    }
    get shouldPreferSmoothAutoFocus() {
        return this.focus.shouldPreferSmoothAutoFocus;
    }
    set shouldPreferSmoothAutoFocus(newShouldPreferSmoothAutoFocus) {
        this.focus.shouldPreferSmoothAutoFocus = newShouldPreferSmoothAutoFocus;
    }
    static fromJSON(json) {
        const settings = new CameraSettings();
        settings.preferredResolution = json.preferredResolution;
        settings.zoomFactor = json.zoomFactor;
        settings.focusRange = json.focusRange;
        settings.zoomGestureZoomFactor = json.zoomGestureZoomFactor;
        settings.focusGestureStrategy = json.focusGestureStrategy;
        settings.shouldPreferSmoothAutoFocus = json.shouldPreferSmoothAutoFocus;
        if (json.properties !== undefined) {
            for (const key of Object.keys(json.properties)) {
                settings.setProperty(key, json.properties[key]);
            }
        }
        return settings;
    }
    constructor(settings) {
        var _a, _b, _c, _d, _e, _f;
        super();
        this.focusHiddenProperties = [
            'range',
            'manualLensPosition',
            'shouldPreferSmoothAutoFocus',
            'focusStrategy',
            'focusGestureStrategy'
        ];
        this.preferredResolution = CameraSettings.coreDefaults.Camera.Settings.preferredResolution;
        this.zoomFactor = CameraSettings.coreDefaults.Camera.Settings.zoomFactor;
        this.zoomGestureZoomFactor = CameraSettings.coreDefaults.Camera.Settings.zoomGestureZoomFactor;
        this.focus = {
            range: CameraSettings.coreDefaults.Camera.Settings.focusRange,
            focusGestureStrategy: CameraSettings.coreDefaults.Camera.Settings.focusGestureStrategy,
            shouldPreferSmoothAutoFocus: CameraSettings.coreDefaults.Camera.Settings.shouldPreferSmoothAutoFocus
        };
        this.preferredResolution = (_a = settings === null || settings === void 0 ? void 0 : settings.preferredResolution) !== null && _a !== void 0 ? _a : CameraSettings.coreDefaults.Camera.Settings.preferredResolution;
        this.zoomFactor = (_b = settings === null || settings === void 0 ? void 0 : settings.zoomFactor) !== null && _b !== void 0 ? _b : CameraSettings.coreDefaults.Camera.Settings.zoomFactor;
        this.zoomGestureZoomFactor = (_c = settings === null || settings === void 0 ? void 0 : settings.zoomGestureZoomFactor) !== null && _c !== void 0 ? _c : CameraSettings.coreDefaults.Camera.Settings.zoomGestureZoomFactor;
        this.focus = {
            range: (_d = settings === null || settings === void 0 ? void 0 : settings.focusRange) !== null && _d !== void 0 ? _d : CameraSettings.coreDefaults.Camera.Settings.focusRange,
            focusGestureStrategy: (_e = settings === null || settings === void 0 ? void 0 : settings.focusGestureStrategy) !== null && _e !== void 0 ? _e : CameraSettings.coreDefaults.Camera.Settings.focusGestureStrategy,
            shouldPreferSmoothAutoFocus: (_f = settings === null || settings === void 0 ? void 0 : settings.shouldPreferSmoothAutoFocus) !== null && _f !== void 0 ? _f : CameraSettings.coreDefaults.Camera.Settings.shouldPreferSmoothAutoFocus,
        };
        if (settings !== undefined && settings !== null) {
            Object.getOwnPropertyNames(settings).forEach(propertyName => {
                this[propertyName] = settings[propertyName];
            });
        }
    }
    setProperty(name, value) {
        if (this.focusHiddenProperties.includes(name)) {
            this.focus[name] = value;
            return;
        }
        this[name] = value;
    }
    getProperty(name) {
        if (this.focusHiddenProperties.includes(name)) {
            return this.focus[name];
        }
        return this[name];
    }
}
__decorate$2([
    ignoreFromSerialization
], CameraSettings.prototype, "focusHiddenProperties", void 0);

const NoViewfinder = { type: 'none' };

class RectangularViewfinderAnimation extends DefaultSerializeable {
    static fromJSON(json) {
        if (json === null) {
            return null;
        }
        return new RectangularViewfinderAnimation(json.looping);
    }
    get isLooping() {
        return this._isLooping;
    }
    constructor(isLooping) {
        super();
        this._isLooping = false;
        this._isLooping = isLooping;
    }
}
__decorate$2([
    nameForSerialization('isLooping')
], RectangularViewfinderAnimation.prototype, "_isLooping", void 0);

class RectangularViewfinder extends DefaultSerializeable {
    get sizeWithUnitAndAspect() {
        return this._sizeWithUnitAndAspect;
    }
    set sizeWithUnitAndAspect(value) {
        this._sizeWithUnitAndAspect = value;
        this.update();
    }
    get coreDefaults() {
        return getCoreDefaults();
    }
    constructor(style, lineStyle) {
        super();
        this.type = 'rectangular';
        this.eventEmitter = FactoryMaker.getInstance('EventEmitter');
        const viewfinderStyle = style || this.coreDefaults.RectangularViewfinder.defaultStyle;
        this._style = this.coreDefaults.RectangularViewfinder.styles[viewfinderStyle].style;
        this._lineStyle = this.coreDefaults.RectangularViewfinder.styles[viewfinderStyle].lineStyle;
        this._dimming = parseFloat(this.coreDefaults.RectangularViewfinder.styles[viewfinderStyle].dimming);
        this._disabledDimming =
            parseFloat(this.coreDefaults.RectangularViewfinder.styles[viewfinderStyle].disabledDimming);
        this._animation = this.coreDefaults.RectangularViewfinder.styles[viewfinderStyle].animation;
        this.color = this.coreDefaults.RectangularViewfinder.styles[viewfinderStyle].color;
        this._sizeWithUnitAndAspect = this.coreDefaults.RectangularViewfinder.styles[viewfinderStyle].size;
        this._disabledColor = this.coreDefaults.RectangularViewfinder.styles[viewfinderStyle].disabledColor;
        if (lineStyle !== undefined) {
            this._lineStyle = lineStyle;
        }
    }
    get style() {
        return this._style;
    }
    get lineStyle() {
        return this._lineStyle;
    }
    get dimming() {
        return this._dimming;
    }
    set dimming(value) {
        this._dimming = value;
        this.update();
    }
    get disabledDimming() {
        return this._disabledDimming;
    }
    set disabledDimming(value) {
        this._disabledDimming = value;
        this.update();
    }
    get animation() {
        return this._animation;
    }
    set animation(animation) {
        this._animation = animation;
        this.update();
    }
    setSize(size) {
        this.sizeWithUnitAndAspect = SizeWithUnitAndAspect.sizeWithWidthAndHeight(size);
    }
    setWidthAndAspectRatio(width, heightToWidthAspectRatio) {
        this.sizeWithUnitAndAspect = SizeWithUnitAndAspect.sizeWithWidthAndAspectRatio(width, heightToWidthAspectRatio);
    }
    setHeightAndAspectRatio(height, widthToHeightAspectRatio) {
        this.sizeWithUnitAndAspect = SizeWithUnitAndAspect.sizeWithHeightAndAspectRatio(height, widthToHeightAspectRatio);
    }
    setShorterDimensionAndAspectRatio(fraction, aspectRatio) {
        this.sizeWithUnitAndAspect = SizeWithUnitAndAspect.sizeWithShorterDimensionAndAspectRatio(new NumberWithUnit(fraction, exports.MeasureUnit.Fraction), aspectRatio);
    }
    get disabledColor() {
        return this._disabledColor;
    }
    set disabledColor(value) {
        this._disabledColor = value;
        this.update();
    }
    update() {
        this.eventEmitter.emit('viewfinder.update');
    }
}
__decorate$2([
    nameForSerialization('style')
], RectangularViewfinder.prototype, "_style", void 0);
__decorate$2([
    nameForSerialization('lineStyle')
], RectangularViewfinder.prototype, "_lineStyle", void 0);
__decorate$2([
    nameForSerialization('dimming')
], RectangularViewfinder.prototype, "_dimming", void 0);
__decorate$2([
    nameForSerialization('disabledDimming')
], RectangularViewfinder.prototype, "_disabledDimming", void 0);
__decorate$2([
    nameForSerialization('animation'),
    ignoreFromSerialization
], RectangularViewfinder.prototype, "_animation", void 0);
__decorate$2([
    nameForSerialization('size')
], RectangularViewfinder.prototype, "_sizeWithUnitAndAspect", void 0);
__decorate$2([
    nameForSerialization('disabledColor')
], RectangularViewfinder.prototype, "_disabledColor", void 0);
__decorate$2([
    ignoreFromSerialization
], RectangularViewfinder.prototype, "eventEmitter", void 0);

exports.RectangularViewfinderStyle = void 0;
(function (RectangularViewfinderStyle) {
    RectangularViewfinderStyle["Rounded"] = "rounded";
    RectangularViewfinderStyle["Square"] = "square";
})(exports.RectangularViewfinderStyle || (exports.RectangularViewfinderStyle = {}));

exports.RectangularViewfinderLineStyle = void 0;
(function (RectangularViewfinderLineStyle) {
    RectangularViewfinderLineStyle["Light"] = "light";
    RectangularViewfinderLineStyle["Bold"] = "bold";
})(exports.RectangularViewfinderLineStyle || (exports.RectangularViewfinderLineStyle = {}));

class AimerViewfinder extends DefaultSerializeable {
    get coreDefaults() {
        return getCoreDefaults();
    }
    constructor() {
        super();
        this.type = 'aimer';
        this.frameColor = this.coreDefaults.AimerViewfinder.frameColor;
        this.dotColor = this.coreDefaults.AimerViewfinder.dotColor;
    }
}

class LaserlineViewfinder extends DefaultSerializeable {
    get coreDefaults() {
        return getCoreDefaults();
    }
    constructor() {
        super();
        this.type = 'laserline';
        this.width = this.coreDefaults.LaserlineViewfinder.width;
        this.enabledColor = this.coreDefaults.LaserlineViewfinder.enabledColor;
        this.disabledColor = this.coreDefaults.LaserlineViewfinder.disabledColor;
    }
}

function parseDefaults(jsonDefaults) {
    const coreDefaults = {
        Camera: {
            Settings: {
                preferredResolution: jsonDefaults.Camera.Settings.preferredResolution,
                zoomFactor: jsonDefaults.Camera.Settings.zoomFactor,
                focusRange: jsonDefaults.Camera.Settings.focusRange,
                zoomGestureZoomFactor: jsonDefaults.Camera.Settings.zoomGestureZoomFactor,
                focusGestureStrategy: jsonDefaults.Camera.Settings.focusGestureStrategy,
                shouldPreferSmoothAutoFocus: jsonDefaults.Camera.Settings.shouldPreferSmoothAutoFocus,
                properties: jsonDefaults.Camera.Settings.properties,
            },
            defaultPosition: (jsonDefaults.Camera.defaultPosition || null),
            availablePositions: jsonDefaults.Camera.availablePositions,
        },
        DataCaptureView: {
            scanAreaMargins: MarginsWithUnit
                .fromJSON(JSON.parse(jsonDefaults.DataCaptureView.scanAreaMargins)),
            pointOfInterest: PointWithUnit
                .fromJSON(JSON.parse(jsonDefaults.DataCaptureView.pointOfInterest)),
            logoAnchor: jsonDefaults.DataCaptureView.logoAnchor,
            logoOffset: PointWithUnit
                .fromJSON(JSON.parse(jsonDefaults.DataCaptureView.logoOffset)),
            focusGesture: PrivateFocusGestureDeserializer
                .fromJSON(JSON.parse(jsonDefaults.DataCaptureView.focusGesture)),
            zoomGesture: PrivateZoomGestureDeserializer
                .fromJSON(JSON.parse(jsonDefaults.DataCaptureView.zoomGesture)),
            logoStyle: jsonDefaults.DataCaptureView.logoStyle,
        },
        RectangularViewfinder: Object
            .keys(jsonDefaults.RectangularViewfinder.styles)
            .reduce((acc, key) => {
            const viewfinder = jsonDefaults.RectangularViewfinder.styles[key];
            acc.styles[key] = {
                size: SizeWithUnitAndAspect
                    .fromJSON(JSON.parse(viewfinder.size)),
                color: Color.fromJSON(viewfinder.color),
                disabledColor: Color.fromJSON(viewfinder.disabledColor),
                style: viewfinder.style,
                lineStyle: viewfinder.lineStyle,
                dimming: viewfinder.dimming,
                disabledDimming: viewfinder.disabledDimming,
                animation: RectangularViewfinderAnimation
                    .fromJSON(JSON.parse(viewfinder.animation)),
            };
            return acc;
        }, { defaultStyle: jsonDefaults.RectangularViewfinder.defaultStyle, styles: {} }),
        AimerViewfinder: {
            frameColor: Color.fromJSON(jsonDefaults.AimerViewfinder.frameColor),
            dotColor: Color.fromJSON(jsonDefaults.AimerViewfinder.dotColor),
        },
        Brush: new Brush(Color
            .fromJSON(jsonDefaults.Brush.fillColor), Color
            .fromJSON(jsonDefaults.Brush.strokeColor), jsonDefaults.Brush.strokeWidth),
        LaserlineViewfinder: {
            width: NumberWithUnit.fromJSON(JSON.parse(jsonDefaults.LaserlineViewfinder.width)),
            enabledColor: Color.fromJSON(jsonDefaults.LaserlineViewfinder.enabledColor),
            disabledColor: Color.fromJSON(jsonDefaults.LaserlineViewfinder.disabledColor),
        },
        deviceID: jsonDefaults.deviceID,
    };
    // Inject defaults to avoid a circular dependency between these classes and the defaults
    Brush.defaults = coreDefaults.Brush;
    return coreDefaults;
}

function loadCoreDefaults(jsonDefaults) {
    const coreDefaults = parseDefaults(jsonDefaults);
    FactoryMaker.bindInstanceIfNotExists('CoreDefaults', coreDefaults);
}

var VibrationType;
(function (VibrationType) {
    VibrationType["default"] = "default";
    VibrationType["selectionHaptic"] = "selectionHaptic";
    VibrationType["successHaptic"] = "successHaptic";
    VibrationType["waveForm"] = "waveForm";
    VibrationType["impactHaptic"] = "impactHaptic";
})(VibrationType || (VibrationType = {}));

class Vibration extends DefaultSerializeable {
    static get defaultVibration() {
        return new Vibration(VibrationType.default);
    }
    static get selectionHapticFeedback() {
        return new Vibration(VibrationType.selectionHaptic);
    }
    static get successHapticFeedback() {
        return new Vibration(VibrationType.successHaptic);
    }
    static get impactHapticFeedback() {
        return new Vibration(VibrationType.impactHaptic);
    }
    static fromJSON(json) {
        if (json.type === 'waveForm') {
            return new WaveFormVibration(json.timings, json.amplitudes);
        }
        return new Vibration(json.type);
    }
    constructor(type) {
        super();
        this.type = type;
    }
}
class WaveFormVibration extends Vibration {
    get timings() {
        return this._timings;
    }
    get amplitudes() {
        return this._amplitudes;
    }
    constructor(timings, amplitudes = null) {
        super(VibrationType.waveForm);
        this._timings = timings;
        this._amplitudes = amplitudes;
    }
}
__decorate$2([
    nameForSerialization('timings')
], WaveFormVibration.prototype, "_timings", void 0);
__decorate$2([
    ignoreFromSerializationIfNull,
    nameForSerialization('amplitudes')
], WaveFormVibration.prototype, "_amplitudes", void 0);

class Sound extends DefaultSerializeable {
    static get defaultSound() {
        return new Sound(null);
    }
    static fromJSON(json) {
        return new Sound(json.resource);
    }
    constructor(resource) {
        super();
        this.resource = null;
        this.resource = resource;
    }
}
__decorate$2([
    ignoreFromSerializationIfNull
], Sound.prototype, "resource", void 0);

class FeedbackController {
    constructor(feedback) {
        this.feedback = feedback;
        this._proxy = FactoryMaker.getInstance('FeedbackProxy');
    }
    static forFeedback(feedback) {
        const controller = new FeedbackController(feedback);
        return controller;
    }
    emit() {
        this._proxy.emitFeedback(this.feedback);
    }
}

class Feedback extends DefaultSerializeable {
    static get defaultFeedback() {
        return new Feedback(Vibration.defaultVibration, Sound.defaultSound);
    }
    get vibration() {
        return this._vibration;
    }
    get sound() {
        return this._sound;
    }
    static fromJSON(json) {
        return new Feedback((json === null || json === void 0 ? void 0 : json.vibration) ? Vibration.fromJSON(json.vibration) : null, (json === null || json === void 0 ? void 0 : json.sound) ? Sound.fromJSON(json.sound) : null);
    }
    constructor(vibration, sound) {
        super();
        this._vibration = null;
        this._sound = null;
        this._vibration = vibration;
        this._sound = sound;
        this.controller = FeedbackController.forFeedback(this);
    }
    emit() {
        this.controller.emit();
    }
    toJSON() {
        return super.toJSON();
    }
}
__decorate$2([
    ignoreFromSerializationIfNull,
    nameForSerialization('vibration')
], Feedback.prototype, "_vibration", void 0);
__decorate$2([
    ignoreFromSerializationIfNull,
    nameForSerialization('sound')
], Feedback.prototype, "_sound", void 0);
__decorate$2([
    ignoreFromSerialization
], Feedback.prototype, "controller", void 0);

const NoneLocationSelection = { type: 'none' };

class RadiusLocationSelection extends DefaultSerializeable {
    get radius() {
        return this._radius;
    }
    static fromJSON(locationSelectionJson) {
        const radius = NumberWithUnit.fromJSON(locationSelectionJson.radius);
        return new RadiusLocationSelection(radius);
    }
    constructor(radius) {
        super();
        this.type = 'radius';
        this._radius = radius;
    }
}
__decorate$2([
    nameForSerialization('radius')
], RadiusLocationSelection.prototype, "_radius", void 0);

class RectangularLocationSelection extends DefaultSerializeable {
    constructor() {
        super(...arguments);
        this.type = 'rectangular';
    }
    get sizeWithUnitAndAspect() {
        return this._sizeWithUnitAndAspect;
    }
    static withSize(size) {
        const locationSelection = new RectangularLocationSelection();
        locationSelection._sizeWithUnitAndAspect = SizeWithUnitAndAspect.sizeWithWidthAndHeight(size);
        return locationSelection;
    }
    static withWidthAndAspectRatio(width, heightToWidthAspectRatio) {
        const locationSelection = new RectangularLocationSelection();
        locationSelection._sizeWithUnitAndAspect = SizeWithUnitAndAspect
            .sizeWithWidthAndAspectRatio(width, heightToWidthAspectRatio);
        return locationSelection;
    }
    static withHeightAndAspectRatio(height, widthToHeightAspectRatio) {
        const locationSelection = new RectangularLocationSelection();
        locationSelection._sizeWithUnitAndAspect = SizeWithUnitAndAspect
            .sizeWithHeightAndAspectRatio(height, widthToHeightAspectRatio);
        return locationSelection;
    }
    static fromJSON(rectangularLocationSelectionJSON) {
        if (rectangularLocationSelectionJSON.aspect.width && rectangularLocationSelectionJSON.aspect.height) {
            const width = NumberWithUnit
                .fromJSON(rectangularLocationSelectionJSON.aspect.width);
            const height = NumberWithUnit
                .fromJSON(rectangularLocationSelectionJSON.aspect.height);
            const size = new SizeWithUnit(width, height);
            return this.withSize(size);
        }
        else if (rectangularLocationSelectionJSON.aspect.width && rectangularLocationSelectionJSON.aspect.aspect) {
            const width = NumberWithUnit
                .fromJSON(rectangularLocationSelectionJSON.aspect.width);
            return this.withWidthAndAspectRatio(width, rectangularLocationSelectionJSON.aspect.aspect);
        }
        else if (rectangularLocationSelectionJSON.aspect.height && rectangularLocationSelectionJSON.aspect.aspect) {
            const height = NumberWithUnit
                .fromJSON(rectangularLocationSelectionJSON.aspect.height);
            return this.withHeightAndAspectRatio(height, rectangularLocationSelectionJSON.aspect.aspect);
        }
        else if (rectangularLocationSelectionJSON.aspect.shorterDimension && rectangularLocationSelectionJSON.aspect.aspect) {
            const shorterDimension = NumberWithUnit
                .fromJSON(rectangularLocationSelectionJSON.aspect.shorterDimension);
            const sizeWithUnitAndAspect = SizeWithUnitAndAspect
                .sizeWithShorterDimensionAndAspectRatio(shorterDimension, rectangularLocationSelectionJSON.aspect.aspect);
            const locationSelection = new RectangularLocationSelection();
            locationSelection._sizeWithUnitAndAspect = sizeWithUnitAndAspect;
            return locationSelection;
        }
        else {
            throw new Error(`RectangularLocationSelectionJSON is malformed: ${JSON.stringify(rectangularLocationSelectionJSON)}`);
        }
    }
}
__decorate$2([
    nameForSerialization('size')
], RectangularLocationSelection.prototype, "_sizeWithUnitAndAspect", void 0);

class LicenseInfo extends DefaultSerializeable {
    get expiration() {
        return this._expiration;
    }
}
__decorate$2([
    nameForSerialization('expiration')
    // @ts-ignore
], LicenseInfo.prototype, "_expiration", void 0);

var Expiration;
(function (Expiration) {
    Expiration["Available"] = "available";
    Expiration["Perpetual"] = "perpetual";
    Expiration["NotAvailable"] = "notAvailable";
})(Expiration || (Expiration = {}));

class BaseInstanceAwareNativeProxy {
    constructor() {
        this.eventEmitter = new EventEmitter();
    }
}

/**
 * JS Proxy hook to act as middleware to all the calls performed by an AdvancedNativeProxy instance
 * This will allow AdvancedNativeProxy to call dynamically the methods defined in the interface defined
 * as parameter in createAdvancedNativeProxy function
 */
const advancedInstanceAwareNativeProxyHook = {
    /**
     * Dynamic property getter for the AdvancedNativeProxy
     * In order to call a native method this needs to be preceded by the `$` symbol on the name, ie `$methodName`
     * In order to set a native event handler this needs to be preceded by `on$` prefix, ie `on$eventName`
     * @param advancedNativeProxy
     * @param prop
     */
    get(advancedNativeProxy, prop) {
        // Early return if prop is not a string
        if (typeof prop !== 'string') {
            return undefined;
        }
        // Important: $ and on$ are required since if they are not added all
        // properties present on AdvancedNativeProxy will be redirected to the
        // advancedNativeProxy._call, which will call native even for the own
        // properties of the class
        // All the methods with the following structure
        // $methodName will be redirected to the special _call
        // method on AdvancedNativeProxy
        if (prop.startsWith("$")) {
            if (prop in advancedNativeProxy) {
                return advancedNativeProxy[prop];
            }
            return (args) => {
                return advancedNativeProxy._call(prop.substring(1), args);
            };
            // All methods with the following structure
            // on$methodName will trigger the event handler properties
        }
        else if (prop.startsWith("on$")) {
            return advancedNativeProxy[prop.substring(3)];
            // Everything else will be taken as a property
        }
        else {
            return advancedNativeProxy[prop];
        }
    }
};
/**
 * AdvancedNativeProxy will provide an easy way to communicate between native proxies
 * and other parts of the architecture such as the controller layer
 */
class AdvancedInstanceAwareNativeProxy extends BaseInstanceAwareNativeProxy {
    constructor(nativeCaller, events = []) {
        super();
        this.nativeCaller = nativeCaller;
        this.events = events;
        this.eventSubscriptions = new Map();
        this.eventHandlers = new Map();
        this.events.forEach((event) => __awaiter$2(this, void 0, void 0, function* () {
            yield this._registerEvent(event);
        }));
        // Wrapping the AdvancedNativeProxy instance with the JS proxy hook
        return new Proxy(this, advancedInstanceAwareNativeProxyHook);
    }
    dispose() {
        return __awaiter$2(this, void 0, void 0, function* () {
            for (const event of this.events) {
                yield this._unregisterEvent(event);
            }
            this.eventSubscriptions.clear();
            this.events = [];
        });
    }
    _call(fnName, args) {
        return this.nativeCaller.callFn(fnName, args);
    }
    _registerEvent(event) {
        return __awaiter$2(this, void 0, void 0, function* () {
            const handler = (args) => __awaiter$2(this, void 0, void 0, function* () {
                this.eventEmitter.emit(event.nativeEventName, args);
            });
            const instanceHandler = (args) => __awaiter$2(this, void 0, void 0, function* () {
                try {
                    const hookArg = this.nativeCaller.eventHook(args);
                    yield this[`on$${event.name}`](hookArg);
                }
                catch (e) {
                    console.error(`Error while trying to execute handler for ${event.nativeEventName}`, e);
                    throw e;
                }
            });
            // Store the instance-specific handler
            this.eventHandlers.set(event.nativeEventName, instanceHandler);
            this.eventEmitter.on(event.nativeEventName, instanceHandler);
            const subscription = yield this.nativeCaller.registerEvent(event.nativeEventName, handler);
            this.eventSubscriptions.set(event.name, subscription);
        });
    }
    _unregisterEvent(event) {
        return __awaiter$2(this, void 0, void 0, function* () {
            const subscription = this.eventSubscriptions.get(event.name);
            yield this.nativeCaller.unregisterEvent(event.nativeEventName, subscription);
            // Get the instance-specific handler
            const handler = this.eventHandlers.get(event.nativeEventName);
            if (handler) {
                // Remove only this instance's handler
                this.eventEmitter.off(event.nativeEventName, handler);
                this.eventHandlers.delete(event.nativeEventName);
            }
            this.eventSubscriptions.delete(event.name);
        });
    }
}
/**
 * Function to create a custom AdvancedNativeProxy. This will return an object which will provide dynamically the
 * methods specified in the PROXY interface.
 *
 * The Proxy interface implemented in order to call native methods will require a special mark
 * `$methodName` for method calls
 * `on$methodName` for the listeners added to the events defined in eventsEnum
 * @param nativeCaller
 * @param eventsEnum
 */
function createAdvancedInstanceAwareNativeProxy(nativeCaller, eventsEnum = undefined) {
    const eventsList = eventsEnum == null ? [] : Object.entries(eventsEnum).map(([key, value]) => ({
        name: key,
        nativeEventName: value
    }));
    return new AdvancedInstanceAwareNativeProxy(nativeCaller, eventsList);
}

/**
 * JS Proxy hook to act as middleware to all the calls performed by an AdvancedNativeProxy instance
 * This will allow AdvancedNativeProxy to call dynamically the methods defined in the interface defined
 * as parameter in createAdvancedNativeProxy function
 */
const nativeProxyHook = {
    /**
     * Dynamic property getter for the AdvancedNativeProxy
     * In order to call a native method this needs to be preceded by the `$` symbol on the name, ie `$methodName`
     * In order to set a native event handler this needs to be preceded by `on$` prefix, ie `on$eventName`
     * @param advancedNativeProxy
     * @param prop
     */
    get(nativeProxy, prop) {
        // Early return if prop is not a string
        if (typeof prop !== 'string') {
            return undefined;
        }
        // Important: $ and on$ are required since if they are not added all
        // properties present on AdvancedNativeProxy will be redirected to the
        // advancedNativeProxy._call, which will call native even for the own
        // properties of the class
        // All the methods with the following structure
        // $methodName will be redirected to the special _call
        // method on AdvancedNativeProxy
        if (prop.startsWith("$")) {
            if (prop in nativeProxy) {
                return nativeProxy[prop];
            }
            return (args) => {
                return nativeProxy._call(prop.substring(1), args);
            };
        }
        else {
            return nativeProxy[prop];
        }
    }
};
class NativeProxy extends BaseInstanceAwareNativeProxy {
    constructor(nativeCaller) {
        super();
        this.nativeCaller = nativeCaller;
        this.eventSubscriptions = new Map();
        this.eventHandlers = new Map();
        // Create the cached handler once
        this.cachedEventHandler = (eventName) => (args) => __awaiter$2(this, void 0, void 0, function* () {
            this.eventEmitter.emit(eventName, args);
        });
        // Wrapping the NativeProxy instance with the JS proxy hook
        return new Proxy(this, nativeProxyHook);
    }
    get framework() {
        if ('framework' in this.nativeCaller) {
            return this.nativeCaller.framework;
        }
        return 'unknown';
    }
    get frameworkVersion() {
        if ('frameworkVersion' in this.nativeCaller) {
            return this.nativeCaller.frameworkVersion;
        }
        return 'unknown';
    }
    subscribeForEvents(events) {
        return __awaiter$2(this, void 0, void 0, function* () {
            for (const event of events) {
                yield this._registerEvent(event);
            }
        });
    }
    unsubscribeFromEvents(events) {
        return __awaiter$2(this, void 0, void 0, function* () {
            for (const event of events) {
                yield this._unregisterEvent(event);
            }
        });
    }
    dispose() {
        return __awaiter$2(this, void 0, void 0, function* () {
            for (const nativeEventName of this.eventSubscriptions.keys()) {
                yield this._unregisterEvent(nativeEventName);
            }
            this.eventSubscriptions.clear();
        });
    }
    _call(fnName, args) {
        return this.nativeCaller.callFn(fnName, args);
    }
    _registerEvent(event) {
        return __awaiter$2(this, void 0, void 0, function* () {
            const handler = this.cachedEventHandler(event);
            const subscription = yield this.nativeCaller.registerEvent(event, handler);
            this.eventSubscriptions.set(event, subscription);
        });
    }
    _unregisterEvent(event) {
        return __awaiter$2(this, void 0, void 0, function* () {
            const subscription = this.eventSubscriptions.get(event);
            yield this.nativeCaller.unregisterEvent(event, subscription);
            this.eventSubscriptions.delete(event);
        });
    }
}
function createNativeProxy(nativeCaller) {
    return new NativeProxy(nativeCaller);
}

createEventEmitter();

var index = /*#__PURE__*/Object.freeze({
    __proto__: null,
    AdvancedInstanceAwareNativeProxy: AdvancedInstanceAwareNativeProxy,
    AdvancedNativeProxy: AdvancedNativeProxy,
    AimerViewfinder: AimerViewfinder,
    get Anchor () { return exports.Anchor; },
    BaseController: BaseController,
    BaseDataCaptureView: BaseDataCaptureView,
    BaseInstanceAwareNativeProxy: BaseInstanceAwareNativeProxy,
    BaseNativeProxy: BaseNativeProxy,
    BaseNewController: BaseNewController,
    Brush: Brush,
    Camera: Camera,
    CameraController: CameraController,
    CameraOwnershipHelper: CameraOwnershipHelper,
    CameraOwnershipManager: CameraOwnershipManager,
    get CameraPosition () { return exports.CameraPosition; },
    CameraSettings: CameraSettings,
    Color: Color,
    ContextStatus: ContextStatus,
    ControlImage: ControlImage,
    DataCaptureContext: DataCaptureContext,
    get DataCaptureContextEvents () { return DataCaptureContextEvents; },
    DataCaptureContextSettings: DataCaptureContextSettings,
    DataCaptureViewController: DataCaptureViewController,
    get DataCaptureViewEvents () { return DataCaptureViewEvents; },
    DefaultSerializeable: DefaultSerializeable,
    get Direction () { return exports.Direction; },
    EventDataParser: EventDataParser,
    EventEmitter: EventEmitter,
    get Expiration () { return Expiration; },
    FactoryMaker: FactoryMaker,
    Feedback: Feedback,
    get FocusGestureStrategy () { return exports.FocusGestureStrategy; },
    get FocusRange () { return exports.FocusRange; },
    get FontFamily () { return FontFamily; },
    FrameDataSettings: FrameDataSettings,
    FrameDataSettingsBuilder: FrameDataSettingsBuilder,
    get FrameSourceListenerEvents () { return FrameSourceListenerEvents; },
    get FrameSourceState () { return exports.FrameSourceState; },
    HTMLElementState: HTMLElementState,
    HtmlElementPosition: HtmlElementPosition,
    HtmlElementSize: HtmlElementSize,
    ImageBuffer: ImageBuffer,
    ImageFrameSource: ImageFrameSource,
    LaserlineViewfinder: LaserlineViewfinder,
    LicenseInfo: LicenseInfo,
    get LogoStyle () { return exports.LogoStyle; },
    MarginsWithUnit: MarginsWithUnit,
    get MeasureUnit () { return exports.MeasureUnit; },
    NativeProxy: NativeProxy,
    NoViewfinder: NoViewfinder,
    NoneLocationSelection: NoneLocationSelection,
    NumberWithUnit: NumberWithUnit,
    Observable: Observable,
    OpenSourceSoftwareLicenseInfo: OpenSourceSoftwareLicenseInfo,
    get Orientation () { return exports.Orientation; },
    Point: Point,
    PointWithUnit: PointWithUnit,
    PrivateFocusGestureDeserializer: PrivateFocusGestureDeserializer,
    PrivateFrameData: PrivateFrameData,
    PrivateZoomGestureDeserializer: PrivateZoomGestureDeserializer,
    Quadrilateral: Quadrilateral,
    RadiusLocationSelection: RadiusLocationSelection,
    Rect: Rect,
    RectWithUnit: RectWithUnit,
    RectangularLocationSelection: RectangularLocationSelection,
    RectangularViewfinder: RectangularViewfinder,
    RectangularViewfinderAnimation: RectangularViewfinderAnimation,
    get RectangularViewfinderLineStyle () { return exports.RectangularViewfinderLineStyle; },
    get RectangularViewfinderStyle () { return exports.RectangularViewfinderStyle; },
    get ScanIntention () { return exports.ScanIntention; },
    ScanditIcon: ScanditIcon,
    ScanditIconBuilder: ScanditIconBuilder,
    get ScanditIconShape () { return ScanditIconShape; },
    get ScanditIconType () { return ScanditIconType; },
    Size: Size,
    SizeWithAspect: SizeWithAspect,
    SizeWithUnit: SizeWithUnit,
    SizeWithUnitAndAspect: SizeWithUnitAndAspect,
    get SizingMode () { return exports.SizingMode; },
    Sound: Sound,
    SwipeToZoom: SwipeToZoom,
    TapToFocus: TapToFocus,
    get TextAlignment () { return TextAlignment; },
    get TorchState () { return exports.TorchState; },
    TorchSwitchControl: TorchSwitchControl,
    Vibration: Vibration,
    get VibrationType () { return VibrationType; },
    get VideoResolution () { return exports.VideoResolution; },
    WaveFormVibration: WaveFormVibration,
    ZoomSwitchControl: ZoomSwitchControl,
    createAdvancedInstanceAwareNativeProxy: createAdvancedInstanceAwareNativeProxy,
    createAdvancedNativeFromCtorProxy: createAdvancedNativeFromCtorProxy,
    createAdvancedNativeProxy: createAdvancedNativeProxy,
    createNativeProxy: createNativeProxy,
    getCoreDefaults: getCoreDefaults,
    ignoreFromSerialization: ignoreFromSerialization,
    ignoreFromSerializationIfNull: ignoreFromSerializationIfNull,
    loadCoreDefaults: loadCoreDefaults,
    nameForSerialization: nameForSerialization,
    serializationDefault: serializationDefault
});

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol */


function __decorate$1(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __awaiter$1(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

/* eslint-disable @typescript-eslint/no-var-requires */
const exec = cordova.require('cordova/exec');
const channel = cordova.require('cordova/channel');
const cordovaPluginsData = cordova.require('cordova/plugin_list');
/* eslint-enable @typescript-eslint/no-var-requires */
const pluginMap = new Map();
let didCoreFire = false;
const corePluginName = 'ScanditCaptureCore';
class CordovaError {
    static fromJSON(json) {
        if (json && json.code && json.message) {
            return new CordovaError(json.code, json.message);
        }
        else {
            return null;
        }
    }
    constructor(code, message) {
        this.code = code;
        this.message = message;
    }
}
const pluginsMetadata = cordovaPluginsData.metadata;
const cordovaExec = (successCallback, errorCallback, className, functionName, args) => {
    if (window.Scandit && window.Scandit.DEBUG) {
        // tslint:disable-next-line:no-console
        console.log(`Called native function: ${functionName}`, args, { success: successCallback, error: errorCallback });
    }
    const extendedSuccessCallback = (message) => {
        const shouldCallback = message && message.shouldNotifyWhenFinished;
        const finishCallbackID = shouldCallback ? message.finishCallbackID : null;
        const started = Date.now();
        let callbackResult;
        if (successCallback) {
            callbackResult = successCallback(message);
        }
        if (shouldCallback) {
            const maxCallbackDuration = 50;
            const callbackDuration = Date.now() - started;
            if (callbackDuration > maxCallbackDuration) {
                // tslint:disable-next-line:no-console
                console.log(`[SCANDIT WARNING] Took ${callbackDuration}ms to execute callback that's blocking native execution. You should keep this duration short, for more information, take a look at the documentation.`);
            }
            exec(null, null, className, 'finishCallback', [{
                    finishCallbackID,
                    result: callbackResult,
                }]);
        }
    };
    const extendedErrorCallback = (error) => {
        if (errorCallback) {
            const cordovaError = CordovaError.fromJSON(error);
            if (cordovaError !== null) {
                error = cordovaError;
            }
            errorCallback(error);
        }
    };
    exec(extendedSuccessCallback, extendedErrorCallback, className, functionName, args);
};
function initializePlugin(pluginName, customInitialization) {
    return __awaiter$1(this, void 0, void 0, function* () {
        const readyEventName = `on${pluginName}Ready`;
        channel.createSticky(readyEventName);
        channel.waitForInitialization(readyEventName);
        const firePluginEvent = (eventName, init) => __awaiter$1(this, void 0, void 0, function* () {
            yield init();
            channel[eventName].fire();
        });
        if (pluginName === corePluginName) {
            yield customInitialization();
            channel[readyEventName].fire();
            didCoreFire = true;
            [...pluginMap.entries()].forEach(([eventName, init]) => {
                firePluginEvent(eventName, init);
                pluginMap.delete(eventName);
            });
        }
        else if (didCoreFire) {
            firePluginEvent(readyEventName, customInitialization);
        }
        else {
            pluginMap.set(readyEventName, customInitialization);
        }
    });
}
class CordovaNativeCaller {
    get areEventsRegistered() {
        return this.eventRegisteredCheckList.size == this.eventRegisterFnName.length;
    }
    constructor(cordovaExec, pluginName, eventRegisterFnName) {
        this.cordovaExec = cordovaExec;
        this.pluginName = pluginName;
        this.eventRegisterFnName = eventRegisterFnName;
        this.eventRegisteredCheckList = new Set();
        this.eventHandlers = new Map();
    }
    get framework() {
        return 'cordova';
    }
    get frameworkVersion() {
        return (window.cordova && window.cordova.version) || undefined;
    }
    callFn(fnName, args) {
        if (this.eventRegisterFnName.includes(fnName)) {
            this.setUpEventListener(fnName, args);
            return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
            exec(resolve, reject, this.pluginName, fnName, [args]);
        });
    }
    eventHook(args) {
        return args;
    }
    registerEvent(evName, handler) {
        this.eventHandlers.set(evName, handler);
        return Promise.resolve();
    }
    unregisterEvent(evName, _subscription) {
        this.eventHandlers.delete(evName);
        this.eventRegisteredCheckList.delete(evName);
        return Promise.resolve(undefined);
    }
    setUpEventListener(subscriptionFnName, args) {
        if (this.eventRegisteredCheckList.has(subscriptionFnName)) {
            return;
        }
        this.cordovaExec(this.notifyListeners.bind(this), null, subscriptionFnName, [args]);
        this.eventRegisteredCheckList.add(subscriptionFnName);
    }
    notifyListeners(ev) {
        if (ev == null) {
            return;
        }
        const event = Object.assign(Object.assign(Object.assign({}, ev), ev.argument), { argument: undefined });
        const handler = this.eventHandlers.get(event.name);
        if (handler == null) {
            console.warn(`Handler for event ${event.name} not found`);
            return;
        }
        handler(event);
    }
}
function createCordovaNativeCaller(cordovaExec, pluginName, eventRegisterFnName) {
    return new CordovaNativeCaller(cordovaExec, pluginName, eventRegisterFnName);
}

class NativeFeedbackProxy extends BaseNativeProxy {
    static get cordovaExec() {
        return Cordova.exec;
    }
    emitFeedback(feedback) {
        return new Promise((resolve, reject) => {
            NativeFeedbackProxy.cordovaExec(resolve, reject, CordovaFunction.EmitFeedback, [feedback.toJSON()]);
        });
    }
}

class NativeDataCaptureViewProxy extends BaseNativeProxy {
    viewPointForFramePoint({ viewId, pointJson }) {
        return new Promise((resolve, reject) => {
            NativeDataCaptureViewProxy.cordovaExec(resolve, reject, CordovaFunction.ViewPointForFramePoint, [{ viewId: viewId, point: pointJson }]);
        });
    }
    viewQuadrilateralForFrameQuadrilateral({ viewId, quadrilateralJson }) {
        return new Promise((resolve, reject) => {
            NativeDataCaptureViewProxy.cordovaExec(resolve, reject, CordovaFunction.ViewQuadrilateralForFrameQuadrilateral, [{ viewId: viewId, quadrilateral: quadrilateralJson }]);
        });
    }
    registerListenerForViewEvents(viewId) {
        NativeDataCaptureViewProxy.cordovaExec(this.notifyListeners.bind(this), null, CordovaFunction.SubscribeViewListener, [viewId]);
    }
    unregisterListenerForViewEvents(viewId) {
        NativeDataCaptureViewProxy.cordovaExec(null, null, CordovaFunction.UnsubscribeViewListener, [viewId]);
    }
    setPositionAndSize(top, left, width, height, shouldBeUnderWebView) {
        return new Promise((resolve, reject) => {
            NativeDataCaptureViewProxy.cordovaExec(resolve, reject, CordovaFunction.SetViewPositionAndSize, [{ top, left, width, height, shouldBeUnderWebView }]);
        });
    }
    show() {
        return new Promise((resolve, reject) => {
            NativeDataCaptureViewProxy.cordovaExec(resolve, reject, CordovaFunction.ShowView, null);
        });
    }
    hide() {
        return new Promise((resolve, reject) => {
            NativeDataCaptureViewProxy.cordovaExec(resolve, reject, CordovaFunction.HideView, null);
        });
    }
    createView(viewJson) {
        return new Promise((resolve, reject) => {
            NativeDataCaptureViewProxy.cordovaExec(resolve, reject, CordovaFunction.CreateDataCaptureView, [viewJson]);
        });
    }
    updateView(viewJson) {
        return new Promise((resolve, reject) => {
            NativeDataCaptureViewProxy.cordovaExec(resolve, reject, CordovaFunction.UpdateDataCaptureView, [viewJson]);
        });
    }
    removeView(viewId) {
        return new Promise((resolve, reject) => {
            NativeDataCaptureViewProxy.cordovaExec(resolve, reject, CordovaFunction.RemoveDataCaptureView, [viewId]);
        });
    }
    static get cordovaExec() {
        return Cordova.exec;
    }
    notifyListeners(event) {
        if (!event) {
            // The event could be undefined/null in case the plugin result did not pass a "message",
            // which could happen e.g. in case of "ok" results, which could signal e.g. successful
            // listener subscriptions.
            return;
        }
        switch (event.name) {
            case DataCaptureViewEvents.didChangeSize:
                this.eventEmitter.emit(DataCaptureViewEvents.didChangeSize, event.data);
                break;
        }
    }
}

function initCoreProxy() {
    FactoryMaker.bindInstance('FeedbackProxy', new NativeFeedbackProxy());
    FactoryMaker.bindInstance('DataCaptureViewProxy', new NativeDataCaptureViewProxy());
    FactoryMaker.bindLazyInstance('DataCaptureContextProxy', () => {
        const caller = createCordovaNativeCaller(Cordova.exec, Cordova.pluginName, ['subscribeContextListener']);
        return createNativeProxy(caller);
    });
    FactoryMaker.bindLazyInstance('CameraProxy', () => {
        const caller = createCordovaNativeCaller(Cordova.exec, Cordova.pluginName, ['registerListenerForCameraEvents']);
        return createNativeProxy(caller);
    });
    FactoryMaker.bindLazyInstance('ImageFrameSourceProxy', () => {
        const caller = createCordovaNativeCaller(Cordova.exec, Cordova.pluginName, ['registerListenerForCameraEvents']);
        return createNativeProxy(caller);
    });
}

var CordovaFunction;
(function (CordovaFunction) {
    CordovaFunction["GetDefaults"] = "getDefaults";
    CordovaFunction["SubscribeFrameSourceListener"] = "subscribeFrameSourceListener";
    CordovaFunction["UnsubscribeFrameSourceListener"] = "unsubscribeFrameSourceListener";
    CordovaFunction["SetViewPositionAndSize"] = "setViewPositionAndSize";
    CordovaFunction["ShowView"] = "showView";
    CordovaFunction["HideView"] = "hideView";
    CordovaFunction["ViewPointForFramePoint"] = "viewPointForFramePoint";
    CordovaFunction["ViewQuadrilateralForFrameQuadrilateral"] = "viewQuadrilateralForFrameQuadrilateral";
    CordovaFunction["SubscribeViewListener"] = "subscribeViewListener";
    CordovaFunction["UnsubscribeViewListener"] = "unsubscribeViewListener";
    CordovaFunction["GetCurrentCameraState"] = "getCurrentCameraState";
    CordovaFunction["GetIsTorchAvailable"] = "getIsTorchAvailable";
    CordovaFunction["SwitchCameraToDesiredState"] = "switchCameraToDesiredState";
    CordovaFunction["GetFrame"] = "getFrame";
    CordovaFunction["EmitFeedback"] = "emitFeedback";
    CordovaFunction["SubscribeVolumeButtonObserver"] = "subscribeVolumeButtonObserver";
    CordovaFunction["UnsubscribeVolumeButtonObserver"] = "unsubscribeVolumeButtonObserver";
    CordovaFunction["CreateDataCaptureView"] = "createDataCaptureView";
    CordovaFunction["UpdateDataCaptureView"] = "updateDataCaptureView";
    CordovaFunction["RemoveDataCaptureView"] = "removeDataCaptureView";
})(CordovaFunction || (CordovaFunction = {}));
// tslint:disable-next-line:variable-name
const Cordova = {
    pluginName: 'ScanditCaptureCore',
    defaults: {},
    exec: (success, error, functionName, args) => cordovaExec(success, error, Cordova.pluginName, functionName, args),
};
function getDefaults() {
    initCoreProxy();
    return new Promise((resolve, reject) => {
        Cordova.exec((defaultsJSON) => {
            loadCoreDefaults(defaultsJSON);
            resolve();
        }, reject, CordovaFunction.GetDefaults, null);
    });
}
function initializeCordovaCore() {
    initializePlugin(Cordova.pluginName, getDefaults);
}

var Symbology;
(function (Symbology) {
    Symbology["EAN13UPCA"] = "ean13Upca";
    Symbology["UPCE"] = "upce";
    Symbology["EAN8"] = "ean8";
    Symbology["Code39"] = "code39";
    Symbology["Code93"] = "code93";
    Symbology["Code128"] = "code128";
    Symbology["Code11"] = "code11";
    Symbology["Code25"] = "code25";
    Symbology["Codabar"] = "codabar";
    Symbology["InterleavedTwoOfFive"] = "interleavedTwoOfFive";
    Symbology["MSIPlessey"] = "msiPlessey";
    Symbology["QR"] = "qr";
    Symbology["DataMatrix"] = "dataMatrix";
    Symbology["Aztec"] = "aztec";
    Symbology["MaxiCode"] = "maxicode";
    Symbology["DotCode"] = "dotcode";
    Symbology["KIX"] = "kix";
    Symbology["RoyalMail4state"] = "royal-mail-4state";
    Symbology["GS1Databar"] = "databar";
    Symbology["GS1DatabarExpanded"] = "databarExpanded";
    Symbology["GS1DatabarLimited"] = "databarLimited";
    Symbology["PDF417"] = "pdf417";
    Symbology["MicroPDF417"] = "microPdf417";
    Symbology["MicroQR"] = "microQr";
    Symbology["Code32"] = "code32";
    Symbology["Lapa4SC"] = "lapa4sc";
    Symbology["IATATwoOfFive"] = "iata2of5";
    Symbology["MatrixTwoOfFive"] = "matrix2of5";
    Symbology["USPSIntelligentMail"] = "uspsIntelligentMail";
    Symbology["ArUco"] = "aruco";
    Symbology["Upu4State"] = "upu-4state";
    Symbology["AustralianPost"] = "australian-post-4state";
    Symbology["FrenchPost"] = "french-post";
})(Symbology || (Symbology = {}));

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

class Range extends DefaultSerializeable {
    get minimum() {
        return this._minimum;
    }
    get maximum() {
        return this._maximum;
    }
    get step() {
        return this._step;
    }
    get isFixed() {
        return this.minimum === this.maximum || this.step <= 0;
    }
    static fromJSON(json) {
        const range = new Range();
        range._minimum = json.minimum;
        range._maximum = json.maximum;
        range._step = json.step;
        return range;
    }
}
__decorate([
    nameForSerialization('minimum')
], Range.prototype, "_minimum", void 0);
__decorate([
    nameForSerialization('maximum')
], Range.prototype, "_maximum", void 0);
__decorate([
    nameForSerialization('step')
], Range.prototype, "_step", void 0);

var CompositeType;
(function (CompositeType) {
    CompositeType["A"] = "A";
    CompositeType["B"] = "B";
    CompositeType["C"] = "C";
})(CompositeType || (CompositeType = {}));

var Checksum;
(function (Checksum) {
    Checksum["Mod10"] = "mod10";
    Checksum["Mod11"] = "mod11";
    Checksum["Mod16"] = "mod16";
    Checksum["Mod43"] = "mod43";
    Checksum["Mod47"] = "mod47";
    Checksum["Mod103"] = "mod103";
    Checksum["Mod10AndMod11"] = "mod1110";
    Checksum["Mod10AndMod10"] = "mod1010";
})(Checksum || (Checksum = {}));

class SymbologySettings extends DefaultSerializeable {
    get symbology() {
        return this._symbology;
    }
    get enabledExtensions() {
        return this.extensions;
    }
    static fromJSON(identifier, json) {
        const symbologySettings = new SymbologySettings();
        symbologySettings.extensions = json.extensions;
        symbologySettings.isEnabled = json.enabled;
        symbologySettings.isColorInvertedEnabled = json.colorInvertedEnabled;
        symbologySettings.checksums = json.checksums;
        symbologySettings.activeSymbolCounts = json.activeSymbolCounts;
        symbologySettings._symbology = identifier;
        return symbologySettings;
    }
    setExtensionEnabled(extension, enabled) {
        const included = this.extensions.includes(extension);
        if (enabled && !included) {
            this.extensions.push(extension);
        }
        else if (!enabled && included) {
            this.extensions.splice(this.extensions.indexOf(extension), 1);
        }
    }
}
__decorate([
    ignoreFromSerialization
], SymbologySettings.prototype, "_symbology", void 0);
__decorate([
    nameForSerialization('enabled')
], SymbologySettings.prototype, "isEnabled", void 0);
__decorate([
    nameForSerialization('colorInvertedEnabled')
], SymbologySettings.prototype, "isColorInvertedEnabled", void 0);

class ArucoDictionary {
    constructor() {
        this._preset = null;
        this._markers = null;
        this._markerSize = null;
    }
    static fromPreset(preset) {
        const arucoDictionary = new ArucoDictionary();
        arucoDictionary._preset = preset;
        return arucoDictionary;
    }
    static createWithMarkers(markerSize, markers) {
        const arucoDictionary = new ArucoDictionary();
        arucoDictionary._markerSize = markerSize;
        arucoDictionary._markers = markers;
        return arucoDictionary;
    }
}
__decorate([
    nameForSerialization('preset')
], ArucoDictionary.prototype, "_preset", void 0);
__decorate([
    nameForSerialization('markers')
], ArucoDictionary.prototype, "_markers", void 0);
__decorate([
    nameForSerialization('markerSize')
], ArucoDictionary.prototype, "_markerSize", void 0);

var ArucoDictionaryPreset;
(function (ArucoDictionaryPreset) {
    ArucoDictionaryPreset["ArucoDictionaryPreset_5X5_50"] = "5X5_50";
    ArucoDictionaryPreset["ArucoDictionaryPreset_5X5_100"] = "5X5_100";
    ArucoDictionaryPreset["ArucoDictionaryPreset_5X5_250"] = "5X5_250";
    ArucoDictionaryPreset["ArucoDictionaryPreset_5X5_1000"] = "5X5_1000";
    ArucoDictionaryPreset["ArucoDictionaryPreset_5X5_1023"] = "5X5_1023";
    ArucoDictionaryPreset["ArucoDictionaryPreset_4X4_250"] = "4X4_250";
    ArucoDictionaryPreset["ArucoDictionaryPreset_6X6_250"] = "6X6_250";
})(ArucoDictionaryPreset || (ArucoDictionaryPreset = {}));

class ArucoMarker extends DefaultSerializeable {
    get size() {
        return this._markerSize;
    }
    get data() {
        return this._markerData;
    }
    static create(markerSize, markerData) {
        const arucoMarker = new ArucoMarker();
        arucoMarker._markerSize = markerSize || 0;
        arucoMarker._markerData = markerData || '';
        return arucoMarker;
    }
}
__decorate([
    nameForSerialization('markerData')
], ArucoMarker.prototype, "_markerData", void 0);
__decorate([
    nameForSerialization('markerSize')
], ArucoMarker.prototype, "_markerSize", void 0);

function getBarcodeDefaults() {
    return FactoryMaker.getInstance('BarcodeDefaults');
}

function getBarcodeCaptureDefaults() {
    return FactoryMaker.getInstance('BarcodeCaptureDefaults');
}

function getBarcodeArDefaults() {
    return FactoryMaker.getInstance('BarcodeArDefaults');
}

function getBarcodeSelectionDefaults() {
    return FactoryMaker.getInstance('BarcodeSelectionDefaults');
}

class BarcodeFilterSettings extends DefaultSerializeable {
    get excludeEan13() {
        return this._excludeEan13;
    }
    set excludeEan13(value) {
        this._excludeEan13 = value;
    }
    get excludeUpca() {
        return this._excludeUpca;
    }
    set excludeUpca(value) {
        this._excludeUpca = value;
    }
    get excludedCodesRegex() {
        return this._excludedCodesRegex;
    }
    set excludedCodesRegex(value) {
        this._excludedCodesRegex = value;
    }
    get excludedSymbologies() {
        return this._excludedSymbologies;
    }
    set excludedSymbologies(values) {
        this._excludedSymbologies = values;
    }
    static fromJSON(json) {
        const excludeEan13 = json.excludeEan13;
        const excludeUpca = json.excludeUpca;
        const excludedCodesRegex = json.excludedCodesRegex;
        const excludedSymbologies = json.excludedSymbologies;
        const excludedSymbolCounts = json.excludedSymbolCounts;
        return new BarcodeFilterSettings(excludeEan13, excludeUpca, excludedCodesRegex, excludedSymbolCounts, excludedSymbologies);
    }
    constructor(excludeEan13, excludeUpca, excludedCodesRegex, excludedSymbolCounts, excludedSymbologies) {
        super();
        this._excludeEan13 = false;
        this._excludeUpca = false;
        this._excludedCodesRegex = '';
        this._excludedSymbolCounts = {};
        this._excludedSymbologies = [];
        this.excludeEan13 = excludeEan13;
        this.excludeUpca = excludeUpca;
        this.excludedCodesRegex = excludedCodesRegex;
        this._excludedSymbolCounts = excludedSymbolCounts;
        this.excludedSymbologies = excludedSymbologies;
    }
    getExcludedSymbolCountsForSymbology(symbology) {
        return this._excludedSymbolCounts[symbology] || [];
    }
    setExcludedSymbolCounts(excludedSymbolCounts, symbology) {
        this._excludedSymbolCounts[symbology] = excludedSymbolCounts;
    }
}
__decorate([
    nameForSerialization('excludeEan13')
], BarcodeFilterSettings.prototype, "_excludeEan13", void 0);
__decorate([
    nameForSerialization('excludeUpca')
], BarcodeFilterSettings.prototype, "_excludeUpca", void 0);
__decorate([
    nameForSerialization('excludedCodesRegex')
], BarcodeFilterSettings.prototype, "_excludedCodesRegex", void 0);
__decorate([
    nameForSerialization('excludedSymbolCounts')
], BarcodeFilterSettings.prototype, "_excludedSymbolCounts", void 0);
__decorate([
    nameForSerialization('excludedSymbologies')
], BarcodeFilterSettings.prototype, "_excludedSymbologies", void 0);

function getBarcodeCountDefaults() {
    return FactoryMaker.getInstance('BarcodeCountDefaults');
}

function getBarcodeBatchDefaults() {
    return FactoryMaker.getInstance('BarcodeBatchDefaults');
}

function getSparkScanDefaults() {
    return FactoryMaker.getInstance('SparkScanDefaults');
}

function getBarcodePickDefaults() {
    return FactoryMaker.getInstance('BarcodePickDefaults');
}

function getBarcodeFindDefaults() {
    return FactoryMaker.getInstance('BarcodeFindDefaults');
}

class EncodingRange {
    get ianaName() { return this._ianaName; }
    get startIndex() { return this._startIndex; }
    get endIndex() { return this._endIndex; }
    static fromJSON(json) {
        const encodingRange = new EncodingRange();
        encodingRange._ianaName = json.ianaName;
        encodingRange._startIndex = json.startIndex;
        encodingRange._endIndex = json.endIndex;
        return encodingRange;
    }
}

class StructuredAppendData {
    get isComplete() { return this._isComplete; }
    get barcodeSetId() { return this._barcodeSetId; }
    get scannedSegmentCount() { return this._scannedSegmentCount; }
    get totalSegmentCount() { return this._totalSegmentCount; }
    get encodingRanges() { return this._encodingRanges; }
    get completeData() { return this._completeData; }
    get rawCompleteData() { return this._rawCompleteData; }
    static fromJSON(json) {
        const structuredAppendData = new StructuredAppendData();
        if (!json)
            return null;
        structuredAppendData._isComplete = json.complete;
        structuredAppendData._barcodeSetId = json.barcodeSetId;
        structuredAppendData._scannedSegmentCount = json.scannedSegmentCount;
        structuredAppendData._totalSegmentCount = json.totalSegmentCount;
        structuredAppendData._encodingRanges =
            json.completeDataEncodings.map(EncodingRange.fromJSON);
        structuredAppendData._completeData = json.completeDataUtf8String;
        structuredAppendData._rawCompleteData = json.completeDataRaw;
        return structuredAppendData;
    }
}

class Barcode extends DefaultSerializeable {
    get symbology() { return this._symbology; }
    get data() { return this._data; }
    get rawData() { return this._rawData; }
    get compositeData() { return this._compositeData; }
    get compositeRawData() { return this._compositeRawData; }
    get addOnData() { return this._addOnData; }
    get encodingRanges() { return this._encodingRanges; }
    get location() { return this._location; }
    get isGS1DataCarrier() { return this._isGS1DataCarrier; }
    get compositeFlag() { return this._compositeFlag; }
    get isColorInverted() { return this._isColorInverted; }
    get symbolCount() { return this._symbolCount; }
    get frameID() { return this._frameID; }
    get isStructuredAppend() { return this._structuredAppendData !== null; }
    get structuredAppendData() { return this._structuredAppendData; }
    get selectionIdentifier() { return this.data + this.symbology; }
    static fromJSON(json) {
        const barcode = new Barcode();
        barcode._symbology = json.symbology;
        barcode._data = json.data;
        barcode._rawData = json.rawData;
        barcode._compositeData = json.compositeData;
        barcode._compositeRawData = json.compositeRawData;
        barcode._addOnData = json.addOnData === undefined ? null : json.addOnData;
        barcode._isGS1DataCarrier = json.isGS1DataCarrier;
        barcode._compositeFlag = json.compositeFlag;
        barcode._isColorInverted = json.isColorInverted;
        barcode._symbolCount = json.symbolCount;
        barcode._frameID = json.frameId;
        barcode._encodingRanges = json.encodingRanges.map(EncodingRange.fromJSON);
        barcode._location = Quadrilateral.fromJSON(json.location);
        barcode._structuredAppendData =
            StructuredAppendData.fromJSON(json.structuredAppendData);
        return barcode;
    }
}
__decorate([
    nameForSerialization('symbology')
], Barcode.prototype, "_symbology", void 0);
__decorate([
    nameForSerialization('data')
], Barcode.prototype, "_data", void 0);
__decorate([
    nameForSerialization('rawData')
], Barcode.prototype, "_rawData", void 0);
__decorate([
    nameForSerialization('compositeData')
], Barcode.prototype, "_compositeData", void 0);
__decorate([
    nameForSerialization('compositeRawData')
], Barcode.prototype, "_compositeRawData", void 0);
__decorate([
    nameForSerialization('addOnData')
], Barcode.prototype, "_addOnData", void 0);
__decorate([
    nameForSerialization('encodingRanges')
], Barcode.prototype, "_encodingRanges", void 0);
__decorate([
    nameForSerialization('location')
], Barcode.prototype, "_location", void 0);
__decorate([
    nameForSerialization('isGS1DataCarrier')
], Barcode.prototype, "_isGS1DataCarrier", void 0);
__decorate([
    nameForSerialization('compositeFlag')
], Barcode.prototype, "_compositeFlag", void 0);
__decorate([
    nameForSerialization('isColorInverted')
], Barcode.prototype, "_isColorInverted", void 0);
__decorate([
    nameForSerialization('symbolCount')
], Barcode.prototype, "_symbolCount", void 0);
__decorate([
    nameForSerialization('frameID')
], Barcode.prototype, "_frameID", void 0);
__decorate([
    nameForSerialization('structuredAppendData')
], Barcode.prototype, "_structuredAppendData", void 0);

var BatterySavingMode;
(function (BatterySavingMode) {
    BatterySavingMode["On"] = "on";
    BatterySavingMode["Off"] = "off";
    BatterySavingMode["Auto"] = "auto";
})(BatterySavingMode || (BatterySavingMode = {}));

var CompositeFlag;
(function (CompositeFlag) {
    CompositeFlag["None"] = "none";
    CompositeFlag["Unknown"] = "unknown";
    CompositeFlag["Linked"] = "linked";
    CompositeFlag["GS1TypeA"] = "gs1TypeA";
    CompositeFlag["GS1TypeB"] = "gs1TypeB";
    CompositeFlag["GS1TypeC"] = "gs1TypeC";
})(CompositeFlag || (CompositeFlag = {}));

class LocalizedOnlyBarcode {
    get location() {
        return this._location;
    }
    get frameID() {
        return this._frameID;
    }
    static fromJSON(json) {
        const localizedBarcode = new LocalizedOnlyBarcode();
        localizedBarcode._location = Quadrilateral.fromJSON(json.location);
        localizedBarcode._frameID = json.frameId;
        return localizedBarcode;
    }
}

class TargetBarcode extends DefaultSerializeable {
    get data() {
        return this._data;
    }
    get quantity() {
        return this._quantity;
    }
    static create(data, quantity) {
        return new TargetBarcode(data, quantity);
    }
    static fromJSON(json) {
        const data = json.data;
        const quantity = json.quantity;
        return TargetBarcode.create(data, quantity);
    }
    constructor(data, quantity) {
        super();
        this._data = data;
        this._quantity = quantity;
    }
}
__decorate([
    nameForSerialization('data')
], TargetBarcode.prototype, "_data", void 0);
__decorate([
    nameForSerialization('quantity')
], TargetBarcode.prototype, "_quantity", void 0);

class TrackedBarcode {
    get barcode() { return this._barcode; }
    get location() { return this._location; }
    get identifier() { return this._identifier; }
    get sessionFrameSequenceID() {
        return this._sessionFrameSequenceID;
    }
    static fromJSON(json, sessionFrameSequenceID) {
        const trackedBarcode = new TrackedBarcode();
        // The serialization returns the identifier as a string, not a number, which it originally is.
        // This is because the identifier needs to be used as a key in a dictionary, which in JSON can only be a string.
        // We can assume that it is a number in the string that we can safely parse.
        trackedBarcode._identifier = parseInt(json.identifier, 10);
        trackedBarcode._barcode = Barcode.fromJSON(json.barcode);
        trackedBarcode._location = Quadrilateral.fromJSON(json.location);
        trackedBarcode._sessionFrameSequenceID = sessionFrameSequenceID ? sessionFrameSequenceID : null;
        return trackedBarcode;
    }
}

class BarcodeSpatialGrid extends DefaultSerializeable {
    static fromJSON(json) {
        const spatialGrid = new BarcodeSpatialGrid();
        spatialGrid._rows = json.rows;
        spatialGrid._columns = json.columns;
        spatialGrid._grid = json.grid;
        return spatialGrid;
    }
    get rows() {
        return this._rows;
    }
    get columns() {
        return this._columns;
    }
    barcodeAt(row, column) {
        const barcodeJSON = this._grid[row][column]["mainBarcode"];
        if (barcodeJSON) {
            return Barcode.fromJSON(barcodeJSON);
        }
        return null;
    }
    row(index) {
        const elementsJSON = this._grid[index];
        if (elementsJSON) {
            return ((elementsJSON.map((it) => it.mainBarcode)).map(Barcode.fromJSON));
        }
        return [];
    }
    column(index) {
        const elementsJSON = this._grid.map(elements => elements[index]);
        if (elementsJSON) {
            return ((elementsJSON.map((it) => it.mainBarcode)).map(Barcode.fromJSON));
        }
        return [];
    }
}
__decorate([
    nameForSerialization('rows')
], BarcodeSpatialGrid.prototype, "_rows", void 0);
__decorate([
    nameForSerialization('columns')
], BarcodeSpatialGrid.prototype, "_columns", void 0);
__decorate([
    nameForSerialization('grid')
], BarcodeSpatialGrid.prototype, "_grid", void 0);

class BarcodeCaptureFeedback extends DefaultSerializeable {
    constructor() {
        super(...arguments);
        this.success = Feedback.defaultFeedback;
    }
    static get default() {
        return new BarcodeCaptureFeedback();
    }
}

class BarcodeCaptureSession {
    get newlyRecognizedBarcode() {
        return this._newlyRecognizedBarcode;
    }
    get newlyLocalizedBarcodes() {
        return this._newlyLocalizedBarcodes;
    }
    get frameSequenceID() {
        return this._frameSequenceID;
    }
    static fromJSON(json) {
        var _a;
        const sessionJson = JSON.parse(json.session);
        const session = new BarcodeCaptureSession();
        session._newlyRecognizedBarcode = sessionJson.newlyRecognizedBarcode != null ?
            Barcode.fromJSON(sessionJson.newlyRecognizedBarcode) :
            null;
        session._newlyLocalizedBarcodes = sessionJson.newlyLocalizedBarcodes
            .map(LocalizedOnlyBarcode.fromJSON);
        session._frameSequenceID = sessionJson.frameSequenceId;
        session.frameId = (_a = json.frameId) !== null && _a !== void 0 ? _a : '';
        return session;
    }
    reset() {
        return this.controller.reset();
    }
}

var BarcodeCaptureListenerEvents;
(function (BarcodeCaptureListenerEvents) {
    BarcodeCaptureListenerEvents["didUpdateSession"] = "BarcodeCaptureListener.didUpdateSession";
    BarcodeCaptureListenerEvents["didScan"] = "BarcodeCaptureListener.didScan";
})(BarcodeCaptureListenerEvents || (BarcodeCaptureListenerEvents = {}));
class BarcodeCaptureListenerController extends BaseNewController {
    constructor(barcodeCapture) {
        super('BarcodeCaptureListenerProxy');
        this.isListeningForEvents = false;
        this.handleDidUpdateSession = (ev) => __awaiter(this, void 0, void 0, function* () {
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                console.error('BarcodeCaptureListenerController.subscribeListener: didUpdateSession payload is null');
                return;
            }
            if (payload.modeId !== this.modeId) {
                return;
            }
            const session = BarcodeCaptureSession.fromJSON(payload);
            yield this.notifyListenersOfDidUpdateSession(session);
            this._proxy.$finishBarcodeCaptureDidUpdateSession({ modeId: this.modeId, enabled: this.mode.isEnabled });
        });
        this.handleDidScan = (ev) => __awaiter(this, void 0, void 0, function* () {
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                console.error('BarcodeCaptureListenerController.subscribeListener: didScan payload is null');
                return;
            }
            if (payload.modeId !== this.modeId) {
                return;
            }
            const session = BarcodeCaptureSession.fromJSON(payload);
            yield this.notifyListenersOfDidScan(session);
            this._proxy.$finishBarcodeCaptureDidScan({ modeId: this.modeId, enabled: this.mode.isEnabled });
        });
        this.mode = barcodeCapture;
        this.initialize();
    }
    get modeId() {
        return this.mode.modeId;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.mode.listeners.length > 0) {
                this.subscribeListener();
            }
        });
    }
    reset() {
        return this._proxy.$resetBarcodeCaptureSession();
    }
    setModeEnabledState(enabled) {
        this._proxy.$setBarcodeCaptureModeEnabledState({ modeId: this.modeId, enabled });
    }
    updateBarcodeCaptureMode() {
        return this._proxy.$updateBarcodeCaptureMode({ modeJson: JSON.stringify(this.mode.toJSON()) });
    }
    applyBarcodeCaptureModeSettings(modeSettings) {
        return this._proxy.$applyBarcodeCaptureModeSettings({ modeId: this.modeId, modeSettingsJson: JSON.stringify(modeSettings.toJSON()) });
    }
    subscribeListener() {
        if (this.isListeningForEvents) {
            return;
        }
        this._proxy.subscribeForEvents(Object.values(BarcodeCaptureListenerEvents));
        this._proxy.$registerBarcodeCaptureListenerForEvents({ modeId: this.modeId });
        this._proxy.eventEmitter.on(BarcodeCaptureListenerEvents.didUpdateSession, this.handleDidUpdateSession);
        this._proxy.eventEmitter.on(BarcodeCaptureListenerEvents.didScan, this.handleDidScan);
        this.isListeningForEvents = true;
    }
    unsubscribeListener() {
        if (!this.isListeningForEvents) {
            return;
        }
        this._proxy.$unregisterBarcodeCaptureListenerForEvents({ modeId: this.modeId });
        this._proxy.unsubscribeFromEvents(Object.values(BarcodeCaptureListenerEvents));
        this._proxy.eventEmitter.off(BarcodeCaptureListenerEvents.didUpdateSession, this.handleDidUpdateSession);
        this._proxy.eventEmitter.off(BarcodeCaptureListenerEvents.didScan, this.handleDidScan);
        this.isListeningForEvents = false;
    }
    dispose() {
        this.unsubscribeListener();
        this._proxy.dispose();
    }
    notifyListenersOfDidUpdateSession(session) {
        return __awaiter(this, void 0, void 0, function* () {
            const mode = this.mode;
            for (const listener of mode.listeners) {
                if (listener.didUpdateSession) {
                    listener.didUpdateSession(this.mode, session, () => CameraController.getFrame(session.frameId));
                }
            }
        });
    }
    notifyListenersOfDidScan(session) {
        return __awaiter(this, void 0, void 0, function* () {
            const mode = this.mode;
            for (const listener of mode.listeners) {
                if (listener.didScan) {
                    listener.didScan(this.mode, session, () => CameraController.getFrame(session.frameId));
                }
            }
        });
    }
}

class BarcodeCapture extends DefaultSerializeable {
    get isEnabled() {
        return this._isEnabled;
    }
    set isEnabled(isEnabled) {
        var _a;
        this._isEnabled = isEnabled;
        (_a = this.controller) === null || _a === void 0 ? void 0 : _a.setModeEnabledState(isEnabled);
    }
    get context() {
        return this._context;
    }
    get feedback() {
        return this._feedback;
    }
    set feedback(feedback) {
        var _a;
        this._feedback = feedback;
        (_a = this.controller) === null || _a === void 0 ? void 0 : _a.updateBarcodeCaptureMode();
    }
    static createRecommendedCameraSettings() {
        return new CameraSettings(BarcodeCapture.barcodeCaptureDefaults.RecommendedCameraSettings);
    }
    get _context() {
        return this.privateContext;
    }
    set _context(newContext) {
        var _a, _b;
        if (newContext == null) {
            (_a = this.controller) === null || _a === void 0 ? void 0 : _a.dispose();
            this.controller = null;
            this.privateContext = null;
            return;
        }
        this.privateContext = newContext;
        (_b = this.controller) !== null && _b !== void 0 ? _b : (this.controller = new BarcodeCaptureListenerController(this));
    }
    static get barcodeCaptureDefaults() {
        return getBarcodeCaptureDefaults();
    }
    constructor(settings) {
        super();
        this.type = 'barcodeCapture';
        this.modeId = Math.floor(Math.random() * 100000000);
        this._isEnabled = true;
        this._feedback = BarcodeCaptureFeedback.default;
        this.privateContext = null;
        this.parentId = null;
        this.listeners = [];
        this.hasListeners = false;
        this.controller = null;
        this.settings = settings;
    }
    applySettings(settings) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            this.settings = settings;
            return (_a = this.controller) === null || _a === void 0 ? void 0 : _a.applyBarcodeCaptureModeSettings(settings);
        });
    }
    addListener(listener) {
        var _a;
        if (this.listeners.includes(listener)) {
            return;
        }
        if (this.listeners.length === 0) {
            (_a = this.controller) === null || _a === void 0 ? void 0 : _a.subscribeListener();
        }
        this.listeners.push(listener);
        this.hasListeners = this.listeners.length > 0;
    }
    removeListener(listener) {
        var _a;
        if (!this.listeners.includes(listener)) {
            return;
        }
        this.listeners.splice(this.listeners.indexOf(listener), 1);
        this.hasListeners = this.listeners.length > 0;
        if (!this.hasListeners) {
            (_a = this.controller) === null || _a === void 0 ? void 0 : _a.unsubscribeListener();
        }
    }
}
__decorate([
    nameForSerialization('enabled')
], BarcodeCapture.prototype, "_isEnabled", void 0);
__decorate([
    nameForSerialization('feedback')
], BarcodeCapture.prototype, "_feedback", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeCapture.prototype, "privateContext", void 0);
__decorate([
    nameForSerialization('parentId'),
    ignoreFromSerializationIfNull
], BarcodeCapture.prototype, "parentId", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeCapture.prototype, "listeners", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeCapture.prototype, "controller", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeCapture, "barcodeCaptureDefaults", null);

class BarcodeCaptureOverlayController extends BaseNewController {
    constructor(overlay) {
        super('BarcodeCaptureOverlayProxy');
        this.overlay = overlay;
    }
    updateBarcodeCaptureOverlay(overlay) {
        const view = this.overlay.view;
        if (view === null) {
            return Promise.resolve();
        }
        return this._proxy.$updateBarcodeCaptureOverlay({
            viewId: view.viewId,
            overlayJson: JSON.stringify(overlay.toJSON())
        });
    }
    dispose() {
        this._proxy.dispose();
    }
}

class BarcodeCaptureOverlay extends DefaultSerializeable {
    get view() {
        return this._view;
    }
    set view(newView) {
        var _a, _b;
        if (newView === null) {
            (_a = this.controller) === null || _a === void 0 ? void 0 : _a.dispose();
            this.controller = null;
            this._view = null;
            return;
        }
        this._view = newView;
        (_b = this.controller) !== null && _b !== void 0 ? _b : (this.controller = new BarcodeCaptureOverlayController(this));
    }
    static get barcodeCaptureDefaults() {
        return getBarcodeCaptureDefaults();
    }
    get brush() {
        return this._brush;
    }
    set brush(newBrush) {
        var _a;
        this._brush = newBrush;
        (_a = this.controller) === null || _a === void 0 ? void 0 : _a.updateBarcodeCaptureOverlay(this);
    }
    get viewfinder() {
        return this._viewfinder;
    }
    set viewfinder(newViewfinder) {
        var _a;
        this._viewfinder = newViewfinder;
        if (newViewfinder) {
            this.eventEmitter.on('viewfinder.update', this.handleViewFinderUpdate);
        }
        else {
            this.eventEmitter.off('viewfinder.update');
        }
        (_a = this.controller) === null || _a === void 0 ? void 0 : _a.updateBarcodeCaptureOverlay(this);
    }
    get shouldShowScanAreaGuides() {
        return this._shouldShowScanAreaGuides;
    }
    set shouldShowScanAreaGuides(shouldShow) {
        var _a;
        this._shouldShowScanAreaGuides = shouldShow;
        (_a = this.controller) === null || _a === void 0 ? void 0 : _a.updateBarcodeCaptureOverlay(this);
    }
    constructor(mode) {
        super();
        this.type = 'barcodeCapture';
        this.controller = null;
        this._view = null;
        this._shouldShowScanAreaGuides = false;
        this._viewfinder = null;
        this._brush = BarcodeCaptureOverlay.barcodeCaptureDefaults.BarcodeCaptureOverlay.DefaultBrush;
        this.modeId = mode.modeId;
        this.eventEmitter = FactoryMaker.getInstance('EventEmitter');
        this.handleViewFinderUpdate = this.handleViewFinderUpdate.bind(this);
    }
    handleViewFinderUpdate() {
        var _a;
        (_a = this.controller) === null || _a === void 0 ? void 0 : _a.updateBarcodeCaptureOverlay(this);
    }
}
__decorate([
    ignoreFromSerialization
], BarcodeCaptureOverlay.prototype, "controller", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeCaptureOverlay.prototype, "_view", void 0);
__decorate([
    nameForSerialization('shouldShowScanAreaGuides')
], BarcodeCaptureOverlay.prototype, "_shouldShowScanAreaGuides", void 0);
__decorate([
    serializationDefault(NoViewfinder),
    nameForSerialization('viewfinder')
], BarcodeCaptureOverlay.prototype, "_viewfinder", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeCaptureOverlay.prototype, "eventEmitter", void 0);
__decorate([
    nameForSerialization('brush')
], BarcodeCaptureOverlay.prototype, "_brush", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeCaptureOverlay, "barcodeCaptureDefaults", null);

class BarcodeCaptureSettings extends DefaultSerializeable {
    get enabledSymbologies() {
        return Object.keys(this.symbologies)
            .filter(symbology => this.symbologies[symbology].isEnabled);
    }
    get compositeTypeDescriptions() {
        return BarcodeCaptureSettings.barcodeDefaults.CompositeTypeDescriptions.reduce((descriptions, description) => {
            descriptions[description.types[0]] = description;
            return descriptions;
        }, {});
    }
    static get barcodeDefaults() {
        return getBarcodeDefaults();
    }
    static get barcodeCaptureDefaults() {
        return getBarcodeCaptureDefaults();
    }
    constructor() {
        super();
        this.locationSelection = null;
        this.enabledCompositeTypes = [];
        this.properties = {};
        this.symbologies = {};
        this._codeDuplicateFilter = BarcodeCaptureSettings.barcodeCaptureDefaults.BarcodeCaptureSettings.codeDuplicateFilter;
        this._arucoDictionary = null;
        this.batterySaving = BarcodeCaptureSettings.barcodeCaptureDefaults.BarcodeCaptureSettings.batterySaving;
        this.scanIntention = BarcodeCaptureSettings.barcodeCaptureDefaults.BarcodeCaptureSettings.scanIntention;
    }
    settingsForSymbology(symbology) {
        if (!this.symbologies[symbology]) {
            const symbologySettings = BarcodeCaptureSettings.barcodeDefaults.SymbologySettings[symbology];
            symbologySettings._symbology = symbology;
            this.symbologies[symbology] = symbologySettings;
        }
        return this.symbologies[symbology];
    }
    setProperty(name, value) {
        this.properties[name] = value;
    }
    getProperty(name) {
        return this.properties[name];
    }
    enableSymbologies(symbologies) {
        symbologies.forEach(symbology => this.enableSymbology(symbology, true));
    }
    enableSymbology(symbology, enabled) {
        this.settingsForSymbology(symbology).isEnabled = enabled;
    }
    enableSymbologiesForCompositeTypes(compositeTypes) {
        compositeTypes.forEach(compositeType => {
            this.enableSymbologies(this.compositeTypeDescriptions[compositeType].symbologies);
        });
    }
    setArucoDictionary(dictionary) {
        this._arucoDictionary = dictionary;
    }
    get codeDuplicateFilter() {
        return this._codeDuplicateFilter;
    }
    set codeDuplicateFilter(value) {
        this._codeDuplicateFilter = value;
    }
}
__decorate([
    serializationDefault(NoneLocationSelection)
], BarcodeCaptureSettings.prototype, "locationSelection", void 0);
__decorate([
    nameForSerialization('codeDuplicateFilter')
], BarcodeCaptureSettings.prototype, "_codeDuplicateFilter", void 0);
__decorate([
    nameForSerialization('arucoDictionary')
], BarcodeCaptureSettings.prototype, "_arucoDictionary", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeCaptureSettings, "barcodeDefaults", null);
__decorate([
    ignoreFromSerialization
], BarcodeCaptureSettings, "barcodeCaptureDefaults", null);

class BarcodeArFeedback extends DefaultSerializeable {
    static get defaultFeedback() {
        const feedback = new BarcodeArFeedback();
        feedback.scanned = BarcodeArFeedback.barcodeArDefaults.Feedback.scanned;
        feedback.tapped = BarcodeArFeedback.barcodeArDefaults.Feedback.tapped;
        return feedback;
    }
    static get barcodeArDefaults() {
        return getBarcodeArDefaults();
    }
    static fromJSON(json) {
        const scanned = Feedback.fromJSON(json.scanned);
        const tapped = Feedback.fromJSON(json.tapped);
        const feedback = new BarcodeArFeedback();
        feedback.scanned = scanned;
        feedback.tapped = tapped;
        return feedback;
    }
    get scanned() {
        return this._scanned;
    }
    set scanned(scanned) {
        this._scanned = scanned;
        this.updateFeedback();
    }
    get tapped() {
        return this._tapped;
    }
    set tapped(tapped) {
        this._tapped = tapped;
        this.updateFeedback();
    }
    updateFeedback() {
        var _a;
        (_a = this.controller) === null || _a === void 0 ? void 0 : _a.updateFeedback(JSON.stringify(this.toJSON()));
    }
    constructor() {
        super();
        this.controller = null;
        this._scanned = BarcodeArFeedback.barcodeArDefaults.Feedback.scanned;
        this._tapped = BarcodeArFeedback.barcodeArDefaults.Feedback.tapped;
        this.scanned = new Feedback(null, null);
        this.tapped = new Feedback(null, null);
    }
}
__decorate([
    ignoreFromSerialization
], BarcodeArFeedback.prototype, "controller", void 0);
__decorate([
    nameForSerialization('scanned')
], BarcodeArFeedback.prototype, "_scanned", void 0);
__decorate([
    nameForSerialization('tapped')
], BarcodeArFeedback.prototype, "_tapped", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeArFeedback, "barcodeArDefaults", null);

class BarcodeAr extends DefaultSerializeable {
    get controller() {
        return this._controller;
    }
    set controller(newController) {
        this._controller = newController;
        this._feedback.controller = this.controller;
    }
    static get barcodeArDefaults() {
        return getBarcodeArDefaults();
    }
    static createRecommendedCameraSettings() {
        return new CameraSettings(BarcodeAr.barcodeArDefaults.RecommendedCameraSettings);
    }
    constructor(settings) {
        super();
        this.type = 'barcodeAr';
        this.privateContext = null;
        this._feedback = BarcodeArFeedback.defaultFeedback;
        this.listeners = [];
        this._controller = null;
        this._settings = settings;
    }
    applySettings(settings) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            this._settings = settings;
            return (_a = this._controller) === null || _a === void 0 ? void 0 : _a.applyNewSettings(settings);
        });
    }
    addListener(listener) {
        this.checkAndSubscribeListeners();
        if (this.listeners.includes(listener)) {
            return;
        }
        this.listeners.push(listener);
    }
    checkAndSubscribeListeners() {
        if (this.listeners.length === 0) {
            this.subscribeNativeListeners();
        }
    }
    removeListener(listener) {
        if (!this.listeners.includes(listener)) {
            return;
        }
        this.listeners.splice(this.listeners.indexOf(listener));
        this.checkAndUnsubscribeListeners();
    }
    checkAndUnsubscribeListeners() {
        if (this.listeners.length === 0) {
            this.unsubscribeNativeListeners();
        }
    }
    subscribeNativeListeners() {
        var _a;
        (_a = this.controller) === null || _a === void 0 ? void 0 : _a.registerModeListener();
    }
    unsubscribeNativeListeners() {
        var _a;
        (_a = this.controller) === null || _a === void 0 ? void 0 : _a.unregisterModeListener();
    }
    didChange() {
        var _a, _b;
        return (_b = (_a = this.controller) === null || _a === void 0 ? void 0 : _a.updateMode()) !== null && _b !== void 0 ? _b : Promise.resolve();
    }
    get _context() {
        return this.privateContext;
    }
    set _context(newContext) {
        this.privateContext = newContext;
    }
    get feedback() {
        return this._feedback;
    }
    set feedback(feedback) {
        var _a;
        this._feedback = feedback;
        this._feedback.controller = this.controller;
        (_a = this.controller) === null || _a === void 0 ? void 0 : _a.updateFeedback(JSON.stringify(feedback.toJSON()));
    }
    toJSON() {
        const json = Object.assign(Object.assign({}, super.toJSON()), { hasModeListener: this.listeners.length > 0 });
        return json;
    }
}
__decorate([
    ignoreFromSerialization
], BarcodeAr.prototype, "privateContext", void 0);
__decorate([
    nameForSerialization('feedback')
], BarcodeAr.prototype, "_feedback", void 0);
__decorate([
    nameForSerialization('settings')
], BarcodeAr.prototype, "_settings", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeAr.prototype, "listeners", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeAr.prototype, "_controller", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeAr, "barcodeArDefaults", null);

class BarcodeArCircleHighlight extends Observable {
    static get barcodeArDefaults() {
        return getBarcodeArDefaults();
    }
    constructor(barcode, preset) {
        super();
        this._type = 'barcodeArCircleHighlight';
        this._barcode = barcode;
        this._preset = preset;
        this._brush = BarcodeArCircleHighlight.barcodeArDefaults.BarcodeArView.circleHighlightPresets[preset].brush;
        this._size = BarcodeArCircleHighlight.barcodeArDefaults.BarcodeArView.circleHighlightPresets[preset].size;
        this._icon = BarcodeArCircleHighlight.barcodeArDefaults.BarcodeArView.defaultHighlightIcon;
    }
    get barcode() {
        return this._barcode;
    }
    get brush() {
        return this._brush;
    }
    set brush(brush) {
        this._brush = brush;
        this.notifyListeners('brush', brush);
    }
    get icon() {
        return this._icon;
    }
    set icon(value) {
        this._icon = value;
        this.notifyListeners('icon', value);
    }
    get size() {
        return this._size;
    }
    set size(value) {
        this._size = value;
        this.notifyListeners('size', value);
    }
}
__decorate([
    nameForSerialization('type')
], BarcodeArCircleHighlight.prototype, "_type", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeArCircleHighlight.prototype, "_barcode", void 0);
__decorate([
    nameForSerialization('brush')
], BarcodeArCircleHighlight.prototype, "_brush", void 0);
__decorate([
    nameForSerialization('icon')
], BarcodeArCircleHighlight.prototype, "_icon", void 0);
__decorate([
    nameForSerialization('preset')
], BarcodeArCircleHighlight.prototype, "_preset", void 0);
__decorate([
    nameForSerialization('size')
], BarcodeArCircleHighlight.prototype, "_size", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeArCircleHighlight, "barcodeArDefaults", null);

class BarcodeArInfoAnnotation extends Observable {
    static get barcodeArDefaults() {
        return getBarcodeArDefaults();
    }
    constructor(barcode) {
        super();
        this._type = 'barcodeArInfoAnnotation';
        this._annotationTrigger = BarcodeArInfoAnnotation.barcodeArDefaults
            .BarcodeArView.defaultInfoAnnotationTrigger;
        this._anchor = BarcodeArInfoAnnotation.barcodeArDefaults
            .BarcodeArView.defaultInfoAnnotationAnchor;
        this._backgroundColor = BarcodeArInfoAnnotation.barcodeArDefaults
            .BarcodeArView.defaultInfoAnnotationBackgroundColor;
        this._body = [];
        this._footer = null;
        this._hasTip = BarcodeArInfoAnnotation.barcodeArDefaults
            .BarcodeArView.defaultInfoAnnotationHasTip;
        this._header = null;
        this._isEntireAnnotationTappable = BarcodeArInfoAnnotation.barcodeArDefaults
            .BarcodeArView.defaultInfoAnnotationEntireAnnotationTappable;
        this._listener = null;
        this._hasListener = false;
        this._width = BarcodeArInfoAnnotation.barcodeArDefaults.BarcodeArView.defaultInfoAnnotationWidth;
        this.footerChangedListener = () => {
            this.notifyListeners('footer', this._footer);
        };
        this.headerChangedListener = () => {
            this.notifyListeners('header', this._header);
        };
        this._barcode = barcode;
    }
    get anchor() {
        return this._anchor;
    }
    set anchor(newValue) {
        this._anchor = newValue;
        this.notifyListeners('anchor', newValue);
    }
    get annotationTrigger() {
        return this._annotationTrigger;
    }
    set annotationTrigger(newValue) {
        this._annotationTrigger = newValue;
        this.notifyListeners('annotationTrigger', newValue);
    }
    get backgroundColor() {
        return this._backgroundColor;
    }
    set backgroundColor(newValue) {
        this._backgroundColor = newValue;
        this.notifyListeners('backgroundColor', newValue);
    }
    get barcode() {
        return this._barcode;
    }
    get body() {
        return this._body;
    }
    set body(newValue) {
        this._body = newValue;
        for (const body of newValue) {
            body.addListener(() => {
                this.notifyListeners('body', newValue);
            });
        }
        this.notifyListeners('body', newValue);
    }
    get footer() {
        return this._footer;
    }
    set footer(newValue) {
        var _a, _b;
        (_a = this._footer) === null || _a === void 0 ? void 0 : _a.removeListener(this.footerChangedListener);
        this._footer = newValue;
        (_b = this._footer) === null || _b === void 0 ? void 0 : _b.addListener(this.footerChangedListener);
        this.notifyListeners('footer', newValue);
    }
    get hasTip() {
        return this._hasTip;
    }
    set hasTip(newValue) {
        this._hasTip = newValue;
        this.notifyListeners('hasTip', newValue);
    }
    get header() {
        return this._header;
    }
    set header(newValue) {
        var _a, _b;
        (_a = this._header) === null || _a === void 0 ? void 0 : _a.removeListener(this.headerChangedListener);
        this._header = newValue;
        (_b = this._header) === null || _b === void 0 ? void 0 : _b.addListener(this.headerChangedListener);
        this.notifyListeners('header', newValue);
    }
    get isEntireAnnotationTappable() {
        return this._isEntireAnnotationTappable;
    }
    set isEntireAnnotationTappable(newValue) {
        this._isEntireAnnotationTappable = newValue;
        this.notifyListeners('isEntireAnnotationTappable', newValue);
    }
    get listener() {
        return this._listener;
    }
    set listener(newValue) {
        this._listener = newValue;
        this._hasListener = newValue != null;
        this.notifyListeners('listener', newValue);
    }
    get width() {
        return this._width;
    }
    set width(newValue) {
        this._width = newValue;
        this.notifyListeners('width', newValue);
    }
}
__decorate([
    ignoreFromSerialization
], BarcodeArInfoAnnotation.prototype, "_barcode", void 0);
__decorate([
    nameForSerialization('type')
], BarcodeArInfoAnnotation.prototype, "_type", void 0);
__decorate([
    nameForSerialization('annotationTrigger')
], BarcodeArInfoAnnotation.prototype, "_annotationTrigger", void 0);
__decorate([
    nameForSerialization('anchor')
], BarcodeArInfoAnnotation.prototype, "_anchor", void 0);
__decorate([
    nameForSerialization('backgroundColor')
], BarcodeArInfoAnnotation.prototype, "_backgroundColor", void 0);
__decorate([
    nameForSerialization('body')
], BarcodeArInfoAnnotation.prototype, "_body", void 0);
__decorate([
    nameForSerialization('footer')
], BarcodeArInfoAnnotation.prototype, "_footer", void 0);
__decorate([
    nameForSerialization('hasTip')
], BarcodeArInfoAnnotation.prototype, "_hasTip", void 0);
__decorate([
    nameForSerialization('header')
], BarcodeArInfoAnnotation.prototype, "_header", void 0);
__decorate([
    nameForSerialization('isEntireAnnotationTappable')
], BarcodeArInfoAnnotation.prototype, "_isEntireAnnotationTappable", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeArInfoAnnotation.prototype, "_listener", void 0);
__decorate([
    nameForSerialization('hasListener')
], BarcodeArInfoAnnotation.prototype, "_hasListener", void 0);
__decorate([
    nameForSerialization('width')
], BarcodeArInfoAnnotation.prototype, "_width", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeArInfoAnnotation, "barcodeArDefaults", null);

class BarcodeArInfoAnnotationBodyComponent extends Observable {
    constructor() {
        super(...arguments);
        this._isRightIconTappable = BarcodeArInfoAnnotationBodyComponent
            .barcodeArDefaults.BarcodeArView.defaultInfoAnnotationBodyElementRightIconTappable;
        this._isLeftIconTappable = BarcodeArInfoAnnotationBodyComponent
            .barcodeArDefaults.BarcodeArView.defaultInfoAnnotationBodyElementLeftIconTappable;
        this._rightIcon = BarcodeArInfoAnnotationBodyComponent
            .barcodeArDefaults.BarcodeArView.defaultInfoAnnotationBodyElementRightIcon;
        this._leftIcon = BarcodeArInfoAnnotationBodyComponent
            .barcodeArDefaults.BarcodeArView.defaultInfoAnnotationBodyElementLeftIcon;
        this._text = BarcodeArInfoAnnotationBodyComponent
            .barcodeArDefaults.BarcodeArView.defaultInfoAnnotationBodyElementText;
        this._textAlign = TextAlignment.Center;
        this._textColor = BarcodeArInfoAnnotationBodyComponent
            .barcodeArDefaults.BarcodeArView.defaultInfoAnnotationBodyElementTextColor;
        this._textSize = BarcodeArInfoAnnotationBodyComponent
            .barcodeArDefaults.BarcodeArView.defaultInfoAnnotationBodyElementTextSize;
        this._fontFamily = FontFamily.SystemDefault;
    }
    static get barcodeArDefaults() {
        return getBarcodeArDefaults();
    }
    get isRightIconTappable() {
        return this._isRightIconTappable;
    }
    set isRightIconTappable(value) {
        this._isRightIconTappable = value;
        this.notifyListeners('isRightIconTappable', value);
    }
    get isLeftIconTappable() {
        return this._isLeftIconTappable;
    }
    set isLeftIconTappable(value) {
        this._isLeftIconTappable = value;
        this.notifyListeners('isLeftIconTappable', value);
    }
    get rightIcon() {
        return this._rightIcon;
    }
    set rightIcon(value) {
        this._rightIcon = value;
        this.notifyListeners('rightIcon', value);
    }
    get leftIcon() {
        return this._leftIcon;
    }
    set leftIcon(value) {
        this._leftIcon = value;
        this.notifyListeners('leftIcon', value);
    }
    get text() {
        return this._text;
    }
    set text(value) {
        this._text = value;
        this.notifyListeners('text', value);
    }
    get textAlign() {
        return this._textAlign;
    }
    set textAlign(value) {
        this._textAlign = value;
        this.notifyListeners('textAlign', value);
    }
    get textColor() {
        return this._textColor;
    }
    set textColor(value) {
        this._textColor = value;
        this.notifyListeners('textColor', value);
    }
    get textSize() {
        return this._textSize;
    }
    set textSize(value) {
        this._textSize = value;
        this.notifyListeners('textSize', value);
    }
    get fontFamily() {
        return this._fontFamily;
    }
    set fontFamily(value) {
        this._fontFamily = value;
        this.notifyListeners('fontFamily', value);
    }
}
__decorate([
    nameForSerialization('isRightIconTappable')
], BarcodeArInfoAnnotationBodyComponent.prototype, "_isRightIconTappable", void 0);
__decorate([
    nameForSerialization('isLeftIconTappable')
], BarcodeArInfoAnnotationBodyComponent.prototype, "_isLeftIconTappable", void 0);
__decorate([
    nameForSerialization('rightIcon')
], BarcodeArInfoAnnotationBodyComponent.prototype, "_rightIcon", void 0);
__decorate([
    nameForSerialization('leftIcon')
], BarcodeArInfoAnnotationBodyComponent.prototype, "_leftIcon", void 0);
__decorate([
    nameForSerialization('text')
], BarcodeArInfoAnnotationBodyComponent.prototype, "_text", void 0);
__decorate([
    nameForSerialization('textAlign')
], BarcodeArInfoAnnotationBodyComponent.prototype, "_textAlign", void 0);
__decorate([
    nameForSerialization('textColor')
], BarcodeArInfoAnnotationBodyComponent.prototype, "_textColor", void 0);
__decorate([
    nameForSerialization('textSize')
], BarcodeArInfoAnnotationBodyComponent.prototype, "_textSize", void 0);
__decorate([
    nameForSerialization('fontFamily')
], BarcodeArInfoAnnotationBodyComponent.prototype, "_fontFamily", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeArInfoAnnotationBodyComponent, "barcodeArDefaults", null);

class BarcodeArInfoAnnotationFooter extends Observable {
    static get barcodeArDefaults() {
        return getBarcodeArDefaults();
    }
    constructor() {
        super();
        this._text = BarcodeArInfoAnnotationFooter.barcodeArDefaults
            .BarcodeArView.defaultInfoAnnotationFooterText;
        this._icon = BarcodeArInfoAnnotationFooter.barcodeArDefaults
            .BarcodeArView.defaultInfoAnnotationFooterIcon;
        this._textSize = BarcodeArInfoAnnotationFooter.barcodeArDefaults
            .BarcodeArView.defaultInfoAnnotationFooterTextSize;
        this._textColor = BarcodeArInfoAnnotationFooter.barcodeArDefaults
            .BarcodeArView.defaultInfoAnnotationFooterTextColor;
        this._backgroundColor = BarcodeArInfoAnnotationFooter.barcodeArDefaults
            .BarcodeArView.defaultInfoAnnotationFooterBackgroundColor;
        this._fontFamily = FontFamily.SystemDefault;
    }
    get text() {
        return this._text;
    }
    set text(value) {
        this._text = value;
        this.notifyListeners('text', value);
    }
    get icon() {
        return this._icon;
    }
    set icon(value) {
        this._icon = value;
        this.notifyListeners('icon', value);
    }
    get textSize() {
        return this._textSize;
    }
    set textSize(value) {
        this._textSize = value;
        this.notifyListeners('textSize', value);
    }
    get textColor() {
        return this._textColor;
    }
    set textColor(value) {
        this._textColor = value;
        this.notifyListeners('textColor', value);
    }
    get backgroundColor() {
        return this._backgroundColor;
    }
    set backgroundColor(value) {
        this._backgroundColor = value;
        this.notifyListeners('backgroundColor', value);
    }
    get fontFamily() {
        return this._fontFamily;
    }
    set fontFamily(value) {
        this._fontFamily = value;
        this.notifyListeners('fontFamily', value);
    }
}
__decorate([
    nameForSerialization('text')
], BarcodeArInfoAnnotationFooter.prototype, "_text", void 0);
__decorate([
    nameForSerialization('icon')
], BarcodeArInfoAnnotationFooter.prototype, "_icon", void 0);
__decorate([
    nameForSerialization('textSize')
], BarcodeArInfoAnnotationFooter.prototype, "_textSize", void 0);
__decorate([
    nameForSerialization('textColor')
], BarcodeArInfoAnnotationFooter.prototype, "_textColor", void 0);
__decorate([
    nameForSerialization('backgroundColor')
], BarcodeArInfoAnnotationFooter.prototype, "_backgroundColor", void 0);
__decorate([
    nameForSerialization('fontFamily')
], BarcodeArInfoAnnotationFooter.prototype, "_fontFamily", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeArInfoAnnotationFooter, "barcodeArDefaults", null);

class BarcodeArInfoAnnotationHeader extends Observable {
    static get barcodeArDefaults() {
        return getBarcodeArDefaults();
    }
    constructor() {
        super();
        this._text = BarcodeArInfoAnnotationHeader.barcodeArDefaults
            .BarcodeArView.defaultInfoAnnotationHeaderText;
        this._icon = BarcodeArInfoAnnotationHeader.barcodeArDefaults
            .BarcodeArView.defaultInfoAnnotationHeaderIcon;
        this._textSize = BarcodeArInfoAnnotationHeader.barcodeArDefaults
            .BarcodeArView.defaultInfoAnnotationHeaderTextSize;
        this._textColor = BarcodeArInfoAnnotationHeader.barcodeArDefaults
            .BarcodeArView.defaultInfoAnnotationHeaderTextColor;
        this._backgroundColor = BarcodeArInfoAnnotationHeader.barcodeArDefaults
            .BarcodeArView.defaultInfoAnnotationHeaderBackgroundColor;
        this._fontFamily = FontFamily.SystemDefault;
    }
    get text() {
        return this._text;
    }
    set text(value) {
        this._text = value;
        this.notifyListeners('text', value);
    }
    get icon() {
        return this._icon;
    }
    set icon(value) {
        this._icon = value;
        this.notifyListeners('icon', value);
    }
    get textSize() {
        return this._textSize;
    }
    set textSize(value) {
        this._textSize = value;
        this.notifyListeners('textSize', value);
    }
    get textColor() {
        return this._textColor;
    }
    set textColor(value) {
        this._textColor = value;
        this.notifyListeners('textColor', value);
    }
    get backgroundColor() {
        return this._backgroundColor;
    }
    set backgroundColor(value) {
        this._backgroundColor = value;
        this.notifyListeners('backgroundColor', value);
    }
    get fontFamily() {
        return this._fontFamily;
    }
    set fontFamily(value) {
        this._fontFamily = value;
        this.notifyListeners('fontFamily', value);
    }
}
__decorate([
    nameForSerialization('text')
], BarcodeArInfoAnnotationHeader.prototype, "_text", void 0);
__decorate([
    nameForSerialization('icon')
], BarcodeArInfoAnnotationHeader.prototype, "_icon", void 0);
__decorate([
    nameForSerialization('textSize')
], BarcodeArInfoAnnotationHeader.prototype, "_textSize", void 0);
__decorate([
    nameForSerialization('textColor')
], BarcodeArInfoAnnotationHeader.prototype, "_textColor", void 0);
__decorate([
    nameForSerialization('backgroundColor')
], BarcodeArInfoAnnotationHeader.prototype, "_backgroundColor", void 0);
__decorate([
    nameForSerialization('fontFamily')
], BarcodeArInfoAnnotationHeader.prototype, "_fontFamily", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeArInfoAnnotationHeader, "barcodeArDefaults", null);

class BarcodeArPopoverAnnotation extends Observable {
    static get barcodeArDefaults() {
        return getBarcodeArDefaults();
    }
    constructor(barcode, buttons) {
        super();
        this._type = 'barcodeArPopoverAnnotation';
        this._isEntirePopoverTappable = BarcodeArPopoverAnnotation.barcodeArDefaults
            .BarcodeArView.defaultIsEntirePopoverTappable;
        this._listener = null;
        this._hasListener = false;
        this._annotationTrigger = BarcodeArPopoverAnnotation.barcodeArDefaults
            .BarcodeArView.defaultInfoAnnotationTrigger;
        this.buttonChangedListener = (property, index) => {
            this.notifyListeners(property, index);
        };
        this._barcode = barcode;
        this._buttons = buttons;
        for (const button of buttons) {
            button.addListener(() => {
                this.buttonChangedListener('BarcodeArPopoverAnnotation.button', buttons.indexOf(button));
            });
        }
    }
    get barcode() {
        return this._barcode;
    }
    get isEntirePopoverTappable() {
        return this._isEntirePopoverTappable;
    }
    set isEntirePopoverTappable(value) {
        this._isEntirePopoverTappable = value;
        this.notifyListeners('isEntirePopoverTappable', value);
    }
    get listener() {
        return this._listener;
    }
    set listener(value) {
        this._listener = value;
        this._hasListener = value != null;
        this.notifyListeners('listener', value);
    }
    get annotationTrigger() {
        return this._annotationTrigger;
    }
    set annotationTrigger(value) {
        this._annotationTrigger = value;
        this.notifyListeners('annotationTrigger', value);
    }
    get buttons() {
        return this._buttons;
    }
}
__decorate([
    nameForSerialization('type')
], BarcodeArPopoverAnnotation.prototype, "_type", void 0);
__decorate([
    nameForSerialization('isEntirePopoverTappable')
], BarcodeArPopoverAnnotation.prototype, "_isEntirePopoverTappable", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeArPopoverAnnotation.prototype, "_listener", void 0);
__decorate([
    nameForSerialization('hasListener')
], BarcodeArPopoverAnnotation.prototype, "_hasListener", void 0);
__decorate([
    nameForSerialization('annotationTrigger')
], BarcodeArPopoverAnnotation.prototype, "_annotationTrigger", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeArPopoverAnnotation.prototype, "_barcode", void 0);
__decorate([
    nameForSerialization('buttons')
], BarcodeArPopoverAnnotation.prototype, "_buttons", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeArPopoverAnnotation, "barcodeArDefaults", null);

class BarcodeArPopoverAnnotationButton extends Observable {
    static get barcodeArDefaults() {
        return getBarcodeArDefaults();
    }
    constructor(icon, text) {
        super();
        this._textColor = BarcodeArPopoverAnnotationButton
            .barcodeArDefaults.BarcodeArView.defaultBarcodeArPopoverAnnotationButtonTextColor;
        this._textSize = BarcodeArPopoverAnnotationButton
            .barcodeArDefaults.BarcodeArView.defaultBarcodeArPopoverAnnotationButtonTextSize;
        this._fontFamily = FontFamily.SystemDefault;
        this._icon = icon;
        this._text = text;
    }
    get textColor() {
        return this._textColor;
    }
    set textColor(value) {
        this._textColor = value;
        this.notifyListeners('textColor', value);
    }
    get textSize() {
        return this._textSize;
    }
    set textSize(value) {
        this._textSize = value;
        this.notifyListeners('textSize', value);
    }
    get fontFamily() {
        return this._fontFamily;
    }
    set fontFamily(value) {
        this._fontFamily = value;
        this.notifyListeners('fontFamily', value);
    }
    get icon() {
        return this._icon;
    }
    get text() {
        return this._text;
    }
}
__decorate([
    nameForSerialization('textColor')
], BarcodeArPopoverAnnotationButton.prototype, "_textColor", void 0);
__decorate([
    nameForSerialization('textSize')
], BarcodeArPopoverAnnotationButton.prototype, "_textSize", void 0);
__decorate([
    nameForSerialization('fontFamily')
], BarcodeArPopoverAnnotationButton.prototype, "_fontFamily", void 0);
__decorate([
    nameForSerialization('icon')
], BarcodeArPopoverAnnotationButton.prototype, "_icon", void 0);
__decorate([
    nameForSerialization('text')
], BarcodeArPopoverAnnotationButton.prototype, "_text", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeArPopoverAnnotationButton, "barcodeArDefaults", null);

class BarcodeArRectangleHighlight extends Observable {
    static get barcodeArDefaults() {
        return getBarcodeArDefaults();
    }
    constructor(barcode) {
        super();
        this._type = 'barcodeArRectangleHighlight';
        this._brush = BarcodeArRectangleHighlight
            .barcodeArDefaults.BarcodeArView.defaultRectangleHighlightBrush;
        this._icon = BarcodeArRectangleHighlight
            .barcodeArDefaults.BarcodeArView.defaultHighlightIcon;
        this._barcode = barcode;
    }
    get barcode() {
        return this._barcode;
    }
    get brush() {
        return this._brush;
    }
    set brush(brush) {
        this._brush = brush;
        this.notifyListeners('brush', brush);
    }
    get icon() {
        return this._icon;
    }
    set icon(icon) {
        this._icon = icon;
        this.notifyListeners('icon', icon);
    }
}
__decorate([
    ignoreFromSerialization
], BarcodeArRectangleHighlight.prototype, "_barcode", void 0);
__decorate([
    nameForSerialization('type')
], BarcodeArRectangleHighlight.prototype, "_type", void 0);
__decorate([
    nameForSerialization('brush')
], BarcodeArRectangleHighlight.prototype, "_brush", void 0);
__decorate([
    nameForSerialization('icon')
], BarcodeArRectangleHighlight.prototype, "_icon", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeArRectangleHighlight, "barcodeArDefaults", null);

class BarcodeArSessionController extends BaseNewController {
    constructor(viewId) {
        super('BarcodeArSessionProxy');
        this.viewId = viewId;
    }
    $resetBarcodeArSession() {
        return this._proxy.$resetBarcodeArSession({ viewId: this.viewId });
    }
}

class BarcodeArSession extends DefaultSerializeable {
    static fromJSON(json) {
        const sessionJson = JSON.parse(json);
        const session = new BarcodeArSession(json.viewId);
        session._addedTrackedBarcodes = sessionJson.addedTrackedBarcodes
            .map((trackedBarcodeJSON) => {
            return TrackedBarcode
                .fromJSON(trackedBarcodeJSON, sessionJson.frameSequenceId);
        });
        session._removedTrackedBarcodes = sessionJson.removedTrackedBarcodes;
        session._trackedBarcodes = Object.keys(sessionJson.allTrackedBarcodes)
            .reduce((trackedBarcodes, identifier) => {
            trackedBarcodes[identifier] = TrackedBarcode
                .fromJSON(sessionJson.allTrackedBarcodes[identifier], sessionJson.frameSequenceId);
            return trackedBarcodes;
        }, {});
        return session;
    }
    constructor(viewId) {
        super();
        this.sessionController = new BarcodeArSessionController(viewId);
    }
    get addedTrackedBarcodes() {
        return this._addedTrackedBarcodes;
    }
    get removedTrackedBarcodes() {
        return this._removedTrackedBarcodes;
    }
    get trackedBarcodes() {
        return this._trackedBarcodes;
    }
    reset() {
        return this.sessionController.$resetBarcodeArSession();
    }
}
__decorate([
    nameForSerialization('addedTrackedBarcodes')
], BarcodeArSession.prototype, "_addedTrackedBarcodes", void 0);
__decorate([
    nameForSerialization('removedTrackedBarcodes')
], BarcodeArSession.prototype, "_removedTrackedBarcodes", void 0);
__decorate([
    nameForSerialization('trackedBarcodes')
], BarcodeArSession.prototype, "_trackedBarcodes", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeArSession.prototype, "sessionController", void 0);

class BarcodeArSettings extends DefaultSerializeable {
    constructor() {
        super(...arguments);
        this.symbologies = {};
        this.properties = {};
    }
    static get barcodeDefaults() {
        return getBarcodeDefaults();
    }
    get enabledSymbologies() {
        return Object.keys(this.symbologies)
            .filter(symbology => this.symbologies[symbology].isEnabled);
    }
    settingsForSymbology(symbology) {
        if (!this.symbologies[symbology]) {
            const symbologySettings = BarcodeArSettings.barcodeDefaults.SymbologySettings[symbology];
            symbologySettings._symbology = symbology;
            this.symbologies[symbology] = symbologySettings;
        }
        return this.symbologies[symbology];
    }
    enableSymbologies(symbologies) {
        symbologies.forEach(symbology => this.enableSymbology(symbology, true));
    }
    enableSymbology(symbology, enabled) {
        this.settingsForSymbology(symbology).isEnabled = enabled;
    }
    setProperty(name, value) {
        this.properties[name] = value;
    }
    getProperty(name) {
        return this.properties[name];
    }
}
__decorate([
    ignoreFromSerialization
], BarcodeArSettings, "barcodeDefaults", null);

class BarcodeArStatusIconAnnotation extends Observable {
    static get barcodeArDefaults() {
        return getBarcodeArDefaults();
    }
    constructor(barcode) {
        super();
        this._type = 'barcodeArStatusIconAnnotation';
        this._hasTip = BarcodeArStatusIconAnnotation
            .barcodeArDefaults.BarcodeArView.defaultStatusIconAnnotationHasTip;
        this._icon = BarcodeArStatusIconAnnotation
            .barcodeArDefaults.BarcodeArView.defaultStatusIconAnnotationIcon;
        this._text = BarcodeArStatusIconAnnotation
            .barcodeArDefaults.BarcodeArView.defaultStatusIconAnnotationText;
        this._textColor = BarcodeArStatusIconAnnotation
            .barcodeArDefaults.BarcodeArView.defaultStatusIconAnnotationTextColor;
        this._backgroundColor = BarcodeArStatusIconAnnotation
            .barcodeArDefaults.BarcodeArView.defaultStatusIconAnnotationBackgroundColor;
        this._annotationTrigger = BarcodeArStatusIconAnnotation
            .barcodeArDefaults.BarcodeArView.defaultStatusIconAnnotationTrigger;
        this._barcode = barcode;
    }
    get barcode() {
        return this._barcode;
    }
    get hasTip() {
        return this._hasTip;
    }
    set hasTip(value) {
        this._hasTip = value;
        this.notifyListeners('hasTip', value);
    }
    get icon() {
        return this._icon;
    }
    set icon(value) {
        this._icon = value;
        this.notifyListeners('icon', value);
    }
    get text() {
        return this._text;
    }
    set text(value) {
        this._text = value;
        this.notifyListeners('text', value);
    }
    get textColor() {
        return this._textColor;
    }
    set textColor(value) {
        this._textColor = value;
        this.notifyListeners('textColor', value);
    }
    get backgroundColor() {
        return this._backgroundColor;
    }
    set backgroundColor(value) {
        this._backgroundColor = value;
        this.notifyListeners('backgroundColor', value);
    }
    get annotationTrigger() {
        return this._annotationTrigger;
    }
    set annotationTrigger(value) {
        this._annotationTrigger = value;
        this.notifyListeners('annotationTrigger', value);
    }
}
__decorate([
    nameForSerialization('type')
], BarcodeArStatusIconAnnotation.prototype, "_type", void 0);
__decorate([
    nameForSerialization('barcode')
], BarcodeArStatusIconAnnotation.prototype, "_barcode", void 0);
__decorate([
    nameForSerialization('hasTip')
], BarcodeArStatusIconAnnotation.prototype, "_hasTip", void 0);
__decorate([
    nameForSerialization('icon')
], BarcodeArStatusIconAnnotation.prototype, "_icon", void 0);
__decorate([
    nameForSerialization('text')
], BarcodeArStatusIconAnnotation.prototype, "_text", void 0);
__decorate([
    nameForSerialization('textColor')
], BarcodeArStatusIconAnnotation.prototype, "_textColor", void 0);
__decorate([
    nameForSerialization('backgroundColor')
], BarcodeArStatusIconAnnotation.prototype, "_backgroundColor", void 0);
__decorate([
    nameForSerialization('annotationTrigger')
], BarcodeArStatusIconAnnotation.prototype, "_annotationTrigger", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeArStatusIconAnnotation, "barcodeArDefaults", null);

class BarcodeArViewEventHandlers {
    constructor(view, barcodeAr, proxy) {
        this.view = view;
        this.barcodeAr = barcodeAr;
        this.proxy = proxy;
        this.highlightCache = {};
        this.annotationsCache = {};
        // Bind all handler methods to 'this' to ensure the correct context when they are used as callbacks
        this.handleDidTapHighlightForBarcode = this.handleDidTapHighlightForBarcode.bind(this);
        this.handleHighlightForBarcode = this.handleHighlightForBarcode.bind(this);
        this.handleAnnotationForBarcode = this.handleAnnotationForBarcode.bind(this);
        this.handleDidTapPopoverEvent = this.handleDidTapPopoverEvent.bind(this);
        this.handleDidTapPopoverButtonEvent = this.handleDidTapPopoverButtonEvent.bind(this);
        this.handleDidTapInfoAnnotationRightIconEvent = this.handleDidTapInfoAnnotationRightIconEvent.bind(this);
        this.handleDidTapInfoAnnotationLeftIconEvent = this.handleDidTapInfoAnnotationLeftIconEvent.bind(this);
        this.handleDidTapInfoAnnotationEvent = this.handleDidTapInfoAnnotationEvent.bind(this);
        this.handleDidTapInfoAnnotationHeaderEvent = this.handleDidTapInfoAnnotationHeaderEvent.bind(this);
        this.handleDidTapInfoAnnotationFooterEvent = this.handleDidTapInfoAnnotationFooterEvent.bind(this);
        this.handleDidUpdateSession = this.handleDidUpdateSession.bind(this);
    }
    clearCaches() {
        this.highlightCache = {};
        this.annotationsCache = {};
    }
    handleDidTapHighlightForBarcode(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!this.view.barcodeArViewUiListener) {
                return;
            }
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                console.error('BarcodeArViewController didTapHighlightForBarcode payload is null');
                return;
            }
            if (payload.viewId !== this.view.viewId) {
                return;
            }
            const barcodeJson = JSON.parse(payload.barcode);
            const barcode = Barcode.fromJSON(barcodeJson);
            const highlight = this.highlightCache[payload.barcodeId];
            if (!highlight) {
                return;
            }
            (_b = (_a = this.view) === null || _a === void 0 ? void 0 : _a.barcodeArViewUiListener) === null || _b === void 0 ? void 0 : _b.didTapHighlightForBarcode(this.barcodeAr, barcode, highlight);
        });
    }
    handleHighlightForBarcode(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                console.error('BarcodeArViewController highlightForBarcode payload is null');
                return;
            }
            if (payload.viewId !== this.view.viewId) {
                return;
            }
            const barcodeJson = JSON.parse(payload.barcode);
            const barcode = Barcode.fromJSON(barcodeJson);
            barcode.barcodeId = payload.barcodeId;
            const highlight = yield ((_b = (_a = this.view) === null || _a === void 0 ? void 0 : _a.highlightProvider) === null || _b === void 0 ? void 0 : _b.highlightForBarcode(barcode));
            if (highlight) {
                this.highlightCache[payload.barcodeId] = highlight;
                highlight.addListener(() => {
                    const highlightJson = highlight.toJSON();
                    highlightJson.barcodeId = payload.barcodeId;
                    this.proxy.$updateBarcodeArHighlight({ viewId: this.view.viewId, highlightJson: JSON.stringify(highlightJson) });
                });
            }
            const result = {
                barcodeId: payload.barcodeId,
                highlight: highlight === null || highlight === void 0 ? void 0 : highlight.toJSON()
            };
            this.proxy.$finishBarcodeArHighlightForBarcode({ viewId: this.view.viewId, highlightJson: JSON.stringify(result) });
        });
    }
    handleAnnotationForBarcode(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                console.error('BarcodeArViewController annotationForBarcode payload is null');
                return;
            }
            if (payload.viewId !== this.view.viewId) {
                return;
            }
            const barcodeJson = JSON.parse(payload.barcode);
            const barcode = Barcode.fromJSON(barcodeJson);
            barcode.barcodeId = payload.barcodeId;
            const annotation = yield ((_b = (_a = this.view) === null || _a === void 0 ? void 0 : _a.annotationProvider) === null || _b === void 0 ? void 0 : _b.annotationForBarcode(barcode));
            if (annotation) {
                this.annotationsCache[payload.barcodeId] = annotation;
                annotation.addListener((property, value) => {
                    if (property === 'BarcodeArPopoverAnnotation.button') {
                        const popover = annotation;
                        const button = popover.buttons[value];
                        const buttonJson = button.toJSON();
                        buttonJson.index = value;
                        const popoverButtonPayload = {
                            'button': buttonJson,
                            'barcodeId': payload.barcodeId,
                        };
                        this.proxy.$updateBarcodeArPopoverButtonAtIndex({ viewId: this.view.viewId, updateJson: JSON.stringify(popoverButtonPayload) });
                        return;
                    }
                    const annotationJson = annotation.toJSON();
                    annotationJson.barcodeId = payload.barcodeId;
                    this.proxy.$updateBarcodeArAnnotation({ viewId: this.view.viewId, annotationJson: JSON.stringify(annotationJson) });
                });
            }
            const result = {
                barcodeId: payload.barcodeId,
                annotation: annotation === null || annotation === void 0 ? void 0 : annotation.toJSON()
            };
            this.proxy.$finishBarcodeArAnnotationForBarcode({ viewId: this.view.viewId, annotationJson: JSON.stringify(result) });
        });
    }
    handleDidTapPopoverEvent(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                console.error('BarcodeArViewController didTapPopoverEvent payload is null');
                return;
            }
            if (payload.viewId !== this.view.viewId) {
                return;
            }
            const popover = this.annotationsCache[payload.barcodeId];
            if (!popover) {
                return;
            }
            (_b = (_a = popover.listener) === null || _a === void 0 ? void 0 : _a.didTap) === null || _b === void 0 ? void 0 : _b.call(_a, popover);
        });
    }
    handleDidTapPopoverButtonEvent(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                console.error('BarcodeArViewController didTapPopoverButtonEvent payload is null');
                return;
            }
            if (payload.viewId !== this.view.viewId) {
                return;
            }
            const popover = this.annotationsCache[payload.barcodeId];
            if (!popover || !payload.index) {
                return;
            }
            const button = popover.buttons[payload.index];
            (_b = (_a = popover.listener) === null || _a === void 0 ? void 0 : _a.didTapButton) === null || _b === void 0 ? void 0 : _b.call(_a, popover, button, payload.index);
        });
    }
    handleDidTapInfoAnnotationRightIconEvent(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                console.error('BarcodeArViewController didTapInfoAnnotationRightIconEvent payload is null');
                return;
            }
            if (payload.viewId !== this.view.viewId) {
                return;
            }
            const infoAnnotation = this.annotationsCache[payload.barcodeId];
            if (infoAnnotation == null || payload.componentIndex == null) {
                return;
            }
            const component = infoAnnotation.body[payload.componentIndex];
            (_b = (_a = infoAnnotation.listener) === null || _a === void 0 ? void 0 : _a.didTapRightIcon) === null || _b === void 0 ? void 0 : _b.call(_a, infoAnnotation, component, payload.componentIndex);
        });
    }
    handleDidTapInfoAnnotationLeftIconEvent(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                console.error('BarcodeArViewController didTapInfoAnnotationLeftIconEvent payload is null');
                return;
            }
            if (payload.viewId !== this.view.viewId) {
                return;
            }
            const infoAnnotation = this.annotationsCache[payload.barcodeId];
            if (infoAnnotation == null || payload.componentIndex == null) {
                return;
            }
            const component = infoAnnotation.body[payload.componentIndex];
            (_b = (_a = infoAnnotation.listener) === null || _a === void 0 ? void 0 : _a.didTapLeftIcon) === null || _b === void 0 ? void 0 : _b.call(_a, infoAnnotation, component, payload.componentIndex);
        });
    }
    handleDidTapInfoAnnotationEvent(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                console.error('BarcodeArViewController didTapInfoAnnotationEvent payload is null');
                return;
            }
            if (payload.viewId !== this.view.viewId) {
                return;
            }
            const infoAnnotation = this.annotationsCache[payload.barcodeId];
            if (infoAnnotation == null) {
                return;
            }
            (_b = (_a = infoAnnotation.listener) === null || _a === void 0 ? void 0 : _a.didTap) === null || _b === void 0 ? void 0 : _b.call(_a, infoAnnotation);
        });
    }
    handleDidTapInfoAnnotationHeaderEvent(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                console.error('BarcodeArViewController didTapInfoAnnotationHeaderEvent payload is null');
                return;
            }
            if (payload.viewId !== this.view.viewId) {
                return;
            }
            const infoAnnotation = this.annotationsCache[payload.barcodeId];
            if (infoAnnotation == null) {
                return;
            }
            (_b = (_a = infoAnnotation.listener) === null || _a === void 0 ? void 0 : _a.didTapHeader) === null || _b === void 0 ? void 0 : _b.call(_a, infoAnnotation);
        });
    }
    handleDidTapInfoAnnotationFooterEvent(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                console.error('BarcodeArViewController didTapInfoAnnotationFooterEvent payload is null');
                return;
            }
            if (payload.viewId !== this.view.viewId) {
                return;
            }
            const infoAnnotation = this.annotationsCache[payload.barcodeId];
            if (infoAnnotation == null) {
                return;
            }
            (_b = (_a = infoAnnotation.listener) === null || _a === void 0 ? void 0 : _a.didTapFooter) === null || _b === void 0 ? void 0 : _b.call(_a, infoAnnotation);
        });
    }
    handleDidUpdateSession(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                console.error('BarcodeArViewController didUpdateSession payload is null');
                return;
            }
            if (payload.viewId !== this.view.viewId) {
                return;
            }
            const session = BarcodeArSession.fromJSON(payload.session);
            yield this.notifyListenersOfDidUpdateSession(session, payload.frameId);
            this.proxy.$finishBarcodeArOnDidUpdateSession({ viewId: this.view.viewId });
        });
    }
    notifyListenersOfDidUpdateSession(session, frameId) {
        return __awaiter(this, void 0, void 0, function* () {
            const mode = this.barcodeAr;
            mode.isInListenerCallback = true;
            for (const listener of mode.listeners) {
                if (listener.didUpdateSession) {
                    yield listener.didUpdateSession(this.barcodeAr, session, () => CameraController.getFrame(frameId));
                }
            }
            mode.isInListenerCallback = false;
        });
    }
}

var BarcodeArViewEvents;
(function (BarcodeArViewEvents) {
    BarcodeArViewEvents["didTapHighlightForBarcode"] = "BarcodeArViewUiListener.didTapHighlightForBarcode";
})(BarcodeArViewEvents || (BarcodeArViewEvents = {}));
var BarcodeArHighlightProviderEvents;
(function (BarcodeArHighlightProviderEvents) {
    BarcodeArHighlightProviderEvents["highlightForBarcode"] = "BarcodeArHighlightProvider.highlightForBarcode";
})(BarcodeArHighlightProviderEvents || (BarcodeArHighlightProviderEvents = {}));
var BarcodeArHighlightLifecycleEvents;
(function (BarcodeArHighlightLifecycleEvents) {
    BarcodeArHighlightLifecycleEvents["create"] = "BarcodeArCustomHighlight.create";
    BarcodeArHighlightLifecycleEvents["update"] = "BarcodeArCustomHighlight.update";
    BarcodeArHighlightLifecycleEvents["hide"] = "BarcodeArCustomHighlight.hide";
    BarcodeArHighlightLifecycleEvents["show"] = "BarcodeArCustomHighlight.show";
    BarcodeArHighlightLifecycleEvents["dispose"] = "BarcodeArCustomHighlight.dispose";
})(BarcodeArHighlightLifecycleEvents || (BarcodeArHighlightLifecycleEvents = {}));
var BarcodeArAnnotationProviderEvents;
(function (BarcodeArAnnotationProviderEvents) {
    BarcodeArAnnotationProviderEvents["annotationForBarcode"] = "BarcodeArAnnotationProvider.annotationForBarcode";
    BarcodeArAnnotationProviderEvents["didTapInfoAnnotationRightIconEvent"] = "BarcodeArInfoAnnotationListener.didTapInfoAnnotationRightIcon";
    BarcodeArAnnotationProviderEvents["didTapInfoAnnotationLeftIconEvent"] = "BarcodeArInfoAnnotationListener.didTapInfoAnnotationLeftIcon";
    BarcodeArAnnotationProviderEvents["didTapInfoAnnotationEvent"] = "BarcodeArInfoAnnotationListener.didTapInfoAnnotation";
    BarcodeArAnnotationProviderEvents["didTapInfoAnnotationHeaderEvent"] = "BarcodeArInfoAnnotationListener.didTapInfoAnnotationHeader";
    BarcodeArAnnotationProviderEvents["didTapInfoAnnotationFooterEvent"] = "BarcodeArInfoAnnotationListener.didTapInfoAnnotationFooter";
    BarcodeArAnnotationProviderEvents["didTapPopoverEvent"] = "BarcodeArPopoverAnnotationListener.didTapPopover";
    BarcodeArAnnotationProviderEvents["didTapPopoverButtonEvent"] = "BarcodeArPopoverAnnotationListener.didTapPopoverButton";
})(BarcodeArAnnotationProviderEvents || (BarcodeArAnnotationProviderEvents = {}));
var BarcodeArEvents;
(function (BarcodeArEvents) {
    // Listener Events
    BarcodeArEvents["didUpdateSession"] = "BarcodeArListener.didUpdateSession";
})(BarcodeArEvents || (BarcodeArEvents = {}));
class BarcodeArViewController extends BaseNewController {
    constructor(baseView, barcodeAr) {
        super('BarcodeArViewProxy');
        // Bound event handlers - using nullable function references instead of boolean flags
        this.boundHandleDidUpdateSession = null;
        this.boundHandleDidTapHighlightForBarcode = null;
        this.boundHandleAnnotationForBarcode = null;
        this.boundHandleDidTapPopoverEvent = null;
        this.boundHandleDidTapPopoverButtonEvent = null;
        this.boundHandleDidTapInfoAnnotationRightIconEvent = null;
        this.boundHandleDidTapInfoAnnotationLeftIconEvent = null;
        this.boundHandleDidTapInfoAnnotationEvent = null;
        this.boundHandleDidTapInfoAnnotationHeaderEvent = null;
        this.boundHandleDidTapInfoAnnotationFooterEvent = null;
        this.boundHandleHighlightForBarcode = null;
        this.baseView = baseView;
        this.barcodeAr = barcodeAr;
        this.eventHandlers = new BarcodeArViewEventHandlers(baseView, barcodeAr, this._proxy);
    }
    dispose() {
        this.eventHandlers.clearCaches();
        this._proxy.$removeBarcodeArView({ viewId: this.baseView.viewId });
        this._proxy.dispose();
    }
    static forBarcodeArView(barcodeAr, baseView) {
        const viewController = new BarcodeArViewController(baseView, barcodeAr);
        viewController.barcodeAr.controller = viewController;
        return viewController;
    }
    initialize() {
        // check if listeners are there to subscribe
        if (this.barcodeAr.listeners.length > 0) {
            this.registerModeListener();
        }
        if (this.baseView.barcodeArViewUiListener) {
            this.registerUiListener();
        }
        if (this.baseView.annotationProvider) {
            this.registerAnnotationProvider();
        }
        if (this.baseView.highlightProvider) {
            this.registerHighlightProvider();
        }
    }
    createView() {
        return __awaiter(this, void 0, void 0, function* () {
            const barcodeArView = this.baseView.toJSON();
            const viewJson = JSON.stringify(barcodeArView);
            return this._proxy.$createBarcodeArView({ viewId: this.baseView.viewId, viewJson });
        });
    }
    createNativeView() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.createView();
            this.initialize();
        });
    }
    registerModeListener() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isViewCreated) {
                return Promise.resolve();
            }
            if (this.boundHandleDidUpdateSession) {
                return Promise.resolve();
            }
            this.boundHandleDidUpdateSession = this.eventHandlers.handleDidUpdateSession.bind(this);
            this._proxy.subscribeForEvents(Object.values(BarcodeArEvents));
            this._proxy.eventEmitter.on(BarcodeArEvents.didUpdateSession, this.boundHandleDidUpdateSession);
            yield this._proxy.$registerBarcodeArListener({ viewId: this.baseView.viewId });
        });
    }
    unregisterModeListener() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isViewCreated) {
                return Promise.resolve();
            }
            if (!this.boundHandleDidUpdateSession) {
                return Promise.resolve();
            }
            this._proxy.unsubscribeFromEvents(Object.values(BarcodeArEvents));
            this._proxy.eventEmitter.off(BarcodeArEvents.didUpdateSession, this.boundHandleDidUpdateSession);
            yield this._proxy.$unregisterBarcodeArListener({ viewId: this.baseView.viewId });
            this.boundHandleDidUpdateSession = null;
        });
    }
    registerUiListener() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isViewCreated) {
                return Promise.resolve();
            }
            if (this.boundHandleDidTapHighlightForBarcode) {
                return Promise.resolve();
            }
            this.boundHandleDidTapHighlightForBarcode = this.eventHandlers.handleDidTapHighlightForBarcode.bind(this);
            this._proxy.subscribeForEvents(Object.values(BarcodeArViewEvents));
            this._proxy.eventEmitter.on(BarcodeArViewEvents.didTapHighlightForBarcode, this.boundHandleDidTapHighlightForBarcode);
            this._proxy.$registerBarcodeArViewUiListener({ viewId: this.baseView.viewId });
        });
    }
    unregisterUiListener() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isViewCreated) {
                return Promise.resolve();
            }
            if (!this.boundHandleDidTapHighlightForBarcode) {
                return Promise.resolve();
            }
            this._proxy.unsubscribeFromEvents(Object.values(BarcodeArViewEvents));
            this._proxy.eventEmitter.off(BarcodeArViewEvents.didTapHighlightForBarcode, this.boundHandleDidTapHighlightForBarcode);
            this._proxy.$unregisterBarcodeArViewUiListener({ viewId: this.baseView.viewId });
            this.boundHandleDidTapHighlightForBarcode = null;
        });
    }
    registerAnnotationProvider() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isViewCreated) {
                return Promise.resolve();
            }
            if (this.boundHandleAnnotationForBarcode) {
                return Promise.resolve();
            }
            // Create all bound functions
            this.boundHandleAnnotationForBarcode = this.eventHandlers.handleAnnotationForBarcode.bind(this);
            this.boundHandleDidTapPopoverEvent = this.eventHandlers.handleDidTapPopoverEvent.bind(this);
            this.boundHandleDidTapPopoverButtonEvent = this.eventHandlers.handleDidTapPopoverButtonEvent.bind(this);
            this.boundHandleDidTapInfoAnnotationRightIconEvent =
                this.eventHandlers.handleDidTapInfoAnnotationRightIconEvent.bind(this);
            this.boundHandleDidTapInfoAnnotationLeftIconEvent =
                this.eventHandlers.handleDidTapInfoAnnotationLeftIconEvent.bind(this);
            this.boundHandleDidTapInfoAnnotationEvent = this.eventHandlers.handleDidTapInfoAnnotationEvent.bind(this);
            this.boundHandleDidTapInfoAnnotationHeaderEvent =
                this.eventHandlers.handleDidTapInfoAnnotationHeaderEvent.bind(this);
            this.boundHandleDidTapInfoAnnotationFooterEvent =
                this.eventHandlers.handleDidTapInfoAnnotationFooterEvent.bind(this);
            this._proxy.subscribeForEvents(Object.values(BarcodeArAnnotationProviderEvents));
            this._proxy.eventEmitter.on(BarcodeArAnnotationProviderEvents.annotationForBarcode, this.boundHandleAnnotationForBarcode);
            this._proxy.eventEmitter.on(BarcodeArAnnotationProviderEvents.didTapPopoverEvent, this.boundHandleDidTapPopoverEvent);
            this._proxy.eventEmitter.on(BarcodeArAnnotationProviderEvents.didTapPopoverButtonEvent, this.boundHandleDidTapPopoverButtonEvent);
            this._proxy.eventEmitter.on(BarcodeArAnnotationProviderEvents.didTapInfoAnnotationRightIconEvent, this.boundHandleDidTapInfoAnnotationRightIconEvent);
            this._proxy.eventEmitter.on(BarcodeArAnnotationProviderEvents.didTapInfoAnnotationLeftIconEvent, this.boundHandleDidTapInfoAnnotationLeftIconEvent);
            this._proxy.eventEmitter.on(BarcodeArAnnotationProviderEvents.didTapInfoAnnotationEvent, this.boundHandleDidTapInfoAnnotationEvent);
            this._proxy.eventEmitter.on(BarcodeArAnnotationProviderEvents.didTapInfoAnnotationHeaderEvent, this.boundHandleDidTapInfoAnnotationHeaderEvent);
            this._proxy.eventEmitter.on(BarcodeArAnnotationProviderEvents.didTapInfoAnnotationFooterEvent, this.boundHandleDidTapInfoAnnotationFooterEvent);
            this._proxy.$registerBarcodeArAnnotationProvider({ viewId: this.baseView.viewId });
        });
    }
    unregisterAnnotationProvider() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isViewCreated) {
                return Promise.resolve();
            }
            if (!this.boundHandleAnnotationForBarcode) {
                return Promise.resolve();
            }
            this._proxy.unsubscribeFromEvents(Object.values(BarcodeArAnnotationProviderEvents));
            // Remove all bound functions with null checks
            if (this.boundHandleAnnotationForBarcode) {
                this._proxy.eventEmitter.off(BarcodeArAnnotationProviderEvents.annotationForBarcode, this.boundHandleAnnotationForBarcode);
            }
            if (this.boundHandleDidTapPopoverEvent) {
                this._proxy.eventEmitter.off(BarcodeArAnnotationProviderEvents.didTapPopoverEvent, this.boundHandleDidTapPopoverEvent);
            }
            if (this.boundHandleDidTapPopoverButtonEvent) {
                this._proxy.eventEmitter.off(BarcodeArAnnotationProviderEvents.didTapPopoverButtonEvent, this.boundHandleDidTapPopoverButtonEvent);
            }
            if (this.boundHandleDidTapInfoAnnotationRightIconEvent) {
                this._proxy.eventEmitter.off(BarcodeArAnnotationProviderEvents.didTapInfoAnnotationRightIconEvent, this.boundHandleDidTapInfoAnnotationRightIconEvent);
            }
            if (this.boundHandleDidTapInfoAnnotationLeftIconEvent) {
                this._proxy.eventEmitter.off(BarcodeArAnnotationProviderEvents.didTapInfoAnnotationLeftIconEvent, this.boundHandleDidTapInfoAnnotationLeftIconEvent);
            }
            if (this.boundHandleDidTapInfoAnnotationEvent) {
                this._proxy.eventEmitter.off(BarcodeArAnnotationProviderEvents.didTapInfoAnnotationEvent, this.boundHandleDidTapInfoAnnotationEvent);
            }
            if (this.boundHandleDidTapInfoAnnotationHeaderEvent) {
                this._proxy.eventEmitter.off(BarcodeArAnnotationProviderEvents.didTapInfoAnnotationHeaderEvent, this.boundHandleDidTapInfoAnnotationHeaderEvent);
            }
            if (this.boundHandleDidTapInfoAnnotationFooterEvent) {
                this._proxy.eventEmitter.off(BarcodeArAnnotationProviderEvents.didTapInfoAnnotationFooterEvent, this.boundHandleDidTapInfoAnnotationFooterEvent);
            }
            this._proxy.$unregisterBarcodeArAnnotationProvider({ viewId: this.baseView.viewId });
            // Clear all bound functions
            this.boundHandleAnnotationForBarcode = null;
            this.boundHandleDidTapPopoverEvent = null;
            this.boundHandleDidTapPopoverButtonEvent = null;
            this.boundHandleDidTapInfoAnnotationRightIconEvent = null;
            this.boundHandleDidTapInfoAnnotationLeftIconEvent = null;
            this.boundHandleDidTapInfoAnnotationEvent = null;
            this.boundHandleDidTapInfoAnnotationHeaderEvent = null;
            this.boundHandleDidTapInfoAnnotationFooterEvent = null;
        });
    }
    registerHighlightProvider() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isViewCreated) {
                return Promise.resolve();
            }
            if (this.boundHandleHighlightForBarcode) {
                return Promise.resolve();
            }
            this.boundHandleHighlightForBarcode = this.eventHandlers.handleHighlightForBarcode.bind(this);
            this._proxy.subscribeForEvents(Object.values(BarcodeArHighlightProviderEvents));
            this._proxy.eventEmitter.on(BarcodeArHighlightProviderEvents.highlightForBarcode, this.boundHandleHighlightForBarcode);
            this._proxy.$registerBarcodeArHighlightProvider({ viewId: this.baseView.viewId });
        });
    }
    registerCustomHighlightCreateEvent(onCreate) {
        function onCreateWrapper(data) {
            const parsedData = JSON.parse(data.data);
            const barcode = Barcode['fromJSON'](JSON.parse(parsedData.barcode));
            const barcodeId = parsedData.barcodeId;
            onCreate(barcode, barcodeId);
        }
        this._proxy.eventEmitter.on(BarcodeArHighlightLifecycleEvents.create, onCreateWrapper);
        return () => {
            this._proxy.eventEmitter.off(BarcodeArHighlightLifecycleEvents.create, onCreateWrapper);
        };
    }
    registerCustomHighlightUpdateEvent(onUpdate, barcodeId) {
        function onUpdateWrapper(data) {
            const parsedData = JSON.parse(data.data);
            parsedData.updates.forEach((update) => {
                const receivedBarcodeId = update.barcodeId;
                if (barcodeId !== receivedBarcodeId) {
                    return;
                }
                const centerPosition = Point['fromJSON'](JSON.parse(update.centerPosition));
                onUpdate(centerPosition, receivedBarcodeId);
            });
        }
        this._proxy.eventEmitter.on(BarcodeArHighlightLifecycleEvents.update, onUpdateWrapper);
        return () => {
            this._proxy.eventEmitter.off(BarcodeArHighlightLifecycleEvents.update, onUpdateWrapper);
        };
    }
    registerCustomHighlightHideEvent(onHide, barcodeId) {
        function onHideWrapper(data) {
            const parsedData = JSON.parse(data.data);
            const receivedBarcodeId = parsedData.barcodeId;
            if (barcodeId !== receivedBarcodeId) {
                return;
            }
            onHide(receivedBarcodeId);
        }
        this._proxy.eventEmitter.on(BarcodeArHighlightLifecycleEvents.hide, onHideWrapper);
        return () => {
            this._proxy.eventEmitter.off(BarcodeArHighlightLifecycleEvents.show, onHideWrapper);
        };
    }
    registerCustomHighlightShowEvent(onShow, barcodeId) {
        function onShowWrapper(data) {
            const parsedData = JSON.parse(data.data);
            const receivedBarcodeId = parsedData.barcodeId;
            if (barcodeId !== receivedBarcodeId) {
                return;
            }
            onShow(receivedBarcodeId);
        }
        this._proxy.eventEmitter.on(BarcodeArHighlightLifecycleEvents.show, onShowWrapper);
        return () => {
            this._proxy.eventEmitter.off(BarcodeArHighlightLifecycleEvents.show, onShowWrapper);
        };
    }
    registerCustomHighlightDisposeEvent(onDispose) {
        function onDisposeWrapper(data) {
            const parsedData = JSON.parse(data.data);
            const barcodeId = parsedData.barcodeId;
            onDispose(barcodeId);
        }
        this._proxy.eventEmitter.on(BarcodeArHighlightLifecycleEvents.dispose, onDisposeWrapper);
        return () => {
            this._proxy.eventEmitter.off(BarcodeArHighlightLifecycleEvents.dispose, onDisposeWrapper);
        };
    }
    subscribeForCustomHighlightEvents() {
        this._proxy.subscribeForEvents(Object.values(BarcodeArHighlightLifecycleEvents));
    }
    unsubscribeFromCustomHighlightEvents() {
        this._proxy.unsubscribeFromEvents(Object.values(BarcodeArHighlightLifecycleEvents));
    }
    unregisterHighlightProvider() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isViewCreated) {
                return Promise.resolve();
            }
            if (!this.boundHandleHighlightForBarcode) {
                return Promise.resolve();
            }
            this._proxy.unsubscribeFromEvents(Object.values(BarcodeArHighlightProviderEvents));
            this._proxy.eventEmitter.off(BarcodeArHighlightProviderEvents.highlightForBarcode, this.boundHandleHighlightForBarcode);
            this._proxy.$unregisterBarcodeArHighlightProvider({ viewId: this.baseView.viewId });
            this.boundHandleHighlightForBarcode = null;
        });
    }
    start() {
        this.eventHandlers.clearCaches();
        return this._proxy.$barcodeArViewStart({ viewId: this.baseView.viewId });
    }
    stop() {
        this.eventHandlers.clearCaches();
        return this._proxy.$barcodeArViewStop({ viewId: this.baseView.viewId });
    }
    pause() {
        this.eventHandlers.clearCaches();
        return this._proxy.$barcodeArViewPause({ viewId: this.baseView.viewId });
    }
    update() {
        const barcodeArView = this.baseView.toJSON().View;
        const json = JSON.stringify(barcodeArView);
        return this._proxy.$updateBarcodeArView({ viewId: this.baseView.viewId, viewJson: json });
    }
    removeNativeView() {
        var _a;
        return (_a = this._proxy.$removeBarcodeArView({ viewId: this.baseView.viewId })) !== null && _a !== void 0 ? _a : Promise.resolve();
    }
    reset() {
        this.eventHandlers.clearCaches();
        return this._proxy.$barcodeArViewReset({ viewId: this.baseView.viewId });
    }
    // From Listener Controller methods
    updateMode() {
        if (!this.isViewCreated) {
            return Promise.resolve();
        }
        const barcodeAr = this.barcodeAr.toJSON();
        const json = JSON.stringify(barcodeAr);
        return this._proxy.$updateBarcodeArMode({ viewId: this.baseView.viewId, modeJson: json });
    }
    applyNewSettings(settings) {
        if (!this.isViewCreated) {
            return Promise.resolve();
        }
        return this._proxy.$applyBarcodeArSettings({
            viewId: this.baseView.viewId,
            settings: JSON.stringify(settings.toJSON()),
        });
    }
    resetMode() {
        if (!this.isViewCreated) {
            return Promise.resolve();
        }
        return this._proxy.$resetBarcodeAr({ viewId: this.baseView.viewId });
    }
    updateFeedback(feedbackJson) {
        if (!this.isViewCreated) {
            return;
        }
        this._proxy.$updateBarcodeArFeedback({ viewId: this.baseView.viewId, feedbackJson });
    }
    get isViewCreated() {
        return this.baseView.viewId !== -1;
    }
}

class BaseBarcodeArView extends DefaultSerializeable {
    static get barcodeArDefaults() {
        return getBarcodeArDefaults();
    }
    constructor(context, barcodeAr, nativeView = null, barcodeArViewSettings, cameraSettings, annotationProvider, highlightProvider, uiListener) {
        super();
        this._annotationProvider = null;
        this._barcodeArViewUiListener = null;
        this._highlightProvider = null;
        this.nativeView = null;
        this._isStarted = false;
        this._shouldShowMacroControl = false;
        this._macroModeControlPosition = BaseBarcodeArView.barcodeArDefaults.BarcodeArView.defaultCameraSwitchControlPosition;
        this._shouldShowTorchControl = false;
        this._torchControlPosition = BaseBarcodeArView.barcodeArDefaults.BarcodeArView.defaultTorchControlPosition;
        this._shouldShowZoomControl = BaseBarcodeArView.barcodeArDefaults.BarcodeArView.defaultShouldShowZoomControl;
        this._zoomControlPosition = BaseBarcodeArView.barcodeArDefaults.BarcodeArView.defaultZoomControlPosition;
        this.isViewCreated = false;
        this._viewId = -1; // -1 means the view is not created yet
        this.registerCustomHighlightCreateEvent = (...args) => this.controller.registerCustomHighlightCreateEvent(...args);
        this.registerCustomHighlightUpdateEvent = (...args) => this.controller.registerCustomHighlightUpdateEvent(...args);
        this.registerCustomHighlightHideEvent = (...args) => this.controller.registerCustomHighlightHideEvent(...args);
        this.registerCustomHighlightShowEvent = (...args) => this.controller.registerCustomHighlightShowEvent(...args);
        this.registerCustomHighlightDisposeEvent = (...args) => this.controller.registerCustomHighlightDisposeEvent(...args);
        this.subscribeForCustomHighlightEvents = (...args) => this.controller.subscribeForCustomHighlightEvents(...args);
        this.unsubscribeFromCustomHighlightEvents = (...args) => this.controller.unsubscribeFromCustomHighlightEvents(...args);
        this._dataCaptureContext = context;
        this._barcodeAr = barcodeAr;
        this._barcodeArViewSettings = barcodeArViewSettings;
        this._cameraSettings = cameraSettings;
        this._annotationProvider = annotationProvider !== null && annotationProvider !== void 0 ? annotationProvider : null;
        this._highlightProvider = highlightProvider !== null && highlightProvider !== void 0 ? highlightProvider : null;
        this._barcodeArViewUiListener = uiListener !== null && uiListener !== void 0 ? uiListener : null;
        this.nativeView = nativeView;
        this.controller = BarcodeArViewController.forBarcodeArView(this._barcodeAr, this);
        this._barcodeAr.controller = this.controller;
    }
    dispose() {
        this.controller.dispose();
        this.isViewCreated = false;
        this._barcodeAr.unsubscribeNativeListeners();
    }
    createNativeView(viewId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isViewCreated) {
                return Promise.resolve();
            }
            this._viewId = viewId;
            yield this.controller.createNativeView();
            this.isViewCreated = true;
        });
    }
    removeNativeView() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.controller.removeNativeView();
            this.isViewCreated = false;
        });
    }
    updateNative() {
        return this.controller.update();
    }
    get viewId() {
        return this._viewId;
    }
    get barcodeArViewUiListener() {
        return this._barcodeArViewUiListener;
    }
    set barcodeArViewUiListener(value) {
        this._barcodeArViewUiListener = value;
        if (value) {
            this.controller.registerUiListener();
        }
        else {
            this.controller.unregisterUiListener();
        }
    }
    get annotationProvider() {
        return this._annotationProvider;
    }
    set annotationProvider(value) {
        this._annotationProvider = value;
        if (value != null) {
            this.controller.registerAnnotationProvider();
        }
        else {
            this.controller.unregisterAnnotationProvider();
        }
    }
    get highlightProvider() {
        return this._highlightProvider;
    }
    set highlightProvider(value) {
        this._highlightProvider = value;
        if (value != null) {
            this.controller.registerHighlightProvider();
        }
        else {
            this.controller.unregisterHighlightProvider();
        }
    }
    get context() {
        return this._dataCaptureContext;
    }
    start() {
        this._isStarted = true;
        return this.controller.start();
    }
    stop() {
        this._isStarted = false;
        return this.controller.stop();
    }
    pause() {
        // TODO: check if we need to change isStarted
        return this.controller.pause();
    }
    reset() {
        return this.controller.reset();
    }
    get shouldShowTorchControl() {
        return this._shouldShowTorchControl;
    }
    set shouldShowTorchControl(value) {
        this._shouldShowTorchControl = value;
        this.updateNative();
    }
    get torchControlPosition() {
        return this._torchControlPosition;
    }
    set torchControlPosition(value) {
        this._torchControlPosition = value;
        this.updateNative();
    }
    get shouldShowZoomControl() {
        return this._shouldShowZoomControl;
    }
    set shouldShowZoomControl(value) {
        this._shouldShowZoomControl = value;
        this.updateNative();
    }
    get zoomControlPosition() {
        return this._zoomControlPosition;
    }
    set zoomControlPosition(value) {
        this._zoomControlPosition = value;
        this.updateNative();
    }
    get shouldShowCameraSwitchControl() {
        return this._shouldShowMacroControl;
    }
    set shouldShowCameraSwitchControl(value) {
        this._shouldShowMacroControl = value;
        this.updateNative();
    }
    get cameraSwitchControlPosition() {
        return this._macroModeControlPosition;
    }
    set cameraSwitchControlPosition(value) {
        this._macroModeControlPosition = value;
        this.updateNative();
    }
    get shouldShowMacroModeControl() {
        return this._shouldShowMacroControl;
    }
    set shouldShowMacroModeControl(value) {
        this._shouldShowMacroControl = value;
        this.updateNative();
    }
    get macroModeControlPosition() {
        return this._macroModeControlPosition;
    }
    set macroModeControlPosition(value) {
        this._macroModeControlPosition = value;
        this.updateNative();
    }
    toJSON() {
        const json = {
            View: {
                viewId: this._viewId,
                barcodeArViewSettings: this._barcodeArViewSettings,
                cameraSettings: this._cameraSettings,
                shouldShowMacroControl: this._shouldShowMacroControl,
                macroModeControlPosition: this._macroModeControlPosition,
                shouldShowTorchControl: this._shouldShowTorchControl,
                torchControlPosition: this._torchControlPosition,
                shouldShowZoomControl: this._shouldShowZoomControl,
                zoomControlPosition: this._zoomControlPosition,
                annotationProvider: this._annotationProvider,
                barcodeArViewUiListener: this._barcodeArViewUiListener,
                highlightProvider: this._highlightProvider,
                isStarted: this._isStarted,
                hasUiListener: this._barcodeArViewUiListener != null,
                hasHighlightProvider: this._highlightProvider != null,
                hasAnnotationProvider: this._annotationProvider != null,
            },
            BarcodeAr: this._barcodeAr.toJSON(),
        };
        return json;
    }
}
__decorate([
    ignoreFromSerialization
], BaseBarcodeArView.prototype, "_annotationProvider", void 0);
__decorate([
    ignoreFromSerialization
], BaseBarcodeArView.prototype, "_barcodeArViewUiListener", void 0);
__decorate([
    ignoreFromSerialization
], BaseBarcodeArView.prototype, "_highlightProvider", void 0);
__decorate([
    ignoreFromSerialization
], BaseBarcodeArView.prototype, "nativeView", void 0);
__decorate([
    nameForSerialization('barcodeAr')
], BaseBarcodeArView.prototype, "_barcodeAr", void 0);
__decorate([
    nameForSerialization('isStarted')
], BaseBarcodeArView.prototype, "_isStarted", void 0);
__decorate([
    nameForSerialization('viewSettings')
], BaseBarcodeArView.prototype, "_barcodeArViewSettings", void 0);
__decorate([
    nameForSerialization('cameraSettings')
], BaseBarcodeArView.prototype, "_cameraSettings", void 0);
__decorate([
    nameForSerialization('dataCaptureContext')
], BaseBarcodeArView.prototype, "_dataCaptureContext", void 0);
__decorate([
    nameForSerialization('shouldShowMacroControl')
], BaseBarcodeArView.prototype, "_shouldShowMacroControl", void 0);
__decorate([
    nameForSerialization('macroModeControlPosition')
], BaseBarcodeArView.prototype, "_macroModeControlPosition", void 0);
__decorate([
    nameForSerialization('shouldShowTorchControl')
], BaseBarcodeArView.prototype, "_shouldShowTorchControl", void 0);
__decorate([
    nameForSerialization('torchControlPosition')
], BaseBarcodeArView.prototype, "_torchControlPosition", void 0);
__decorate([
    nameForSerialization('shouldShowZoomControl')
], BaseBarcodeArView.prototype, "_shouldShowZoomControl", void 0);
__decorate([
    nameForSerialization('zoomControlPosition')
], BaseBarcodeArView.prototype, "_zoomControlPosition", void 0);
__decorate([
    ignoreFromSerialization
], BaseBarcodeArView.prototype, "isViewCreated", void 0);
__decorate([
    ignoreFromSerialization
], BaseBarcodeArView, "barcodeArDefaults", null);

class BarcodeArViewSettings extends DefaultSerializeable {
    static get barcodeArDefaults() {
        return getBarcodeArDefaults();
    }
    constructor() {
        super();
        this._soundEnabled = BarcodeArViewSettings
            .barcodeArDefaults.BarcodeArView.defaultSoundEnabled;
        this._hapticEnabled = BarcodeArViewSettings
            .barcodeArDefaults.BarcodeArView.defaultHapticsEnabled;
        this._defaultCameraPosition = BarcodeArViewSettings
            .barcodeArDefaults.BarcodeArView.defaultCameraPosition;
    }
    get soundEnabled() {
        return this._soundEnabled;
    }
    set soundEnabled(value) {
        this._soundEnabled = value;
    }
    get hapticEnabled() {
        return this._hapticEnabled;
    }
    set hapticEnabled(value) {
        this._hapticEnabled = value;
    }
    get defaultCameraPosition() {
        return this._defaultCameraPosition;
    }
    set defaultCameraPosition(value) {
        this._defaultCameraPosition = value;
    }
}
__decorate([
    nameForSerialization("soundEnabled")
], BarcodeArViewSettings.prototype, "_soundEnabled", void 0);
__decorate([
    nameForSerialization("hapticEnabled")
], BarcodeArViewSettings.prototype, "_hapticEnabled", void 0);
__decorate([
    nameForSerialization("defaultCameraPosition")
], BarcodeArViewSettings.prototype, "_defaultCameraPosition", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeArViewSettings, "barcodeArDefaults", null);

var BarcodeArAnnotationTrigger;
(function (BarcodeArAnnotationTrigger) {
    BarcodeArAnnotationTrigger["HighlightTap"] = "highlightTap";
    BarcodeArAnnotationTrigger["HighlightTapAndBarcodeScan"] = "highlightTapAndBarcodeScan";
})(BarcodeArAnnotationTrigger || (BarcodeArAnnotationTrigger = {}));

var BarcodeArCircleHighlightPreset;
(function (BarcodeArCircleHighlightPreset) {
    BarcodeArCircleHighlightPreset["Dot"] = "dot";
    BarcodeArCircleHighlightPreset["Icon"] = "icon";
})(BarcodeArCircleHighlightPreset || (BarcodeArCircleHighlightPreset = {}));

var BarcodeArInfoAnnotationAnchor;
(function (BarcodeArInfoAnnotationAnchor) {
    BarcodeArInfoAnnotationAnchor["Top"] = "top";
    BarcodeArInfoAnnotationAnchor["Bottom"] = "bottom";
    BarcodeArInfoAnnotationAnchor["Left"] = "left";
    BarcodeArInfoAnnotationAnchor["Right"] = "right";
})(BarcodeArInfoAnnotationAnchor || (BarcodeArInfoAnnotationAnchor = {}));

var BarcodeArInfoAnnotationWidthPreset;
(function (BarcodeArInfoAnnotationWidthPreset) {
    BarcodeArInfoAnnotationWidthPreset["Small"] = "small";
    BarcodeArInfoAnnotationWidthPreset["Medium"] = "medium";
    BarcodeArInfoAnnotationWidthPreset["Large"] = "large";
})(BarcodeArInfoAnnotationWidthPreset || (BarcodeArInfoAnnotationWidthPreset = {}));

class BarcodeSelectionFeedback extends DefaultSerializeable {
    constructor() {
        super(...arguments);
        this.controller = null;
        this._selection = BarcodeSelectionFeedback.barcodeSelectionDefaults.Feedback.selection;
    }
    get selection() {
        return this._selection;
    }
    set selection(selection) {
        this._selection = selection;
        this.updateFeedback();
    }
    static get barcodeSelectionDefaults() {
        return getBarcodeSelectionDefaults();
    }
    static get default() {
        return new BarcodeSelectionFeedback();
    }
    updateFeedback() {
        var _a;
        (_a = this.controller) === null || _a === void 0 ? void 0 : _a.updateFeedback(JSON.stringify(this.toJSON()));
    }
}
__decorate([
    ignoreFromSerialization
], BarcodeSelectionFeedback.prototype, "controller", void 0);
__decorate([
    nameForSerialization('selection')
], BarcodeSelectionFeedback.prototype, "_selection", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeSelectionFeedback, "barcodeSelectionDefaults", null);

class BarcodeSelectionSession {
    get selectedBarcodes() {
        return this._selectedBarcodes;
    }
    get newlySelectedBarcodes() {
        return this._newlySelectedBarcodes;
    }
    get newlyUnselectedBarcodes() {
        return this._newlyUnselectedBarcodes;
    }
    get frameSequenceID() {
        return this._frameSequenceID;
    }
    static fromJSON(json) {
        var _a;
        const sessionJson = JSON.parse(json.session);
        const session = new BarcodeSelectionSession();
        session._selectedBarcodes = sessionJson.selectedBarcodes
            .map(Barcode.fromJSON);
        session._newlySelectedBarcodes = sessionJson.newlySelectedBarcodes
            .map(Barcode.fromJSON);
        session._newlyUnselectedBarcodes = sessionJson.newlyUnselectedBarcodes
            .map(Barcode.fromJSON);
        session._frameSequenceID = sessionJson.frameSequenceId;
        session.frameId = (_a = json.frameId) !== null && _a !== void 0 ? _a : '';
        return session;
    }
    getCount(barcode) {
        return this.listenerController.getCount(barcode);
    }
    reset() {
        return this.listenerController.reset();
    }
}

var BarcodeSelectionListenerEvents;
(function (BarcodeSelectionListenerEvents) {
    BarcodeSelectionListenerEvents["didUpdateSelection"] = "BarcodeSelectionListener.didUpdateSelection";
    BarcodeSelectionListenerEvents["didUpdateSession"] = "BarcodeSelectionListener.didUpdateSession";
})(BarcodeSelectionListenerEvents || (BarcodeSelectionListenerEvents = {}));
class BarcodeSelectionListenerController extends BaseNewController {
    constructor(barcodeSelection) {
        super('BarcodeSelectionListenerProxy');
        this.hasListeners = false;
        this.boundHandleDidUpdateSelection = null;
        this.boundHandleDidUpdateSession = null;
        this.barcodeSelection = barcodeSelection;
        this.initialize();
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.barcodeSelection.listeners.length > 0) {
                this.subscribeListener();
            }
        });
    }
    getCount(barcode) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this._proxy.$getCountForBarcodeInBarcodeSelectionSession({ modeId: this.modeId, selectionIdentifier: barcode.selectionIdentifier });
            if (result == null) {
                return 0;
            }
            return Number(result.data);
        });
    }
    reset() {
        return this._proxy.$resetBarcodeSelectionSession({ modeId: this.modeId });
    }
    subscribeListener() {
        if (this.hasListeners) {
            return;
        }
        this.boundHandleDidUpdateSelection = this.handleDidUpdateSelection.bind(this);
        this.boundHandleDidUpdateSession = this.handleDidUpdateSession.bind(this);
        this._proxy.subscribeForEvents(Object.values(BarcodeSelectionListenerEvents));
        this._proxy.eventEmitter.on(BarcodeSelectionListenerEvents.didUpdateSelection, this.boundHandleDidUpdateSelection);
        this._proxy.eventEmitter.on(BarcodeSelectionListenerEvents.didUpdateSession, this.boundHandleDidUpdateSession);
        this._proxy.$registerBarcodeSelectionListenerForEvents({ modeId: this.modeId });
        this.hasListeners = true;
    }
    handleDidUpdateSession(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                console.error('BarcodeSelectionListenerController didUpdateSession payload is null');
                return;
            }
            if (payload.modeId !== this.modeId) {
                return;
            }
            const session = BarcodeSelectionSession.fromJSON(payload);
            session.listenerController = this;
            yield this.notifyListenersOfDidUpdateSession(session);
            this._proxy.$finishBarcodeSelectionDidUpdateSession({ modeId: this.modeId, enabled: this.barcodeSelection.isEnabled });
        });
    }
    handleDidUpdateSelection(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                console.error('BarcodeSelectionListenerController didUpdateSelection payload is null');
                return;
            }
            if (payload.modeId !== this.modeId) {
                return;
            }
            const session = BarcodeSelectionSession.fromJSON(payload);
            session.listenerController = this;
            yield this.notifyListenersOfDidUpdateSelection(session);
            this._proxy.$finishBarcodeSelectionDidSelect({ modeId: this.modeId, enabled: this.barcodeSelection.isEnabled });
        });
    }
    unsubscribeListener() {
        if (!this.hasListeners) {
            return;
        }
        this._proxy.$unregisterBarcodeSelectionListenerForEvents({ modeId: this.modeId });
        this._proxy.unsubscribeFromEvents(Object.values(BarcodeSelectionListenerEvents));
        if (this.boundHandleDidUpdateSelection) {
            this._proxy.eventEmitter.off(BarcodeSelectionListenerEvents.didUpdateSelection, this.boundHandleDidUpdateSelection);
        }
        if (this.boundHandleDidUpdateSession) {
            this._proxy.eventEmitter.off(BarcodeSelectionListenerEvents.didUpdateSession, this.boundHandleDidUpdateSession);
        }
        this.boundHandleDidUpdateSelection = null;
        this.boundHandleDidUpdateSession = null;
        this.hasListeners = false;
    }
    dispose() {
        this.unsubscribeListener();
        this._proxy.dispose();
    }
    get modeId() {
        return this.barcodeSelection.modeId;
    }
    notifyListenersOfDidUpdateSelection(session) {
        return __awaiter(this, void 0, void 0, function* () {
            const mode = this.barcodeSelection;
            for (const listener of mode.listeners) {
                if (listener.didUpdateSelection) {
                    yield listener.didUpdateSelection(this.barcodeSelection, session, () => CameraController.getFrameOrNull(session.frameId));
                }
            }
        });
    }
    notifyListenersOfDidUpdateSession(session) {
        return __awaiter(this, void 0, void 0, function* () {
            const mode = this.barcodeSelection;
            for (const listener of mode.listeners) {
                if (listener.didUpdateSession) {
                    yield listener.didUpdateSession(this.barcodeSelection, session, () => CameraController.getFrameOrNull(session.frameId));
                }
            }
        });
    }
}

class BarcodeSelectionController extends BaseNewController {
    constructor(barcodeSelection) {
        super('BarcodeSelectionProxy');
        this.barcodeSelection = barcodeSelection;
    }
    unfreezeCamera() {
        return this._proxy.$unfreezeCameraInBarcodeSelection({ modeId: this.modeId });
    }
    reset() {
        return this._proxy.$resetBarcodeSelection({ modeId: this.modeId });
    }
    selectAimedBarcode() {
        return this._proxy.$selectAimedBarcode({ modeId: this.modeId });
    }
    unselectBarcodes(barcodes) {
        const barcodesJson = this.convertBarcodesToJson(barcodes);
        return this._proxy.$unselectBarcodes({ barcodesJson: JSON.stringify(barcodesJson), modeId: this.modeId });
    }
    setSelectBarcodeEnabled(barcode, enabled) {
        const barcodesJson = this.convertBarcodesToJson([barcode]);
        return this._proxy.$setSelectBarcodeEnabled({ barcodeJson: JSON.stringify(barcodesJson[0]), enabled: enabled, modeId: this.modeId });
    }
    increaseCountForBarcodes(barcodes) {
        const barcodesJson = this.convertBarcodesToJson(barcodes);
        return this._proxy.$increaseCountForBarcodes({ barcodeJson: JSON.stringify(barcodesJson), modeId: this.modeId });
    }
    setModeEnabledState(enabled) {
        this._proxy.$setBarcodeSelectionModeEnabledState({ modeId: this.modeId, enabled: enabled });
    }
    updateBarcodeSelectionMode(barcodeSelection) {
        return this._proxy.$updateBarcodeSelectionMode({ modeJson: JSON.stringify(barcodeSelection.toJSON()), modeId: this.modeId });
    }
    applyBarcodeSelectionModeSettings(newSettings) {
        return this._proxy.$applyBarcodeSelectionModeSettings({ modeSettingsJson: JSON.stringify(newSettings.toJSON()), modeId: this.modeId });
    }
    updateFeedback(feedbackJson) {
        this._proxy.$updateBarcodeSelectionFeedback({ feedbackJson: feedbackJson, modeId: this.modeId });
    }
    get modeId() {
        return this.barcodeSelection.modeId;
    }
    convertBarcodesToJson(barcodes) {
        return barcodes.flat().map((barcode) => ({
            data: barcode.data,
            rawData: barcode.rawData,
            symbology: barcode.symbology,
            symbolCount: barcode.symbolCount
        }));
    }
}

class BarcodeSelection extends DefaultSerializeable {
    get isEnabled() {
        return this._isEnabled;
    }
    set isEnabled(isEnabled) {
        this._isEnabled = isEnabled;
        this.modeController.setModeEnabledState(isEnabled);
    }
    get context() {
        return this._context;
    }
    get feedback() {
        return this._feedback;
    }
    set feedback(feedback) {
        this._feedback = feedback;
        this.feedback.controller = this.modeController;
        this.modeController.updateFeedback(JSON.stringify(this.feedback.toJSON()));
    }
    get pointOfInterest() {
        return this._pointOfInterest;
    }
    set pointOfInterest(pointOfInterest) {
        this._pointOfInterest = pointOfInterest;
        this.modeController.updateBarcodeSelectionMode(this);
    }
    static createRecommendedCameraSettings() {
        return new CameraSettings(BarcodeSelection.barcodeSelectionDefaults.RecommendedCameraSettings);
    }
    get _context() {
        return this.privateContext;
    }
    set _context(newContext) {
        var _a, _b;
        if (newContext == null) {
            (_a = this.listenerController) === null || _a === void 0 ? void 0 : _a.dispose();
            this.listenerController = null;
            this.privateContext = null;
            return;
        }
        this.privateContext = newContext;
        (_b = this.listenerController) !== null && _b !== void 0 ? _b : (this.listenerController = new BarcodeSelectionListenerController(this));
    }
    static get barcodeSelectionDefaults() {
        return getBarcodeSelectionDefaults();
    }
    constructor(settings) {
        super();
        this.type = 'barcodeSelection';
        this.modeId = Math.floor(Math.random() * 100000000);
        this.parentId = null;
        this._isEnabled = true;
        this._feedback = new BarcodeSelectionFeedback();
        this._pointOfInterest = null;
        this.privateContext = null;
        this.listeners = [];
        this.listenerController = null;
        this.settings = settings;
        this.modeController = new BarcodeSelectionController(this);
        this._feedback.controller = this.modeController;
    }
    applySettings(settings) {
        this.settings = settings;
        return this.modeController.applyBarcodeSelectionModeSettings(settings);
    }
    addListener(listener) {
        var _a;
        if (listener == undefined) {
            return;
        }
        if (this.listeners.includes(listener)) {
            return;
        }
        if (this.listeners.length === 0) {
            (_a = this.listenerController) === null || _a === void 0 ? void 0 : _a.subscribeListener();
        }
        this.listeners.push(listener);
    }
    removeListener(listener) {
        var _a;
        if (!this.listeners.includes(listener)) {
            return;
        }
        this.listeners.splice(this.listeners.indexOf(listener), 1);
        if (this.listeners.length === 0) {
            (_a = this.listenerController) === null || _a === void 0 ? void 0 : _a.unsubscribeListener();
        }
    }
    reset() {
        return this.modeController.reset();
    }
    unfreezeCamera() {
        return this.modeController.unfreezeCamera();
    }
    selectAimedBarcode() {
        return this.modeController.selectAimedBarcode();
    }
    unselectBarcodes(barcodes) {
        return this.modeController.unselectBarcodes(barcodes);
    }
    setSelectBarcodeEnabled(barcode, enabled) {
        return this.modeController.setSelectBarcodeEnabled(barcode, enabled);
    }
    increaseCountForBarcodes(barcodes) {
        return this.modeController.increaseCountForBarcodes(barcodes);
    }
}
__decorate([
    nameForSerialization('parentId'),
    ignoreFromSerializationIfNull
], BarcodeSelection.prototype, "parentId", void 0);
__decorate([
    nameForSerialization('enabled')
], BarcodeSelection.prototype, "_isEnabled", void 0);
__decorate([
    nameForSerialization('feedback')
], BarcodeSelection.prototype, "_feedback", void 0);
__decorate([
    nameForSerialization('pointOfInterest')
], BarcodeSelection.prototype, "_pointOfInterest", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeSelection.prototype, "privateContext", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeSelection.prototype, "listeners", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeSelection.prototype, "listenerController", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeSelection.prototype, "modeController", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeSelection, "barcodeSelectionDefaults", null);

var BarcodeSelectionBasicOverlayStyle;
(function (BarcodeSelectionBasicOverlayStyle) {
    BarcodeSelectionBasicOverlayStyle["Frame"] = "frame";
    BarcodeSelectionBasicOverlayStyle["Dot"] = "dot";
})(BarcodeSelectionBasicOverlayStyle || (BarcodeSelectionBasicOverlayStyle = {}));

var BarcodeSelectionFreezeBehavior;
(function (BarcodeSelectionFreezeBehavior) {
    BarcodeSelectionFreezeBehavior["Manual"] = "manual";
    BarcodeSelectionFreezeBehavior["ManualAndAutomatic"] = "manualAndAutomatic";
})(BarcodeSelectionFreezeBehavior || (BarcodeSelectionFreezeBehavior = {}));

var BarcodeSelectionStrategyType;
(function (BarcodeSelectionStrategyType) {
    BarcodeSelectionStrategyType["Auto"] = "autoSelectionStrategy";
    BarcodeSelectionStrategyType["Manual"] = "manualSelectionStrategy";
})(BarcodeSelectionStrategyType || (BarcodeSelectionStrategyType = {}));

var BarcodeSelectionTapBehavior;
(function (BarcodeSelectionTapBehavior) {
    BarcodeSelectionTapBehavior["ToggleSelection"] = "toggleSelection";
    BarcodeSelectionTapBehavior["RepeatSelection"] = "repeatSelection";
})(BarcodeSelectionTapBehavior || (BarcodeSelectionTapBehavior = {}));

var BarcodeSelectionTypeName;
(function (BarcodeSelectionTypeName) {
    BarcodeSelectionTypeName["Aimer"] = "aimerSelection";
    BarcodeSelectionTypeName["Tap"] = "tapSelection";
})(BarcodeSelectionTypeName || (BarcodeSelectionTypeName = {}));

var BarcodeSelectionBrushProviderEvents;
(function (BarcodeSelectionBrushProviderEvents) {
    BarcodeSelectionBrushProviderEvents["brushForAimedBarcode"] = "BarcodeSelectionAimedBrushProvider.brushForBarcode";
    BarcodeSelectionBrushProviderEvents["brushForTrackedBarcode"] = "BarcodeSelectionTrackedBrushProvider.brushForBarcode";
})(BarcodeSelectionBrushProviderEvents || (BarcodeSelectionBrushProviderEvents = {}));
class BarcodeSelectionOverlayController extends BaseNewController {
    constructor(overlay) {
        super('BarcodeSelectionOverlayProxy');
        this.boundHandleBrushForAimedBarcode = null;
        this.boundHandleBrushForTrackedBarcode = null;
        this.aimedBrushProvider = null;
        this.trackedBrushProvider = null;
        this.overlay = overlay;
        this.initialize();
    }
    initialize() {
        const aimedBrushProvider = this.overlay.aimedBrushProvider;
        const trackedBrushProvider = this.overlay.trackedBrushProvider;
        if (aimedBrushProvider) {
            this.setAimedBarcodeBrushProvider(aimedBrushProvider);
        }
        if (trackedBrushProvider) {
            this.setTrackedBarcodeBrushProvider(trackedBrushProvider);
        }
    }
    setTextForAimToSelectAutoHint(text) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._proxy.$setTextForAimToSelectAutoHint({ text });
        });
    }
    setAimedBarcodeBrushProvider(brushProvider) {
        return __awaiter(this, void 0, void 0, function* () {
            this.aimedBrushProvider = brushProvider;
            if (!brushProvider || this.boundHandleBrushForAimedBarcode !== null) {
                this._proxy.unsubscribeFromEvents([BarcodeSelectionBrushProviderEvents.brushForAimedBarcode]);
                if (this.boundHandleBrushForAimedBarcode) {
                    this._proxy.eventEmitter.off(BarcodeSelectionBrushProviderEvents.brushForAimedBarcode, this.boundHandleBrushForAimedBarcode);
                }
                this.boundHandleBrushForAimedBarcode = null;
                yield this._proxy.$removeAimedBarcodeBrushProvider();
            }
            if (brushProvider === null)
                return;
            this.boundHandleBrushForAimedBarcode = this.handleBrushForAimedBarcode.bind(this);
            this._proxy.subscribeForEvents([BarcodeSelectionBrushProviderEvents.brushForAimedBarcode]);
            this._proxy.eventEmitter.on(BarcodeSelectionBrushProviderEvents.brushForAimedBarcode, this.boundHandleBrushForAimedBarcode);
            yield this._proxy.$setAimedBarcodeBrushProvider();
        });
    }
    handleBrushForAimedBarcode(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                console.error('BarcodeSelectionOverlayController brushForAimedBarcode payload is null');
                return;
            }
            const barcode = Barcode
                .fromJSON(JSON.parse(payload.barcode));
            let brush = null;
            if ((_a = this.aimedBrushProvider) === null || _a === void 0 ? void 0 : _a.brushForBarcode) {
                brush = (_b = this.aimedBrushProvider) === null || _b === void 0 ? void 0 : _b.brushForBarcode(barcode);
            }
            yield this._proxy.$finishBrushForAimedBarcodeCallback({
                brushJson: brush ? JSON.stringify(brush.toJSON()) : null,
                selectionIdentifier: barcode.selectionIdentifier
            });
        });
    }
    setTrackedBarcodeBrushProvider(brushProvider) {
        return __awaiter(this, void 0, void 0, function* () {
            this.trackedBrushProvider = brushProvider;
            if (!brushProvider || this.boundHandleBrushForTrackedBarcode !== null) {
                this._proxy.unsubscribeFromEvents([BarcodeSelectionBrushProviderEvents.brushForTrackedBarcode]);
                if (this.boundHandleBrushForTrackedBarcode) {
                    this._proxy.eventEmitter.off(BarcodeSelectionBrushProviderEvents.brushForTrackedBarcode, this.boundHandleBrushForTrackedBarcode);
                }
                this.boundHandleBrushForTrackedBarcode = null;
                yield this._proxy.$removeTrackedBarcodeBrushProvider();
            }
            if (brushProvider === null)
                return;
            this.boundHandleBrushForTrackedBarcode = this.handleBrushForTrackedBarcode.bind(this);
            this._proxy.subscribeForEvents([BarcodeSelectionBrushProviderEvents.brushForTrackedBarcode]);
            this._proxy.eventEmitter.on(BarcodeSelectionBrushProviderEvents.brushForTrackedBarcode, this.boundHandleBrushForTrackedBarcode);
            yield this._proxy.$setTrackedBarcodeBrushProvider();
        });
    }
    handleBrushForTrackedBarcode(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                console.error('BarcodeSelectionBrushProvider brushForTrackedBarcode payload is null');
                return;
            }
            const barcode = Barcode
                .fromJSON(JSON.parse(payload.barcode));
            let brush = null;
            if ((_a = this.trackedBrushProvider) === null || _a === void 0 ? void 0 : _a.brushForBarcode) {
                brush = (_b = this.trackedBrushProvider) === null || _b === void 0 ? void 0 : _b.brushForBarcode(barcode);
            }
            yield this._proxy.$finishBrushForTrackedBarcodeCallback({
                brushJson: brush ? JSON.stringify(brush.toJSON()) : null,
                selectionIdentifier: barcode.selectionIdentifier
            });
        });
    }
    updateBarcodeSelectionBasicOverlay(overlay) {
        return this._proxy.$updateBarcodeSelectionBasicOverlay({ overlayJson: JSON.stringify(overlay.toJSON()) });
    }
    unsubscribeProviders() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.aimedBrushProvider) {
                this._proxy.unsubscribeFromEvents([BarcodeSelectionBrushProviderEvents.brushForAimedBarcode]);
                if (this.boundHandleBrushForAimedBarcode) {
                    this._proxy.eventEmitter.off(BarcodeSelectionBrushProviderEvents.brushForAimedBarcode, this.boundHandleBrushForAimedBarcode);
                    this.boundHandleBrushForAimedBarcode = null;
                }
                this.aimedBrushProvider = null;
                yield this._proxy.$removeAimedBarcodeBrushProvider();
            }
            if (this.trackedBrushProvider) {
                this._proxy.unsubscribeFromEvents([BarcodeSelectionBrushProviderEvents.brushForTrackedBarcode]);
                if (this.boundHandleBrushForTrackedBarcode) {
                    this._proxy.eventEmitter.off(BarcodeSelectionBrushProviderEvents.brushForTrackedBarcode, this.boundHandleBrushForTrackedBarcode);
                    this.boundHandleBrushForTrackedBarcode = null;
                }
                this.trackedBrushProvider = null;
                yield this._proxy.$removeTrackedBarcodeBrushProvider();
            }
        });
    }
    dispose() {
        this.unsubscribeProviders();
        this._proxy.dispose();
    }
}

class BarcodeSelectionBasicOverlay extends DefaultSerializeable {
    get view() {
        return this._view;
    }
    set view(newView) {
        var _a, _b;
        if (newView === null) {
            (_a = this.controller) === null || _a === void 0 ? void 0 : _a.dispose();
            this.controller = null;
            this._view = null;
            return;
        }
        this._view = newView;
        (_b = this.controller) !== null && _b !== void 0 ? _b : (this.controller = new BarcodeSelectionOverlayController(this));
    }
    get trackedBrush() {
        return this._trackedBrush;
    }
    set trackedBrush(newBrush) {
        var _a;
        this._trackedBrush = newBrush;
        (_a = this.controller) === null || _a === void 0 ? void 0 : _a.updateBarcodeSelectionBasicOverlay(this);
    }
    get aimedBrush() {
        return this._aimedBrush;
    }
    set aimedBrush(newBrush) {
        var _a;
        this._aimedBrush = newBrush;
        (_a = this.controller) === null || _a === void 0 ? void 0 : _a.updateBarcodeSelectionBasicOverlay(this);
    }
    get selectedBrush() {
        return this._selectedBrush;
    }
    set selectedBrush(newBrush) {
        var _a;
        this._selectedBrush = newBrush;
        (_a = this.controller) === null || _a === void 0 ? void 0 : _a.updateBarcodeSelectionBasicOverlay(this);
    }
    get selectingBrush() {
        return this._selectingBrush;
    }
    set selectingBrush(newBrush) {
        var _a;
        this._selectingBrush = newBrush;
        (_a = this.controller) === null || _a === void 0 ? void 0 : _a.updateBarcodeSelectionBasicOverlay(this);
    }
    get shouldShowScanAreaGuides() {
        return this._shouldShowScanAreaGuides;
    }
    set shouldShowScanAreaGuides(shouldShow) {
        var _a;
        this._shouldShowScanAreaGuides = shouldShow;
        (_a = this.controller) === null || _a === void 0 ? void 0 : _a.updateBarcodeSelectionBasicOverlay(this);
    }
    get shouldShowHints() {
        return this._shouldShowHints;
    }
    set shouldShowHints(shouldShow) {
        var _a;
        this._shouldShowHints = shouldShow;
        (_a = this.controller) === null || _a === void 0 ? void 0 : _a.updateBarcodeSelectionBasicOverlay(this);
    }
    get viewfinder() {
        return this._viewfinder;
    }
    get style() {
        return this._style;
    }
    static get barcodeSelectionDefaults() {
        return getBarcodeSelectionDefaults();
    }
    constructor(mode, style) {
        super();
        this.type = 'barcodeSelectionBasic';
        this.controller = null;
        this._view = null;
        this._shouldShowScanAreaGuides = false;
        this._shouldShowHints = true;
        this._viewfinder = new AimerViewfinder();
        this._trackedBrush = new Brush(BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.styles[BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.defaultStyle].DefaultTrackedBrush.fillColor, BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.styles[BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.defaultStyle].DefaultTrackedBrush.strokeColor, BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.styles[BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.defaultStyle].DefaultTrackedBrush.strokeWidth);
        this._aimedBrush = new Brush(BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.styles[BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.defaultStyle].DefaultAimedBrush.fillColor, BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.styles[BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.defaultStyle].DefaultAimedBrush.strokeColor, BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.styles[BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.defaultStyle].DefaultAimedBrush.strokeWidth);
        this._selectedBrush = new Brush(BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.styles[BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.defaultStyle].DefaultSelectedBrush.fillColor, BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.styles[BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.defaultStyle].DefaultSelectedBrush.strokeColor, BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.styles[BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.defaultStyle].DefaultSelectedBrush.strokeWidth);
        this._selectingBrush = new Brush(BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.styles[BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.defaultStyle].DefaultSelectingBrush.fillColor, BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.styles[BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.defaultStyle].DefaultSelectingBrush.strokeColor, BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.styles[BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.defaultStyle].DefaultSelectingBrush.strokeWidth);
        this.aimedBrushProvider = null;
        this.trackedBrushProvider = null;
        this.hasAimedBrushProvider = false;
        this.hasTrackedBrushProvider = false;
        this._style = style !== null && style !== void 0 ? style : BarcodeSelectionBasicOverlay.barcodeSelectionDefaults.BarcodeSelectionBasicOverlay.defaultStyle;
        this.modeId = mode.modeId;
    }
    setTextForAimToSelectAutoHint(text) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            return (_a = this.controller) === null || _a === void 0 ? void 0 : _a.setTextForAimToSelectAutoHint(text);
        });
    }
    setAimedBarcodeBrushProvider(brushProvider) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            this.aimedBrushProvider = brushProvider;
            this.hasAimedBrushProvider = brushProvider !== null;
            return (_a = this.controller) === null || _a === void 0 ? void 0 : _a.setAimedBarcodeBrushProvider(brushProvider);
        });
    }
    setTrackedBarcodeBrushProvider(brushProvider) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            this.trackedBrushProvider = brushProvider;
            this.hasTrackedBrushProvider = brushProvider !== null;
            return (_a = this.controller) === null || _a === void 0 ? void 0 : _a.setTrackedBarcodeBrushProvider(brushProvider);
        });
    }
}
__decorate([
    ignoreFromSerialization
], BarcodeSelectionBasicOverlay.prototype, "controller", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeSelectionBasicOverlay.prototype, "_view", void 0);
__decorate([
    nameForSerialization('shouldShowScanAreaGuides')
], BarcodeSelectionBasicOverlay.prototype, "_shouldShowScanAreaGuides", void 0);
__decorate([
    nameForSerialization('shouldShowHints')
], BarcodeSelectionBasicOverlay.prototype, "_shouldShowHints", void 0);
__decorate([
    nameForSerialization('viewfinder')
], BarcodeSelectionBasicOverlay.prototype, "_viewfinder", void 0);
__decorate([
    nameForSerialization('style')
], BarcodeSelectionBasicOverlay.prototype, "_style", void 0);
__decorate([
    nameForSerialization('trackedBrush')
], BarcodeSelectionBasicOverlay.prototype, "_trackedBrush", void 0);
__decorate([
    nameForSerialization('aimedBrush')
], BarcodeSelectionBasicOverlay.prototype, "_aimedBrush", void 0);
__decorate([
    nameForSerialization('selectedBrush')
], BarcodeSelectionBasicOverlay.prototype, "_selectedBrush", void 0);
__decorate([
    nameForSerialization('selectingBrush')
], BarcodeSelectionBasicOverlay.prototype, "_selectingBrush", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeSelectionBasicOverlay.prototype, "aimedBrushProvider", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeSelectionBasicOverlay.prototype, "trackedBrushProvider", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeSelectionBasicOverlay, "barcodeSelectionDefaults", null);

class BarcodeSelectionAutoSelectionStrategy extends DefaultSerializeable {
    constructor() {
        super(...arguments);
        this.type = BarcodeSelectionStrategyType.Auto;
    }
    static get autoSelectionStrategy() {
        return new BarcodeSelectionAutoSelectionStrategy();
    }
}
class BarcodeSelectionManualSelectionStrategy extends DefaultSerializeable {
    constructor() {
        super(...arguments);
        this.type = BarcodeSelectionStrategyType.Manual;
    }
    static get manualSelectionStrategy() {
        return new BarcodeSelectionManualSelectionStrategy();
    }
}
class PrivateBarcodeSelectionStrategy {
    static fromJSON(json) {
        switch (json.type) {
            case BarcodeSelectionStrategyType.Auto:
                return BarcodeSelectionAutoSelectionStrategy.autoSelectionStrategy;
            case BarcodeSelectionStrategyType.Manual:
                return BarcodeSelectionManualSelectionStrategy.manualSelectionStrategy;
            default:
                throw new Error('Unknown selection strategy type: ' + json.type);
        }
    }
}

class BarcodeSelectionTapSelection extends DefaultSerializeable {
    constructor() {
        super(...arguments);
        this.type = BarcodeSelectionTypeName.Tap;
        this.freezeBehavior = BarcodeSelectionTapSelection.barcodeSelectionDefaults.BarcodeSelectionTapSelection.defaultFreezeBehavior;
        this.tapBehavior = BarcodeSelectionTapSelection.barcodeSelectionDefaults.BarcodeSelectionTapSelection.defaultTapBehavior;
    }
    static get tapSelection() {
        return new BarcodeSelectionTapSelection();
    }
    static get barcodeSelectionDefaults() {
        return getBarcodeSelectionDefaults();
    }
    static withFreezeBehaviorAndTapBehavior(freezeBehavior, tapBehavior) {
        const selection = this.tapSelection;
        selection.freezeBehavior = freezeBehavior;
        selection.tapBehavior = tapBehavior;
        return selection;
    }
}
__decorate([
    ignoreFromSerialization
], BarcodeSelectionTapSelection, "barcodeSelectionDefaults", null);
class BarcodeSelectionAimerSelection extends DefaultSerializeable {
    static get aimerSelection() {
        return new BarcodeSelectionAimerSelection();
    }
    static get barcodeSelectionDefaults() {
        return getBarcodeSelectionDefaults();
    }
    constructor() {
        super();
        this.type = BarcodeSelectionTypeName.Aimer;
        this.selectionStrategy = BarcodeSelectionAimerSelection.barcodeSelectionDefaults.BarcodeSelectionAimerSelection
            .defaultSelectionStrategy(PrivateBarcodeSelectionStrategy.fromJSON);
    }
}
__decorate([
    ignoreFromSerialization
], BarcodeSelectionAimerSelection, "barcodeSelectionDefaults", null);
class PrivateBarcodeSelectionType {
    static fromJSON(json) {
        switch (json.type) {
            case BarcodeSelectionTypeName.Aimer:
                return PrivateBarcodeSelectionAimerSelection.fromJSON(json);
            case BarcodeSelectionTypeName.Tap:
                return PrivateBarcodeSelectionTapSelection.fromJSON(json);
            default:
                throw new Error('Unknown selection strategy type: ' + json.type);
        }
    }
}
class PrivateBarcodeSelectionAimerSelection {
    static fromJSON(json) {
        const selection = BarcodeSelectionAimerSelection.aimerSelection;
        selection.selectionStrategy = PrivateBarcodeSelectionStrategy.fromJSON(json.selectionStrategy);
        return selection;
    }
}
class PrivateBarcodeSelectionTapSelection {
    static fromJSON(json) {
        const selection = BarcodeSelectionTapSelection.tapSelection;
        selection.freezeBehavior = json.freezeBehavior;
        selection.tapBehavior = json.tapBehavior;
        return selection;
    }
}

class BarcodeSelectionSettings extends DefaultSerializeable {
    static get barcodeSelectionDefaults() {
        return getBarcodeSelectionDefaults();
    }
    static get barcodeDefaults() {
        return getBarcodeDefaults();
    }
    get enabledSymbologies() {
        return Object.keys(this.symbologies)
            .filter(symbology => this.symbologies[symbology].isEnabled);
    }
    constructor() {
        super();
        this.codeDuplicateFilter = BarcodeSelectionSettings.barcodeSelectionDefaults.BarcodeSelectionSettings.codeDuplicateFilter;
        this.singleBarcodeAutoDetection = BarcodeSelectionSettings.barcodeSelectionDefaults.BarcodeSelectionSettings.singleBarcodeAutoDetection;
        this.selectionType = BarcodeSelectionSettings.barcodeSelectionDefaults.BarcodeSelectionSettings.selectionType(PrivateBarcodeSelectionType.fromJSON);
        this.properties = {};
        this.symbologies = {};
    }
    settingsForSymbology(symbology) {
        if (!this.symbologies[symbology]) {
            const symbologySettings = BarcodeSelectionSettings.barcodeDefaults.SymbologySettings[symbology];
            symbologySettings._symbology = symbology;
            this.symbologies[symbology] = symbologySettings;
        }
        return this.symbologies[symbology];
    }
    setProperty(name, value) {
        this.properties[name] = value;
    }
    getProperty(name) {
        return this.properties[name];
    }
    enableSymbologies(symbologies) {
        symbologies.forEach(symbology => this.enableSymbology(symbology, true));
    }
    enableSymbology(symbology, enabled) {
        this.settingsForSymbology(symbology).isEnabled = enabled;
    }
}
__decorate([
    nameForSerialization('singleBarcodeAutoDetectionEnabled')
], BarcodeSelectionSettings.prototype, "singleBarcodeAutoDetection", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeSelectionSettings, "barcodeSelectionDefaults", null);
__decorate([
    ignoreFromSerialization
], BarcodeSelectionSettings, "barcodeDefaults", null);

class BarcodeCountFeedback extends DefaultSerializeable {
    static get default() {
        return new BarcodeCountFeedback(BarcodeCountFeedback.barcodeCountDefaults.Feedback.success, BarcodeCountFeedback.barcodeCountDefaults.Feedback.failure);
    }
    static get emptyFeedback() {
        return new BarcodeCountFeedback(new Feedback(null, null), new Feedback(null, null));
    }
    get success() {
        return this._success;
    }
    set success(success) {
        this._success = success;
        this.updateFeedback();
    }
    get failure() {
        return this._failure;
    }
    set failure(failure) {
        this._failure = failure;
        this.updateFeedback();
    }
    updateFeedback() {
        var _a;
        (_a = this.controller) === null || _a === void 0 ? void 0 : _a.updateFeedback(JSON.stringify(this.toJSON()));
    }
    static fromJSON(json) {
        const success = Feedback.fromJSON(json.success);
        const failure = Feedback.fromJSON(json.failure);
        return new BarcodeCountFeedback(success, failure);
    }
    static get barcodeCountDefaults() {
        return getBarcodeCountDefaults();
    }
    constructor(success, error) {
        super();
        this.controller = null;
        this._success = BarcodeCountFeedback.barcodeCountDefaults.Feedback.success;
        this._failure = BarcodeCountFeedback.barcodeCountDefaults.Feedback.failure;
        this.success = success;
        this.failure = error;
    }
}
__decorate([
    ignoreFromSerialization
], BarcodeCountFeedback.prototype, "controller", void 0);
__decorate([
    nameForSerialization('success')
], BarcodeCountFeedback.prototype, "_success", void 0);
__decorate([
    nameForSerialization('failure')
], BarcodeCountFeedback.prototype, "_failure", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeCountFeedback, "barcodeCountDefaults", null);

class BarcodeCount extends DefaultSerializeable {
    get isEnabled() {
        return this._isEnabled;
    }
    set isEnabled(isEnabled) {
        var _a;
        this._isEnabled = isEnabled;
        (_a = this.controller) === null || _a === void 0 ? void 0 : _a.setModeEnabledState(isEnabled);
    }
    get context() {
        return this._context;
    }
    get feedback() {
        return this._feedback;
    }
    set feedback(feedback) {
        var _a;
        this._feedback = feedback;
        this._feedback.controller = this.controller;
        (_a = this.controller) === null || _a === void 0 ? void 0 : _a.updateFeedback(JSON.stringify(feedback.toJSON()));
    }
    get _context() {
        return this.privateContext;
    }
    set _context(newContext) {
        this.privateContext = newContext;
    }
    get controller() {
        return this._controller;
    }
    set controller(newController) {
        this._controller = newController;
        this._feedback.controller = this.controller;
    }
    constructor(settings) {
        super();
        this.type = 'barcodeCount';
        this._feedback = BarcodeCountFeedback.default;
        this._isEnabled = true;
        this._hasListeners = false;
        this.listeners = [];
        this._additionalBarcodes = [];
        this.privateContext = null;
        this._controller = null;
        this.settings = settings;
    }
    static get barcodeCountDefaults() {
        return getBarcodeCountDefaults();
    }
    applySettings(settings) {
        this.settings = settings;
        return this.didChange();
    }
    addListener(listener) {
        this.checkAndSubscribeListeners();
        if (this.listeners.includes(listener)) {
            return;
        }
        this.listeners.push(listener);
        this._hasListeners = this.listeners.length > 0;
    }
    checkAndSubscribeListeners() {
        var _a;
        if (this.listeners.length === 0) {
            (_a = this.controller) === null || _a === void 0 ? void 0 : _a.registerModeListener();
        }
    }
    removeListener(listener) {
        if (!this.listeners.includes(listener)) {
            return;
        }
        this.listeners.splice(this.listeners.indexOf(listener));
        this.checkAndUnsubscribeListeners();
        this._hasListeners = this.listeners.length > 0;
    }
    checkAndUnsubscribeListeners() {
        var _a;
        if (this.listeners.length === 0) {
            (_a = this.controller) === null || _a === void 0 ? void 0 : _a.removeModeListener();
        }
    }
    reset() {
        var _a, _b;
        return (_b = (_a = this.controller) === null || _a === void 0 ? void 0 : _a.reset()) !== null && _b !== void 0 ? _b : Promise.resolve();
    }
    startScanningPhase() {
        var _a;
        (_a = this.controller) === null || _a === void 0 ? void 0 : _a.startScanningPhase();
    }
    endScanningPhase() {
        var _a;
        (_a = this.controller) === null || _a === void 0 ? void 0 : _a.endScanningPhase();
    }
    setBarcodeCountCaptureList(barcodeCountCaptureList) {
        var _a;
        (_a = this.controller) === null || _a === void 0 ? void 0 : _a.setBarcodeCountCaptureList(barcodeCountCaptureList);
    }
    setAdditionalBarcodes(barcodes) {
        this._additionalBarcodes = barcodes;
        return this.didChange();
    }
    clearAdditionalBarcodes() {
        this._additionalBarcodes = [];
        return this.didChange();
    }
    static createRecommendedCameraSettings() {
        return new CameraSettings(BarcodeCount.barcodeCountDefaults.RecommendedCameraSettings);
    }
    didChange() {
        var _a, _b;
        return (_b = (_a = this.controller) === null || _a === void 0 ? void 0 : _a.updateMode()) !== null && _b !== void 0 ? _b : Promise.resolve();
    }
    unsubscribeNativeListeners() {
        var _a;
        (_a = this.controller) === null || _a === void 0 ? void 0 : _a.removeModeListener();
    }
}
__decorate([
    nameForSerialization('feedback')
], BarcodeCount.prototype, "_feedback", void 0);
__decorate([
    nameForSerialization('isEnabled')
], BarcodeCount.prototype, "_isEnabled", void 0);
__decorate([
    nameForSerialization('hasListeners')
], BarcodeCount.prototype, "_hasListeners", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeCount.prototype, "listeners", void 0);
__decorate([
    nameForSerialization('additionalBarcodes')
], BarcodeCount.prototype, "_additionalBarcodes", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeCount.prototype, "privateContext", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeCount.prototype, "_controller", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeCount, "barcodeCountDefaults", null);

class BarcodeCountCaptureListSession extends DefaultSerializeable {
    get correctBarcodes() {
        return this._correctBarcodes;
    }
    get wrongBarcodes() {
        return this._wrongBarcodes;
    }
    get missingBarcodes() {
        return this._missingBarcodes;
    }
    get additionalBarcodes() {
        return this._additionalBarcodes;
    }
    get acceptedBarcodes() {
        return this._acceptedBarcodes;
    }
    get rejectedBarcodes() {
        return this._rejectedBarcodes;
    }
    static fromJSON(json) {
        var _a, _b, _c, _d, _e, _f;
        const correctBarcodes = (_a = json.correctBarcodes) !== null && _a !== void 0 ? _a : [];
        const wrongBarcodes = (_b = json.wrongBarcodes) !== null && _b !== void 0 ? _b : [];
        const missingBarcodes = (_c = json.missingBarcodes) !== null && _c !== void 0 ? _c : [];
        const additionalBarcodes = (_d = json.additionalBarcodes) !== null && _d !== void 0 ? _d : [];
        const acceptedBarcodes = (_e = json.acceptedBarcodes) !== null && _e !== void 0 ? _e : [];
        const rejectedBarcodes = (_f = json.rejectedBarcodes) !== null && _f !== void 0 ? _f : [];
        return new BarcodeCountCaptureListSession({
            correctBarcodes,
            wrongBarcodes,
            missingBarcodes,
            additionalBarcodes,
            acceptedBarcodes,
            rejectedBarcodes
        });
    }
    constructor({ correctBarcodes, wrongBarcodes, missingBarcodes, additionalBarcodes, acceptedBarcodes, rejectedBarcodes }) {
        super();
        this._correctBarcodes = correctBarcodes;
        this._wrongBarcodes = wrongBarcodes;
        this._missingBarcodes = missingBarcodes;
        this._additionalBarcodes = additionalBarcodes;
        this._acceptedBarcodes = acceptedBarcodes;
        this._rejectedBarcodes = rejectedBarcodes;
    }
}
__decorate([
    nameForSerialization('correctBarcodes')
], BarcodeCountCaptureListSession.prototype, "_correctBarcodes", void 0);
__decorate([
    nameForSerialization('wrongBarcodes')
], BarcodeCountCaptureListSession.prototype, "_wrongBarcodes", void 0);
__decorate([
    nameForSerialization('missingBarcodes')
], BarcodeCountCaptureListSession.prototype, "_missingBarcodes", void 0);
__decorate([
    nameForSerialization('additionalBarcodes')
], BarcodeCountCaptureListSession.prototype, "_additionalBarcodes", void 0);
__decorate([
    nameForSerialization('acceptedBarcodes')
], BarcodeCountCaptureListSession.prototype, "_acceptedBarcodes", void 0);
__decorate([
    nameForSerialization('rejectedBarcodes')
], BarcodeCountCaptureListSession.prototype, "_rejectedBarcodes", void 0);

var BarcodeCountViewStyle;
(function (BarcodeCountViewStyle) {
    BarcodeCountViewStyle["Icon"] = "icon";
    BarcodeCountViewStyle["Dot"] = "dot";
})(BarcodeCountViewStyle || (BarcodeCountViewStyle = {}));

var BarcodeFilterHighlightType;
(function (BarcodeFilterHighlightType) {
    BarcodeFilterHighlightType["Brush"] = "brush";
})(BarcodeFilterHighlightType || (BarcodeFilterHighlightType = {}));

class BarcodeCountSessionController extends BaseNewController {
    constructor(viewId) {
        super('BarcodeCountSessionProxy');
        this.viewId = viewId;
    }
    resetSession() {
        return this._proxy.$resetBarcodeCountSession({ viewId: this.viewId });
    }
    getSpatialMap() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this._proxy.$getBarcodeCountSpatialMap({ viewId: this.viewId });
            if (result) {
                const payload = JSON.parse(result.data);
                return BarcodeSpatialGrid.fromJSON(payload);
            }
        });
    }
    getSpatialMapWithHints(expectedNumberOfRows, expectedNumberOfColumns) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this._proxy.$getBarcodeCountSpatialMapWithHints({ viewId: this.viewId, expectedNumberOfRows, expectedNumberOfColumns });
            if (result) {
                const payload = JSON.parse(result.data);
                return BarcodeSpatialGrid.fromJSON(payload);
            }
        });
    }
}

class BarcodeCountSession extends DefaultSerializeable {
    static fromJSON(json) {
        var _a;
        const sessionJson = JSON.parse(json.session);
        const session = new BarcodeCountSession(json.viewId);
        session._frameSequenceID = sessionJson.frameSequenceId;
        session._additionalBarcodes = sessionJson.additionalBarcodes;
        session._recognizedBarcodes = sessionJson.recognizedBarcodes.map(Barcode.fromJSON);
        session.frameId = (_a = json.frameId) !== null && _a !== void 0 ? _a : '';
        return session;
    }
    constructor(viewId) {
        super();
        this.sessionController = new BarcodeCountSessionController(viewId);
    }
    get recognizedBarcodes() {
        return this._recognizedBarcodes;
    }
    get additionalBarcodes() {
        return this._additionalBarcodes;
    }
    get frameSequenceID() {
        return this._frameSequenceID;
    }
    reset() {
        return this.sessionController.resetSession();
    }
    getSpatialMap() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            return (_a = yield this.sessionController.getSpatialMap()) !== null && _a !== void 0 ? _a : null;
        });
    }
    getSpatialMapWithHints(expectedNumberOfRows, expectedNumberOfColumns) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            return (_a = yield this.sessionController.getSpatialMapWithHints(expectedNumberOfRows, expectedNumberOfColumns)) !== null && _a !== void 0 ? _a : null;
        });
    }
}
__decorate([
    nameForSerialization('recognizedBarcodes')
], BarcodeCountSession.prototype, "_recognizedBarcodes", void 0);
__decorate([
    nameForSerialization('additionalBarcodes')
], BarcodeCountSession.prototype, "_additionalBarcodes", void 0);
__decorate([
    nameForSerialization('frameSequenceID')
], BarcodeCountSession.prototype, "_frameSequenceID", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeCountSession.prototype, "sessionController", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeCountSession.prototype, "frameId", void 0);

class BarcodeCountSettings extends DefaultSerializeable {
    static get barcodeCountDefaults() {
        return getBarcodeCountDefaults();
    }
    static get barcodeDefaults() {
        return getBarcodeDefaults();
    }
    constructor() {
        super();
        this.symbologies = {};
        this.properties = {};
        this._filterSettings = BarcodeCountSettings.barcodeCountDefaults.BarcodeCountSettings.barcodeFilterSettings;
        this._expectsOnlyUniqueBarcodes = BarcodeCountSettings.barcodeCountDefaults.BarcodeCountSettings.expectOnlyUniqueBarcodes;
        this._mappingEnabled = BarcodeCountSettings.barcodeCountDefaults.BarcodeCountSettings.mappingEnabled;
    }
    get expectsOnlyUniqueBarcodes() {
        return this._expectsOnlyUniqueBarcodes;
    }
    set expectsOnlyUniqueBarcodes(expectsOnlyUniqueBarcodes) {
        this._expectsOnlyUniqueBarcodes = expectsOnlyUniqueBarcodes;
    }
    get mappingEnabled() {
        return this._mappingEnabled;
    }
    set mappingEnabled(mappingEnabled) {
        this._mappingEnabled = mappingEnabled;
    }
    get filterSettings() {
        return this._filterSettings;
    }
    get enabledSymbologies() {
        return Object.keys(this.symbologies)
            .filter(symbology => this.symbologies[symbology].isEnabled);
    }
    settingsForSymbology(symbology) {
        if (!this.symbologies[symbology]) {
            const symbologySettings = BarcodeCountSettings.barcodeDefaults.SymbologySettings[symbology];
            symbologySettings._symbology = symbology;
            this.symbologies[symbology] = symbologySettings;
        }
        return this.symbologies[symbology];
    }
    enableSymbologies(symbologies) {
        symbologies.forEach(symbology => this.enableSymbology(symbology, true));
    }
    enableSymbology(symbology, enabled) {
        this.settingsForSymbology(symbology).isEnabled = enabled;
    }
    setProperty(name, value) {
        this.properties[name] = value;
    }
    getProperty(name) {
        return this.properties[name];
    }
}
__decorate([
    nameForSerialization('barcodeFilterSettings')
], BarcodeCountSettings.prototype, "_filterSettings", void 0);
__decorate([
    nameForSerialization('expectOnlyUniqueBarcodes')
], BarcodeCountSettings.prototype, "_expectsOnlyUniqueBarcodes", void 0);
__decorate([
    nameForSerialization('mappingEnabled')
], BarcodeCountSettings.prototype, "_mappingEnabled", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeCountSettings, "barcodeCountDefaults", null);
__decorate([
    ignoreFromSerialization
], BarcodeCountSettings, "barcodeDefaults", null);

class BarcodeCountToolbarSettings extends DefaultSerializeable {
    constructor() {
        super(...arguments);
        this.audioOnButtonText = BarcodeCountToolbarSettings.barcodeCountDefaults.BarcodeCountView.toolbarSettings.audioOnButtonText;
        this.audioOffButtonText = BarcodeCountToolbarSettings.barcodeCountDefaults.BarcodeCountView.toolbarSettings.audioOffButtonText;
        this.audioButtonContentDescription = BarcodeCountToolbarSettings.barcodeCountDefaults.BarcodeCountView.toolbarSettings.audioButtonContentDescription;
        this.audioButtonAccessibilityHint = BarcodeCountToolbarSettings.barcodeCountDefaults.BarcodeCountView.toolbarSettings.audioButtonAccessibilityHint;
        this.audioButtonAccessibilityLabel = BarcodeCountToolbarSettings.barcodeCountDefaults.BarcodeCountView.toolbarSettings.audioButtonAccessibilityLabel;
        this.vibrationOnButtonText = BarcodeCountToolbarSettings.barcodeCountDefaults.BarcodeCountView.toolbarSettings.vibrationOnButtonText;
        this.vibrationOffButtonText = BarcodeCountToolbarSettings.barcodeCountDefaults.BarcodeCountView.toolbarSettings.vibrationOffButtonText;
        this.vibrationButtonContentDescription = BarcodeCountToolbarSettings.barcodeCountDefaults.BarcodeCountView.toolbarSettings.vibrationButtonContentDescription;
        this.vibrationButtonAccessibilityHint = BarcodeCountToolbarSettings.barcodeCountDefaults.BarcodeCountView.toolbarSettings.vibrationButtonAccessibilityHint;
        this.vibrationButtonAccessibilityLabel = BarcodeCountToolbarSettings.barcodeCountDefaults.BarcodeCountView.toolbarSettings.vibrationButtonAccessibilityLabel;
        this.strapModeOnButtonText = BarcodeCountToolbarSettings.barcodeCountDefaults.BarcodeCountView.toolbarSettings.strapModeOnButtonText;
        this.strapModeOffButtonText = BarcodeCountToolbarSettings.barcodeCountDefaults.BarcodeCountView.toolbarSettings.strapModeOffButtonText;
        this.strapModeButtonContentDescription = BarcodeCountToolbarSettings.barcodeCountDefaults.BarcodeCountView.toolbarSettings.strapModeButtonContentDescription;
        this.strapModeButtonAccessibilityHint = BarcodeCountToolbarSettings.barcodeCountDefaults.BarcodeCountView.toolbarSettings.strapModeButtonAccessibilityHint;
        this.strapModeButtonAccessibilityLabel = BarcodeCountToolbarSettings.barcodeCountDefaults.BarcodeCountView.toolbarSettings.strapModeButtonAccessibilityLabel;
        this.colorSchemeOnButtonText = BarcodeCountToolbarSettings.barcodeCountDefaults.BarcodeCountView.toolbarSettings.colorSchemeOnButtonText;
        this.colorSchemeOffButtonText = BarcodeCountToolbarSettings.barcodeCountDefaults.BarcodeCountView.toolbarSettings.colorSchemeOffButtonText;
        this.colorSchemeButtonContentDescription = BarcodeCountToolbarSettings.barcodeCountDefaults.BarcodeCountView.toolbarSettings.colorSchemeButtonContentDescription;
        this.colorSchemeButtonAccessibilityHint = BarcodeCountToolbarSettings.barcodeCountDefaults.BarcodeCountView.toolbarSettings.colorSchemeButtonAccessibilityHint;
        this.colorSchemeButtonAccessibilityLabel = BarcodeCountToolbarSettings.barcodeCountDefaults.BarcodeCountView.toolbarSettings.colorSchemeButtonAccessibilityLabel;
    }
    static get barcodeCountDefaults() {
        return getBarcodeCountDefaults();
    }
}
__decorate([
    ignoreFromSerialization
], BarcodeCountToolbarSettings, "barcodeCountDefaults", null);

class BarcodeCountViewEventHandlers {
    constructor(view, barcodeCount, proxy) {
        this.view = view;
        this.barcodeCount = barcodeCount;
        this.proxy = proxy;
        // Bind all handler methods to 'this' to ensure the correct context when they are used as callbacks.
        // Without this, 'this' would be undefined or incorrect when the methods are called by the proxy event system.
        this.handleSingleScanButtonTapped = this.handleSingleScanButtonTapped.bind(this);
        this.handleListButtonTapped = this.handleListButtonTapped.bind(this);
        this.handleExitButtonTapped = this.handleExitButtonTapped.bind(this);
        this.handleBrushForRecognizedBarcode = this.handleBrushForRecognizedBarcode.bind(this);
        this.handleBrushForRecognizedBarcodeNotInList = this.handleBrushForRecognizedBarcodeNotInList.bind(this);
        this.handleBrushForAcceptedBarcode = this.handleBrushForAcceptedBarcode.bind(this);
        this.handleBrushForRejectedBarcode = this.handleBrushForRejectedBarcode.bind(this);
        this.handleFilteredBarcodeTapped = this.handleFilteredBarcodeTapped.bind(this);
        this.handleRecognizedBarcodeNotInListTapped = this.handleRecognizedBarcodeNotInListTapped.bind(this);
        this.handleRecognizedBarcodeTapped = this.handleRecognizedBarcodeTapped.bind(this);
        this.handleAcceptedBarcodeTapped = this.handleAcceptedBarcodeTapped.bind(this);
        this.handleRejectedBarcodeTapped = this.handleRejectedBarcodeTapped.bind(this);
        this.handleCaptureListCompleted = this.handleCaptureListCompleted.bind(this);
        this.handleDidScan = this.handleDidScan.bind(this);
        this.handleDidUpdateSession = this.handleDidUpdateSession.bind(this);
    }
    handleSingleScanButtonTapped(ev) {
        var _a, _b;
        const payload = EventDataParser.parse(ev.data);
        if (payload === null) {
            console.error('BarcodeCountViewController listButtonTapped payload is null');
            return;
        }
        if (payload.viewId !== this.view.viewId) {
            return;
        }
        (_b = (_a = this.view.uiListener) === null || _a === void 0 ? void 0 : _a.didTapSingleScanButton) === null || _b === void 0 ? void 0 : _b.call(_a, this.view.platformView);
    }
    handleListButtonTapped(ev) {
        var _a, _b;
        const payload = EventDataParser.parse(ev.data);
        if (payload === null) {
            console.error('BarcodeCountViewController listButtonTapped payload is null');
            return;
        }
        if (payload.viewId !== this.view.viewId) {
            return;
        }
        (_b = (_a = this.view.uiListener) === null || _a === void 0 ? void 0 : _a.didTapListButton) === null || _b === void 0 ? void 0 : _b.call(_a, this.view.platformView);
    }
    handleExitButtonTapped(ev) {
        var _a, _b;
        const payload = EventDataParser.parse(ev.data);
        if (payload === null) {
            console.error('BarcodeCountViewController exitButtonTapped payload is null');
            return;
        }
        if (payload.viewId !== this.view.viewId) {
            return;
        }
        (_b = (_a = this.view.uiListener) === null || _a === void 0 ? void 0 : _a.didTapExitButton) === null || _b === void 0 ? void 0 : _b.call(_a, this.view.platformView);
    }
    handleBrushForRecognizedBarcode(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                console.error('BarcodeCountViewController brushForRecognizedBarcode payload is null');
                return;
            }
            if (payload.viewId !== this.view.viewId) {
                return;
            }
            const trackedBarcode = TrackedBarcode
                .fromJSON(JSON.parse(payload.trackedBarcode));
            let brush = this.view.recognizedBrush;
            if (this.view.listener && this.view.listener.brushForRecognizedBarcode) {
                brush = this.view.listener.brushForRecognizedBarcode(this.view.platformView, trackedBarcode);
            }
            const finishPayload = this.buildTrackedBarcodeBrushPayload(trackedBarcode, brush);
            yield this.proxy.$finishBarcodeCountBrushForRecognizedBarcode({ viewId: this.view.viewId, brushJson: finishPayload.brush, trackedBarcodeId: finishPayload.trackedBarcodeID });
        });
    }
    handleBrushForRecognizedBarcodeNotInList(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                console.error('BarcodeCountViewController brushForRecognizedBarcodeNotInList payload is null');
                return;
            }
            if (payload.viewId !== this.view.viewId) {
                return;
            }
            const trackedBarcode = TrackedBarcode
                .fromJSON(JSON.parse(payload.trackedBarcode));
            let brush = this.view.notInListBrush;
            if (this.view.listener && this.view.listener.brushForRecognizedBarcodeNotInList) {
                brush = this.view.listener.brushForRecognizedBarcodeNotInList(this.view.platformView, trackedBarcode);
            }
            const finishPayload = this.buildTrackedBarcodeBrushPayload(trackedBarcode, brush);
            yield this.proxy.$finishBarcodeCountBrushForRecognizedBarcodeNotInList({ viewId: this.view.viewId, brushJson: finishPayload.brush, trackedBarcodeId: finishPayload.trackedBarcodeID });
        });
    }
    handleBrushForAcceptedBarcode(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                console.error('BarcodeCountViewController brushForAcceptedBarcode payload is null');
                return;
            }
            if (payload.viewId !== this.view.viewId) {
                return;
            }
            const trackedBarcode = TrackedBarcode
                .fromJSON(JSON.parse(payload.trackedBarcode));
            let brush = this.view.acceptedBrush;
            if (this.view.listener && this.view.listener.brushForAcceptedBarcode) {
                brush = this.view.listener.brushForAcceptedBarcode(this.view.platformView, trackedBarcode);
            }
            const finishPayload = this.buildTrackedBarcodeBrushPayload(trackedBarcode, brush);
            yield this.proxy.$finishBarcodeCountBrushForAcceptedBarcode({ viewId: this.view.viewId, brushJson: finishPayload.brush, trackedBarcodeId: finishPayload.trackedBarcodeID });
        });
    }
    handleBrushForRejectedBarcode(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                console.error('BarcodeCountViewController brushForRejectedBarcode payload is null');
                return;
            }
            if (payload.viewId !== this.view.viewId) {
                return;
            }
            const trackedBarcode = TrackedBarcode
                .fromJSON(JSON.parse(payload.trackedBarcode));
            let brush = this.view.rejectedBrush;
            if (this.view.listener && this.view.listener.brushForRejectedBarcode) {
                brush = this.view.listener.brushForRejectedBarcode(this.view.platformView, trackedBarcode);
            }
            const finishPayload = this.buildTrackedBarcodeBrushPayload(trackedBarcode, brush);
            yield this.proxy.$finishBarcodeCountBrushForRejectedBarcode({ viewId: this.view.viewId, brushJson: finishPayload.brush, trackedBarcodeId: finishPayload.trackedBarcodeID });
        });
    }
    handleFilteredBarcodeTapped(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                console.error('BarcodeCountViewController filteredBarcodeTapped payload is null');
                return;
            }
            if (payload.viewId !== this.view.viewId) {
                return;
            }
            const trackedBarcode = TrackedBarcode
                .fromJSON(JSON.parse(payload.trackedBarcode));
            if (this.view.listener && this.view.listener.didTapFilteredBarcode) {
                this.view.listener.didTapFilteredBarcode(this.view.platformView, trackedBarcode);
            }
        });
    }
    handleRecognizedBarcodeNotInListTapped(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                console.error('BarcodeCountViewController recognizedBarcodeNotInListTapped payload is null');
                return;
            }
            if (payload.viewId !== this.view.viewId) {
                return;
            }
            const trackedBarcode = TrackedBarcode
                .fromJSON(JSON.parse(payload.trackedBarcode));
            if (this.view.listener && this.view.listener.didTapRecognizedBarcodeNotInList) {
                this.view.listener.didTapRecognizedBarcodeNotInList(this.view.platformView, trackedBarcode);
            }
        });
    }
    handleRecognizedBarcodeTapped(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                console.error('BarcodeCountViewController recognizedBarcodeTapped payload is null');
                return;
            }
            if (payload.viewId !== this.view.viewId) {
                return;
            }
            const trackedBarcode = TrackedBarcode
                .fromJSON(JSON.parse(payload.trackedBarcode));
            if (this.view.listener && this.view.listener.didTapRecognizedBarcode) {
                this.view.listener.didTapRecognizedBarcode(this.view.platformView, trackedBarcode);
            }
        });
    }
    handleAcceptedBarcodeTapped(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                console.error('BarcodeCountViewController acceptedBarcodeTapped payload is null');
                return;
            }
            if (payload.viewId !== this.view.viewId) {
                return;
            }
            const trackedBarcode = TrackedBarcode
                .fromJSON(JSON.parse(payload.trackedBarcode));
            if (this.view.listener && this.view.listener.didTapAcceptedBarcode) {
                this.view.listener.didTapAcceptedBarcode(this.view.platformView, trackedBarcode);
            }
        });
    }
    handleRejectedBarcodeTapped(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                console.error('BarcodeCountViewController rejectedBarcodeTapped payload is null');
                return;
            }
            if (payload.viewId !== this.view.viewId) {
                return;
            }
            const trackedBarcode = TrackedBarcode
                .fromJSON(JSON.parse(payload.trackedBarcode));
            if (this.view.listener && this.view.listener.didTapRejectedBarcode) {
                this.view.listener.didTapRejectedBarcode(this.view.platformView, trackedBarcode);
            }
        });
    }
    handleCaptureListCompleted(ev) {
        const payload = EventDataParser.parse(ev.data);
        if (payload === null) {
            console.error('BarcodeCountViewController captureListCompleted payload is null');
            return;
        }
        if (payload.viewId !== this.view.viewId) {
            return;
        }
        if (this.view.listener && this.view.listener.didCompleteCaptureList) {
            this.view.listener.didCompleteCaptureList(this.view.platformView);
        }
    }
    handleDidScan(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                console.error('BarcodeCountListenerController didScan payload is null');
                return;
            }
            if (payload.viewId !== this.view.viewId) {
                return;
            }
            const session = BarcodeCountSession.fromJSON(payload);
            yield this.notifyListenersOfDidScanSession(session);
            yield this.proxy.$finishBarcodeCountOnScan({ viewId: this.view.viewId });
        });
    }
    handleDidUpdateSession(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                console.error('BarcodeCountListenerController.subscribeListener: didListSessionUpdate payload is null');
                return;
            }
            if (payload.viewId !== this.view.viewId) {
                return;
            }
            const session = BarcodeCountCaptureListSession
                .fromJSON(JSON.parse(payload.session));
            this.notifyListenersOfDidListSessionUpdate(session);
        });
    }
    buildTrackedBarcodeBrushPayload(trackedBarcode, brush) {
        return {
            trackedBarcodeID: trackedBarcode.identifier,
            brush: brush ? JSON.stringify(brush.toJSON()) : null,
        };
    }
    notifyListenersOfDidScanSession(session) {
        return __awaiter(this, void 0, void 0, function* () {
            const mode = this.barcodeCount;
            for (const listener of mode.listeners) {
                if (listener.didScan) {
                    yield listener.didScan(this.barcodeCount, session, () => CameraController.getFrame(session.frameId));
                }
            }
        });
    }
    setBarcodeCountCaptureList(barcodeCountCaptureList) {
        this._barcodeCountCaptureList = barcodeCountCaptureList;
        this.proxy.$setBarcodeCountCaptureList({ viewId: this.view.viewId, captureListJson: JSON.stringify(barcodeCountCaptureList.targetBarcodes) });
    }
    notifyListenersOfDidListSessionUpdate(session) {
        var _a;
        const barcodeCountCaptureListListener = (_a = this._barcodeCountCaptureList) === null || _a === void 0 ? void 0 : _a.listener;
        if (barcodeCountCaptureListListener && (barcodeCountCaptureListListener === null || barcodeCountCaptureListListener === void 0 ? void 0 : barcodeCountCaptureListListener.didUpdateSession)) {
            barcodeCountCaptureListListener === null || barcodeCountCaptureListListener === void 0 ? void 0 : barcodeCountCaptureListListener.didUpdateSession(this._barcodeCountCaptureList, session);
        }
    }
}

var BarcodeCountViewEvents;
(function (BarcodeCountViewEvents) {
    BarcodeCountViewEvents["singleScanButtonTapped"] = "BarcodeCountViewUiListener.onSingleScanButtonTapped";
    BarcodeCountViewEvents["listButtonTapped"] = "BarcodeCountViewUiListener.onListButtonTapped";
    BarcodeCountViewEvents["exitButtonTapped"] = "BarcodeCountViewUiListener.onExitButtonTapped";
    BarcodeCountViewEvents["brushForRecognizedBarcode"] = "BarcodeCountViewListener.brushForRecognizedBarcode";
    BarcodeCountViewEvents["brushForRecognizedBarcodeNotInList"] = "BarcodeCountViewListener.brushForRecognizedBarcodeNotInList";
    BarcodeCountViewEvents["brushForAcceptedBarcode"] = "BarcodeCountViewListener.brushForAcceptedBarcode";
    BarcodeCountViewEvents["brushForRejectedBarcode"] = "BarcodeCountViewListener.brushForRejectedBarcode";
    BarcodeCountViewEvents["filteredBarcodeTapped"] = "BarcodeCountViewListener.didTapFilteredBarcode";
    BarcodeCountViewEvents["recognizedBarcodeNotInListTapped"] = "BarcodeCountViewListener.didTapRecognizedBarcodeNotInList";
    BarcodeCountViewEvents["recognizedBarcodeTapped"] = "BarcodeCountViewListener.didTapRecognizedBarcode";
    BarcodeCountViewEvents["acceptedBarcodeTapped"] = "BarcodeCountViewListener.didTapAcceptedBarcode";
    BarcodeCountViewEvents["rejectedBarcodeTapped"] = "BarcodeCountViewListener.didTapRejectedBarcode";
    BarcodeCountViewEvents["captureListCompleted"] = "BarcodeCountViewListener.didCompleteCaptureList";
    BarcodeCountViewEvents["didUpdateSession"] = "BarcodeCountCaptureListListener.didUpdateSession";
    BarcodeCountViewEvents["didScan"] = "BarcodeCountListener.onScan";
})(BarcodeCountViewEvents || (BarcodeCountViewEvents = {}));
class BarcodeCountViewController extends BaseNewController {
    static forBarcodeCountAndBarcodeCountView(view, barcodeCount) {
        const controller = new BarcodeCountViewController({ view, barcodeCount });
        controller.barcodeCount.controller = controller;
        controller.initialize();
        return controller;
    }
    constructor({ view, barcodeCount }) {
        super('BarcodeCountViewProxy');
        this.view = view;
        this.barcodeCount = barcodeCount;
        this.eventHandlers = new BarcodeCountViewEventHandlers(this.view, this.barcodeCount, this._proxy);
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.setupEventListeners();
            if (this.barcodeCount._hasListeners) {
                this.registerModeListener();
            }
            if (this.view.uiListener) {
                this.registerUiListener();
            }
            if (this.view.listener) {
                this.registerViewListener();
            }
        });
    }
    registerModeListener() {
        if (!this.isViewCreated) {
            return;
        }
        this._proxy.$registerBarcodeCountListener({ viewId: this.view.viewId });
    }
    registerUiListener() {
        if (!this.isViewCreated) {
            return;
        }
        this._proxy.$registerBarcodeCountViewUiListener({ viewId: this.view.viewId });
    }
    registerViewListener() {
        if (!this.isViewCreated) {
            return;
        }
        this._proxy.$registerBarcodeCountViewListener({ viewId: this.view.viewId });
    }
    update() {
        const barcodeCountView = this.view.toJSON();
        const json = barcodeCountView.View;
        return this._proxy.$updateBarcodeCountView({ viewId: this.view.viewId, viewJson: JSON.stringify(json) });
    }
    createNativeView() {
        return this.createView();
    }
    removeNativeView() {
        var _a;
        return (_a = this._proxy.$removeBarcodeCountView({ viewId: this.view.viewId })) !== null && _a !== void 0 ? _a : Promise.resolve();
    }
    createView() {
        const barcodeCountViewJson = this.view.toJSON();
        return this._proxy.$createBarcodeCountView({ viewId: this.view.viewId, viewJson: JSON.stringify(barcodeCountViewJson) });
    }
    setUiListener(listener) {
        return __awaiter(this, void 0, void 0, function* () {
            if (listener != null) {
                this.registerUiListener();
            }
            else {
                yield this._proxy.$unregisterBarcodeCountViewUiListener({ viewId: this.view.viewId });
            }
        });
    }
    setViewListener(listener) {
        return __awaiter(this, void 0, void 0, function* () {
            if (listener != null) {
                this.registerViewListener();
            }
            else {
                yield this._proxy.$unregisterBarcodeCountViewListener({ viewId: this.view.viewId });
            }
        });
    }
    clearHighlights() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._proxy.$clearBarcodeCountHighlights({ viewId: this.view.viewId });
        });
    }
    dispose() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.unsubscribeListeners();
            this._proxy.$disposeBarcodeCountView({ viewId: this.view.viewId });
            this._proxy.dispose();
        });
    }
    setPositionAndSize(top, left, width, height, shouldBeUnderWebView) {
        return this._proxy.$setBarcodeCountViewPositionAndSize({ top, left, width, height, shouldBeUnderWebView });
    }
    show() {
        if (!this.view.context) {
            throw new Error('There should be a context attached to a view that should be shown');
        }
        return this._proxy.$showBarcodeCountView({ viewId: this.view.viewId });
    }
    hide() {
        if (!this.view.context) {
            throw new Error('There should be a context attached to a view that should be shown');
        }
        return this._proxy.$hideBarcodeCountView({ viewId: this.view.viewId });
    }
    setBrushForRecognizedBarcode(trackedBarcode, brush) {
        const payload = this.buildTrackedBarcodeBrushPayload(trackedBarcode, brush);
        return this._proxy.$finishBarcodeCountBrushForRecognizedBarcode({ viewId: this.view.viewId, brushJson: payload.brush, trackedBarcodeId: payload.trackedBarcodeID });
    }
    setBrushForRecognizedBarcodeNotInList(trackedBarcode, brush) {
        const payload = this.buildTrackedBarcodeBrushPayload(trackedBarcode, brush);
        return this._proxy.$finishBarcodeCountBrushForRecognizedBarcodeNotInList({ viewId: this.view.viewId, brushJson: payload.brush, trackedBarcodeId: payload.trackedBarcodeID });
    }
    setBrushForAcceptedBarcode(trackedBarcode, brush) {
        const payload = this.buildTrackedBarcodeBrushPayload(trackedBarcode, brush);
        return this._proxy.$finishBarcodeCountBrushForAcceptedBarcode({ viewId: this.view.viewId, brushJson: payload.brush, trackedBarcodeId: payload.trackedBarcodeID });
    }
    setBrushForRejectedBarcode(trackedBarcode, brush) {
        const payload = this.buildTrackedBarcodeBrushPayload(trackedBarcode, brush);
        return this._proxy.$finishBarcodeCountBrushForRejectedBarcode({ viewId: this.view.viewId, brushJson: payload.brush, trackedBarcodeId: payload.trackedBarcodeID });
    }
    enableHardwareTrigger(hardwareTriggerKeyCode) {
        return this._proxy.$enableBarcodeCountHardwareTrigger({ viewId: this.view.viewId, hardwareTriggerKeyCode });
    }
    buildTrackedBarcodeBrushPayload(trackedBarcode, brush) {
        return {
            trackedBarcodeID: trackedBarcode.identifier,
            brush: brush ? JSON.stringify(brush.toJSON()) : null,
        };
    }
    setupEventListeners() {
        return __awaiter(this, void 0, void 0, function* () {
            this._proxy.on$singleScanButtonTapped = this.eventHandlers.handleSingleScanButtonTapped;
            this._proxy.on$listButtonTapped = this.eventHandlers.handleListButtonTapped;
            this._proxy.on$exitButtonTapped = this.eventHandlers.handleExitButtonTapped;
            this._proxy.on$brushForRecognizedBarcode = this.eventHandlers.handleBrushForRecognizedBarcode;
            this._proxy.on$brushForRecognizedBarcodeNotInList = this.eventHandlers.handleBrushForRecognizedBarcodeNotInList;
            this._proxy.on$brushForAcceptedBarcode = this.eventHandlers.handleBrushForAcceptedBarcode;
            this._proxy.on$brushForRejectedBarcode = this.eventHandlers.handleBrushForRejectedBarcode;
            this._proxy.on$filteredBarcodeTapped = this.eventHandlers.handleFilteredBarcodeTapped;
            this._proxy.on$recognizedBarcodeNotInListTapped = this.eventHandlers.handleRecognizedBarcodeNotInListTapped;
            this._proxy.on$recognizedBarcodeTapped = this.eventHandlers.handleRecognizedBarcodeTapped;
            this._proxy.on$acceptedBarcodeTapped = this.eventHandlers.handleAcceptedBarcodeTapped;
            this._proxy.on$rejectedBarcodeTapped = this.eventHandlers.handleRejectedBarcodeTapped;
            this._proxy.on$captureListCompleted = this.eventHandlers.handleCaptureListCompleted;
            this._proxy.on$didScan = this.eventHandlers.handleDidScan;
            this._proxy.on$didUpdateSession = this.eventHandlers.handleDidUpdateSession;
        });
    }
    unsubscribeListeners() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._proxy.$unregisterBarcodeCountViewListener({ viewId: this.view.viewId });
            yield this._proxy.$unregisterBarcodeCountViewUiListener({ viewId: this.view.viewId });
        });
    }
    // From Listener Controller
    updateMode() {
        if (!this.isViewCreated) {
            return Promise.resolve();
        }
        const barcodeCount = this.barcodeCount.toJSON();
        const json = JSON.stringify(barcodeCount);
        return this._proxy.$updateBarcodeCountMode({ viewId: this.view.viewId, barcodeCountJson: json });
    }
    reset() {
        if (!this.isViewCreated) {
            return Promise.resolve();
        }
        return this._proxy.$resetBarcodeCount({ viewId: this.view.viewId });
    }
    setModeEnabledState(enabled) {
        if (!this.isViewCreated) {
            return;
        }
        this._proxy.$setBarcodeCountModeEnabledState({ viewId: this.view.viewId, isEnabled: enabled });
    }
    removeModeListener() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._proxy.$unregisterBarcodeCountListener({ viewId: this.view.viewId });
        });
    }
    startScanningPhase() {
        this._proxy.$startBarcodeCountScanningPhase({ viewId: this.view.viewId });
    }
    endScanningPhase() {
        this._proxy.$endBarcodeCountScanningPhase({ viewId: this.view.viewId });
    }
    updateFeedback(feedbackJson) {
        this._proxy.$updateBarcodeCountFeedback({ viewId: this.view.viewId, feedbackJson });
    }
    setBarcodeCountCaptureList(barcodeCountCaptureList) {
        this.eventHandlers.setBarcodeCountCaptureList(barcodeCountCaptureList);
    }
    get isViewCreated() {
        return this.view.viewId !== -1;
    }
}

class BarcodeCountNotInListActionSettings extends DefaultSerializeable {
    constructor() {
        super(...arguments);
        this._enabled = false;
        this._acceptButtonText = "";
        this._acceptButtonAccessibilityLabel = "";
        this._acceptButtonAccessibilityHint = "";
        this._acceptButtonContentDescription = "";
        this._rejectButtonText = "";
        this._rejectButtonAccessibilityLabel = "";
        this._rejectButtonAccessibilityHint = "";
        this._rejectButtonContentDescription = "";
        this._cancelButtonText = "";
        this._cancelButtonAccessibilityLabel = "";
        this._cancelButtonAccessibilityHint = "";
        this._cancelButtonContentDescription = "";
        this._barcodeAcceptedHint = "";
        this._barcodeRejectedHint = "";
    }
    static barcodeCountDefaults() {
        return getBarcodeCountDefaults();
    }
    get enabled() {
        return this._enabled;
    }
    set enabled(newValue) {
        this._enabled = newValue;
    }
    get acceptButtonText() {
        return this._acceptButtonText;
    }
    set acceptButtonText(newValue) {
        this._acceptButtonText = newValue;
    }
    get acceptButtonAccessibilityLabel() {
        return this._acceptButtonAccessibilityLabel;
    }
    set acceptButtonAccessibilityLabel(newValue) {
        this._acceptButtonAccessibilityLabel = newValue;
    }
    get acceptButtonAccessibilityHint() {
        return this._acceptButtonAccessibilityHint;
    }
    set acceptButtonAccessibilityHint(value) {
        this._acceptButtonAccessibilityHint = value;
    }
    get acceptButtonContentDescription() {
        return this._acceptButtonContentDescription;
    }
    set acceptButtonContentDescription(value) {
        this._acceptButtonContentDescription = value;
    }
    get rejectButtonText() {
        return this._rejectButtonText;
    }
    set rejectButtonText(value) {
        this._rejectButtonText = value;
    }
    get rejectButtonAccessibilityLabel() {
        return this._rejectButtonAccessibilityLabel;
    }
    set rejectButtonAccessibilityLabel(value) {
        this._rejectButtonAccessibilityLabel = value;
    }
    get rejectButtonAccessibilityHint() {
        return this._rejectButtonAccessibilityHint;
    }
    set rejectButtonAccessibilityHint(value) {
        this._rejectButtonAccessibilityHint = value;
    }
    get rejectButtonContentDescription() {
        return this._rejectButtonContentDescription;
    }
    set rejectButtonContentDescription(value) {
        this._rejectButtonContentDescription = value;
    }
    get cancelButtonText() {
        return this._cancelButtonText;
    }
    set cancelButtonText(value) {
        this._cancelButtonText = value;
    }
    get cancelButtonAccessibilityLabel() {
        return this._cancelButtonAccessibilityLabel;
    }
    set cancelButtonAccessibilityLabel(value) {
        this._cancelButtonAccessibilityLabel = value;
    }
    get cancelButtonAccessibilityHint() {
        return this._cancelButtonAccessibilityHint;
    }
    set cancelButtonAccessibilityHint(value) {
        this._cancelButtonAccessibilityHint = value;
    }
    get cancelButtonContentDescription() {
        return this._cancelButtonContentDescription;
    }
    set cancelButtonContentDescription(value) {
        this._cancelButtonContentDescription = value;
    }
    get barcodeAcceptedHint() {
        return this._barcodeAcceptedHint;
    }
    set barcodeAcceptedHint(value) {
        this._barcodeAcceptedHint = value;
    }
    get barcodeRejectedHint() {
        return this._barcodeRejectedHint;
    }
    set barcodeRejectedHint(value) {
        this._barcodeRejectedHint = value;
    }
}
__decorate([
    nameForSerialization('enabled')
], BarcodeCountNotInListActionSettings.prototype, "_enabled", void 0);
__decorate([
    nameForSerialization('acceptButtonText')
], BarcodeCountNotInListActionSettings.prototype, "_acceptButtonText", void 0);
__decorate([
    nameForSerialization('acceptButtonAccessibilityLabel')
], BarcodeCountNotInListActionSettings.prototype, "_acceptButtonAccessibilityLabel", void 0);
__decorate([
    nameForSerialization('acceptButtonAccessibilityHint')
], BarcodeCountNotInListActionSettings.prototype, "_acceptButtonAccessibilityHint", void 0);
__decorate([
    nameForSerialization('acceptButtonContentDescription')
], BarcodeCountNotInListActionSettings.prototype, "_acceptButtonContentDescription", void 0);
__decorate([
    nameForSerialization('rejectButtonText')
], BarcodeCountNotInListActionSettings.prototype, "_rejectButtonText", void 0);
__decorate([
    nameForSerialization('rejectButtonAccessibilityLabel')
], BarcodeCountNotInListActionSettings.prototype, "_rejectButtonAccessibilityLabel", void 0);
__decorate([
    nameForSerialization('rejectButtonAccessibilityHint')
], BarcodeCountNotInListActionSettings.prototype, "_rejectButtonAccessibilityHint", void 0);
__decorate([
    nameForSerialization('rejectButtonContentDescription')
], BarcodeCountNotInListActionSettings.prototype, "_rejectButtonContentDescription", void 0);
__decorate([
    nameForSerialization('cancelButtonText')
], BarcodeCountNotInListActionSettings.prototype, "_cancelButtonText", void 0);
__decorate([
    nameForSerialization('cancelButtonAccessibilityLabel')
], BarcodeCountNotInListActionSettings.prototype, "_cancelButtonAccessibilityLabel", void 0);
__decorate([
    nameForSerialization('cancelButtonAccessibilityHint')
], BarcodeCountNotInListActionSettings.prototype, "_cancelButtonAccessibilityHint", void 0);
__decorate([
    nameForSerialization('cancelButtonContentDescription')
], BarcodeCountNotInListActionSettings.prototype, "_cancelButtonContentDescription", void 0);
__decorate([
    nameForSerialization('barcodeAcceptedHint')
], BarcodeCountNotInListActionSettings.prototype, "_barcodeAcceptedHint", void 0);
__decorate([
    nameForSerialization('barcodeRejectedHint')
], BarcodeCountNotInListActionSettings.prototype, "_barcodeRejectedHint", void 0);

class BaseBarcodeCountView {
    static get defaultRecognizedBrush() {
        return BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.defaultRecognizedBrush;
    }
    static get defaultNotInListBrush() {
        return BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.defaultNotInListBrush;
    }
    static get defaultAcceptedBrush() {
        return BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.defaultAcceptedBrush;
    }
    static get defaultRejectedBrush() {
        return BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.defaultRejectedBrush;
    }
    static get hardwareTriggerSupported() {
        return BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.hardwareTriggerSupported;
    }
    get viewId() {
        return this._viewId;
    }
    get uiListener() {
        return this._uiListener;
    }
    set uiListener(listener) {
        this._uiListener = listener;
        this._controller.setUiListener(listener);
    }
    get listener() {
        return this._listener;
    }
    set listener(listener) {
        this._listener = listener;
        this._controller.setViewListener(listener);
    }
    get shouldDisableModeOnExitButtonTapped() {
        return this._shouldDisableModeOnExitButtonTapped;
    }
    set shouldDisableModeOnExitButtonTapped(newValue) {
        this._shouldDisableModeOnExitButtonTapped = newValue;
        this.updateNative();
    }
    get shouldShowUserGuidanceView() {
        return this._shouldShowUserGuidanceView;
    }
    set shouldShowUserGuidanceView(newValue) {
        this._shouldShowUserGuidanceView = newValue;
        this.updateNative();
    }
    get shouldShowListButton() {
        return this._shouldShowListButton;
    }
    set shouldShowListButton(newValue) {
        this._shouldShowListButton = newValue;
        this.updateNative();
    }
    get shouldShowExitButton() {
        return this._shouldShowExitButton;
    }
    set shouldShowExitButton(newValue) {
        this._shouldShowExitButton = newValue;
        this.updateNative();
    }
    get shouldShowShutterButton() {
        return this._shouldShowShutterButton;
    }
    set shouldShowShutterButton(newValue) {
        this._shouldShowShutterButton = newValue;
        this.updateNative();
    }
    get shouldShowHints() {
        return this._shouldShowHints;
    }
    set shouldShowHints(newValue) {
        this._shouldShowHints = newValue;
        this.updateNative();
    }
    get shouldShowClearHighlightsButton() {
        return this._shouldShowClearHighlightsButton;
    }
    set shouldShowClearHighlightsButton(newValue) {
        this._shouldShowClearHighlightsButton = newValue;
        this.updateNative();
    }
    get shouldShowSingleScanButton() {
        return this._shouldShowSingleScanButton;
    }
    set shouldShowSingleScanButton(newValue) {
        this._shouldShowSingleScanButton = newValue;
        this.updateNative();
    }
    get shouldShowFloatingShutterButton() {
        return this._shouldShowFloatingShutterButton;
    }
    set shouldShowFloatingShutterButton(newValue) {
        this._shouldShowFloatingShutterButton = newValue;
        this.updateNative();
    }
    get shouldShowToolbar() {
        return this._shouldShowToolbar;
    }
    set shouldShowToolbar(newValue) {
        this._shouldShowToolbar = newValue;
        this.updateNative();
    }
    get shouldShowScanAreaGuides() {
        return this._shouldShowScanAreaGuides;
    }
    set shouldShowScanAreaGuides(newValue) {
        this._shouldShowScanAreaGuides = newValue;
        this.updateNative();
    }
    get recognizedBrush() {
        return this._recognizedBrush;
    }
    set recognizedBrush(newValue) {
        this._recognizedBrush = newValue;
        this.updateNative();
    }
    get notInListBrush() {
        return this._notInListBrush;
    }
    set notInListBrush(newValue) {
        this._notInListBrush = newValue;
        this.updateNative();
    }
    get acceptedBrush() {
        return this._acceptedBrush;
    }
    set acceptedBrush(value) {
        this._acceptedBrush = value;
        this.updateNative();
    }
    get rejectedBrush() {
        return this._rejectedBrush;
    }
    set rejectedBrush(value) {
        this._rejectedBrush = value;
        this.updateNative();
    }
    get filterSettings() {
        return this._filterSettings;
    }
    set filterSettings(newValue) {
        this._filterSettings = newValue;
        this.updateNative();
    }
    get style() {
        return this._viewStyle;
    }
    get listButtonAccessibilityHint() {
        return this._listButtonAccessibilityHint;
    }
    set listButtonAccessibilityHint(newValue) {
        this._listButtonAccessibilityHint = newValue;
        this.updateNative();
    }
    get listButtonAccessibilityLabel() {
        return this._listButtonAccessibilityLabel;
    }
    set listButtonAccessibilityLabel(newValue) {
        this._listButtonAccessibilityLabel = newValue;
        this.updateNative();
    }
    get listButtonContentDescription() {
        return this._listButtonContentDescription;
    }
    set listButtonContentDescription(newValue) {
        this._listButtonContentDescription = newValue;
        this.updateNative();
    }
    get exitButtonAccessibilityHint() {
        return this._exitButtonAccessibilityHint;
    }
    set exitButtonAccessibilityHint(newValue) {
        this._exitButtonAccessibilityHint = newValue;
        this.updateNative();
    }
    get exitButtonAccessibilityLabel() {
        return this._exitButtonAccessibilityLabel;
    }
    set exitButtonAccessibilityLabel(newValue) {
        this._exitButtonAccessibilityLabel = newValue;
        this.updateNative();
    }
    get exitButtonContentDescription() {
        return this._exitButtonContentDescription;
    }
    set exitButtonContentDescription(newValue) {
        this._exitButtonContentDescription = newValue;
        this.updateNative();
    }
    get shutterButtonAccessibilityHint() {
        return this._shutterButtonAccessibilityHint;
    }
    set shutterButtonAccessibilityHint(newValue) {
        this._shutterButtonAccessibilityHint = newValue;
        this.updateNative();
    }
    get shutterButtonAccessibilityLabel() {
        return this._shutterButtonAccessibilityLabel;
    }
    set shutterButtonAccessibilityLabel(newValue) {
        this._shutterButtonAccessibilityLabel = newValue;
        this.updateNative();
    }
    get shutterButtonContentDescription() {
        return this._shutterButtonContentDescription;
    }
    set shutterButtonContentDescription(newValue) {
        this._shutterButtonContentDescription = newValue;
        this.updateNative();
    }
    get floatingShutterButtonAccessibilityHint() {
        return this._floatingShutterButtonAccessibilityHint;
    }
    set floatingShutterButtonAccessibilityHint(newValue) {
        this._floatingShutterButtonAccessibilityHint = newValue;
        this.updateNative();
    }
    get floatingShutterButtonAccessibilityLabel() {
        return this._floatingShutterButtonAccessibilityLabel;
    }
    set floatingShutterButtonAccessibilityLabel(newValue) {
        this._floatingShutterButtonAccessibilityLabel = newValue;
        this.updateNative();
    }
    get floatingShutterButtonContentDescription() {
        return this._floatingShutterButtonContentDescription;
    }
    set floatingShutterButtonContentDescription(newValue) {
        this._floatingShutterButtonContentDescription = newValue;
        this.updateNative();
    }
    get clearHighlightsButtonAccessibilityHint() {
        return this._clearHighlightsButtonAccessibilityHint;
    }
    set clearHighlightsButtonAccessibilityHint(newValue) {
        this._clearHighlightsButtonAccessibilityHint = newValue;
        this.updateNative();
    }
    get clearHighlightsButtonAccessibilityLabel() {
        return this._clearHighlightsButtonAccessibilityLabel;
    }
    set clearHighlightsButtonAccessibilityLabel(newValue) {
        this._clearHighlightsButtonAccessibilityLabel = newValue;
        this.updateNative();
    }
    get clearHighlightsButtonContentDescription() {
        return this._clearHighlightsButtonContentDescription;
    }
    set clearHighlightsButtonContentDescription(newValue) {
        this._clearHighlightsButtonContentDescription = newValue;
        this.updateNative();
    }
    get singleScanButtonAccessibilityHint() {
        return this._singleScanButtonAccessibilityHint;
    }
    set singleScanButtonAccessibilityHint(newValue) {
        this._singleScanButtonAccessibilityHint = newValue;
        this.updateNative();
    }
    get singleScanButtonAccessibilityLabel() {
        return this._singleScanButtonAccessibilityLabel;
    }
    set singleScanButtonAccessibilityLabel(newValue) {
        this._singleScanButtonAccessibilityLabel = newValue;
        this.updateNative();
    }
    get singleScanButtonContentDescription() {
        return this._singleScanButtonContentDescription;
    }
    set singleScanButtonContentDescription(newValue) {
        this._singleScanButtonContentDescription = newValue;
        this.updateNative();
    }
    get clearHighlightsButtonText() {
        return this._clearHighlightsButtonText;
    }
    set clearHighlightsButtonText(newValue) {
        this._clearHighlightsButtonText = newValue;
        this.updateNative();
    }
    get exitButtonText() {
        return this._exitButtonText;
    }
    set exitButtonText(newValue) {
        this._exitButtonText = newValue;
        this.updateNative();
    }
    get textForTapShutterToScanHint() {
        return this._textForTapShutterToScanHint;
    }
    set textForTapShutterToScanHint(newValue) {
        this._textForTapShutterToScanHint = newValue;
        this.updateNative();
    }
    get textForScanningHint() {
        return this._textForScanningHint;
    }
    set textForScanningHint(newValue) {
        this._textForScanningHint = newValue;
        this.updateNative();
    }
    get textForMoveCloserAndRescanHint() {
        return this._textForMoveCloserAndRescanHint;
    }
    set textForMoveCloserAndRescanHint(newValue) {
        this._textForMoveCloserAndRescanHint = newValue;
        this.updateNative();
    }
    get textForMoveFurtherAndRescanHint() {
        return this._textForMoveFurtherAndRescanHint;
    }
    set textForMoveFurtherAndRescanHint(newValue) {
        this._textForMoveFurtherAndRescanHint = newValue;
        this.updateNative();
    }
    get shouldShowListProgressBar() {
        return this._shouldShowListProgressBar;
    }
    set shouldShowListProgressBar(newValue) {
        this._shouldShowListProgressBar = newValue;
        this.updateNative();
    }
    get shouldShowTorchControl() {
        return this._shouldShowTorchControl;
    }
    set shouldShowTorchControl(newValue) {
        this._shouldShowTorchControl = newValue;
        this.updateNative();
    }
    get torchControlPosition() {
        return this._torchControlPosition;
    }
    set torchControlPosition(newValue) {
        this._torchControlPosition = newValue;
        this.updateNative();
    }
    get tapToUncountEnabled() {
        return this._tapToUncountEnabled;
    }
    set tapToUncountEnabled(newValue) {
        this._tapToUncountEnabled = newValue;
        this.updateNative();
    }
    get textForTapToUncountHint() {
        return this._textForTapToUncountHint;
    }
    set textForTapToUncountHint(newValue) {
        this._textForTapToUncountHint = newValue;
        this.updateNative();
    }
    get barcodeNotInListActionSettings() {
        return this._barcodeNotInListActionSettings;
    }
    set barcodeNotInListActionSettings(value) {
        this._barcodeNotInListActionSettings = value;
        this.updateNative();
    }
    get hardwareTriggerEnabled() {
        return this._hardwareTriggerEnabled;
    }
    set hardwareTriggerEnabled(newValue) {
        this._hardwareTriggerEnabled = newValue;
        this.updateNative();
    }
    static get barcodeCountDefaults() {
        return getBarcodeCountDefaults();
    }
    static withProps(props, platformView) {
        const view = new BaseBarcodeCountView({
            context: props.context,
            barcodeCount: props.barcodeCount,
            viewStyle: props.viewStyle,
            platformView: platformView
        });
        if (props.uiListener) {
            view.uiListener = props.uiListener;
        }
        if (props.listener) {
            view.listener = props.listener;
        }
        if (props.shouldDisableModeOnExitButtonTapped !== undefined) {
            view._shouldDisableModeOnExitButtonTapped = props.shouldDisableModeOnExitButtonTapped;
        }
        if (props.shouldShowUserGuidanceView !== undefined) {
            view._shouldShowUserGuidanceView = props.shouldShowUserGuidanceView;
        }
        if (props.shouldShowListButton !== undefined) {
            view._shouldShowListButton = props.shouldShowListButton;
        }
        if (props.shouldShowExitButton !== undefined) {
            view._shouldShowExitButton = props.shouldShowExitButton;
        }
        if (props.shouldShowShutterButton !== undefined) {
            view._shouldShowShutterButton = props.shouldShowShutterButton;
        }
        if (props.shouldShowHints !== undefined) {
            view._shouldShowHints = props.shouldShowHints;
        }
        if (props.shouldShowClearHighlightsButton !== undefined) {
            view._shouldShowClearHighlightsButton = props.shouldShowClearHighlightsButton;
        }
        if (props.shouldShowSingleScanButton !== undefined) {
            view._shouldShowSingleScanButton = props.shouldShowSingleScanButton;
        }
        if (props.shouldShowFloatingShutterButton !== undefined) {
            view._shouldShowFloatingShutterButton = props.shouldShowFloatingShutterButton;
        }
        if (props.shouldShowToolbar !== undefined) {
            view._shouldShowToolbar = props.shouldShowToolbar;
        }
        if (props.shouldShowScanAreaGuides !== undefined) {
            view._shouldShowScanAreaGuides = props.shouldShowScanAreaGuides;
        }
        if (props.recognizedBrush !== undefined) {
            view._recognizedBrush = props.recognizedBrush;
        }
        if (props.notInListBrush !== undefined) {
            view._notInListBrush = props.notInListBrush;
        }
        if (props.acceptedBrush !== undefined) {
            view._acceptedBrush = props.acceptedBrush;
        }
        if (props.rejectedBrush !== undefined) {
            view._rejectedBrush = props.rejectedBrush;
        }
        if (props.filterSettings !== undefined) {
            view._filterSettings = props.filterSettings;
        }
        if (props.listButtonAccessibilityHint !== undefined) {
            view._listButtonAccessibilityHint = props.listButtonAccessibilityHint;
        }
        if (props.listButtonAccessibilityLabel !== undefined) {
            view._listButtonAccessibilityLabel = props.listButtonAccessibilityLabel;
        }
        if (props.listButtonContentDescription !== undefined) {
            view._listButtonContentDescription = props.listButtonContentDescription;
        }
        if (props.exitButtonAccessibilityHint !== undefined) {
            view._exitButtonAccessibilityHint = props.exitButtonAccessibilityHint;
        }
        if (props.exitButtonAccessibilityLabel !== undefined) {
            view._exitButtonAccessibilityLabel = props.exitButtonAccessibilityLabel;
        }
        if (props.exitButtonContentDescription !== undefined) {
            view._exitButtonContentDescription = props.exitButtonContentDescription;
        }
        if (props.shutterButtonAccessibilityHint !== undefined) {
            view._shutterButtonAccessibilityHint = props.shutterButtonAccessibilityHint;
        }
        if (props.shutterButtonAccessibilityLabel !== undefined) {
            view._shutterButtonAccessibilityLabel = props.shutterButtonAccessibilityLabel;
        }
        if (props.shutterButtonContentDescription !== undefined) {
            view._shutterButtonContentDescription = props.shutterButtonContentDescription;
        }
        if (props.floatingShutterButtonAccessibilityHint !== undefined) {
            view._floatingShutterButtonAccessibilityHint = props.floatingShutterButtonAccessibilityHint;
        }
        if (props.floatingShutterButtonAccessibilityLabel !== undefined) {
            view._floatingShutterButtonAccessibilityLabel = props.floatingShutterButtonAccessibilityLabel;
        }
        if (props.floatingShutterButtonContentDescription !== undefined) {
            view._floatingShutterButtonContentDescription = props.floatingShutterButtonContentDescription;
        }
        if (props.clearHighlightsButtonAccessibilityHint !== undefined) {
            view._clearHighlightsButtonAccessibilityHint = props.clearHighlightsButtonAccessibilityHint;
        }
        if (props.clearHighlightsButtonAccessibilityLabel !== undefined) {
            view._clearHighlightsButtonAccessibilityLabel = props.clearHighlightsButtonAccessibilityLabel;
        }
        if (props.clearHighlightsButtonContentDescription !== undefined) {
            view._clearHighlightsButtonContentDescription = props.clearHighlightsButtonContentDescription;
        }
        if (props.singleScanButtonAccessibilityHint !== undefined) {
            view._singleScanButtonAccessibilityHint = props.singleScanButtonAccessibilityHint;
        }
        if (props.singleScanButtonAccessibilityLabel !== undefined) {
            view._singleScanButtonAccessibilityLabel = props.singleScanButtonAccessibilityLabel;
        }
        if (props.singleScanButtonContentDescription !== undefined) {
            view._singleScanButtonContentDescription = props.singleScanButtonContentDescription;
        }
        if (props.clearHighlightsButtonText !== undefined) {
            view._clearHighlightsButtonText = props.clearHighlightsButtonText;
        }
        if (props.exitButtonText !== undefined) {
            view._exitButtonText = props.exitButtonText;
        }
        if (props.textForTapShutterToScanHint !== undefined) {
            view._textForTapShutterToScanHint = props.textForTapShutterToScanHint;
        }
        if (props.textForScanningHint !== undefined) {
            view._textForScanningHint = props.textForScanningHint;
        }
        if (props.textForMoveCloserAndRescanHint !== undefined) {
            view._textForMoveCloserAndRescanHint = props.textForMoveCloserAndRescanHint;
        }
        if (props.textForMoveFurtherAndRescanHint !== undefined) {
            view._textForMoveFurtherAndRescanHint = props.textForMoveFurtherAndRescanHint;
        }
        if (props.shouldShowListProgressBar !== undefined) {
            view._shouldShowListProgressBar = props.shouldShowListProgressBar;
        }
        if (props.shouldShowTorchControl !== undefined) {
            view._shouldShowTorchControl = props.shouldShowTorchControl;
        }
        if (props.torchControlPosition !== undefined) {
            view._torchControlPosition = props.torchControlPosition;
        }
        if (props.tapToUncountEnabled !== undefined) {
            view._tapToUncountEnabled = props.tapToUncountEnabled;
        }
        if (props.textForTapToUncountHint !== undefined) {
            view._textForTapToUncountHint = props.textForTapToUncountHint;
        }
        if (props.barcodeNotInListActionSettings !== undefined) {
            view._barcodeNotInListActionSettings = props.barcodeNotInListActionSettings;
        }
        if (props.hardwareTriggerEnabled !== undefined) {
            view._hardwareTriggerEnabled = props.hardwareTriggerEnabled;
        }
        return view;
    }
    get context() {
        return this._context;
    }
    constructor({ context, barcodeCount, viewStyle, platformView }) {
        this._viewId = -1; // -1 means the view is not created yet
        this._uiListener = null;
        this._listener = null;
        this._shouldDisableModeOnExitButtonTapped = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.shouldDisableModeOnExitButtonTapped;
        this._shouldShowUserGuidanceView = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.shouldShowUserGuidanceView;
        this._shouldShowListButton = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.shouldShowListButton;
        this._shouldShowExitButton = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.shouldShowExitButton;
        this._shouldShowShutterButton = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.shouldShowShutterButton;
        this._shouldShowHints = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.shouldShowHints;
        this._shouldShowClearHighlightsButton = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.shouldShowClearHighlightsButton;
        this._shouldShowSingleScanButton = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.shouldShowSingleScanButton;
        this._shouldShowFloatingShutterButton = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.shouldShowFloatingShutterButton;
        this._shouldShowToolbar = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.shouldShowToolbar;
        this._shouldShowScanAreaGuides = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.shouldShowScanAreaGuides;
        this._recognizedBrush = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.defaultRecognizedBrush;
        this._notInListBrush = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.defaultNotInListBrush;
        this._acceptedBrush = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.defaultAcceptedBrush;
        this._rejectedBrush = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.defaultRejectedBrush;
        this._filterSettings = null;
        this._listButtonAccessibilityHint = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.listButtonAccessibilityHint;
        this._listButtonAccessibilityLabel = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.listButtonAccessibilityLabel;
        this._listButtonContentDescription = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.listButtonContentDescription;
        this._exitButtonAccessibilityHint = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.exitButtonAccessibilityHint;
        this._exitButtonAccessibilityLabel = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.exitButtonAccessibilityLabel;
        this._exitButtonContentDescription = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.exitButtonContentDescription;
        this._shutterButtonAccessibilityHint = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.shutterButtonAccessibilityHint;
        this._shutterButtonAccessibilityLabel = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.shutterButtonAccessibilityLabel;
        this._shutterButtonContentDescription = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.shutterButtonContentDescription;
        this._floatingShutterButtonAccessibilityHint = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.floatingShutterButtonAccessibilityHint;
        this._floatingShutterButtonAccessibilityLabel = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.floatingShutterButtonAccessibilityLabel;
        this._floatingShutterButtonContentDescription = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.floatingShutterButtonContentDescription;
        this._clearHighlightsButtonAccessibilityHint = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.clearHighlightsButtonAccessibilityHint;
        this._clearHighlightsButtonAccessibilityLabel = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.clearHighlightsButtonAccessibilityLabel;
        this._clearHighlightsButtonContentDescription = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.clearHighlightsButtonContentDescription;
        this._singleScanButtonAccessibilityHint = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.singleScanButtonAccessibilityHint;
        this._singleScanButtonAccessibilityLabel = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.singleScanButtonAccessibilityLabel;
        this._singleScanButtonContentDescription = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.singleScanButtonContentDescription;
        this._clearHighlightsButtonText = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.clearHighlightsButtonText;
        this._exitButtonText = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.exitButtonText;
        this._textForTapShutterToScanHint = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.textForTapShutterToScanHint;
        this._textForScanningHint = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.textForScanningHint;
        this._textForMoveCloserAndRescanHint = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.textForMoveCloserAndRescanHint;
        this._textForMoveFurtherAndRescanHint = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.textForMoveFurtherAndRescanHint;
        this._shouldShowListProgressBar = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.shouldShowListProgressBar;
        this._toolbarSettings = null;
        this._shouldShowTorchControl = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.shouldShowTorchControl;
        this._torchControlPosition = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.torchControlPosition;
        this._tapToUncountEnabled = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.tapToUncountEnabled;
        this._textForTapToUncountHint = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.textForTapToUncountHint;
        this._viewStyle = BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.style;
        this._barcodeNotInListActionSettings = new BarcodeCountNotInListActionSettings();
        this._hardwareTriggerEnabled = false;
        this.isViewCreated = false;
        this._viewStyle = viewStyle;
        this._context = context;
        this._barcodeCount = barcodeCount;
        this.platformView = platformView;
        barcodeCount._context = context;
        this._controller = BarcodeCountViewController.forBarcodeCountAndBarcodeCountView(this, this._barcodeCount);
    }
    dispose() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._controller.dispose();
            this.isViewCreated = false;
        });
    }
    clearHighlights() {
        return this._controller.clearHighlights();
    }
    setToolbarSettings(settings) {
        this._toolbarSettings = settings;
        this.updateNative();
    }
    setPositionAndSize(top, left, width, height, shouldBeUnderWebView) {
        return this._controller.setPositionAndSize(top, left, width, height, shouldBeUnderWebView);
    }
    show() {
        return this._controller.show();
    }
    hide() {
        return this._controller.hide();
    }
    setBrushForRecognizedBarcode(trackedBarcode, brush) {
        return this._controller.setBrushForRecognizedBarcode(trackedBarcode, brush);
    }
    setBrushForRecognizedBarcodeNotInList(trackedBarcode, brush) {
        return this._controller.setBrushForRecognizedBarcodeNotInList(trackedBarcode, brush);
    }
    setBrushForAcceptedBarcode(trackedBarcode, brush) {
        return this._controller.setBrushForAcceptedBarcode(trackedBarcode, brush);
    }
    setBrushForRejectedBarcode(trackedBarcode, brush) {
        return this._controller.setBrushForRejectedBarcode(trackedBarcode, brush);
    }
    enableHardwareTrigger(hardwareTriggerKeyCode) {
        return this._controller.enableHardwareTrigger(hardwareTriggerKeyCode);
    }
    createNativeView(viewId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isViewCreated) {
                return Promise.resolve();
            }
            this._viewId = viewId;
            yield this._controller.createNativeView();
            this.isViewCreated = true;
        });
    }
    removeNativeView() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._controller.removeNativeView();
            this.isViewCreated = false;
        });
    }
    updateNative() {
        return this._controller.update();
    }
    toJSON() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const json = {
            View: {
                viewId: this._viewId,
                style: this.style,
                shouldDisableModeOnExitButtonTapped: this.shouldDisableModeOnExitButtonTapped,
                shouldShowUserGuidanceView: this.shouldShowUserGuidanceView,
                shouldShowListButton: this.shouldShowListButton,
                shouldShowExitButton: this.shouldShowExitButton,
                shouldShowShutterButton: this.shouldShowShutterButton,
                shouldShowHints: this.shouldShowHints,
                shouldShowClearHighlightsButton: this.shouldShowClearHighlightsButton,
                shouldShowSingleScanButton: this.shouldShowSingleScanButton,
                shouldShowFloatingShutterButton: this.shouldShowFloatingShutterButton,
                shouldShowToolbar: this.shouldShowToolbar,
                shouldShowScanAreaGuides: this.shouldShowScanAreaGuides,
                toolbarSettings: (_a = this._toolbarSettings) === null || _a === void 0 ? void 0 : _a.toJSON(),
                shouldShowTorchControl: this.shouldShowTorchControl,
                torchControlPosition: this.torchControlPosition,
                tapToUncountEnabled: this.tapToUncountEnabled,
                textForTapToUncountHint: this.textForTapToUncountHint,
                barcodeNotInListActionSettings: this.barcodeNotInListActionSettings.toJSON(),
                recognizedBrush: (_b = this.recognizedBrush) === null || _b === void 0 ? void 0 : _b.toJSON(),
                notInListBrush: (_c = this.notInListBrush) === null || _c === void 0 ? void 0 : _c.toJSON(),
                acceptedBrush: (_d = this.acceptedBrush) === null || _d === void 0 ? void 0 : _d.toJSON(),
                rejectedBrush: (_e = this.rejectedBrush) === null || _e === void 0 ? void 0 : _e.toJSON(),
                hardwareTriggerEnabled: this._hardwareTriggerEnabled,
                hasUiListener: this.uiListener !== null,
                hasListener: this.listener !== null,
            },
            BarcodeCount: this._barcodeCount.toJSON()
        };
        if (this.listButtonAccessibilityHint !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.listButtonAccessibilityHint) {
            json.View.listButtonAccessibilityHint = this.listButtonAccessibilityHint; // iOS Only
        }
        if (this.listButtonAccessibilityLabel !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.listButtonAccessibilityLabel) {
            json.View.listButtonAccessibilityHint = this.listButtonAccessibilityLabel; // iOS Only
        }
        if (this.listButtonContentDescription !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.listButtonContentDescription) {
            json.View.listButtonContentDescription = this.listButtonContentDescription; // Android Only
        }
        if (this.exitButtonAccessibilityHint !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.exitButtonAccessibilityHint) {
            json.View.exitButtonAccessibilityHint = this.exitButtonAccessibilityHint; // iOS Only
        }
        if (this.exitButtonAccessibilityLabel !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.exitButtonAccessibilityLabel) {
            json.View.exitButtonAccessibilityLabel = this.exitButtonAccessibilityLabel; // iOS Only
        }
        if (this.exitButtonContentDescription !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.exitButtonContentDescription) {
            json.View.exitButtonContentDescription = this.exitButtonContentDescription; // Android Only
        }
        if (this.shutterButtonAccessibilityHint !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.shutterButtonAccessibilityHint) {
            json.View.shutterButtonAccessibilityHint = this.shutterButtonAccessibilityHint; // iOS Only
        }
        if (this.shutterButtonAccessibilityLabel !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.shutterButtonAccessibilityLabel) {
            json.View.shutterButtonAccessibilityLabel = this.shutterButtonAccessibilityLabel; // iOS Only
        }
        if (this.shutterButtonContentDescription !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.shutterButtonContentDescription) {
            json.View.shutterButtonContentDescription = this.shutterButtonContentDescription; // Android Only
        }
        if (this.floatingShutterButtonAccessibilityHint !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.floatingShutterButtonAccessibilityHint) {
            json.View.floatingShutterButtonAccessibilityHint = this.floatingShutterButtonAccessibilityHint; // iOS Only
        }
        if (this.floatingShutterButtonAccessibilityLabel !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.floatingShutterButtonAccessibilityLabel) {
            json.View.floatingShutterButtonAccessibilityLabel = this.floatingShutterButtonAccessibilityLabel; // iOS Only
        }
        if (this.floatingShutterButtonContentDescription !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.floatingShutterButtonContentDescription) {
            json.View.floatingShutterButtonContentDescription = this.floatingShutterButtonContentDescription; // Android Only
        }
        if (this.clearHighlightsButtonAccessibilityHint !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.clearHighlightsButtonAccessibilityHint) {
            json.View.clearHighlightsButtonAccessibilityHint = this.clearHighlightsButtonAccessibilityHint; // iOS Only
        }
        if (this.clearHighlightsButtonAccessibilityLabel !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.clearHighlightsButtonAccessibilityLabel) {
            json.View.clearHighlightsButtonAccessibilityLabel = this.clearHighlightsButtonAccessibilityLabel; // iOS Only
        }
        if (this.clearHighlightsButtonContentDescription !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.clearHighlightsButtonContentDescription) {
            json.View.clearHighlightsButtonContentDescription = this.clearHighlightsButtonContentDescription; // Android Only
        }
        if (this.singleScanButtonAccessibilityHint !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.singleScanButtonAccessibilityHint) {
            json.View.singleScanButtonAccessibilityHint = this.singleScanButtonAccessibilityHint; // iOS Only
        }
        if (this.singleScanButtonAccessibilityLabel !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.singleScanButtonAccessibilityLabel) {
            json.View.singleScanButtonAccessibilityLabel = this.singleScanButtonAccessibilityLabel; // iOS Only
        }
        if (this.singleScanButtonContentDescription !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.singleScanButtonContentDescription) {
            json.View.singleScanButtonContentDescription = this.singleScanButtonContentDescription; // Android Only
        }
        if (this.clearHighlightsButtonText !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.clearHighlightsButtonText) {
            json.View.clearHighlightsButtonText = this.clearHighlightsButtonText;
        }
        if (this.exitButtonText !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.exitButtonText) {
            json.View.exitButtonText = this.exitButtonText;
        }
        if (this.textForTapShutterToScanHint !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.textForTapShutterToScanHint) {
            json.View.textForTapShutterToScanHint = this.textForTapShutterToScanHint;
        }
        if (this.textForScanningHint !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.textForScanningHint) {
            json.View.textForScanningHint = this.textForScanningHint;
        }
        if (this.textForMoveCloserAndRescanHint !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.textForMoveCloserAndRescanHint) {
            json.View.textForMoveCloserAndRescanHint = this.textForMoveCloserAndRescanHint;
        }
        if (this.textForMoveFurtherAndRescanHint !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.textForMoveFurtherAndRescanHint) {
            json.View.textForMoveFurtherAndRescanHint = this.textForMoveFurtherAndRescanHint;
        }
        if (this.shouldShowListProgressBar !== BaseBarcodeCountView.barcodeCountDefaults.BarcodeCountView.shouldShowListProgressBar) {
            json.View.shouldShowListProgressBar = this.shouldShowListProgressBar;
        }
        if (this.recognizedBrush) {
            json.View.recognizedBrush = (_f = this.recognizedBrush) === null || _f === void 0 ? void 0 : _f.toJSON();
        }
        if (this.notInListBrush) {
            json.View.notInListBrush = (_g = this.notInListBrush) === null || _g === void 0 ? void 0 : _g.toJSON();
        }
        if (this.filterSettings) {
            json.View.filterSettings = (_h = this.filterSettings) === null || _h === void 0 ? void 0 : _h.toJSON();
        }
        return json;
    }
    updateWithProps(prevProps, props) {
        // Update listeners
        if (props.uiListener !== prevProps.uiListener) {
            this.uiListener = props.uiListener || null;
        }
        if (props.listener !== prevProps.listener) {
            this.listener = props.listener || null;
        }
        // Update boolean flags
        if (props.shouldDisableModeOnExitButtonTapped !== prevProps.shouldDisableModeOnExitButtonTapped &&
            props.shouldDisableModeOnExitButtonTapped !== undefined) {
            this.shouldDisableModeOnExitButtonTapped = props.shouldDisableModeOnExitButtonTapped;
        }
        if (props.shouldShowUserGuidanceView !== prevProps.shouldShowUserGuidanceView &&
            props.shouldShowUserGuidanceView !== undefined) {
            this.shouldShowUserGuidanceView = props.shouldShowUserGuidanceView;
        }
        if (props.shouldShowListButton !== prevProps.shouldShowListButton &&
            props.shouldShowListButton !== undefined) {
            this.shouldShowListButton = props.shouldShowListButton;
        }
        if (props.shouldShowExitButton !== prevProps.shouldShowExitButton &&
            props.shouldShowExitButton !== undefined) {
            this.shouldShowExitButton = props.shouldShowExitButton;
        }
        if (props.shouldShowShutterButton !== prevProps.shouldShowShutterButton &&
            props.shouldShowShutterButton !== undefined) {
            this.shouldShowShutterButton = props.shouldShowShutterButton;
        }
        if (props.shouldShowHints !== prevProps.shouldShowHints &&
            props.shouldShowHints !== undefined) {
            this.shouldShowHints = props.shouldShowHints;
        }
        if (props.shouldShowClearHighlightsButton !== prevProps.shouldShowClearHighlightsButton &&
            props.shouldShowClearHighlightsButton !== undefined) {
            this.shouldShowClearHighlightsButton = props.shouldShowClearHighlightsButton;
        }
        if (props.shouldShowSingleScanButton !== prevProps.shouldShowSingleScanButton &&
            props.shouldShowSingleScanButton !== undefined) {
            this.shouldShowSingleScanButton = props.shouldShowSingleScanButton;
        }
        if (props.shouldShowFloatingShutterButton !== prevProps.shouldShowFloatingShutterButton &&
            props.shouldShowFloatingShutterButton !== undefined) {
            this.shouldShowFloatingShutterButton = props.shouldShowFloatingShutterButton;
        }
        if (props.shouldShowToolbar !== prevProps.shouldShowToolbar &&
            props.shouldShowToolbar !== undefined) {
            this.shouldShowToolbar = props.shouldShowToolbar;
        }
        if (props.shouldShowScanAreaGuides !== prevProps.shouldShowScanAreaGuides &&
            props.shouldShowScanAreaGuides !== undefined) {
            this.shouldShowScanAreaGuides = props.shouldShowScanAreaGuides;
        }
        if (props.shouldShowListProgressBar !== prevProps.shouldShowListProgressBar &&
            props.shouldShowListProgressBar !== undefined) {
            this.shouldShowListProgressBar = props.shouldShowListProgressBar;
        }
        if (props.shouldShowTorchControl !== prevProps.shouldShowTorchControl &&
            props.shouldShowTorchControl !== undefined) {
            this.shouldShowTorchControl = props.shouldShowTorchControl;
        }
        if (props.tapToUncountEnabled !== prevProps.tapToUncountEnabled &&
            props.tapToUncountEnabled !== undefined) {
            this.tapToUncountEnabled = props.tapToUncountEnabled;
        }
        if (props.hardwareTriggerEnabled !== prevProps.hardwareTriggerEnabled &&
            props.hardwareTriggerEnabled !== undefined) {
            this.hardwareTriggerEnabled = props.hardwareTriggerEnabled;
        }
        // Update brushes
        if (props.recognizedBrush !== prevProps.recognizedBrush &&
            props.recognizedBrush !== undefined) {
            this.recognizedBrush = props.recognizedBrush;
        }
        if (props.notInListBrush !== prevProps.notInListBrush &&
            props.notInListBrush !== undefined) {
            this.notInListBrush = props.notInListBrush;
        }
        if (props.acceptedBrush !== prevProps.acceptedBrush &&
            props.acceptedBrush !== undefined) {
            this.acceptedBrush = props.acceptedBrush;
        }
        if (props.rejectedBrush !== prevProps.rejectedBrush &&
            props.rejectedBrush !== undefined) {
            this.rejectedBrush = props.rejectedBrush;
        }
        // Update filter settings
        if (props.filterSettings !== prevProps.filterSettings &&
            props.filterSettings !== undefined) {
            this.filterSettings = props.filterSettings;
        }
        // Update accessibility hints, labels and descriptions
        if (props.listButtonAccessibilityHint !== prevProps.listButtonAccessibilityHint &&
            props.listButtonAccessibilityHint !== undefined) {
            this.listButtonAccessibilityHint = props.listButtonAccessibilityHint;
        }
        if (props.listButtonAccessibilityLabel !== prevProps.listButtonAccessibilityLabel &&
            props.listButtonAccessibilityLabel !== undefined) {
            this.listButtonAccessibilityLabel = props.listButtonAccessibilityLabel;
        }
        if (props.listButtonContentDescription !== prevProps.listButtonContentDescription &&
            props.listButtonContentDescription !== undefined) {
            this.listButtonContentDescription = props.listButtonContentDescription;
        }
        if (props.exitButtonAccessibilityHint !== prevProps.exitButtonAccessibilityHint &&
            props.exitButtonAccessibilityHint !== undefined) {
            this.exitButtonAccessibilityHint = props.exitButtonAccessibilityHint;
        }
        if (props.exitButtonAccessibilityLabel !== prevProps.exitButtonAccessibilityLabel &&
            props.exitButtonAccessibilityLabel !== undefined) {
            this.exitButtonAccessibilityLabel = props.exitButtonAccessibilityLabel;
        }
        if (props.exitButtonContentDescription !== prevProps.exitButtonContentDescription &&
            props.exitButtonContentDescription !== undefined) {
            this.exitButtonContentDescription = props.exitButtonContentDescription;
        }
        if (props.shutterButtonAccessibilityHint !== prevProps.shutterButtonAccessibilityHint &&
            props.shutterButtonAccessibilityHint !== undefined) {
            this.shutterButtonAccessibilityHint = props.shutterButtonAccessibilityHint;
        }
        if (props.shutterButtonAccessibilityLabel !== prevProps.shutterButtonAccessibilityLabel &&
            props.shutterButtonAccessibilityLabel !== undefined) {
            this.shutterButtonAccessibilityLabel = props.shutterButtonAccessibilityLabel;
        }
        if (props.shutterButtonContentDescription !== prevProps.shutterButtonContentDescription &&
            props.shutterButtonContentDescription !== undefined) {
            this.shutterButtonContentDescription = props.shutterButtonContentDescription;
        }
        if (props.floatingShutterButtonAccessibilityHint !== prevProps.floatingShutterButtonAccessibilityHint &&
            props.floatingShutterButtonAccessibilityHint !== undefined) {
            this.floatingShutterButtonAccessibilityHint = props.floatingShutterButtonAccessibilityHint;
        }
        if (props.floatingShutterButtonAccessibilityLabel !== prevProps.floatingShutterButtonAccessibilityLabel &&
            props.floatingShutterButtonAccessibilityLabel !== undefined) {
            this.floatingShutterButtonAccessibilityLabel = props.floatingShutterButtonAccessibilityLabel;
        }
        if (props.floatingShutterButtonContentDescription !== prevProps.floatingShutterButtonContentDescription &&
            props.floatingShutterButtonContentDescription !== undefined) {
            this.floatingShutterButtonContentDescription = props.floatingShutterButtonContentDescription;
        }
        if (props.clearHighlightsButtonAccessibilityHint !== prevProps.clearHighlightsButtonAccessibilityHint &&
            props.clearHighlightsButtonAccessibilityHint !== undefined) {
            this.clearHighlightsButtonAccessibilityHint = props.clearHighlightsButtonAccessibilityHint;
        }
        if (props.clearHighlightsButtonAccessibilityLabel !== prevProps.clearHighlightsButtonAccessibilityLabel &&
            props.clearHighlightsButtonAccessibilityLabel !== undefined) {
            this.clearHighlightsButtonAccessibilityLabel = props.clearHighlightsButtonAccessibilityLabel;
        }
        if (props.clearHighlightsButtonContentDescription !== prevProps.clearHighlightsButtonContentDescription &&
            props.clearHighlightsButtonContentDescription !== undefined) {
            this.clearHighlightsButtonContentDescription = props.clearHighlightsButtonContentDescription;
        }
        if (props.singleScanButtonAccessibilityHint !== prevProps.singleScanButtonAccessibilityHint &&
            props.singleScanButtonAccessibilityHint !== undefined) {
            this.singleScanButtonAccessibilityHint = props.singleScanButtonAccessibilityHint;
        }
        if (props.singleScanButtonAccessibilityLabel !== prevProps.singleScanButtonAccessibilityLabel &&
            props.singleScanButtonAccessibilityLabel !== undefined) {
            this.singleScanButtonAccessibilityLabel = props.singleScanButtonAccessibilityLabel;
        }
        if (props.singleScanButtonContentDescription !== prevProps.singleScanButtonContentDescription &&
            props.singleScanButtonContentDescription !== undefined) {
            this.singleScanButtonContentDescription = props.singleScanButtonContentDescription;
        }
        // Update text labels
        if (props.clearHighlightsButtonText !== prevProps.clearHighlightsButtonText &&
            props.clearHighlightsButtonText !== undefined) {
            this.clearHighlightsButtonText = props.clearHighlightsButtonText;
        }
        if (props.exitButtonText !== prevProps.exitButtonText &&
            props.exitButtonText !== undefined) {
            this.exitButtonText = props.exitButtonText;
        }
        if (props.textForTapShutterToScanHint !== prevProps.textForTapShutterToScanHint &&
            props.textForTapShutterToScanHint !== undefined) {
            this.textForTapShutterToScanHint = props.textForTapShutterToScanHint;
        }
        if (props.textForScanningHint !== prevProps.textForScanningHint &&
            props.textForScanningHint !== undefined) {
            this.textForScanningHint = props.textForScanningHint;
        }
        if (props.textForMoveCloserAndRescanHint !== prevProps.textForMoveCloserAndRescanHint &&
            props.textForMoveCloserAndRescanHint !== undefined) {
            this.textForMoveCloserAndRescanHint = props.textForMoveCloserAndRescanHint;
        }
        if (props.textForMoveFurtherAndRescanHint !== prevProps.textForMoveFurtherAndRescanHint &&
            props.textForMoveFurtherAndRescanHint !== undefined) {
            this.textForMoveFurtherAndRescanHint = props.textForMoveFurtherAndRescanHint;
        }
        if (props.textForTapToUncountHint !== prevProps.textForTapToUncountHint &&
            props.textForTapToUncountHint !== undefined) {
            this.textForTapToUncountHint = props.textForTapToUncountHint;
        }
        // Update other objects
        if (props.torchControlPosition !== prevProps.torchControlPosition &&
            props.torchControlPosition !== undefined) {
            this.torchControlPosition = props.torchControlPosition;
        }
        if (props.barcodeNotInListActionSettings !== prevProps.barcodeNotInListActionSettings &&
            props.barcodeNotInListActionSettings !== undefined) {
            this.barcodeNotInListActionSettings = props.barcodeNotInListActionSettings;
        }
        if (props.viewStyle !== prevProps.viewStyle) {
            this._viewStyle = props.viewStyle;
            this.updateNative();
        }
    }
}
__decorate([
    ignoreFromSerialization
], BaseBarcodeCountView.prototype, "isViewCreated", void 0);
__decorate([
    ignoreFromSerialization
], BaseBarcodeCountView, "barcodeCountDefaults", null);

class BarcodeFilterHighlightSettingsBrush extends DefaultSerializeable {
    static create(brush) {
        return new BarcodeFilterHighlightSettingsBrush(brush);
    }
    constructor(brush) {
        super();
        this._brush = null;
        this._highlightType = BarcodeFilterHighlightType.Brush;
        this._brush = brush;
    }
    get highlightType() {
        return this._highlightType;
    }
    get brush() {
        return this._brush;
    }
}
__decorate([
    nameForSerialization('highlightType')
], BarcodeFilterHighlightSettingsBrush.prototype, "_highlightType", void 0);
__decorate([
    nameForSerialization('brush')
], BarcodeFilterHighlightSettingsBrush.prototype, "_brush", void 0);

var BarcodeBatchBasicOverlayStyle;
(function (BarcodeBatchBasicOverlayStyle) {
    BarcodeBatchBasicOverlayStyle["Frame"] = "frame";
    BarcodeBatchBasicOverlayStyle["Dot"] = "dot";
})(BarcodeBatchBasicOverlayStyle || (BarcodeBatchBasicOverlayStyle = {}));

class BarcodeBatchSession {
    get addedTrackedBarcodes() {
        return this._addedTrackedBarcodes;
    }
    get removedTrackedBarcodes() {
        return this._removedTrackedBarcodes;
    }
    get updatedTrackedBarcodes() {
        return this._updatedTrackedBarcodes;
    }
    get trackedBarcodes() {
        return this._trackedBarcodes;
    }
    get frameSequenceID() {
        return this._frameSequenceID;
    }
    static fromJSON(json) {
        var _a;
        const sessionJson = JSON.parse(json.session);
        const session = new BarcodeBatchSession();
        session._frameSequenceID = sessionJson.frameSequenceId;
        session._addedTrackedBarcodes = sessionJson.addedTrackedBarcodes
            .map((trackedBarcodeJSON) => {
            return TrackedBarcode
                .fromJSON(trackedBarcodeJSON, sessionJson.frameSequenceId);
        });
        session._removedTrackedBarcodes = sessionJson.removedTrackedBarcodes;
        session._updatedTrackedBarcodes = sessionJson.updatedTrackedBarcodes
            .map((trackedBarcodeJSON) => {
            return TrackedBarcode
                .fromJSON(trackedBarcodeJSON, sessionJson.frameSequenceId);
        });
        session._trackedBarcodes = Object.keys(sessionJson.trackedBarcodes)
            .reduce((trackedBarcodes, identifier) => {
            trackedBarcodes[identifier] = TrackedBarcode
                .fromJSON(sessionJson.trackedBarcodes[identifier], sessionJson.frameSequenceId);
            return trackedBarcodes;
        }, {});
        session.frameId = (_a = json.frameId) !== null && _a !== void 0 ? _a : '';
        return session;
    }
    reset() {
        return this.listenerController.resetSession();
    }
}

var BarcodeBatchListenerEvents;
(function (BarcodeBatchListenerEvents) {
    BarcodeBatchListenerEvents["didUpdateSession"] = "BarcodeBatchListener.didUpdateSession";
})(BarcodeBatchListenerEvents || (BarcodeBatchListenerEvents = {}));
class BarcodeBatchListenerController extends BaseNewController {
    constructor(barcodeBatch) {
        super('BarcodeBatchListenerProxy');
        this.hasListeners = false;
        this.handleDidUpdateSessionEventWrapper = (ev) => __awaiter(this, void 0, void 0, function* () {
            return this.handleDidUpdateSessionEvent(ev);
        });
        this.mode = barcodeBatch;
        this._proxy.isModeEnabled = () => barcodeBatch.isEnabled;
        this.initialize();
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.mode.listeners.length > 0) {
                this.subscribeListener();
            }
        });
    }
    resetSession() {
        return this._proxy.$resetBarcodeBatchSession();
    }
    subscribeListener() {
        if (this.hasListeners) {
            return;
        }
        this._proxy.subscribeForEvents(Object.values(BarcodeBatchListenerEvents));
        this._proxy.$registerBarcodeBatchListenerForEvents({ modeId: this.mode.modeId });
        this._proxy.eventEmitter.on(BarcodeBatchListenerEvents.didUpdateSession, this.handleDidUpdateSessionEventWrapper);
        this.hasListeners = true;
    }
    unsubscribeListener() {
        if (!this.hasListeners) {
            return;
        }
        this._proxy.$unregisterBarcodeBatchListenerForEvents({ modeId: this.mode.modeId });
        this._proxy.unsubscribeFromEvents(Object.values(BarcodeBatchListenerEvents));
        this._proxy.eventEmitter.off(BarcodeBatchListenerEvents.didUpdateSession, this.handleDidUpdateSessionEventWrapper);
        this.hasListeners = false;
    }
    dispose() {
        this.unsubscribeListener();
        this._proxy.dispose();
    }
    setModeEnabledState(enabled) {
        this._proxy.$setBarcodeBatchModeEnabledState({ modeId: this.mode.modeId, enabled });
    }
    updateBarcodeBatchMode() {
        return this._proxy.$updateBarcodeBatchMode({ modeJson: JSON.stringify(this.mode.toJSON()) });
    }
    applyBarcodeBatchModeSettings(newSettings) {
        return this._proxy.$applyBarcodeBatchModeSettings({ modeId: this.mode.modeId, modeSettingsJson: JSON.stringify(newSettings.toJSON()) });
    }
    handleDidUpdateSessionEvent(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                console.error('BarcodeBatchListenerController didUpdateSession payload is null');
                return;
            }
            if (payload.modeId !== this.mode.modeId) {
                return;
            }
            const session = BarcodeBatchSession.fromJSON(payload);
            yield this.notifyListenersOfDidUpdateSession(session);
            this._proxy.$finishBarcodeBatchDidUpdateSessionCallback({ modeId: this.mode.modeId, enabled: this.mode.isEnabled });
        });
    }
    notifyListenersOfDidUpdateSession(session) {
        return __awaiter(this, void 0, void 0, function* () {
            const mode = this.mode;
            for (const listener of mode.listeners) {
                if (listener.didUpdateSession) {
                    yield listener.didUpdateSession(this.mode, session, () => CameraController.getFrame(session.frameId));
                }
            }
        });
    }
}

class BarcodeBatch extends DefaultSerializeable {
    get isEnabled() {
        return this._isEnabled;
    }
    set isEnabled(isEnabled) {
        var _a;
        this._isEnabled = isEnabled;
        (_a = this.controller) === null || _a === void 0 ? void 0 : _a.setModeEnabledState(isEnabled);
    }
    get context() {
        return this._context;
    }
    static createRecommendedCameraSettings() {
        return new CameraSettings(BarcodeBatch.barcodeBatchDefaults.RecommendedCameraSettings);
    }
    get _context() {
        return this.privateContext;
    }
    set _context(newContext) {
        var _a, _b;
        if (newContext == null) {
            (_a = this.controller) === null || _a === void 0 ? void 0 : _a.dispose();
            this.controller = null;
            this.privateContext = null;
            return;
        }
        this.privateContext = newContext;
        (_b = this.controller) !== null && _b !== void 0 ? _b : (this.controller = new BarcodeBatchListenerController(this));
    }
    static get barcodeBatchDefaults() {
        return getBarcodeBatchDefaults();
    }
    constructor(settings) {
        super();
        this.type = 'barcodeTracking';
        this.modeId = Math.floor(Math.random() * 1000000);
        this._isEnabled = true;
        this.privateContext = null;
        this.parentId = null;
        this.listeners = [];
        this.hasListeners = false;
        this.controller = null;
        this.settings = settings;
    }
    applySettings(settings) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            this.settings = settings;
            return (_a = this.controller) === null || _a === void 0 ? void 0 : _a.applyBarcodeBatchModeSettings(settings);
        });
    }
    addListener(listener) {
        var _a;
        if (this.listeners.includes(listener)) {
            return;
        }
        if (this.listeners.length === 0) {
            (_a = this.controller) === null || _a === void 0 ? void 0 : _a.subscribeListener();
        }
        this.listeners.push(listener);
        this.hasListeners = this.listeners.length > 0;
    }
    removeListener(listener) {
        var _a;
        if (!this.listeners.includes(listener)) {
            return;
        }
        this.listeners.splice(this.listeners.indexOf(listener), 1);
        this.hasListeners = this.listeners.length > 0;
        if (!this.hasListeners) {
            (_a = this.controller) === null || _a === void 0 ? void 0 : _a.unsubscribeListener();
        }
    }
    reset() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            return (_a = this.controller) === null || _a === void 0 ? void 0 : _a.resetSession();
        });
    }
}
__decorate([
    nameForSerialization('enabled')
], BarcodeBatch.prototype, "_isEnabled", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeBatch.prototype, "privateContext", void 0);
__decorate([
    nameForSerialization('parentId'),
    ignoreFromSerializationIfNull
], BarcodeBatch.prototype, "parentId", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeBatch.prototype, "listeners", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeBatch.prototype, "controller", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeBatch, "barcodeBatchDefaults", null);

var BarcodeBatchAdvancedOverlayListenerEvents;
(function (BarcodeBatchAdvancedOverlayListenerEvents) {
    BarcodeBatchAdvancedOverlayListenerEvents["didTapViewForTrackedBarcode"] = "BarcodeBatchAdvancedOverlayListener.didTapViewForTrackedBarcode";
    BarcodeBatchAdvancedOverlayListenerEvents["viewForTrackedBarcode"] = "BarcodeBatchAdvancedOverlayListener.viewForTrackedBarcode";
    BarcodeBatchAdvancedOverlayListenerEvents["anchorForTrackedBarcode"] = "BarcodeBatchAdvancedOverlayListener.anchorForTrackedBarcode";
    BarcodeBatchAdvancedOverlayListenerEvents["offsetForTrackedBarcode"] = "BarcodeBatchAdvancedOverlayListener.offsetForTrackedBarcode";
})(BarcodeBatchAdvancedOverlayListenerEvents || (BarcodeBatchAdvancedOverlayListenerEvents = {}));
class BarcodeBatchAdvancedOverlayController extends BaseNewController {
    constructor(overlay) {
        super('BarcodeBatchAdvancedOverlayProxy');
        this.hasListeners = false;
        this.handleViewForTrackedBarcodeWrapper = (ev) => __awaiter(this, void 0, void 0, function* () {
            return this.handleViewForTrackedBarcode(ev);
        });
        this.handleAnchorForTrackedBarcodeWrapper = (ev) => __awaiter(this, void 0, void 0, function* () {
            return this.handleAnchorForTrackedBarcode(ev);
        });
        this.handleOffsetForTrackedBarcodeWrapper = (ev) => __awaiter(this, void 0, void 0, function* () {
            return this.handleOffsetForTrackedBarcode(ev);
        });
        this.handleDidTapViewForTrackedBarcodeWrapper = (ev) => __awaiter(this, void 0, void 0, function* () {
            return this.handleDidTapViewForTrackedBarcode(ev);
        });
        this.overlay = overlay;
        this.initialize();
    }
    initialize() {
        if (this.overlay.listener != null) {
            this.subscribeListener();
        }
    }
    setBrushForTrackedBarcode(brush, trackedBarcode) {
        return this._proxy.$setBrushForTrackedBarcode({
            dataCaptureViewId: this.dataCaptureViewId,
            brushJson: JSON.stringify(brush.toJSON()),
            sessionFrameSequenceID: trackedBarcode.sessionFrameSequenceID,
            trackedBarcodeIdentifier: trackedBarcode.identifier,
        });
    }
    setViewForTrackedBarcode(view, trackedBarcode) {
        return __awaiter(this, void 0, void 0, function* () {
            const awitedView = yield view;
            const viewJson = this.getJSONStringForView(awitedView);
            return this._proxy.$setViewForTrackedBarcode({
                dataCaptureViewId: this.dataCaptureViewId,
                viewJson,
                trackedBarcodeIdentifier: trackedBarcode.identifier,
                sessionFrameSequenceID: trackedBarcode.sessionFrameSequenceID
            });
        });
    }
    updateSizeOfTrackedBarcodeView(trackedBarcodeIdentifier, width, height) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._proxy.$updateSizeOfTrackedBarcodeView({
                dataCaptureViewId: this.dataCaptureViewId,
                trackedBarcodeIdentifier,
                width,
                height
            });
        });
    }
    getJSONStringForView(view) {
        if (view == null) {
            return null;
        }
        // If view doesn't have moduleName, just return it. If it does have moduleName, we process it further for React Native
        if (view.moduleName === undefined) {
            return view;
        }
        if (!this.isSerializeable(view.props)) {
            // react-navigation does something like this: https://reactnavigation.org/docs/troubleshooting/#i-get-the-warning-non-serializable-values-were-found-in-the-navigation-state
            throw new Error('Non-serializable values were found in the view passed passed to a BarcodeBatchAdvancedOverlay, which can break usage. This might happen if you have non-serializable values such as function, class instances etc. in the props for the view component that you are passing.');
        }
        const viewJSON = {
            moduleName: view.moduleName,
            initialProperties: view.props,
        };
        return JSON.stringify(viewJSON);
    }
    isSerializeable(o) {
        if (o === undefined || o === null ||
            typeof o === 'boolean' || typeof o === 'number' || typeof o === 'string') {
            return true;
        }
        if (Object.prototype.toString.call(o) !== '[object Object]' &&
            !Array.isArray(o)) {
            return false;
        }
        if (Array.isArray(o)) {
            for (const it of o) {
                if (!this.isSerializeable(it)) {
                    return false;
                }
            }
        }
        else {
            for (const key in o) {
                if (!this.isSerializeable(o[key])) {
                    return false;
                }
            }
        }
        return true;
    }
    setAnchorForTrackedBarcode(anchor, trackedBarcode) {
        return this._proxy.$setAnchorForTrackedBarcode({
            dataCaptureViewId: this.dataCaptureViewId,
            anchor,
            trackedBarcodeIdentifier: trackedBarcode.identifier,
            sessionFrameSequenceID: trackedBarcode.sessionFrameSequenceID
        });
    }
    setOffsetForTrackedBarcode(offset, trackedBarcode) {
        return this._proxy.$setOffsetForTrackedBarcode({
            dataCaptureViewId: this.dataCaptureViewId,
            offsetJson: JSON.stringify(offset.toJSON()),
            trackedBarcodeIdentifier: trackedBarcode.identifier,
            sessionFrameSequenceID: trackedBarcode.sessionFrameSequenceID
        });
    }
    clearTrackedBarcodeViews() {
        return this._proxy.$clearTrackedBarcodeViews({ dataCaptureViewId: this.dataCaptureViewId });
    }
    updateBarcodeBatchAdvancedOverlay() {
        return this._proxy.$updateBarcodeBatchAdvancedOverlay({
            dataCaptureViewId: this.dataCaptureViewId,
            overlayJson: JSON.stringify(this.overlay.toJSON())
        });
    }
    subscribeListener() {
        if (this.hasListeners) {
            return;
        }
        if (this.dataCaptureViewId !== -1) {
            this._proxy.$registerListenerForAdvancedOverlayEvents({ dataCaptureViewId: this.dataCaptureViewId });
        }
        this._proxy.subscribeForEvents(Object.values(BarcodeBatchAdvancedOverlayListenerEvents));
        this._proxy.eventEmitter.on(BarcodeBatchAdvancedOverlayListenerEvents.viewForTrackedBarcode, this.handleViewForTrackedBarcodeWrapper);
        this._proxy.eventEmitter.on(BarcodeBatchAdvancedOverlayListenerEvents.anchorForTrackedBarcode, this.handleAnchorForTrackedBarcodeWrapper);
        this._proxy.eventEmitter.on(BarcodeBatchAdvancedOverlayListenerEvents.offsetForTrackedBarcode, this.handleOffsetForTrackedBarcodeWrapper);
        this._proxy.eventEmitter.on(BarcodeBatchAdvancedOverlayListenerEvents.didTapViewForTrackedBarcode, this.handleDidTapViewForTrackedBarcodeWrapper);
        this.hasListeners = true;
    }
    handleViewForTrackedBarcode(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                console.error('BarcodeBatchAdvancedOverlayController viewForTrackedBarcode payload is null');
                return;
            }
            const trackedBarcode = TrackedBarcode
                .fromJSON(JSON.parse(payload.trackedBarcode));
            if (this.overlay.listener && this.overlay.listener.viewForTrackedBarcode) {
                const view = yield this.overlay.listener.viewForTrackedBarcode(this.overlay, trackedBarcode);
                this._proxy.$setViewForTrackedBarcode({
                    dataCaptureViewId: this.dataCaptureViewId,
                    viewJson: this.getJSONStringForView(view),
                    trackedBarcodeIdentifier: trackedBarcode.identifier,
                    sessionFrameSequenceID: trackedBarcode.sessionFrameSequenceID
                });
            }
        });
    }
    handleAnchorForTrackedBarcode(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                console.error('BarcodeBatchAdvancedOverlayController anchorForTrackedBarcode payload is null');
                return;
            }
            const trackedBarcode = TrackedBarcode
                .fromJSON(JSON.parse(payload.trackedBarcode));
            if (this.overlay.listener && this.overlay.listener.anchorForTrackedBarcode) {
                const anchor = this.overlay.listener.anchorForTrackedBarcode(this.overlay, trackedBarcode);
                this.setAnchorForTrackedBarcode(anchor, trackedBarcode);
            }
        });
    }
    handleOffsetForTrackedBarcode(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                console.error('BarcodeBatchAdvancedOverlayController offsetForTrackedBarcode payload is null');
                return;
            }
            const trackedBarcode = TrackedBarcode
                .fromJSON(JSON.parse(payload.trackedBarcode));
            if (this.overlay.listener && this.overlay.listener.offsetForTrackedBarcode) {
                const offset = this.overlay.listener.offsetForTrackedBarcode(this.overlay, trackedBarcode);
                this.setOffsetForTrackedBarcode(offset, trackedBarcode);
            }
        });
    }
    handleDidTapViewForTrackedBarcode(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                console.error('BarcodeBatchAdvancedOverlayController didTapViewForTrackedBarcode payload is null');
                return;
            }
            const trackedBarcode = TrackedBarcode
                .fromJSON(JSON.parse(payload.trackedBarcode));
            (_b = (_a = this.overlay.listener) === null || _a === void 0 ? void 0 : _a.didTapViewForTrackedBarcode) === null || _b === void 0 ? void 0 : _b.call(_a, this.overlay, trackedBarcode);
        });
    }
    unsubscribeListener() {
        if (!this.hasListeners) {
            return;
        }
        this._proxy.$unregisterListenerForAdvancedOverlayEvents({ dataCaptureViewId: this.dataCaptureViewId });
        this._proxy.unsubscribeFromEvents(Object.values(BarcodeBatchAdvancedOverlayListenerEvents));
        this._proxy.eventEmitter.off(BarcodeBatchAdvancedOverlayListenerEvents.viewForTrackedBarcode, this.handleViewForTrackedBarcodeWrapper);
        this._proxy.eventEmitter.off(BarcodeBatchAdvancedOverlayListenerEvents.anchorForTrackedBarcode, this.handleAnchorForTrackedBarcodeWrapper);
        this._proxy.eventEmitter.off(BarcodeBatchAdvancedOverlayListenerEvents.offsetForTrackedBarcode, this.handleOffsetForTrackedBarcodeWrapper);
        this._proxy.eventEmitter.off(BarcodeBatchAdvancedOverlayListenerEvents.didTapViewForTrackedBarcode, this.handleDidTapViewForTrackedBarcodeWrapper);
        this.hasListeners = false;
    }
    get dataCaptureViewId() {
        var _a, _b;
        return (_b = (_a = this.overlay.view) === null || _a === void 0 ? void 0 : _a.viewId) !== null && _b !== void 0 ? _b : -1;
    }
    dispose() {
        this.unsubscribeListener();
        this._proxy.eventEmitter.removeAllListeners();
        this._proxy.dispose();
    }
}

var BarcodeBatchBasicOverlayListenerEvents;
(function (BarcodeBatchBasicOverlayListenerEvents) {
    BarcodeBatchBasicOverlayListenerEvents["brushForTrackedBarcode"] = "BarcodeBatchBasicOverlayListener.brushForTrackedBarcode";
    BarcodeBatchBasicOverlayListenerEvents["didTapTrackedBarcode"] = "BarcodeBatchBasicOverlayListener.didTapTrackedBarcode";
})(BarcodeBatchBasicOverlayListenerEvents || (BarcodeBatchBasicOverlayListenerEvents = {}));
class BarcodeBatchBasicOverlayController extends BaseNewController {
    constructor(overlay) {
        super('BarcodeBatchBasicOverlayProxy');
        this.hasListeners = false;
        this.handleBrushForTrackedBarcodeWrapper = (ev) => __awaiter(this, void 0, void 0, function* () {
            return this.handleBrushForTrackedBarcode(ev);
        });
        this.handleDidTapTrackedBarcodeWrapper = (ev) => __awaiter(this, void 0, void 0, function* () {
            return this.handleDidTapTrackedBarcode(ev);
        });
        this.overlay = overlay;
        this.initialize();
    }
    initialize() {
        if (this.overlay.listener != null) {
            this.subscribeListener();
        }
    }
    setBrushForTrackedBarcode(brush, trackedBarcode) {
        return this._proxy.$setBrushForTrackedBarcode({
            dataCaptureViewId: this.dataCaptureViewId,
            brushJson: brush ? JSON.stringify(brush.toJSON()) : null,
            trackedBarcodeIdentifier: trackedBarcode.identifier,
            sessionFrameSequenceID: trackedBarcode.sessionFrameSequenceID
        });
    }
    clearTrackedBarcodeBrushes() {
        return this._proxy.$clearTrackedBarcodeBrushes();
    }
    updateBarcodeBatchBasicOverlay() {
        return this._proxy.$updateBarcodeBatchBasicOverlay({
            dataCaptureViewId: this.dataCaptureViewId,
            overlayJson: JSON.stringify(this.overlay.toJSON())
        });
    }
    subscribeListener() {
        if (this.hasListeners) {
            return;
        }
        if (this.dataCaptureViewId !== -1) {
            this._proxy.$registerListenerForBasicOverlayEvents({ dataCaptureViewId: this.dataCaptureViewId });
        }
        this._proxy.subscribeForEvents(Object.values(BarcodeBatchBasicOverlayListenerEvents));
        this._proxy.eventEmitter.on(BarcodeBatchBasicOverlayListenerEvents.brushForTrackedBarcode, this.handleBrushForTrackedBarcodeWrapper);
        this._proxy.eventEmitter.on(BarcodeBatchBasicOverlayListenerEvents.didTapTrackedBarcode, this.handleDidTapTrackedBarcodeWrapper);
        this.hasListeners = true;
    }
    handleBrushForTrackedBarcode(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                console.error('BarcodeBatchBasicOverlayController brushForTrackedBarcode payload is null');
                return;
            }
            const trackedBarcode = TrackedBarcode.fromJSON(JSON.parse(payload.trackedBarcode));
            let brush = this.overlay.brush;
            if (this.overlay.listener && this.overlay.listener.brushForTrackedBarcode) {
                brush = this.overlay.listener.brushForTrackedBarcode(this.overlay, trackedBarcode);
                this.setBrushForTrackedBarcode(brush, trackedBarcode);
            }
        });
    }
    handleDidTapTrackedBarcode(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                console.error('BarcodeBatchBasicOverlayController didTapTrackedBarcode payload is null');
                return;
            }
            const trackedBarcode = TrackedBarcode.fromJSON(JSON.parse(payload.trackedBarcode));
            if (this.overlay.listener && this.overlay.listener.didTapTrackedBarcode) {
                this.overlay.listener.didTapTrackedBarcode(this.overlay, trackedBarcode);
            }
        });
    }
    unsubscribeListener() {
        if (!this.hasListeners) {
            return;
        }
        this._proxy.$unregisterListenerForBasicOverlayEvents({ dataCaptureViewId: this.dataCaptureViewId });
        this._proxy.unsubscribeFromEvents(Object.values(BarcodeBatchBasicOverlayListenerEvents));
        this._proxy.eventEmitter.off(BarcodeBatchBasicOverlayListenerEvents.brushForTrackedBarcode, this.handleBrushForTrackedBarcodeWrapper);
        this._proxy.eventEmitter.off(BarcodeBatchBasicOverlayListenerEvents.didTapTrackedBarcode, this.handleDidTapTrackedBarcodeWrapper);
        this.hasListeners = false;
    }
    get dataCaptureViewId() {
        var _a, _b;
        return (_b = (_a = this.overlay.view) === null || _a === void 0 ? void 0 : _a.viewId) !== null && _b !== void 0 ? _b : -1;
    }
    dispose() {
        this.unsubscribeListener();
        this._proxy.dispose();
    }
}

class BarcodeBatchBasicOverlay extends DefaultSerializeable {
    get view() {
        return this._view;
    }
    set view(newView) {
        var _a, _b;
        if (newView === null) {
            this._view = null;
            (_a = this.controller) === null || _a === void 0 ? void 0 : _a.dispose();
            this.controller = null;
            return;
        }
        this._view = newView;
        (_b = this.controller) !== null && _b !== void 0 ? _b : (this.controller = new BarcodeBatchBasicOverlayController(this));
    }
    get _dataCaptureViewId() {
        var _a, _b;
        return (_b = (_a = this.view) === null || _a === void 0 ? void 0 : _a.viewId) !== null && _b !== void 0 ? _b : -1;
    }
    get listener() {
        return this._listener;
    }
    set listener(newListener) {
        var _a, _b;
        this._hasListener = newListener != null;
        this._listener = newListener;
        if (this._listener != null) {
            (_a = this.controller) === null || _a === void 0 ? void 0 : _a.subscribeListener();
        }
        else {
            (_b = this.controller) === null || _b === void 0 ? void 0 : _b.unsubscribeListener();
        }
    }
    get defaultBrush() {
        return this.brush;
    }
    set defaultBrush(newBrush) {
        this.brush = newBrush;
    }
    get brush() {
        return this._brush;
    }
    set brush(newBrush) {
        var _a;
        this._brush = newBrush;
        (_a = this.controller) === null || _a === void 0 ? void 0 : _a.updateBarcodeBatchBasicOverlay();
    }
    get shouldShowScanAreaGuides() {
        return this._shouldShowScanAreaGuides;
    }
    set shouldShowScanAreaGuides(shouldShow) {
        var _a;
        this._shouldShowScanAreaGuides = shouldShow;
        (_a = this.controller) === null || _a === void 0 ? void 0 : _a.updateBarcodeBatchBasicOverlay();
    }
    get style() {
        return this._style;
    }
    static get barcodeBatchDefaults() {
        return getBarcodeBatchDefaults();
    }
    constructor(mode, style) {
        super();
        this.type = 'barcodeTrackingBasic';
        this._view = null;
        this._hasListener = false;
        this._listener = null;
        this._brush = (() => {
            const overlayDefaults = BarcodeBatchBasicOverlay.barcodeBatchDefaults.BarcodeBatchBasicOverlay;
            const defaultBrush = overlayDefaults.styles[overlayDefaults.defaultStyle].DefaultBrush;
            return new Brush(defaultBrush.fillColor, defaultBrush.strokeColor, defaultBrush.strokeWidth);
        })();
        this._shouldShowScanAreaGuides = false;
        this.controller = null;
        this._style = style;
        this.modeId = mode.modeId;
    }
    setBrushForTrackedBarcode(brush, trackedBarcode) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            return (_a = this.controller) === null || _a === void 0 ? void 0 : _a.setBrushForTrackedBarcode(brush, trackedBarcode);
        });
    }
    clearTrackedBarcodeBrushes() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            return (_a = this.controller) === null || _a === void 0 ? void 0 : _a.clearTrackedBarcodeBrushes();
        });
    }
}
__decorate([
    ignoreFromSerialization
], BarcodeBatchBasicOverlay.prototype, "_view", void 0);
__decorate([
    nameForSerialization('style')
], BarcodeBatchBasicOverlay.prototype, "_style", void 0);
__decorate([
    nameForSerialization('hasListener')
], BarcodeBatchBasicOverlay.prototype, "_hasListener", void 0);
__decorate([
    nameForSerialization('dataCaptureViewId')
], BarcodeBatchBasicOverlay.prototype, "_dataCaptureViewId", null);
__decorate([
    ignoreFromSerialization
], BarcodeBatchBasicOverlay.prototype, "_listener", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeBatchBasicOverlay.prototype, "defaultBrush", null);
__decorate([
    nameForSerialization('defaultBrush')
], BarcodeBatchBasicOverlay.prototype, "_brush", void 0);
__decorate([
    nameForSerialization('shouldShowScanAreaGuides')
], BarcodeBatchBasicOverlay.prototype, "_shouldShowScanAreaGuides", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeBatchBasicOverlay.prototype, "controller", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeBatchBasicOverlay, "barcodeBatchDefaults", null);

class BarcodeBatchSettings extends DefaultSerializeable {
    get enabledSymbologies() {
        return Object.keys(this.symbologies)
            .filter(symbology => this.symbologies[symbology].isEnabled);
    }
    static get barcodeDefaults() {
        return getBarcodeDefaults();
    }
    constructor() {
        super();
        this.properties = {};
        this.symbologies = {};
        this._arucoDictionary = null;
    }
    settingsForSymbology(symbology) {
        if (!this.symbologies[symbology]) {
            const symbologySettings = BarcodeBatchSettings.barcodeDefaults.SymbologySettings[symbology];
            symbologySettings._symbology = symbology;
            this.symbologies[symbology] = symbologySettings;
        }
        return this.symbologies[symbology];
    }
    setProperty(name, value) {
        this.properties[name] = value;
    }
    getProperty(name) {
        return this.properties[name];
    }
    enableSymbologies(symbologies) {
        symbologies.forEach(symbology => this.enableSymbology(symbology, true));
    }
    enableSymbology(symbology, enabled) {
        this.settingsForSymbology(symbology).isEnabled = enabled;
    }
    setArucoDictionary(dictionary) {
        this._arucoDictionary = dictionary;
    }
}
__decorate([
    nameForSerialization('arucoDictionary')
], BarcodeBatchSettings.prototype, "_arucoDictionary", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeBatchSettings, "barcodeDefaults", null);

class BaseBarcodeBatchAdvancedOverlay extends DefaultSerializeable {
    get view() {
        return this._view;
    }
    set view(newView) {
        var _a, _b;
        if (newView === null) {
            (_a = this.controller) === null || _a === void 0 ? void 0 : _a.dispose();
            this.controller = null;
            this._view = null;
            return;
        }
        this._view = newView;
        (_b = this.controller) !== null && _b !== void 0 ? _b : (this.controller = new BarcodeBatchAdvancedOverlayController(this));
    }
    get shouldShowScanAreaGuides() {
        return this._shouldShowScanAreaGuides;
    }
    set shouldShowScanAreaGuides(shouldShow) {
        var _a;
        this._shouldShowScanAreaGuides = shouldShow;
        (_a = this.controller) === null || _a === void 0 ? void 0 : _a.updateBarcodeBatchAdvancedOverlay();
    }
    get _dataCaptureViewId() {
        var _a, _b;
        return (_b = (_a = this.view) === null || _a === void 0 ? void 0 : _a.viewId) !== null && _b !== void 0 ? _b : -1;
    }
    get listener() {
        return this._listener;
    }
    set listener(newListener) {
        var _a, _b;
        this._hasListener = newListener != null;
        this._listener = newListener;
        if (this._listener != null) {
            (_a = this.controller) === null || _a === void 0 ? void 0 : _a.subscribeListener();
        }
        else {
            (_b = this.controller) === null || _b === void 0 ? void 0 : _b.unsubscribeListener();
        }
    }
    constructor(mode) {
        super();
        this.type = 'barcodeTrackingAdvanced';
        this.controller = null;
        this._view = null;
        this._shouldShowScanAreaGuides = false;
        this._hasListener = false;
        this._listener = null;
        this.modeId = mode.modeId;
    }
    setViewForTrackedBarcode(view, trackedBarcode) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            return (_a = this.controller) === null || _a === void 0 ? void 0 : _a.setViewForTrackedBarcode(view, trackedBarcode);
        });
    }
    setAnchorForTrackedBarcode(anchor, trackedBarcode) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            return (_a = this.controller) === null || _a === void 0 ? void 0 : _a.setAnchorForTrackedBarcode(anchor, trackedBarcode);
        });
    }
    setOffsetForTrackedBarcode(offset, trackedBarcode) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            return (_a = this.controller) === null || _a === void 0 ? void 0 : _a.setOffsetForTrackedBarcode(offset, trackedBarcode);
        });
    }
    clearTrackedBarcodeViews() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            return (_a = this.controller) === null || _a === void 0 ? void 0 : _a.clearTrackedBarcodeViews();
        });
    }
    updateSizeOfTrackedBarcodeView(trackedBarcodeIdentifier, width, height) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            return (_a = this.controller) === null || _a === void 0 ? void 0 : _a.updateSizeOfTrackedBarcodeView(trackedBarcodeIdentifier, width, height);
        });
    }
}
__decorate([
    ignoreFromSerialization
], BaseBarcodeBatchAdvancedOverlay.prototype, "controller", void 0);
__decorate([
    ignoreFromSerialization
], BaseBarcodeBatchAdvancedOverlay.prototype, "_view", void 0);
__decorate([
    nameForSerialization('shouldShowScanAreaGuides')
], BaseBarcodeBatchAdvancedOverlay.prototype, "_shouldShowScanAreaGuides", void 0);
__decorate([
    nameForSerialization('hasListener')
], BaseBarcodeBatchAdvancedOverlay.prototype, "_hasListener", void 0);
__decorate([
    nameForSerialization('dataCaptureViewId')
], BaseBarcodeBatchAdvancedOverlay.prototype, "_dataCaptureViewId", null);
__decorate([
    ignoreFromSerialization
], BaseBarcodeBatchAdvancedOverlay.prototype, "_listener", void 0);

class SparkScan extends DefaultSerializeable {
    get isEnabled() {
        return this._isEnabled;
    }
    set isEnabled(isEnabled) {
        var _a;
        this._isEnabled = isEnabled;
        (_a = this.controller) === null || _a === void 0 ? void 0 : _a.setModeEnabledState(isEnabled);
    }
    get context() {
        return this._context;
    }
    get _context() {
        return this.privateContext;
    }
    set _context(newContext) {
        this.privateContext = newContext;
    }
    constructor(settings) {
        super();
        this.type = 'sparkScan';
        this._isEnabled = true;
        this.hasListeners = false;
        this.privateContext = null;
        this.listeners = [];
        this.controller = null;
        this.applySettings(settings);
    }
    applySettings(settings) {
        this.settings = settings;
        return this.didChange();
    }
    addListener(listener) {
        this.checkAndSubscribeListeners();
        if (this.listeners.includes(listener)) {
            return;
        }
        this.listeners.push(listener);
        this.hasListeners = this.listeners.length > 0;
    }
    checkAndSubscribeListeners() {
        var _a;
        if (this.listeners.length === 0) {
            (_a = this.controller) === null || _a === void 0 ? void 0 : _a.subscribeModeListener();
        }
    }
    checkAndUnsubscribeListeners() {
        var _a;
        if (this.listeners.length === 0) {
            (_a = this.controller) === null || _a === void 0 ? void 0 : _a.unsubscribeModeListener();
        }
    }
    removeListener(listener) {
        if (!this.listeners.includes(listener)) {
            return;
        }
        this.listeners.splice(this.listeners.indexOf(listener));
        this.hasListeners = this.listeners.length > 0;
        this.checkAndUnsubscribeListeners();
    }
    didChange() {
        if (this.controller) {
            return this.controller.updateMode();
        }
        else {
            return Promise.resolve();
        }
    }
}
__decorate([
    nameForSerialization('isEnabled')
], SparkScan.prototype, "_isEnabled", void 0);
__decorate([
    ignoreFromSerialization
], SparkScan.prototype, "privateContext", void 0);
__decorate([
    ignoreFromSerialization
], SparkScan.prototype, "listeners", void 0);
__decorate([
    ignoreFromSerialization
], SparkScan.prototype, "controller", void 0);

var SparkScanMiniPreviewSize;
(function (SparkScanMiniPreviewSize) {
    SparkScanMiniPreviewSize["Regular"] = "regular";
    SparkScanMiniPreviewSize["Expanded"] = "expanded";
})(SparkScanMiniPreviewSize || (SparkScanMiniPreviewSize = {}));

var SparkScanPreviewBehavior;
(function (SparkScanPreviewBehavior) {
    SparkScanPreviewBehavior["Persistent"] = "accurate";
    SparkScanPreviewBehavior["Default"] = "default";
})(SparkScanPreviewBehavior || (SparkScanPreviewBehavior = {}));

class SparkScanToastSettings extends DefaultSerializeable {
    constructor() {
        super(...arguments);
        this._toastEnabled = SparkScanToastSettings.toastSettings.toastEnabled;
        this._toastBackgroundColor = SparkScanToastSettings.toastSettings.toastBackgroundColor;
        this._toastTextColor = SparkScanToastSettings.toastSettings.toastTextColor;
        this._targetModeEnabledMessage = SparkScanToastSettings.toastSettings.targetModeEnabledMessage;
        this._targetModeDisabledMessage = SparkScanToastSettings.toastSettings.targetModeDisabledMessage;
        this._continuousModeEnabledMessage = SparkScanToastSettings.toastSettings.continuousModeEnabledMessage;
        this._continuousModeDisabledMessage = SparkScanToastSettings.toastSettings.continuousModeDisabledMessage;
        this._scanPausedMessage = SparkScanToastSettings.toastSettings.scanPausedMessage;
        this._zoomedInMessage = SparkScanToastSettings.toastSettings.zoomedInMessage;
        this._zoomedOutMessage = SparkScanToastSettings.toastSettings.zoomedOutMessage;
        this._torchEnabledMessage = SparkScanToastSettings.toastSettings.torchEnabledMessage;
        this._torchDisabledMessage = SparkScanToastSettings.toastSettings.torchDisabledMessage;
        this._userFacingCameraEnabledMessage = SparkScanToastSettings.toastSettings.userFacingCameraEnabledMessage;
        this._worldFacingCameraEnabledMessage = SparkScanToastSettings.toastSettings.worldFacingCameraEnabledMessage;
    }
    set toastEnabled(isEnabled) {
        this._toastEnabled = isEnabled;
    }
    get toastEnabled() {
        return this._toastEnabled;
    }
    set toastBackgroundColor(backgroundColor) {
        this._toastBackgroundColor = backgroundColor;
    }
    get toastBackgroundColor() {
        return this._toastBackgroundColor;
    }
    set toastTextColor(textColor) {
        this._toastTextColor = textColor;
    }
    get toastTextColor() {
        return this._toastTextColor;
    }
    set targetModeEnabledMessage(message) {
        this._targetModeEnabledMessage = message;
    }
    get targetModeEnabledMessage() {
        return this._targetModeEnabledMessage;
    }
    set targetModeDisabledMessage(message) {
        this._targetModeDisabledMessage = message;
    }
    get targetModeDisabledMessage() {
        return this._targetModeDisabledMessage;
    }
    set continuousModeEnabledMessage(message) {
        this._continuousModeEnabledMessage = message;
    }
    get continuousModeEnabledMessage() {
        return this._continuousModeEnabledMessage;
    }
    set continuousModeDisabledMessage(message) {
        this._continuousModeDisabledMessage = message;
    }
    get continuousModeDisabledMessage() {
        return this._continuousModeDisabledMessage;
    }
    set scanPausedMessage(message) {
        this._scanPausedMessage = message;
    }
    get scanPausedMessage() {
        return this._scanPausedMessage;
    }
    set zoomedInMessage(message) {
        this._zoomedInMessage = message;
    }
    get zoomedInMessage() {
        return this._zoomedInMessage;
    }
    set zoomedOutMessage(message) {
        this._zoomedOutMessage = message;
    }
    get zoomedOutMessage() {
        return this._zoomedOutMessage;
    }
    set torchEnabledMessage(message) {
        this._torchEnabledMessage = message;
    }
    get torchEnabledMessage() {
        return this._torchEnabledMessage;
    }
    set torchDisabledMessage(message) {
        this._torchDisabledMessage = message;
    }
    get torchDisabledMessage() {
        return this._torchDisabledMessage;
    }
    set worldFacingCameraEnabledMessage(message) {
        this._worldFacingCameraEnabledMessage = message;
    }
    get worldFacingCameraEnabledMessage() {
        return this._worldFacingCameraEnabledMessage;
    }
    set userFacingCameraEnabledMessage(message) {
        this._userFacingCameraEnabledMessage = message;
    }
    get userFacingCameraEnabledMessage() {
        return this._userFacingCameraEnabledMessage;
    }
    static get sparkScanDefaults() {
        return getSparkScanDefaults();
    }
    static get toastSettings() {
        return SparkScanToastSettings.sparkScanDefaults.SparkScanView.SparkScanViewSettings.toastSettings;
    }
}
__decorate([
    nameForSerialization('toastEnabled')
], SparkScanToastSettings.prototype, "_toastEnabled", void 0);
__decorate([
    nameForSerialization('toastBackgroundColor')
], SparkScanToastSettings.prototype, "_toastBackgroundColor", void 0);
__decorate([
    nameForSerialization('toastTextColor')
], SparkScanToastSettings.prototype, "_toastTextColor", void 0);
__decorate([
    nameForSerialization('targetModeEnabledMessage')
], SparkScanToastSettings.prototype, "_targetModeEnabledMessage", void 0);
__decorate([
    nameForSerialization('targetModeDisabledMessage')
], SparkScanToastSettings.prototype, "_targetModeDisabledMessage", void 0);
__decorate([
    nameForSerialization('continuousModeEnabledMessage')
], SparkScanToastSettings.prototype, "_continuousModeEnabledMessage", void 0);
__decorate([
    nameForSerialization('continuousModeDisabledMessage')
], SparkScanToastSettings.prototype, "_continuousModeDisabledMessage", void 0);
__decorate([
    nameForSerialization('scanPausedMessage')
], SparkScanToastSettings.prototype, "_scanPausedMessage", void 0);
__decorate([
    nameForSerialization('zoomedInMessage')
], SparkScanToastSettings.prototype, "_zoomedInMessage", void 0);
__decorate([
    nameForSerialization('zoomedOutMessage')
], SparkScanToastSettings.prototype, "_zoomedOutMessage", void 0);
__decorate([
    nameForSerialization('torchEnabledMessage')
], SparkScanToastSettings.prototype, "_torchEnabledMessage", void 0);
__decorate([
    nameForSerialization('torchDisabledMessage')
], SparkScanToastSettings.prototype, "_torchDisabledMessage", void 0);
__decorate([
    nameForSerialization('userFacingCameraEnabledMessage')
], SparkScanToastSettings.prototype, "_userFacingCameraEnabledMessage", void 0);
__decorate([
    nameForSerialization('worldFacingCameraEnabledMessage')
], SparkScanToastSettings.prototype, "_worldFacingCameraEnabledMessage", void 0);
__decorate([
    ignoreFromSerialization
], SparkScanToastSettings, "sparkScanDefaults", null);

var SparkScanScanningBehavior;
(function (SparkScanScanningBehavior) {
    SparkScanScanningBehavior["Single"] = "single";
    SparkScanScanningBehavior["Continuous"] = "continuous";
})(SparkScanScanningBehavior || (SparkScanScanningBehavior = {}));

class PrivateSparkScanScanningModeSettings extends DefaultSerializeable {
    get scanningBehavior() {
        return this._scanningBehavior;
    }
    get previewBehavior() {
        return this._previewBehavior;
    }
    constructor(scanScanningBehavior, scanPreviewBehavior) {
        super();
        this._scanningBehavior = scanScanningBehavior;
        this._previewBehavior = scanPreviewBehavior;
    }
}
__decorate([
    nameForSerialization('scanningBehavior')
], PrivateSparkScanScanningModeSettings.prototype, "_scanningBehavior", void 0);
__decorate([
    nameForSerialization('previewBehavior')
], PrivateSparkScanScanningModeSettings.prototype, "_previewBehavior", void 0);

class SparkScanScanningModeDefault extends DefaultSerializeable {
    get scanningBehavior() {
        return this._settings.scanningBehavior;
    }
    get previewBehavior() {
        return this._settings.previewBehavior;
    }
    constructor(scanningBehavior, previewBehavior) {
        super();
        this.type = 'default';
        if (previewBehavior) {
            this._settings = new PrivateSparkScanScanningModeSettings(scanningBehavior, previewBehavior);
        }
        else {
            const previewBehavior = SparkScanPreviewBehavior.Default;
            this._settings = new PrivateSparkScanScanningModeSettings(scanningBehavior, previewBehavior);
            console.warn('SparkScanScanningModeDefault(scanningBehavior: SparkScanScanningBehavior) is deprecated.');
        }
    }
}
__decorate([
    nameForSerialization('settings')
], SparkScanScanningModeDefault.prototype, "_settings", void 0);

class SparkScanScanningModeTarget extends DefaultSerializeable {
    get scanningBehavior() {
        return this._settings.scanningBehavior;
    }
    get previewBehavior() {
        return this._settings.previewBehavior;
    }
    constructor(scanningBehavior, previewBehavior) {
        super();
        this.type = 'target';
        if (previewBehavior) {
            this._settings = new PrivateSparkScanScanningModeSettings(scanningBehavior, previewBehavior);
        }
        else {
            const previewBehavior = SparkScanPreviewBehavior.Default;
            this._settings = new PrivateSparkScanScanningModeSettings(scanningBehavior, previewBehavior);
            console.warn('SparkScanScanningModeTarget(scanningBehavior: SparkScanScanningBehavior) is deprecated.');
        }
    }
}
__decorate([
    nameForSerialization('settings')
], SparkScanScanningModeTarget.prototype, "_settings", void 0);

class SparkScanSession {
    static fromJSON(json) {
        var _a;
        const sessionJson = JSON.parse(json.session);
        const session = new SparkScanSession();
        session._newlyRecognizedBarcode = sessionJson.newlyRecognizedBarcode != null ?
            Barcode.fromJSON(sessionJson.newlyRecognizedBarcode) :
            null;
        session._frameSequenceID = sessionJson.frameSequenceId;
        session.frameId = (_a = json.frameId) !== null && _a !== void 0 ? _a : '';
        return session;
    }
    get newlyRecognizedBarcode() {
        return this._newlyRecognizedBarcode;
    }
    get frameSequenceID() {
        return this._frameSequenceID;
    }
    reset() {
        return this.controller.resetSession();
    }
}

class SparkScanSettings extends DefaultSerializeable {
    get batterySaving() {
        return this._batterySaving;
    }
    set batterySaving(newValue) {
        this._batterySaving = newValue;
    }
    get locationSelection() {
        return this._locationSelection;
    }
    set locationSelection(newValue) {
        this._locationSelection = newValue;
    }
    get enabledSymbologies() {
        return Object.keys(this.symbologies)
            .filter(symbology => this.symbologies[symbology].isEnabled);
    }
    static get sparkScanDefaults() {
        return getSparkScanDefaults();
    }
    static get barcodeDefaults() {
        return getBarcodeDefaults();
    }
    constructor() {
        super();
        this.codeDuplicateFilter = SparkScanSettings.sparkScanDefaults.SparkScanSettings.codeDuplicateFilter;
        this._batterySaving = SparkScanSettings.sparkScanDefaults.SparkScanSettings.batterySaving;
        this._locationSelection = SparkScanSettings.sparkScanDefaults.SparkScanSettings.locationSelection;
        this.properties = {};
        this.symbologies = {};
        this.scanIntention = SparkScanSettings.sparkScanDefaults.SparkScanSettings.scanIntention;
    }
    settingsForSymbology(symbology) {
        if (!this.symbologies[symbology]) {
            const symbologySettings = SparkScanSettings.barcodeDefaults.SymbologySettings[symbology];
            symbologySettings._symbology = symbology;
            this.symbologies[symbology] = symbologySettings;
        }
        return this.symbologies[symbology];
    }
    setProperty(name, value) {
        this.properties[name] = value;
    }
    getProperty(name) {
        return this.properties[name];
    }
    enableSymbologies(symbologies) {
        symbologies.forEach(symbology => this.enableSymbology(symbology, true));
    }
    enableSymbology(symbology, enabled) {
        this.settingsForSymbology(symbology).isEnabled = enabled;
    }
}
__decorate([
    nameForSerialization('batterySaving')
], SparkScanSettings.prototype, "_batterySaving", void 0);
__decorate([
    nameForSerialization('locationSelection')
], SparkScanSettings.prototype, "_locationSelection", void 0);
__decorate([
    ignoreFromSerialization
], SparkScanSettings, "sparkScanDefaults", null);
__decorate([
    ignoreFromSerialization
], SparkScanSettings, "barcodeDefaults", null);

class SparkScanViewSettings extends DefaultSerializeable {
    constructor() {
        super(...arguments);
        this.triggerButtonCollapseTimeout = SparkScanViewSettings.viewSettingsDefaults.triggerButtonCollapseTimeout;
        this.defaultTorchState = SparkScanViewSettings.viewSettingsDefaults.defaultTorchState;
        this.defaultScanningMode = SparkScanViewSettings.viewSettingsDefaults.defaultScanningMode;
        this.holdToScanEnabled = SparkScanViewSettings.viewSettingsDefaults.holdToScanEnabled;
        this.soundEnabled = SparkScanViewSettings.viewSettingsDefaults.soundEnabled;
        this.hapticEnabled = SparkScanViewSettings.viewSettingsDefaults.hapticEnabled;
        this.hardwareTriggerEnabled = SparkScanViewSettings.viewSettingsDefaults.hardwareTriggerEnabled;
        this.hardwareTriggerKeyCode = SparkScanViewSettings.viewSettingsDefaults.hardwareTriggerKeyCode;
        this.visualFeedbackEnabled = SparkScanViewSettings.viewSettingsDefaults.visualFeedbackEnabled;
        this.toastSettings = new SparkScanToastSettings();
        this.zoomFactorOut = SparkScanViewSettings.viewSettingsDefaults.zoomFactorOut;
        this.zoomFactorIn = SparkScanViewSettings.viewSettingsDefaults.zoomFactorIn;
        this.inactiveStateTimeout = SparkScanViewSettings.viewSettingsDefaults.inactiveStateTimeout;
        this.defaultCameraPosition = SparkScanViewSettings.viewSettingsDefaults.defaultCameraPosition;
        this.defaultMiniPreviewSize = SparkScanViewSettings.viewSettingsDefaults.defaultMiniPreviewSize;
    }
    scanModeFromJSON(json) {
        const scanningBehavior = json.settings.scanningBehavior;
        const previewBehavior = json.settings.previewBehavior;
        if (json.type === 'default') {
            return new SparkScanScanningModeDefault(scanningBehavior, previewBehavior);
        }
        else {
            return new SparkScanScanningModeTarget(scanningBehavior, previewBehavior);
        }
    }
    static get sparkScanDefaults() {
        return getSparkScanDefaults();
    }
    static get viewSettingsDefaults() {
        return SparkScanViewSettings.sparkScanDefaults.SparkScanView.SparkScanViewSettings;
    }
}
__decorate([
    ignoreFromSerialization
], SparkScanViewSettings, "sparkScanDefaults", null);

var SparkScanViewState;
(function (SparkScanViewState) {
    SparkScanViewState["Initial"] = "initial";
    SparkScanViewState["Idle"] = "idle";
    SparkScanViewState["Inactive"] = "inactive";
    SparkScanViewState["Active"] = "active";
    SparkScanViewState["Error"] = "error";
})(SparkScanViewState || (SparkScanViewState = {}));

var SparkScanViewEvents;
(function (SparkScanViewEvents) {
    SparkScanViewEvents["barcodeFindButtonTapped"] = "SparkScanViewUiListener.barcodeFindButtonTapped";
    SparkScanViewEvents["barcodeCountButtonTapped"] = "SparkScanViewUiListener.barcodeCountButtonTapped";
    SparkScanViewEvents["labelCaptureButtonTapped"] = "SparkScanViewUiListener.labelCaptureButtonTapped";
    SparkScanViewEvents["didChangeViewState"] = "SparkScanViewUiListener.didChangeViewState";
    SparkScanViewEvents["feedbackForBarcode"] = "SparkScanFeedbackDelegate.feedbackForBarcode";
    SparkScanViewEvents["didUpdateSession"] = "SparkScanListener.didUpdateSession";
    SparkScanViewEvents["didScan"] = "SparkScanListener.didScan";
})(SparkScanViewEvents || (SparkScanViewEvents = {}));
class SparkScanViewController extends BaseNewController {
    static forSparkScanView(view, sparkScan) {
        const controller = new SparkScanViewController();
        controller.view = view;
        controller.sparkScan = sparkScan;
        controller.sparkScan.controller = controller;
        controller.initialize();
        return controller;
    }
    constructor() {
        super('SparkScanViewProxy');
        this.hasFeedbackDelegateListener = false;
        this.hasNativeViewListenerSubscriptions = false;
        this.hasNativeModeListenerSubscriptions = false;
        this.viewInstanceId = -1;
        this.didUpdateSessionListener = (ev) => __awaiter(this, void 0, void 0, function* () {
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                console.error('SparkScanListenerController didUpdateSession payload is null');
                return;
            }
            if (payload.viewId !== this.viewInstanceId) {
                return;
            }
            const session = SparkScanSession.fromJSON(payload);
            session.controller = this;
            yield this.notifyListenersOfDidUpdateSession(session);
            this._proxy.$finishSparkScanDidUpdateSession({ viewId: this.viewInstanceId, isEnabled: this.sparkScan.isEnabled });
        });
        this.didScanListener = (ev) => __awaiter(this, void 0, void 0, function* () {
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                console.error('SparkScanListenerController.subscribeListener: didScan payload is null');
                return;
            }
            if (payload.viewId !== this.viewInstanceId) {
                return;
            }
            const session = SparkScanSession.fromJSON(payload);
            session.controller = this;
            yield this.notifyListenersOfDidScan(session);
            this._proxy.$finishSparkScanDidScan({ viewId: this.viewInstanceId, isEnabled: this.sparkScan.isEnabled });
        });
        this.barcodeCountButtonTappedListener = (ev) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                return;
            }
            if (payload.viewId !== this.viewInstanceId) {
                return;
            }
            (_b = (_a = this.view.uiListener) === null || _a === void 0 ? void 0 : _a.didTapBarcodeCountButton) === null || _b === void 0 ? void 0 : _b.call(_a, this.view);
        });
        this.barcodeFindButtonTappedListener = (ev) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                return;
            }
            if (payload.viewId !== this.viewInstanceId) {
                return;
            }
            (_b = (_a = this.view.uiListener) === null || _a === void 0 ? void 0 : _a.didTapBarcodeFindButton) === null || _b === void 0 ? void 0 : _b.call(_a, this.view);
        });
        this.labelCaptureButtonTappedListener = (ev) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                return;
            }
            if (payload.viewId !== this.viewInstanceId) {
                return;
            }
            (_b = (_a = this.view.uiListener) === null || _a === void 0 ? void 0 : _a.didTapLabelCaptureButton) === null || _b === void 0 ? void 0 : _b.call(_a, this.view);
        });
        this.didChangeViewStateListener = (ev) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                console.error('SparkScanViewController didChangeViewState payload is null');
                return;
            }
            if (payload.viewId !== this.viewInstanceId) {
                return;
            }
            const newState = payload.state;
            (_b = (_a = this.view.uiListener) === null || _a === void 0 ? void 0 : _a.didChangeViewState) === null || _b === void 0 ? void 0 : _b.call(_a, newState);
        });
    }
    initialize() {
        this._proxy.on$barcodeCountButtonTapped = this.barcodeCountButtonTappedListener;
        this._proxy.on$barcodeFindButtonTapped = this.barcodeFindButtonTappedListener;
        this._proxy.on$labelCaptureButtonTapped = this.labelCaptureButtonTappedListener;
        this._proxy.on$didChangeViewState = this.didChangeViewStateListener;
        this._proxy.on$didUpdateSession = this.didUpdateSessionListener;
        this._proxy.on$didScan = this.didScanListener;
        this._proxy.on$feedbackForBarcode = this.handleFeedbackForBarcode.bind(this);
        if (this.sparkScan.listeners.length > 0) {
            this.subscribeModeListener();
        }
        if (this.view.uiListener) {
            this.subscribeViewListeners();
        }
        if (this.view.feedbackDelegate) {
            this.addFeedbackDelegate();
        }
    }
    dispose() {
        this.unsubscribeModeListener();
        this.unsubscribeViewListeners();
        this.removeFeedbackDelegate();
        this._proxy.$disposeSparkScanView({ viewId: this.viewInstanceId });
        this._proxy.dispose();
    }
    subscribeViewListeners() {
        if (!this.isViewCreated)
            return; // view not created yet
        if (this.hasNativeViewListenerSubscriptions)
            return;
        this._proxy.$registerSparkScanViewListenerEvents({ viewId: this.viewInstanceId });
        this.hasNativeViewListenerSubscriptions = true;
    }
    unsubscribeViewListeners() {
        if (!this.isViewCreated)
            return; // view not created yet
        if (this.hasNativeViewListenerSubscriptions === false)
            return;
        this._proxy.$unregisterSparkScanViewListenerEvents({ viewId: this.viewInstanceId });
        this.hasNativeViewListenerSubscriptions = false;
    }
    createView() {
        const viewJson = {
            SparkScan: this.sparkScan.toJSON(),
            SparkScanView: this.view.toJSON()
        };
        const viewId = this.view.viewId;
        const json = JSON.stringify(viewJson);
        return this._proxy.$createSparkScanView({ viewId, viewJson: json }).then(() => {
            this.viewInstanceId = viewId;
            this.initialize();
        });
    }
    updateView() {
        if (!this.isViewCreated) {
            return Promise.resolve(); // No updates if view not created yet
        }
        const sparkScanViewJson = this.view.toJSON();
        const json = JSON.stringify({ SparkScanView: sparkScanViewJson });
        return this._proxy.$updateSparkScanView({ viewId: this.viewInstanceId, viewJson: json });
    }
    stopScanning() {
        if (!this.isViewCreated) {
            return Promise.resolve(); // No updates if view not created yet
        }
        return this._proxy.$stopSparkScanViewScanning({ viewId: this.viewInstanceId });
    }
    pauseScanning() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isViewCreated) {
                return Promise.resolve(); // No updates if view not created yet
            }
            return this._proxy.$pauseSparkScanViewScanning({ viewId: this.viewInstanceId });
        });
    }
    startScanning() {
        if (!this.isViewCreated) {
            return Promise.resolve(); // No updates if view not created yet
        }
        return this._proxy.$startSparkScanViewScanning({ viewId: this.viewInstanceId });
    }
    prepareScanning() {
        if (!this.isViewCreated) {
            return Promise.resolve(); // No updates if view not created yet
        }
        return this._proxy.$prepareSparkScanViewScanning({ viewId: this.viewInstanceId });
    }
    onHostPause() {
        if (!this.isViewCreated) {
            return Promise.resolve(); // No updates if view not created yet
        }
        return this._proxy.$onHostPauseSparkScanView({ viewId: this.viewInstanceId });
    }
    showToast(text) {
        if (!this.isViewCreated) {
            return Promise.resolve(); // No updates if view not created yet
        }
        return this._proxy.$showSparkScanViewToast({ viewId: this.viewInstanceId, text: text });
    }
    showView() {
        if (!this.isViewCreated) {
            return Promise.resolve(); // No updates if view not created yet
        }
        return this._proxy.$showSparkScanView({ viewId: this.viewInstanceId });
    }
    hideView() {
        if (!this.isViewCreated) {
            return Promise.resolve(); // No updates if view not created yet
        }
        return this._proxy.$hideSparkScanView({ viewId: this.viewInstanceId });
    }
    addFeedbackDelegate() {
        if (!this.isViewCreated)
            return; // view not created yet
        if (this.hasFeedbackDelegateListener)
            return;
        this._proxy.$registerSparkScanFeedbackDelegateForEvents({ viewId: this.viewInstanceId });
        this.hasFeedbackDelegateListener = true;
    }
    removeFeedbackDelegate() {
        if (!this.isViewCreated)
            return; // view not created yet
        if (!this.hasFeedbackDelegateListener)
            return;
        this._proxy.$unregisterSparkScanFeedbackDelegateForEvents({ viewId: this.viewInstanceId });
        this.hasFeedbackDelegateListener = false;
    }
    resetSession() {
        if (!this.isViewCreated) {
            return Promise.resolve(); // view not created yet
        }
        return this._proxy.$resetSparkScanSession({ viewId: this.viewInstanceId });
    }
    updateMode() {
        if (!this.isViewCreated) {
            return Promise.resolve(); // No updates if view not created yet
        }
        const sparkScanJson = this.sparkScan.toJSON();
        const json = JSON.stringify(sparkScanJson);
        return this._proxy.$updateSparkScanMode({ viewId: this.viewInstanceId, modeJson: json });
    }
    subscribeModeListener() {
        if (!this.isViewCreated)
            return; // view not created yet
        if (this.hasNativeModeListenerSubscriptions)
            return;
        this._proxy.$registerSparkScanListenerForEvents({ viewId: this.viewInstanceId });
        this.hasNativeModeListenerSubscriptions = true;
    }
    unsubscribeModeListener() {
        if (!this.isViewCreated)
            return; // view not created yet
        if (this.hasNativeModeListenerSubscriptions == false)
            return;
        this._proxy.$unregisterSparkScanListenerForEvents({ viewId: this.viewInstanceId });
        this.hasNativeModeListenerSubscriptions = false;
    }
    setModeEnabledState(enabled) {
        if (!this.isViewCreated)
            return; // view not created yet
        this._proxy.$setSparkScanModeEnabledState({ viewId: this.viewInstanceId, isEnabled: enabled });
    }
    get isViewCreated() {
        return this.viewInstanceId !== -1;
    }
    handleFeedbackForBarcode(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                console.error('SparkScanViewController feedbackForBarcode payload is null');
                return;
            }
            if (payload.viewId !== this.viewInstanceId) {
                return;
            }
            const barcode = Barcode.fromJSON(JSON.parse(payload.barcode));
            const feedback = (_b = (_a = this.view.feedbackDelegate) === null || _a === void 0 ? void 0 : _a.feedbackForBarcode) === null || _b === void 0 ? void 0 : _b.call(_a, barcode);
            if (feedback instanceof Promise) {
                feedback.then((feedback) => {
                    this._proxy.$submitSparkScanFeedbackForBarcode({ viewId: this.viewInstanceId, feedbackJson: JSON.stringify(feedback === null || feedback === void 0 ? void 0 : feedback.toJSON()) });
                });
            }
            else {
                this._proxy.$submitSparkScanFeedbackForBarcode({ viewId: this.viewInstanceId, feedbackJson: JSON.stringify(feedback === null || feedback === void 0 ? void 0 : feedback.toJSON()) });
            }
        });
    }
    notifyListenersOfDidUpdateSession(session) {
        return __awaiter(this, void 0, void 0, function* () {
            const mode = this.sparkScan;
            mode.isInListenerCallback = true;
            for (const listener of mode.listeners) {
                if (listener.didUpdateSession) {
                    yield listener.didUpdateSession(this.sparkScan, session, () => CameraController.getFrameOrNull(session.frameId));
                }
            }
            mode.isInListenerCallback = false;
        });
    }
    notifyListenersOfDidScan(session) {
        return __awaiter(this, void 0, void 0, function* () {
            const mode = this.sparkScan;
            mode.isInListenerCallback = true;
            for (const listener of mode.listeners) {
                if (listener.didScan) {
                    yield listener.didScan(this.sparkScan, session, () => CameraController.getFrameOrNull(session.frameId));
                }
            }
            mode.isInListenerCallback = false;
        });
    }
}

class BaseSparkScanView {
    get viewId() {
        return this._viewId;
    }
    get uiListener() {
        return this._uiListener;
    }
    set uiListener(listener) {
        this._uiListener = listener;
        if (listener) {
            this._controller.subscribeViewListeners();
        }
        else {
            this._controller.unsubscribeViewListeners();
        }
    }
    static withProps(props) {
        const view = new BaseSparkScanView({
            context: props.context,
            sparkScan: props.sparkScan,
            settings: props.sparkScanViewSettings,
        });
        if (props.shouldHandleAndroidLifecycleAutomatically !== undefined && props.shouldHandleAndroidLifecycleAutomatically !== null) {
            view.shouldHandleAndroidLifecycleAutomatically = props.shouldHandleAndroidLifecycleAutomatically;
        }
        if (props.uiListener) {
            view.uiListener = props.uiListener;
        }
        if (props.previewSizeControlVisible !== undefined && props.previewSizeControlVisible !== null) {
            view._previewSizeControlVisible = props.previewSizeControlVisible;
        }
        if (props.cameraSwitchButtonVisible !== undefined && props.cameraSwitchButtonVisible !== null) {
            view._cameraSwitchButtonVisible = props.cameraSwitchButtonVisible;
        }
        if (props.scanningBehaviorButtonVisible !== undefined && props.scanningBehaviorButtonVisible !== null) {
            view._scanningBehaviorButtonVisible = props.scanningBehaviorButtonVisible;
        }
        if (props.barcodeCountButtonVisible !== undefined && props.barcodeCountButtonVisible !== null) {
            view._barcodeCountButtonVisible = props.barcodeCountButtonVisible;
        }
        if (props.barcodeFindButtonVisible !== undefined && props.barcodeFindButtonVisible !== null) {
            view._barcodeFindButtonVisible = props.barcodeFindButtonVisible;
        }
        if (props.targetModeButtonVisible !== undefined && props.targetModeButtonVisible !== null) {
            view._targetModeButtonVisible = props.targetModeButtonVisible;
        }
        if (props.labelCaptureButtonVisible !== undefined && props.labelCaptureButtonVisible !== null) {
            view._labelCaptureButtonVisible = props.labelCaptureButtonVisible;
        }
        if (props.torchControlVisible !== undefined && props.torchControlVisible !== null) {
            view._torchControlVisible = props.torchControlVisible;
        }
        if (props.previewCloseControlVisible !== undefined && props.previewCloseControlVisible !== null) {
            view._previewCloseControlVisible = props.previewCloseControlVisible;
        }
        if (props.triggerButtonVisible !== undefined) {
            view._triggerButtonVisible = props.triggerButtonVisible;
        }
        if (props.triggerButtonImage !== undefined) {
            view._triggerButtonImage = props.triggerButtonImage;
        }
        if (props.triggerButtonTintColor !== undefined) {
            view._triggerButtonTintColor = props.triggerButtonTintColor;
        }
        if (props.triggerButtonAnimationColor !== undefined) {
            view._triggerButtonAnimationColor = props.triggerButtonAnimationColor;
        }
        if (props.triggerButtonExpandedColor !== undefined) {
            view._triggerButtonExpandedColor = props.triggerButtonExpandedColor;
        }
        if (props.triggerButtonCollapsedColor !== undefined) {
            view._triggerButtonCollapsedColor = props.triggerButtonCollapsedColor;
        }
        if (props.toolbarBackgroundColor !== undefined) {
            view._toolbarBackgroundColor = props.toolbarBackgroundColor;
        }
        if (props.toolbarIconActiveTintColor !== undefined) {
            view._toolbarIconActiveTintColor = props.toolbarIconActiveTintColor;
        }
        if (props.toolbarIconInactiveTintColor !== undefined) {
            view._toolbarIconInactiveTintColor = props.toolbarIconInactiveTintColor;
        }
        if (props.feedbackDelegate !== undefined) {
            view.feedbackDelegate = props.feedbackDelegate;
        }
        return view;
    }
    static get defaultBrush() {
        return BaseSparkScanView.sparkScanDefaults.SparkScanView.brush;
    }
    constructor({ context, sparkScan, settings }) {
        this._viewId = -1; // -1 means the view is not created yet
        this._uiListener = null;
        this._brush = BaseSparkScanView.defaultBrush;
        this._feedbackDelegate = null;
        this._previewSizeControlVisible = BaseSparkScanView.sparkScanDefaults.SparkScanView.previewSizeControlVisible;
        this._cameraSwitchButtonVisible = BaseSparkScanView.sparkScanDefaults.SparkScanView.cameraSwitchButtonVisible;
        this._scanningBehaviorButtonVisible = BaseSparkScanView.sparkScanDefaults.SparkScanView.scanningBehaviorButtonVisible;
        this._barcodeCountButtonVisible = BaseSparkScanView.sparkScanDefaults.SparkScanView.barcodeCountButtonVisible;
        this._barcodeFindButtonVisible = BaseSparkScanView.sparkScanDefaults.SparkScanView.barcodeFindButtonVisible;
        this._targetModeButtonVisible = BaseSparkScanView.sparkScanDefaults.SparkScanView.targetModeButtonVisible;
        this._labelCaptureButtonVisible = BaseSparkScanView.sparkScanDefaults.SparkScanView.labelCaptureButtonVisible;
        this._toolbarBackgroundColor = BaseSparkScanView.sparkScanDefaults.SparkScanView.toolbarBackgroundColor;
        this._toolbarIconActiveTintColor = BaseSparkScanView.sparkScanDefaults.SparkScanView.toolbarIconActiveTintColor;
        this._toolbarIconInactiveTintColor = BaseSparkScanView.sparkScanDefaults.SparkScanView.toolbarIconInactiveTintColor;
        this._triggerButtonAnimationColor = BaseSparkScanView.sparkScanDefaults.SparkScanView.triggerButtonAnimationColor;
        this._triggerButtonExpandedColor = BaseSparkScanView.sparkScanDefaults.SparkScanView.triggerButtonExpandedColor;
        this._triggerButtonCollapsedColor = BaseSparkScanView.sparkScanDefaults.SparkScanView.triggerButtonCollapsedColor;
        this._triggerButtonTintColor = BaseSparkScanView.sparkScanDefaults.SparkScanView.triggerButtonTintColor;
        this._triggerButtonVisible = BaseSparkScanView.sparkScanDefaults.SparkScanView.triggerButtonVisible;
        this._triggerButtonImage = BaseSparkScanView.sparkScanDefaults.SparkScanView.triggerButtonImage;
        this._torchControlVisible = BaseSparkScanView.sparkScanDefaults.SparkScanView.torchControlVisible;
        this._previewCloseControlVisible = BaseSparkScanView.sparkScanDefaults.SparkScanView.previewSizeControlVisible;
        this.shouldHandleAndroidLifecycleAutomatically = true;
        this._sparkScan = sparkScan;
        this.context = context;
        this._viewSettings = settings !== null && settings !== void 0 ? settings : new SparkScanViewSettings();
        this._controller = SparkScanViewController.forSparkScanView(this, sparkScan);
    }
    get previewSizeControlVisible() {
        return this._previewSizeControlVisible;
    }
    set previewSizeControlVisible(newValue) {
        this._previewSizeControlVisible = newValue;
        this.update();
    }
    get torchControlVisible() {
        return this._torchControlVisible;
    }
    set torchControlVisible(newValue) {
        this._torchControlVisible = newValue;
        this.update();
    }
    get previewCloseControlVisible() {
        return this._previewCloseControlVisible;
    }
    set previewCloseControlVisible(newValue) {
        this._previewCloseControlVisible = newValue;
        this.update();
    }
    get scanningBehaviorButtonVisible() {
        return this._scanningBehaviorButtonVisible;
    }
    set scanningBehaviorButtonVisible(newValue) {
        this._scanningBehaviorButtonVisible = newValue;
        this.update();
    }
    get barcodeCountButtonVisible() {
        return this._barcodeCountButtonVisible;
    }
    set barcodeCountButtonVisible(newValue) {
        this._barcodeCountButtonVisible = newValue;
        this.update();
    }
    get barcodeFindButtonVisible() {
        return this._barcodeFindButtonVisible;
    }
    set barcodeFindButtonVisible(newValue) {
        this._barcodeFindButtonVisible = newValue;
        this.update();
    }
    get targetModeButtonVisible() {
        return this._targetModeButtonVisible;
    }
    set targetModeButtonVisible(newValue) {
        this._targetModeButtonVisible = newValue;
        this.update();
    }
    get labelCaptureButtonVisible() {
        return this._labelCaptureButtonVisible;
    }
    set labelCaptureButtonVisible(newValue) {
        this._labelCaptureButtonVisible = newValue;
        this.update();
    }
    get toolbarBackgroundColor() {
        return this._toolbarBackgroundColor;
    }
    set toolbarBackgroundColor(newValue) {
        this._toolbarBackgroundColor = newValue;
        this.update();
    }
    get toolbarIconActiveTintColor() {
        return this._toolbarIconActiveTintColor;
    }
    set toolbarIconActiveTintColor(newValue) {
        this._toolbarIconActiveTintColor = newValue;
        this.update();
    }
    get toolbarIconInactiveTintColor() {
        return this._toolbarIconInactiveTintColor;
    }
    set toolbarIconInactiveTintColor(newValue) {
        this._toolbarIconInactiveTintColor = newValue;
        this.update();
    }
    get cameraSwitchButtonVisible() {
        return this._cameraSwitchButtonVisible;
    }
    set cameraSwitchButtonVisible(newValue) {
        this._cameraSwitchButtonVisible = newValue;
        this.update();
    }
    get triggerButtonAnimationColor() {
        return this._triggerButtonAnimationColor;
    }
    set triggerButtonAnimationColor(newValue) {
        this._triggerButtonAnimationColor = newValue;
        this.update();
    }
    get triggerButtonExpandedColor() {
        return this._triggerButtonExpandedColor;
    }
    set triggerButtonExpandedColor(newValue) {
        this._triggerButtonExpandedColor = newValue;
        this.update();
    }
    get triggerButtonCollapsedColor() {
        return this._triggerButtonCollapsedColor;
    }
    set triggerButtonCollapsedColor(newValue) {
        this._triggerButtonCollapsedColor = newValue;
        this.update();
    }
    get triggerButtonTintColor() {
        return this._triggerButtonTintColor;
    }
    set triggerButtonTintColor(newValue) {
        this._triggerButtonTintColor = newValue;
        this.update();
    }
    get triggerButtonImage() {
        return this._triggerButtonImage;
    }
    set triggerButtonImage(newValue) {
        this._triggerButtonImage = newValue;
        this.update();
    }
    get triggerButtonVisible() {
        return this._triggerButtonVisible;
    }
    set triggerButtonVisible(newValue) {
        this._triggerButtonVisible = newValue;
        this.update();
    }
    showToast(text) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._controller.showToast(text);
        });
    }
    prepareScanning() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._controller.prepareScanning();
        });
    }
    startScanning() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._controller.startScanning();
        });
    }
    pauseScanning() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._controller.pauseScanning();
        });
    }
    stopScanning() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._controller.stopScanning();
        });
    }
    onHostPause() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._controller.onHostPause();
        });
    }
    update() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._controller.updateView();
        });
    }
    dispose() {
        this._controller.dispose();
    }
    show() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._show();
        });
    }
    hide() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._hide();
        });
    }
    createNativeView(viewId) {
        return __awaiter(this, void 0, void 0, function* () {
            this._viewId = viewId;
            yield this._controller.createView();
        });
    }
    get feedbackDelegate() {
        return this._feedbackDelegate;
    }
    set feedbackDelegate(delegate) {
        if (this._feedbackDelegate) {
            this._controller.removeFeedbackDelegate();
        }
        this._feedbackDelegate = delegate;
        if (delegate) {
            this._controller.addFeedbackDelegate();
        }
    }
    updateWithProps(prevProps, props) {
        if (props.shouldHandleAndroidLifecycleAutomatically !== prevProps.shouldHandleAndroidLifecycleAutomatically &&
            props.shouldHandleAndroidLifecycleAutomatically !== undefined) {
            this.shouldHandleAndroidLifecycleAutomatically = props.shouldHandleAndroidLifecycleAutomatically;
        }
        // Update UI Listener
        if (props.uiListener !== prevProps.uiListener) {
            this.uiListener = props.uiListener || null;
        }
        // Update visibility controls
        if (props.previewSizeControlVisible !== prevProps.previewSizeControlVisible &&
            props.previewSizeControlVisible !== undefined) {
            this.previewSizeControlVisible = props.previewSizeControlVisible;
        }
        if (props.scanningBehaviorButtonVisible !== prevProps.scanningBehaviorButtonVisible &&
            props.scanningBehaviorButtonVisible !== undefined) {
            this.scanningBehaviorButtonVisible = props.scanningBehaviorButtonVisible;
        }
        if (props.barcodeCountButtonVisible !== prevProps.barcodeCountButtonVisible &&
            props.barcodeCountButtonVisible !== undefined) {
            this.barcodeCountButtonVisible = props.barcodeCountButtonVisible;
        }
        if (props.barcodeFindButtonVisible !== prevProps.barcodeFindButtonVisible &&
            props.barcodeFindButtonVisible !== undefined) {
            this.barcodeFindButtonVisible = props.barcodeFindButtonVisible;
        }
        if (props.targetModeButtonVisible !== prevProps.targetModeButtonVisible &&
            props.targetModeButtonVisible !== undefined) {
            this.targetModeButtonVisible = props.targetModeButtonVisible;
        }
        if (props.cameraSwitchButtonVisible !== prevProps.cameraSwitchButtonVisible &&
            props.cameraSwitchButtonVisible !== undefined) {
            this.cameraSwitchButtonVisible = props.cameraSwitchButtonVisible;
        }
        if (props.torchControlVisible !== prevProps.torchControlVisible &&
            props.torchControlVisible !== undefined) {
            this.torchControlVisible = props.torchControlVisible;
        }
        if (props.previewCloseControlVisible !== prevProps.previewCloseControlVisible &&
            props.previewCloseControlVisible !== undefined) {
            this.previewCloseControlVisible = props.previewCloseControlVisible;
        }
        if (props.triggerButtonVisible !== prevProps.triggerButtonVisible &&
            props.triggerButtonVisible !== undefined) {
            this.triggerButtonVisible = props.triggerButtonVisible;
        }
        // Update color customizations
        if (props.toolbarBackgroundColor !== prevProps.toolbarBackgroundColor &&
            props.toolbarBackgroundColor !== undefined) {
            this.toolbarBackgroundColor = props.toolbarBackgroundColor;
        }
        if (props.toolbarIconActiveTintColor !== prevProps.toolbarIconActiveTintColor &&
            props.toolbarIconActiveTintColor !== undefined) {
            this.toolbarIconActiveTintColor = props.toolbarIconActiveTintColor;
        }
        if (props.toolbarIconInactiveTintColor !== prevProps.toolbarIconInactiveTintColor &&
            props.toolbarIconInactiveTintColor !== undefined) {
            this.toolbarIconInactiveTintColor = props.toolbarIconInactiveTintColor;
        }
        if (props.triggerButtonAnimationColor !== prevProps.triggerButtonAnimationColor &&
            props.triggerButtonAnimationColor !== undefined) {
            this.triggerButtonAnimationColor = props.triggerButtonAnimationColor;
        }
        if (props.triggerButtonExpandedColor !== prevProps.triggerButtonExpandedColor &&
            props.triggerButtonExpandedColor !== undefined) {
            this.triggerButtonExpandedColor = props.triggerButtonExpandedColor;
        }
        if (props.triggerButtonCollapsedColor !== prevProps.triggerButtonCollapsedColor &&
            props.triggerButtonCollapsedColor !== undefined) {
            this.triggerButtonCollapsedColor = props.triggerButtonCollapsedColor;
        }
        if (props.triggerButtonTintColor !== prevProps.triggerButtonTintColor &&
            props.triggerButtonTintColor !== undefined) {
            this.triggerButtonTintColor = props.triggerButtonTintColor;
        }
        // Update image customizations
        if (props.triggerButtonImage !== prevProps.triggerButtonImage &&
            props.triggerButtonImage !== undefined) {
            this.triggerButtonImage = props.triggerButtonImage;
        }
        // Update feedback delegate
        if (props.feedbackDelegate !== prevProps.feedbackDelegate &&
            props.feedbackDelegate !== undefined) {
            this.feedbackDelegate = props.feedbackDelegate;
        }
    }
    _show() {
        if (!this.context) {
            throw new Error('There should be a context attached to a view that should be shown');
        }
        return this._controller.showView();
    }
    _hide() {
        if (!this.context) {
            throw new Error('There should be a context attached to a view that should be shown');
        }
        return this._controller.hideView();
    }
    static get sparkScanDefaults() {
        return getSparkScanDefaults();
    }
    toJSON() {
        var _a;
        const json = {
            brush: this._brush.toJSON(),
            scanningBehaviorButtonVisible: this.scanningBehaviorButtonVisible,
            barcodeCountButtonVisible: this.barcodeCountButtonVisible,
            barcodeFindButtonVisible: this.barcodeFindButtonVisible,
            targetModeButtonVisible: this.targetModeButtonVisible,
            labelCaptureButtonVisible: this.labelCaptureButtonVisible,
            toolbarBackgroundColor: this.toolbarBackgroundColor,
            toolbarIconActiveTintColor: this.toolbarIconActiveTintColor,
            toolbarIconInactiveTintColor: this.toolbarIconInactiveTintColor,
            hasFeedbackDelegate: this._feedbackDelegate != null,
            cameraSwitchButtonVisible: this.cameraSwitchButtonVisible,
            triggerButtonAnimationColor: this.triggerButtonAnimationColor,
            triggerButtonExpandedColor: this.triggerButtonExpandedColor,
            triggerButtonCollapsedColor: this.triggerButtonCollapsedColor,
            triggerButtonTintColor: this.triggerButtonTintColor,
            triggerButtonVisible: this.triggerButtonVisible,
            triggerButtonImage: this.triggerButtonImage,
            torchControlVisible: this.torchControlVisible,
            previewCloseControlVisible: this.previewCloseControlVisible,
            hasUiListener: this.uiListener !== null,
            viewId: this.viewId,
            shouldHandleAndroidLifecycleAutomatically: this.shouldHandleAndroidLifecycleAutomatically,
        };
        if (this._viewSettings != null) {
            json.viewSettings = (_a = this._viewSettings) === null || _a === void 0 ? void 0 : _a.toJSON();
        }
        return json;
    }
}
__decorate([
    ignoreFromSerialization
], BaseSparkScanView.prototype, "_viewId", void 0);

class SparkScanBarcodeFeedback extends DefaultSerializeable {
    constructor() {
        super();
    }
}

class SparkScanBarcodeErrorFeedback extends SparkScanBarcodeFeedback {
    get message() {
        return this._barcodeFeedback.message;
    }
    get resumeCapturingDelay() {
        return this._barcodeFeedback.resumeCapturingDelay;
    }
    get visualFeedbackColor() {
        return this._barcodeFeedback.visualFeedbackColor;
    }
    get brush() {
        return this._barcodeFeedback.brush;
    }
    get feedback() {
        return this._barcodeFeedback.feedback;
    }
    constructor(message, resumeCapturingDelay, visualFeedbackColor, brush, feedback) {
        super();
        this.type = 'error';
        this._barcodeFeedback = {
            message: message,
            resumeCapturingDelay: resumeCapturingDelay,
            visualFeedbackColor: visualFeedbackColor,
            brush: brush,
            feedback: feedback
        };
    }
    static fromMessage(message, resumeCapturingDelay) {
        return new SparkScanBarcodeErrorFeedback(message, resumeCapturingDelay, SparkScanBarcodeErrorFeedback.sparkScanDefaults.Feedback.error.visualFeedbackColor, SparkScanBarcodeErrorFeedback.sparkScanDefaults.Feedback.error.brush, SparkScanBarcodeErrorFeedback.sparkScanDefaults.Feedback.error.feedbackDefault);
    }
    static get sparkScanDefaults() {
        return getSparkScanDefaults();
    }
}
__decorate([
    nameForSerialization('barcodeFeedback')
], SparkScanBarcodeErrorFeedback.prototype, "_barcodeFeedback", void 0);
__decorate([
    ignoreFromSerialization
], SparkScanBarcodeErrorFeedback, "sparkScanDefaults", null);

class SparkScanBarcodeSuccessFeedback extends SparkScanBarcodeFeedback {
    get visualFeedbackColor() {
        return this._barcodeFeedback.visualFeedbackColor;
    }
    get brush() {
        return this._barcodeFeedback.brush;
    }
    get feedback() {
        return this._barcodeFeedback.feedback;
    }
    constructor() {
        super();
        this.type = 'success';
        this._barcodeFeedback = {
            visualFeedbackColor: SparkScanBarcodeSuccessFeedback.sparkScanDefaults.Feedback.success.visualFeedbackColor,
            brush: SparkScanBarcodeSuccessFeedback.sparkScanDefaults.Feedback.success.brush,
            feedback: SparkScanBarcodeSuccessFeedback.sparkScanDefaults.Feedback.success.feedbackDefault
        };
    }
    static fromVisualFeedbackColor(visualFeedbackColor, brush, feedback) {
        const successFeedback = new SparkScanBarcodeSuccessFeedback();
        successFeedback._barcodeFeedback = {
            visualFeedbackColor: visualFeedbackColor,
            brush: brush,
            feedback: feedback
        };
        return successFeedback;
    }
    static get sparkScanDefaults() {
        return getSparkScanDefaults();
    }
}
__decorate([
    nameForSerialization('barcodeFeedback')
], SparkScanBarcodeSuccessFeedback.prototype, "_barcodeFeedback", void 0);
__decorate([
    ignoreFromSerialization
], SparkScanBarcodeSuccessFeedback, "sparkScanDefaults", null);

class BarcodePick extends DefaultSerializeable {
    get controller() {
        return this._controller;
    }
    set controller(newController) {
        this._controller = newController;
    }
    static get barcodePickDefaults() {
        return getBarcodePickDefaults();
    }
    static createRecommendedCameraSettings() {
        return new CameraSettings(BarcodePick.barcodePickDefaults.RecommendedCameraSettings);
    }
    constructor(dataCaptureContext, settings, productProvider) {
        super();
        this.type = 'barcodePick';
        this.listeners = [];
        this._hasScanningListeners = false;
        this.modeListeners = [];
        this._hasListeners = false;
        this.isInListenerCallback = false;
        this._controller = null;
        this.privateContext = dataCaptureContext;
        this._settings = settings;
        this._productProvider = productProvider;
    }
    addScanningListener(listener) {
        this.checkAndSubscribeScanningListeners();
        if (this.listeners.includes(listener)) {
            return;
        }
        this.listeners.push(listener);
        this._hasScanningListeners = this.listeners.length > 0;
    }
    removeScanningListener(listener) {
        if (!this.listeners.includes(listener)) {
            return;
        }
        this.listeners.splice(this.listeners.indexOf(listener));
        this.checkAndUnsubscribeScanningListeners();
        this._hasScanningListeners = this.listeners.length > 0;
    }
    checkAndSubscribeScanningListeners() {
        var _a;
        if (this.listeners.length === 0) {
            (_a = this.controller) === null || _a === void 0 ? void 0 : _a.subscribeScanningListener();
        }
    }
    checkAndUnsubscribeScanningListeners() {
        var _a;
        if (this.listeners.length === 0) {
            (_a = this.controller) === null || _a === void 0 ? void 0 : _a.unsubscribeScanningListener();
        }
    }
    addListener(listener) {
        this.checkAndSubscribeListeners();
        if (this.modeListeners.includes(listener)) {
            return;
        }
        this.modeListeners.push(listener);
        this._hasListeners = this.modeListeners.length > 0;
    }
    removeListener(listener) {
        if (!this.modeListeners.includes(listener)) {
            return;
        }
        this.modeListeners.splice(this.modeListeners.indexOf(listener));
        this.checkAndUnsubscribeListeners();
        this._hasListeners = this.modeListeners.length > 0;
    }
    checkAndSubscribeListeners() {
        var _a;
        if (this.modeListeners.length === 0) {
            (_a = this.controller) === null || _a === void 0 ? void 0 : _a.subscribePickListener();
        }
    }
    checkAndUnsubscribeListeners() {
        var _a;
        if (this.modeListeners.length === 0) {
            (_a = this.controller) === null || _a === void 0 ? void 0 : _a.unsubscribePickListener();
        }
    }
}
__decorate([
    ignoreFromSerialization
], BarcodePick.prototype, "privateContext", void 0);
__decorate([
    ignoreFromSerialization
], BarcodePick.prototype, "listeners", void 0);
__decorate([
    nameForSerialization('hasScanningListeners')
], BarcodePick.prototype, "_hasScanningListeners", void 0);
__decorate([
    ignoreFromSerialization
], BarcodePick.prototype, "modeListeners", void 0);
__decorate([
    nameForSerialization('hasListeners')
], BarcodePick.prototype, "_hasListeners", void 0);
__decorate([
    ignoreFromSerialization
], BarcodePick.prototype, "isInListenerCallback", void 0);
__decorate([
    nameForSerialization('settings')
], BarcodePick.prototype, "_settings", void 0);
__decorate([
    nameForSerialization('ProductProvider')
], BarcodePick.prototype, "_productProvider", void 0);
__decorate([
    ignoreFromSerialization
], BarcodePick.prototype, "_controller", void 0);
__decorate([
    ignoreFromSerialization
], BarcodePick, "barcodePickDefaults", null);

class BarcodePickActionCallback {
    onFinish(result) {
        this._viewController.finishPickAction(this._itemData, result);
    }
}

class BarcodePickAsyncMapperProductProvider extends DefaultSerializeable {
    constructor(productsToPick, callback) {
        super();
        this._productsToPickForSerialization = {};
        this._productsToPick = productsToPick;
        productsToPick.forEach((product) => {
            this._productsToPickForSerialization[product.identifier] = product.quantityToPick;
        });
        this._callback = callback;
    }
}
__decorate([
    ignoreFromSerialization
], BarcodePickAsyncMapperProductProvider.prototype, "_callback", void 0);
__decorate([
    ignoreFromSerialization
], BarcodePickAsyncMapperProductProvider.prototype, "_productsToPick", void 0);
__decorate([
    nameForSerialization('products')
], BarcodePickAsyncMapperProductProvider.prototype, "_productsToPickForSerialization", void 0);

class BarcodePickProduct extends DefaultSerializeable {
    constructor(identifier, quantityToPick) {
        super();
        this._identifier = identifier;
        this._quantityToPick = quantityToPick;
    }
    get identifier() {
        return this._identifier;
    }
    get quantityToPick() {
        return this._quantityToPick;
    }
}
__decorate([
    nameForSerialization('identifier')
], BarcodePickProduct.prototype, "_identifier", void 0);
__decorate([
    nameForSerialization('quantityToPick')
], BarcodePickProduct.prototype, "_quantityToPick", void 0);

class BarcodePickProductProviderCallbackItem extends DefaultSerializeable {
    constructor(itemData, productIdentifier) {
        super();
        this._productIdentifier = null;
        this._itemData = itemData;
        this._productIdentifier = productIdentifier;
    }
    get itemData() {
        return this._itemData;
    }
    get productIdentifier() {
        return this._productIdentifier;
    }
}
__decorate([
    nameForSerialization('itemData')
], BarcodePickProductProviderCallbackItem.prototype, "_itemData", void 0);
__decorate([
    nameForSerialization('productIdentifier')
], BarcodePickProductProviderCallbackItem.prototype, "_productIdentifier", void 0);

class BarcodePickSession {
    get trackedItems() {
        return this._trackedItems;
    }
    get addedItems() {
        return this._addedItems;
    }
    static fromJSON(json) {
        const session = new BarcodePickSession();
        session._trackedItems = json.trackedItems;
        session._addedItems = json.addedItems;
        return session;
    }
}

class BarcodePickScanningSession {
    get pickedItems() {
        return this._pickedItems;
    }
    get scannedItems() {
        return this._scannedItems;
    }
    static fromJSON(json) {
        const session = new BarcodePickScanningSession();
        session._pickedItems = json.pickedObjects;
        session._scannedItems = json.scannedObjects;
        return session;
    }
}

class BarcodePickSettings extends DefaultSerializeable {
    static get barcodePickDefaults() {
        return FactoryMaker.getInstance('BarcodePickDefaults');
    }
    constructor() {
        super();
        this.symbologies = {};
        this.properties = {};
        this._soundEnabled = BarcodePickSettings.barcodePickDefaults.BarcodePickSettings.soundEnabled;
        this._hapticsEnabled = BarcodePickSettings.barcodePickDefaults.BarcodePickSettings.hapticsEnabled;
        this._cachingEnabled = BarcodePickSettings.barcodePickDefaults.BarcodePickSettings.cachingEnabled;
        this._arucoDictionary = BarcodePickSettings.barcodePickDefaults.BarcodePickSettings.arucoDictionary;
    }
    settingsForSymbology(symbology) {
        if (!this.symbologies[symbology]) {
            const symbologySettings = BarcodePickSettings.barcodePickDefaults.SymbologySettings[symbology];
            symbologySettings._symbology = symbology;
            this.symbologies[symbology] = symbologySettings;
        }
        return this.symbologies[symbology];
    }
    get enabledSymbologies() {
        return Object.keys(this.symbologies)
            .filter(symbology => this.symbologies[symbology].isEnabled);
    }
    enableSymbologies(symbologies) {
        symbologies.forEach(symbology => this.enableSymbology(symbology, true));
    }
    enableSymbology(symbology, enabled) {
        this.settingsForSymbology(symbology).isEnabled = enabled;
    }
    setProperty(name, value) {
        this.properties[name] = value;
    }
    getProperty(name) {
        return this.properties[name];
    }
    get soundEnabled() {
        return this._soundEnabled;
    }
    set soundEnabled(enabled) {
        this._soundEnabled = enabled;
    }
    get hapticsEnabled() {
        return this._hapticsEnabled;
    }
    set hapticsEnabled(enabled) {
        this._hapticsEnabled = enabled;
    }
    setArucoDictionary(dictionary) {
        this._arucoDictionary = dictionary;
    }
    get cachingEnabled() {
        return this._cachingEnabled;
    }
    set cachingEnabled(enabled) {
        this._cachingEnabled = enabled;
    }
}
__decorate([
    nameForSerialization('soundEnabled')
], BarcodePickSettings.prototype, "_soundEnabled", void 0);
__decorate([
    nameForSerialization('hapticEnabled')
], BarcodePickSettings.prototype, "_hapticsEnabled", void 0);
__decorate([
    nameForSerialization('cachingEnabled')
], BarcodePickSettings.prototype, "_cachingEnabled", void 0);
__decorate([
    nameForSerialization('arucoDictionary')
], BarcodePickSettings.prototype, "_arucoDictionary", void 0);
__decorate([
    ignoreFromSerialization
], BarcodePickSettings, "barcodePickDefaults", null);

var BarcodePickState;
(function (BarcodePickState) {
    BarcodePickState["Ignore"] = "ignore";
    BarcodePickState["Picked"] = "picked";
    BarcodePickState["ToPick"] = "toPick";
    BarcodePickState["Unknown"] = "unknown";
})(BarcodePickState || (BarcodePickState = {}));

class BarcodePickViewEventHandlers {
    constructor(view, barcodePick, proxy, viewController) {
        this.view = view;
        this.barcodePick = barcodePick;
        this.proxy = proxy;
        this.viewController = viewController;
        // Bind all handler methods to 'this' to ensure the correct context when they are used as callbacks
        this.handleDidCompleteScanningSession = this.handleDidCompleteScanningSession.bind(this);
        this.handleDidUpdateScanningSession = this.handleDidUpdateScanningSession.bind(this);
        this.handleDidPick = this.handleDidPick.bind(this);
        this.handleDidUnpick = this.handleDidUnpick.bind(this);
        this.handleDidTapFinishButton = this.handleDidTapFinishButton.bind(this);
        this.handleDidStartScanning = this.handleDidStartScanning.bind(this);
        this.handleDidFreezeScanning = this.handleDidFreezeScanning.bind(this);
        this.handleDidPauseScanning = this.handleDidPauseScanning.bind(this);
        this.handleDidStopScanning = this.handleDidStopScanning.bind(this);
        this.handleProductIdentifierForItems = this.handleProductIdentifierForItems.bind(this);
    }
    setBarcodePickMapperCallback(callback) {
        this.barcodePickMapperCallback = callback;
    }
    handleDidCompleteScanningSession(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                console.error('BarcodePickViewEventHandlers DidCompleteScanningSession payload is null');
                return;
            }
            if (payload.viewId !== this.view.viewId) {
                return;
            }
            const session = BarcodePickScanningSession
                .fromJSON(JSON.parse(payload.session));
            this.notifyListenersOfDidCompleteScanningSession(session);
        });
    }
    handleDidUpdateScanningSession(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                console.error('BarcodePickViewEventHandlers DidUpdateScanningSession payload is null');
                return;
            }
            if (payload.viewId !== this.view.viewId) {
                return;
            }
            const session = BarcodePickScanningSession
                .fromJSON(JSON.parse(payload.session));
            this.notifyListenersOfDidUpdateScanningSession(session);
        });
    }
    handleDidPick(ev) {
        const payload = EventDataParser.parse(ev.data);
        if (payload === null) {
            console.error('BarcodePickViewEventHandlers DidPick payload is null');
            return;
        }
        if (payload.viewId !== this.view.viewId) {
            return;
        }
        const barcodePickActionCallback = new BarcodePickActionCallback();
        barcodePickActionCallback._viewController = this.viewController;
        barcodePickActionCallback._itemData = payload.itemData;
        this.view.actionListeners
            .forEach(listener => listener.didPickItem(payload.itemData, barcodePickActionCallback));
    }
    handleDidUnpick(ev) {
        const payload = EventDataParser.parse(ev.data);
        if (payload === null) {
            console.error('BarcodePickViewEventHandlers DidUnpick payload is null');
            return;
        }
        if (payload.viewId !== this.view.viewId) {
            return;
        }
        const barcodePickActionCallback = new BarcodePickActionCallback();
        barcodePickActionCallback._viewController = this.viewController;
        barcodePickActionCallback._itemData = payload.itemData;
        this.view.actionListeners
            .forEach(listener => listener.didUnpickItem(payload.itemData, barcodePickActionCallback));
    }
    handleDidTapFinishButton(ev) {
        var _a, _b;
        const payload = EventDataParser.parse(ev.data);
        if (payload === null) {
            console.error('BarcodePickViewEventHandlers DidTapFinishButton payload is null');
            return;
        }
        if (payload.viewId !== this.view.viewId) {
            return;
        }
        if (!this.view.uiListener) {
            return;
        }
        (_b = (_a = this.view) === null || _a === void 0 ? void 0 : _a.uiListener) === null || _b === void 0 ? void 0 : _b.didTapFinishButton(this.proxy);
    }
    handleDidStartScanning(ev) {
        const payload = EventDataParser.parse(ev.data);
        if (payload === null) {
            console.error('BarcodePickViewEventHandlers DidStartScanning payload is null');
            return;
        }
        if (payload.viewId !== this.view.viewId) {
            return;
        }
        this.view.listeners
            .forEach(listener => listener.didStartScanning(this.view));
    }
    handleDidFreezeScanning(ev) {
        const payload = EventDataParser.parse(ev.data);
        if (payload === null) {
            console.error('BarcodePickViewEventHandlers DidFreezeScanning payload is null');
            return;
        }
        if (payload.viewId !== this.view.viewId) {
            return;
        }
        this.view.listeners
            .forEach(listener => listener.didFreezeScanning(this.view));
    }
    handleDidPauseScanning(ev) {
        const payload = EventDataParser.parse(ev.data);
        if (payload === null) {
            console.error('BarcodePickViewEventHandlers DidPauseScanning payload is null');
            return;
        }
        if (payload.viewId !== this.view.viewId) {
            return;
        }
        this.view.listeners
            .forEach(listener => listener.didPauseScanning(this.view));
    }
    handleDidStopScanning(ev) {
        const payload = EventDataParser.parse(ev.data);
        if (payload === null) {
            console.error('BarcodePickViewEventHandlers DidStopScanning payload is null');
            return;
        }
        if (payload.viewId !== this.view.viewId) {
            return;
        }
        this.view.listeners
            .forEach(listener => listener.didStopScanning(this.view));
    }
    handleProductIdentifierForItems(ev) {
        const payload = EventDataParser.parse(ev.data);
        if (payload === null) {
            console.error('BarcodePickViewEventHandlers ProductIdentifierForItems payload is null');
            return;
        }
        if (payload.viewId !== this.view.viewId) {
            return;
        }
        if (!this.barcodePickMapperCallback) {
            return;
        }
        this.barcodePickMapperCallback.productIdentifierForItems(payload.itemsData, {
            onData: (callbackItems) => {
                this.finishOnProductIdentifierForItems(callbackItems);
            }
        });
    }
    handleDidUpdateSession(ev) {
        const payload = EventDataParser.parse(ev.data);
        if (payload === null) {
            console.error('BarcodePickViewEventHandlers DidUpdateSession payload is null');
            return;
        }
        if (payload.viewId !== this.view.viewId) {
            return;
        }
        const session = BarcodePickSession
            .fromJSON(JSON.parse(payload.session));
        this.notifyListenersOfDidUpdateSession(session);
    }
    finishOnProductIdentifierForItems(data) {
        return this.proxy.$finishOnProductIdentifierForItems({ viewId: this.view.viewId, itemsJson: JSON.stringify(data) });
    }
    notifyListenersOfDidCompleteScanningSession(session) {
        const mode = this.barcodePick;
        mode.isInListenerCallback = true;
        mode.listeners.forEach(listener => {
            if (listener.didCompleteScanningSession) {
                listener.didCompleteScanningSession(this.barcodePick, session);
            }
        });
        mode.isInListenerCallback = false;
    }
    notifyListenersOfDidUpdateScanningSession(session) {
        const mode = this.barcodePick;
        mode.isInListenerCallback = true;
        mode.listeners.forEach(listener => {
            if (listener.didUpdateScanningSession) {
                listener.didUpdateScanningSession(this.barcodePick, session);
            }
        });
        mode.isInListenerCallback = false;
    }
    notifyListenersOfDidUpdateSession(session) {
        const mode = this.barcodePick;
        mode.isInListenerCallback = true;
        mode.modeListeners.forEach(listener => {
            if (listener.didUpdateSession) {
                listener.didUpdateSession(this.barcodePick, session);
            }
        });
        mode.isInListenerCallback = false;
    }
}

var BarcodePickViewEvents;
(function (BarcodePickViewEvents) {
    BarcodePickViewEvents["didStartScanning"] = "BarcodePickViewListener.didStartScanning";
    BarcodePickViewEvents["didFreezeScanning"] = "BarcodePickViewListener.didFreezeScanning";
    BarcodePickViewEvents["didPauseScanning"] = "BarcodePickViewListener.didPauseScanning";
    BarcodePickViewEvents["didStopScanning"] = "BarcodePickViewListener.didStopScanning";
})(BarcodePickViewEvents || (BarcodePickViewEvents = {}));
var BarcodePickViewUiEvents;
(function (BarcodePickViewUiEvents) {
    BarcodePickViewUiEvents["didTapFinishButton"] = "BarcodePickViewUiListener.didTapFinishButton";
})(BarcodePickViewUiEvents || (BarcodePickViewUiEvents = {}));
var BarcodePickAsyncMapperProductProviderEvents;
(function (BarcodePickAsyncMapperProductProviderEvents) {
    BarcodePickAsyncMapperProductProviderEvents["onProductIdentifierForItems"] = "BarcodePickAsyncMapperProductProviderCallback.onProductIdentifierForItems";
})(BarcodePickAsyncMapperProductProviderEvents || (BarcodePickAsyncMapperProductProviderEvents = {}));
var BarcodePickScanningEvents;
(function (BarcodePickScanningEvents) {
    BarcodePickScanningEvents["didCompleteScanningSession"] = "BarcodePickScanningListener.didCompleteScanningSession";
    BarcodePickScanningEvents["didUpdateScanningSession"] = "BarcodePickScanningListener.didUpdateScanningSession";
})(BarcodePickScanningEvents || (BarcodePickScanningEvents = {}));
var BarcodePickActionEvents;
(function (BarcodePickActionEvents) {
    BarcodePickActionEvents["didPick"] = "BarcodePickActionListener.didPick";
    BarcodePickActionEvents["didUnpick"] = "BarcodePickActionListener.didUnpick";
})(BarcodePickActionEvents || (BarcodePickActionEvents = {}));
var BarcodePickListenerEvents;
(function (BarcodePickListenerEvents) {
    BarcodePickListenerEvents["didUpdateSession"] = "BarcodePickListener.didUpdateSession";
})(BarcodePickListenerEvents || (BarcodePickListenerEvents = {}));
class BarcodePickViewController extends BaseNewController {
    static forBarcodePick(view, nativeView) {
        return new BarcodePickViewController(view, nativeView);
    }
    constructor(view, nativeView) {
        super('BarcodePickViewProxy');
        this.isListeningForPickListeners = false;
        this.isListeningForScanningListeners = false;
        this.isListeningForActionListeners = false;
        this.isListeningForViewListeners = false;
        this.isListeningForViewUiListeners = false;
        this.isListeningForProductListeners = false;
        this.view = view;
        this.barcodePick = view.barcodePick;
        this.nativeView = nativeView;
        this.eventHandlers = new BarcodePickViewEventHandlers(this.view, this.barcodePick, this._proxy, this);
    }
    initialize() {
        // check if there are listeners to subscribe
        if (this.barcodePick.listeners.length > 0) {
            this.subscribeScanningListener();
        }
        if (this.barcodePick.modeListeners.length > 0) {
            this.subscribePickListener();
        }
        if (this.view.uiListener) {
            this.registerUiListener();
        }
        if (this.view.listeners.length > 0) {
            this.subscribePickViewListeners();
        }
        if (this.view.actionListeners.length > 0) {
            this.subscribeActionListeners();
        }
        if (this.barcodePick._productProvider) {
            const productProvider = this.barcodePick._productProvider;
            if (productProvider instanceof BarcodePickAsyncMapperProductProvider) {
                const callback = productProvider._callback;
                this.registerProductListener(callback);
            }
        }
    }
    start() {
        if (!this.isViewCreated) {
            return Promise.resolve();
        }
        return this._proxy.$pickViewStart({ viewId: this.view.viewId });
    }
    stop() {
        if (!this.isViewCreated) {
            return Promise.resolve();
        }
        return this._proxy.$pickViewStop({ viewId: this.view.viewId });
    }
    freeze() {
        if (!this.isViewCreated) {
            return Promise.resolve();
        }
        return this._proxy.$pickViewFreeze({ viewId: this.view.viewId });
    }
    reset() {
        if (!this.isViewCreated) {
            return Promise.resolve();
        }
        return this._proxy.$pickViewReset({ viewId: this.view.viewId });
    }
    pause() {
        if (!this.isViewCreated) {
            return Promise.resolve();
        }
        // Android: onPause is called.
        // iOS: pause is called.
        return this._proxy.$pickViewPause({ viewId: this.view.viewId });
    }
    resume() {
        if (!this.isViewCreated) {
            return Promise.resolve();
        }
        // Android: onResume is called.
        // iOS: start is called.
        return this._proxy.$pickViewResume({ viewId: this.view.viewId });
    }
    finishPickAction(itemData, result) {
        if (!this.isViewCreated) {
            return Promise.resolve();
        }
        return this._proxy.$finishPickAction({ viewId: this.view.viewId, code: itemData, result });
    }
    createNativeView() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.create();
            this.initialize();
        });
    }
    removeNativeView() {
        if (!this.isViewCreated) {
            return Promise.resolve();
        }
        return this._proxy.$removePickView({ viewId: this.view.viewId });
    }
    create() {
        const barcodePickView = this.view.toJSON();
        const json = JSON.stringify(barcodePickView);
        return this._proxy.$createPickView({ viewId: this.view.viewId, json });
    }
    dispose() {
        this.unsubscribeActionListeners();
        this.unsubscribePickViewListeners();
        this.unsubscribeScanningListener();
        this.unsubscribePickListener();
        this.unregisterUiListener();
        this.unregisterProductListener();
        this._proxy.dispose();
    }
    subscribeScanningListener() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isViewCreated) {
                return Promise.resolve();
            }
            if (this.isListeningForScanningListeners) {
                return Promise.resolve();
            }
            this._proxy.subscribeForEvents(Object.values(BarcodePickScanningEvents));
            this._proxy.$addBarcodePickScanningListener({ viewId: this.view.viewId });
            this._proxy.eventEmitter.on(BarcodePickScanningEvents.didCompleteScanningSession, this.eventHandlers.handleDidCompleteScanningSession.bind(this));
            this._proxy.eventEmitter.on(BarcodePickScanningEvents.didUpdateScanningSession, this.eventHandlers.handleDidUpdateScanningSession.bind(this));
            this.isListeningForScanningListeners = true;
        });
    }
    unsubscribeScanningListener() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isViewCreated) {
                return Promise.resolve();
            }
            if (!this.isListeningForScanningListeners) {
                return Promise.resolve();
            }
            this._proxy.unsubscribeFromEvents(Object.values(BarcodePickScanningEvents));
            this._proxy.eventEmitter.off(BarcodePickScanningEvents.didCompleteScanningSession, this.eventHandlers.handleDidCompleteScanningSession.bind(this));
            this._proxy.eventEmitter.off(BarcodePickScanningEvents.didUpdateScanningSession, this.eventHandlers.handleDidUpdateScanningSession.bind(this));
            this._proxy.$removeBarcodePickScanningListener({ viewId: this.view.viewId });
            this.isListeningForScanningListeners = false;
        });
    }
    subscribePickListener() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isViewCreated) {
                return Promise.resolve();
            }
            if (this.isListeningForPickListeners) {
                return Promise.resolve();
            }
            this._proxy.subscribeForEvents(Object.values(BarcodePickListenerEvents));
            this._proxy.$addBarcodePickListener({ viewId: this.view.viewId });
            this._proxy.eventEmitter.on(BarcodePickListenerEvents.didUpdateSession, this.eventHandlers.handleDidUpdateSession.bind(this));
            this.isListeningForPickListeners = true;
        });
    }
    unsubscribePickListener() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isViewCreated) {
                return Promise.resolve();
            }
            if (!this.isListeningForPickListeners) {
                return Promise.resolve();
            }
            this._proxy.unsubscribeFromEvents(Object.values(BarcodePickListenerEvents));
            this._proxy.eventEmitter.off(BarcodePickListenerEvents.didUpdateSession, this.eventHandlers.handleDidUpdateSession.bind(this));
            this._proxy.$removeBarcodePickListener({ viewId: this.view.viewId });
            this.isListeningForPickListeners = false;
        });
    }
    registerUiListener() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isViewCreated) {
                return Promise.resolve();
            }
            if (this.isListeningForViewUiListeners) {
                return Promise.resolve();
            }
            this._proxy.subscribeForEvents(Object.values(BarcodePickViewUiEvents));
            this._proxy.eventEmitter.on(BarcodePickViewUiEvents.didTapFinishButton, this.eventHandlers.handleDidTapFinishButton.bind(this));
            yield this._proxy.$registerBarcodePickViewUiListener({ viewId: this.view.viewId });
            this.isListeningForViewUiListeners = true;
        });
    }
    unregisterUiListener() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isViewCreated) {
                return Promise.resolve();
            }
            if (!this.isListeningForViewUiListeners) {
                return Promise.resolve();
            }
            this._proxy.unsubscribeFromEvents(Object.values(BarcodePickViewUiEvents));
            this._proxy.eventEmitter.off(BarcodePickViewUiEvents.didTapFinishButton, this.eventHandlers.handleDidTapFinishButton.bind(this));
            yield this._proxy.$unregisterBarcodePickViewUiListener({ viewId: this.view.viewId });
            this.isListeningForViewUiListeners = false;
        });
    }
    setUiListener(listener) {
        return __awaiter(this, void 0, void 0, function* () {
            if (listener) {
                yield this.registerUiListener();
            }
            else {
                yield this.unregisterUiListener();
            }
        });
    }
    subscribeActionListeners() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isViewCreated) {
                return Promise.resolve();
            }
            if (this.isListeningForActionListeners) {
                return Promise.resolve();
            }
            this._proxy.subscribeForEvents(Object.values(BarcodePickActionEvents));
            this._proxy.$addPickActionListener({ viewId: this.view.viewId });
            this._proxy.eventEmitter.on(BarcodePickActionEvents.didPick, this.eventHandlers.handleDidPick.bind(this));
            this._proxy.eventEmitter.on(BarcodePickActionEvents.didUnpick, this.eventHandlers.handleDidUnpick.bind(this));
            this.isListeningForActionListeners = true;
        });
    }
    unsubscribeActionListeners() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isViewCreated) {
                return Promise.resolve();
            }
            if (!this.isListeningForActionListeners) {
                return Promise.resolve();
            }
            this._proxy.unsubscribeFromEvents(Object.values(BarcodePickActionEvents));
            this._proxy.eventEmitter.off(BarcodePickActionEvents.didPick, this.eventHandlers.handleDidPick.bind(this));
            this._proxy.eventEmitter.off(BarcodePickActionEvents.didUnpick, this.eventHandlers.handleDidUnpick.bind(this));
            this._proxy.$removePickActionListener({ viewId: this.view.viewId });
            this.isListeningForActionListeners = false;
        });
    }
    subscribePickViewListeners() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isViewCreated) {
                return Promise.resolve();
            }
            if (this.isListeningForViewListeners) {
                return Promise.resolve();
            }
            this._proxy.subscribeForEvents(Object.values(BarcodePickViewEvents));
            this._proxy.eventEmitter.on(BarcodePickViewEvents.didStartScanning, this.eventHandlers.handleDidStartScanning.bind(this));
            this._proxy.eventEmitter.on(BarcodePickViewEvents.didFreezeScanning, this.eventHandlers.handleDidFreezeScanning.bind(this));
            this._proxy.eventEmitter.on(BarcodePickViewEvents.didPauseScanning, this.eventHandlers.handleDidPauseScanning.bind(this));
            this._proxy.eventEmitter.on(BarcodePickViewEvents.didStopScanning, this.eventHandlers.handleDidStopScanning.bind(this));
            this._proxy.$addPickViewListener({ viewId: this.view.viewId });
            this.isListeningForViewListeners = true;
        });
    }
    unsubscribePickViewListeners() {
        if (!this.isViewCreated) {
            return Promise.resolve();
        }
        if (!this.isListeningForViewListeners) {
            return Promise.resolve();
        }
        this._proxy.unsubscribeFromEvents(Object.values(BarcodePickViewEvents));
        this._proxy.eventEmitter.off(BarcodePickViewEvents.didStartScanning, this.eventHandlers.handleDidStartScanning.bind(this));
        this._proxy.eventEmitter.off(BarcodePickViewEvents.didFreezeScanning, this.eventHandlers.handleDidFreezeScanning.bind(this));
        this._proxy.eventEmitter.off(BarcodePickViewEvents.didPauseScanning, this.eventHandlers.handleDidPauseScanning.bind(this));
        this._proxy.eventEmitter.off(BarcodePickViewEvents.didStopScanning, this.eventHandlers.handleDidStopScanning.bind(this));
        this._proxy.$removePickViewListener({ viewId: this.view.viewId });
        this.isListeningForViewListeners = false;
    }
    // Methods migrated from BarcodePickProductController
    registerProductListener(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.eventHandlers.setBarcodePickMapperCallback(callback);
            if (!this.isViewCreated) {
                return Promise.resolve();
            }
            if (this.isListeningForProductListeners) {
                return Promise.resolve();
            }
            this._proxy.subscribeForEvents(Object.values(BarcodePickAsyncMapperProductProviderEvents));
            this._proxy.$registerOnProductIdentifierForItemsListener({ viewId: this.view.viewId });
            this._proxy.eventEmitter.on(BarcodePickAsyncMapperProductProviderEvents.onProductIdentifierForItems, this.eventHandlers.handleProductIdentifierForItems.bind(this));
            this.isListeningForProductListeners = true;
        });
    }
    unregisterProductListener() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isViewCreated) {
                return Promise.resolve();
            }
            if (!this.isListeningForProductListeners) {
                return Promise.resolve();
            }
            this._proxy.unsubscribeFromEvents(Object.values(BarcodePickAsyncMapperProductProviderEvents));
            this._proxy.eventEmitter.off(BarcodePickAsyncMapperProductProviderEvents.onProductIdentifierForItems, this.eventHandlers.handleProductIdentifierForItems.bind(this));
            this._proxy.$unregisterOnProductIdentifierForItemsListener({ viewId: this.view.viewId });
            this.isListeningForProductListeners = false;
        });
    }
    finishOnProductIdentifierForItems(data) {
        if (!this.isViewCreated) {
            return Promise.resolve();
        }
        return this._proxy.$finishOnProductIdentifierForItems({
            viewId: this.view.viewId,
            itemsJson: JSON.stringify(data),
        });
    }
    get isViewCreated() {
        return this.view.viewId !== -1;
    }
}

class BaseBarcodePickView extends DefaultSerializeable {
    get viewId() {
        return this._viewId;
    }
    get context() {
        return this._context;
    }
    set context(context) {
        this._context = context;
    }
    get uiListener() {
        return this._barcodePickViewUiListener;
    }
    set uiListener(value) {
        this._barcodePickViewUiListener = value;
        this.viewController.setUiListener(value);
    }
    constructor({ context, barcodePick, settings, cameraSettings, }) {
        super();
        this.actionListeners = [];
        this.listeners = [];
        this.isStarted = false;
        this._context = null;
        this.isViewCreated = false;
        this._viewId = -1; // -1 means the view is not created yet
        this._barcodePickViewUiListener = null;
        this.context = context;
        this.barcodePick = barcodePick;
        this.settings = settings;
        this.cameraSettings = cameraSettings;
        this.barcodePick.privateContext = context;
    }
    initialize(nativeView) {
        this.viewController = BarcodePickViewController.forBarcodePick(this, nativeView);
    }
    createNativeView(viewId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isViewCreated) {
                return Promise.resolve();
            }
            this._viewId = viewId;
            yield this.viewController.createNativeView();
            this.isViewCreated = true;
        });
    }
    removeNativeView() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.viewController.removeNativeView();
            this.isViewCreated = false;
        });
    }
    dispose() {
        this.viewController.dispose();
        this.isViewCreated = false;
    }
    start() {
        this.isStarted = true;
        this.viewController.start();
    }
    stop() {
        this.viewController.stop();
    }
    freeze() {
        this.viewController.freeze();
    }
    pause() {
        this.viewController.pause();
    }
    resume() {
        this.viewController.resume();
    }
    reset() {
        this.viewController.reset();
    }
    addActionListener(listener) {
        this.checkAndSubscribeActionListeners();
        if (this.actionListeners.findIndex(l => l === listener) === -1) {
            this.actionListeners.push(listener);
        }
    }
    checkAndSubscribeActionListeners() {
        if (this.actionListeners.length === 0) {
            this.viewController.subscribeActionListeners();
        }
    }
    removeActionListener(listener) {
        if (this.actionListeners.findIndex(l => l === listener) === -1) {
            return;
        }
        this.actionListeners.splice(this.actionListeners.indexOf(listener), 1);
        this.checkAndUnsubscribeActionListeners();
    }
    checkAndUnsubscribeActionListeners() {
        if (this.actionListeners.length === 0) {
            this.viewController.unsubscribeActionListeners();
        }
    }
    addListener(listener) {
        this.checkAndSubscribeListeners();
        if (this.listeners.findIndex(l => l === listener) === -1) {
            this.listeners.push(listener);
        }
    }
    checkAndSubscribeListeners() {
        if (this.listeners.length === 0) {
            this.viewController.subscribePickViewListeners();
        }
    }
    removeListener(listener) {
        if (this.listeners.findIndex(l => l === listener) === -1) {
            return;
        }
        this.listeners.splice(this.listeners.indexOf(listener), 1);
        this.checkAndUnsubscribeListeners();
    }
    checkAndUnsubscribeListeners() {
        if (this.listeners.length === 0) {
            this.viewController.unsubscribePickViewListeners();
        }
    }
    toJSON() {
        return {
            View: {
                viewId: this._viewId,
                hasActionListeners: this.actionListeners.length > 0,
                hasViewListeners: this.listeners.length > 0,
                hasViewUiListener: this.uiListener ? true : false,
                isStarted: this.isStarted,
                viewSettings: this.settings.toJSON(),
                cameraSettings: this.cameraSettings.toJSON(),
            },
            BarcodePick: this.barcodePick.toJSON(),
        };
    }
}
__decorate([
    ignoreFromSerialization
], BaseBarcodePickView.prototype, "viewController", void 0);
__decorate([
    ignoreFromSerialization
], BaseBarcodePickView.prototype, "actionListeners", void 0);
__decorate([
    ignoreFromSerialization
], BaseBarcodePickView.prototype, "listeners", void 0);
__decorate([
    nameForSerialization('isStarted')
], BaseBarcodePickView.prototype, "isStarted", void 0);
__decorate([
    ignoreFromSerialization
], BaseBarcodePickView.prototype, "_context", void 0);
__decorate([
    ignoreFromSerialization
], BaseBarcodePickView.prototype, "isViewCreated", void 0);
__decorate([
    ignoreFromSerialization
], BaseBarcodePickView.prototype, "_barcodePickViewUiListener", void 0);

class BarcodePickViewSettings extends DefaultSerializeable {
    static get barcodePickDefaults() {
        return getBarcodePickDefaults();
    }
    constructor() {
        super();
        this._highlightStyle = BarcodePickViewSettings.barcodePickDefaults.ViewSettings.highlightStyle;
        this._showLoadingDialog = BarcodePickViewSettings.barcodePickDefaults.ViewSettings.showLoadingDialog;
        this._showFinishButton = BarcodePickViewSettings.barcodePickDefaults.ViewSettings.showFinishButton;
        this._showPauseButton = BarcodePickViewSettings.barcodePickDefaults.ViewSettings.showPauseButton;
        this._showZoomButton = BarcodePickViewSettings.barcodePickDefaults.ViewSettings.showZoomButton;
        this._loadingDialogTextForPicking = BarcodePickViewSettings.barcodePickDefaults.ViewSettings.loadingDialogTextForPicking;
        this._loadingDialogTextForUnpicking = BarcodePickViewSettings.barcodePickDefaults.ViewSettings.loadingDialogTextForUnpicking;
        this._showGuidelines = BarcodePickViewSettings.barcodePickDefaults.ViewSettings.showGuidelines;
        this._initialGuidelineText = BarcodePickViewSettings.barcodePickDefaults.ViewSettings.initialGuidelineText;
        this._moveCloserGuidelineText = BarcodePickViewSettings.barcodePickDefaults.ViewSettings.moveCloserGuidelineText;
        this._showHints = BarcodePickViewSettings.barcodePickDefaults.ViewSettings.showHints;
        this._onFirstItemToPickFoundHintText = BarcodePickViewSettings.barcodePickDefaults.ViewSettings.onFirstItemToPickFoundHintText;
        this._onFirstItemPickCompletedHintText = BarcodePickViewSettings.barcodePickDefaults.ViewSettings.onFirstItemPickCompletedHintText;
        this._onFirstUnmarkedItemPickCompletedHintText = BarcodePickViewSettings.barcodePickDefaults.ViewSettings.onFirstUnmarkedItemPickCompletedHintText;
        this._onFirstItemUnpickCompletedHintText = BarcodePickViewSettings.barcodePickDefaults.ViewSettings.onFirstItemUnpickCompletedHintText;
    }
    get highlightStyle() {
        return this._highlightStyle;
    }
    set highlightStyle(style) {
        this._highlightStyle = style;
    }
    get showLoadingDialog() {
        return this._showLoadingDialog;
    }
    set showLoadingDialog(style) {
        this._showLoadingDialog = style;
    }
    get showFinishButton() {
        return this._showFinishButton;
    }
    set showFinishButton(show) {
        this._showFinishButton = show;
    }
    get showPauseButton() {
        return this._showPauseButton;
    }
    set showPauseButton(show) {
        this._showPauseButton = show;
    }
    get showZoomButton() {
        return this._showZoomButton;
    }
    set showZoomButton(show) {
        this._showZoomButton = show;
    }
    get loadingDialogTextForPicking() {
        return this._loadingDialogTextForPicking;
    }
    set loadingDialogTextForPicking(text) {
        this._loadingDialogTextForPicking = text;
    }
    get loadingDialogTextForUnpicking() {
        return this._loadingDialogTextForUnpicking;
    }
    set loadingDialogTextForUnpicking(text) {
        this._loadingDialogTextForUnpicking = text;
    }
    get showGuidelines() {
        return this._showGuidelines;
    }
    set showGuidelines(show) {
        this._showGuidelines = show;
    }
    get initialGuidelineText() {
        return this._initialGuidelineText;
    }
    set initialGuidelineText(text) {
        this._initialGuidelineText = text;
    }
    get moveCloserGuidelineText() {
        return this._moveCloserGuidelineText;
    }
    set moveCloserGuidelineText(text) {
        this._moveCloserGuidelineText = text;
    }
    get showHints() {
        return this._showHints;
    }
    set showHints(show) {
        this._showHints = show;
    }
    get onFirstItemToPickFoundHintText() {
        return this._onFirstItemToPickFoundHintText;
    }
    set onFirstItemToPickFoundHintText(text) {
        this._onFirstItemToPickFoundHintText = text;
    }
    get onFirstItemPickCompletedHintText() {
        return this._onFirstItemPickCompletedHintText;
    }
    set onFirstItemPickCompletedHintText(text) {
        this._onFirstItemPickCompletedHintText = text;
    }
    get onFirstUnmarkedItemPickCompletedHintText() {
        return this._onFirstUnmarkedItemPickCompletedHintText;
    }
    set onFirstUnmarkedItemPickCompletedHintText(text) {
        this._onFirstUnmarkedItemPickCompletedHintText = text;
    }
    get onFirstItemUnpickCompletedHintText() {
        return this._onFirstItemUnpickCompletedHintText;
    }
    set onFirstItemUnpickCompletedHintText(text) {
        this._onFirstItemUnpickCompletedHintText = text;
    }
}
__decorate([
    nameForSerialization('highlightStyle')
], BarcodePickViewSettings.prototype, "_highlightStyle", void 0);
__decorate([
    nameForSerialization('shouldShowLoadingDialog')
], BarcodePickViewSettings.prototype, "_showLoadingDialog", void 0);
__decorate([
    nameForSerialization('showFinishButton')
], BarcodePickViewSettings.prototype, "_showFinishButton", void 0);
__decorate([
    nameForSerialization('showPauseButton')
], BarcodePickViewSettings.prototype, "_showPauseButton", void 0);
__decorate([
    nameForSerialization('showZoomButton')
], BarcodePickViewSettings.prototype, "_showZoomButton", void 0);
__decorate([
    nameForSerialization('showLoadingDialogTextForPicking')
], BarcodePickViewSettings.prototype, "_loadingDialogTextForPicking", void 0);
__decorate([
    nameForSerialization('showLoadingDialogTextForUnpicking')
], BarcodePickViewSettings.prototype, "_loadingDialogTextForUnpicking", void 0);
__decorate([
    nameForSerialization('shouldShowGuidelines')
], BarcodePickViewSettings.prototype, "_showGuidelines", void 0);
__decorate([
    nameForSerialization('initialGuidelineText')
], BarcodePickViewSettings.prototype, "_initialGuidelineText", void 0);
__decorate([
    nameForSerialization('moveCloserGuidelineText')
], BarcodePickViewSettings.prototype, "_moveCloserGuidelineText", void 0);
__decorate([
    nameForSerialization('shouldShowHints')
], BarcodePickViewSettings.prototype, "_showHints", void 0);
__decorate([
    nameForSerialization('onFirstItemToPickFoundHintText')
], BarcodePickViewSettings.prototype, "_onFirstItemToPickFoundHintText", void 0);
__decorate([
    nameForSerialization('onFirstItemPickCompletedHintText')
], BarcodePickViewSettings.prototype, "_onFirstItemPickCompletedHintText", void 0);
__decorate([
    nameForSerialization('onFirstUnmarkedItemPickCompletedHintText')
], BarcodePickViewSettings.prototype, "_onFirstUnmarkedItemPickCompletedHintText", void 0);
__decorate([
    nameForSerialization('onFirstItemUnpickCompletedHintText')
], BarcodePickViewSettings.prototype, "_onFirstItemUnpickCompletedHintText", void 0);
__decorate([
    ignoreFromSerialization
], BarcodePickViewSettings, "barcodePickDefaults", null);

class BrushForStateObject extends DefaultSerializeable {
}
__decorate([
    nameForSerialization('barcodePickState')
], BrushForStateObject.prototype, "barcodePickState", void 0);
__decorate([
    nameForSerialization('brush')
], BrushForStateObject.prototype, "brush", void 0);

class BarcodePickStatusIconSettings extends DefaultSerializeable {
    constructor() {
        super(...arguments);
        this._ratioToHighlightSize = BarcodePickStatusIconSettings.barcodePickDefaults.BarcodePickStatusIconSettings.ratioToHighlightSize;
        this._minSize = BarcodePickStatusIconSettings.barcodePickDefaults.BarcodePickStatusIconSettings.minSize;
        this._maxSize = BarcodePickStatusIconSettings.barcodePickDefaults.BarcodePickStatusIconSettings.maxSize;
    }
    get ratioToHighlightSize() {
        return this._ratioToHighlightSize;
    }
    set ratioToHighlightSize(value) {
        this._ratioToHighlightSize = value;
    }
    get minSize() {
        return this._minSize;
    }
    set minSize(value) {
        this._minSize = value;
    }
    get maxSize() {
        return this._maxSize;
    }
    set maxSize(value) {
        this._maxSize = value;
    }
    static get barcodePickDefaults() {
        return getBarcodePickDefaults();
    }
    static fromJSON(json) {
        if (json == undefined) {
            return null;
        }
        const barcodePickStatusIconSettings = new BarcodePickStatusIconSettings();
        barcodePickStatusIconSettings._ratioToHighlightSize = json === null || json === void 0 ? void 0 : json.ratioToHighlightSize;
        barcodePickStatusIconSettings._minSize = json === null || json === void 0 ? void 0 : json.minSize;
        barcodePickStatusIconSettings._maxSize = json === null || json === void 0 ? void 0 : json.maxSize;
        return barcodePickStatusIconSettings;
    }
}
__decorate([
    nameForSerialization('ratioToHighlightSize')
], BarcodePickStatusIconSettings.prototype, "_ratioToHighlightSize", void 0);
__decorate([
    nameForSerialization('minSize')
], BarcodePickStatusIconSettings.prototype, "_minSize", void 0);
__decorate([
    nameForSerialization('maxSize')
], BarcodePickStatusIconSettings.prototype, "_maxSize", void 0);
__decorate([
    ignoreFromSerialization
], BarcodePickStatusIconSettings, "barcodePickDefaults", null);

class Dot extends DefaultSerializeable {
    static get barcodePickDefaults() {
        return getBarcodePickDefaults();
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor() {
        super();
        this._type = 'dot';
        this._brushesForState = Dot.barcodePickDefaults.BarcodePickViewHighlightStyle.Dot.brushesForState;
    }
    getBrushForState(state) {
        return (this._brushesForState.filter(item => item.barcodePickState === state)[0] || {}).brush;
    }
    setBrushForState(brush, state) {
        const indexToUpdate = this._brushesForState.findIndex(item => item.barcodePickState === state);
        this._brushesForState[indexToUpdate].brush = brush;
    }
}
__decorate([
    nameForSerialization('type')
], Dot.prototype, "_type", void 0);
__decorate([
    nameForSerialization('brushesForState')
], Dot.prototype, "_brushesForState", void 0);
__decorate([
    ignoreFromSerialization
], Dot, "barcodePickDefaults", null);

class IconForStateObject extends DefaultSerializeable {
    constructor(barcodePickState, icon) {
        super();
        this._barcodePickState = barcodePickState;
        this._icon = icon;
    }
    get barcodePickState() {
        return this._barcodePickState;
    }
    get icon() {
        return this._icon;
    }
}
__decorate([
    nameForSerialization('barcodePickState')
], IconForStateObject.prototype, "_barcodePickState", void 0);
__decorate([
    nameForSerialization('icon')
], IconForStateObject.prototype, "_icon", void 0);

class DotWithIcons extends DefaultSerializeable {
    static get barcodePickDefaults() {
        return getBarcodePickDefaults();
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor() {
        super();
        this._type = 'dotWithIcons';
        this._brushesForState = DotWithIcons.barcodePickDefaults.BarcodePickViewHighlightStyle.DotWithIcons.brushesForState;
        this._iconsForState = [];
    }
    getBrushForState(state) {
        return (this._brushesForState.filter(item => item.barcodePickState === state)[0] || {}).brush;
    }
    setBrushForState(brush, state) {
        const indexToUpdate = this._brushesForState.findIndex(item => item.barcodePickState === state);
        this._brushesForState[indexToUpdate].brush = brush;
    }
    setIconForState(image, state) {
        const indexToUpdate = this._iconsForState.findIndex(item => item.barcodePickState === state);
        if (indexToUpdate > -1) {
            this._iconsForState.splice(indexToUpdate, 1);
        }
        this._iconsForState.push(new IconForStateObject(state, image));
    }
}
__decorate([
    nameForSerialization('type')
], DotWithIcons.prototype, "_type", void 0);
__decorate([
    nameForSerialization('brushesForState')
], DotWithIcons.prototype, "_brushesForState", void 0);
__decorate([
    nameForSerialization('iconsForState')
], DotWithIcons.prototype, "_iconsForState", void 0);
__decorate([
    ignoreFromSerialization
], DotWithIcons, "barcodePickDefaults", null);

class Rectangular extends DefaultSerializeable {
    static get barcodePickDefaults() {
        return getBarcodePickDefaults();
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor() {
        super();
        this._type = 'rectangular';
        this._brushesForState = Rectangular.barcodePickDefaults.BarcodePickViewHighlightStyle.Rectangular.brushesForState;
        this._minimumHighlightWidth = Rectangular.barcodePickDefaults.BarcodePickViewHighlightStyle.RectangularWithIcons.minimumHighlightWidth;
        this._minimumHighlightHeight = Rectangular.barcodePickDefaults.BarcodePickViewHighlightStyle.RectangularWithIcons.minimumHighlightHeight;
    }
    getBrushForState(state) {
        return (this._brushesForState.filter(item => item.barcodePickState === state)[0] || {}).brush;
    }
    setBrushForState(brush, state) {
        const indexToUpdate = this._brushesForState.findIndex(item => item.barcodePickState === state);
        this._brushesForState[indexToUpdate].brush = brush;
    }
    get minimumHighlightHeight() {
        return this._minimumHighlightHeight;
    }
    set minimumHighlightHeight(value) {
        this._minimumHighlightHeight = value;
    }
    get minimumHighlightWidth() {
        return this._minimumHighlightWidth;
    }
    set minimumHighlightWidth(value) {
        this._minimumHighlightWidth = value;
    }
}
__decorate([
    nameForSerialization('type')
], Rectangular.prototype, "_type", void 0);
__decorate([
    nameForSerialization('brushesForState')
], Rectangular.prototype, "_brushesForState", void 0);
__decorate([
    nameForSerialization('minimumHighlightWidth')
], Rectangular.prototype, "_minimumHighlightWidth", void 0);
__decorate([
    nameForSerialization('minimumHighlightHeight')
], Rectangular.prototype, "_minimumHighlightHeight", void 0);
__decorate([
    ignoreFromSerialization
], Rectangular, "barcodePickDefaults", null);

class RectangularWithIcons extends DefaultSerializeable {
    static get barcodePickDefaults() {
        return getBarcodePickDefaults();
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor() {
        super();
        this._type = 'rectangularWithIcons';
        this._brushesForState = RectangularWithIcons.barcodePickDefaults.BarcodePickViewHighlightStyle.RectangularWithIcons.brushesForState;
        this._iconsForState = [];
        this._minimumHighlightWidth = RectangularWithIcons.barcodePickDefaults.BarcodePickViewHighlightStyle.RectangularWithIcons.minimumHighlightWidth;
        this._minimumHighlightHeight = RectangularWithIcons.barcodePickDefaults.BarcodePickViewHighlightStyle.RectangularWithIcons.minimumHighlightHeight;
    }
    getBrushForState(state) {
        return (this._brushesForState.filter(item => item.barcodePickState === state)[0] || {}).brush;
    }
    setBrushForState(brush, state) {
        const indexToUpdate = this._brushesForState.findIndex(item => item.barcodePickState === state);
        this._brushesForState[indexToUpdate].brush = brush;
    }
    setIconForState(image, state) {
        const indexToUpdate = this._iconsForState.findIndex(item => item.barcodePickState === state);
        if (indexToUpdate > -1) {
            this._iconsForState.splice(indexToUpdate, 1);
        }
        this._iconsForState.push(new IconForStateObject(state, image));
    }
    get statusIconSettings() {
        return this._statusIconSettings;
    }
    set statusIconSettings(value) {
        this._statusIconSettings = value;
    }
    get minimumHighlightHeight() {
        return this._minimumHighlightHeight;
    }
    set minimumHighlightHeight(value) {
        this._minimumHighlightHeight = value;
    }
    get minimumHighlightWidth() {
        return this._minimumHighlightWidth;
    }
    set minimumHighlightWidth(value) {
        this._minimumHighlightWidth = value;
    }
}
__decorate([
    nameForSerialization('type')
], RectangularWithIcons.prototype, "_type", void 0);
__decorate([
    nameForSerialization('brushesForState')
], RectangularWithIcons.prototype, "_brushesForState", void 0);
__decorate([
    nameForSerialization('iconsForState')
], RectangularWithIcons.prototype, "_iconsForState", void 0);
__decorate([
    nameForSerialization('statusIconSettings')
], RectangularWithIcons.prototype, "_statusIconSettings", void 0);
__decorate([
    nameForSerialization('minimumHighlightWidth')
], RectangularWithIcons.prototype, "_minimumHighlightWidth", void 0);
__decorate([
    nameForSerialization('minimumHighlightHeight')
], RectangularWithIcons.prototype, "_minimumHighlightHeight", void 0);
__decorate([
    ignoreFromSerialization
], RectangularWithIcons, "barcodePickDefaults", null);

class BarcodeFindFeedback extends DefaultSerializeable {
    constructor() {
        super(...arguments);
        this.controller = null;
        this._found = BarcodeFindFeedback.barcodeFindDefaults.Feedback.found;
        this._itemListUpdated = BarcodeFindFeedback.barcodeFindDefaults.Feedback.itemListUpdated;
    }
    get found() {
        return this._found;
    }
    set found(success) {
        this._found = success;
        this.updateFeedback();
    }
    get itemListUpdated() {
        return this._itemListUpdated;
    }
    set itemListUpdated(failure) {
        this._itemListUpdated = failure;
        this.updateFeedback();
    }
    updateFeedback() {
        var _a;
        (_a = this.controller) === null || _a === void 0 ? void 0 : _a.updateFeedback(JSON.stringify(this.toJSON()));
    }
    static get barcodeFindDefaults() {
        return getBarcodeFindDefaults();
    }
    static get defaultFeedback() {
        return new BarcodeFindFeedback();
    }
}
__decorate([
    ignoreFromSerialization
], BarcodeFindFeedback.prototype, "controller", void 0);
__decorate([
    nameForSerialization('found')
], BarcodeFindFeedback.prototype, "_found", void 0);
__decorate([
    nameForSerialization('itemListUpdated')
], BarcodeFindFeedback.prototype, "_itemListUpdated", void 0);

class BarcodeFind extends DefaultSerializeable {
    constructor(settings) {
        super();
        this.type = 'barcodeFind';
        this._feedback = BarcodeFindFeedback.defaultFeedback;
        this._enabled = true;
        this._isInCallback = false;
        this.itemsToFind = null;
        this._hasBarcodeTransformer = false;
        this._hasListeners = false;
        this.listeners = [];
        this._controller = null;
        this._dataCaptureContext = null;
        this.barcodeTransformer = null;
        this._settings = settings;
        this._feedback.controller = this._controller;
    }
    static get barcodeFindDefaults() {
        return getBarcodeFindDefaults();
    }
    static createRecommendedCameraSettings() {
        return new CameraSettings(BarcodeFind.barcodeFindDefaults.RecommendedCameraSettings);
    }
    get context() {
        return this._dataCaptureContext;
    }
    get isEnabled() {
        return this._enabled;
    }
    set isEnabled(value) {
        var _a;
        this._enabled = value;
        (_a = this._controller) === null || _a === void 0 ? void 0 : _a.setModeEnabledState(value);
    }
    get feedback() {
        return this._feedback;
    }
    set feedback(value) {
        var _a;
        this._feedback = value;
        this._feedback.controller = this._controller;
        (_a = this._controller) === null || _a === void 0 ? void 0 : _a.updateFeedback(JSON.stringify(value.toJSON()));
    }
    applySettings(settings) {
        this._settings = settings;
        return this.update();
    }
    addListener(listener) {
        this.checkAndSubscribeListeners();
        if (this.listeners.includes(listener)) {
            return;
        }
        this.listeners.push(listener);
        this._hasListeners = this.listeners.length > 0;
    }
    checkAndSubscribeListeners() {
        var _a;
        if (this.listeners.length === 0) {
            (_a = this.controller) === null || _a === void 0 ? void 0 : _a.subscribeModeEvents();
        }
    }
    removeListener(listener) {
        if (!this.listeners.includes(listener)) {
            return;
        }
        this.listeners.splice(this.listeners.indexOf(listener));
        this.checkAndUnsubscribeListeners();
        this._hasListeners = this.listeners.length > 0;
    }
    setBarcodeTransformer(barcodeTransformer) {
        var _a, _b;
        this.barcodeTransformer = barcodeTransformer;
        this._hasBarcodeTransformer = this.barcodeTransformer != null;
        if (this._hasBarcodeTransformer) {
            (_a = this.controller) === null || _a === void 0 ? void 0 : _a.setBarcodeTransformer();
        }
        else {
            (_b = this.controller) === null || _b === void 0 ? void 0 : _b.unsetBarcodeTransformer();
        }
    }
    checkAndUnsubscribeListeners() {
        var _a;
        if (this.listeners.length > 0) {
            return;
        }
        (_a = this.controller) === null || _a === void 0 ? void 0 : _a.unsubscribeModeEvents();
    }
    setItemList(items) {
        var _a, _b;
        this.itemsToFind = JSON.stringify(items.map(item => item.toJSON()));
        return (_b = (_a = this.controller) === null || _a === void 0 ? void 0 : _a.setItemList(items)) !== null && _b !== void 0 ? _b : Promise.resolve();
    }
    start() {
        var _a, _b;
        return (_b = (_a = this.controller) === null || _a === void 0 ? void 0 : _a.start()) !== null && _b !== void 0 ? _b : Promise.resolve();
    }
    pause() {
        var _a, _b;
        return (_b = (_a = this.controller) === null || _a === void 0 ? void 0 : _a.pause()) !== null && _b !== void 0 ? _b : Promise.resolve();
    }
    stop() {
        var _a, _b;
        return (_b = (_a = this.controller) === null || _a === void 0 ? void 0 : _a.stop()) !== null && _b !== void 0 ? _b : Promise.resolve();
    }
    update() {
        var _a, _b;
        return (_b = (_a = this.controller) === null || _a === void 0 ? void 0 : _a.updateMode()) !== null && _b !== void 0 ? _b : Promise.resolve();
    }
    get controller() {
        return this._controller;
    }
    set controller(newController) {
        this._controller = newController;
        this._feedback.controller = this._controller;
    }
}
__decorate([
    nameForSerialization('feedback')
], BarcodeFind.prototype, "_feedback", void 0);
__decorate([
    nameForSerialization('enabled')
], BarcodeFind.prototype, "_enabled", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeFind.prototype, "_isInCallback", void 0);
__decorate([
    nameForSerialization('settings')
], BarcodeFind.prototype, "_settings", void 0);
__decorate([
    nameForSerialization('hasBarcodeTransformer')
], BarcodeFind.prototype, "_hasBarcodeTransformer", void 0);
__decorate([
    nameForSerialization('hasListeners')
], BarcodeFind.prototype, "_hasListeners", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeFind.prototype, "listeners", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeFind.prototype, "_controller", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeFind.prototype, "_dataCaptureContext", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeFind, "barcodeFindDefaults", null);

class BarcodeFindItem extends DefaultSerializeable {
    constructor(searchOptions, content) {
        super();
        this._searchOptions = searchOptions;
        this._content = content;
    }
    get searchOptions() {
        return this._searchOptions;
    }
    get content() {
        return this._content;
    }
}
__decorate([
    nameForSerialization('searchOptions')
], BarcodeFindItem.prototype, "_searchOptions", void 0);
__decorate([
    nameForSerialization('content')
], BarcodeFindItem.prototype, "_content", void 0);

class BarcodeFindItemContent extends DefaultSerializeable {
    constructor(info, additionalInfo, image) {
        super();
        this._info = info;
        this._additionalInfo = additionalInfo;
        this._image = image;
    }
    get info() {
        var _a;
        return (_a = this._info) !== null && _a !== void 0 ? _a : null;
    }
    get additionalInfo() {
        var _a;
        return (_a = this._additionalInfo) !== null && _a !== void 0 ? _a : null;
    }
    get image() {
        var _a;
        return (_a = this._image) !== null && _a !== void 0 ? _a : null;
    }
}
__decorate([
    nameForSerialization('info')
], BarcodeFindItemContent.prototype, "_info", void 0);
__decorate([
    nameForSerialization('additionalInfo')
], BarcodeFindItemContent.prototype, "_additionalInfo", void 0);
__decorate([
    nameForSerialization('image')
], BarcodeFindItemContent.prototype, "_image", void 0);

class BarcodeFindItemSearchOptions extends DefaultSerializeable {
    constructor(barcodeData) {
        super();
        this._brush = null;
        this._barcodeData = barcodeData;
    }
    static withBrush(barcodeData, brush) {
        const options = new BarcodeFindItemSearchOptions(barcodeData);
        options._brush = brush;
        return options;
    }
    get barcodeData() {
        return this._barcodeData;
    }
    get brush() {
        return this._brush;
    }
}
__decorate([
    nameForSerialization("barcodeData")
], BarcodeFindItemSearchOptions.prototype, "_barcodeData", void 0);
__decorate([
    nameForSerialization("brush")
], BarcodeFindItemSearchOptions.prototype, "_brush", void 0);

class BarcodeFindSession {
    get trackedBarcodes() {
        return this._trackedBarcodes;
    }
    static fromJSON(json) {
        const session = new BarcodeFindSession();
        session._trackedBarcodes = json.trackedBarcodes;
        return session;
    }
}

class BarcodeFindSettings extends DefaultSerializeable {
    constructor() {
        super();
        this._symbologies = {};
        this._properties = {};
    }
    static get barcodeDefaults() {
        return getBarcodeDefaults();
    }
    settingsForSymbology(symbology) {
        const identifier = symbology.toString();
        if (!this._symbologies[identifier]) {
            const symbologySettings = BarcodeFindSettings.barcodeDefaults.SymbologySettings[identifier];
            this._symbologies[identifier] = symbologySettings;
        }
        return this._symbologies[identifier];
    }
    enableSymbologies(symbologies) {
        symbologies.forEach(symbology => this.enableSymbology(symbology, true));
    }
    enableSymbology(symbology, enabled) {
        this.settingsForSymbology(symbology).isEnabled = enabled;
    }
    get enabledSymbologies() {
        return Object.keys(this._symbologies)
            .filter(symbology => this._symbologies[symbology].isEnabled);
    }
    setProperty(name, value) {
        this._properties[name] = value;
    }
    getProperty(name) {
        return this._properties[name];
    }
}
__decorate([
    nameForSerialization('symbologies')
], BarcodeFindSettings.prototype, "_symbologies", void 0);
__decorate([
    nameForSerialization('properties')
], BarcodeFindSettings.prototype, "_properties", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeFindSettings, "barcodeDefaults", null);

class BarcodeFindViewSettings extends DefaultSerializeable {
    static get barcodeFindViewSettingsDefaults() {
        return getBarcodeFindDefaults().BarcodeFindViewSettings;
    }
    constructor(inListItemColor, notInListItemColor, soundEnabled, hapticEnabled, hardwareTriggerEnabled, hardwareTriggerKeyCode, progressBarStartColor, progressBarFinishColor) {
        super();
        this._progressBarStartColor = BarcodeFindViewSettings.barcodeFindViewSettingsDefaults.progressBarStartColor;
        this._progressBarFinishColor = BarcodeFindViewSettings.barcodeFindViewSettingsDefaults.progressBarFinishColor;
        this._inListItemColor = inListItemColor;
        this._notInListItemColor = notInListItemColor;
        this._soundEnabled = soundEnabled;
        this._hapticEnabled = hapticEnabled;
        this._hardwareTriggerEnabled = hardwareTriggerEnabled || false;
        this._hardwareTriggerKeyCode = hardwareTriggerKeyCode || null;
        this._progressBarStartColor = progressBarStartColor || BarcodeFindViewSettings.barcodeFindViewSettingsDefaults.progressBarStartColor;
        this._progressBarFinishColor = progressBarFinishColor || BarcodeFindViewSettings.barcodeFindViewSettingsDefaults.progressBarFinishColor;
    }
    static withHardwareTriggers(inListItemColor, notInListItemColor, soundEnabled, hapticEnabled, hardwareTriggerEnabled, hardwareTriggerKeyCode) {
        return new BarcodeFindViewSettings(inListItemColor, notInListItemColor, soundEnabled, hapticEnabled, hardwareTriggerEnabled, hardwareTriggerKeyCode);
    }
    static withProgressBarColor(inListItemColor, notInListItemColor, soundEnabled, hapticEnabled, progressBarStartColor, progressBarFinishColor) {
        return new BarcodeFindViewSettings(inListItemColor, notInListItemColor, soundEnabled, hapticEnabled, undefined, undefined, progressBarStartColor, progressBarFinishColor);
    }
    static withProgressBarColorAndHardwareTriggers(inListItemColor, notInListItemColor, soundEnabled, hapticEnabled, hardwareTriggerEnabled, hardwareTriggerKeyCode, progressBarStartColor, progressBarFinishColor) {
        return new BarcodeFindViewSettings(inListItemColor, notInListItemColor, soundEnabled, hapticEnabled, hardwareTriggerEnabled, hardwareTriggerKeyCode, progressBarStartColor, progressBarFinishColor);
    }
    get inListItemColor() {
        return this._inListItemColor;
    }
    get notInListItemColor() {
        return this._notInListItemColor;
    }
    get soundEnabled() {
        return this._soundEnabled;
    }
    get hapticEnabled() {
        return this._hapticEnabled;
    }
    get hardwareTriggerEnabled() {
        return this._hardwareTriggerEnabled;
    }
    get hardwareTriggerKeyCode() {
        return this._hardwareTriggerKeyCode;
    }
    get progressBarStartColor() {
        return this._progressBarStartColor;
    }
    get progressBarFinishColor() {
        return this._progressBarFinishColor;
    }
}
__decorate([
    nameForSerialization('inListItemColor')
], BarcodeFindViewSettings.prototype, "_inListItemColor", void 0);
__decorate([
    nameForSerialization('notInListItemColor')
], BarcodeFindViewSettings.prototype, "_notInListItemColor", void 0);
__decorate([
    nameForSerialization('soundEnabled')
], BarcodeFindViewSettings.prototype, "_soundEnabled", void 0);
__decorate([
    nameForSerialization('hapticEnabled')
], BarcodeFindViewSettings.prototype, "_hapticEnabled", void 0);
__decorate([
    nameForSerialization('hardwareTriggerEnabled')
], BarcodeFindViewSettings.prototype, "_hardwareTriggerEnabled", void 0);
__decorate([
    nameForSerialization('hardwareTriggerKeyCode')
], BarcodeFindViewSettings.prototype, "_hardwareTriggerKeyCode", void 0);
__decorate([
    nameForSerialization('progressBarStartColor')
], BarcodeFindViewSettings.prototype, "_progressBarStartColor", void 0);
__decorate([
    nameForSerialization('progressBarFinishColor')
], BarcodeFindViewSettings.prototype, "_progressBarFinishColor", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeFindViewSettings, "barcodeFindViewSettingsDefaults", null);

var BarcodeFindViewEvents;
(function (BarcodeFindViewEvents) {
    BarcodeFindViewEvents["onFinishButtonTappedEventName"] = "BarcodeFindViewUiListener.onFinishButtonTapped";
})(BarcodeFindViewEvents || (BarcodeFindViewEvents = {}));
var BarcodeFindListenerEvents;
(function (BarcodeFindListenerEvents) {
    BarcodeFindListenerEvents["onSearchStartedEvent"] = "BarcodeFindListener.onSearchStarted";
    BarcodeFindListenerEvents["onSearchPausedEvent"] = "BarcodeFindListener.onSearchPaused";
    BarcodeFindListenerEvents["onSearchStoppedEvent"] = "BarcodeFindListener.onSearchStopped";
    BarcodeFindListenerEvents["didUpdateSession"] = "BarcodeFindListener.didUpdateSession";
})(BarcodeFindListenerEvents || (BarcodeFindListenerEvents = {}));
var BarcodeFindTransformerEvents;
(function (BarcodeFindTransformerEvents) {
    BarcodeFindTransformerEvents["onTransformBarcodeData"] = "BarcodeFindTransformer.transformBarcodeData";
})(BarcodeFindTransformerEvents || (BarcodeFindTransformerEvents = {}));
class BarcodeFindViewController extends BaseNewController {
    constructor() {
        super('BarcodeFindViewProxy');
        this.isListenerEnabled = false;
        // Bound event handlers
        this.boundHandleOnFinishButtonTappedEvent = null;
        this.boundHandleDidUpdateSession = null;
        this.boundHandleOnSearchStartedEvent = null;
        this.boundHandleOnSearchPausedEvent = null;
        this.boundHandleOnSearchStoppedEvent = null;
        this.boundHandleTransformerEvent = null;
    }
    static forBarcodeFindView(baseView) {
        const viewController = new BarcodeFindViewController();
        viewController.baseView = baseView;
        return viewController;
    }
    setUiListener(listener) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isViewCreated)
                return; // view not created yet
            if (listener && !this.isListenerEnabled) {
                this.isListenerEnabled = true;
                this.subscribeViewEvents();
            }
            if (listener == null) {
                this.isListenerEnabled = false;
                this.unsubscribeViewEvents();
            }
        });
    }
    startSearching() {
        if (!this.isViewCreated)
            return Promise.resolve(); // view not created yet
        return this._proxy.$barcodeFindViewStartSearching({ viewId: this.baseView.viewId });
    }
    stopSearching() {
        if (!this.isViewCreated)
            return Promise.resolve(); // view not created yet
        return this._proxy.$barcodeFindViewStopSearching({ viewId: this.baseView.viewId });
    }
    pauseSearching() {
        if (!this.isViewCreated)
            return Promise.resolve(); // view not created yet
        return this._proxy.$barcodeFindViewPauseSearching({ viewId: this.baseView.viewId });
    }
    updateView() {
        if (!this.isViewCreated)
            return Promise.resolve(); // view not created yet
        const barcodeFindViewJson = this.baseView.toJSON();
        return this._proxy.$updateFindView({ viewId: this.baseView.viewId, barcodeFindViewJson: JSON.stringify(barcodeFindViewJson) });
    }
    showView() {
        if (!this.isViewCreated)
            return Promise.resolve(); // view not created yet
        return this._proxy.$showFindView({ viewId: this.baseView.viewId });
    }
    hideView() {
        if (!this.isViewCreated)
            return Promise.resolve(); // view not created yet
        return this._proxy.$hideFindView({ viewId: this.baseView.viewId });
    }
    createNativeView() {
        return this.create();
    }
    removeNativeView() {
        this.stop();
        this.unsetBarcodeTransformer();
        this.unsubscribeViewEvents();
        this.unsubscribeModeEvents();
        return this._proxy.$removeFindView({ viewId: this.baseView.viewId });
    }
    create() {
        const barcodeFindView = this.baseView.toJSON();
        const json = JSON.stringify(barcodeFindView);
        return this._proxy.$createFindView({ viewId: this.baseView.viewId, json }).then(() => {
            this.initialize();
        });
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.baseView.barcodeFindViewUiListener) {
                this.subscribeViewEvents();
            }
            if (this.baseView.barcodeFind.listeners.length > 0) {
                this.subscribeModeEvents();
            }
            if (this.baseView.barcodeFind.barcodeTransformer) {
                this.setBarcodeTransformer();
            }
        });
    }
    subscribeViewEvents() {
        if (!this.isViewCreated)
            return; // view not created yet
        if (this.boundHandleOnFinishButtonTappedEvent) {
            return;
        }
        this._proxy.subscribeForEvents(Object.values(BarcodeFindViewEvents));
        this._proxy.$registerBarcodeFindViewListener({ viewId: this.baseView.viewId });
        this.boundHandleOnFinishButtonTappedEvent = this.handleOnFinishButtonTappedEvent.bind(this);
        this._proxy.eventEmitter.on(BarcodeFindViewEvents.onFinishButtonTappedEventName, this.boundHandleOnFinishButtonTappedEvent);
    }
    handleOnFinishButtonTappedEvent(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!this.baseView.barcodeFindViewUiListener) {
                return;
            }
            const { foundItems: barcodeFindItems = [] } = JSON.parse(ev.data);
            (_b = (_a = this.baseView) === null || _a === void 0 ? void 0 : _a.barcodeFindViewUiListener) === null || _b === void 0 ? void 0 : _b.didTapFinishButton(barcodeFindItems);
        });
    }
    unsubscribeViewEvents() {
        this._proxy.$unregisterBarcodeFindViewListener({ viewId: this.baseView.viewId });
        this._proxy.unsubscribeFromEvents(Object.values(BarcodeFindViewEvents));
        if (this.boundHandleOnFinishButtonTappedEvent) {
            this._proxy.eventEmitter.off(BarcodeFindViewEvents.onFinishButtonTappedEventName, this.boundHandleOnFinishButtonTappedEvent);
        }
        this.boundHandleOnFinishButtonTappedEvent = null;
    }
    // Mode
    updateMode() {
        if (!this.isViewCreated)
            return Promise.resolve(); // view not created yet
        return this._proxy.$updateFindMode({ viewId: this.baseView.viewId, barcodeFindJson: JSON.stringify(this.baseView.barcodeFind.toJSON()) });
    }
    setItemList(items) {
        if (!this.isViewCreated)
            return Promise.resolve(); // view not created yet
        const jsonString = items.map(item => item.toJSON());
        return this._proxy.$barcodeFindSetItemList({ viewId: this.baseView.viewId, itemsJson: JSON.stringify(jsonString) });
    }
    start() {
        if (!this.isViewCreated)
            return Promise.resolve(); // view not created yet
        return this._proxy.$barcodeFindModeStart({ viewId: this.baseView.viewId });
    }
    pause() {
        if (!this.isViewCreated)
            return Promise.resolve(); // view not created yet
        return this._proxy.$barcodeFindModePause({ viewId: this.baseView.viewId });
    }
    stop() {
        if (!this.isViewCreated)
            return Promise.resolve(); // view not created yet
        return this._proxy.$barcodeFindModeStop({ viewId: this.baseView.viewId });
    }
    setModeEnabledState(isEnabled) {
        if (!this.isViewCreated)
            return; // view not created yet
        this._proxy.$setBarcodeFindModeEnabledState({ viewId: this.baseView.viewId, enabled: isEnabled });
    }
    updateFeedback(feedbackJson) {
        if (!this.isViewCreated)
            return Promise.resolve(); // view not created yet
        return this._proxy.$updateBarcodeFindFeedback({ viewId: this.baseView.viewId, feedbackJson });
    }
    setBarcodeTransformer() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isViewCreated)
                return; // view not created yet
            if (this.boundHandleTransformerEvent) {
                return;
            }
            this.boundHandleTransformerEvent = this.handleOnTransformBarcodeDataEvent.bind(this);
            this._proxy.subscribeForEvents(Object.values(BarcodeFindTransformerEvents));
            this._proxy.$setBarcodeTransformer({ viewId: this.baseView.viewId });
            this._proxy.eventEmitter.on(BarcodeFindTransformerEvents.onTransformBarcodeData, this.boundHandleTransformerEvent);
        });
    }
    handleOnTransformBarcodeDataEvent(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                console.error('BarcodeFindController onTransformBarcodeData payload is null');
                return;
            }
            if (payload.viewId !== this.baseView.viewId) {
                return;
            }
            const transformed = (_a = this.baseView.barcodeFind.barcodeTransformer) === null || _a === void 0 ? void 0 : _a.transformBarcodeData(payload.data);
            this._proxy.$submitBarcodeFindTransformerResult({ viewId: this.baseView.viewId, transformedBarcode: transformed });
        });
    }
    unsetBarcodeTransformer() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.boundHandleTransformerEvent)
                return; // view not created yet
            this._proxy.$unsetBarcodeTransformer({ viewId: this.baseView.viewId });
            this._proxy.unsubscribeFromEvents(Object.values(BarcodeFindTransformerEvents));
            this._proxy.eventEmitter.off(BarcodeFindTransformerEvents.onTransformBarcodeData, this.boundHandleTransformerEvent);
            this.boundHandleTransformerEvent = null;
        });
    }
    subscribeModeEvents() {
        if (!this.isViewCreated)
            return; // view not created yet
        if (this.boundHandleDidUpdateSession) {
            return;
        }
        this._proxy.subscribeForEvents(Object.values(BarcodeFindListenerEvents));
        this._proxy.$registerBarcodeFindListener({ viewId: this.baseView.viewId });
        this.boundHandleDidUpdateSession = this.handleDidUpdateSession.bind(this);
        this._proxy.eventEmitter.on(BarcodeFindListenerEvents.didUpdateSession, this.boundHandleDidUpdateSession);
        this.boundHandleOnSearchStartedEvent = this.handleOnSearchStartedEvent.bind(this);
        this._proxy.eventEmitter.on(BarcodeFindListenerEvents.onSearchStartedEvent, this.boundHandleOnSearchStartedEvent);
        this.boundHandleOnSearchPausedEvent = this.handleOnSearchPausedEvent.bind(this);
        this._proxy.eventEmitter.on(BarcodeFindListenerEvents.onSearchPausedEvent, this.boundHandleOnSearchPausedEvent);
        this.boundHandleOnSearchStoppedEvent = this.handleOnSearchStoppedEvent.bind(this);
        this._proxy.eventEmitter.on(BarcodeFindListenerEvents.onSearchStoppedEvent, this.boundHandleOnSearchStoppedEvent);
    }
    handleDidUpdateSession(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const payload = EventDataParser.parse(ev.data);
            if (payload === null) {
                console.error('BarcodeFindController didUpdateSession payload is null');
                return;
            }
            const session = BarcodeFindSession.fromJSON(JSON.parse(payload.session));
            for (const listener of this.baseView.barcodeFind.listeners) {
                (_a = listener === null || listener === void 0 ? void 0 : listener.didUpdateSession) === null || _a === void 0 ? void 0 : _a.call(listener, session);
            }
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    handleOnSearchStartedEvent(_ev) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            for (const listener of this.baseView.barcodeFind.listeners) {
                (_a = listener === null || listener === void 0 ? void 0 : listener.didStartSearch) === null || _a === void 0 ? void 0 : _a.call(listener);
            }
        });
    }
    handleOnSearchPausedEvent(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const foundItems = this.filterFoundItemsFromEvent(ev.data);
            for (const listener of this.baseView.barcodeFind.listeners) {
                (_a = listener === null || listener === void 0 ? void 0 : listener.didPauseSearch) === null || _a === void 0 ? void 0 : _a.call(listener, foundItems);
            }
        });
    }
    handleOnSearchStoppedEvent(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const foundItems = this.filterFoundItemsFromEvent(ev.data);
            for (const listener of this.baseView.barcodeFind.listeners) {
                (_a = listener === null || listener === void 0 ? void 0 : listener.didStopSearch) === null || _a === void 0 ? void 0 : _a.call(listener, foundItems);
            }
        });
    }
    filterFoundItemsFromEvent(eventBody) {
        const foundItemsData = JSON.parse(eventBody).foundItems;
        const itemsToFind = JSON.parse(this.baseView.barcodeFind.itemsToFind);
        const foundItems = itemsToFind.filter((item) => foundItemsData.includes(item.searchOptions.barcodeData));
        return foundItems;
    }
    unsubscribeModeEvents() {
        this._proxy.$unregisterBarcodeFindListener({ viewId: this.baseView.viewId });
        this._proxy.unsubscribeFromEvents(Object.values(BarcodeFindListenerEvents));
        if (this.boundHandleDidUpdateSession) {
            this._proxy.eventEmitter.off(BarcodeFindListenerEvents.didUpdateSession, this.boundHandleDidUpdateSession);
        }
        if (this.boundHandleOnSearchStartedEvent) {
            this._proxy.eventEmitter.off(BarcodeFindListenerEvents.onSearchStartedEvent, this.boundHandleOnSearchStartedEvent);
        }
        if (this.boundHandleOnSearchPausedEvent) {
            this._proxy.eventEmitter.off(BarcodeFindListenerEvents.onSearchPausedEvent, this.boundHandleOnSearchPausedEvent);
        }
        if (this.boundHandleOnSearchStoppedEvent) {
            this._proxy.eventEmitter.off(BarcodeFindListenerEvents.onSearchStoppedEvent, this.boundHandleOnSearchStoppedEvent);
        }
        this.boundHandleDidUpdateSession = null;
        this.boundHandleOnSearchStartedEvent = null;
        this.boundHandleOnSearchPausedEvent = null;
        this.boundHandleOnSearchStoppedEvent = null;
    }
    dispose() {
        this.removeNativeView();
        this._proxy.dispose();
    }
    get isViewCreated() {
        return this.baseView.viewId !== -1;
    }
}

class BaseBarcodeFindView {
    get viewId() {
        return this._viewId;
    }
    get barcodeFind() {
        return this._barcodeFind;
    }
    get barcodeFindViewUiListener() {
        return this._barcodeFindViewUiListener;
    }
    set barcodeFindViewUiListener(value) {
        this._barcodeFindViewUiListener = value;
        this.controller.setUiListener(value);
    }
    get context() {
        return this._dataCaptureContext;
    }
    constructor(props) {
        this.isViewCreated = false;
        this._startSearching = false;
        this._isInitialized = false;
        this._viewId = -1; // -1 means the view is not created yet
        this._barcodeFindViewUiListener = null;
        this._dataCaptureContext = props.context;
        this._barcodeFind = props.barcodeFind;
        this._barcodeFindViewSettings = props.viewSettings;
        this._cameraSettings = props.cameraSettings;
        this.controller = BarcodeFindViewController.forBarcodeFindView(this);
        this._barcodeFind.controller = this.controller;
    }
    static get barcodeFindViewDefaults() {
        return getBarcodeFindDefaults().BarcodeFindView;
    }
    stopSearching() {
        this._startSearching = false;
        return this.controller.stopSearching();
    }
    startSearching() {
        this._startSearching = true;
        return this.controller.startSearching();
    }
    pauseSearching() {
        this._startSearching = false;
        return this.controller.pauseSearching();
    }
    show() {
        return this.controller.showView();
    }
    hide() {
        return this.controller.hideView();
    }
    static get hardwareTriggerSupported() {
        return BaseBarcodeFindView.barcodeFindViewDefaults.hardwareTriggerSupported;
    }
    createNativeView(viewId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isViewCreated) {
                return;
            }
            this._viewId = viewId;
            yield this.controller.createNativeView();
        });
    }
    removeNativeView() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.controller.removeNativeView();
            this.isViewCreated = false;
        });
    }
    get shouldShowUserGuidanceView() {
        return BaseBarcodeFindView.barcodeFindViewDefaults.shouldShowUserGuidanceView;
    }
    set shouldShowUserGuidanceView(value) {
        BaseBarcodeFindView.barcodeFindViewDefaults.shouldShowUserGuidanceView = value;
        this.update();
    }
    get shouldShowHints() {
        return BaseBarcodeFindView.barcodeFindViewDefaults.shouldShowHints;
    }
    set shouldShowHints(value) {
        BaseBarcodeFindView.barcodeFindViewDefaults.shouldShowHints = value;
        this.update();
    }
    get shouldShowCarousel() {
        return BaseBarcodeFindView.barcodeFindViewDefaults.shouldShowCarousel;
    }
    set shouldShowCarousel(value) {
        BaseBarcodeFindView.barcodeFindViewDefaults.shouldShowCarousel = value;
        this.update();
    }
    get shouldShowPauseButton() {
        return BaseBarcodeFindView.barcodeFindViewDefaults.shouldShowPauseButton;
    }
    set shouldShowPauseButton(value) {
        BaseBarcodeFindView.barcodeFindViewDefaults.shouldShowPauseButton = value;
        this.update();
    }
    get shouldShowFinishButton() {
        return BaseBarcodeFindView.barcodeFindViewDefaults.shouldShowFinishButton;
    }
    set shouldShowFinishButton(value) {
        BaseBarcodeFindView.barcodeFindViewDefaults.shouldShowFinishButton = value;
        this.update();
    }
    get shouldShowProgressBar() {
        return BaseBarcodeFindView.barcodeFindViewDefaults.shouldShowProgressBar;
    }
    set shouldShowProgressBar(value) {
        BaseBarcodeFindView.barcodeFindViewDefaults.shouldShowProgressBar = value;
        this.update();
    }
    get shouldShowTorchControl() {
        return BaseBarcodeFindView.barcodeFindViewDefaults.shouldShowTorchControl;
    }
    set shouldShowTorchControl(value) {
        BaseBarcodeFindView.barcodeFindViewDefaults.shouldShowTorchControl = value;
        this.update();
    }
    get shouldShowZoomControl() {
        return BaseBarcodeFindView.barcodeFindViewDefaults.shouldShowZoomControl;
    }
    set shouldShowZoomControl(value) {
        BaseBarcodeFindView.barcodeFindViewDefaults.shouldShowZoomControl = value;
        this.update();
    }
    get torchControlPosition() {
        return BaseBarcodeFindView.barcodeFindViewDefaults.torchControlPosition;
    }
    set torchControlPosition(value) {
        BaseBarcodeFindView.barcodeFindViewDefaults.torchControlPosition = value;
        this.update();
    }
    get textForCollapseCardsButton() {
        return BaseBarcodeFindView.barcodeFindViewDefaults.textForCollapseCardsButton;
    }
    set textForCollapseCardsButton(value) {
        BaseBarcodeFindView.barcodeFindViewDefaults.textForCollapseCardsButton = value;
        this.update();
    }
    get textForAllItemsFoundSuccessfullyHint() {
        return BaseBarcodeFindView.barcodeFindViewDefaults.textForAllItemsFoundSuccessfullyHint;
    }
    set textForAllItemsFoundSuccessfullyHint(value) {
        BaseBarcodeFindView.barcodeFindViewDefaults.textForAllItemsFoundSuccessfullyHint = value;
        this.update();
    }
    get textForItemListUpdatedHint() {
        return BaseBarcodeFindView.barcodeFindViewDefaults.textForItemListUpdatedHint;
    }
    set textForItemListUpdatedHint(value) {
        BaseBarcodeFindView.barcodeFindViewDefaults.textForItemListUpdatedHint = value;
        this.update();
    }
    get textForItemListUpdatedWhenPausedHint() {
        return BaseBarcodeFindView.barcodeFindViewDefaults.textForItemListUpdatedWhenPausedHint;
    }
    set textForItemListUpdatedWhenPausedHint(value) {
        BaseBarcodeFindView.barcodeFindViewDefaults.textForItemListUpdatedWhenPausedHint = value;
        this.update();
    }
    get textForPointAtBarcodesToSearchHint() {
        return BaseBarcodeFindView.barcodeFindViewDefaults.textForPointAtBarcodesToSearchHint;
    }
    set textForPointAtBarcodesToSearchHint(value) {
        BaseBarcodeFindView.barcodeFindViewDefaults.textForPointAtBarcodesToSearchHint = value;
        this.update();
    }
    get textForMoveCloserToBarcodesHint() {
        return BaseBarcodeFindView.barcodeFindViewDefaults.textForMoveCloserToBarcodesHint;
    }
    set textForMoveCloserToBarcodesHint(value) {
        BaseBarcodeFindView.barcodeFindViewDefaults.textForMoveCloserToBarcodesHint = value;
        this.update();
    }
    get textForTapShutterToPauseScreenHint() {
        return BaseBarcodeFindView.barcodeFindViewDefaults.textForTapShutterToPauseScreenHint;
    }
    set textForTapShutterToPauseScreenHint(value) {
        BaseBarcodeFindView.barcodeFindViewDefaults.textForTapShutterToPauseScreenHint = value;
        this.update();
    }
    get textForTapShutterToResumeSearchHint() {
        return BaseBarcodeFindView.barcodeFindViewDefaults.textForTapShutterToResumeSearchHint;
    }
    set textForTapShutterToResumeSearchHint(value) {
        BaseBarcodeFindView.barcodeFindViewDefaults.textForTapShutterToResumeSearchHint = value;
        this.update();
    }
    update() {
        if (!this._isInitialized) {
            return Promise.resolve();
        }
        return this.controller.updateView();
    }
    dispose() {
        this.controller.dispose();
        this.isViewCreated = false;
    }
    toJSON() {
        var _a, _b, _c;
        const json = {
            View: {
                shouldShowUserGuidanceView: this.shouldShowUserGuidanceView,
                shouldShowHints: this.shouldShowHints,
                shouldShowCarousel: this.shouldShowCarousel,
                shouldShowPauseButton: this.shouldShowPauseButton,
                shouldShowFinishButton: this.shouldShowFinishButton,
                shouldShowProgressBar: this.shouldShowProgressBar,
                shouldShowTorchControl: this.shouldShowTorchControl,
                torchControlPosition: (_a = this.torchControlPosition) === null || _a === void 0 ? void 0 : _a.toString(),
                textForCollapseCardsButton: this.textForCollapseCardsButton,
                textForAllItemsFoundSuccessfullyHint: this.textForAllItemsFoundSuccessfullyHint,
                textForItemListUpdatedHint: this.textForItemListUpdatedHint,
                textForItemListUpdatedWhenPausedHint: this.textForItemListUpdatedWhenPausedHint,
                textForPointAtBarcodesToSearchHint: this.textForPointAtBarcodesToSearchHint,
                textForMoveCloserToBarcodesHint: this.textForMoveCloserToBarcodesHint,
                textForTapShutterToPauseScreenHint: this.textForTapShutterToPauseScreenHint,
                textForTapShutterToResumeSearchHint: this.textForTapShutterToResumeSearchHint,
                startSearching: this._startSearching,
                viewSettings: undefined,
                CameraSettings: undefined,
                viewId: this._viewId,
                hasListener: this.barcodeFindViewUiListener != null
            },
            BarcodeFind: this._barcodeFind.toJSON()
        };
        if (this._barcodeFindViewSettings != null) {
            json.View.viewSettings = (_b = this._barcodeFindViewSettings) === null || _b === void 0 ? void 0 : _b.toJSON();
        }
        if (this._cameraSettings != null) {
            json.View.cameraSettings = (_c = this._cameraSettings) === null || _c === void 0 ? void 0 : _c.toJSON();
        }
        return json;
    }
}
__decorate([
    ignoreFromSerialization
], BaseBarcodeFindView.prototype, "isViewCreated", void 0);
__decorate([
    ignoreFromSerialization
], BaseBarcodeFindView.prototype, "_viewId", void 0);

class BarcodeGeneratorCreationOptions {
    constructor(backgroundColor = null, foregroundColor = null, errorCorrectionLevel = null, versionNumber = null, minimumErrorCorrectionPercent = null, layers = null) {
        this.backgroundColor = backgroundColor;
        this.foregroundColor = foregroundColor;
        this.errorCorrectionLevel = errorCorrectionLevel;
        this.versionNumber = versionNumber;
        this.minimumErrorCorrectionPercent = minimumErrorCorrectionPercent;
        this.layers = layers;
    }
}

class BarcodeGeneratorBuilder {
    constructor(type, dataCaptureContext) {
        this.options = new BarcodeGeneratorCreationOptions();
        this.type = type;
        this.dataCaptureContext = dataCaptureContext;
    }
    withBackgroundColor(color) {
        this.options.backgroundColor = color;
        return this;
    }
    withForegroundColor(color) {
        this.options.foregroundColor = color;
        return this;
    }
    build() {
        return BarcodeGenerator.create(this.type, this.options, this.dataCaptureContext);
    }
}

class Code39BarcodeGeneratorBuilder extends BarcodeGeneratorBuilder {
    constructor(dataCaptureContext) {
        super('code39Generator', dataCaptureContext);
    }
}

class Code128BarcodeGeneratorBuilder extends BarcodeGeneratorBuilder {
    constructor(dataCaptureContext) {
        super('code128Generator', dataCaptureContext);
    }
}

class Ean13BarcodeGeneratorBuilder extends BarcodeGeneratorBuilder {
    constructor(dataCaptureContext) {
        super('ean13Generator', dataCaptureContext);
    }
}

class UpcaBarcodeGeneratorBuilder extends BarcodeGeneratorBuilder {
    constructor(dataCaptureContext) {
        super('upcaGenerator', dataCaptureContext);
    }
}

class InterleavedTwoOfFiveBarcodeGeneratorBuilder extends BarcodeGeneratorBuilder {
    constructor(dataCaptureContext) {
        super('interleavedTwoOfFiveGenerator', dataCaptureContext);
    }
}

class QrCodeBarcodeGeneratorBuilder extends BarcodeGeneratorBuilder {
    constructor(dataCaptureContext) {
        super('qrCodeGenerator', dataCaptureContext);
    }
    withErrorCorrectionLevel(errorCorrectionLevel) {
        this.options.errorCorrectionLevel = errorCorrectionLevel;
        return this;
    }
    withVersionNumber(versionNumber) {
        this.options.versionNumber = versionNumber;
        return this;
    }
}

class DataMatrixBarcodeGeneratorBuilder extends BarcodeGeneratorBuilder {
    constructor(dataCaptureContext) {
        super('dataMatrixGenerator', dataCaptureContext);
    }
}

class BarcodeGeneratorController {
    get _proxy() {
        return FactoryMaker.getInstance('BarcodeGeneratorProxy');
    }
    static forBarcodeGenerator(generator) {
        const controller = new BarcodeGeneratorController();
        controller.generator = generator;
        return controller;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            // We call update because it returns a promise, this guarantees, that by the time
            // we need the deserialized context, it will be set in the native layer.
            yield this.generator.dataCaptureContext.update();
            yield this.create();
        });
    }
    create() {
        return this._proxy.create(JSON.stringify(this.generator.toJSON()));
    }
    generateFromBase64EncodedData(data, imageWidth) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this._proxy.generateFromBase64EncodedData(this.generator.id, data, imageWidth);
            if (result == null) {
                return '';
            }
            return result.data;
        });
    }
    generate(text, imageWidth) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this._proxy.generate(this.generator.id, text, imageWidth);
            if (result == null) {
                return '';
            }
            return result.data;
        });
    }
    dispose() {
        return this._proxy.dispose(this.generator.id);
    }
}

class AztecBarcodeGeneratorBuilder extends BarcodeGeneratorBuilder {
    constructor(dataCaptureContext) {
        super('aztecGenerator', dataCaptureContext);
    }
    withMinimumErrorCorrectionPercent(minimumErrorCorrectionPercent) {
        this.options.minimumErrorCorrectionPercent = minimumErrorCorrectionPercent;
        return this;
    }
    withLayers(layers) {
        this.options.layers = layers;
        return this;
    }
}

class BarcodeGenerator extends DefaultSerializeable {
    get id() {
        return this._id;
    }
    constructor(dataCaptureContext, type, backgroundColor, foregroundColor, errorCorrectionLevel, versionNumber) {
        super();
        this._id = `${Date.now()}`;
        this.errorCorrectionLevel = null;
        this.initializationPromise = undefined;
        this.dataCaptureContext = dataCaptureContext;
        this.type = type;
        this.backgroundColor = backgroundColor;
        this.foregroundColor = foregroundColor;
        this.errorCorrectionLevel = errorCorrectionLevel;
        this.versionNumber = versionNumber;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            this.controller = BarcodeGeneratorController.forBarcodeGenerator(this);
            this.initializationPromise = this.controller.initialize();
            return this.initializationPromise;
        });
    }
    static create(type, options, dataCaptureContext) {
        const generator = new BarcodeGenerator(dataCaptureContext, type, options.backgroundColor, options.backgroundColor, options.errorCorrectionLevel, options.versionNumber);
        generator.initialize();
        return generator;
    }
    generate(text, imageWidth) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initializationPromise;
            return this.controller.generate(text, imageWidth);
        });
    }
    generateFromBase64EncodedData(data, imageWidth) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initializationPromise;
            return this.controller.generateFromBase64EncodedData(data, imageWidth);
        });
    }
    dispose() {
        this.controller.dispose();
    }
    static code39BarcodeGeneratorBuilder(dataCaptureContext) {
        return new Code39BarcodeGeneratorBuilder(dataCaptureContext);
    }
    static code128BarcodeGeneratorBuilder(dataCaptureContext) {
        return new Code128BarcodeGeneratorBuilder(dataCaptureContext);
    }
    static ean13BarcodeGeneratorBuilder(dataCaptureContext) {
        return new Ean13BarcodeGeneratorBuilder(dataCaptureContext);
    }
    static upcaBarcodeGeneratorBuilder(dataCaptureContext) {
        return new UpcaBarcodeGeneratorBuilder(dataCaptureContext);
    }
    static interleavedTwoOfFiveBarcodeGeneratorBuilder(dataCaptureContext) {
        return new InterleavedTwoOfFiveBarcodeGeneratorBuilder(dataCaptureContext);
    }
    static qrCodeBarcodeGeneratorBuilder(dataCaptureContext) {
        return new QrCodeBarcodeGeneratorBuilder(dataCaptureContext);
    }
    static dataMatrixBarcodeGeneratorBuilder(dataCaptureContext) {
        return new DataMatrixBarcodeGeneratorBuilder(dataCaptureContext);
    }
    static aztecBarcodeGeneratorBuilder(dataCaptureContext) {
        return new AztecBarcodeGeneratorBuilder(dataCaptureContext);
    }
}
__decorate([
    nameForSerialization('id')
], BarcodeGenerator.prototype, "_id", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeGenerator.prototype, "dataCaptureContext", void 0);
__decorate([
    ignoreFromSerialization
], BarcodeGenerator.prototype, "controller", void 0);

exports.QrCodeErrorCorrectionLevel = void 0;
(function (QrCodeErrorCorrectionLevel) {
    QrCodeErrorCorrectionLevel["Low"] = "low";
    QrCodeErrorCorrectionLevel["Medium"] = "medium";
    QrCodeErrorCorrectionLevel["Quartile"] = "quartile";
    QrCodeErrorCorrectionLevel["High"] = "high";
})(exports.QrCodeErrorCorrectionLevel || (exports.QrCodeErrorCorrectionLevel = {}));

class DataCaptureVersion {
    static get pluginVersion() {
        return pluginsMetadata['scandit-cordova-datacapture-core'];
    }
}

class DataCaptureView {
    get context() {
        return this.baseDataCaptureView.context;
    }
    set context(context) {
        this.baseDataCaptureView.context = context;
    }
    get overlays() {
        return this.baseDataCaptureView.overlays;
    }
    get scanAreaMargins() {
        return this.baseDataCaptureView.scanAreaMargins;
    }
    ;
    set scanAreaMargins(newValue) {
        this.baseDataCaptureView.scanAreaMargins = newValue;
    }
    ;
    get pointOfInterest() {
        return this.baseDataCaptureView.pointOfInterest;
    }
    ;
    set pointOfInterest(newValue) {
        this.baseDataCaptureView.pointOfInterest = newValue;
    }
    ;
    get logoStyle() {
        return this.baseDataCaptureView.logoStyle;
    }
    set logoStyle(style) {
        this.baseDataCaptureView.logoStyle = style;
    }
    get logoAnchor() {
        return this.baseDataCaptureView.logoAnchor;
    }
    ;
    set logoAnchor(newValue) {
        this.baseDataCaptureView.logoAnchor = newValue;
    }
    ;
    get logoOffset() {
        return this.baseDataCaptureView.logoOffset;
    }
    ;
    set logoOffset(newValue) {
        this.baseDataCaptureView.logoOffset = newValue;
    }
    ;
    get focusGesture() {
        return this.baseDataCaptureView.focusGesture;
    }
    ;
    set focusGesture(newValue) {
        this.baseDataCaptureView.focusGesture = newValue;
    }
    ;
    get zoomGesture() {
        return this.baseDataCaptureView.zoomGesture;
    }
    ;
    set zoomGesture(newValue) {
        this.baseDataCaptureView.zoomGesture = newValue;
    }
    ;
    set htmlElementState(newState) {
        const didChangeShown = this._htmlElementState.isShown !== newState.isShown;
        const didChangePositionOrSize = this._htmlElementState.didChangeComparedTo(newState);
        this._htmlElementState = newState;
        if (didChangePositionOrSize) {
            this.updatePositionAndSize();
        }
        if (didChangeShown) {
            if (this._htmlElementState.isShown) {
                this._show();
            }
            else {
                this._hide();
            }
        }
    }
    get htmlElementState() {
        return this._htmlElementState;
    }
    static forContext(context) {
        const view = new DataCaptureView();
        view.context = context;
        return view;
    }
    constructor() {
        this.htmlElement = null;
        this._htmlElementState = new HTMLElementState();
        this.scrollListener = this.elementDidChange.bind(this);
        this.domObserver = new MutationObserver(this.elementDidChange.bind(this));
        this.orientationChangeListener = (() => {
            this.elementDidChange();
            // SDC-1784 -> workaround because at the moment of this callback the element doesn't have the updated size.
            setTimeout(this.elementDidChange.bind(this), 100);
            setTimeout(this.elementDidChange.bind(this), 300);
            setTimeout(this.elementDidChange.bind(this), 1000);
        });
        this.baseDataCaptureView = new BaseDataCaptureView(null);
    }
    connectToElement(element) {
        const viewId = (Date.now() / 1000) | 0;
        // add view to native hierarchy
        this.baseDataCaptureView.createNativeView(viewId).then(() => {
            this.htmlElement = element;
            this.htmlElementState = new HTMLElementState();
            // Initial update
            this.elementDidChange();
            this.subscribeToChangesOnHTMLElement();
        });
    }
    detachFromElement() {
        this.unsubscribeFromChangesOnHTMLElement();
        this.htmlElement = null;
        this.elementDidChange();
        // Remove view from native hierarchy
        this.baseDataCaptureView.removeNativeView();
    }
    setFrame(frame_1) {
        return __awaiter$1(this, arguments, void 0, function* (frame, isUnderContent = false) {
            const viewId = (Date.now() / 1000) | 0;
            yield this.baseDataCaptureView.createNativeView(viewId);
            return this.baseDataCaptureView.setFrame(frame, isUnderContent);
        });
    }
    show() {
        if (this.htmlElement) {
            throw new Error("Views should only be manually shown if they're manually sized using setFrame");
        }
        return this._show();
    }
    hide() {
        if (this.htmlElement) {
            throw new Error("Views should only be manually hidden if they're manually sized using setFrame");
        }
        return this._hide();
    }
    addOverlay(overlay) {
        return this.baseDataCaptureView.addOverlay(overlay);
    }
    removeOverlay(overlay) {
        return this.baseDataCaptureView.removeOverlay(overlay);
    }
    addListener(listener) {
        this.baseDataCaptureView.addListener(listener);
    }
    removeListener(listener) {
        this.baseDataCaptureView.removeListener(listener);
    }
    viewPointForFramePoint(point) {
        return this.baseDataCaptureView.viewPointForFramePoint(point);
    }
    viewQuadrilateralForFrameQuadrilateral(quadrilateral) {
        return this.baseDataCaptureView.viewQuadrilateralForFrameQuadrilateral(quadrilateral);
    }
    addControl(control) {
        this.baseDataCaptureView.addControl(control);
    }
    addControlWithAnchorAndOffset(control, anchor, offset) {
        return this.baseDataCaptureView.addControlWithAnchorAndOffset(control, anchor, offset);
    }
    removeControl(control) {
        this.baseDataCaptureView.removeControl(control);
    }
    subscribeToChangesOnHTMLElement() {
        this.domObserver.observe(document, { attributes: true, childList: true, subtree: true });
        window.addEventListener('scroll', this.scrollListener);
        window.addEventListener('orientationchange', this.orientationChangeListener);
    }
    unsubscribeFromChangesOnHTMLElement() {
        this.domObserver.disconnect();
        window.removeEventListener('scroll', this.scrollListener);
        window.removeEventListener('orientationchange', this.orientationChangeListener);
    }
    elementDidChange() {
        if (!this.htmlElement) {
            this.htmlElementState = new HTMLElementState();
            return;
        }
        const newState = new HTMLElementState();
        const boundingRect = this.htmlElement.getBoundingClientRect();
        newState.position = new HtmlElementPosition(boundingRect.top, boundingRect.left);
        newState.size = new HtmlElementSize(boundingRect.width, boundingRect.height);
        newState.shouldBeUnderContent = parseInt(this.htmlElement.style.zIndex || '1', 10) < 0
            || parseInt(getComputedStyle(this.htmlElement).zIndex || '1', 10) < 0;
        const isDisplayed = getComputedStyle(this.htmlElement).display !== 'none'
            && this.htmlElement.style.display !== 'none';
        const isInDOM = document.body.contains(this.htmlElement);
        newState.isShown = isDisplayed && isInDOM && !this.htmlElement.hidden;
        this.htmlElementState = newState;
    }
    updatePositionAndSize() {
        if (!this.htmlElementState || !this.htmlElementState.isValid) {
            return;
        }
        this.baseDataCaptureView.setPositionAndSize(this.htmlElementState.position.top, this.htmlElementState.position.left, this.htmlElementState.size.width, this.htmlElementState.size.height, this.htmlElementState.shouldBeUnderContent);
    }
    _show() {
        return this.baseDataCaptureView.show();
    }
    _hide() {
        return this.baseDataCaptureView.hide();
    }
    toJSON() {
        return this.baseDataCaptureView.toJSON();
    }
}
__decorate$1([
    ignoreFromSerialization
], DataCaptureView.prototype, "baseDataCaptureView", void 0);
__decorate$1([
    ignoreFromSerialization
], DataCaptureView.prototype, "htmlElement", void 0);
__decorate$1([
    ignoreFromSerialization
], DataCaptureView.prototype, "_htmlElementState", void 0);
__decorate$1([
    ignoreFromSerialization
], DataCaptureView.prototype, "scrollListener", void 0);
__decorate$1([
    ignoreFromSerialization
], DataCaptureView.prototype, "domObserver", void 0);
__decorate$1([
    ignoreFromSerialization
], DataCaptureView.prototype, "orientationChangeListener", void 0);

class VolumeButtonObserverProxy {
    static forVolumeButtonObserver(volumeButtonObserver) {
        const proxy = new VolumeButtonObserverProxy();
        proxy.volumeButtonObserver = volumeButtonObserver;
        proxy.subscribe();
        return proxy;
    }
    dispose() {
        this.unsubscribe();
    }
    subscribe() {
        VolumeButtonObserverProxy.cordovaExec(this.notifyListeners.bind(this), null, CordovaFunction.SubscribeVolumeButtonObserver, null);
    }
    unsubscribe() {
        VolumeButtonObserverProxy.cordovaExec(null, null, CordovaFunction.UnsubscribeVolumeButtonObserver, null);
    }
    notifyListeners(event) {
        if (!event) {
            // The event could be undefined/null in case the plugin result did not pass a "message",
            // which could happen e.g. in case of "ok" results, which could signal e.g. successful
            // listener subscriptions.
            return;
        }
        if (this.volumeButtonObserver.didChangeVolume && event.name === 'didChangeVolume') {
            this.volumeButtonObserver.didChangeVolume();
        }
    }
}
VolumeButtonObserverProxy.cordovaExec = Cordova.exec;

// Note: the class is made private by being excluded from the docs through `coverage_cordova_javascript_name_ignore`
class VolumeButtonObserver {
    constructor(didChangeVolume) {
        this.didChangeVolume = didChangeVolume;
        this.initialize();
    }
    dispose() {
        if (this.proxy) {
            this.proxy.dispose();
            this.proxy = null;
            this.didChangeVolume = null;
        }
    }
    initialize() {
        if (!this.proxy) {
            this.proxy = VolumeButtonObserverProxy.forVolumeButtonObserver(this);
        }
    }
}

initializeCordovaCore();

exports.AimerViewfinder = AimerViewfinder;
exports.AztecBarcodeGeneratorBuilder = AztecBarcodeGeneratorBuilder;
exports.BarcodeGenerator = BarcodeGenerator;
exports.BarcodeGeneratorBuilder = BarcodeGeneratorBuilder;
exports.Brush = Brush;
exports.Camera = Camera;
exports.CameraSettings = CameraSettings;
exports.Code128BarcodeGeneratorBuilder = Code128BarcodeGeneratorBuilder;
exports.Code39BarcodeGeneratorBuilder = Code39BarcodeGeneratorBuilder;
exports.Color = Color;
exports.ContextStatus = ContextStatus;
exports.CordovaError = CordovaError;
exports.CordovaNativeCaller = CordovaNativeCaller;
exports.DataCaptureContext = DataCaptureContext;
exports.DataCaptureContextSettings = DataCaptureContextSettings;
exports.DataCaptureVersion = DataCaptureVersion;
exports.DataCaptureView = DataCaptureView;
exports.DataMatrixBarcodeGeneratorBuilder = DataMatrixBarcodeGeneratorBuilder;
exports.Ean13BarcodeGeneratorBuilder = Ean13BarcodeGeneratorBuilder;
exports.Feedback = Feedback;
exports.FrameDataSettings = FrameDataSettings;
exports.FrameDataSettingsBuilder = FrameDataSettingsBuilder;
exports.ImageBuffer = ImageBuffer;
exports.ImageFrameSource = ImageFrameSource;
exports.InterleavedTwoOfFiveBarcodeGeneratorBuilder = InterleavedTwoOfFiveBarcodeGeneratorBuilder;
exports.LaserlineViewfinder = LaserlineViewfinder;
exports.MarginsWithUnit = MarginsWithUnit;
exports.NoViewfinder = NoViewfinder;
exports.NoneLocationSelection = NoneLocationSelection;
exports.NumberWithUnit = NumberWithUnit;
exports.OpenSourceSoftwareLicenseInfo = OpenSourceSoftwareLicenseInfo;
exports.Point = Point;
exports.PointWithUnit = PointWithUnit;
exports.QrCodeBarcodeGeneratorBuilder = QrCodeBarcodeGeneratorBuilder;
exports.Quadrilateral = Quadrilateral;
exports.RadiusLocationSelection = RadiusLocationSelection;
exports.Rect = Rect;
exports.RectWithUnit = RectWithUnit;
exports.RectangularLocationSelection = RectangularLocationSelection;
exports.RectangularViewfinder = RectangularViewfinder;
exports.RectangularViewfinderAnimation = RectangularViewfinderAnimation;
exports.Size = Size;
exports.SizeWithAspect = SizeWithAspect;
exports.SizeWithUnit = SizeWithUnit;
exports.SizeWithUnitAndAspect = SizeWithUnitAndAspect;
exports.Sound = Sound;
exports.SwipeToZoom = SwipeToZoom;
exports.TapToFocus = TapToFocus;
exports.TorchSwitchControl = TorchSwitchControl;
exports.UpcaBarcodeGeneratorBuilder = UpcaBarcodeGeneratorBuilder;
exports.Vibration = Vibration;
exports.VolumeButtonObserver = VolumeButtonObserver;
exports.ZoomSwitchControl = ZoomSwitchControl;
exports.__ScanditCore = index;
exports.cordovaExec = cordovaExec;
exports.createCordovaNativeCaller = createCordovaNativeCaller;
exports.initializePlugin = initializePlugin;
exports.pluginsMetadata = pluginsMetadata;
//# sourceMappingURL=index.js.map
