export async function getActiveTabUrl() {
  let queryOpotions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOpotions);
  return tab;
}