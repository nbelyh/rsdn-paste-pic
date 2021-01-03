(function () {

  var svgLink =
    "<svg class='icon' xmlns='http://www.w3.org/2000/svg' version='1.1' x='0px' y='0px' width='24px' height='24px' viewBox='0 0 24 24' xml:space='preserve'>" +
    "<g id='link'>" +
    "<path id='right' d='M19.188,12.001c0,1.1-0.891,2.015-1.988,2.015l-4.195-0.015C13.543,15.089,13.968,16,15.002,16h3    C19.658,16,21,13.657,21,12s-1.342-4-2.998-4h-3c-1.034,0-1.459,0.911-1.998,1.999l4.195-0.015    C18.297,9.984,19.188,10.901,19.188,12.001z'/>" +
    "<path id='center' d='M8,12c0,0.535,0.42,1,0.938,1h6.109c0.518,0,0.938-0.465,0.938-1c0-0.534-0.42-1-0.938-1H8.938    C8.42,11,8,11.466,8,12z'/>" +
    "<path id='left' d='M4.816,11.999c0-1.1,0.891-2.015,1.988-2.015L11,9.999C10.461,8.911,10.036,8,9.002,8h-3    c-1.656,0-2.998,2.343-2.998,4s1.342,4,2.998,4h3c1.034,0,1.459-0.911,1.998-1.999l-4.195,0.015    C5.707,14.016,4.816,13.099,4.816,11.999z'/>" +
    "</g>" +
    "</svg>";

  /**
   * Post data to file list
   */
  function uploadFile(file, callback) {

    var now = new Date();

    function two(x) {
      return x <= 9 ? '0' + x : x;
    }

    // file prefix - current timestamp
    var prefix = now.getFullYear()
      + "_" + two(now.getMonth())
      + "_" + two(now.getDay())
      + "_" + two(now.getHours())
      + "_" + two(now.getMinutes())
      + "_" + two(now.getSeconds()) + "_";

    // FileList page url
    var fileListUrl = location.origin + "/Tools/Private/FileList.aspx";

    fetch(fileListUrl).then(function (response) {

      var p = new DOMParser();
      response.text().then(function (html) {

        var doc = p.parseFromString(html, "text/html");
        var __EVENTTARGET = doc.querySelector("#__EVENTTARGET").getAttribute("value");
        // console.log('__EVENTTARGET=', __EVENTTARGET);
        var __EVENTARGUMENT = doc.querySelector("#__EVENTARGUMENT").getAttribute("value");
        // console.log('__EVENTARGUMENT=', __EVENTARGUMENT);
        var __VIEWSTATE = doc.querySelector("#__VIEWSTATE").getAttribute("value");
        // console.log('__VIEWSTATE=', __VIEWSTATE);
        var __VIEWSTATEGENERATOR = doc.querySelector("#__VIEWSTATEGENERATOR").getAttribute("value");
        // console.log('__VIEWSTATEGENERATOR=', __VIEWSTATEGENERATOR);
        var __EVENTVALIDATION = doc.querySelector("#__EVENTVALIDATION").getAttribute("value");
        // console.log('__EVENTVALIDATION=', __EVENTVALIDATION);

        var formData = new FormData();
        formData.append("__EVENTTARGET", __EVENTTARGET);
        formData.append("__EVENTARGUMENT", __EVENTARGUMENT);
        formData.append("__VIEWSTATE", __VIEWSTATE);
        formData.append("__VIEWSTATEGENERATOR", __VIEWSTATEGENERATOR);
        formData.append("__EVENTVALIDATION", __EVENTVALIDATION);
        formData.append("uploadedFile", file, prefix + file.name);
        formData.append('uploadButton', 'Загрузить');

        fetch(fileListUrl, { method: "POST", body: formData }).then(function (response) {

          response.text().then(function (newHtml) {
            var newDoc = p.parseFromString(newHtml, "text/html");
            var a = newDoc.querySelector("#errorText > a");
            if (a) {
              callback(a.href);
            } else {
              var errorTextNode = newDoc.querySelector("#errorText");
              console.warn("File uploaded but href for the uploaded file not found");
              if (errorTextNode && errorTextNode.textContent)
                callback(errorTextNode.textContent);
            }
          }, function (err) {
            console.error(err);
          })
        }, function (err) {
          console.error(err);
        })
      }, function (err) {
        console.error(err);
      });

    }, function (err) {
      console.error(err);
    })
  }

  /**
   * insert tag into text area
   */
  function typeInTextarea(newText) {
    var el = document.querySelector("#msgEdit");
    var start = el.selectionStart
    var end = el.selectionEnd
    var text = el.value
    var before = text.substring(0, start)
    var after = text.substring(end, text.length)
    el.value = (before + newText + after)
    el.selectionStart = el.selectionEnd = start + newText.length
    el.focus()
  }

  /**
   * build HTML browse toolbar button
   */

  function buildButton(code) {

    var btn = document.createElement("button");
    btn.className = "tb-btn";
    btn.type = "button";
    btn.style.fontFamily = "FontAwesome";
    btn.style.fontStyle = "normal";
    btn.style.fontWeight = "normal";
    btn.style.fontVariant = "normal";
    btn.style.lineHeight = 1;
    btn.innerHTML = '&#xf1c5';

    var existing = document.querySelector("button.tb-btn.img-btn");
    existing.parentElement.insertBefore(btn, existing.nextSibling);

    return btn;
  }

  /**
   * upload file and update edit box
   */

  function insertFile(file) {
    uploadFile(file, function (url) {
      var text = "[img]" + url + "[/img]";
      typeInTextarea(text);
    });
  }

  /**
   * upload toolbar button
   */

  function addToolbarButton() {
    var input = document.createElement('input');
    input.type = 'file';
    input.onchange = function (e) {
      var file = e.target.files[0];
      insertFile(file);
    }

    var btn = buildButton();
    btn.onclick = function () {
      input.click();
    }
  }

  /**
   * paste handler
   */
  function addPasteHandler() {
    document.onpaste = function (event) {
      var items = event.clipboardData.items;
      for (var i = 0; i < items.length; ++i) {
        var item = items[i];
        if (item.kind === 'file') {
          var file = items[i].getAsFile();
          insertFile(file);
        }
      }
    }
  }

  /**
   * copy link handler
   */

  function buildLinkButton(href) {
    var a = document.createElement("a");
    a.innerHTML = svgLink;
    a.title = "Скопировать ссылку";
    a.href = href;
    a.style.cursor = "pointer";
    a.style.border = "none";
    a.style.display = "inline-block";
    a.style.position = "relative";

    var tip = document.createElement("div");
    tip.textContent = "Скопировано: " + href;
    tip.style.position = "absolute";
    tip.style.right = "0";
    tip.style.top = "18px";
    tip.style.color = "black";
    tip.style.backgroundColor = "lightYellow";
    tip.style.padding = "10px";
    tip.style.display = "none";
    tip.style.fontFamily = "Verdana,Geneva,sans-serif";

    a.appendChild(tip);

    a.onclick = function (evt) {
      if (!evt.ctrlKey && !evt.shiftKey) {
        evt.preventDefault();
        navigator.clipboard.writeText(href).then(function () {
          tip.style.display = "block";
          setTimeout(function () {
            tip.style.display = "none";
          }, 3000);
        })
        return false;
      }
    }

    return a;
  }

  function addCopyLinkHandler() {
    var messages = document.querySelectorAll(".msg-hdr");
    for (var i = 0; i < messages.length; ++i) {
      var message = messages[i];
      var tb = message.querySelector(".right-tb");
      if (tb) {
        var showBtn = tb.querySelector(".show-in-topic-btn") || tb.querySelector(".show-all-btn");
        if (showBtn) {
          var href = showBtn.href.split(/\?|\.flat/)[0] + ".1";
          var a = buildLinkButton(href);
          tb.appendChild(a);
        }
      }
    }
  }

  document.addEventListener('DOMContentLoaded', function () {

    // only on new message page
    if (location.href.indexOf("/Forum/NewMsg.aspx") >= 0) {
      addToolbarButton();
      addPasteHandler();
    }

    addCopyLinkHandler();
  });

})();