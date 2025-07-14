// 內定 prompt - 可在此修改
const DEFAULT_PROMPT = "請幫我分析以下內容：\n\n";

// 創建右鍵選單
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "sendToChatGPT",
    title: "傳送至 ChatGPT（加上我的 prompt）",   
    contexts: ["selection"]
  });
});

// 處理右鍵選單點擊
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "sendToChatGPT") {
    const selectedText = info.selectionText;
    if (selectedText) {
      // 取得自訂 prompt 或使用預設值
      chrome.storage.local.get(['customPrompt'], (result) => {
        const prompt = result.customPrompt || DEFAULT_PROMPT;
        const combinedMessage = prompt + selectedText;
        
        console.info('傳送訊息到 ChatGPT:', combinedMessage);
        
        // 開啟 ChatGPT 頁面
        chrome.tabs.create({
           url: `https://chat.openai.com/#autoSubmit=1&prompt=${combinedMessage}`
        }, (newTab) => {
          if (chrome.runtime.lastError) {
            console.error('建立新分頁失敗:', chrome.runtime.lastError.message);
            return;
          }
          
          console.log('新分頁已建立，ID:', newTab.id);
          
          // 等待新分頁載入完成後，直接發送訊息到 content script
          const tabUpdateListener = (tabId, changeInfo, tab) => {
            console.log('Tab更新事件:', { tabId, changeInfo, status: changeInfo.status });
            
            if (tabId === newTab.id && changeInfo.status === 'complete') {
              console.log('頁面載入完成，準備發送訊息');
              
              // 移除監聽器以避免重複執行
              chrome.tabs.onUpdated.removeListener(tabUpdateListener);
              
              // 延遲一點時間確保頁面完全載入
              setTimeout(() => {
                console.log('開始發送訊息到 content script');
                
                // 直接發送訊息到 content script
                chrome.tabs.sendMessage(tabId, {
                  action: "fillInput",
                  message: combinedMessage
                }, (response) => {
                  if (chrome.runtime.lastError) {
                    console.error('發送訊息到 content script 失敗:', {
                      message: chrome.runtime.lastError.message,
                      tabId: tabId,
                      url: tab.url
                    });
                    
                    // 如果直接發送失敗，使用備用方法（透過 storage）
                    console.log('使用備用方法：透過 storage 傳送訊息');
                    chrome.storage.local.set({
                      pendingMessage: combinedMessage
                    }, () => {
                      if (chrome.runtime.lastError) {
                        console.error('儲存到 storage 也失敗:', chrome.runtime.lastError.message);
                      } else {
                        console.log('已儲存到 storage 作為備用');
                      }
                    });
                  } else {
                    console.log('成功發送訊息到 content script:', response);
                  }
                });
              }, 3000); // 增加延遲到 3 秒
            }
          };
          
          chrome.tabs.onUpdated.addListener(tabUpdateListener);
          
          // 設定超時機制，避免監聽器一直存在
          setTimeout(() => {
            chrome.tabs.onUpdated.removeListener(tabUpdateListener);
            console.log('超時，移除 tab 更新監聽器');
          }, 30000); // 30秒超時
        });
      });
    }
  }
});

// 監聽來自 content script 和 popup 的訊息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('收到訊息:', request, '來自:', sender);
  
  if (request.action === "getPendingMessage") {
    chrome.storage.local.get(["pendingMessage"], (result) => {
      if (result.pendingMessage) {
        console.log('回傳待處理訊息:', result.pendingMessage);
        sendResponse({ message: result.pendingMessage });
        // 清除已使用的訊息
        chrome.storage.local.remove(["pendingMessage"]);
      } else {
        sendResponse({ message: null });
      }
    });
    return true; // 保持訊息通道開放
  }
  
  if (request.action === "updatePrompt") {
    // 更新自訂 prompt（從 popup 傳來）
    chrome.storage.local.set({
      customPrompt: request.prompt
    });
    sendResponse({ success: true });
  }
});
