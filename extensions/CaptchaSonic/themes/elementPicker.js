import TOOLS from "../../src/tools";

(async function () {
  let selectedElement;
  let ocrid = null;

  let settings = {
    APIKEY: "",
  };

  function getDomPath(el) {
    let stack = [];
    while (el.parentNode != null) {
      let sibCount = 0;
      let sibIndex = 0;
      for (let i = 0; i < el.parentNode.childNodes.length; i++) {
        let sib = el.parentNode.childNodes[i];
        if (sib.nodeName == el.nodeName) {
          if (sib === el) {
            sibIndex = sibCount;
          }
          sibCount++;
        }
      }
      if (el.hasAttribute("id") && el.id != "") {
        stack.unshift(el.nodeName.toLowerCase() + "#" + el.id);
      } else if (sibCount > 1) {
        stack.unshift(el.nodeName.toLowerCase() + ":eq(" + sibIndex + ")");
      } else {
        stack.unshift(el.nodeName.toLowerCase());
      }
      el = el.parentNode;
    }

    return stack.slice(1); // removes the html element
  }

  function getBase64Image(img) {
    let canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    let ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    let dataURL = canvas.toDataURL("image/png");

    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
  }

  function getImage() {
    return new Promise((resolve, reject) => {
      let img = new Image();
      img.crossOrigin = "anonymous";
      img.src = selectedElement.src;
      img.onload = function () {
        let base64String = getBase64Image(img);
        resolve(base64String);
      };
      img.onerror = function () {
        reject(new Error("Failed to load image"));
      };
    });
  }

  async function getAnswer(base64Image) {
    console.log("OCRID: ", ocrid);
    if (ocrid) {
      try {
        let req = await fetch(`https://api.captchasonic.com/createTask`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: settings.APIKEY,
          },
          body: JSON.stringify({
            method: "ocr",
            id: ocrid,
            image: base64Image,
            appid: 0,
            version : TOOLS.version,
          }),
        });
        console.log("result: ", req.json());
        return await req.json();
      } catch (error) {
        console.log("Error: ", error);
      }
    }
  }

  async function solveCaptcha() {
    let base64Image = await getImage();
    console.log("base64Image: ", base64Image);

    let answer = await getAnswer(base64Image);
    console.log("Answer: ", answer);
  }

  const highlightElement = (event) => {
    if (selectedElement) {
      selectedElement.style.outline = "";
    }
    selectedElement = event.target;
    selectedElement.style.outline = "2px solid red";
  };

  const selectElement = async (event) => {
    console.log("clicked");
    event.stopPropagation();
    event.preventDefault();
    document.body.removeEventListener("mouseover", highlightElement);

    if (selectedElement) {
      let jsPath = getDomPath(selectedElement);
      chrome.runtime.sendMessage({ jspath: jsPath });
      console.log("JS Path: ", jsPath);
      console.log("imageurl: ", selectedElement.src);
      await solveCaptcha();
      selectedElement.style.outline = "";
      selectedElement = null;
    }
  };

  document.body.addEventListener("mouseover", highlightElement, false);
  document.body.addEventListener("click", selectElement, false);
  // chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  //   console.log("Received Request: ", request);
  //   ocrid = request.menuItemId;
  //   console.log("OCRID: ", ocrid);
  // });
})();
