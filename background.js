"use strict";

function pad(n) {
  return String(n).padStart(2, "0");
}

function timestamp() {
  const d = new Date();
  return (
    d.getFullYear() +
    "-" +
    pad(d.getMonth() + 1) +
    "-" +
    pad(d.getDate()) +
    "_" +
    pad(d.getHours()) +
    "-" +
    pad(d.getMinutes()) +
    "-" +
    pad(d.getSeconds())
  );
}

function sanitize(name) {
  return (name || "sayfa").replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 80);
}

function hostnameOf(url) {
  try {
    return new URL(url).hostname || "sayfa";
  } catch {
    return "sayfa";
  }
}

function canInject(url) {
  if (!url) return false;
  return /^(https?|file):/i.test(url);
}

async function flashBadge(tabId, text, color) {
  try {
    await chrome.action.setBadgeBackgroundColor({ color });
    await chrome.action.setBadgeText({ tabId, text });
    setTimeout(() => {
      chrome.action.setBadgeText({ tabId, text: "" }).catch(() => {});
    }, 2000);
  } catch {
    // badge is cosmetic; ignore failures
  }
}

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab || !tab.id || !canInject(tab.url)) {
    await flashBadge(tab && tab.id, "ERR", "#c0392b");
    return;
  }

  let html;
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => document.documentElement.outerHTML,
    });
    html = results && results[0] && results[0].result;
  } catch {
    await flashBadge(tab.id, "ERR", "#c0392b");
    return;
  }

  if (typeof html !== "string" || html.length === 0) {
    await flashBadge(tab.id, "ERR", "#c0392b");
    return;
  }

  const filename =
    sanitize(hostnameOf(tab.url)) + "_" + timestamp() + ".html";

  let url;
  try {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    url = URL.createObjectURL(blob);
  } catch {
    await flashBadge(tab.id, "ERR", "#c0392b");
    return;
  }

  try {
    await chrome.downloads.download({
      url,
      filename,
      saveAs: false,
    });
    await flashBadge(tab.id, "OK", "#27ae60");
  } catch {
    await flashBadge(tab.id, "ERR", "#c0392b");
  } finally {
    setTimeout(() => {
      try {
        URL.revokeObjectURL(url);
      } catch {
        /* noop */
      }
    }, 60000);
  }
});
