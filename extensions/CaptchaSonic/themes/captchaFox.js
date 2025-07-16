let captchafoxListeningList = [
    "https://api.captchafox.com/captcha/sk_"
  ];
  
  (function () {
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
      const url = args[0];
  
      const response = await originalFetch(...args);
      const cloned = response.clone();
  
      try {
        const isCaptchafox = captchafoxListeningList.some((entry) =>
          url.includes(entry)
        );
  
        if (isCaptchafox) {
          const data = await cloned.json(); // Parse JSON from the cloned response
  
          window.postMessage(
            {
              type: "fetch",
              data: data, // JSON object
              url,
              captchaType: "captchafox"
            },
            "*"
          );
        }
      } catch (e) {
        console.error("Error parsing CAPTCHAFOX response:", e);
      }
  
      return response;
    };
  })();
  