// if (!window.awsScriptLoaded) {
//   window.awsScriptLoaded = true;

//   const awsListeningList = ["/problem", "/verify"];

//   (function () {
//     var XHR = XMLHttpRequest.prototype;

//     var open = XHR.open;
//     var send = XHR.send;

//     XHR.open = function (method, url) {
//       this._method = method;
//       this._url = url;
//       return open.apply(this, arguments);
//     };

//     XHR.send = function (postData) {
//       const _url = this._url;
//       this.addEventListener("load", function () {
//         const isInList = awsListeningList.some(
//           (url) => _url?.indexOf(url) !== -1
//         );
//         if (isInList) {
//           window.postMessage(
//             { type: "xhr", data: this.response, url: _url, captchaType: "waf" },
//             "*"
//           );
//         }
//       });

//       return send.apply(this, arguments);
//     };
//   })(XMLHttpRequest);

//   (function () {
//     let origFetch = window.fetch;
//     window.fetch = async function (...args) {
//       const _url = args[0];
//       const response = await origFetch(...args);

//       response
//         .clone()
//         .blob()
//         .then(async (data) => {
//           const isInList = awsListeningList.some(
//             (url) => _url?.indexOf(url) !== -1
//           );
//           if (isInList) {
//             window.postMessage(
//               {
//                 type: "fetch",
//                 data: await data.text(),
//                 url: _url,
//                 captchaType: "waf",
//               },
//               "*"
//             );
//           }
//         })
//         .catch((err) => {
//           console.log(err);
//         });

//       return response;
//     };
//   })();
// }

if (!window.awsScriptLoaded) {
  window.awsScriptLoaded = true;

  const awsListeningList = ["/problem", "/verify"];

  // XMLHttpRequest hook
  // (function () {
  //   var XHR = XMLHttpRequest.prototype;

  //   var open = XHR.open;
  //   var send = XHR.send;

  //   XHR.open = function (method, url) {
  //     this._method = method;
  //     this._url = url;
  //     return open.apply(this, arguments);
  //   };

  //   XHR.send = function (postData) {
  //     const _url = this._url;

  //     // Type check for _url
  //     if (typeof _url !== "string") {
  //       // console.error("The URL is not a string:", _url);
  //       return send.apply(this, arguments); // Proceed without further processing
  //     }

  //     this.addEventListener("load", function () {
  //       const isInList = awsListeningList.some(
  //         (url) => _url.indexOf(url) !== -1
  //       );
  //       if (isInList) {
  //         console.log(
  //           { data: this.response, url: _url, captchaType: "waf" },
  //           "xhr"
  //         );

  //         window.postMessage(
  //           {
  //             type: "xhr",
  //             data: this.response,
  //             url: _url,
  //             captchaType: "waf",
  //           },
  //           "*"
  //         );
  //       }
  //     });

  //     return send.apply(this, arguments);
  //   };
  // })(XMLHttpRequest);

  // Fetch hook
  (function () {
    let origFetch = window.fetch;
    // console.log(origFetch, "origFetch");
    window.fetch = async function (...args) {
      const _url = args[0];
      // console.log(_url, "_url");
      const response = await origFetch(...args);
      // console.log(response, "response");
      response
        .clone()
        .blob()
        .then(async (data) => {
          // console.log(data, await data.text(), "datadatadatadata");
          const isInList = awsListeningList.some(
            (url) => _url?.indexOf(url) !== -1
          );

          if (isInList) {
            window.postMessage(
              {
                type: "fetch",
                data: await data.text(),
                url: _url,
                captchaType: "waf",
              },
              "*"
            );
          }
        })
        .catch((err) => {
          console.log(err);
        });

      return response;
    };
  })();
}

// (function () {
//   console.log("fetch aws ran");

//   let origFetch = window.fetch;
//   window.fetch = async function (...args) {
//     const _url = args[0];

//     // Type check for _url
//     if (typeof _url !== "string") {
//       // console.error("The URL is not a string:", _url);
//       return origFetch(...args); // Proceed without further processing
//     }

//     // console.log(_url, "_url");

//     const response = await origFetch(...args);

//     response
//       .clone()
//       .blob()
//       .then(async (data) => {
//         const isInList = awsListeningList.some(
//           (url) => _url.indexOf(url) !== -1
//         );
//         if (isInList) {
//           const payload = {
//             source: "regular-dom",
//             type: "fetch",
//             data: await data.text(),
//             url: _url,
//             captchaType: "waf",
//           };
//           console.log(data, "datadatadatadata");

//           console.log(payload, "payload");
//           window.postMessage(payload, "*");
//           // chrome.runtime.sendMessage({ action: payload });
//         }
//       })
//       .catch((err) => {
//         console.error("Error processing fetch response:", err);
//       });

//     return response;
//   };
// })();
// }

// var domain = 'awswaf.com';
// var awsListeningList = [
//   '/problem',
//   '/verify',
// ];

// (function () {
//   console.log('fetch aws ran');
//   var origFetch = window.fetch;
//   console.log(origFetch, "origFetch");
//   window.fetch = async function (...args) {
//     console.log("in fetch");
//     var _url = args[0];
//     var response = await origFetch(...args);
//     response
//       .clone()
//       .blob()
//       .then(async data => {
//         if (_url.indexOf(domain) === -1) return;

//         const domainIndex = _url.indexOf(domain);
//         const isInList = awsListeningList.some(url => {
//           if (_url.indexOf(url) === -1) return false;
//           const urlIndex = _url.indexOf(url);

//           if (domainIndex > urlIndex) return false;

//           return true;
//         });
//         if (isInList) {
//           window.postMessage(
//             {
//               type: 'fetch',
//               data: await data.text(),
//               url: _url,
//             },
//             '*',
//           );
//         }
//       })
//       .catch(err => {
//         console.log(err);
//       });

//     return response;
//   };
// })();
