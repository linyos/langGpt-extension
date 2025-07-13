# ChatGPT 快速傳送 Chrome Extension

一個方便的 Chrome 擴充功能，讓您可以快速將選取的文字傳送到 ChatGPT，並自動加上您自訂的 prompt。

## 功能特色

- 🖱️ 右鍵選單快速傳送
- 📝 自訂 prompt 內容
- 🚀 自動開啟 ChatGPT 並填入文字
- ⚙️ 簡潔的設定介面

## 安裝方法

1. 下載此專案的所有檔案
2. 開啟 Chrome 瀏覽器
3. 進入 `chrome://extensions/`
4. 開啟右上角的「開發人員模式」
5. 點擊「載入已解壓縮的擴充功能」
6. 選擇包含此專案檔案的資料夾

## 使用方法

1. 在任何網頁上選取您想要傳送的文字
2. 右鍵點擊選取的文字
3. 選擇「傳送至 ChatGPT（加上我的 prompt）」
4. 擴充功能會自動：
   - 開啟新分頁到 ChatGPT
   - 將您的自訂 prompt + 選取的文字填入輸入框

## 自訂 Prompt

1. 點擊擴充功能圖示（工具列上的圖示）
2. 在彈出視窗中修改 prompt 內容
3. 點擊「儲存」按鈕

## 檔案結構

```
├── manifest.json          # 擴充功能設定檔
├── background.js          # 背景腳本，處理右鍵選單
├── content.js            # 內容腳本，處理 ChatGPT 頁面互動
├── popup.html            # 彈出視窗介面
├── popup.js              # 彈出視窗邏輯
├── icons/                # 圖示資料夾
└── README.md             # 說明文件
```

## 技術細節

- **Manifest V3**: 使用最新的 Chrome Extension API
- **Context Menu**: 右鍵選單功能
- **Storage API**: 儲存自訂 prompt
- **Content Script**: 自動填入 ChatGPT 輸入框
- **跨頁面通訊**: Background script 與 Content script 通訊

## 自訂修改

### 修改預設 Prompt

在 `background.js` 中找到這行：
```javascript
const DEFAULT_PROMPT = "請幫我分析以下內容：\n\n";
```

將其修改為您想要的預設 prompt。

### 修改選單文字

在 `background.js` 中找到：
```javascript
title: "傳送至 ChatGPT（加上我的 prompt）"
```

修改為您想要的選單文字。

## 疑難排解

### 無法填入文字到 ChatGPT
- 確認您已登入 ChatGPT
- 嘗試重新載入 ChatGPT 頁面
- 檢查 ChatGPT 頁面是否有變更（OpenAI 偶爾會更新界面）

### 右鍵選單沒有出現
- 確認您有選取文字
- 重新載入擴充功能
- 檢查擴充功能權限

## 更新日誌

### v1.0.0
- 初始版本發布
- 基本右鍵選單功能
- 自訂 prompt 功能
- 自動填入 ChatGPT 功能

## 授權

此專案採用 MIT 授權條款。

## 貢獻

歡迎提交 Issue 或 Pull Request 來改善這個專案！
