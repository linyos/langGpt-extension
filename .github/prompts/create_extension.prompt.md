---
mode: agent
---


# ChatGPT 快速傳送選取文字 Chrome Extension 開發指南

## 需求說明

- 右鍵選取網頁文字時，出現選單「傳送至 ChatGPT（加上我的 prompt）」。
- 會自動帶入「內定的 prompt」+ 使用者選取的文字。
- 自動開啟 [ChatGPT 官方頁面](https://chat.openai.com/)。
- 自動將組合後的訊息填入 ChatGPT 的輸入框。
- 內定 prompt 可在程式碼常數直接修改。

---

## 安裝與使用說明

1. 將本專案所有檔案放在同一個資料夾。
2. 開啟 Chrome → 更多工具 → 擴充功能。
3. 開啟「開發人員模式」。
4. 點選「載入已解壓縮的擴充功能」→ 選擇你的資料夾。
5. 安裝完成！  
   之後在任意網頁選取文字、右鍵即可看到選單，點擊後會自動打開 ChatGPT 並填入 prompt+選取內容。

---

## 專案檔案結構

