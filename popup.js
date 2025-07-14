// 預設 prompt
const DEFAULT_PROMPT = "請幫我分析以下內容：\n\n";

// 取得多國語言prompt 內容
const MULTILANG_PROMPT = `我會給你一份單字名稱清單，如果有重複的話請剃除，請將每一個項目轉換為 .NET enum 名稱，命名規則請使用英文 Camel-Case。

你幫我將每個名稱翻譯成多國語言，語言順序為：英文、日語、簡體中文、繁體中文。

請將每一個項目的資訊輸出成下列格式，每個資料之間用 Tab 分隔，每一個資料之間插入一格空白（共 9 欄）：

Enum名稱		英文		英文		日文		簡體		繁體
MoldBaseStack		Mold Base Stack		Mold Base Stack		モールドベーススタック		模座堆叠		模座堆疊



 最後請依據上述Enum名稱，新增Enum成員，格式如下：

 csharp

        /// <summary>
        /// [英文]
        /// [日語]
        /// [中文]
        /// </summary>
        MoldBaseStack,
csharp
`

;

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
  const promptTextarea = document.getElementById('promptText');
  const defaultBtn = document.getElementById('defaultBtn');
  const saveBtn = document.getElementById('saveBtn');
  const resetBtn = document.getElementById('resetBtn');
  const status = document.getElementById('status');

  // 載入已儲存的 prompt
  chrome.storage.local.get(['customPrompt'], function(result) {
    if (result.customPrompt) {
      promptTextarea.value = result.customPrompt;
    } else {
      promptTextarea.value = DEFAULT_PROMPT;
    }
  });

  // 預設提示詞按鈕事件 - 使用多國語言提示詞
  defaultBtn.addEventListener('click', function() {
    promptTextarea.value = MULTILANG_PROMPT;
    showStatus('已載入多國語言提示詞模板', 'success');
    
    // 同時更新 background script
    if (chrome.runtime) {
      chrome.runtime.sendMessage({
        action: 'updatePrompt',
        prompt: promptTextarea.value
      }).catch(err => console.log('Background script communication failed:', err));
    }
  });

  // 儲存按鈕事件
  saveBtn.addEventListener('click', function() {
    const prompt = promptTextarea.value.trim();
    if (prompt) {
      chrome.storage.local.set({
        customPrompt: prompt
      }, function() {
        if (chrome.runtime.lastError) {
          showStatus('儲存失敗', 'error');
        } else {
          showStatus('Prompt 已儲存！', 'success');
          
          // 同時更新 background script
          if (chrome.runtime) {
            chrome.runtime.sendMessage({
              action: 'updatePrompt',
              prompt: prompt
            }).catch(err => console.log('Background script communication failed:', err));
          }
        }
      });
    } else {
      showStatus('請輸入 prompt 內容', 'error');
    }
  });

  // 重置按鈕事件
  resetBtn.addEventListener('click', function() {
    promptTextarea.value = DEFAULT_PROMPT;
    chrome.storage.local.set({
      customPrompt: DEFAULT_PROMPT
    }, function() {
      if (chrome.runtime.lastError) {
        showStatus('重置失敗', 'error');
      } else {
        showStatus('已重置為預設 prompt', 'success');
        
        // 同時更新 background script
        if (chrome.runtime) {
          chrome.runtime.sendMessage({
            action: 'updatePrompt',
            prompt: DEFAULT_PROMPT
          }).catch(err => console.log('Background script communication failed:', err));
        }
      }
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
  promptTextarea.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'Enter') {
      saveBtn.click();
    }
  });
});