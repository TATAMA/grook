# Grook

LINE 群組 bot：只有群組裡有人 **@Grook**（或 bot 顯示名）時才回覆，整理你的 X **時間軸**，以及 **你有跟隨的帳號** 的新貼文通知。

v1 **不做**每小時自動推播，也 **不包含**讚、回覆、瀏覽等互動數據。**不是**整理你自己發的文。

## 行為

- 觸發：群組 / 多人聊天室的文字訊息裡 @ 到 bot（LINE `mention.isSelf`，或文字出現 `@Grook` / `@顯示名`）。
- 時間窗：`min(距「上次成功被 @ 並回覆」的時間, 24 小時)`
  - 上次 @ 是 6 小時前 → 只整理這 6 小時
  - 第一次，或間隔超過 24 小時 → 整理最近 24 小時
- 內容：
  - 時間軸（跟隨中帳號的貼文／轉發）
  - 跟隨中帳號的新貼文通知
  - **略過**你自己的貼文、明顯詐騙（空投／連錢包／助記詞等）、以及「未跟隨卻 @ 你」的通知
  - 之後若要增刪回報欄位，改 `src/preferences` 即可。
- 上次成功 @ 的時間存在本機 `./data/last-mention.json`（已 gitignore）。

## 需求

- Node.js **20 或更新**
- npm

## 本機安裝與執行

```bash
git clone https://github.com/TATAMA/grook.git
cd grook
npm install
copy .env.example .env   # macOS / Linux：cp .env.example .env
```

先用 mock 跑通整理流程（不需要真實 LINE / X 金鑰）：

```bash
npm run demo
npm test
npm run typecheck
npm run build
```

啟動 webhook 伺服器（會讀 `.env`）：

```bash
npm run dev
```

- `GET /health` → `{ "ok": true, "name": "grook" }`
- `POST /webhook` → LINE Messaging API（會驗證 `X-Line-Signature`）

正式環境用 `npm run build` 後 `npm start`。

## 環境變數

把 `.env.example` 複製成 `.env`，把 `replace_me` 換成真實值。**.env 不要 commit。**

| 變數 | 說明 |
| --- | --- |
| `LINE_CHANNEL_SECRET` | LINE Channel secret，用來驗證 webhook 簽章 |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE Channel access token，用來 reply |
| `LINE_BOT_DISPLAY_NAME` | 顯示名，預設 `Grook`；文字裡 `@` 這個名字也會觸發 |
| `X_PROVIDER` | `mock`（預設，本機假資料）或 `api`（v1 尚未實作） |
| `X_OWNER_HANDLE` | 主人的 X 帳號（不含或不含 `@` 皆可） |
| `X_BEARER_TOKEN` | 之後接官方 X API 用；mock 模式不需要真的值 |
| `PORT` | 預設 `3000` |
| `DATA_DIR` | 預設 `./data` |

`X_PROVIDER=api` 目前會在抓貼文時丟出 TODO 錯誤，**不要用違規爬蟲當預設。**

## 用 ngrok 測 LINE webhook

1. 本機 `npm run dev`（預設 `http://localhost:3000`）。
2. 另開終端：`ngrok http 3000`。
3. 到 [LINE Developers Console](https://developers.line.biz/console/) 開啟你的 Messaging API channel。
4. Webhook URL 填：`https://<ngrok 網域>/webhook`
5. 開啟 Use webhook，用 Console 的 Verify 確認簽章通過。
6. 把 LINE Official Account 加進群組，在群組裡 **@Grook**。

本機 mock 模式下，回覆內容是假的 X 貼文，用來確認「只有被 @ 才回、時間窗、報表文字」整條路是通的。

## 之後放到 Railway 的大綱

1. 用這個 GitHub repo 建立 Railway service。
2. 在 Railway Variables 填與 `.env.example` 相同的鍵（真實值，不要寫進程式）。
3. Build：`npm install && npm run build`；Start：`npm start`。
4. Healthcheck 指到 `GET /health`。
5. 把 Railway 公開網域的 `https://<domain>/webhook` 填回 LINE Developers。
6. `DATA_DIR` 請指到持久化 volume，否則重啟會忘記「上次成功 @」的時間。

## 專案結構

```
src/
  line/         webhook、@ 偵測、reply
  summary/      時間窗、報表文字、明顯詐騙關鍵字過濾
  x/            XProvider 介面（時間軸 + 通知）；mock 實作、api TODO
  store/        上次成功 @ 時間
  preferences/  之後可增刪回報欄位的設定入口
  pipeline.ts   @ → 時間窗 → 抓貼文 → 組成文字
```

## 安全提醒

- 這個 repo 是 **Public**：任何 `LINE_CHANNEL_*`、token、user id、真實 `.env` 都不可進 git。
- 只把 placeholder 留在 `.env.example`。
- webhook 必須驗證 LINE 簽章；不要把 `/webhook` 設成不驗簽的公開 POST。
- 不要在 log 裡印 token。
- 不要把金鑰寫進程式碼或 README 範例以外的地方。
