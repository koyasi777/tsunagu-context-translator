// IndexedDB 初期化
const DB_NAME = 'translator-db';
const STORE_NAME = 'translations';
let db;

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
    };
    req.onsuccess = () => { db = req.result; resolve(); };
    req.onerror = () => reject(req.error);
  });
}

async function saveTranslation(entry) {
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).add(entry);
  return tx.complete;
}

async function loadBookmarks() {
  const container = document.getElementById('bookmarkList');
  container.innerHTML = '';

  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);

  const all = await new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  all.reverse().forEach((d) => {
    const card = document.createElement('div');
    card.className = 'card mb-2';

    card.innerHTML = `
      <div class="card-body p-2" style="cursor: pointer;">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <small class="text-muted">${new Date(d.timestamp).toLocaleString()}</small>
            <div><strong>原文:</strong> ${d.original}</div>
            <div><strong>訳文:</strong> ${d.translated}</div>
          </div>
          <button class="btn btn-sm btn-outline-danger ms-2" data-id="${d.id}">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>`;

    // 削除ボタンの処理
    const deleteBtn = card.querySelector('button[data-id]');
    deleteBtn.addEventListener('click', async (e) => {
      e.stopPropagation(); // モーダル表示をキャンセル
      const id = Number(deleteBtn.getAttribute('data-id'));
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(id);
      await tx.complete;
      loadBookmarks();
    });

    // 詳細モーダルの表示
    card.querySelector('.card-body').addEventListener('click', () => {
      document.getElementById('modalOriginalText').textContent = d.original;
      document.getElementById('modalTranslatedText').textContent = d.translated;
      document.getElementById('modalContextText').textContent =
        d.context ? d.context : '（文脈は入力されていません）';
      document.getElementById('modalExplanationText').innerHTML =
        d.explanation ? marked.parse(d.explanation) : '<em>解説は保存されていません</em>';
      bootstrap.Modal.getOrCreateInstance(document.getElementById('bookmarkDetailModal')).show();
    });

    container.appendChild(card);
  });
}

// UI要素
const apiKeyInput = document.getElementById('envApiKey');
const apiKeySaveBtn = document.getElementById('apiKeySaveBtn');
const navMotherLang = document.getElementById('navMotherLang');
const navLearnLang = document.getElementById('navLearnLang');
const inputText = document.getElementById('inputText');
const contextText = document.getElementById('contextText');
const contextContainer = document.getElementById('contextContainer');
const toggleContextBtn = document.getElementById('toggleContextBtn');
const translateBtn = document.getElementById('translateBtn');
const explainModeToggle = document.getElementById('explainModeToggle');
const saveBtn = document.getElementById('saveBtn');
const translationSection = document.getElementById('translationSection');
const explanationSection = document.getElementById('explanationSection');
const srcInfo = document.getElementById('srcInfo');
const tgtInfo = document.getElementById('tgtInfo');
const copyTranslationBtn = document.getElementById('copyTranslationBtn');
const exportJsonBtn = document.getElementById('exportJsonBtn');
const importJsonFile = document.getElementById('importJsonFile');
const importJsonBtn = document.getElementById('importJsonBtn');

// ページロード時に保存済み設定を読み込んで反映
(function initExplainMode() {
  const saved = localStorage.getItem('explainMode');
  // saved が null → toggle.checked（HTMLの checked 属性）を初期値として使う
  const isOn = saved === null
    ? explainModeToggle.checked
    : (saved === 'true');

  explainModeToggle.checked        = isOn;
  explanationSection.style.display = isOn ? 'block' : 'none';
})();

// トグル変更時にローカルストレージへ保存＆表示切替
explainModeToggle.addEventListener('change', () => {
  const isOn = explainModeToggle.checked;
  localStorage.setItem('explainMode', isOn);
  explanationSection.style.display = isOn ? 'block' : 'none';
});

// ── ① ページロード時に「文脈設定」を復元 ──
(function initContext() {
  // localStorage から状態を取得
  const savedEnabled = localStorage.getItem('contextEnabled');
  const savedText    = localStorage.getItem('contextText') || '';

  // テキストエリアに前回の入力内容をセット
  contextText.value = savedText;

  // 表示状態を判定（'true' なら表示）
  const enabled = savedEnabled === 'true';
  if (enabled) {
    contextContainer.classList.remove('d-none');
    toggleContextBtn.innerHTML = '<i class="bi bi-dash-lg me-1"></i>文脈を削除';
  } else {
    contextContainer.classList.add('d-none');
    toggleContextBtn.innerHTML = '<i class="bi bi-plus-lg me-1"></i>文脈を追加';
  }
})();

// ── ② ボタン押下時に表示状態を保存 ──
toggleContextBtn.addEventListener('click', () => {
  const isCurrentlyVisible = !contextContainer.classList.contains('d-none');
  const willBeVisible = !isCurrentlyVisible;

  contextContainer.classList.toggle('d-none');
  toggleContextBtn.innerHTML = willBeVisible
    ? '<i class="bi bi-dash-lg me-1"></i>文脈を削除'
    : '<i class="bi bi-plus-lg me-1"></i>文脈を追加';

  localStorage.setItem('contextEnabled', String(willBeVisible));
});

// ── ③ テキスト入力時に内容を保存 ──
contextText.addEventListener('input', () => {
  localStorage.setItem('contextText', contextText.value);
});

// ==== Gemini モデル選択・URL構成 ====
const GEMINI_MODELS = {
  'gemini-2.0-flash-lite': {
    id: 'gemini-2.0-flash-lite',
    label: '🔹 Gemini 2.0 Flash-Lite（安定版）'
  },
  'gemini-2.0-flash': {
    id: 'gemini-2.0-flash',
    label: '🔹 Gemini 2.0 Flash'
  },
  'gemini-2.5-flash-preview-05-20': {
    id: 'gemini-2.5-flash-preview-05-20',
    label: '🔹 Gemini 2.5 Flash preview'
  },
  'gemini-2.5-pro-preview-05-06': {
    id: 'gemini-2.5-pro-preview-05-06',
    label: '🔹 Gemini 2.5 Pro preview'
  },
  'gemini-1.5-flash': {
    id: 'gemini-1.5-flash',
    label: '🔹 Gemini 1.5 Flash'
  },
  'gemini-1.5-flash-8b': {
    id: 'gemini-1.5-flash-8b',
    label: '🔹 Gemini 1.5 Flash-8B'
  },
  'gemini-1.5-pro': {
    id: 'gemini-1.5-pro',
    label: '🔹 Gemini 1.5 Pro'
  },
};

const DEFAULT_MODEL_KEY = 'gemini-2.0-flash-lite'; // デフォルト設定のモデル

function getSelectedModel() {
  const key = localStorage.getItem('geminiModel');
  return key in GEMINI_MODELS ? key : DEFAULT_MODEL_KEY;
}

function getGeminiEndpoint() {
  const key = getSelectedModel();
  return `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODELS[key].id}:generateContent`;
}

let currentTranslation = '';
let currentLangs = {};
let currentExplanationRaw = '';

function getLocalSetting(key, fallback = '') {
  return localStorage.getItem(key) || fallback;
}

function updateLangSetting() {
  localStorage.setItem('motherLang', navMotherLang.value);
  localStorage.setItem('learnLang', navLearnLang.value);
}

navMotherLang.addEventListener('change', updateLangSetting);
navLearnLang.addEventListener('change', updateLangSetting);

apiKeySaveBtn.addEventListener('click', () => {
  const key = apiKeyInput.value.trim();
  localStorage.setItem('geminiApiKey', key);

  // エラー消す
  const errorBox = document.getElementById('apiKeyError');
  errorBox.textContent = '';
  errorBox.style.display = 'none';

  bootstrap.Modal.getInstance(document.getElementById('apiKeyModal')).hide();
});

// モーダル要素取得
const modalMotherLang = document.getElementById('modalMotherLang');
const modalLearnLang  = document.getElementById('modalLearnLang');
const saveLangBtn     = document.getElementById('saveLangBtn');

// 初期表示：ローカルストレージから取得してモーダルのセレクトを反映
modalMotherLang.value = getLocalSetting('motherLang', 'ja');
modalLearnLang.value  = getLocalSetting('learnLang', 'en');

// 保存ボタン押下時の処理（モーダル内）
saveLangBtn.addEventListener('click', () => {
  const mother = modalMotherLang.value;
  const learn = modalLearnLang.value;
  localStorage.setItem('motherLang', mother);
  localStorage.setItem('learnLang', learn);

  // ナビゲーションのセレクトにも反映（デスクトップ表示用）
  navMotherLang.value = mother;
  navLearnLang.value  = learn;

  // モーダルを閉じる
  bootstrap.Modal.getInstance(document.getElementById('mobileLangModal')).hide();
});

const scriptRegexMap = {
  ja: /[\u3040-\u30ff\u31f0-\u31ff\u4e00-\u9faf]/,
  ko: /[\uac00-\ud7af]/,
  en: /[A-Za-z]/,
  zh: /[\u4e00-\u9fff]/,
  fr: /[A-Za-zàâçéèêëîïôûùüÿñæœ]/i,
  de: /[A-Za-zäöüß]/i
};

function languageLabel(code) {
  const labels = {
    ja: '日本語', ko: '한국어', en: '英語', zh: '中国語', fr: 'フランス語', de: 'ドイツ語'
  };
  return labels[code] || code;
}

function detectLangs(text) {
  const mother = getLocalSetting('motherLang', 'ja');
  const learn = getLocalSetting('learnLang', 'en');
  let src = mother;
  if (scriptRegexMap[learn]?.test(text)) src = learn;
  const tgt = src === mother ? learn : mother;
  return { src, tgt };
}

function generatePrompt(text, src, mother, learn, context, enableExplanation) {
  const fromLabel   = languageLabel(src);
  const toLabel     = languageLabel(src === mother ? learn : mother);
  const motherLabel = languageLabel(mother);
  const learnLabel  = languageLabel(learn);
  const directionDesc = `${toLabel}に翻訳・意訳した内容`;

  let prompt = `あなたは、${motherLabel}を母語とするuserが、${learnLabel}を学ぶ為に設計された高性能翻訳アシスタントです。
翻訳元とは、userが入力した${fromLabel}の内容。
翻訳先とは、${directionDesc}。`;

  if (enableExplanation) {
    prompt += `
解説セクションとは、翻訳先の内容を${motherLabel}で教えるセクション。`;
  }

  prompt += `

以下を実行してください：

1. シチュエーションに沿った自然な${toLabel}に翻訳・意訳してください。`;

  if (enableExplanation) {
    prompt += `
2. 解説セクションには、まず読み方や発音方法、詳細なニュアンスの説明、例文、類義語、対義語、${learnLabel}を母語とする人たちとの文化的背景の差異などを含めて**${motherLabel}で**教えてください。`;
  }

  // 出力制限セクション
  prompt += `

※出力制限
- 返事はせずに以下のフォーマットに沿って出力
- **${context ? '翻訳元や補足文脈の内容を繰り返し出力しない' : '翻訳元の内容を繰り返し出力しない'}**`;

  // 補足文脈がある場合にのみ追加
  if (context) {
    prompt += `
【補足文脈】
${context}`;
  }

  // 翻訳先と解説セクション
  if (enableExplanation) {
    prompt += `

翻訳先:
${text}

解説セクション:`;
  } else {
    prompt += `

翻訳先:
${text}`;
  }

  return prompt;
}

translateBtn.addEventListener('click', async () => {
  const apiKey = getLocalSetting('geminiApiKey');
  const mother = getLocalSetting('motherLang', 'ja');
  const learn = getLocalSetting('learnLang', 'en');
  const text = inputText.value.trim();
  const context = !contextContainer.classList.contains('d-none') ? contextText.value.trim() : '';

  // APIキーが無効 or 空ならモーダル表示＋エラーメッセージ
  if (!apiKey || apiKey.length < 10) {
    const errorBox = document.getElementById('apiKeyError');
    errorBox.textContent = '⚠️ APIキーが未設定または不正です。設定してください。';
    errorBox.style.display = 'block';

    const modalEl = document.getElementById('apiKeyModal');
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
    return;
  }

  if (!text) return;

  currentLangs = detectLangs(text);
  const { src, tgt } = currentLangs;
  srcInfo.textContent = `翻訳元（${languageLabel(src)}）`;
  tgtInfo.textContent = `翻訳先（${languageLabel(tgt)}）`;

  translationSection.innerHTML = `<div class="text-center py-5"><div class="spinner-border"></div></div>`;
  explanationSection.innerHTML = `<div class="text-muted text-center py-5">解説がここに表示されます</div>`;

  try {
    // ① トグル状態取得
    const enableExplanation = explainModeToggle.checked;
    // ② UI 側で解説セクションの表示/非表示を制御
    explanationSection.style.display = enableExplanation ? 'block' : 'none';
    // ③ generatePrompt にフラグを渡す
    const prompt = generatePrompt(
      text, src, mother, learn, context, enableExplanation
    );
    const res = await fetch(`${getGeminiEndpoint()}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 4096 }
      })
    });
    const json = await res.json();
    const out = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const [partTrans, partExpl] = out.split(/解説セクション:/);
    const translationRaw = partTrans.replace(/^[\s\n]*翻訳先:\s*/i, '').trim();
    const explanationRaw = (partExpl || '').trim();
    currentExplanationRaw = explanationRaw;

    // 翻訳出力＋ボタン表示エリア全体を構築
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    // wrapper.style.paddingBottom = '3rem'; // ボタン分の余白

    // 翻訳結果のマークダウン部分
    const resultDiv = document.createElement('div');
    resultDiv.className = 'markdown-body';
    resultDiv.innerHTML = marked.parse(translationRaw);

    // コピー用ボタン
    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn btn-outline-primary btn-sm';
    copyBtn.style.position = 'absolute';
    copyBtn.style.bottom = '0';
    copyBtn.style.right = '0';
    copyBtn.style.zIndex = '10';
    copyBtn.innerHTML = `<i class="bi bi-clipboard"></i> <span>Copy</span>`;

    // コピーイベント設定
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(translationRaw).then(() => {
        const icon = copyBtn.querySelector('i');
        const label = copyBtn.querySelector('span');
        icon.className = 'bi bi-check2-circle';
        label.textContent = 'Copied!';

        setTimeout(() => {
          icon.className = 'bi bi-clipboard';
          label.textContent = 'Copy';
        }, 1500);
      });
    });

    // カスタムクラスを使って余白と配置を分離
    wrapper.classList.add('translation-wrapper');
    copyBtn.classList.add('copy-btn');

    wrapper.appendChild(resultDiv);
    wrapper.appendChild(copyBtn);

    translationSection.innerHTML = ''; // 既存を消す
    translationSection.appendChild(wrapper);

    explanationSection.innerHTML = `<div class="markdown-body">${marked.parse(explanationRaw)}</div>`;
    copyTranslationBtn.style.display = 'inline-block';
    copyTranslationBtn.onclick = () => {
      navigator.clipboard.writeText(translationRaw);
    };
    currentTranslation = translationRaw;
    saveBtn.disabled = false;
  } catch (e) {
    translationSection.innerHTML = `<div class="text-danger">⚠️ 翻訳失敗: ${e.message}</div>`;
    explanationSection.innerHTML = '';
  }
});

saveBtn.addEventListener('click', async () => {
  if (!currentTranslation || currentTranslation.trim() === '') {
    const toastEl = document.getElementById('bookmarkToast');
    const toastBody = toastEl.querySelector('.toast-body');
    const toast = bootstrap.Toast.getOrCreateInstance(toastEl);

    // 警告メッセージに変更して表示
    toastBody.textContent = '⚠️ 翻訳がまだ実行されていません。先に「翻訳する」ボタンを押してください。';
    toastEl.classList.remove('bg-success');
    toastEl.classList.add('bg-warning');
    toast.show();

    // 一定時間後に内容と背景色を戻す ＋ トーストを明示的に非表示にする
    setTimeout(() => {
      toast.hide(); // 🔁 明示的に非表示
      toastBody.textContent = '📚 ブックマークに追加しました！';
      toastEl.classList.remove('bg-warning');
      toastEl.classList.add('bg-success');
    }, 3000);

    return;
  }

  saveBtn.disabled = true;
  const origHTML = saveBtn.innerHTML;
  saveBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> 保存中…`;

  try {
    await saveTranslation({
      timestamp: Date.now(),
      original: inputText.value.trim(),
      translated: currentTranslation,
      explanation: currentExplanationRaw,
      context: contextText.value.trim(),
      src: currentLangs.src,
      tgt: currentLangs.tgt
    });
    loadBookmarks();
    saveBtn.innerHTML = `<i class="bi bi-check2-circle me-1"></i> 保存しました！`;

    const toastEl = document.getElementById('bookmarkToast');
    const toast = bootstrap.Toast.getOrCreateInstance(toastEl);
    toast.show();
  } catch (e) {
    alert('保存に失敗しました');
    saveBtn.innerHTML = origHTML;
  } finally {
    setTimeout(() => {
      saveBtn.disabled = false;
      saveBtn.innerHTML = origHTML;
    }, 1500);
  }
});

exportJsonBtn.addEventListener('click', async () => {
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);

  const all = await new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  if (!Array.isArray(all) || all.length === 0) {
    alert('エクスポートするデータがありません');
    return;
  }

  const json = JSON.stringify(all, null, 2); // ← インデント付きで読みやすく
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'translations_backup.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
});

importJsonBtn.addEventListener('click', () => {
  const file = importJsonFile.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const data = JSON.parse(reader.result);
      const tx = db.transaction(STORE_NAME, 'readwrite');
      data.forEach(({ id, ...item }) => {
        tx.objectStore(STORE_NAME).add(item);
      });
      await tx.complete;
      loadBookmarks();
      alert('インポート完了');
    } catch (err) {
      alert('インポートに失敗しました: ' + err.message);
    }
  };
  reader.readAsText(file);
});

(async () => {
  await openDb();
  apiKeyInput.value = getLocalSetting('geminiApiKey');
  navMotherLang.value = getLocalSetting('motherLang', 'ja');
  navLearnLang.value = getLocalSetting('learnLang', 'en');
  loadBookmarks();

  if (!getLocalSetting('geminiApiKey')) {
    const modal = new bootstrap.Modal(document.getElementById('apiKeyModal'));
    modal.show();
  }

  const modelSelect = document.getElementById('modelSelect');
  const saveModelBtn = document.getElementById('saveModelBtn');

  if (modelSelect && saveModelBtn) {
    // モデルリストを動的生成
    modelSelect.innerHTML = '';
    Object.entries(GEMINI_MODELS).forEach(([key, model]) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = model.label;
      modelSelect.appendChild(option);
    });

    modelSelect.value = getSelectedModel();

    saveModelBtn.addEventListener('click', () => {
      localStorage.setItem('geminiModel', modelSelect.value);
      bootstrap.Modal.getInstance(document.getElementById('modelSettingModal')).hide();
    });
  }
})();
