chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action !== "automateFeed") return;

  const { likeCount = 0, commentCount = 0 } = message;

  (async function run() {
    const posts = getPosts();
    let liked = 0;
    let commented = 0;

    console.log(`Starting: target likes=${likeCount}, comments=${commentCount}`);

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];

      post.scrollIntoView({ behavior: "smooth", block: "center" });
      await sleep(1500);

     
      if (liked < likeCount) {
        const likeBtn = getLikeButton(post);
        if (likeBtn && !isLiked(likeBtn)) {
          likeBtn.click();
          await sleep(1500);
          liked++;
          console.log(`Liked ${liked}/${likeCount} on post #${i + 1}`);
        } else {
          console.log(`Skipping like on post #${i + 1} (already liked or no button).`);
        }
      }

      
      if (commented < commentCount) {
        const commentBtn = getCommentButton(post);
        if (commentBtn) {
          commentBtn.click();
          await sleep(2000);

          
          const modal = document.querySelector('.artdeco-modal, div[role="dialog"]');
          if (modal && isVisible(modal)) {
            console.log(` Repost modal opened on post #${i + 1}, closing...`);
            const closeBtn = modal.querySelector('button[aria-label="Dismiss"], button[aria-label="Close"]');
            if (closeBtn) closeBtn.click();
            await sleep(1000);
            continue; 
          }

          const editor = await waitFor(
            () => [...post.querySelectorAll('[contenteditable="true"]')].find(isVisible),
            5000
          );

          if (editor) {
            await typeIntoEditor(editor, "Thanks for sharing!!");

           
            let submitBtn = post.querySelector(
              "button.comments-comment-box__submit-button--cr"
            );

            if (!submitBtn) {
              
              submitBtn = [...post.querySelectorAll("button")].find((btn) =>
                btn.className.includes("comments-comment-box__submit-button")
              );
            }

            if (submitBtn && !submitBtn.disabled) {
              submitBtn.click();
              commented++;
              console.log(` Commented ${commented}/${commentCount} on post #${i + 1}`);
              await sleep(2000);
            } else {
              console.log(` No enabled submit button on post #${i + 1}`);
            }
          } else {
            console.log(` No comment editor for post #${i + 1}`);
          }
        }
      }

      if (liked >= likeCount && commented >= commentCount) {
        console.log(" Done: target likes & comments reached.");
        break;
      }
    }
  })();

  sendResponse?.({ status: "started" });
  return true;
});

function getPosts() {
  return document.querySelectorAll("div.feed-shared-update-v2, div.update-components-feed-update");
}

function getLikeButton(post) {
  return post.querySelector('button[aria-label*="Like"]');
}

function isLiked(btn) {
  return btn.getAttribute("aria-pressed") === "true";
}

function getCommentButton(post) {
  return post.querySelector('button[aria-label*="Comment"]');
}

function isVisible(el) {
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitFor(getter, timeout = 4000, interval = 150) {
  const start = Date.now();
  let val;
  while (Date.now() - start < timeout) {
    val = getter();
    if (val) return val;
    await sleep(interval);
  }
  return null;
}

async function typeIntoEditor(editor, text) {
  editor.focus();
  document.execCommand("selectAll", false, null);
  document.execCommand("delete", false, null);

  document.execCommand("insertText", false, text);

  editor.dispatchEvent(new InputEvent("input", { bubbles: true, data: text }));
  editor.dispatchEvent(new Event("change", { bubbles: true }));

  await sleep(1000);
}
