# TODO App

フルスタックTODOアプリケーション（編集機能付き）

## 🚀 開発情報

- **開発時間**: 約15分
- **開発者**: Claude Code による自動実装

## 🛠️ 使用技術

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **PostgreSQL** - Database
- **pg** - PostgreSQL client

### Frontend
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **CSS3** - Styling

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## ✨ 機能

- ✅ TODOの追加
- ✅ TODOの編集（ダブルクリック or Editボタン）
- ✅ TODOの完了/未完了切り替え
- ✅ TODOの削除
- ✅ データ永続化（PostgreSQL）
- ✅ レスポンシブデザイン

## 🏃‍♂️ 起動方法

1. **リポジトリをクローン**
   ```bash
   git clone https://github.com/yamamoto0911/todo-app.git
   cd todo-app
   ```

2. **Dockerコンテナを起動**
   ```bash
   docker-compose up -d
   ```

3. **アプリケーションにアクセス**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Database: localhost:5432

## 📱 使い方

### TODOの追加
- 上部のテキストボックスに入力して「Add」ボタンをクリック

### TODOの編集
- **方法1**: TODOタイトルをダブルクリック
- **方法2**: 「Edit」ボタンをクリック
- **保存**: Enterキー or 「Save」ボタン
- **キャンセル**: Escapeキー or 「Cancel」ボタン

### その他の操作
- **完了切り替え**: チェックボックスをクリック
- **削除**: 「Delete」ボタンをクリック

## 🗂️ プロジェクト構成

```
todo-app/
├── backend/           # Express.js API server
│   ├── src/
│   │   └── server.ts  # Main server file
│   ├── Dockerfile
│   └── package.json
├── frontend/          # React application
│   ├── src/
│   │   ├── App.tsx    # Main component
│   │   └── App.css    # Styles
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml # Multi-container setup
```

## 🔧 API エンドポイント

- `GET /api/todos` - TODOリスト取得
- `POST /api/todos` - TODO追加
- `PUT /api/todos/:id` - TODO更新（タイトル・完了状態）
- `DELETE /api/todos/:id` - TODO削除

## 💾 データ永続化

PostgreSQLボリュームにより、コンテナを停止・再起動してもデータが保持されます。

## 🏗️ 開発・拡張

### 開発モードで起動
```bash
# Backend
cd backend && npm run dev

# Frontend  
cd frontend && npm start
```

### 新機能の追加
- 期限設定
- カテゴリ分類
- 優先度設定
- ファイル添付
- 複数ユーザー対応