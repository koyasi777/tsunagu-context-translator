// === Imports ===
import { languageCodes } from './languages.js';
import { i18nText } from './i18n.js';

// === i18n関数 ===
function t(key) {
  const lang = getLocalSetting('motherLang') || 'en';
  return i18nText[key]?.[lang] || i18nText[key]?.['en'] || key;
}

// === IndexedDB 初期化 ===
const DB_NAME = 'translator-db';
const STORE_NAME = 'translations';
let db;

function updateLanguageLabels() {
  // 母語・学習言語
  const motherLangLabel1 = document.querySelector('label[for="navMotherLang"]');
  const learnLangLabel1 = document.querySelector('label[for="navLearnLang"]');
  const motherLangLabel2 = document.querySelector('label[for="modalMotherLang"]');
  const learnLangLabel2 = document.querySelector('label[for="modalLearnLang"]');

  if (motherLangLabel1) motherLangLabel1.textContent = t('motherLang');
  if (learnLangLabel1)  learnLangLabel1.textContent  = t('learnLang');
  if (motherLangLabel2) motherLangLabel2.textContent = t('motherLang');
  if (learnLangLabel2)  learnLangLabel2.textContent  = t('learnLang');

  // 翻訳元・翻訳先
  const srcLabel = document.getElementById('srcInfo');
  const tgtLabel = document.getElementById('tgtInfo');
  if (srcLabel) srcLabel.textContent = t('srcLabel');
  if (tgtLabel) tgtLabel.textContent = t('tgtLabel');

  // 解説モードトグル
  const explainToggleLabel = document.querySelector('label[for="explainModeToggle"]');
  if (explainToggleLabel) explainToggleLabel.textContent = t('explainMode');

  // ボタン類
  const translateBtn = document.getElementById('translateBtn');
  const toggleContextBtn = document.getElementById('toggleContextBtn');
  const saveBtn = document.getElementById('saveBtn');

  if (translateBtn) translateBtn.textContent = t('translateButton');

  // 文脈トグル：状態によってボタンテキストが変化するため、再設定用関数を分けてもよい
  if (toggleContextBtn) {
    const isVisible = !document.getElementById('contextContainer').classList.contains('d-none');
    toggleContextBtn.innerHTML = isVisible
      ? `<i class="bi bi-dash-lg me-1"></i>${t('removeContext')}`
      : `<i class="bi bi-plus-lg me-1"></i>${t('addContext')}`;
  }

  if (saveBtn) saveBtn.innerHTML = t('bookmark');

  // プレースホルダー＆初期表示テキスト
  const inputText = document.getElementById('inputText');
  if (inputText) inputText.placeholder = t('inputPlaceholder');

  const translationPlaceholderEl = document.getElementById('translationPlaceholder');
  if (translationPlaceholderEl) {
    translationPlaceholderEl.textContent = t('translationPlaceholder');
  }

  const explanationPlaceholderEl = document.getElementById('explanationPlaceholder');
  if (explanationPlaceholderEl) {
    explanationPlaceholderEl.textContent = t('explanationPlaceholder');
  }

  const contextText = document.getElementById('contextText');
  if (contextText) contextText.placeholder = t('contextPlaceholder');

  document.querySelector('#apiKeyModal .modal-title').textContent = t('modalApiKeyTitle');
  document.querySelector('#mobileLangModal .modal-title').textContent = t('modalLangTitle');
  document.querySelector('#modelSettingModal .modal-title').textContent = t('modalModelTitle');

  const bookmarkTitle = document.getElementById('bookmarkTitle');
  if (bookmarkTitle) bookmarkTitle.textContent = t('bookmarkTitle');

  const bookmarkDetailTitle = document.querySelector('#bookmarkDetailModal .modal-title');
  if (bookmarkDetailTitle) bookmarkDetailTitle.textContent = t('bookmarkDetailTitle');

  const labelOriginal = document.getElementById('labelOriginal');
  if (labelOriginal) labelOriginal.textContent = t('originalLabel');

  const labelTranslated = document.getElementById('labelTranslated');
  if (labelTranslated) labelTranslated.textContent = t('translatedLabel');

  const labelPronunciation = document.getElementById('labelPronunciation');
  if (labelPronunciation) labelPronunciation.textContent = t('labelPronunciation');

  const labelContext = document.getElementById('labelContext');
  if (labelContext) labelContext.textContent = t('contextLabel');

  const labelExplanation = document.getElementById('labelExplanation');
  if (labelExplanation) labelExplanation.textContent = t('explanationLabel');

  // PCメニュー
  const menuApiKey = document.querySelector('a[data-bs-target="#apiKeyModal"]');
  const menuModel  = document.querySelector('a[data-bs-target="#modelSettingModal"]');
  const menuBookmark = document.querySelector('a[data-bs-target="#bookmarkSidebar"]');

  if (menuApiKey)    menuApiKey.textContent = t('menuApiKey');
  if (menuModel)     menuModel.textContent  = t('menuModelSetting');
  if (menuBookmark)  menuBookmark.textContent = t('menuBookmark');

  // モバイルメニュー（ボタン形式）
  const mobileLangBtn = document.querySelector('#mobileMenu button[data-bs-target="#mobileLangModal"]');
  const mobileApiKeyBtn = document.querySelector('#mobileMenu button[data-bs-target="#apiKeyModal"]');
  const mobileModelBtn = document.querySelector('#mobileMenu button[data-bs-target="#modelSettingModal"]');
  const mobileBookmarkBtn = document.querySelector('#mobileMenu button[data-bs-target="#bookmarkSidebar"]');

  if (mobileLangBtn)      mobileLangBtn.textContent = t('menuLangSetting');
  if (mobileApiKeyBtn)    mobileApiKeyBtn.textContent = t('menuApiKey');
  if (mobileModelBtn)     mobileModelBtn.textContent = t('menuModelSetting');
  if (mobileBookmarkBtn)  mobileBookmarkBtn.textContent = t('menuBookmark');

  const btnApiKeySave = document.getElementById('apiKeySaveBtn');
  const btnLangSave   = document.getElementById('saveLangBtn');
  const btnModelSave  = document.getElementById('saveModelBtn');

  if (btnApiKeySave) btnApiKeySave.textContent = t('btnSave');
  if (btnLangSave)   btnLangSave.textContent   = t('btnSave');
  if (btnModelSave)  btnModelSave.textContent  = t('btnSave');

  const modelLabel = document.querySelector('label[for="modelSelect"]');
  if (modelLabel) modelLabel.textContent = t('modelSelectLabel');

  const apiInfoLine1 = document.getElementById('apiInfoLine1');
  if (apiInfoLine1) apiInfoLine1.innerHTML = t('apiInfoLine1');

  const apiInfoLine2 = document.getElementById('apiInfoLine2');
  if (apiInfoLine2) apiInfoLine2.innerHTML = t('apiInfoLine2');

  // 読み上げ・設定ボタン
  const ttsBtnEl = document.getElementById('ttsBtn');
  if (ttsBtnEl) ttsBtnEl.textContent = t('ttsButton');

  const ttsSettingBtnEl = document.getElementById('ttsSettingBtn');
  if (ttsSettingBtnEl) ttsSettingBtnEl.textContent = t('ttsSetting');

  // モーダルのタイトルとラベル
  const ttsModalTitle = document.querySelector('#ttsSettingModal .modal-title');
  if (ttsModalTitle) ttsModalTitle.textContent = t('voiceSettingTitle');

  const ttsEngineLabel = document.querySelector('label[for="ttsEngineSelect"]');
  if (ttsEngineLabel) ttsEngineLabel.textContent = t('ttsEngine');

  const ttsVoiceLabel = document.querySelector('label[for="voiceSelect"]');
  if (ttsVoiceLabel) ttsVoiceLabel.textContent = t('geminiVoice');

}

/**
 * 動的に言語選択肢を生成する
 * @param {HTMLSelectElement} selectEl
 * @param {string} currentValue
 */
function populateLanguageSelect(selectEl, currentValue) {
  const userLocale = getLocalSetting('motherLang');
  const dn = new Intl.DisplayNames([userLocale], { type: 'language' });
  selectEl.innerHTML = '';

  // 頻出言語コード（世界の主要言語）
  const frequentLanguages = [
    'en', 'zh', 'es', 'hi', 'ar', 'bn',
    'pt', 'ru', 'ja', 'de', 'fr', 'ko'
  ];

  const frequent = frequentLanguages.map(code => ({
    code,
    label: dn.of(code) || code
  }));

  const others = languageCodes
    .filter(code => !frequentLanguages.includes(code))
    .map(code => ({
      code,
      label: dn.of(code) || code
    }));

  // 頻出言語グループ
  const groupFrequent = document.createElement('optgroup');
  groupFrequent.label = t('popularLanguages');
  frequent.forEach(({ code, label }) => {
    const opt = document.createElement('option');
    opt.value = code;
    opt.textContent = label;
    if (code === currentValue) opt.selected = true;
    groupFrequent.appendChild(opt);
  });
  selectEl.appendChild(groupFrequent);

  // その他言語グループ
  const groupOthers = document.createElement('optgroup');
  groupOthers.label = t('otherLanguages');
  others.forEach(({ code, label }) => {
    const opt = document.createElement('option');
    opt.value = code;
    opt.textContent = label;
    if (code === currentValue) opt.selected = true;
    groupOthers.appendChild(opt);
  });
  selectEl.appendChild(groupOthers);
}

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
  try {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).add(entry);
    await tx.complete;
  } catch (err) {
    console.error("💥 IndexedDB 保存失敗:", err, entry);
    throw err; // 呼び出し元の「保存失敗」メッセージに繋がる
  }
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
            <div><strong>${t('listOriginal')}</strong> ${d.original}</div>
            <div><strong>${t('listTranslated')}</strong> ${d.translated}</div>
            <div><strong>${t('labelPronunciation')}</strong> ${d.pronunciation || t('pronunciationNotProvided')}</div>
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
      const pronunciationDiv = document.getElementById('modalPronunciationText');
      if (pronunciationDiv) {
        pronunciationDiv.textContent = d.pronunciation || t('pronunciationNotProvided');
      }
      document.getElementById('modalContextText').textContent =
        d.context ? d.context : t('contextNotProvided');
      document.getElementById('modalExplanationText').innerHTML =
        d.explanation ? marked.parse(d.explanation) : t('explanationNotProvided');
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

const ttsBtn = document.getElementById('ttsBtn');
let lastTranslatedText = ''; // 最後の翻訳テキスト


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
    ? `<i class="bi bi-dash-lg me-1"></i>${t('removeContext')}`
    : `<i class="bi bi-plus-lg me-1"></i>${t('addContext')}`;

  localStorage.setItem('contextEnabled', String(willBeVisible));
});

// ── ③ テキスト入力時に内容を保存 ──
contextText.addEventListener('input', () => {
  localStorage.setItem('contextText', contextText.value);
});

// ==== Gemini モデル選択・URL構成 ====
const GEMINI_MODELS = {
  'gemini-2.0-flash': {
    id: 'gemini-2.0-flash',
    label: '🔹 Gemini 2.0 Flash（Default）'
  },
  'gemini-2.0-flash-lite': {
    id: 'gemini-2.0-flash-lite',
    label: '🔹 Gemini 2.0 Flash-Lite'
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

const DEFAULT_MODEL_KEY = 'gemini-2.0-flash'; // デフォルト設定のモデル

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
let currentPronunciationRaw = '';
let currentExplanationRaw = '';

function getLocalSetting(key, fallback = '') {
  const stored = localStorage.getItem(key);
  if (stored !== null) return stored;

  // 初期値が 'motherLang' または 'learnLang' の場合
  if (key === 'motherLang') {
    const browserLang = navigator.language.slice(0, 2);
    return languageCodes.includes(browserLang) ? browserLang : 'en';
  }
  if (key === 'learnLang') {
    const mother = getLocalSetting('motherLang');
    // 違う言語をデフォルト学習言語に（英語ユーザーには日本語など）
    return mother === 'en' ? 'ja' : 'en';
  }

  return fallback;
}

function updateLangSetting() {
  localStorage.setItem('motherLang', navMotherLang.value);
  localStorage.setItem('learnLang', navLearnLang.value);
}

navMotherLang.addEventListener('change', () => {
  updateLangSetting();
  updateLanguageLabels();
  loadBookmarks();
});

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
modalMotherLang.value = getLocalSetting('motherLang');
modalLearnLang.value  = getLocalSetting('learnLang');

// 保存ボタン押下時の処理（モーダル内）
saveLangBtn.addEventListener('click', () => {
  const mother = modalMotherLang.value;
  const learn = modalLearnLang.value;
  localStorage.setItem('motherLang', mother);
  localStorage.setItem('learnLang', learn);

  // ナビゲーションのセレクトにも反映（デスクトップ表示用）
  navMotherLang.value = mother;
  navLearnLang.value  = learn;

  updateLanguageLabels();
  loadBookmarks();

  // モーダルを閉じる
  bootstrap.Modal.getInstance(document.getElementById('mobileLangModal')).hide();
});

// ── 1. スクリプト判定用マップを拡張 ──
// 「一意に定まる文字」を含む Unicode ブロックも追加
const scriptRegexMap = {
  // ひらがな・カタカナ・記号を含む日本語
  ja: /[\u3040-\u309F\u30A0-\u30FF\u31F0-\u31FF\u3000-\u303F]/,
  // ハングル完成字＋Jamo／互換ジャモ
  ko: /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uD7B0-\uD7FF]/
};

// 全文字が１つのスクリプトだけに属するかチェックする「全マッチ用」正規表現
const scriptFullRegexMap = Object.fromEntries(
  Object.entries(scriptRegexMap)
    .map(([lang, rx]) => [
      lang,
      new RegExp(`^${rx.source}+$`)
    ])
);

// ── 2. スクリプトだけで判定できるかを試す関数 ──
function detectByScript(text) {
  for (const [lang, fullRx] of Object.entries(scriptFullRegexMap)) {
    if (fullRx.test(text)) {
      return lang;
    }
  }
  return null;
}

// ── 3. Gemini プロンプトを「未知言語」対応版に更新 ──

// Gemini で主要言語を判定するための軽量で高速なエンドポイント
function getFastLanguageDetectionEndpoint() {
  return `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent`;
}

async function determinePrimaryLanguage(text, mother, learn) {
  const apiKey = getLocalSetting('geminiApiKey');
  const prompt = `
次の【文】の言語は「${mother}」、「${learn}」のいずれかです。該当するものを以下から**1つのみ**出力してください:
- "${mother}"
- "${learn}"

【文】
${text}

【ルール】
※ 「${mother}」「${learn}」の場合は**言語コード**のみで出力
※ 万が一いずれにも該当しない場合は"unkown"と出力
※ 補足・記号・引用なし
`;

  try {
    const res = await fetch(
      `${getFastLanguageDetectionEndpoint()}?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 5 }
        })
      }
    );
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json();
    console.log('🌐 Gemini 言語判定レスポンス:', json);
    let raw = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    // 余分な文字を取り除き、2文字アルファベット or "unknown" を抽出
    const m = raw.match(/\b([a-z]{2}|unknown)\b/);
    return m ? m[1] : 'unknown';
  } catch (e) {
    console.error('Gemini 判定失敗:', e);
    return 'unknown';
  }
}

// ── 4. モーダル表示ヘルパー ──
function showLanguageMismatchModal(mother, learn) {
  alert(`入力は指定言語（${languageLabel(mother)}, ${languageLabel(learn)}）のいずれにも一致しません。`);
}

function languageLabel(code) {
  const locale = getLocalSetting('motherLang');
  const dn = new Intl.DisplayNames([locale], { type: 'language' });
  return dn.of(code) || code;
}

// ── 5. 最終的な判定フロー ──
async function detectLangs(text) {
  const mother = getLocalSetting('motherLang');
  const learn  = getLocalSetting('learnLang');

  // ① 全文スクリプト一致なら即判定
  const scriptLang = detectByScript(text);
  let src = scriptLang;

  // ② 一致しても想定外言語なら unknown 扱い
  if (src && ![mother, learn].includes(src)) {
    showLanguageMismatchModal(mother, learn);
    return null;
  }

  // ③ スクリプトで判断できなかった場合 → Gemini 判定へ
  if (!src) {
    const out = await determinePrimaryLanguage(text, mother, learn);
    if (out === 'unknown') {
      showLanguageMismatchModal(mother, learn);
      return null;
    }
    src = out;
  }

  const tgt = src === mother ? learn : mother;
  return { src, tgt };
}

function generatePrompt(text, src, mother, learn, context, enableExplanation) {
  const fromLabel   = languageLabel(src);
  const toLabel     = languageLabel(src === mother ? learn : mother);
  const motherLabel = languageLabel(mother);
  const learnLabel  = languageLabel(learn);

  let prompt = `あなたは、${motherLabel}を母語とするuserが、${learnLabel}を学ぶ為に設計された超高性能な翻訳機です。

■ 前提情報
「Source」とは、userが入力した${fromLabel}の内容。
「Translation」とは、「Source」の内容を忠実に**${toLabel}に**翻訳・意訳した自然な内容。⚠️誤って${fromLabel}に翻訳しない。発音はここに含めない。`;
  if (context) {
    prompt += `
    ※「Context」は参考情報として活用し、翻訳内容そのものには含めないでください。`;
  }
  prompt += `
「Pronunciation」とは、その${learnLabel}の発音方法のみを${motherLabel}を母語とする人が読めるように出力したもの。`;

  if (enableExplanation) {
    if (context) {
      prompt += `
「Explanation」とは、${learnLabel}を学ぶ、${motherLabel}を母語とする人たちに向けた、**${motherLabel}で**書かれた解説。その**${learnLabel}の内容について**、読み方や発音方法、今回の文脈をリアルに考慮した詳細なニュアンスの説明、例文、類義語、対義語、${learnLabel}を母語とする人たちとの文化的背景の差異などを含める。`;
    } else {
      prompt += `
「Explanation」とは、${learnLabel}を学ぶ、${motherLabel}を母語とする人たちに向けた、**${motherLabel}で**書かれた解説。その**${learnLabel}の内容について**、読み方や発音方法、詳細なニュアンスの説明、例文、類義語、対義語、${learnLabel}を母語とする人たちとの文化的背景の差異などを含める。`;
    }
  }

  prompt += `
■ userからのinput`

  // 補足文脈がある場合にのみ追加
  if (context) {
    prompt += `
Context:
${context}`;
  }

  prompt += `
Source:
${text}`

  prompt += `

■ 以下を実行：

※出力制限
- 返事はせずに以下の出力形式に厳密に従って出力
- **${context ? '「Source」や「Context」の内容を繰り返し出力しない' : '「Source」の内容を繰り返し出力しない'}**

■ 出力形式`;

  // 翻訳先と解説セクション
  if (enableExplanation) {
    prompt += `

Translation:

Pronunciation:

Explanation:`;
  } else {
    prompt += `

Translation:

Pronunciation:`;
  }

  return prompt;
}

function resetTranslationUI() {
  translationSection.innerHTML = `
    <div id="translationPlaceholder" class="text-muted text-center py-5">
      ${t('translationPlaceholder')}
    </div>
    <button id="copyTranslationBtn" class="btn btn-outline-primary btn-sm mt-2" style="display:none;">
      Copy
    </button>
  `;
  explanationSection.innerHTML = `
    <div id="explanationPlaceholder" class="text-muted text-center py-5">
      ${t('explanationPlaceholder')}
    </div>
  `;
}

translateBtn.addEventListener('click', async () => {
  // 翻訳開始前に音声読み上げの部分を非表示にする
  document.getElementById('ttsControls').style.display = 'none';

  const apiKey = getLocalSetting('geminiApiKey');
  const mother = getLocalSetting('motherLang');
  const learn = getLocalSetting('learnLang');
  const text = inputText.value.trim();
  const context = !contextContainer.classList.contains('d-none') ? contextText.value.trim() : '';

  // APIキーが無効 or 空ならモーダル表示＋エラーメッセージ
  if (!apiKey || apiKey.length < 10) {
    const errorBox = document.getElementById('apiKeyError');
    errorBox.textContent = t('errorApiKeyMissing');
    errorBox.style.display = 'block';

    const modalEl = document.getElementById('apiKeyModal');
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
    return;
  }

  if (!text) return;

  // 翻訳を開始する直前にスピナーを表示
  translationSection.innerHTML = `<div class="text-center py-5"><div class="spinner-border"></div></div>`;
  explanationSection.innerHTML = `<div class="text-muted text-center py-5">解説がここに表示されます</div>`;

  // ── ここから言語判定フロー ──
  const langResult = await detectLangs(text);
  if (!langResult) {
    resetTranslationUI();  // ← 初期状態に戻す
    return;
  }

  const { src, tgt } = langResult;

  currentLangs = { src, tgt };
  srcInfo.textContent = `${t('srcLabel')}（${languageLabel(src)}）`;
  tgtInfo.textContent = `${t('tgtLabel')}（${languageLabel(tgt)}）`;

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
    if (!res.ok) {
      const json = await res.json().catch(() => null);
      const message = json?.error?.message || `HTTP ${res.status}`;

      if (res.status === 429) {
        throw new Error(t('errorTooManyRequests') || 'リクエストが多すぎます。時間をおいて再試行してください。');
      }

      if (res.status === 503 && message.includes('overloaded')) {
        throw new Error(t('errorModelOverloaded') || 'モデルが過負荷です。時間をおいて再試行してください。');
      }

      throw new Error(message);
    }
    const json = await res.json();
    console.log('🌐 翻訳APIレスポンス:', json);
    const out = json.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // 柔軟な分割方式で各ブロックを取得
    let translationRaw = '';
    let pronunciationRaw = '';
    let explanationRaw = '';

    // 分け方の基本アイデア：まず Pronunciation: で分割
    const parts = out.split(/Pronunciation:\s*/);

    if (parts.length >= 2) {
      // 1個目 → 翻訳文（Translation）
      translationRaw = parts[0].trim();
      // translationRaw の先頭に 'Translation:' があれば除去する
      if (translationRaw.startsWith('Translation:')) {
        translationRaw = translationRaw.replace(/^Translation:\s*/i, '');
      }

      // 2個目をさらに Explanation: で分割
      const subparts = parts[1].split(/Explanation:\s*/);
      pronunciationRaw = subparts[0].trim();

      // 説明がある場合だけ
      if (subparts.length >= 2) {
        explanationRaw = subparts[1].trim();
      }
    } else {
      // 万が一「Pronunciation:」がなかったら全文を翻訳として扱う
      translationRaw = out.trim();
    }

    lastTranslatedText = translationRaw;

    const ttsControls = document.getElementById('ttsControls');
    ttsControls.classList.remove('d-none');
    ttsControls.classList.add('d-flex'); // レイアウト調整のため必要なら

    currentExplanationRaw = explanationRaw;

    // 翻訳出力＋ボタン表示エリア全体を構築
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    // wrapper.style.paddingBottom = '3rem'; // ボタン分の余白

    // 翻訳結果のマークダウン部分
    const resultDiv = document.createElement('div');
    resultDiv.className = 'markdown-body';
    resultDiv.innerHTML = `
      ${marked.parse(translationRaw)}
      <div class="mt-2 text-muted" style="font-size: 0.8em; font-style: italic;">
        ${pronunciationRaw}
      </div>
    `;

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
    lastTranslatedText = translationRaw;
    currentPronunciationRaw = pronunciationRaw;

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
    toastBody.textContent = t('toastTranslationNotDone');
    toastEl.classList.remove('bg-success');
    toastEl.classList.add('bg-warning');
    toast.show();

    // 一定時間後に内容と背景色を戻す ＋ トーストを明示的に非表示にする
    setTimeout(() => {
      toast.hide(); // 🔁 明示的に非表示
      toastBody.textContent = t('toastBookmarkAdded');
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
      pronunciation: currentPronunciationRaw,
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


/**
 * Gemini TTS で音声を再生
 */
let selectedVoice = "Kore"; // デフォルト

const VOICE_LIST = [
  { name: "Zephyr", style: "Bright", gender: "female" },
  { name: "Puck", style: "Upbeat", gender: "male" },
  { name: "Charon", style: "Informative", gender: "male" },
  { name: "Kore", style: "Firm", gender: "female" },
  { name: "Fenrir", style: "Excitable", gender: "male" },
  { name: "Leda", style: "Youthful", gender: "female" },
  { name: "Orus", style: "Firm", gender: "male" },
  { name: "Aoede", style: "Breezy", gender: "female" },
  { name: "Callirrhoe", style: "Easy-going", gender: "female" },
  { name: "Autonoe", style: "Bright", gender: "female" },
  { name: "Enceladus", style: "Breathy", gender: "male" },
  { name: "Iapetus", style: "Clear", gender: "male" },
  { name: "Umbriel", style: "Easy-going", gender: "male" },
  { name: "Algieba", style: "Smooth", gender: "male" },
  { name: "Despina", style: "Smooth", gender: "female" },
  { name: "Erinome", style: "Clear", gender: "female" },
  { name: "Algenib", style: "Gravelly", gender: "male" },
  { name: "Rasalgethi", style: "Informative", gender: "male" },
  { name: "Laomedeia", style: "Upbeat", gender: "female" },
  { name: "Achernar", style: "Soft", gender: "female" },
  { name: "Alnilam", style: "Firm", gender: "male" },
  { name: "Schedar", style: "Even", gender: "male" },
  { name: "Gacrux", style: "Mature", gender: "female" },
  { name: "Pulcherrima", style: "Forward", gender: "female" },
  { name: "Achird", style: "Friendly", gender: "male" },
  { name: "Zubenelgenubi", style: "Casual", gender: "male" },
  { name: "Vindemiatrix", style: "Gentle", gender: "female" },
  { name: "Sadachbia", style: "Lively", gender: "male" },
  { name: "Sadaltager", style: "Knowledgeable", gender: "male" },
  { name: "Sulafat", style: "Warm", gender: "female" }
];

// プルダウン初期化
const voiceSelect = document.getElementById("voiceSelect");
voiceSelect.innerHTML = '';

// 分類グループを作成
const maleGroup = document.createElement('optgroup');
maleGroup.label = '👨 Male Voices';

const femaleGroup = document.createElement('optgroup');
femaleGroup.label = '👩 Female Voices';

function tVoiceStyle(style) {
  const lang = getLocalSetting('motherLang') || 'en';
  return i18nText.voiceStyles?.[style]?.[lang] || style;
}

VOICE_LIST.forEach(v => {
  const opt = document.createElement("option");
  opt.value = v.name;
  opt.textContent = `${v.name} – ${tVoiceStyle(v.style)}`;
  if (v.name === selectedVoice) opt.selected = true;

  if (v.gender === 'male') {
    maleGroup.appendChild(opt);
  } else if (v.gender === 'female') {
    femaleGroup.appendChild(opt);
  }
});

voiceSelect.appendChild(maleGroup);
voiceSelect.appendChild(femaleGroup);

// Gemini API呼び出しでselectedVoiceを反映
async function playTTS(text) {
  const apiKey = getLocalSetting('geminiApiKey');
  const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent';

  const body = {
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: selectedVoice
          }
        }
      }
    }
  };

  try {
    const res = await fetch(`${endpoint}?key=${apiKey}`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const text = await res.text();
      if (res.status === 429) {
        throw new Error('RateLimitExceeded');
      } else if (res.status === 503) {
        throw new Error('ModelOverloaded');
      } else {
        throw new Error(text || `HTTP ${res.status}`);
      }
    }
    const json = await res.json();
    const base64Audio = json?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("音声データが取得できませんでした");

    const pcmData = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0));
    const wavData = encodeWAV(pcmData, {
      sampleRate: 24000,
      channels: 1,
      bitsPerSample: 16,
    });

    const blob = new Blob([wavData], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.play();
  } catch (e) {
    if (e.message === 'ModelOverloaded') {
      alert(t('errorModelOverloaded'));
    } else if (e.message === 'RateLimitExceeded') {
      alert(t('errorTooManyRequests'));
    } else {
      alert('読み上げに失敗しました: ' + e.message);
    }
  }
}

function encodeWAV(samples, options) {
  const { sampleRate, channels, bitsPerSample } = options;
  const blockAlign = channels * bitsPerSample / 8;
  const byteRate = sampleRate * blockAlign;
  const buffer = new ArrayBuffer(44 + samples.length);
  const view = new DataView(buffer);

  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, 'data');
  view.setUint32(40, samples.length, true);

  for (let i = 0; i < samples.length; i++) {
    view.setUint8(44 + i, samples[i]);
  }

  return view;
}

// API選択プルダウン取得
const ttsEngineSelect = document.getElementById('ttsEngineSelect');
const voiceSelectWrapper = document.getElementById('voiceSelectWrapper');

// Web Speech API 用関数
function playWebSpeech(text) {
  const utter = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(utter);
}

function updateVoiceSettingUI() {
  const engine = ttsEngineSelect.value;
  const isGemini = engine === 'gemini';
  voiceSelectWrapper.style.display = isGemini ? 'block' : 'none';
}

document.getElementById('ttsSettingBtn').addEventListener('click', () => {
  const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('ttsSettingModal'));
  modal.show();
});

voiceSelect.addEventListener("change", e => {
  selectedVoice = e.target.value;
  localStorage.setItem('ttsVoice', selectedVoice);
});

function updateVoiceSelectVisibility() {
  if (ttsEngineSelect.value === 'gemini') {
    voiceSelectWrapper.style.display = '';
  } else {
    voiceSelectWrapper.style.display = 'none';
  }
}

// 初期表示
updateVoiceSelectVisibility();
// 値が変わったら再度制御
ttsEngineSelect.addEventListener('change', () => {
  updateVoiceSettingUI();
  localStorage.setItem('ttsEngine', ttsEngineSelect.value);
});

// 読み上げボタンイベント登録
ttsBtn.addEventListener('click', async () => {
  if (!lastTranslatedText) return;

  // コンテキスト込みテキスト生成
  const context = contextText?.value.trim();
  const plain = lastTranslatedText;
  const text = context
    ? `
あなたはリアル派志向のプロの俳優です。

まずContextとSentenceから今の状況や空間をリアルに想像してください。
具体的には、
- その場の状況
- 声の雰囲気
- テンション
などです。

次に、その空間や感情、人との関係性を、あなたの声だけで表現してください。
笑い声、ため息、息遣い、間などの非言語音声も自由に盛り込んで、とにかくContextに合う空間を作り出してください。

Context: ${context}
Sentence: ${plain}
    `.trim()
    : `
あなたはリアル派志向のプロの俳優です。

以下のセリフを、自然で感情を込めたトーンで、聞き手にリアルに響くように演じてください。
その場の空気や人物像を想像しながら、声のトーンやテンポ、雰囲気を自由に調整して構いません。
笑い声、ため息、息遣い、間などの非言語音声も含めて、あなたらしい演技で表現してください。

Sentence: ${plain}
    `.trim();

  // === UX向上：ローディング表示 ===
  const originalHTML = ttsBtn.innerHTML;
  ttsBtn.disabled = true;
  ttsBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> ${t('loadingTTS')}`;

  // 選択されたエンジンで分岐
  const engine = ttsEngineSelect.value;

  try {
    if (engine === 'gemini') {
      await playTTS(text);
    } else {
      playWebSpeech(plain);
    }
  } catch (e) {
    alert('読み上げに失敗しました: ' + e.message);
  } finally {
    ttsBtn.disabled = false;
    ttsBtn.innerHTML = originalHTML;
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

  ttsEngineSelect.value = getLocalSetting('ttsEngine') || 'gemini';
  voiceSelect.value = getLocalSetting('ttsVoice') || 'Kore';
  updateVoiceSettingUI();

  // ラベル多言語対応
  updateLanguageLabels();

  // ★ 言語セレクトを動的に生成
  populateLanguageSelect(navMotherLang,   getLocalSetting('motherLang'));
  populateLanguageSelect(navLearnLang,    getLocalSetting('learnLang'));
  populateLanguageSelect(modalMotherLang, getLocalSetting('motherLang'));
  populateLanguageSelect(modalLearnLang,  getLocalSetting('learnLang'));

  apiKeyInput.value = getLocalSetting('geminiApiKey');
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
