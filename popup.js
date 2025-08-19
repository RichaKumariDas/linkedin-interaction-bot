document.addEventListener("DOMContentLoaded", () => {
  const likeInput = document.getElementById("likeCount");
  const commentInput = document.getElementById("commentCount");
  const automateBtn = document.getElementById("automateBtn");
  const statusMessage = document.getElementById("statusMessage");

  function toggleButton() {
    automateBtn.disabled = !(
      likeInput.value.trim() &&
      commentInput.value.trim()
    );
  }

  likeInput.addEventListener("input", toggleButton);
  commentInput.addEventListener("input", toggleButton);

  automateBtn.addEventListener("click", () => {
    const likeCount = parseInt(likeInput.value) || 0;
    const commentCount = parseInt(commentInput.value) || 0;

    if (likeCount === 0 && commentCount === 0) {
      showMessage("Please enter at least one value.", "error");
      return;
    }

    showMessage("Starting automation...", "");

    chrome.runtime.sendMessage(
      {
        action: "startAutomation",
        likeCount,
        commentCount,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          showMessage("Error: " + chrome.runtime.lastError.message, "error");
        } else {
          showMessage("Automation started! 🚀", "success");
        }
      }
    );
  });

  function showMessage(msg, type) {
    statusMessage.textContent = msg;
    statusMessage.className = "status"; 
    if (type) statusMessage.classList.add(type);
    statusMessage.style.display = "block";
  }
});
