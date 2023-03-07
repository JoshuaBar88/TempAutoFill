document.addEventListener("DOMContentLoaded", async () => {
	const save_button = document.getElementById("save");

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
  save_button.addEventListener("click", async (ev) => {
		const element = ev.target
		let txt = element.innerText;
		if (txt == 'Not Saved') {
			element.setAttribute('style', 'border: none;color: white;background-color:green');
			element.innerText = 'Saved'
			await setStorageData({ save: true });
		} else {
			element.setAttribute('style', 'border: none;color: white;background-color:blue');
			element.innerText = 'Not Saved'
			await setStorageData({ save: false });
		}
	});
	function updateSaveFromStorage(flag, element) {
		if (flag) {
			element.setAttribute('style', 'border: none;color: white;background-color:green');
			element.innerText = 'Saved'
		} else {
			element.setAttribute('style', 'border: none;color: white;background-color:blue');
			element.innerText = 'Not Saved'
		}
	}

	const email_data = await getStorageData('email');
	const save_data = await getStorageData('save');
	document.getElementById('email').value = email_data.email;
	updateSaveFromStorage(save_data.save, save_button);
});


