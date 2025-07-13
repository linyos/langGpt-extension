// 避免與頁面其他腳本衝突的命名空間
(function() {
  'use strict';

  console.log('ChatGPT Extension Content Script 已載入');

  // 等待頁面載入完成
  function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver((mutations) => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      }, timeout);
    });
  }

  // 填入文字到 ChatGPT 輸入框
  async function fillChatGPTInput(message) {
    try {
      console.log('開始填入文字到 ChatGPT:', message);
      console.log('當前頁面 URL:', window.location.href);
      
      // 2024-2025 年新版 ChatGPT 的選擇器
      const possibleSelectors = [
        '#prompt-textarea',
        'textarea[placeholder*="Message"]',
        'textarea[placeholder*="Send a message"]',
        'textarea[data-id="root"]',
        'div[contenteditable="true"][data-id="root"]',
        'textarea',
        'div[contenteditable="true"]'
      ];

      let inputElement = null;
      
      for (const selector of possibleSelectors) {
        try {
          console.log(`嘗試選擇器: ${selector}`);
          inputElement = await waitForElement(selector, 3000);
          if (inputElement) {
            console.log(`找到輸入元素，選擇器: ${selector}`, inputElement);
            break;
          }
        } catch (e) {
          console.log(`選擇器 ${selector} 找不到元素:`, e.message);
        }
      }

      if (!inputElement) {
        console.error('無法找到 ChatGPT 輸入框');
        
        // 嘗試列出頁面上所有可能的輸入元素
        const allTextareas = document.querySelectorAll('textarea');
        const allContentEditables = document.querySelectorAll('[contenteditable="true"]');
        console.log('頁面上所有 textarea:', allTextareas);
        console.log('頁面上所有 contenteditable:', allContentEditables);
        
        return false;
      }

      // 設定輸入框的值
      if (inputElement.tagName === 'TEXTAREA') {
        console.log('設定 textarea 的值');
        inputElement.value = message;
        inputElement.dispatchEvent(new Event('input', { bubbles: true }));
        inputElement.dispatchEvent(new Event('change', { bubbles: true }));
      } else if (inputElement.contentEditable === 'true') {
        console.log('設定 contenteditable 的值');
        inputElement.innerHTML = message;
        inputElement.dispatchEvent(new Event('input', { bubbles: true }));
      }

      // 聚焦到輸入框
      inputElement.focus();
      
      console.log('成功填入文字到 ChatGPT 輸入框');
      return true;
    } catch (error) {
      console.error('填入文字失敗:', error);
      return false;
    }
  }

  // 監聽來自 background script 的訊息
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Content script 收到訊息:', request);
    
    if (request.action === "fillInput") {
      console.log('收到來自 background script 的訊息:', request.message);
      
      // 增加延遲以確保頁面完全載入
      setTimeout(async () => {
        const success = await fillChatGPTInput(request.message);
        console.log('填入結果:', success);
        sendResponse({ success: success });
      }, 1000);
      
      return true; // 保持訊息通道開放以進行異步回應
    }
  });

  // 頁面載入完成後檢查是否有待處理的訊息（保留舊的方式作為備用）
  window.addEventListener('load', () => {
    console.log('頁面載入完成，檢查待處理訊息');
    setTimeout(() => {
      try {
        chrome.runtime.sendMessage({ action: "getPendingMessage" }, (response) => {
          if (chrome.runtime.lastError) {
            console.log('Runtime error:', chrome.runtime.lastError.message);
            return;
          }
          
          if (response && response.message) {
            console.log('收到待處理訊息:', response.message);
            fillChatGPTInput(response.message);
          } else {
            console.log('沒有待處理訊息');
          }
        });
      } catch (error) {
        console.error('發送訊息失敗:', error);
      }
    }, 2000);
  });

  // 監聽頁面變化，處理 SPA 路由變化
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      console.log('頁面 URL 變化:', url);
      setTimeout(() => {
        try {
          chrome.runtime.sendMessage({ action: "getPendingMessage" }, (response) => {
            if (chrome.runtime.lastError) {
              console.log('Runtime error:', chrome.runtime.lastError.message);
              return;
            }
            
            if (response && response.message) {
              console.log('頁面變化後收到待處理訊息:', response.message);
              fillChatGPTInput(response.message);
            }
          });
        } catch (error) {
          console.error('發送訊息失敗:', error);
        }
      }, 2000);
    }
  }).observe(document, { subtree: true, childList: true });

})();