// COLDRAW 優先度インボックス — 起動エントリポイント
import { config } from './src/config.js';
import { createApp } from './src/app.js';
import { loadState } from './src/store.js';
import { refresh, startAutoRefresh } from './src/pipeline.js';
import { sourceStatuses } from './src/sources/index.js';
import { isLlmEnabled } from './src/llm.js';

console.log('✅ 環境変数ロード完了');
console.log(`${isLlmEnabled() ? '✅' : '⚠️'} OpenAI API キー: ${isLlmEnabled() ? '設定済み' : '未設定（ルール判定とテンプレート文案で動作します）'}`);

for (const source of sourceStatuses()) {
  console.log(`${source.active ? '✅' : '⚠️'} ${source.label}: ${source.active ? '有効' : '未設定'}`);
}

loadState();

const app = createApp();

app.listen(config.port, () => {
  console.log(`✅ サーバーが http://localhost:${config.port} で起動しました`);
  console.log(`🌐 優先度インボックス: http://localhost:${config.port}/`);

  if (config.refresh.onBoot) {
    refresh().catch((err) => console.error('❌ 起動時の取り込みに失敗:', err.message));
  }
  startAutoRefresh(config.refresh.intervalMs);
});
