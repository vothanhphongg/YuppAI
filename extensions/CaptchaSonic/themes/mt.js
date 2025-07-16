// const mtcapNetworkUrls = [
//   "mtcv1/api/getchallenge.json",
//   "mtcv1/api/getimage.json",
//   "mtcv1/api/getaudio.json",
// ];

// (function (xhr) {
//   var XHR = XMLHttpRequest.prototype;

//   var open = XHR.open;
//   var send = XHR.send;

//   XHR.open = function (method, url) {
//     // console.log(url,"url open")
//     this._method = method;
//     this._url = url;
//     return open.apply(this, arguments);
//   };

//   XHR.send = function (postData) {
//     // console.log(JSON.parse(postData),"post")
//     const _url = this._url;
//     console.log(_url, this.response, "url");
//     this.addEventListener("load", function () {
//       // console.log(JSON.parse(this.response),"response")
//       const isInList = mtcapNetworkUrls.some((url) => _url.indexOf(url) !== -1);
//       console.log(isInList,"inlist")
//       if (isInList) {
//         window.postMessage(
//           { type: "xhr", data: this.response, url: _url, captchaType: "mt" },
//           "*"
//         );
//       }
//     });

//     return send.apply(this, arguments);
//   };
// })(XMLHttpRequest);

// (function () {
//   let origFetch = window.fetch;
//   window.fetch = async function (...args) {
//     const _url = args[0];
//     if (typeof _url !== "string") {
//       return origFetch(...args);
//     }
//     const response = await origFetch(...args);

//     response
//       .clone()
//       .blob()
//       .then(async (data) => {
//         const isInList = mtcapNetworkUrls.some(
//           (url) => _url.indexOf(url) !== -1
//         );
//         if (isInList) {
//           window.postMessage(
//             {
//               type: "fetch",
//               data: await data.text(),
//               url: _url,
//               captchaType: "mt",
//             },
//             "*"
//           );
//         }
//       })
//       .catch((err) => {
//         console.log(err);
//       });

//     return response;
//   };
// })();
const mtcapNetworkUrls = [
  "mtcv1/api/getchallenge.json",
  "mtcv1/api/getimage.json",
  "mtcv1/api/getaudio.json",
];

function shouldInject(url) {
  return mtcapNetworkUrls.some((endpoint) => url.includes(endpoint));
}

(function (xhr) {
  const XHR = XMLHttpRequest.prototype;
  const open = XHR.open;
  const send = XHR.send;

  XHR.open = function (method, url) {
    this._method = method;
    this._url = url;
    return open.apply(this, arguments);
  };

  XHR.send = function (postData) {
    if (!shouldInject(this._url)) return send.apply(this, arguments);

    this.addEventListener("load", function () {
      if (shouldInject(this._url)) {
        // console.log("Intercepted:", this._url);
        window.postMessage(
          { type: "xhr", data: this.response, url: this._url, captchaType: "mt" },
          "*"
        );
      }
    });

    return send.apply(this, arguments);
  };
})(XMLHttpRequest);

(function () {
  const origFetch = window.fetch;

  window.fetch = async function (...args) {
    let _url = args[0];

    if (_url instanceof Request) {
      _url = _url.url; // Extract URL from Request object
    }

    if (!shouldInject(_url)) return origFetch(...args);

    const response = await origFetch(...args);

    response.clone().text().then((data) => {
      // console.log("Intercepted Fetch:", _url);
      window.postMessage(
        { type: "fetch", data, url: _url, captchaType: "mt" },
        "*"
      );
    });

    return response;
  };
})();
