(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const server = require('./server-calls')
const {newAlert} = require('./utils')

///////////////////////////////////////////////////////////////////////////////
//      Star Range JS
///////////////////////////////////////////////////////////////////////////////
function changeStars(){
    const rating = Number(document.querySelector('#movieRating').value)
    const stars = document.querySelectorAll('.ratingBox .material-icons')
    for (let i = 0; i < 5; i++) {
        if (i <= Math.floor(rating) - 1) stars[i].textContent = 'star'
        else stars[i].textContent = 'star_border'
    }
    if (rating % 1 !== 0) stars[Math.ceil(rating) - 1].textContent = 'star_half'
}

function changeStarColor(color){
    let stars = document.querySelectorAll('.ratingBox i')
    stars.forEach(star => star.style.color = color)
    document.querySelector('.ratingBox label').style.color = color    
}

function displayPoster(e){
    let posterURL = e.target.value
    document.querySelector('.posterHolder').style.backgroundImage = `url('${posterURL}')`
}

///////////////////////////////////////////////////////////////////////////////
//      Create Movie
///////////////////////////////////////////////////////////////////////////////

function createMovie(e){
    e.preventDefault()
    let postBody = createPostBody()
    server.createMovie(postBody)
        .then(data => {
            newAlert(data.data.data[0].title, 'creation', 'created')
            clearForm()
        })

}

function createPostBody(){
    let inputs = Array.from(document.querySelectorAll('.newMovieForm input'))

    let postBody = inputs.reduce( (acc, input) => {
        acc[input.name] = input.value
        return acc
    }, {})

    return postBody
}


function clearForm(){
    inputs = document.querySelectorAll('.newMovieForm inputs')
    inputs.forEach( input => input.value = '')
    document.querySelector('.posterHolder').style.backgroundImage = ''
}

module.exports = {changeStars, displayPoster, createMovie, createPostBody, changeStars, changeStarColor, displayPoster}
},{"./server-calls":31,"./utils":32}],2:[function(require,module,exports){
const movies = require('./movies')
const create = require('./create')
const {posters, posterBacks, addMultipleListeners, mediaQuery, windowSize} = require('./utils')

///////////////////////////////////////////////////////////////////////////////
//      index.html JS
///////////////////////////////////////////////////////////////////////////////
if (!!document.querySelector('.posterPage')){
    function addPosters(){
        HTMLPosters = posters.reduce( (acc, poster) => {
            let rand = (Math.floor(Math.random() * posterBacks.length))
            acc.push(`<div class="card-wrapper">
                <div class="card">
                    <div class="card-front" style="background-image:url('${poster}')"></div>
                    <div class="card-back" style="background-image:url('${posterBacks[rand]}')"></div>
                </div>
            </div>`)
            return acc
        }, [])
        
        document.querySelector('.posterPage').innerHTML = HTMLPosters.join('')
    }

    function addAnimation(){
        const flipping = setInterval(
            function(){
                const cards = document.querySelectorAll('.card')
                let rand =  Math.floor(Math.random() * cards.length)
                cards[rand].classList.toggle('do-flip')
            }, 1500)

        const flipping2 = setInterval(
            function () {
                const cards = document.querySelectorAll('.card')
                let rand = Math.floor(Math.random() * cards.length)
                cards[rand].classList.toggle('do-flip')
            }, 3333)
    }
    addPosters()
    addAnimation()
}

///////////////////////////////////////////////////////////////////////////////
//      movie.html JS
///////////////////////////////////////////////////////////////////////////////
if (window.location.href.endsWith('/movies.html')){
    document.addEventListener('DOMContentLoaded', movies.addToTable)
    document.addEventListener('DOMContentLoaded', mediaQuery)
    windowSize.addListener(mediaQuery)

} 

///////////////////////////////////////////////////////////////////////////////
//      create.html JS
///////////////////////////////////////////////////////////////////////////////
if (window.location.href.endsWith('/create.html')){ 
    addMultipleListeners('#movieRating', ['mousemove', 'keydown', 'keyup', 'touchmove', 'touch'], create.changeStars)
    document.querySelector('#posterURL').addEventListener('change', function (e) { create.displayPoster(e) })
    document.querySelector('.newMovieForm').addEventListener('submit', function(e){create.createMovie(e)})

    const stars = document.querySelectorAll('.ratingBox i')
    
    document.querySelector('#movieRating').addEventListener('focus', function () { create.changeStarColor('#4db6ac')})
    document.querySelector('#movieRating').addEventListener('focusout', function(){create.changeStarColor('#111')})
}
},{"./create":1,"./movies":3,"./utils":32}],3:[function(require,module,exports){
const server = require('./server-calls')
const create = require('./create')
const { addListener, newAlert, mediaQuery, windowSize, addMultipleListeners } = require('./utils')

///////////////////////////////////////////////////////////////////////////////
//      Initial Setup
//////////////////////////////////////////////////////////////////////////////

function addToTable(){
   return server.getAll()
        .then(data => {
            let htmlArray = HTMLify(data.data.data)
            document.querySelector('.movieTable').innerHTML = ''
            document.querySelector('.movieTable').innerHTML += htmlArray.join('')
            addListener('.delete', 'click', function(e){deleteMovie(e)})
            addListener('.edit', 'click', function(e){createEditPage(e)})
            mediaQuery(windowSize)
        }) 
}

function HTMLify(arr){
    const result = arr.reduce((acc, item) => {
        item = tablify(item)
        acc.push(item)
        return acc
    }, [])
    return result
}

function tablify(item){
    return `
    <tr id="${item.id}">
        <td>${item.title}</td>
        <td>${item.director}</td>
        <td>${item.year}</td>
        <td>${item.rating}</td>
        <td>
            <button type="button" class="edit btn-small waves-effect">edit</button>
        </td>
        <td>
            <button type="button" class="delete btn-small waves-effect">delete</button>
        </td>
    </tr>`
}


///////////////////////////////////////////////////////////////////////////////
//      Delete Movie
///////////////////////////////////////////////////////////////////////////////

function deleteMovie(e){
    let id = Number(e.target.parentElement.parentElement.id)
    if(!id) id = Number(e.target.parentElement.parentElement.parentElement.id)
    server.deleteMovie(id)
        .then(data => {
            newAlert(data.data.data[0].title, 'deletion', 'deleted')
            document.querySelector('.movieTable').innerHTML = ''
            return addToTable()
        })
}


///////////////////////////////////////////////////////////////////////////////
//      Edit Movie
///////////////////////////////////////////////////////////////////////////////

function createEditPage(e){
    const id = e.target.parentElement.parentElement.id
    server.getOne(id)
    .then(data => {
        document.querySelector('body').innerHTML += createEditHTML(data.data.data[0])
        document.querySelector('.cancel').addEventListener('click', function(e){minimize(e)})
        document.querySelector('.confirm').addEventListener('click', function(e){submitChanges(e)})
        addWatchers()
    })
}

function addWatchers(){
    document.querySelector('#posterURL').addEventListener('change', function (e) { create.displayPoster(e) })
    addMultipleListeners('#movieRating', ['mousemove', 'keydown', 'keyup', 'touchmove', 'touch'], create.changeStars)
    document.querySelector('#posterURL').addEventListener('change', function (e) { create.displayPoster(e) })
}

function createEditHTML(movieInfo){
    return `
    <div class="editPage">
        
        <div class="row">

            <div class="col s12 m8">
                <h3>Edit ${movieInfo.title}</h3>
                <form class="newMovieForm">
                    <input type="text" id="movieTitle" name="title" required value="${movieInfo.title}">
                    <label for="movieTitle">Title</label>

                    <input type="text" id="movieDirector" name="director" required value="${movieInfo.director}">
                    <label for="movieDirector">Director</label>

                    <input type="text" id="movieYear" name="year" required pattern="[0-9]{4}" value="${movieInfo.year}">
                    <label for="movieYear">Year</label>


                    <div class="ratingBox">
                        <span class="stars">
                            <i class="material-icons">star</i>
                            <i class="material-icons">star</i>
                            <i class="material-icons">star</i>
                            <i class="material-icons">star_border</i>
                            <i class="material-icons">star_border</i>
                        </span>
                        <input id="movieRating" name="rating" type="range" min="1" max="5" step="0.5" value="${movieInfo.rating}">
                        <label for="movieRating">Rating</label>
                    </div>


                    <input type="url" id="posterURL" name="poster_url" required value="${movieInfo.poster_url}">
                    <label for="posterURL">Movie Poster URL</label>
                    <br>
                    <button type="button" id="${movieInfo.id}" class="confirm btn-small waves-effect">confirm</button>
                    <button type="button" class="cancel btn-small waves-effect">cancel</button>
                </form>

            </div>

            <div class="col s12 m4">
                <div class="posterHolder" style="background-image:url('${movieInfo.poster_url}')"></div>
            </div>
        </div>
    </div>`
}

function minimize(e){
    const editPage = document.querySelector('.editPage')
    setTimeout( function(){ 
        editPage.style.animation = 'popOut .3s ease-in'
        addToTable()
        setTimeout(function(){
            editPage.remove()
        }, 300)
    },0)
}

function submitChanges(e){
    const id = Number(e.target.id)
    let putBody = create.createPostBody()
    server.editMovie(id, putBody)
    .then(() =>{
        addToTable()
        .then(() => {
            minimize(e)
        })    
    })
    
}




module.exports = {addToTable, newAlert}
},{"./create":1,"./server-calls":31,"./utils":32}],4:[function(require,module,exports){
module.exports = require('./lib/axios');
},{"./lib/axios":6}],5:[function(require,module,exports){
(function (process){
'use strict';

var utils = require('./../utils');
var settle = require('./../core/settle');
var buildURL = require('./../helpers/buildURL');
var parseHeaders = require('./../helpers/parseHeaders');
var isURLSameOrigin = require('./../helpers/isURLSameOrigin');
var createError = require('../core/createError');
var btoa = (typeof window !== 'undefined' && window.btoa && window.btoa.bind(window)) || require('./../helpers/btoa');

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();
    var loadEvent = 'onreadystatechange';
    var xDomain = false;

    // For IE 8/9 CORS support
    // Only supports POST and GET calls and doesn't returns the response headers.
    // DON'T do this for testing b/c XMLHttpRequest is mocked, not XDomainRequest.
    if (process.env.NODE_ENV !== 'test' &&
        typeof window !== 'undefined' &&
        window.XDomainRequest && !('withCredentials' in request) &&
        !isURLSameOrigin(config.url)) {
      request = new window.XDomainRequest();
      loadEvent = 'onload';
      xDomain = true;
      request.onprogress = function handleProgress() {};
      request.ontimeout = function handleTimeout() {};
    }

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password || '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    request.open(config.method.toUpperCase(), buildURL(config.url, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    // Listen for ready state
    request[loadEvent] = function handleLoad() {
      if (!request || (request.readyState !== 4 && !xDomain)) {
        return;
      }

      // The request errored out and we didn't get a response, this will be
      // handled by onerror instead
      // With one exception: request that using file: protocol, most browsers
      // will return status as 0 even though it's a successful request
      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
        return;
      }

      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
      var response = {
        data: responseData,
        // IE sends 1223 instead of 204 (https://github.com/axios/axios/issues/201)
        status: request.status === 1223 ? 204 : request.status,
        statusText: request.status === 1223 ? 'No Content' : request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(resolve, reject, response);

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      var cookies = require('./../helpers/cookies');

      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(config.url)) && config.xsrfCookieName ?
          cookies.read(config.xsrfCookieName) :
          undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (config.withCredentials) {
      request.withCredentials = true;
    }

    // Add responseType to request if needed
    if (config.responseType) {
      try {
        request.responseType = config.responseType;
      } catch (e) {
        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
        // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
        if (config.responseType !== 'json') {
          throw e;
        }
      }
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }

    if (requestData === undefined) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};

}).call(this,require('_process'))
},{"../core/createError":12,"./../core/settle":15,"./../helpers/btoa":19,"./../helpers/buildURL":20,"./../helpers/cookies":22,"./../helpers/isURLSameOrigin":24,"./../helpers/parseHeaders":26,"./../utils":28,"_process":30}],6:[function(require,module,exports){
'use strict';

var utils = require('./utils');
var bind = require('./helpers/bind');
var Axios = require('./core/Axios');
var defaults = require('./defaults');

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
axios.create = function create(instanceConfig) {
  return createInstance(utils.merge(defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = require('./cancel/Cancel');
axios.CancelToken = require('./cancel/CancelToken');
axios.isCancel = require('./cancel/isCancel');

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = require('./helpers/spread');

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;

},{"./cancel/Cancel":7,"./cancel/CancelToken":8,"./cancel/isCancel":9,"./core/Axios":10,"./defaults":17,"./helpers/bind":18,"./helpers/spread":27,"./utils":28}],7:[function(require,module,exports){
'use strict';

/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;

},{}],8:[function(require,module,exports){
'use strict';

var Cancel = require('./Cancel');

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;

},{"./Cancel":7}],9:[function(require,module,exports){
'use strict';

module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};

},{}],10:[function(require,module,exports){
'use strict';

var defaults = require('./../defaults');
var utils = require('./../utils');
var InterceptorManager = require('./InterceptorManager');
var dispatchRequest = require('./dispatchRequest');

/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = utils.merge({
      url: arguments[0]
    }, arguments[1]);
  }

  config = utils.merge(defaults, {method: 'get'}, this.defaults, config);
  config.method = config.method.toLowerCase();

  // Hook up interceptors middleware
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;

},{"./../defaults":17,"./../utils":28,"./InterceptorManager":11,"./dispatchRequest":13}],11:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;

},{"./../utils":28}],12:[function(require,module,exports){
'use strict';

var enhanceError = require('./enhanceError');

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};

},{"./enhanceError":14}],13:[function(require,module,exports){
'use strict';

var utils = require('./../utils');
var transformData = require('./transformData');
var isCancel = require('../cancel/isCancel');
var defaults = require('../defaults');
var isAbsoluteURL = require('./../helpers/isAbsoluteURL');
var combineURLs = require('./../helpers/combineURLs');

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Support baseURL config
  if (config.baseURL && !isAbsoluteURL(config.url)) {
    config.url = combineURLs(config.baseURL, config.url);
  }

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers || {}
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};

},{"../cancel/isCancel":9,"../defaults":17,"./../helpers/combineURLs":21,"./../helpers/isAbsoluteURL":23,"./../utils":28,"./transformData":16}],14:[function(require,module,exports){
'use strict';

/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }
  error.request = request;
  error.response = response;
  return error;
};

},{}],15:[function(require,module,exports){
'use strict';

var createError = require('./createError');

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  // Note: status is not exposed by XDomainRequest
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};

},{"./createError":12}],16:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn(data, headers);
  });

  return data;
};

},{"./../utils":28}],17:[function(require,module,exports){
(function (process){
'use strict';

var utils = require('./utils');
var normalizeHeaderName = require('./helpers/normalizeHeaderName');

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = require('./adapters/xhr');
  } else if (typeof process !== 'undefined') {
    // For node use HTTP adapter
    adapter = require('./adapters/http');
  }
  return adapter;
}

var defaults = {
  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Content-Type');
    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    /*eslint no-param-reassign:0*/
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore */ }
    }
    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;

}).call(this,require('_process'))
},{"./adapters/http":5,"./adapters/xhr":5,"./helpers/normalizeHeaderName":25,"./utils":28,"_process":30}],18:[function(require,module,exports){
'use strict';

module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};

},{}],19:[function(require,module,exports){
'use strict';

// btoa polyfill for IE<10 courtesy https://github.com/davidchambers/Base64.js

var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function E() {
  this.message = 'String contains an invalid character';
}
E.prototype = new Error;
E.prototype.code = 5;
E.prototype.name = 'InvalidCharacterError';

function btoa(input) {
  var str = String(input);
  var output = '';
  for (
    // initialize result and counter
    var block, charCode, idx = 0, map = chars;
    // if the next str index does not exist:
    //   change the mapping table to "="
    //   check if d has no fractional digits
    str.charAt(idx | 0) || (map = '=', idx % 1);
    // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
    output += map.charAt(63 & block >> 8 - idx % 1 * 8)
  ) {
    charCode = str.charCodeAt(idx += 3 / 4);
    if (charCode > 0xFF) {
      throw new E();
    }
    block = block << 8 | charCode;
  }
  return output;
}

module.exports = btoa;

},{}],20:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

function encode(val) {
  return encodeURIComponent(val).
    replace(/%40/gi, '@').
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};

},{"./../utils":28}],21:[function(require,module,exports){
'use strict';

/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};

},{}],22:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
  (function standardBrowserEnv() {
    return {
      write: function write(name, value, expires, path, domain, secure) {
        var cookie = [];
        cookie.push(name + '=' + encodeURIComponent(value));

        if (utils.isNumber(expires)) {
          cookie.push('expires=' + new Date(expires).toGMTString());
        }

        if (utils.isString(path)) {
          cookie.push('path=' + path);
        }

        if (utils.isString(domain)) {
          cookie.push('domain=' + domain);
        }

        if (secure === true) {
          cookie.push('secure');
        }

        document.cookie = cookie.join('; ');
      },

      read: function read(name) {
        var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
        return (match ? decodeURIComponent(match[3]) : null);
      },

      remove: function remove(name) {
        this.write(name, '', Date.now() - 86400000);
      }
    };
  })() :

  // Non standard browser env (web workers, react-native) lack needed support.
  (function nonStandardBrowserEnv() {
    return {
      write: function write() {},
      read: function read() { return null; },
      remove: function remove() {}
    };
  })()
);

},{"./../utils":28}],23:[function(require,module,exports){
'use strict';

/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};

},{}],24:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
  (function standardBrowserEnv() {
    var msie = /(msie|trident)/i.test(navigator.userAgent);
    var urlParsingNode = document.createElement('a');
    var originURL;

    /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
    function resolveURL(url) {
      var href = url;

      if (msie) {
        // IE needs attribute set twice to normalize properties
        urlParsingNode.setAttribute('href', href);
        href = urlParsingNode.href;
      }

      urlParsingNode.setAttribute('href', href);

      // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
      return {
        href: urlParsingNode.href,
        protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
        host: urlParsingNode.host,
        search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
        hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
        hostname: urlParsingNode.hostname,
        port: urlParsingNode.port,
        pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                  urlParsingNode.pathname :
                  '/' + urlParsingNode.pathname
      };
    }

    originURL = resolveURL(window.location.href);

    /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
    return function isURLSameOrigin(requestURL) {
      var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
      return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
    };
  })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
  (function nonStandardBrowserEnv() {
    return function isURLSameOrigin() {
      return true;
    };
  })()
);

},{"./../utils":28}],25:[function(require,module,exports){
'use strict';

var utils = require('../utils');

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};

},{"../utils":28}],26:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};

},{"./../utils":28}],27:[function(require,module,exports){
'use strict';

/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};

},{}],28:[function(require,module,exports){
'use strict';

var bind = require('./helpers/bind');
var isBuffer = require('is-buffer');

/*global toString:true*/

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (typeof result[key] === 'object' && typeof val === 'object') {
      result[key] = merge(result[key], val);
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim
};

},{"./helpers/bind":18,"is-buffer":29}],29:[function(require,module,exports){
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

},{}],30:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],31:[function(require,module,exports){
const axios = require('axios')
const baseURL = 'http://localhost:3000/movies'

function getAll() {
    return axios.get(baseURL)
        .then(result => {
            return result
        })
}

function getOne(id){
    return axios.get(baseURL + '/' + id)
        .then(result => {
            return result
        }) 
}

function deleteMovie(id){
    return axios.delete(`${baseURL}/${id}`)
        .then(result => {
            return result
        })
}

function createMovie(postBody){
    return axios.post(baseURL, postBody)
}

function editMovie(id, putBody){
    return axios.put(baseURL + '/' + id, putBody)
}


module.exports = {getAll, getOne, deleteMovie, createMovie, editMovie}
},{"axios":4}],32:[function(require,module,exports){
///////////////////////////////////////////////////////////////////////////////
//      Listeners and Alerts
///////////////////////////////////////////////////////////////////////////////
function addListener(iterable, trigger, fn){
    let iterables = document.querySelectorAll(iterable)
    iterables.forEach(iter => {
        return iter.addEventListener(trigger, function(e){fn(e)})
    })
    
}

function addMultipleListeners(element, triggerArray, fn){
    triggerArray.forEach( trigger => {
        document.querySelector(element).addEventListener(trigger, fn)
    })
}

function newAlert(title, type, verb) {
    let newAlert = `
    <p class="${type}Alert">${title} has been ${verb}</p>`
    document.querySelector('body').innerHTML += newAlert
    setTimeout(
        function () {
            document.querySelector(`.${type}Alert`).classList.add('fadeOut')
            setTimeout(
                function () { document.querySelector(`.${type}Alert`).remove() },
                1000
            )
        }, 3000)
}

///////////////////////////////////////////////////////////////////////////////
//      Poster data
///////////////////////////////////////////////////////////////////////////////
const posters =
    ['https://image.tmdb.org/t/p/w185_and_h278_bestv2/lHu1wtNaczFPGFDTrjCSzeLPTKN.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/x1txcDXkcM65gl7w20PwYSxAYah.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/AkJQpZp9WoNdj7pLYSj1L0RcMMN.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/eyWICPcxOuTcDDDbTMOZawoOn8d.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/rWQVj6Z8kPdsbt7XPjVBCltxq90.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/wrFpXMNBRj2PBiN4Z5kix51XaIZ.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/rv1AWImgx386ULjcf62VYaW8zSt.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/rW0A73hjzPWVwADlCTLnjLhAFLX.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/2L8ehd95eSW9x7KINYtZmRkAlrZ.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/afdZAIcAQscziqVtsEoh2PwsYTW.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/pk9R56ZFlofbBzfwBnHlDyg5DMs.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/5LYSsOPzuP13201qSzMjNxi8FxN.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/gnTqi4nhIi1eesT5uYMmhEPGNih.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/uxzzxijgPIY7slzFvMotPv8wjKA.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/l76Rgp32z2UxjULApxGXAPpYdAP.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/bXs0zkv2iGVViZEy78teg2ycDBm.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/to0spRl1CMDvyUbOnbb4fTk3VAd.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/rT49ousKUWN3dV7UlhaC9onTNdl.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/9qYKrgzHbYtKej9Gvd7NxJvGiC2.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/4Y1AlIP3SIOTje3ky9p68XhQmHU.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/h70wRv6iWxiqED4orqfxcEl74Rc.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/e7ACYk5KSDRKYBHcwQVcojxJknN.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/6jBuc4l7ixM8S5PCcSYvGKDmIX9.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/huSncs4RyvQDBmHjBBYHSBYJbSJ.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/ahF5c6vyP8HWMqIwlhecbRALkjq.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/e3P2Ed0sbmQ6RsoS4dcT3aeEPR.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/lfJSDT8KYk5k34AEw1eTa4ahscL.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/7rUnZrcSyfwfloeI5aoccztSLSg.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/AfybH6GbGFw1F9bcETe2yu25mIE.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/94RaS52zmsqaiAe1TG20pdbJCZr.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/hKHZhUbIyUAjcSrqJThFGYIR6kI.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/iOMkwo6X4vyNtpanM84TX4m8poT.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/5IPrT71JTNxPTClpzzytRhkGTkk.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/v5HlmJK9bdeHxN2QhaFP1ivjX3U.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/SDbTy4IzTFnxvGycW7cePjEDDP.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/anIVgBJyG3fKnCuBshCfiJBsR8z.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/jjPJ4s3DWZZvI4vw8Xfi4Vqa1Q8.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/8fDtXi6gVw8WUMWGT9XFz7YwkuE.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/p2HbBHBx2yog6cWPKJDwMlYZauf.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/4nKoB6wMVXfsYgRZK5lHZ5VMQ6J.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/pU1ULUq8D3iRxl1fdX2lZIzdHuI.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/55W6mUVv4CXMMQHHhV2zXtLSpXQ.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/dOtenLPIbTUZ8dcYKEA7T7qRURz.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/gjAFM4xhA5vyLxxKMz38ujlUfDL.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/qcnOKCPleLOTWPPgYI0YT1MOQwR.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/3gIO6mCd4Q4PF1tuwcyI3sjFrtI.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/nAU74GmpUk7t5iklEp3bufwDq4n.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/wJhvud2zC8AzrKOH7nEGK3ObaIV.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/tj4lbeWQBvPwGjadEAAjJdQolko.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/zfDN0YX1BNRsnCnp1mWOaiGeN9y.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/gjAFM4xhA5vyLxxKMz38ujlUfDL.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/qcnOKCPleLOTWPPgYI0YT1MOQwR.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/3gIO6mCd4Q4PF1tuwcyI3sjFrtI.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/nAU74GmpUk7t5iklEp3bufwDq4n.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/wJhvud2zC8AzrKOH7nEGK3ObaIV.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/tj4lbeWQBvPwGjadEAAjJdQolko.jpg',
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/zfDN0YX1BNRsnCnp1mWOaiGeN9y.jpg'

    ]

const posterBacks = [
    'https://image.tmdb.org/t/p/w185_and_h278_bestv2/x2I7eZNMDZKPUFM6QuKkmHKZDQm.jpg',
    'https://image.tmdb.org/t/p/w185_and_h278_bestv2/sFC1ElvoKGdHJIWRpNB3xWJ9lJA.jpg',
    'https://image.tmdb.org/t/p/w185_and_h278_bestv2/MvYpKlpFukTivnlBhizGbkAe3v.jpg',
    'https://image.tmdb.org/t/p/w185_and_h278_bestv2/w4ibr8R702DCjwYniry1D1XwQXj.jpg',
    'https://image.tmdb.org/t/p/w185_and_h278_bestv2/c9XxwwhPHdaImA2f1WEfEsbhaFB.jpg',
    'https://image.tmdb.org/t/p/w185_and_h278_bestv2/litjsBoiydO6JlO70uOX4N3WnNL.jpg',
    'https://image.tmdb.org/t/p/w185_and_h278_bestv2/3IGbjc5ZC5yxim5W0sFING2kdcz.jpg',
    'https://image.tmdb.org/t/p/w185_and_h278_bestv2/v2KnosS7G2M9pMymvX0XXTcf04c.jpg',
    'https://image.tmdb.org/t/p/w185_and_h278_bestv2/i91mfvFcPPlaegcbOyjGgiWfZzh.jpg',
    'https://image.tmdb.org/t/p/w185_and_h278_bestv2/msqWSQkU403cQKjQHnWLnugv7EY.jpg',
    'https://image.tmdb.org/t/p/w185_and_h278_bestv2/pU1ULUq8D3iRxl1fdX2lZIzdHuI.jpg',
    'https://image.tmdb.org/t/p/w185_and_h278_bestv2/55W6mUVv4CXMMQHHhV2zXtLSpXQ.jpg',
    'https://image.tmdb.org/t/p/w185_and_h278_bestv2/dOtenLPIbTUZ8dcYKEA7T7qRURz.jpg',
    'https://image.tmdb.org/t/p/w185_and_h278_bestv2/gjAFM4xhA5vyLxxKMz38ujlUfDL.jpg',
    'https://image.tmdb.org/t/p/w185_and_h278_bestv2/qcnOKCPleLOTWPPgYI0YT1MOQwR.jpg',
    'https://image.tmdb.org/t/p/w185_and_h278_bestv2/3gIO6mCd4Q4PF1tuwcyI3sjFrtI.jpg',
    'https://image.tmdb.org/t/p/w185_and_h278_bestv2/nAU74GmpUk7t5iklEp3bufwDq4n.jpg',
    'https://image.tmdb.org/t/p/w185_and_h278_bestv2/wJhvud2zC8AzrKOH7nEGK3ObaIV.jpg',
    'https://image.tmdb.org/t/p/w185_and_h278_bestv2/tj4lbeWQBvPwGjadEAAjJdQolko.jpg',
    'https://image.tmdb.org/t/p/w185_and_h278_bestv2/zfDN0YX1BNRsnCnp1mWOaiGeN9y.jpg'
]

///////////////////////////////////////////////////////////////////////////////
//     Media Queries
///////////////////////////////////////////////////////////////////////////////
const windowSize = window.matchMedia("(max-width: 450px)")

function mediaQuery(windowSize){
    const editBtns = document.querySelectorAll('.edit')
    const deleteBtns = document.querySelectorAll('.delete')

    if(windowSize.matches){
        editBtns.forEach(btn => btn.innerHTML = '<i class="material-icons">edit</i>')
        deleteBtns.forEach(btn => btn.innerHTML = '<i class="material-icons">delete</i>')
    }
    else{
        editBtns.forEach(btn => btn.textCtonet = 'edit')
        deleteBtns.forEach(btn => btn.textContent = 'delete') 
    }
}


module.exports = {addListener, newAlert, addMultipleListeners, posters, posterBacks, mediaQuery, windowSize}
},{}]},{},[2]);
