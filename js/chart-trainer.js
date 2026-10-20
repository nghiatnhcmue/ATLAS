/**
 * GeoAtlas Interactive - Chart Trainer & Pedagogical Feedback Engine v2.5 (Phân hệ 2)
 * Tích hợp toàn diện 6 Quy tắc Nhận dạng Biểu đồ Sư phạm (Trích từ biểu đồ.docx)
 * 
 * 6 Dạng Biểu Đồ Chuẩn THPT & GDPT 2018:
 * 1. pie (Đa biểu đồ tròn N năm chia tâm thông minh, cơ cấu <= 3 năm)
 * 2. stacked_area (Miền chồng cơ cấu chuỗi thời gian >= 3-4 năm)
 * 3. line (Đường xu hướng & tốc độ tăng trưởng, mốc gốc 100%)
 * 4. bar (Cột Đơn / Ghép / Thanh ngang so sánh quy mô & biến động)
 * 5. bar_stacked (Cột chồng quy mô và cơ cấu theo tỉ lệ % tuyệt đối)
 * 6. combo_bar_line (Kết hợp Cột + Đường 2 trục tung khác đơn vị)
 * 
 * Các Tính Năng Cốt Lõi:
 * - 6 Nút chọn Biểu đồ Responsive kết nối trực tiếp Apache ECharts
 * - Tự động Highlight Từ Khóa Vàng trong yêu cầu đề bài
 * - Bảng Phân Tích Đề Bài 3 Bước (Số mốc năm -> Số loại đơn vị -> Tổng = 100% không)
 * - Cơ chế Thử & Sai: Phản biện sư phạm chuẩn xác theo vi phạm hình học/tỉ xích từ biểu đồ.docx
 * - Cẩm Nang 6 Quy Tắc Vàng, Bẫy Nhận Dạng & Ví Dụ Minh Họa
 */

const ChartTrainer = (function () {
  let questionsData = [];
  let keywordGuide = [];
  let currentIndex = 0;
  let showHighlight = true;
  let activeChartType = null;
  let echartInstance = null;
  let activeTab = "trainer"; // 'trainer' | 'guide' | 'custom'

  // Trạng thái AI Table Analyzer (Phân tích bảng tự do)
  let customQuestion = null;
  let customActiveChartType = null;
  let customAnalysisData = null;

  // Trạng thái trắc nghiệm Đúng/Sai cho câu hiện tại: { a: null, b: null, c: null, d: null }
  let tfUserAnswers = {};
  let tfChecked = false;

  // Danh mục 6 Dạng Biểu Đồ Trọng Tâm theo biểu đồ.docx
  const CORE_6_CHART_TYPES = [
    { key: "pie", label: "Tròn", sublabel: "Cơ cấu (1-2 năm)", icon: "🥧" },
    { key: "stacked_area", label: "Miền", sublabel: "Cơ cấu (≥ 3 năm)", icon: "🏔️" },
    { key: "line", label: "Đường", sublabel: "Tốc độ tăng trưởng", icon: "📈" },
    { key: "bar", label: "Cột Đơn / Ghép", sublabel: "Biến động / So sánh", icon: "📊" },
    { key: "bar_stacked", label: "Cột Chồng", sublabel: "Quy mô & cơ cấu", icon: "🥞" },
    { key: "combo_bar_line", label: "Kết Hợp", sublabel: "2 trục tung khác đv", icon: "📉📊" }
  ];

  // Danh sách từ khóa tín hiệu sư phạm trích từ biểu đồ.docx
  const SIGNAL_KEYWORDS = [
    "thay đổi cơ cấu",
    "chuyển dịch cơ cấu",
    "tốc độ tăng trưởng",
    "tốc độ phát triển",
    "quy mô và cơ cấu",
    "quy mô và tốc độ tăng trưởng",
    "diện tích và sản lượng",
    "sự biến động của một đối tượng qua nhiều năm",
    "so sánh các đối tượng khi có cùng đơn vị trong một năm",
    "sự biến động",
    "tình hình phát triển",
    "khối lượng",
    "cơ cấu",
    "tỷ trọng",
    "tỉ trọng",
    "tỷ lệ",
    "kết cấu",
    "biến động",
    "sự thay đổi",
    "phát triển",
    "diễn biến",
    "tăng trưởng",
    "tình hình",
    "so sánh",
    "quy mô",
    "sản lượng",
    "giá trị"
  ];

  function normalizeRows(rawRows) {
    if (!Array.isArray(rawRows)) return [];
    return rawRows.map(r => {
      if (Array.isArray(r)) {
        return {
          name: String(r[0] || ""),
          unit: "",
          values: r.slice(1).map(v => typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.').replace('%', '').trim()) || 0)
        };
      }
      return {
        name: r?.name || "",
        unit: r?.unit || "",
        values: (r?.values || []).map(v => typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.').replace('%', '').trim()) || 0)
      };
    });
  }

  function isMatchOptimal(btnKey, optimalChart) {
    if (!optimalChart) return false;
    if (btnKey === optimalChart) return true;
    if (btnKey === "bar" && ["bar", "bar_single", "bar_grouped", "bar_horizontal"].includes(optimalChart)) {
      return true;
    }
    return false;
  }

  function isSelectedType(btnKey, currentType) {
    if (!currentType) return false;
    if (btnKey === currentType) return true;
    if (btnKey === "bar" && ["bar", "bar_single", "bar_grouped", "bar_horizontal"].includes(currentType)) {
      return true;
    }
    return false;
  }

  async function init() {
    // 1. Nạp trực tiếp từ Master Atlat Data (100% offline, zero network latency)
    if (window.ATLAT_DATA && Array.isArray(window.ATLAT_DATA.chart_exercises) && window.ATLAT_DATA.chart_exercises.length > 0) {
      questionsData = window.ATLAT_DATA.chart_exercises;
      keywordGuide = window.ATLAT_DATA.keyword_guide || window.GEO_ATLAS_FALLBACK_DATA?.chartQuestions?.keyword_guide || [];
      renderQuestion(0);
      return;
    }

    try {
      const res = await fetch("./public/data/chart_questions.json");
      if (!res.ok) throw new Error("HTTP response not OK: " + res.status);
      const data = await res.json();
      questionsData = data.questions || [];
      keywordGuide = data.keyword_guide || [];
      renderQuestion(0);
    } catch (err) {
      console.warn("[ChartTrainer] Fetch thất bại. Kích hoạt TẦNG 3 Dữ liệu Hạt giống:", err);
      if (window.GEO_ATLAS_FALLBACK_DATA && window.GEO_ATLAS_FALLBACK_DATA.chartQuestions) {
        const fb = window.GEO_ATLAS_FALLBACK_DATA.chartQuestions;
        questionsData = fb.questions || [];
        keywordGuide = fb.keyword_guide || [];
        renderQuestion(0);
        if (typeof window.showOfflineToast === 'function') {
          window.showOfflineToast();
        }
      } else {
        console.error("[ChartTrainer] Không tìm thấy dữ liệu dự phòng!", err);
      }
    }
  }

  function setTab(tab) {
    activeTab = tab;
    const btnTrainer = document.getElementById("tab-btn-trainer");
    const btnGuide = document.getElementById("tab-btn-guide");
    const btnCustom = document.getElementById("tab-btn-custom");
    const trainerView = document.getElementById("chart-trainer-view");
    const guideView = document.getElementById("chart-guide-view");
    const customView = document.getElementById("chart-custom-view");
    const navArrows = document.getElementById("trainer-nav-arrows");

    const activeBtnClass = "px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition bg-blue-600 text-white shadow-xs";
    const inactiveBtnClass = "px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold transition text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700";

    if (btnTrainer) btnTrainer.className = activeTab === "trainer" ? activeBtnClass : inactiveBtnClass;
    if (btnGuide) btnGuide.className = activeTab === "guide" ? activeBtnClass : inactiveBtnClass;
    if (btnCustom) btnCustom.className = activeTab === "custom" ? activeBtnClass : inactiveBtnClass;

    if (trainerView) trainerView.classList.toggle("hidden", activeTab !== "trainer");
    if (guideView) guideView.classList.toggle("hidden", activeTab !== "guide");
    if (customView) customView.classList.toggle("hidden", activeTab !== "custom");
    if (navArrows) navArrows.classList.toggle("hidden", activeTab !== "trainer");

    if (activeTab === "trainer") {
      const q = questionsData[currentIndex];
      if (q) renderECharts(q, activeChartType || q.optimal_chart);
    } else if (activeTab === "guide") {
      renderKeywordGuide();
    } else if (activeTab === "custom") {
      renderCustomTableView();
      if (customQuestion) {
        renderECharts(customQuestion, customActiveChartType || customQuestion.optimal_chart);
      } else {
        loadCustomSample(1);
      }
    }

    setTimeout(() => {
      if (echartInstance) echartInstance.resize();
    }, 50);
  }

  function renderQuestion(index) {
    if (!questionsData || questionsData.length === 0) return;
    if (index < 0) index = 0;
    if (index >= questionsData.length) index = questionsData.length - 1;
    currentIndex = index;

    const q = questionsData[currentIndex];
    if (!q) return;
    activeChartType = null; // BUG-11: Không lộ đáp án trước khi học sinh chọn

    // Reset trạng thái trả lời Đúng/Sai
    tfUserAnswers = {};
    tfChecked = false;

    // Render bảng điều khiển
    renderControlPanel(q);

    // Vẽ biểu đồ hoặc hiển thị placeholder lên canvas
    setTimeout(() => {
      renderECharts(q, activeChartType);
    }, 50);
  }

  function escapeHtml(text) {
    return (text || '').replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[m]));
  }

  function highlightPromptText(rawPrompt, questionKeywords = []) {
    if (!rawPrompt) return "";
    const safePrompt = escapeHtml(rawPrompt);
    if (!showHighlight) return safePrompt;

    const allKeywords = [...new Set([...(questionKeywords || []), ...SIGNAL_KEYWORDS])]
      .filter(k => k && k.trim().length > 1)
      .sort((a, b) => b.length - a.length);

    if (allKeywords.length === 0) return safePrompt;

    const pattern = `(${allKeywords.map(k => escapeHtml(k).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`;
    const regex = new RegExp(pattern, "gi");

    return safePrompt.replace(regex, `<span class="keyword-highlight">$1</span>`);
  }

  function analyzeQuestionData(q) {
    const headers = q?.data_table?.headers || [];
    const categories = headers.slice(1);
    const rows = normalizeRows(q?.data_table?.rows);
    const numYears = categories.length;

    // 1. Số mốc thời gian (Chuẩn 100% biểu đồ.docx: 1-2 năm -> Tròn; từ 3 năm trở lên -> Miền)
    let timeLabel = "";
    let timeDetail = "";
    if (numYears === 1) {
      timeLabel = `1 năm duy nhất (${categories[0]})`;
      timeDetail = `Mục 1 biểu đồ.docx: Tối ưu Biểu đồ Tròn (cơ cấu) hoặc Cột (so sánh quy mô)`;
    } else if (numYears === 2) {
      timeLabel = `2 mốc năm (${categories.join(", ")})`;
      timeDetail = `Mục 1 & 6 biểu đồ.docx: 1-2 năm ưu tiên Biểu đồ Tròn (cơ cấu) hoặc Cột chồng (quy mô và cơ cấu)`;
    } else if (numYears >= 3) {
      timeLabel = `${numYears} mốc năm (${categories[0]} - ${categories[numYears - 1]})`;
      timeDetail = `Mục 4 biểu đồ.docx: Từ 3 năm trở lên bắt buộc Biểu đồ Miền (thay đổi cơ cấu) hoặc Đường (tốc độ)`;
    } else {
      timeLabel = `Không xác định`;
      timeDetail = `Kiểm tra lại cột dữ liệu`;
    }

    // 2. Số loại đơn vị tính
    const validRows = rows.filter(r => !/tổng\s*(số|cộng)?$/i.test(r.name.trim()));
    const units = [...new Set(validRows.map(r => (r.unit || "").trim()).filter(Boolean))];
    let unitLabel = "";
    let unitDetail = "";

    if (units.length > 1) {
      unitLabel = `${units.length} đơn vị khác nhau (${units.join(", ")})`;
      unitDetail = `Mục 5 biểu đồ.docx: Khác đơn vị bắt buộc Biểu đồ Kết Hợp (2 trục tung)`;
    } else if (units.length === 1) {
      unitLabel = `1 đơn vị duy nhất (${units[0]})`;
      unitDetail = `Cùng hệ quy chiếu: Phù hợp Tròn, Miền, Đường, Cột`;
    } else {
      const isPercentPrompt = /cơ cấu|tỷ trọng|tỉ trọng|%/i.test(q?.raw_prompt || "");
      unitLabel = isPercentPrompt ? "1 đơn vị (%)" : "1 đơn vị đồng nhất";
      unitDetail = `Cùng hệ quy chiếu đo lường`;
    }

    // 3. Tổng có bằng 100% không
    let isSum100 = false;
    if (validRows.length > 1 && numYears > 0) {
      const colSum = validRows.reduce((sum, r) => sum + (r.values[0] || 0), 0);
      if (Math.abs(colSum - 100) <= 2.5) {
        isSum100 = true;
      }
    }
    const promptHasStructure = /cơ cấu|tỷ trọng|tỉ trọng|kết cấu/i.test(q?.raw_prompt || "");

    let sumLabel = "";
    let sumDetail = "";
    if (isSum100) {
      sumLabel = "Tổng = 100% (Chuẩn cơ cấu)";
      sumDetail = numYears <= 2 ? "1-2 năm: Tối ưu vẽ Biểu đồ Tròn (Mục 1)" : "Từ 3 năm trở lên: Bắt buộc vẽ Biểu đồ Miền (Mục 4)";
    } else if (promptHasStructure) {
      sumLabel = "Dạng cơ cấu / tỷ trọng (%)";
      sumDetail = "Cần thể hiện phần trăm cấu thành";
    } else {
      sumLabel = "Không bằng 100% (Số tuyệt đối)";
      sumDetail = "Thể hiện quy mô, tốc độ hoặc so sánh độ lớn";
    }

    return {
      numYears,
      timeLabel,
      timeDetail,
      unitsCount: units.length,
      unitLabel,
      unitDetail,
      isSum100,
      sumLabel,
      sumDetail
    };
  }

  function renderAnalysisStepsHtml(q) {
    const analysis = analyzeQuestionData(q);

    return `
      <div class="bg-indigo-50/70 dark:bg-slate-800/80 p-3 rounded-xl border border-indigo-200 dark:border-indigo-900/60 space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-1.5 font-bold text-xs text-indigo-900 dark:text-indigo-300">
            <span>🔍</span>
            <span>Phân Tích Đề Bài 3 Bước (Chuẩn Sư Phạm Địa Lí):</span>
          </div>
          <span class="text-[9px] px-2 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            Cẩm nang biểu đồ
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <!-- Bước 1: Mốc Năm -->
          <div class="p-2 rounded-lg bg-white dark:bg-slate-900 border border-indigo-100 dark:border-slate-700 shadow-2xs space-y-1">
            <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              1. Số Mốc Năm
            </div>
            <div class="font-bold text-[11px] text-slate-800 dark:text-slate-100 truncate">
              ${analysis.timeLabel}
            </div>
            <div class="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
              ${analysis.timeDetail}
            </div>
          </div>

          <!-- Bước 2: Đơn Vị Tính -->
          <div class="p-2 rounded-lg bg-white dark:bg-slate-900 border border-indigo-100 dark:border-slate-700 shadow-2xs space-y-1">
            <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              2. Đơn Vị Tính
            </div>
            <div class="font-bold text-[11px] text-slate-800 dark:text-slate-100 truncate">
              ${analysis.unitLabel}
            </div>
            <div class="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
              ${analysis.unitDetail}
            </div>
          </div>

          <!-- Bước 3: Tổng 100% -->
          <div class="p-2 rounded-lg bg-white dark:bg-slate-900 border border-indigo-100 dark:border-slate-700 shadow-2xs space-y-1">
            <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              3. Tổng Thành Phần
            </div>
            <div class="font-bold text-[11px] text-slate-800 dark:text-slate-100 truncate">
              ${analysis.sumLabel}
            </div>
            <div class="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
              ${analysis.sumDetail}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderControlPanel(q) {
    const container = document.getElementById("chart-control-panel");
    if (!container || !q) return;

    // Highlight từ khóa
    const promptDisplay = highlightPromptText(q.raw_prompt || "", q.keywords);

    const headers = q?.data_table?.headers || [];
    const rows = normalizeRows(q?.data_table?.rows);

    const headersHtml = headers.map(h => `<th class="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-center whitespace-nowrap">${h}</th>`).join("");
    const rowsHtml = rows.map(r => {
      const cells = (r.values || []).map(v => `<td class="px-3 py-2 text-xs font-mono tabular-nums text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 text-center whitespace-nowrap">${typeof v === 'number' ? v.toLocaleString() : v}</td>`).join("");
      return `<tr><td class="px-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 min-w-[130px] max-w-[200px] whitespace-normal">${r.name} ${r.unit ? `<span class="text-[10px] text-slate-400 font-normal">(${r.unit})</span>` : ''}</td>${cells}</tr>`;
    }).join("");

    // Phân nhánh giao diện: Câu hỏi trắc nghiệm Đúng/Sai 4 mệnh đề vs Chọn biểu đồ đơn
    const isTrueFalse = q.type === "true_false" && Array.isArray(q.propositions);

    let interactionHtml = "";
    if (isTrueFalse) {
      interactionHtml = renderTrueFalseInteraction(q);
    } else {
      interactionHtml = renderMultipleChoiceInteraction(q);
    }

    const typeBadge = isTrueFalse 
      ? `<span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Format 2026: Đúng/Sai 4 Ý</span>`
      : `<span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">6 Dạng Biểu Đồ Trọng Tâm</span>`;

    container.innerHTML = `
      <div class="space-y-4">
        <!-- Sub-Nav chuyển đổi Luyện tập / Cẩm nang / Tự phân tích -->
        <div class="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
          <div class="flex items-center space-x-1 sm:space-x-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            <button id="tab-btn-trainer" onclick="ChartTrainer.setTab('trainer')" class="px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold ${activeTab === 'trainer' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}">
              📊 Luyện Tập
            </button>
            <button id="tab-btn-guide" onclick="ChartTrainer.setTab('guide')" class="px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold ${activeTab === 'guide' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}">
              📖 Cẩm Nang
            </button>
            <button id="tab-btn-custom" onclick="ChartTrainer.setTab('custom')" class="px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold ${activeTab === 'custom' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}">
              🧪 Tự Phân Tích
            </button>
          </div>
          <div id="trainer-nav-arrows" class="flex items-center space-x-1 shrink-0 ${activeTab === 'trainer' ? '' : 'hidden'}">
            <button onclick="ChartTrainer.prev()" title="Câu trước" class="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700">←</button>
            <span class="text-xs font-bold text-slate-700 dark:text-slate-300 px-1">${currentIndex + 1}/${questionsData.length}</span>
            <button onclick="ChartTrainer.next()" title="Câu kế tiếp" class="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700">→</button>
          </div>
        </div>

        <!-- Khung Nội Dung Luyện Tập -->
        <div id="chart-trainer-view" class="${activeTab === 'trainer' ? '' : 'hidden'} space-y-3.5">
          <!-- Header câu hỏi -->
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2 truncate">
              <span class="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-600 text-white shrink-0">
                Câu ${currentIndex + 1}
              </span>
              <span class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">${q.title || ''}</span>
            </div>
            ${typeBadge}
          </div>

          <!-- Yêu cầu Đề Bài & Gợi ý bóc tách -->
          <div class="bg-blue-50/70 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-200 dark:border-blue-800 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">Yêu Cầu Đề Bài</span>
              <label class="flex items-center space-x-1.5 cursor-pointer text-xs font-semibold text-blue-800 dark:text-blue-200">
                <input type="checkbox" id="chk-toggle-highlight" ${showHighlight ? 'checked' : ''} onchange="ChartTrainer.toggleHighlight(this.checked)" class="rounded text-blue-600 focus:ring-blue-500">
                <span>Gợi ý từ khóa</span>
              </label>
            </div>
            <p class="text-xs leading-relaxed text-slate-900 dark:text-slate-100 font-medium">
              ${promptDisplay}
            </p>
          </div>

          <!-- Bảng Phân Tích Đề Bài 3 Bước (Từ biểu đồ.docx) -->
          ${renderAnalysisStepsHtml(q)}

          <!-- Bảng số liệu thu gọn có bọc thẻ overflow-x-auto -->
          <div class="w-full overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs max-h-36">
            <table class="w-full border-collapse">
              <thead><tr>${headersHtml}</tr></thead>
              <tbody>${rowsHtml}</tbody>
            </table>
          </div>

          <!-- Vùng tương tác theo dạng câu hỏi (6 Nút Chọn & Phản Biện Sư Phạm) -->
          ${interactionHtml}
        </div>

        <!-- Khung Cẩm Nang Nhận Dạng Biểu Đồ (Tab 2) -->
        <div id="chart-guide-view" class="${activeTab === 'guide' ? '' : 'hidden'} space-y-3">
          <!-- Rendered by renderKeywordGuide() -->
        </div>

        <!-- Khung AI Table Analyzer - Tự Phân Tích Bảng (Tab 3) -->
        <div id="chart-custom-view" class="${activeTab === 'custom' ? '' : 'hidden'} space-y-3.5">
          <!-- Rendered by renderCustomTableView() -->
        </div>
      </div>
    `;

    if (activeTab === "guide") {
      renderKeywordGuide();
    } else if (activeTab === "custom") {
      renderCustomTableView();
    }
  }

  // Giao diện trắc nghiệm 6 Nút Biểu Đồ Chuẩn từ biểu đồ.docx
  function renderMultipleChoiceInteraction(q) {
    const buttonsHtml = CORE_6_CHART_TYPES.map(c => {
      const isSelected = isSelectedType(c.key, activeChartType);

      let badgeHtml = "";
      let buttonStyle = "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800";

      if (activeChartType !== null) {
        if (isSelected) {
          const isOptimal = isMatchOptimal(c.key, q.optimal_chart);
          const isAmbiguous = checkAmbiguousCase(q, c.key).isAmbiguous;
          if (isOptimal) {
            buttonStyle = "border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20 shadow-xs";
            badgeHtml = `<span class="choice-tag text-[9px] px-1.5 py-0.5 rounded-full font-bold shrink-0 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">Chuẩn</span>`;
          } else if (isAmbiguous) {
            buttonStyle = "border-amber-600 bg-amber-50/80 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 ring-2 ring-amber-500/20 shadow-xs";
            badgeHtml = `<span class="choice-tag text-[9px] px-1.5 py-0.5 rounded-full font-bold shrink-0 bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">Hợp lệ</span>`;
          } else {
            buttonStyle = "border-rose-600 bg-rose-50/80 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 ring-2 ring-rose-500/20 shadow-xs";
            badgeHtml = `<span class="choice-tag text-[9px] px-1.5 py-0.5 rounded-full font-bold shrink-0 bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200">Chưa chuẩn</span>`;
          }
        } else {
          badgeHtml = `<span class="choice-tag text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0 bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">Thử</span>`;
        }
      } else {
        // BUG-11: Chưa chọn -> Không lộ đáp án trước khi học sinh chọn
        badgeHtml = `<span class="choice-tag text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0 bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">Chọn</span>`;
      }

      return `
        <button 
          onclick="ChartTrainer.selectChartType('${c.key}')"
          id="btn-choice-${c.key}"
          class="chart-choice-btn p-2.5 rounded-xl border text-xs font-semibold transition flex flex-col justify-between ${buttonStyle}"
        >
          <div class="flex items-center justify-between w-full">
            <span class="flex items-center space-x-1.5 font-bold truncate">
              <span class="text-sm">${c.icon}</span>
              <span class="truncate">${c.label}</span>
            </span>
            ${badgeHtml}
          </div>
          <div class="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate text-left font-normal">
            ${c.sublabel}
          </div>
        </button>
      `;
    }).join("");

    const feedbackHtml = (activeChartType !== null)
      ? renderFeedbackHtml(q, activeChartType)
      : `
        <div class="card-pedagogical-guidance p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/40 space-y-1.5 shadow-xs">
          <div class="flex items-center space-x-2 text-blue-700 dark:text-blue-300 font-bold text-xs">
            <span class="text-base">💡</span>
            <h4>Hướng Dẫn Luyện Tập:</h4>
          </div>
          <p class="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            Hãy đọc kĩ <strong>Yêu Cầu Đề Bài</strong> và <strong>Bảng Phân Tích 3 Bước</strong> ở trên, sau đó bấm chọn 1 trong 6 dạng biểu đồ để kiểm tra trực quan và nhận phản biện sư phạm tức thì.
          </p>
        </div>
      `;

    return `
      <div id="chart-multiple-choice-container" class="space-y-3">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-700 dark:text-slate-300">
              Chọn 1 trong 6 dạng biểu đồ (Bấm để vẽ thử & phản biện):
            </span>
            <span class="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
              Thử & Sai Trực Quan
            </span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            ${buttonsHtml}
          </div>
        </div>

        <!-- Hộp Đánh Giá Sư Phạm Phản Hồi Tức Thì -->
        <div id="pedagogical-feedback-card" class="mt-3">
          ${feedbackHtml}
        </div>
      </div>
    `;
  }

  // Giao diện Format Mới: Trắc nghiệm Đúng/Sai 4 Mệnh Đề (Chuẩn 2025 - 2026)
  function renderTrueFalseInteraction(q) {
    const props = q.propositions || [];
    
    let rowsHtml = props.map(prop => {
      const userChoice = tfUserAnswers[prop.id];
      const isSelectedTrue = userChoice === true;
      const isSelectedFalse = userChoice === false;
      
      let feedbackHtml = "";
      let cardBorderClass = "border-slate-200 dark:border-slate-700";

      if (tfChecked) {
        const isUserCorrect = userChoice === prop.is_correct;
        cardBorderClass = isUserCorrect 
          ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20" 
          : "border-rose-500 bg-rose-50/40 dark:bg-rose-950/20";
        
        feedbackHtml = `
          <div class="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700 text-[11px] leading-relaxed">
            <div class="flex items-center space-x-1 font-bold ${isUserCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}">
              <span>${isUserCorrect ? '✅ Bạn đã trả lời đúng' : '❌ Bạn đã trả lời sai'}</span>
              <span>• Đáp án: <strong>${prop.is_correct ? 'ĐÚNG' : 'SAI'}</strong></span>
            </div>
            <p class="text-slate-600 dark:text-slate-300 mt-1">${prop.explanation || ''}</p>
          </div>
        `;
      }

      return `
        <div class="p-3 rounded-xl border ${cardBorderClass} bg-white dark:bg-slate-900 transition space-y-2">
          <div class="flex items-start justify-between gap-3">
            <div class="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed flex-1">
              <span class="font-bold text-blue-600 dark:text-blue-400 mr-1">${prop.id})</span>
              ${prop.statement}
            </div>
            <div class="flex items-center space-x-1 shrink-0">
              <button 
                onclick="ChartTrainer.selectTfOption('${prop.id}', true)"
                class="px-2.5 py-1 rounded-lg text-xs font-bold transition border ${
                  isSelectedTrue 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }"
              >
                Đúng
              </button>
              <button 
                onclick="ChartTrainer.selectTfOption('${prop.id}', false)"
                class="px-2.5 py-1 rounded-lg text-xs font-bold transition border ${
                  isSelectedFalse 
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs' 
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }"
              >
                Sai
              </button>
            </div>
          </div>
          ${feedbackHtml}
        </div>
      `;
    }).join("");

    let scoreBadge = "";
    if (tfChecked) {
      let correctCount = 0;
      props.forEach(p => {
        if (tfUserAnswers[p.id] === p.is_correct) correctCount++;
      });
      let points = "0.0";
      if (correctCount === 1) points = "0.1";
      else if (correctCount === 2) points = "0.25";
      else if (correctCount === 3) points = "0.5";
      else if (correctCount === 4) points = "1.0";

      scoreBadge = `
        <div class="p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/80 border border-blue-200 dark:border-slate-700 flex items-center justify-between">
          <div class="text-xs font-bold text-slate-800 dark:text-slate-100">
            🎯 Kết quả: Đúng ${correctCount}/4 mệnh đề
          </div>
          <div class="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-mono font-bold text-xs">
            +${points} điểm THPT
          </div>
        </div>
      `;
    }

    return `
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-700 dark:text-slate-300">
            Xét tính Đúng/Sai của 4 mệnh đề dưới đây:
          </span>
          <button 
            onclick="ChartTrainer.checkTrueFalseAnswers()"
            class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition flex items-center space-x-1"
          >
            <span>Kiểm Tra Đáp Án</span>
          </button>
        </div>

        <div class="space-y-2">
          ${rowsHtml}
        </div>

        ${scoreBadge}
      </div>
    `;
  }

  function selectTfOption(propId, val) {
    tfUserAnswers[propId] = val;
    renderControlPanel(questionsData[currentIndex]);
  }

  function checkTrueFalseAnswers() {
    tfChecked = true;
    renderControlPanel(questionsData[currentIndex]);
  }

  function getDetailedCritique(q, selectedType) {
    // 1. Nếu câu hỏi đã có sẵn phản biện cụ thể trong counter_factual
    if (q?.counter_factual?.[selectedType]) {
      return q.counter_factual[selectedType];
    }

    const headers = q?.data_table?.headers || [];
    const categories = headers.slice(1);
    const numYears = categories.length;
    const rows = normalizeRows(q?.data_table?.rows);
    const validRows = rows.filter(r => !/tổng\s*(số|cộng)?$/i.test(r.name.trim()));
    const units = [...new Set(validRows.map(r => (r.unit || "").trim()).filter(Boolean))];

    // 2. Phản biện động theo chuẩn 6 quy tắc của biểu đồ.docx
    if (selectedType === "pie") {
      if (numYears >= 4) {
        return `Quy tắc Atlat & GDPT 2018: Chuỗi số liệu có từ 4 năm trở lên (${numYears} năm) tuyệt đối KHÔNG vẽ biểu đồ Tròn. Việc vẽ từ 4 hình tròn trở lên sẽ làm phân tán thị giác, rất khó so sánh sự chuyển dịch cơ cấu. Bắt buộc phải chuyển sang Biểu đồ Miền (Stacked Area)!`;
      }
      if (units.length > 1) {
        return `Biểu đồ Tròn chỉ thể hiện cơ cấu thành phần (%) của một tổng thể 100% cùng loại đơn vị. Bảng số liệu có ${units.length} đơn vị khác nhau (${units.join(", ")}) nên không thể vẽ biểu đồ Tròn!`;
      }
      return `Biểu đồ Tròn chỉ tối ưu khi đề bài yêu cầu thể hiện "cơ cấu / tỷ trọng" tại 1 đến tối đa 3 mốc năm. Câu hỏi này không phù hợp với biểu đồ Tròn.`;
    }

    if (selectedType === "stacked_area") {
      if (numYears <= 2) {
        return `Quy tắc Atlat & GDPT 2018: Biểu đồ Miền chỉ áp dụng cho chuỗi thời gian từ 3 năm trở lên (thường là ≥ 4 năm) để tạo thành các diện tích biến động liên tục. Với chỉ ${numYears} mốc năm, các dải miền sẽ cụt lủn và thô cứng, làm sai lệch cấu trúc trực quan. Trường hợp này bắt buộc phải chọn Biểu đồ Tròn!`;
      }
      return `Biểu đồ Miền chỉ dùng khi thể hiện "sự thay đổi cơ cấu" / "chuyển dịch cơ cấu" qua chuỗi thời gian dài mà các thành phần có quan hệ tổng thể 100%. Bảng số liệu này không đáp ứng điều kiện đó.`;
    }

    if (selectedType === "line") {
      if (/cơ cấu|tỷ trọng|tỉ trọng/i.test(q.raw_prompt || "")) {
        return `Biểu đồ Đường biểu diễn xu hướng và tốc độ tăng trưởng qua các năm (gốc 100%). Khi đề bài nhấn mạnh "cơ cấu" hay "tỷ trọng", biểu đồ Đường không thể hiện được tính trực quan của tỉ lệ các thành phần trong 100%.`;
      }
      return `Biểu đồ Đường thích hợp nhất khi thể hiện "tốc độ tăng trưởng", "tốc độ phát triển" qua chuỗi thời gian dài. Với yêu cầu so sánh quy mô hoặc số liệu ít năm, biểu đồ Cột sẽ trực quan hơn.`;
    }

    if (selectedType === "bar") {
      if (units.length > 1) {
        return `Quy tắc biểu đồ chuẩn: Bảng số liệu có ${units.length} đơn vị đo lường khác nhau (${units.join(", ")}). Nếu vẽ trên biểu đồ Cột thông thường chỉ có 1 trục tung, các đại lượng sẽ bị lẫn lộn thang đo tỉ xích. Trường hợp này bắt buộc phải dùng Biểu đồ Kết Hợp (Combo Cột + Đường) với 2 trục tung riêng biệt!`;
      }
      if (/thay đổi cơ cấu|chuyển dịch cơ cấu/i.test(q.raw_prompt || "")) {
        return `Đề bài yêu cầu thể hiện "thay đổi cơ cấu" qua chuỗi thời gian. Biểu đồ Cột đơn/ghép dùng để so sánh quy mô độ lớn, không trực quan hóa được tỉ trọng từng thành phần trong tổng thể 100% như Biểu đồ Miền.`;
      }
      if (/tốc độ tăng trưởng/i.test(q.raw_prompt || "")) {
        return `Đề bài yêu cầu thể hiện "tốc độ tăng trưởng". Biểu đồ Đường là lựa chọn chuẩn xác nhất vì thể hiện được gia tốc và đường xu hướng, trong khi Biểu đồ Cột chỉ so sánh rời rạc từng năm.`;
      }
      return `Biểu đồ Cột đơn/ghép không phải là dạng tối ưu cho yêu cầu nhận thức và từ khóa của đề bài này.`;
    }

    if (selectedType === "bar_stacked") {
      return `Biểu đồ Cột chồng chỉ dùng khi thể hiện đồng thời cả "quy mô và cơ cấu" của các thành phần có cùng đơn vị tính và cộng lại bằng tổng thể. Không thể dùng cột chồng khi các đối tượng độc lập hoặc không có quan hệ tổng thể - bộ phận.`;
    }

    if (selectedType === "combo_bar_line") {
      if (units.length <= 1) {
        return `Biểu đồ Kết Hợp Cột + Đường (2 trục tung) chỉ dùng khi có từ 2 đối tượng khác nhau về đơn vị đo lường (ví dụ: sản lượng và giá trị). Bảng số liệu này chỉ có 1 đơn vị tính thống nhất, việc dùng 2 trục tung là sai quy chuẩn kỹ thuật biểu đồ Địa lí THPT.`;
      }
      return `Biểu đồ Kết Hợp chưa phù hợp với mục tiêu sư phạm của câu hỏi này.`;
    }

    return "Dạng biểu đồ này chưa phù hợp với yêu cầu của bảng số liệu.";
  }

  // Đánh giá 4 điểm mơ hồ theo biểu đồ.docx (Phụ lục B.3)
  function checkAmbiguousCase(q, selectedType) {
    if (!q) return { isAmbiguous: false };
    const prompt = (q.raw_prompt || "").toLowerCase();
    const headers = q?.data_table?.headers || [];
    const numYears = Math.max(0, headers.length - 1);
    const validRows = (q?.data_table?.rows || []).filter(r => !/tổng\s*(số|cộng)?$/i.test((r.name || "").trim()));
    const numRows = validRows.length;
    const units = [...new Set(validRows.map(r => (r.unit || "").trim()).filter(Boolean))];

    // Điểm 1: Đường vs Kết hợp khi khác đơn vị hoặc tốc độ tăng trưởng
    if ((selectedType === "line" && q.optimal_chart === "combo_bar_line") ||
        (selectedType === "combo_bar_line" && q.optimal_chart === "line")) {
      if (prompt.includes("tốc độ") || prompt.includes("tăng trưởng") || units.length > 1) {
        return {
          isAmbiguous: true,
          title: "Chấp nhận được (Tài liệu chưa phân định)",
          explanation: `Theo Mục 2 & Mục 5 tài liệu biểu đồ.docx: Khi các đối tượng khác đơn vị hoặc có yêu cầu thể hiện tốc độ tăng trưởng, cả Biểu đồ Đường (xử lý về số tương đối %) và Biểu đồ Kết Hợp (2 trục tung) đều là phương án sư phạm chấp nhận được.`
        };
      }
    }

    // Điểm 2: Tròn vs Cột chồng khi yêu cầu "quy mô và cơ cấu" qua 1-2 năm (BUG-05)
    if ((selectedType === "pie" && q.optimal_chart === "bar_stacked") ||
        (selectedType === "bar_stacked" && q.optimal_chart === "pie")) {
      if (numYears <= 2 && (prompt.includes("quy mô") || prompt.includes("cơ cấu"))) {
        return {
          isAmbiguous: true,
          title: "Chấp nhận được (Tài liệu chưa phân định)",
          explanation: `Theo Mục 1 & Mục 6 tài liệu biểu đồ.docx: Khi đề bài có 1-2 năm và yêu cầu thể hiện quy mô lẫn cơ cấu, học sinh có thể vẽ Biểu đồ Tròn (với bán kính R khác nhau) hoặc Biểu đồ Cột chồng (tỉ lệ % tuyệt đối). Cả hai đều được chấp nhận trong chấm thi THPT.`
        };
      }
    }

    // Điểm 3: Miền có từ 4 nhóm đối tượng trở lên (tài liệu BD chỉ ghi "hai hoặc ba nhóm") (BUG-05)
    if (selectedType === "stacked_area" || q.optimal_chart === "stacked_area") {
      if (numRows >= 4 && numYears >= 3 && (selectedType === "bar_stacked" || selectedType === "stacked_area")) {
        return {
          isAmbiguous: true,
          title: "Chấp nhận được (Tài liệu chưa phân định)",
          explanation: `Theo Mục 4 tài liệu biểu đồ.docx: Văn bản chỉ nêu quy tắc cho 'hai hoặc ba nhóm đối tượng'. Với ≥ 4 nhóm qua ≥ 3 năm, cả Biểu đồ Miền và Biểu đồ Cột chồng đều là giải pháp trực quan hợp lệ.`
        };
      }
    }

    // Điểm 4: Cột ghép vs Đường khi so sánh diễn biến nhiều năm cùng 1 đơn vị
    if ((selectedType === "bar" && q.optimal_chart === "line") ||
        (selectedType === "line" && q.optimal_chart === "bar")) {
      if (units.length <= 1 && numYears >= 3 && numYears <= 4 && !prompt.includes("tốc độ tăng trưởng")) {
        return {
          isAmbiguous: true,
          title: "Chấp nhận được (Tài liệu chưa phân định)",
          explanation: `Theo Mục 2 & Mục 3 tài liệu biểu đồ.docx: Với mốc 3-4 năm cùng đơn vị, Biểu đồ Cột (so sánh sự biến động độ lớn) và Biểu đồ Đường (diễn biến liên tục) đều được xem xét chấm điểm tùy thuộc trọng tâm câu hỏi.`
        };
      }
    }

    return { isAmbiguous: false };
  }

  function renderFeedbackHtml(q, selectedType) {
    if (!q) return "";
    const isOptimal = isMatchOptimal(selectedType, q.optimal_chart);

    if (isOptimal) {
      return `
        <div class="card-pedagogical-optimal p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40 space-y-2 shadow-xs">
          <div class="flex items-center space-x-2">
            <span class="text-base">✅</span>
            <h4 class="font-bold text-xs text-emerald-800 dark:text-emerald-300">
              ${q.optimal_chart_name || getChartLabel(selectedType)} là lựa chọn TỐI ƯU NHẤT!
            </h4>
          </div>
          <p class="text-xs leading-relaxed bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900 text-slate-800 dark:text-slate-200 font-medium">
            ${q.pedagogical_explanation || 'Lựa chọn hoàn toàn phù hợp với yêu cầu từ khóa đề bài và cấu trúc bảng số liệu.'}
          </p>
          <div class="flex items-center justify-between text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold px-1">
            <span>💡 Chuẩn kiến thức: Trích dẫn quy tắc cẩm nang Biểu đồ Địa lí THPT</span>
            <span class="font-mono bg-emerald-200/60 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded">Đúng quy chuẩn</span>
          </div>
        </div>
      `;
    } else {
      const ambig = checkAmbiguousCase(q, selectedType);
      if (ambig.isAmbiguous) {
        return `
          <div class="card-pedagogical-ambiguous p-3.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/40 space-y-2 shadow-xs">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <span class="text-base">⚖️</span>
                <h4 class="font-bold text-xs text-amber-800 dark:text-amber-300">
                  ${getChartLabel(selectedType)}: ${ambig.title}
                </h4>
              </div>
              <span class="text-[9px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                Chấp nhận được
              </span>
            </div>
            <p class="text-xs leading-relaxed bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900 text-slate-800 dark:text-slate-200 font-medium">
              ${ambig.explanation}
            </p>
            <div class="flex items-center justify-between text-[10px] text-amber-800 dark:text-amber-400 font-semibold px-1">
              <span>💡 Căn cứ: Tài liệu biểu đồ.docx & Thực tế chấm thi tốt nghiệp THPT</span>
              <span class="font-mono bg-amber-200/60 dark:bg-amber-900/60 px-1.5 py-0.5 rounded">Điểm bảo lưu</span>
            </div>
          </div>
        `;
      }

      const critique = getDetailedCritique(q, selectedType);
      return `
        <div class="card-pedagogical-critique p-3.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/40 space-y-2 shadow-xs">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <span class="text-base">⚠️</span>
              <h4 class="font-bold text-xs text-rose-700 dark:text-rose-300">
                ${getChartLabel(selectedType)}: Chưa tối ưu hoặc Sai quy tắc vẽ!
              </h4>
            </div>
            <span class="text-[9px] px-2 py-0.5 rounded-full font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300">
              Cần sửa đổi
            </span>
          </div>
          <p class="text-xs leading-relaxed bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900 text-slate-800 dark:text-slate-200 font-medium">
            ${critique}
          </p>
          <div class="text-[10px] text-rose-800 dark:text-rose-300 font-medium flex items-center space-x-1.5 pt-0.5">
            <span>👉</span>
            <span>Hãy nhìn biểu đồ vừa vẽ bên trái để thấy rõ sự bất hợp lý về mặt hình học và tỉ xích!</span>
          </div>
        </div>
      `;
    }
  }

  function selectChartType(chartType) {
    activeChartType = chartType;
    const q = questionsData[currentIndex];

    // Cập nhật lại khung tương tác chọn biểu đồ (cập nhật visual buttons & feedback card)
    const container = document.getElementById("chart-multiple-choice-container");
    if (container) {
      container.outerHTML = renderMultipleChoiceInteraction(q);
    } else {
      const feedbackCard = document.getElementById("pedagogical-feedback-card");
      if (feedbackCard) feedbackCard.innerHTML = renderFeedbackHtml(q, chartType);
    }

    // Vẽ ngay lập tức trên ECharts
    renderECharts(q, chartType);
  }

  function toggleHighlight(isChecked) {
    showHighlight = isChecked;
    renderControlPanel(questionsData[currentIndex]);
  }

  // Khung Trái: Apache ECharts Engine cho cả 6 Dạng Biểu Đồ
  function renderECharts(q, chartType) {
    const canvas = document.getElementById("chart-visual-canvas");
    if (!canvas || !q) return;

    if (!chartType) {
      if (echartInstance) {
        echartInstance.dispose();
        echartInstance = null;
      }
      canvas.innerHTML = `
        <div class="h-full min-h-[300px] flex flex-col items-center justify-center p-6 text-center space-y-3 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
          <div class="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-3xl shadow-xs">
            📊
          </div>
          <div class="space-y-1">
            <h4 class="font-bold text-sm text-slate-800 dark:text-slate-200">Khung Vẽ Biểu Đồ Trực Quan</h4>
            <p class="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
              Hãy phân tích bảng số liệu và bấm chọn 1 trong 6 dạng biểu đồ bên phải để đối chiếu hình học.
            </p>
          </div>
        </div>
      `;
      return;
    }

    if (echartInstance) {
      echartInstance.dispose();
    }
    echartInstance = echarts.init(canvas);

    const isDark = document.documentElement.classList.contains("dark");
    const textColor = isDark ? "#E2E8F0" : "#334155";
    const axisLineColor = isDark ? "#475569" : "#CBD5E1";
    const splitLineColor = isDark ? "#1E293B" : "#F1F5F9";

    const headers = q?.data_table?.headers || [];
    const categories = headers.slice(1);
    const rawRows = normalizeRows(q?.data_table?.rows);

    // Lọc bỏ dòng "Tổng số" / "Tổng cộng" khi vẽ biểu đồ cơ cấu (pie, stacked_area, bar_stacked)
    const structureFilteredRows = rawRows.filter(r => !/tổng\s*(số|cộng)?$/i.test(r.name.trim()));
    const rows = (["pie", "stacked_area", "bar_stacked"].includes(chartType) && structureFilteredRows.length > 0)
      ? structureFilteredRows 
      : rawRows;

    const modernColors = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#EF4444', '#14B8A6'];
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

    let option = {
      color: modernColors,
      title: {
        text: `${q.title || 'Biểu đồ'} - [Dạng: ${getChartLabel(chartType)}]`,
        left: "center",
        top: 6,
        textStyle: { fontSize: isMobile ? 11 : 13, fontWeight: "bold", fontFamily: 'Be Vietnam Pro', color: textColor }
      },
      toolbox: {
        show: !isMobile,
        right: 15,
        top: 6,
        itemSize: 13,
        feature: {
          saveAsImage: {
            title: "Tải ảnh PNG",
            pixelRatio: 2,
            name: (q.title || "bieu_do_dia_ly").replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9]/g, "_")
          },
          dataZoom: {
            yAxisIndex: "none",
            title: { zoom: "Phóng to vùng", back: "Khôi phục" }
          },
          dataView: {
            title: "Bảng số liệu",
            readOnly: true,
            lang: ["Bảng số liệu chi tiết", "Đóng", "Làm mới"]
          },
          restore: { title: "Đặt lại góc nhìn" }
        }
      },
      tooltip: {
        trigger: (chartType === "pie") ? "item" : "axis",
        textStyle: { fontFamily: 'Be Vietnam Pro', fontSize: 12 }
      },
      legend: {
        top: isMobile ? 42 : 32,
        type: "scroll",
        textStyle: { fontSize: 11, fontFamily: 'Be Vietnam Pro', color: textColor }
      },
      grid: {
        top: isMobile ? 80 : 72,
        right: isMobile ? 20 : 60,
        bottom: isMobile ? 40 : 60,
        left: isMobile ? 20 : 60,
        containLabel: true
      }
    };

    // 1. Biểu đồ Đường (line)
    if (chartType === "line") {
      option.xAxis = { 
        type: "category", 
        data: categories, 
        boundaryGap: false,
        axisLine: { lineStyle: { color: axisLineColor } },
        axisLabel: { color: textColor, hideOverlap: true, interval: 0, rotate: 15, fontFamily: 'Be Vietnam Pro' }
      };
      option.yAxis = { 
        type: "value",
        axisLine: { lineStyle: { color: axisLineColor } },
        splitLine: { lineStyle: { color: splitLineColor } },
        axisLabel: { color: textColor }
      };
      option.series = rows.map(r => ({
        name: r.name,
        type: "line",
        data: r.values,
        smooth: true,
        symbolSize: 8,
        lineStyle: { width: 3 }
      }));
    }
    // 2. Biểu đồ Cột Đơn / Cột ghép / Thanh Ngang (bar)
    else if (chartType === "bar" || chartType === "bar_single" || chartType === "bar_grouped" || chartType === "bar_horizontal") {
      const isHorizontalTarget = q.optimal_chart === "bar_horizontal" || chartType === "bar_horizontal";

      if (isHorizontalTarget) {
        // Vẽ dạng Thanh Ngang
        option.xAxis = { 
          type: "value",
          axisLine: { lineStyle: { color: axisLineColor } },
          splitLine: { lineStyle: { color: splitLineColor } },
          axisLabel: { color: textColor }
        };
        option.yAxis = { 
          type: "category", 
          data: rows.map(r => r.name),
          axisLine: { lineStyle: { color: axisLineColor } },
          axisLabel: { color: textColor, fontFamily: 'Be Vietnam Pro' }
        };
        option.series = categories.map((cat, cIdx) => ({
          name: cat,
          type: "bar",
          data: rows.map(r => r.values[cIdx] || 0),
          barMaxWidth: 24
        }));
      } else {
        // Vẽ dạng Cột Đứng
        option.xAxis = { 
          type: "category", 
          data: categories,
          axisLine: { lineStyle: { color: axisLineColor } },
          axisLabel: { color: textColor, hideOverlap: true, interval: 0, rotate: 15, fontFamily: 'Be Vietnam Pro' }
        };
        option.yAxis = { 
          type: "value",
          axisLine: { lineStyle: { color: axisLineColor } },
          splitLine: { lineStyle: { color: splitLineColor } },
          axisLabel: { color: textColor }
        };
        option.series = rows.map(r => ({
          name: r.name,
          type: "bar",
          data: r.values,
          barMaxWidth: rows.length > 2 ? 24 : 36,
          barGap: '15%'
        }));
      }
    }
    // 3. Biểu đồ Cột Chồng (bar_stacked)
    else if (chartType === "bar_stacked") {
      option.xAxis = { 
        type: "category", 
        data: categories,
        axisLine: { lineStyle: { color: axisLineColor } },
        axisLabel: { color: textColor, hideOverlap: true, interval: 0, rotate: 15, fontFamily: 'Be Vietnam Pro' }
      };
      option.yAxis = { 
        type: "value",
        axisLine: { lineStyle: { color: axisLineColor } },
        splitLine: { lineStyle: { color: splitLineColor } },
        axisLabel: { color: textColor }
      };
      option.series = rows.map(r => ({
        name: r.name,
        type: "bar",
        stack: "Total",
        data: r.values,
        barMaxWidth: 38
      }));
    }
    // 4. Biểu đồ Miền Chồng (stacked_area)
    else if (chartType === "stacked_area") {
      option.xAxis = { 
        type: "category", 
        data: categories, 
        boundaryGap: false,
        axisLine: { lineStyle: { color: axisLineColor } },
        axisLabel: { color: textColor, hideOverlap: true, interval: 0, rotate: 15, fontFamily: 'Be Vietnam Pro' }
      };
      option.yAxis = { 
        type: "value", 
        max: 100,
        axisLine: { lineStyle: { color: axisLineColor } },
        splitLine: { lineStyle: { color: splitLineColor } },
        axisLabel: { color: textColor, formatter: '{value}%' }
      };
      option.series = rows.map(r => ({
        name: r.name,
        type: "line",
        stack: "Total",
        smooth: true,
        areaStyle: { opacity: 0.8 },
        data: r.values
      }));
    }
    // 5. Biểu đồ Tròn (pie) - Thuật toán Đa Biểu Đồ Tròn N Năm
    else if (chartType === "pie") {
      delete option.grid;
      const numYears = categories.length;

      if (numYears <= 1) {
        option.series = [{
          name: categories[0] || "Cơ cấu",
          type: "pie",
          radius: "58%",
          center: ["50%", "54%"],
          avoidLabelOverlap: true,
          data: rows.map(r => ({ name: r.name, value: r.values[0] || 0 })),
          label: { formatter: "{b}: {d}%", fontSize: 11, fontFamily: 'Be Vietnam Pro', color: textColor }
        }];
      } else if (numYears === 2) {
        option.series = [
          {
            name: categories[0],
            type: "pie",
            radius: "44%",
            center: ["28%", "54%"],
            avoidLabelOverlap: true,
            data: rows.map(r => ({ name: r.name, value: r.values[0] || 0 })),
            label: { formatter: "{b}: {d}%", fontSize: 10, fontFamily: 'Be Vietnam Pro', color: textColor }
          },
          {
            name: categories[1],
            type: "pie",
            radius: "48%",
            center: ["72%", "54%"],
            avoidLabelOverlap: true,
            data: rows.map(r => ({ name: r.name, value: r.values[1] || 0 })),
            label: { formatter: "{b}: {d}%", fontSize: 10, fontFamily: 'Be Vietnam Pro', color: textColor }
          }
        ];
        option.title.subtext = `Hình 1: ${categories[0]} (trái)  |  Hình 2: ${categories[1]} (phải)`;
        option.title.subtextStyle = { fontSize: 11, color: textColor, fontFamily: 'Be Vietnam Pro' };
      } else if (numYears === 3) {
        option.series = [
          {
            name: categories[0],
            type: "pie",
            radius: "32%",
            center: ["18%", "54%"],
            avoidLabelOverlap: true,
            data: rows.map(r => ({ name: r.name, value: r.values[0] || 0 })),
            label: { formatter: "{d}%", fontSize: 10, color: textColor }
          },
          {
            name: categories[1],
            type: "pie",
            radius: "34%",
            center: ["50%", "54%"],
            avoidLabelOverlap: true,
            data: rows.map(r => ({ name: r.name, value: r.values[1] || 0 })),
            label: { formatter: "{d}%", fontSize: 10, color: textColor }
          },
          {
            name: categories[2],
            type: "pie",
            radius: "36%",
            center: ["82%", "54%"],
            avoidLabelOverlap: true,
            data: rows.map(r => ({ name: r.name, value: r.values[2] || 0 })),
            label: { formatter: "{d}%", fontSize: 10, color: textColor }
          }
        ];
        option.title.subtext = `${categories[0]} (trái) • ${categories[1]} (giữa) • ${categories[2]} (phải)`;
        option.title.subtextStyle = { fontSize: 11, color: textColor, fontFamily: 'Be Vietnam Pro' };
      } else {
        // >= 4 năm (Trường hợp phản biện: chia 2 hàng để thấy rõ sự rối rắm thị giác)
        option.series = categories.map((cat, idx) => {
          const isTop = idx < 2;
          const isLeft = (idx % 2) === 0;
          return {
            name: cat,
            type: "pie",
            radius: "22%",
            center: [isLeft ? "30%" : "70%", isTop ? "40%" : "75%"],
            data: rows.map(r => ({ name: r.name, value: r.values[idx] || 0 })),
            label: { formatter: "{d}%", fontSize: 9, color: textColor }
          };
        });
        option.title.subtext = "⚠️ Quá nhiều hình tròn (≥ 4 năm) gây rối mắt! Quy chuẩn sư phạm: Bắt buộc dùng biểu đồ Miền.";
        option.title.subtextStyle = { fontSize: 11, color: "#EF4444", fontWeight: "bold" };
      }
    }
    // 6. Biểu đồ Kết Hợp (combo_bar_line - 2 Trục Tung)
    else if (chartType === "combo_bar_line") {
      option.xAxis = { 
        type: "category", 
        data: categories,
        axisLine: { lineStyle: { color: axisLineColor } },
        axisLabel: { color: textColor, hideOverlap: true, interval: 0, rotate: 15, fontFamily: 'Be Vietnam Pro' }
      };

      const unit0 = rows[0]?.unit || "";
      const unit1 = rows[1]?.unit || unit0 || "";
      const hasTwoUnits = unit0 && unit1 && unit0 !== unit1;

      option.yAxis = [
        { 
          type: "value", 
          name: unit0,
          axisLine: { lineStyle: { color: axisLineColor } },
          splitLine: { lineStyle: { color: splitLineColor } },
          axisLabel: { color: textColor }
        },
        { 
          type: "value", 
          name: unit1,
          axisLine: { lineStyle: { color: axisLineColor } },
          splitLine: { show: false },
          axisLabel: { color: textColor }
        }
      ];

      if (rows.length >= 2) {
        option.series = [
          {
            name: rows[0].name,
            type: "bar",
            data: rows[0].values,
            barMaxWidth: 30
          },
          {
            name: rows[1].name,
            type: "line",
            yAxisIndex: hasTwoUnits ? 1 : 0,
            data: rows[1].values,
            lineStyle: { width: 3 },
            symbolSize: 8
          }
        ];
        // Nếu có nhiều hơn 2 chỉ tiêu
        for (let i = 2; i < rows.length; i++) {
          option.series.push({
            name: rows[i].name,
            type: "line",
            yAxisIndex: hasTwoUnits ? 1 : 0,
            data: rows[i].values,
            lineStyle: { width: 2, type: 'dashed' },
            symbolSize: 6
          });
        }
      } else if (rows.length === 1) {
        option.yAxis = [option.yAxis[0]];
        option.series = [
          {
            name: rows[0].name,
            type: "bar",
            data: rows[0].values,
            barMaxWidth: 30
          }
        ];
      }
    }

    echartInstance.setOption(option);
  }

  // Render Cẩm Nang 6 Dạng Biểu Đồ Trọng Tâm (Tab 2)
  function renderKeywordGuide() {
    const container = document.getElementById("chart-guide-view");
    if (!container) return;

    if (!keywordGuide || keywordGuide.length === 0) {
      if (window.ATLAT_DATA?.keyword_guide && window.ATLAT_DATA.keyword_guide.length > 0) {
        keywordGuide = window.ATLAT_DATA.keyword_guide;
      } else {
        container.innerHTML = `<div class="p-4 text-center text-slate-400">Đang tải cẩm nang...</div>`;
        return;
      }
    }

    const cardsHtml = keywordGuide.map(item => {
      const kws = (item.golden_keywords || []).map(k => `
        <span class="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 mr-1 mb-1 border border-blue-200 dark:border-blue-800">
          "${k}"
        </span>
      `).join("");

      return `
        <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
          <div class="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
            <h4 class="font-bold text-xs text-slate-900 dark:text-white flex items-center space-x-1.5">
              <span class="text-base">${getChartIcon(item.chart_type)}</span>
              <span>${item.chart_name}</span>
            </h4>
            <span class="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              ${item.time_rule}
            </span>
          </div>

          <div>
            <span class="text-[10px] font-bold uppercase text-slate-400 block mb-1">Từ Khóa Vàng Nhận Dạng:</span>
            <div class="flex flex-wrap">${kws}</div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div class="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span class="text-[10px] font-bold text-slate-400 block">Đơn vị thường gặp:</span>
              <span class="text-slate-700 dark:text-slate-200 font-medium">${(item.typical_units || []).join(", ") || "N/A"}</span>
            </div>
            <div class="p-2 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60">
              <span class="text-[10px] font-bold text-amber-700 dark:text-amber-400 block">Bẫy THPT cần tránh:</span>
              <span class="text-amber-900 dark:text-amber-200 font-medium text-[10px] leading-tight block">${item.critical_traps}</span>
            </div>
          </div>

          ${item.example_prompt ? `
            <div class="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-300">
              <span class="font-bold text-slate-800 dark:text-slate-200">Ví dụ chuẩn SGK & Atlat: </span>
              ${item.example_prompt}
            </div>
          ` : ''}
        </div>
      `;
    }).join("");

    container.innerHTML = `
      <div class="space-y-3">
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3.5 rounded-xl shadow-xs space-y-1">
          <h3 class="font-bold text-xs flex items-center space-x-1.5">
            <span>📖</span>
            <span>Cẩm Nang Bóc Tách Từ Khóa & 6 Dạng Biểu Đồ Trọng Tâm (Chuẩn GDPT 2018)</span>
          </h3>
          <p class="text-[11px] text-blue-100 leading-relaxed">
            Học sinh chỉ cần đối chiếu 3 bước: <strong>(1) Số mốc năm</strong> $\\rightarrow$ <strong>(2) Số loại đơn vị tính</strong> $\\rightarrow$ <strong>(3) Tổng có bằng 100% không</strong> để chọn chính xác 100% trong 5 giây!
          </p>
        </div>
        <div class="space-y-3">
          ${cardsHtml}
        </div>
      </div>
    `;
  }

  function getChartLabel(t) {
    const map = {
      pie: "Biểu đồ Tròn (Pie)",
      stacked_area: "Biểu đồ Miền (Stacked Area)",
      line: "Biểu đồ Đường (Line)",
      bar: "Biểu đồ Cột Đơn/Ghép (Bar)",
      bar_single: "Biểu đồ Cột Đơn",
      bar_grouped: "Biểu đồ Cột Ghép",
      bar_stacked: "Biểu đồ Cột Chồng (Stacked Bar)",
      combo_bar_line: "Biểu đồ Kết Hợp Cột + Đường (Combo)",
      bar_horizontal: "Biểu đồ Thanh Ngang"
    };
    return map[t] || t;
  }

  function getChartIcon(t) {
    const map = {
      pie: "🥧",
      stacked_area: "🏔️",
      line: "📈",
      bar: "📊",
      bar_single: "📊",
      bar_grouped: "📶",
      bar_stacked: "🥞",
      combo_bar_line: "📉📊",
      bar_horizontal: "📋"
    };
    return map[t] || "📊";
  }

  // ===========================================================================
  // AI TABLE ANALYZER & CUSTOM DATA INTERACTION (Tab 3)
  // ===========================================================================
  const CUSTOM_SAMPLES = [
    {
      id: 1,
      title: "Chuyển dịch cơ cấu GDP 4 năm (%)",
      prompt: "Theo bảng số liệu, để thể hiện sự chuyển dịch cơ cấu GDP phân theo khu vực kinh tế nước ta giai đoạn 2015 - 2024, dạng biểu đồ nào sau đây thích hợp nhất?",
      text: "Năm\t2015\t2018\t2021\t2024\nNông, lâm, thủy sản (%)\t17.0\t15.5\t13.2\t11.8\nCông nghiệp và xây dựng (%)\t36.7\t37.2\t38.1\t37.6\nDịch vụ (%)\t46.3\t47.3\t48.7\t50.6"
    },
    {
      id: 2,
      title: "Tốc độ tăng trưởng than, dầu, khí (%)",
      prompt: "Theo bảng số liệu, để thể hiện tốc độ tăng trưởng sản lượng các sản phẩm năng lượng nước ta giai đoạn 2015 - 2024, dạng biểu đồ nào sau đây thích hợp nhất?",
      text: "Năm\t2015\t2018\t2021\t2024\nThan sạch (%)\t100.0\t93.5\t108.4\t115.2\nDầu thô (%)\t100.0\t125.8\t65.2\t54.6\nKhí tự nhiên (%)\t100.0\t112.4\t102.8\t88.5"
    },
    {
      id: 3,
      title: "Quy mô và cơ cấu 2 năm",
      prompt: "Theo bảng số liệu, để thể hiện quy mô và cơ cấu giá trị sản xuất nông, lâm, thủy sản nước ta năm 2015 và 2024, dạng biểu đồ nào sau đây thích hợp nhất?",
      text: "Năm\t2015\t2024\nNông nghiệp (Nghìn tỉ đồng)\t680.5\t1085.6\nLâm nghiệp (Nghìn tỉ đồng)\t35.2\t76.8\nThủy sản (Nghìn tỉ đồng)\t220.4\t428.5"
    },
    {
      id: 4,
      title: "Sản lượng & Giá trị khác đơn vị",
      prompt: "Theo bảng số liệu, để thể hiện sản lượng lúa và giá trị sản xuất ngành trồng trọt nước ta giai đoạn 2015 - 2024, dạng biểu đồ nào sau đây thích hợp nhất?",
      text: "Năm\t2015\t2018\t2021\t2024\nSản lượng lúa (Triệu tấn)\t44.0\t43.9\t43.8\t43.5\nGiá trị sản xuất (Nghìn tỉ đồng)\t480.2\t530.5\t580.1\t640.8"
    }
  ];

  function parsePastedTable(rawText) {
    if (!rawText || !rawText.trim()) return null;
    const lines = rawText.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return null;

    const firstLine = lines[0];
    let delimiter = '\t';
    if (firstLine.includes('\t')) delimiter = '\t';
    else if (firstLine.includes('|')) delimiter = '|';
    else if (firstLine.includes(';')) delimiter = ';';
    else if (firstLine.includes(',')) delimiter = ',';
    else delimiter = /\s{2,}/;

    const headers = firstLine.split(delimiter).map(c => c.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
    if (headers.length < 2) return null;

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const cells = lines[i].split(delimiter).map(c => c.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
      if (cells.length < 2) continue;
      const rawName = cells[0];
      const unitMatch = rawName.match(/\((.*?)\)/);
      const unit = unitMatch ? unitMatch[1].trim() : '';
      const cleanName = rawName.replace(/\(.*?\)/, '').trim();
      const values = cells.slice(1).map(c => {
        let s = String(c || '').trim().replace(/\s+/g, '').replace(/%/g, '');
        if (s.includes('.') && s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
        else if (s.includes(',')) s = s.replace(',', '.');
        const num = parseFloat(s);
        return isNaN(num) ? 0 : num;
      });
      rows.push({
        name: cleanName || rawName,
        unit: unit,
        values: values
      });
    }

    if (rows.length === 0) return null;
    return { headers, rows };
  }

  function evaluateChartRules(parsed, promptText) {
    const { headers, rows } = parsed;
    const categories = headers.slice(1);
    const numYears = categories.length;
    const prompt = (promptText || '').toLowerCase();

    const validRows = rows.filter(r => !/tổng\s*(số|cộng)?$/i.test(r.name.trim()));
    const units = [...new Set(validRows.map(r => (r.unit || '').trim()).filter(Boolean))];

    const colSums = [];
    for (let c = 0; c < numYears; c++) {
      const sum = validRows.reduce((acc, r) => acc + (r.values[c] || 0), 0);
      colSums.push(Math.round(sum * 10) / 10);
    }
    const isSum100 = colSums.length > 0 && colSums.every(s => Math.abs(s - 100) <= 2.5);
    const isBase100 = validRows.length > 0 && validRows.every(r => Math.abs((r.values[0] || 0) - 100) <= 0.5);

    const hasGrowth = /tốc độ tăng trưởng|tốc độ phát triển|tăng trưởng/i.test(prompt) || isBase100;
    const hasStructure = /chuyển dịch cơ cấu|thay đổi cơ cấu|cơ cấu|tỷ trọng|tỉ trọng/i.test(prompt) || isSum100;
    const hasScaleAndStructure = /quy mô và cơ cấu/i.test(prompt);

    let optimal_chart = "bar";
    let chart_name = "Biểu đồ Cột (Bar Chart)";
    let confidence = 95;
    let explanation = "";

    if (units.length > 1) {
      optimal_chart = "combo_bar_line";
      chart_name = "Biểu đồ Kết Hợp Cột + Đường (2 Trục Tung)";
      confidence = 99;
      explanation = `Bảng số liệu có ${units.length} đơn vị đo lường khác nhau (${units.join(", ")}). Theo quy chuẩn thi THPT, bắt buộc phải vẽ Biểu đồ Kết hợp với 2 trục tung riêng biệt.`;
    } else if (hasGrowth) {
      optimal_chart = "line";
      chart_name = "Biểu đồ Đường (Line Chart)";
      confidence = 98;
      explanation = "Yêu cầu đề bài có từ khóa vàng 'tốc độ tăng trưởng' (hoặc năm gốc 100%). Biểu đồ đường là lựa chọn chuẩn xác tuyệt đối để thể hiện tốc độ phát triển.";
    } else if (hasScaleAndStructure) {
      if (numYears <= 3) {
        optimal_chart = "pie";
        chart_name = "Biểu đồ Tròn bán kính khác nhau (Multi-Pie)";
        confidence = 97;
        explanation = `Đề bài yêu cầu thể hiện 'quy mô và cơ cấu' trong ${numYears} năm (≤ 3 năm). Vẽ biểu đồ tròn với bán kính tỉ lệ thuận theo quy mô tổng số.`;
      } else {
        optimal_chart = "bar_stacked";
        chart_name = "Biểu đồ Cột Chồng (Stacked Bar)";
        confidence = 96;
        explanation = `Đề bài yêu cầu 'quy mô và cơ cấu' qua chuỗi ${numYears} năm (≥ 4 năm). Biểu đồ cột chồng thể hiện vừa tổng quy mô (chiều cao cột) vừa cơ cấu các bộ phận.`;
      }
    } else if (hasStructure) {
      if (numYears >= 4 || (numYears >= 3 && /chuyển dịch|thay đổi/i.test(prompt))) {
        optimal_chart = "stacked_area";
        chart_name = "Biểu đồ Miền (Stacked Area)";
        confidence = 98;
        explanation = `Yêu cầu thể hiện cơ cấu / chuyển dịch cơ cấu qua chuỗi thời gian dài ${numYears} mốc năm (≥ 3-4 năm). Biểu đồ miền là chuẩn mực tối ưu.`;
      } else {
        optimal_chart = "pie";
        chart_name = "Biểu đồ Tròn (Pie Chart)";
        confidence = 98;
        explanation = `Yêu cầu thể hiện cơ cấu trong ${numYears} mốc năm (≤ 3 năm). Biểu đồ tròn là lựa chọn tối ưu theo quy chuẩn Atlat và SGK.`;
      }
    } else {
      optimal_chart = "bar";
      chart_name = "Biểu đồ Cột (Bar Chart)";
      confidence = 95;
      explanation = "Đề bài yêu cầu so sánh quy mô hoặc thể hiện sự biến động qua các năm với 1 đơn vị thống nhất. Biểu đồ cột là lựa chọn tối ưu.";
    }

    return {
      numYears,
      categories,
      units,
      colSums,
      isSum100,
      isBase100,
      optimal_chart,
      chart_name,
      confidence,
      explanation
    };
  }

  function renderCustomTableView() {
    const container = document.getElementById("chart-custom-view");
    if (!container) return;

    container.innerHTML = `
      <div class="space-y-3.5">
        <!-- Banner AI Analyzer -->
        <div class="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-3.5 rounded-xl shadow-xs space-y-1">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-xs flex items-center space-x-1.5">
              <span>🧪</span>
              <span>AI Table Analyzer - Phân Tích Bảng Số Liệu Tự Do</span>
            </h3>
            <span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
              Rule Engine 98%
            </span>
          </div>
          <p class="text-[11px] text-blue-100 leading-relaxed">
            Dán bảng số liệu bất kỳ từ Word, Excel hoặc đề thi. Hệ thống tự động phân tích cấu trúc, kiểm tra 6 quy tắc sư phạm và vẽ ngay đồ thị tương tác!
          </p>
        </div>

        <!-- 4 Bảng mẫu nhanh -->
        <div class="space-y-1.5">
          <span class="text-[10px] font-bold uppercase text-slate-400 block">Nạp Nhanh Bảng Mẫu Đề Thi THPT:</span>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
            <button onclick="ChartTrainer.loadCustomSample(1)" class="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-[10px] font-semibold text-slate-700 dark:text-slate-300 text-left truncate transition shadow-2xs">
              🏔️ 1. Cơ cấu 4 năm
            </button>
            <button onclick="ChartTrainer.loadCustomSample(2)" class="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-[10px] font-semibold text-slate-700 dark:text-slate-300 text-left truncate transition shadow-2xs">
              📈 2. Tốc độ tăng trưởng
            </button>
            <button onclick="ChartTrainer.loadCustomSample(3)" class="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-[10px] font-semibold text-slate-700 dark:text-slate-300 text-left truncate transition shadow-2xs">
              🥧 3. Quy mô & cơ cấu 2 năm
            </button>
            <button onclick="ChartTrainer.loadCustomSample(4)" class="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-[10px] font-semibold text-slate-700 dark:text-slate-300 text-left truncate transition shadow-2xs">
              📉📊 4. Khác 2 đơn vị
            </button>
          </div>
        </div>

        <!-- Ô nhập yêu cầu đề bài -->
        <div class="space-y-1">
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Yêu cầu đề bài (Từ khóa nhận biết):
          </label>
          <input 
            type="text" 
            id="custom-table-prompt" 
            placeholder="Ví dụ: Theo bảng số liệu, để thể hiện sự chuyển dịch cơ cấu GDP nước ta..."
            class="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- Ô dán bảng dữ liệu -->
        <div class="space-y-1">
          <div class="flex items-center justify-between">
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Nội dung bảng số liệu (Copy từ Word / Excel):
            </label>
            <span class="text-[10px] text-slate-400">Hỗ trợ Tab, Phẩy, Chấm phẩy</span>
          </div>
          <textarea 
            id="custom-table-data" 
            rows="5"
            placeholder="Năm&#9;2015&#9;2018&#9;2021&#9;2024&#10;Nông nghiệp (%)&#9;17.0&#9;15.5&#9;13.2&#9;11.8&#10;Công nghiệp (%)&#9;36.7&#9;37.2&#9;38.1&#9;37.6&#10;Dịch vụ (%)&#9;46.3&#9;47.3&#9;48.7&#9;50.6"
            class="w-full p-2.5 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        <!-- Nút hành động -->
        <div class="flex items-center space-x-2">
          <button 
            onclick="ChartTrainer.analyzeCustomTable()"
            class="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition flex items-center justify-center space-x-1.5"
          >
            <span>🚀</span>
            <span>Phân Tích Bảng & Đề Xuất Dạng Biểu Đồ</span>
          </button>
          <button 
            onclick="ChartTrainer.clearCustomTable()"
            title="Xóa trắng nội dung"
            class="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-xs font-bold text-slate-600 dark:text-slate-300 transition"
          >
            ✕
          </button>
        </div>

        <!-- Khung hiển thị kết quả phân tích -->
        <div id="custom-analysis-result" class="space-y-3"></div>
      </div>
    `;

    if (customQuestion) {
      renderCustomAnalysisResult();
    }
  }

  function loadCustomSample(id) {
    const s = CUSTOM_SAMPLES.find(x => x.id === id) || CUSTOM_SAMPLES[0];
    const promptInput = document.getElementById("custom-table-prompt");
    const dataArea = document.getElementById("custom-table-data");
    if (promptInput) promptInput.value = s.prompt;
    if (dataArea) dataArea.value = s.text;
    analyzeCustomTable();
  }

  function clearCustomTable() {
    const promptInput = document.getElementById("custom-table-prompt");
    const dataArea = document.getElementById("custom-table-data");
    const resBox = document.getElementById("custom-analysis-result");
    if (promptInput) promptInput.value = "";
    if (dataArea) dataArea.value = "";
    if (resBox) resBox.innerHTML = "";
    customQuestion = null;
    customActiveChartType = null;
    if (typeof window.showAppToast === "function") {
      window.showAppToast("Đã xóa nội dung bảng tùy chọn.");
    }
  }

  function analyzeCustomTable() {
    const promptInput = document.getElementById("custom-table-prompt");
    const dataArea = document.getElementById("custom-table-data");
    const rawText = dataArea?.value || "";
    const promptText = promptInput?.value || "";

    const parsed = parsePastedTable(rawText);
    if (!parsed) {
      if (typeof window.showAppToast === "function") {
        window.showAppToast("⚠️ Vui lòng nhập đúng định dạng bảng số liệu (tối thiểu 1 dòng tiêu đề và 1 dòng dữ liệu).");
      }
      return;
    }

    const analysis = evaluateChartRules(parsed, promptText);
    customAnalysisData = analysis;

    // Bóc tách từ khóa nhận diện trong prompt
    const detectedKeywords = SIGNAL_KEYWORDS.filter(k => promptText.toLowerCase().includes(k.toLowerCase()));

    customQuestion = {
      id: "CUSTOM_" + Date.now(),
      title: promptText.slice(0, 70) || "Bảng Số Liệu Tùy Chọn",
      raw_prompt: promptText || "Biểu đồ nào sau đây thích hợp nhất thể hiện bảng số liệu?",
      keywords: detectedKeywords,
      data_table: {
        headers: parsed.headers,
        rows: parsed.rows
      },
      optimal_chart: analysis.optimal_chart,
      optimal_chart_name: analysis.chart_name,
      confidence: analysis.confidence,
      pedagogical_explanation: analysis.explanation,
      counter_factual: {
        pie: analysis.numYears > 3 ? `Sai lầm: Bảng số liệu có ${analysis.numYears} năm (≥ 4 năm), biểu đồ tròn sẽ gây rối rắm.` : "Biểu đồ tròn thích hợp cho cơ cấu ≤ 3 năm.",
        stacked_area: analysis.numYears <= 2 ? `Sai lầm: Chuỗi thời gian chỉ có ${analysis.numYears} năm (≤ 2 năm), các dải miền sẽ cụt lủn.` : "Biểu đồ miền thích hợp cho thay đổi cơ cấu ≥ 3-4 năm.",
        line: !/tốc độ/i.test(promptText) ? "Biểu đồ đường ưu tiên cho tốc độ tăng trưởng, không thể hiện trực quan cơ cấu 100%." : "Biểu đồ đường thể hiện tốt nhất tốc độ tăng trưởng.",
        combo_bar_line: analysis.units.length <= 1 ? "Bảng số liệu chỉ có 1 đơn vị tính đồng nhất, không cần dùng 2 trục tung." : "Biểu đồ kết hợp là bắt buộc khi có từ 2 đơn vị khác nhau."
      },
      structural_analysis: {
        time_points: analysis.numYears,
        units: analysis.units,
        is_total_100: analysis.isSum100
      }
    };

    customActiveChartType = customQuestion.optimal_chart;
    renderECharts(customQuestion, customActiveChartType);
    renderCustomAnalysisResult();

    if (typeof window.showAppToast === "function") {
      window.showAppToast(`✨ Đã phân tích thành công: Đề xuất ${analysis.chart_name} (${analysis.confidence}%)!`);
    }
  }

  function renderCustomAnalysisResult() {
    const resBox = document.getElementById("custom-analysis-result");
    if (!resBox || !customQuestion) return;

    const q = customQuestion;

    const buttonsHtml = CORE_6_CHART_TYPES.map(c => {
      const isSelected = isSelectedType(c.key, customActiveChartType);
      const isOptimal = isMatchOptimal(c.key, q.optimal_chart);

      return `
        <button 
          onclick="ChartTrainer.selectCustomChartType('${c.key}')"
          class="chart-choice-btn p-2 rounded-xl border text-xs font-semibold transition flex flex-col justify-between ${
            isSelected 
              ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20 shadow-xs' 
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }"
        >
          <div class="flex items-center justify-between w-full">
            <span class="flex items-center space-x-1.5 font-bold truncate">
              <span>${c.icon}</span>
              <span class="truncate">${c.label}</span>
            </span>
            <span class="text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
              isOptimal 
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            }">
              ${isOptimal ? 'Tối ưu' : 'Thử'}
            </span>
          </div>
          <div class="text-[10px] text-slate-400 mt-1 truncate text-left font-normal">
            ${c.sublabel}
          </div>
        </button>
      `;
    }).join("");

    resBox.innerHTML = `
      <div class="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700">
        <!-- Đánh giá AI Rule Engine -->
        <div class="p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40 space-y-2 shadow-xs">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-1.5 font-bold text-xs text-emerald-800 dark:text-emerald-300">
              <span class="text-base">🎯</span>
              <span>ĐỀ XUẤT TỐI ƯU: ${q.optimal_chart_name}</span>
            </div>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200">
              ${q.confidence || 98}% Tin Cậy
            </span>
          </div>
          <p class="text-xs leading-relaxed text-slate-800 dark:text-slate-200 bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900 font-medium">
            ${q.pedagogical_explanation}
          </p>
        </div>

        <!-- Thẻ 3 Bước Bóc Tách Bảng Số Liệu -->
        ${renderAnalysisStepsHtml(q)}

        <!-- 6 Nút chuyển đổi thử nghiệm đồ thị ECharts -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-700 dark:text-slate-300">
              Xem thử 6 dạng biểu đồ (Bấm để đổi dạng ECharts & phản biện):
            </span>
            <span class="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">Tương tác trực tiếp</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            ${buttonsHtml}
          </div>
        </div>

        <!-- Hộp phản biện sư phạm cho dạng vừa bấm -->
        <div class="mt-2">
          ${renderFeedbackHtml(q, customActiveChartType)}
        </div>
      </div>
    `;
  }

  function selectCustomChartType(type) {
    if (!customQuestion) return;
    customActiveChartType = type;
    renderECharts(customQuestion, customActiveChartType);
    renderCustomAnalysisResult();
  }

  function exportChartPng() {
    if (!echartInstance) return;
    const isDark = document.documentElement.classList.contains("dark");
    const url = echartInstance.getDataURL({
      type: "png",
      pixelRatio: 2,
      backgroundColor: isDark ? "#0f172a" : "#ffffff"
    });
    const q = (activeTab === "custom" && customQuestion) ? customQuestion : questionsData[currentIndex];
    const link = document.createElement("a");
    link.download = `${(q?.title || "bieu_do_dia_ly").slice(0, 40).replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9]/g, "_")}.png`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (typeof window.showAppToast === "function") {
      window.showAppToast("📸 Đã tải xuống ảnh biểu đồ PNG chất lượng cao (2x DPI)!");
    }
  }

  function resetChartZoom() {
    if (!echartInstance) return;
    echartInstance.dispatchAction({ type: "restore" });
    if (typeof window.showAppToast === "function") {
      window.showAppToast("🔄 Đã đặt lại góc nhìn và tỉ lệ biểu đồ!");
    }
  }

  function randomQuestion() {
    if (!questionsData || questionsData.length <= 1) return;
    let nextIdx;
    do {
      nextIdx = Math.floor(Math.random() * questionsData.length);
    } while (nextIdx === currentIndex);
    setTab("trainer");
    renderQuestion(nextIdx);
    if (typeof window.showAppToast === "function") {
      window.showAppToast(`🔀 Đã chuyển sang Câu hỏi ${nextIdx + 1}!`);
    }
  }

  return {
    init,
    setTab,
    selectChartType,
    toggleHighlight,
    selectTfOption,
    checkTrueFalseAnswers,
    next: () => renderQuestion(currentIndex + 1),
    prev: () => renderQuestion(currentIndex - 1),
    resize: () => echartInstance && echartInstance.resize(),
    syncTheme: () => {
      const q = (activeTab === "custom" && customQuestion) ? customQuestion : questionsData[currentIndex];
      const t = (activeTab === "custom" && customActiveChartType) ? customActiveChartType : activeChartType;
      if (q && t) renderECharts(q, t);
    },
    randomQuestion,
    exportChartPng,
    resetChartZoom,
    analyzeCustomTable,
    loadCustomSample,
    clearCustomTable,
    selectCustomChartType,
    parsePastedTable
  };
})();

window.ChartTrainer = ChartTrainer;