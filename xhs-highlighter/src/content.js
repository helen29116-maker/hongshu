const TOOLBAR_ID = 'xhs-highlight-toolbar';
const COLORS = ['yellow', 'green', 'pink'];

function getPostId() {
  const m = location.pathname.match(/\/explore\/([a-zA-Z0-9]+)/);
  return m ? m[1] : `page:${location.pathname}`;
}

function getStorageKey() {
  return `highlights:${getPostId()}`;
}

function getPostTitle() {
  return document.title || '小红书帖子';
}

function createToolbar() {
  const toolbar = document.createElement('div');
  toolbar.id = TOOLBAR_ID;
  COLORS.forEach((color) => {
    const btn = document.createElement('button');
    btn.textContent = color;
    btn.style.background = color;
    btn.addEventListener('click', () => applyHighlight(color));
    toolbar.appendChild(btn);
  });

  const cancel = document.createElement('button');
  cancel.textContent = '取消划线';
  cancel.addEventListener('click', removeSelectedHighlight);
  toolbar.appendChild(cancel);

  document.body.appendChild(toolbar);
  return toolbar;
}

const toolbar = createToolbar();

document.addEventListener('mouseup', (event) => {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.toString().trim() === '') {
    toolbar.style.display = 'none';
    return;
  }

  const range = sel.getRangeAt(0);
  if (!document.body.contains(range.commonAncestorContainer)) return;

  toolbar.style.left = `${event.pageX + 8}px`;
  toolbar.style.top = `${event.pageY + 8}px`;
  toolbar.style.display = 'flex';
});

function saveHighlightRecord(text, color) {
  const key = getStorageKey();
  chrome.storage.local.get([key, 'postIndex'], (res) => {
    const records = res[key] || [];
    records.push({ text, color, url: location.href, title: getPostTitle(), ts: Date.now() });

    const postIndex = res.postIndex || {};
    postIndex[getPostId()] = { url: location.href, title: getPostTitle(), updatedAt: Date.now() };

    chrome.storage.local.set({ [key]: records, postIndex });
  });
}

function applyHighlight(color) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;

  const range = sel.getRangeAt(0);
  const text = sel.toString().trim();
  if (!text) return;

  const span = document.createElement('span');
  span.className = `xhs-highlight xhs-highlight-${color}`;
  span.dataset.color = color;

  try {
    range.surroundContents(span);
    saveHighlightRecord(text, color);
    sel.removeAllRanges();
    toolbar.style.display = 'none';
  } catch {
    // 复杂跨节点选择时可能失败
  }
}

function removeSelectedHighlight() {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const node = sel.anchorNode;
  const parent = node?.nodeType === 3 ? node.parentElement : node;
  if (!parent || !parent.classList || !parent.classList.contains('xhs-highlight')) return;

  const textNode = document.createTextNode(parent.textContent || '');
  parent.replaceWith(textNode);
  sel.removeAllRanges();
  toolbar.style.display = 'none';
}
