# LINE 訊息排程器 (LINE Message Scheduler)

這是一個基於 Next.js 的行動端網頁應用，旨在提供直覺、美觀且具備排程功能的 LINE 訊息發送服務。

## 🌟 核心功能

- **建立訊息 (Dashboard)**:
  - 支援目標群組選擇、多行訊息輸入、日期與時間預約。
  - 提供快速訊息範本（每週報告、會議提醒、公告）。
  - 即時顯示待發送佇列。
- **發送紀錄 (History)**:
  - 完整記錄所有已發送或發送失敗的訊息。
  - 支援關鍵字搜尋與日期區間篩選。
  - 統計成功與失敗次數。
- **系統設定 (Settings)**:
  - 完整支援 **深色模式 (Dark Mode)**（手動切換或隨系統設定）。
  - 管理 LINE Channel 憑證。
  - 顯示 Webhook URL。
- **自動化後端**:
  - **資料存取**: 使用 Google Sheets API 作為輕量化資料庫，儲存預約與歷史紀錄。
  - **訊息發送**: 整合 LINE Messaging API。
  - **排程執行**: 具備 `/api/cron` 介面，可由外部 Cron Job (如 Vercel Cron) 觸發。

## 🛠️ 技術棧

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Icons**: Lucide React
- **Backend API**: Next.js API Routes (Node.js)
- **Database**: Google Sheets API
- **Communication**: LINE Messaging API

## 🚀 快速開始

### 1. 環境變數設定
建立 `.env.local` 並填入以下資訊：
```env
# Google Sheets
GOOGLE_SHEETS_ID=你的試算表ID
GOOGLE_CLIENT_EMAIL=服務帳號Email
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# LINE Messaging API
LINE_CHANNEL_ACCESS_TOKEN=你的長效Token
```

### 2. 資料庫準備
在 Google Sheets 中建立兩個分頁：
- `schedules`: 欄位包含 `id, group, message, scheduledAt, status, createdAt`
- `history`: 欄位包含 `id, group, message, status, scheduledAt, sentAt`

### 3. 本地開發
```bash
npm install
npm run dev
```
開啟 [http://localhost:3000](http://localhost:3000) 即可查看結果。

## 📄 授權
MIT License
