// 預設 prompt
const DEFAULT_PROMPT = "請幫我分析以下內容：\n\n";

// 取得多國語言prompt 內容
const MULTILANG_PROMPT =
`
## 多語言 Enum 表格產生與排版（進化版 Prompt）

請協助我依下列規格處理「單字名稱清單」：

### 📝 輸入前處理規則
1. 自動去除：重複項、前後空白、空白行、全形／半形空格差異視為相同。
2. 若名稱以數字開頭，請在最前面加底線 \`_\` 以符合 C# Enum 規則。
3. 將特殊符號（/ \ : ; & ? # 等）轉換為空格，再依 Camel‑Case 產生 Enum 名稱。

### 🏷️ Enum 命名
- 使用 **英文 Camel‑Case**，首字大寫，如 \`ConfirmNotSaveModifiedData\`。
- 保留縮寫的原大寫（如 BOM、CPU）。

### 🌐 多語翻譯
- 語言欄位順序：【英文】【日語】【簡體中文】【繁體中文】共 4 欄。
- 翻譯準則  
  - 專有名詞維持大小寫（例：BOM、API）。  
  - 動詞句採祈使句式（例：Please Select …）。  
  - 若無法翻譯，請填入原文並於備註欄標示 \`N/A\`。

### 📊 輸出格式
共 6 欄：\`Enum名稱 | 英文 | 英文 | 日文 | 簡體 | 繁體 |\`
> ※ \`EnumValue\`欄請自動填遞增整數（從 0 開始）。

#### 1️⃣ 先輸出 \`|||\`分隔版本  
- 以三條豎線 \`|||\` 分隔欄位，不含多餘空格。  
- 若翻譯結果含 Tab 或換行，請以單一空格取代。

#### 2️⃣ 接著輸出「兩個 Tab」分隔版本（TSV）
- **每欄左右各加一個半形空白，並用半形雙引號 \`"\`將整欄包起來**，欄與欄之間插入 **兩個 Tab**。
- 範例（僅示意一行）  
  \`" Enum名稱 "\`␉␉\`" 英文 "\`␉␉\`" 英文 "\`␉␉\`" 日文 "\`␉␉\`" 簡體 "\`␉␉\`" 繁體 "\`
- 為避免複製遺失空白，請將整個 TSV 置於同一個 \`\`\` 區塊；生成時請勿插入解說文字或額外換行。

#### 3️⃣ 最後請依據上述 Enum 名稱，新增 Enum 成員，格式如下
- 格式範例：  

   \`\`\`csharp
    /// <summary>
    /// [英文]
    /// [日語]
    /// [中文]
    /// </summary>
    MoldBaseStack,
   \`\`\`


> ⚡️ *如果我有多行資料，也請全部一起轉換，讓我可以一鍵全選複製！*

---

（以下貼上我的單字清單）

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