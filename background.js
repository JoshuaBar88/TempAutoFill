import { generateNewEmail } from './genNewEmail.js';

const getStorageData = key =>
new Promise((resolve, reject) =>
  chrome.storage.local.get(key, result =>
    chrome.runtime.lastError
      ? reject(Error(chrome.runtime.lastError.message))
      : resolve(result)
  )
)
const setStorageData = data =>
new Promise((resolve, reject) =>
  chrome.storage.local.set(data, () =>
    chrome.runtime.lastError
      ? reject(Error(chrome.runtime.lastError.message))
      : resolve()
  )
)
async function updateEmail(flag) {
  console.log(flag);
  const hash = await getStorageData('hash');
  let new_object = [];
  var myHeaders = new Headers();
  myHeaders.append("apikey", '<api-key>');
  var requestOptions = {
    method: 'GET',
    redirect: 'follow',
    headers: myHeaders
  };
  const returned = await fetch(`https://api.apilayer.com/temp_mail/mail/id/${hash.hash}`, requestOptions)
    .then(response => response.text())
    .then(result => result)
    .catch(error => error);
  const clean_data = JSON.parse(returned);
  if (clean_data.error) return;
  if (!flag) {
    clean_data.forEach(element => {
      const object = { mail_html: (element.mail_html) ? element.mail_html : element.mail_text, date: element.mail_timestamp, mail_subject: element.mail_subject, mail_from: element.mail_from, saved: false };
      new_object.push(object);
    });
  } else {
    const inbox_data = await getStorageData('inbox');
    if (inbox_data.inbox == undefined) {
      clean_data.forEach(element => {
        const object = { mail_html: (element.mail_html) ? element.mail_html : element.mail_text, date: element.mail_timestamp, mail_subject: element.mail_subject, mail_from: element.mail_from, saved: true };
        new_object.push(object);
      });
    } else {
      const old_emails = inbox_data.inbox;
      const temp_new_emails = [];
      let add_object;
      let object;
      let bad_boy;
      let grandfather;
      // const clean_Object = inbox_data.inbox.replace(/\[object Object\],*/g,"");
      // const clean_beginning_end = clean_Object.replace(/^"\\"+|\\""+$/g, "");
      let parsed_inbox = JSON.parse(old_emails);
      if (typeof parsed_inbox == 'string') parsed_inbox = JSON.parse(parsed_inbox)
      console.log(typeof parsed_inbox);
      clean_data.forEach(element => {
        add_object = true;
        bad_boy = false
        grandfather = false;
        parsed_inbox.forEach((oldElement) => {
          if (oldElement.date == element.mail_timestamp) {
            const hourDiff  = (Date.now() - oldElement.date) / 1000 / 60 / 60
            if (hourDiff > 2 && oldElement.saved == false) bad_boy = true;
            else if (hourDiff < 2 && oldElement.saved == false) add_object = false;
          }
        });
        if (!bad_boy) {
          object = { mail_html: (element.mail_html) ? element.mail_html : element.mail_text, date: element.mail_timestamp, mail_subject: element.mail_subject, mail_from: element.mail_from, saved: add_object };
          temp_new_emails.push(object);
        }
      });
      new_object = old_emails.concat(temp_new_emails);
    }
  }
    
  console.log(new_object);
  await setStorageData({ inbox: JSON.stringify(new_object) });
}
// chrome.storage.local.remove(['inbox'],function(){
//   var error = chrome.runtime.lastError;
//      if (error) {
//          console.error(error);
//      }
//  })
async function checkStatus() {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
  const email_data = await getStorageData('email');
  const save_data = await getStorageData('save');
  let save_flag = false;
  if (email_data.length === 0 || typeof email_data.email !== 'string') {
    const info = await generateNewEmail();
    const email = info[0];
    const hash = info[1];
    await setStorageData({ email: email });
    await setStorageData({ hash: hash });
  }
  if (save_data.length === 0 || typeof save_data.save !== 'boolean') {
    await setStorageData({ save: false });
    await updateEmail(false);
  } else {
    await updateEmail(save_data.save);
    save_flag = save_data.save
  }
  return save_flag;
}
const global_save_flag = checkStatus();
chrome.webNavigation.onCompleted.addListener((tab) => {
  console.log(tab);
  if(tab.frameId == 0 && !tab.url?.startsWith("chrome://")) {
    chrome.scripting.executeScript({
      target: { tabId: tab.tabId },
      files: ["contentScript.js"]
    });
  }
});

// chrome.action.onClicked.addListener((tab) => {
//   console.log(tab);
//   if(tab.frameId == 0 && !tab.url?.startsWith("chrome://")) {
//     chrome.scripting.executeScript({
//       target: { tabId: tab.tabId },
//       files: ["contentScript.js"]
//     });
//   }
// });

// chrome.webNavigation.onHistoryStateUpdated.addListener((tab) => {
//   console.log(tab);
//   // if(tab.frameId == 0) {
//   //   chrome.scripting.executeScript({
//   //     target: { tabId: tab.tabId },
//   //     files: ["contentScript.js"]
//   //   });
//   // }
// });

chrome.runtime.onConnect.addListener(function(port) {
  console.assert(port.name === "emailinfo");
  port.onMessage.addListener(async (msg) => {
    if (msg.action === "update") {
      await updateEmail(global_save_flag);
      port.postMessage({response: "finished"});
    }
  });
});