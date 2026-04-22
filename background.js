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

// Runs inside the page. Blob URL + <a download> works reliably in the page
// context and sidesteps MV3 service-worker blob-URL download limitations.
function savePageAsHtml(filename) {
  try {
    const html = document.documentElement.outerHTML;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => {
      try { URL.revokeObjectURL(url); } catch { /* noop */ }
    }, 60000);
    return { ok: true, bytes: html.length };
  } catch (e) {
    return { ok: false, error: String((e && e.message) || e) };
  }
}

chrome.action.onClicked.addListener(async (tab) => {
  const tabId = tab && tab.id;

  if (!tabId || !canInject(tab.url)) {
    console.warn("Cannot inject on URL:", tab && tab.url);
    await flashBadge(tabId, "ERR", "#c0392b");
    return;
  }

  const filename =
    sanitize(hostnameOf(tab.url)) + "_" + timestamp() + ".html";

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: savePageAsHtml,
      args: [filename],
    });
    const r = results && results[0] && results[0].result;
    if (r && r.ok) {
      await flashBadge(tabId, "OK", "#27ae60");
    } else {
      console.error("HTML save failed in page:", r && r.error);
      await flashBadge(tabId, "ERR", "#c0392b");
    }
  } catch (e) {
    console.error("executeScript failed:", e);
    await flashBadge(tabId, "ERR", "#c0392b");
  }
});
