(function () {

  // only on new message page
  if (location.href.indexOf("/Forum/NewMsg.aspx") < 0)
    return;

  // get current script
  var scripts = document.getElementsByTagName('script');
  var thisScript = scripts[scripts.length - 1];
  var thisScriptSrc = thisScript.src;

  // get user id
  var matchUserId = thisScriptSrc.match(/\/(\d+)\//);
  var userId = matchUserId && matchUserId[1];

  if (!userId)
    return;

  // FileList page url
  var fileListUrl = location.origin + "/Tools/Private/FileList.aspx?uid=" + userId;

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

  /**
   * Post data to file list
   */
  function uploadFile(file, callback) {

    fetch(fileListUrl).then(function (response) {

      var p = new DOMParser();
      response.text().then(function (html) {

        var doc = p.parseFromString(html, "text/html");
        var __EVENTTARGET = doc.querySelector("#__EVENTTARGET").getAttribute("value");
        console.log('__EVENTTARGET=', __EVENTTARGET);
        var __EVENTARGUMENT = doc.querySelector("#__EVENTARGUMENT").getAttribute("value");
        console.log('__EVENTARGUMENT=', __EVENTARGUMENT);
        var __VIEWSTATE = doc.querySelector("#__VIEWSTATE").getAttribute("value");
        console.log('__VIEWSTATE=', __VIEWSTATE);
        var __VIEWSTATEGENERATOR = doc.querySelector("#__VIEWSTATEGENERATOR").getAttribute("value");
        console.log('__VIEWSTATEGENERATOR=', __VIEWSTATEGENERATOR);
        var __EVENTVALIDATION = doc.querySelector("#__EVENTVALIDATION").getAttribute("value");
        console.log('__EVENTVALIDATION=', __EVENTVALIDATION);

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
            }
          })
        })
      });

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
      var item = items[0];
      if (item.kind === 'file') {
        var file = items[0].getAsFile();
        insertFile(file);
      }
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    addToolbarButton();
    addPasteHandler();
  });

})();