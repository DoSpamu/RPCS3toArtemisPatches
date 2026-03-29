const fs = require('fs');

function htmlToText(rawHtml) {
  let text = rawHtml;

  // Replace <br> with newlines
  text = text.replace(/<br\s*\/?>/gi, '\n');

  // Handle code/pre blocks - preserve them
  text = text.replace(/<(?:pre|code)[^>]*>([\s\S]*?)<\/(?:pre|code)>/gi, (m, code) => {
    const clean = code
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&#(\d+);/g, (m, n) => String.fromCharCode(parseInt(n)))
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    return '\n[CODE]\n' + clean + '\n[/CODE]\n';
  });

  // Handle spoiler tags
  text = text.replace(/<div[^>]*class="[^"]*spoiler[^"]*"[^>]*>([\s\S]*?)<\/div>/gi, (m, inner) => {
    return '\n[SPOILER]\n' + htmlToText(inner) + '\n[/SPOILER]\n';
  });

  // Strip remaining HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&#(\d+);/g, (m, n) => String.fromCharCode(parseInt(n)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&hellip;/g, '...')
    .replace(/&mdash;/g, '--')
    .replace(/&ndash;/g, '-');

  // Clean up whitespace but preserve newlines
  text = text.replace(/\t/g, ' ').replace(/ {2,}/g, ' ').replace(/\n{5,}/g, '\n\n').trim();
  return text;
}

function extractPosts(html, pageNum) {
  // Split by li post elements: <li id="post-NNNNN" ...>
  const parts = html.split(/<li\s+id="post-(\d+)"/);

  const results = [];

  // parts[0] = before first post
  // parts[1] = postId, parts[2] = rest of that li block
  // parts[3] = postId, parts[4] = rest of that li block, etc.
  for (let i = 1; i < parts.length; i += 2) {
    const postId = parts[i];
    const block = parts[i + 1] || '';

    // Author is in data-author attribute of the li element itself
    // Since we split at <li id="post-N", the block starts right after that
    // The li tag continues: class="..." data-author="...">
    const authorMatch = block.match(/data-author="([^"]+)"/);
    const username = authorMatch ? authorMatch[1].trim() : 'Unknown';

    // Extract date/time from data-time attribute
    const dateMatch = block.match(/data-time="(\d+)"/);
    let date = '';
    if (dateMatch && dateMatch[1]) {
      date = new Date(parseInt(dateMatch[1]) * 1000).toISOString().slice(0, 19).replace('T', ' ');
    }

    // Extract the blockquote with class messageText
    const msgMatch = block.match(/class="messageText[^"]*"[^>]*>([\s\S]*?)<\/blockquote>/);
    if (!msgMatch) continue;

    const text = htmlToText(msgMatch[1]);

    results.push({ page: pageNum, postId, username, date, text });
  }
  return results;
}

let allPosts = [];
for (let pg = 1; pg <= 9; pg++) {
  try {
    const html = fs.readFileSync('C:/Users/Dawid/AppData/Local/Temp/page' + pg + '.html', 'utf8');
    const posts = extractPosts(html, pg);
    process.stderr.write('Page ' + pg + ': found ' + posts.length + ' posts\n');
    allPosts = allPosts.concat(posts);
  } catch(e) {
    process.stderr.write('Page ' + pg + ' error: ' + e.message + '\n');
  }
}

fs.writeFileSync('C:/Users/Dawid/AppData/Local/Temp/all_posts.json', JSON.stringify(allPosts, null, 2));
process.stderr.write('Total posts extracted: ' + allPosts.length + '\n');

// Print all posts to stdout
for (const post of allPosts) {
  console.log('');
  console.log('='.repeat(80));
  console.log('PAGE ' + post.page + ' | POST ID: ' + post.postId + ' | BY: ' + post.username + ' | DATE: ' + post.date);
  console.log('='.repeat(80));
  console.log(post.text);
}
