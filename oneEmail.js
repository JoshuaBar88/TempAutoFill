document.addEventListener("DOMContentLoaded", async () => {
  const getStorageData = key =>
  new Promise((resolve, reject) =>
    chrome.storage.local.get(key, result =>
      chrome.runtime.lastError
        ? reject(Error(chrome.runtime.lastError.message))
        : resolve(result)
    )
  )
  const getEmails = async() => {
    const data = await getStorageData('inbox');
    console.log(data);
    if (data.inbox == undefined) updateHtml([]);
    else updateHtml(JSON.parse(data.inbox));
  }
  const updateHtml = async(mail) => {
    console.log(mail);
    if (mail.length == 0) {
      const body_of_doc = document.getElementsByClassName('big-wrapper');
      const p = document.createElement('p');
      p.innerText = 'There are currnently no emails in your inbox';
      body_of_doc[0].appendChild(p);
    } else {
      const last_element = mail[mail.length - 1];
      const html_of_last = last_element['mail_html'];
      let remove_html;
      let remove_artifacts;
      if (html_of_last.includes('<html>')) {
        remove_html = html_of_last.replace(/<html>|<body>|<\/html>|<\/body>/gi, '');
        remove_artifacts = remove_html.replace(/\/"|\\"/gi, '');
      } else remove_artifacts = html_of_last;
      
      const body_of_doc = document.getElementsByClassName('big-wrapper');
      body_of_doc[0].setAttribute('style', 'width: 96vw;height:100%')
      const adding_refresh = "<div id='refresh-wrapper'><img style='float: right;' id='refresh' src='/assets/refresh.png'/><form style='float: left;' action='popup.html'><button id='mainpopup'>&#8592</button></form></div>" + remove_artifacts;
      body_of_doc[0].innerHTML = adding_refresh;
    }
  }
  document.getElementById("refresh").addEventListener("click", async() => {
    var port = chrome.runtime.connect({name: "emailinfo"});
    port.postMessage({action: "update"});
    port.onMessage.addListener(async (msg) => {
      if (msg.response === "finished") await getEmails();
    });
  });
  await getEmails();
});