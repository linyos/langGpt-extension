// 預設 prompt
const DEFAULT_PROMPT = "請幫我分析以下內容：\n\n";

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
  const promptText = document.getElementById('promptText');
  const saveBtn = document.getElementById('saveBtn');
  const resetBtn = document.getElementById('resetBtn');
  const status = document.getElementById('status');

  // 載入已儲存的 prompt
  chrome.storage.local.get(['customPrompt'], function(result) {
    if (result.customPrompt) {
      promptText.value = result.customPrompt;
    } else {
      promptText.value = DEFAULT_PROMPT;
    }
  });

  // 儲存按鈕事件
  saveBtn.addEventListener('click', function() {
    const prompt = promptText.value.trim();
    if (prompt) {
      chrome.storage.local.set({
        customPrompt: prompt
      }, function() {
        showStatus('Prompt 已儲存！', 'success');
        
        // 同時更新 background script
        chrome.runtime.sendMessage({
          action: 'updatePrompt',
          prompt: prompt
        });
      });
    } else {
      showStatus('請輸入 prompt 內容', 'error');
    }
  });

  // 重置按鈕事件
  resetBtn.addEventListener('click', function() {
    promptText.value = DEFAULT_PROMPT;
    chrome.storage.local.set({
      customPrompt: DEFAULT_PROMPT
    }, function() {
      showStatus('已重置為預設 prompt', 'success');
      
      // 同時更新 background script
      chrome.runtime.sendMessage({
        action: 'updatePrompt',
        prompt: DEFAULT_PROMPT
      });
    });
  });

  // 顯示狀態訊息
  function showStatus(message, type) {
    status.textContent = message;
    status.className = `status ${type}`;
    status.style.display = 'block';
    
    setTimeout(() => {
      status.style.display = 'none';
    }, 3000);
  }

  // 監聽 Enter 鍵儲存
  promptText.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'Enter') {
      saveBtn.click();
    }
  });
});
