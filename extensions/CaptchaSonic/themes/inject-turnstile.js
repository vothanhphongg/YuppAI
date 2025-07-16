(function () {
  // console.log("inject-script of turnstile");

  window.addEventListener("message", function (event) {
    if (event.data?.type !== "turnstileSolved") return;


    window?.turnstileCallback(event.data?.token);
  });

  if (window["turnstile"]) {
    window["turnstile"] = new Proxy(window["turnstile"], {
      set: function (target, prop, value, receiver) {
        return Reflect.set(target, prop, value, receiver);
      },
      get: function (target, prop) {
        console.log(prop,"from 1")
        if (prop === "render") {
          return new Proxy(target[prop], {
            apply: function (target, thisArg, argArray) {
              console.log("calling form 1----")
              rewrite(argArray);
              return null;
            },
          });
        }

        return target[prop];
      },
    });
    return;
  }

  function rewrite([d, e]) {
    console.log(e, "e");
    const f = d["parentElement"] || d;
    if (!f["id"]) {
      f["id"] = "turnstile-input-" + e["sitekey"];
    }
    if (e["callback"]) {
      window["turnstileCallback"] = e["callback"];
    }

    window["registerTurnstileData"] = {
      sitekey: e["sitekey"],
    };

    window.postMessage({
      type: "registerTurnstile",
      sitekey: e["sitekey"],
    });
  }

  window["turnstile"] = new Proxy(
    {
      render: function () {},
      reset: function () {},
      ready: function () {},
      remove: function () {},
      execute: function () {},
    },
    {
      set: function (target, prop, value, receiver) {
        return Reflect.set(target, prop, value, receiver);
      },
      get: function (target, prop) {
        console.log(prop,target, "prop");
        if (prop === "render" || prop === "catch") {
          return new Proxy(target["render"], {
            apply: function (target, thisArg, argArray) {
              console.log("calling form 2")
             
              rewrite(argArray);
              return target.apply(thisArg, argArray);
            },
          });
        }

        return target[prop];
      },
    }
  );
})();
