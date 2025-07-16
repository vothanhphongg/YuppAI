// const mtcapNetworkUrls = [
//  "https://pronode8.prosopo.io"
//   ];
  
//   function shouldInject(url) {
//     return mtcapNetworkUrls.some((endpoint) => url.includes(endpoint));
//   }

//   (function () {
//     const origFetch = window.fetch;
  
//     window.fetch = async function (...args) {
//       let _url = args[0];
  
//       if (_url instanceof Request) {
//         _url = _url.url; // Extract URL from Request object
//       }
  
//       if (!shouldInject(_url)) return origFetch(...args);
  
//       const response = await origFetch(...args);
  
//       response.clone().text().then((data) => {
//         // console.log("Intercepted Fetch:", _url);
//         window.postMessage(
//           { type: "fetch", data, url: _url, captchaType: "prosopo" },
//           "*"
//         );
//       });
  
//       return response;
//     };
//   })();

const targetUrls = ["prosopo.io/v1/prosopo/provider/client/captcha/image"];

function shouldIntercept(url) {
    return targetUrls.some((endpoint) => url.includes(endpoint));
}

(function () {
    const originalFetch = window.fetch;

    console.log("Injecting Prosopo script...");

    window.fetch = async function (...args) {
        let requestUrl = args[0];
        console.log("Intercepting Prosopo request:", requestUrl);

        if (requestUrl instanceof Request) {
            requestUrl = requestUrl.url; // Extract URL from Request object
        }

        if (!shouldIntercept(requestUrl)) return originalFetch(...args);

        const response = await originalFetch(...args);
        const clonedResponse = response.clone();

        clonedResponse.text().then((data) => {
            console.log("Prosopo response:", data);
            window.postMessage(
                { type: "fetch_captcha", url: requestUrl, data },
                "*"
            );
        });

        return response;
    };
})();
