import express, { Request, Response } from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();

app.use(cors({ origin: 'http://localhost:5173' })); // Viteデフォルトポートを指定
app.use(express.json());

// 取引数エンドポイント
app.get('/api/blockchain/n-transactions', async (_req: Request, res: Response) => {
    try {
        const response = await fetch('https://api.blockchain.info/charts/n-transactions?timespan=1days&format=json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (!data.values || data.values.length === 0) {
            return res.status(404).json({ error: '取引データが見つかりません' });
        }
        res.json({ transactions: data.values[data.values.length - 1].y });
    } catch (error: any) {
        console.error('取引数取得エラー:', error);
        res.status(500).json({ error: '取引数の取得に失敗しました', message: error.message });
    }
});

// アクティブアドレス数エンドポイント
app.get('/api/blockchain/n-unique-addresses', async (_req: Request, res: Response) => {
    try {
        const response = await fetch('https://api.blockchain.info/charts/n-unique-addresses?timespan=1days&format=json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (!data.values || data.values.length === 0) {
            return res.status(404).json({ error: 'アドレスデータが見つかりません' });
        }
        res.json({ activeAddresses: data.values[data.values.length - 1].y });
    } catch (error: any) {
        console.error('アドレス数取得エラー:', error);
        res.status(500).json({ error: 'アドレス数の取得に失敗しました', message: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`サーバーがポート${PORT}で起動しました`);
});