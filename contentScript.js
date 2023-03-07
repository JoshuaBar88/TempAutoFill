(async () => {
  async function checkAttributes(input) {
    const keyPhrases = {email: ['email'], full: ['full name'], first: ['first name', 'firstname'], last: ['last name', 'lastname'], tele: ['phone number', 'telephone', 'mobile number']};
    let validInputs = null;
    const html_value = input
    for (const [key, value] of Object.entries(keyPhrases)) {
      for (let text of value) {
        if (html_value.outerHTML.toLowerCase().includes(text) || html_value.innerText.toLowerCase().includes(text)) {
          validInputs = {[key]: html_value};
          break;
        }
      }
    }
    return validInputs;
  }
  const getStorageData = key =>
  new Promise((resolve, reject) =>
    chrome.storage.local.get(key, result =>
      chrome.runtime.lastError
        ? reject(Error(chrome.runtime.lastError.message))
        : resolve(result)
    )
  )
  async function updateField(key) {
    const id = key.srcElement.id;
    const data = await getStorageData(`${id}`);
    key.srcElement.previousSibling.value = data[id];
    key.srcElement.previousSibling.dispatchEvent(new Event('input', {bubbles:true}));
  }

  async function createImgFoField(valid_inputs) {
    console.log(valid_inputs);
    for (const key in valid_inputs) {
      const populate_input = document.createElement("img");
      populate_input.src = chrome.runtime.getURL("assets/bookmark.png");
      const newDiv = document.createElement("div");
      const new_style = 'width: 85%'
      newDiv.setAttribute('style', 'position: relative');
      populate_input.setAttribute('style', 'width:15%;positon:absolute;cursor:pointer')
      populate_input.setAttribute('id', `${key}`)
      valid_inputs[key].setAttribute('style', `${new_style}`);
      valid_inputs[key].parentNode.appendChild(newDiv)
      newDiv.appendChild(valid_inputs[key]);
      newDiv.appendChild(populate_input);
      populate_input.addEventListener("click", updateField);
    }
  }

  const inputs = document.getElementsByTagName('input');
  for (let i = 0; i < inputs.length; i ++) {
    const good_input = await checkAttributes(inputs[i]);
    if (good_input) createImgFoField(good_input);
  }

  // const targetNode = document.getElementsByTagName("body");
  // const config = { attributes: true, childList: true, subtree: true };
  // const callback = async (mutationList, observer) => {
  //   for (const mutation of mutationList) {
  //     if (mutation.target.localName == 'input') {
  //       const good_input = await checkAttributes(mutation.target);
  //       if (good_input) createImgFoField(good_input);
  //     }
  //   }
  // };
  // // Create an observer instance linked to the callback function
  // const observer = new MutationObserver(callback);
  // observer.observe(targetNode[0], config);
  // // observer.disconnect();

})();
