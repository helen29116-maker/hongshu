const list = document.getElementById('list');

chrome.storage.local.get(null, (all) => {
  const keys = Object.keys(all).filter((k) => k.startsWith('highlights:'));
  if (keys.length === 0) {
    list.textContent = '暂无划线内容';
    return;
  }

  list.innerHTML = '';
  keys.forEach((key) => {
    const items = all[key] || [];
    if (items.length === 0) return;

    const latest = items[items.length - 1];
    const post = document.createElement('div');
    post.className = 'post';

    const title = document.createElement('div');
    title.className = 'title';

    const link = document.createElement('a');
    link.href = latest.url;
    link.target = '_blank';
    link.textContent = latest.title || latest.url;
    title.appendChild(link);

    const ul = document.createElement('ul');
    items.slice(-5).reverse().forEach((item) => {
      const li = document.createElement('li');
      li.textContent = `${item.text} [${item.color}]`;
      ul.appendChild(li);
    });

    post.appendChild(title);
    post.appendChild(ul);
    list.appendChild(post);
  });
});
