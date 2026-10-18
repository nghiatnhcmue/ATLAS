/**
 * GeoAtlas Interactive - Chart Trainer & Counter-factual Engine v2.0 (Phân hệ 2)
 * Supports 8 Standard High-School Chart Types:
 * 1. pie (Đa biểu đồ tròn N năm chia tâm thông minh)
 * 2. stacked_area (Miền chồng cơ cấu)
 * 3. line (Đường tốc độ tăng trưởng)
 * 4. bar_single (Cột đơn quy mô)
 * 5. bar_grouped (Cột nhóm so sánh)
 * 6. bar_stacked (Cột chồng cơ cấu/tổng)
 * 7. combo_bar_line (Kết hợp 2 trục tung)
 * 8. bar_horizontal (Thanh ngang so sánh đối tượng)
 * 
 * Features:
 * - 20 Real Exam Questions (2020 - 2025)
 * - 4-Proposition True/False Format (Chuẩn GDPT 2018 / 2025 - 2026)
 * - Cẩm Nang Từ Khóa & Bẫy Nhận Dạng Reference Tab
 * - Light/Dark Theme Sync for Apache ECharts
 */

const ChartTrainer = (function () {
  let questionsData = [];
  let keywordGuide = [];
  let currentIndex = 0;
  let showHighlight = true;
  let activeChartType = null;
  let echartInstance = null;
  let activeTab = "trainer"; // 'trainer' | 'guide'

  // Trạng thái trắc nghiệm Đúng/Sai cho câu hiện tại: { a: null, b: null, c: null, d: null }
  let tfUserAnswers = {};
  let tfChecked = false;

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

  async function init() {
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
    const trainerView = document.getElementById("chart-trainer-view");
    const guideView = document.getElementById("chart-guide-view");

    if (activeTab === "trainer") {
      if (btnTrainer) btnTrainer.className = "px-3 py-1.5 rounded-lg text-xs font-bold transition bg-blue-600 text-white shadow-xs";
      if (btnGuide) btnGuide.className = "px-3 py-1.5 rounded-lg text-xs font-semibold transition text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800";
      if (trainerView) trainerView.classList.remove("hidden");
      if (guideView) guideView.classList.add("hidden");
      setTimeout(() => {
        if (echartInstance) echartInstance.resize();
      }, 50);
    } else {
      if (btnTrainer) btnTrainer.className = "px-3 py-1.5 rounded-lg text-xs font-semibold transition text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800";
      if (btnGuide) btnGuide.className = "px-3 py-1.5 rounded-lg text-xs font-bold transition bg-blue-600 text-white shadow-xs";
      if (trainerView) trainerView.classList.add("hidden");
      if (guideView) {
        guideView.classList.remove("hidden");
        renderKeywordGuide();
      }
    }
  }

  function renderQuestion(index) {
    if (!questionsData || questionsData.length === 0) return;
    if (index < 0) index = 0;
    if (index >= questionsData.length) index = questionsData.length - 1;
    currentIndex = index;

    const q = questionsData[currentIndex];
    if (!q) return;
    activeChartType = q.optimal_chart || "line";

    // Reset trạng thái trả lời Đúng/Sai
    tfUserAnswers = {};
    tfChecked = false;

    // Render bảng điều khiển
    renderControlPanel(q);

    // Vẽ biểu đồ tương ứng lên canvas
    setTimeout(() => {
      renderECharts(q, activeChartType);
    }, 50);
  }

  function renderControlPanel(q) {
    const container = document.getElementById("chart-control-panel");
    if (!container || !q) return;

    // Highlight từ khóa
    let promptDisplay = q.raw_prompt || "";
    if (showHighlight && Array.isArray(q.keywords)) {
      q.keywords.forEach(kw => {
        if (!kw) return;
        const regex = new RegExp(`(${kw})`, "gi");
        promptDisplay = promptDisplay.replace(regex, `<span class="keyword-highlight">$1</span>`);
      });
    }

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
      : `<span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">Trắc nghiệm Biểu đồ</span>`;

    container.innerHTML = `
      <div class="space-y-4">
        <!-- Sub-Nav chuyển đổi Luyện tập / Cẩm nang -->
        <div class="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
          <div class="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            <button id="tab-btn-trainer" onclick="ChartTrainer.setTab('trainer')" class="px-3 py-1 rounded-lg text-xs font-bold ${activeTab === 'trainer' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}">
              📊 Luyện Tập
            </button>
            <button id="tab-btn-guide" onclick="ChartTrainer.setTab('guide')" class="px-3 py-1 rounded-lg text-xs font-semibold ${activeTab === 'guide' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}">
              📖 Cẩm Nang Nhận Dạng
            </button>
          </div>
          <div class="flex items-center space-x-1 shrink-0">
            <button onclick="ChartTrainer.prev()" title="Câu trước" class="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700">← Trước</button>
            <span class="text-xs font-bold text-slate-700 dark:text-slate-300 px-1">${currentIndex + 1}/${questionsData.length}</span>
            <button onclick="ChartTrainer.next()" title="Câu kế tiếp" class="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700">Sau →</button>
          </div>
        </div>

        <!-- Khung Nội Dung Luyện Tập -->
        <div id="chart-trainer-view" class="${activeTab === 'trainer' ? '' : 'hidden'} space-y-4">
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
          <div class="bg-blue-50/70 dark:bg-blue-950/40 p-3.5 rounded-xl border border-blue-200 dark:border-blue-800 space-y-2">
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

          <!-- Bảng số liệu thu gọn có bọc thẻ overflow-x-auto -->
          <div class="w-full overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs max-h-36">
            <table class="w-full border-collapse">
              <thead><tr>${headersHtml}</tr></thead>
              <tbody>${rowsHtml}</tbody>
            </table>
          </div>

          <!-- Vùng tương tác theo dạng câu hỏi -->
          ${interactionHtml}
        </div>

        <!-- Khung Cẩm Nang Nhận Dạng Biểu Đồ (Tab 2) -->
        <div id="chart-guide-view" class="${activeTab === 'guide' ? '' : 'hidden'} space-y-3">
          <!-- Rendered by renderKeywordGuide() -->
        </div>
      </div>
    `;

    if (activeTab === "guide") {
      renderKeywordGuide();
    }
  }

  // Giao diện trắc nghiệm Chọn Biểu Đồ Truyền Thống kèm Nút Thử & Sai
  function renderMultipleChoiceInteraction(q) {
    const chartTypes = [
      { key: "pie", label: "Biểu đồ Tròn", icon: "🥧" },
      { key: "stacked_area", label: "Biểu đồ Miền", icon: "🏔️" },
      { key: "line", label: "Biểu đồ Đường", icon: "📈" },
      { key: "bar_single", label: "Cột Đơn", icon: "📊" },
      { key: "bar_grouped", label: "Cột Ghép", icon: "📶" },
      { key: "bar_stacked", label: "Cột Chồng", icon: "🥞" },
      { key: "combo_bar_line", label: "Kết Hợp", icon: "📉📊" },
      { key: "bar_horizontal", label: "Thanh Ngang", icon: "📋" }
    ];

    const buttonsHtml = chartTypes.map(c => {
      const isSelected = activeChartType === c.key;
      const isOptimal = c.key === q.optimal_chart;
      return `
        <button 
          onclick="ChartTrainer.selectChartType('${c.key}')"
          id="btn-choice-${c.key}"
          class="chart-choice-btn p-2 rounded-xl border text-xs font-semibold transition flex items-center justify-between ${
            isSelected 
              ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20 shadow-xs' 
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }"
        >
          <span class="flex items-center space-x-1.5 truncate">
            <span>${c.icon}</span>
            <span class="truncate">${c.label}</span>
          </span>
          <span class="choice-tag text-[9px] px-1.5 py-0.5 rounded-full font-bold ml-1 shrink-0 ${
            isOptimal 
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
          }">
            ${isOptimal ? 'Chuẩn' : 'Thử'}
          </span>
        </button>
      `;
    }).join("");

    return `
      <div class="space-y-2">
        <span class="text-xs font-bold text-slate-700 dark:text-slate-300 block">
          Bấm để vẽ thử & phản biện (Thử & Sai trực quan):
        </span>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          ${buttonsHtml}
        </div>
      </div>

      <!-- Hộp Đánh Giá Sư Phạm Phản Hồi Tức Thì -->
      <div id="pedagogical-feedback-card" class="mt-3">
        ${renderFeedbackHtml(q, activeChartType)}
      </div>
    `;
  }

  // Giao diện Format Mới: Trắc nghiệm Đúng/Sai 4 Mệnh Đề (2025 - 2026)
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

  function renderFeedbackHtml(q, selectedType) {
    if (!q) return "";
    const isOptimal = selectedType === q.optimal_chart;

    if (isOptimal) {
      return `
        <div class="card-pedagogical-optimal p-3.5 rounded-xl space-y-1.5 shadow-xs">
          <div class="flex items-center space-x-2">
            <span class="text-base">✅</span>
            <h4 class="font-bold text-xs">${q.optimal_chart_name || getChartLabel(selectedType)} là lựa chọn tối ưu!</h4>
          </div>
          <p class="text-xs leading-relaxed bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-emerald-300 dark:border-emerald-800 text-slate-800 dark:text-slate-200">
            ${q.pedagogical_explanation || 'Lựa chọn hoàn toàn phù hợp với cấu trúc bảng số liệu và yêu cầu đề bài.'}
          </p>
        </div>
      `;
    } else {
      const critique = q?.counter_factual?.[selectedType] || "Dạng biểu đồ này không phản ánh đúng mục tiêu nhận thức của câu hỏi.";
      return `
        <div class="card-pedagogical-critique p-3.5 rounded-xl space-y-1.5 shadow-xs">
          <div class="flex items-center space-x-2">
            <span class="text-base">⚠️</span>
            <h4 class="font-bold text-xs text-rose-700 dark:text-rose-300">Chưa tối ưu hoặc Sai quy tắc vẽ!</h4>
          </div>
          <p class="text-xs leading-relaxed bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-rose-300 dark:border-rose-800 text-slate-800 dark:text-slate-200">
            ${critique}
          </p>
          <div class="text-[10px] text-rose-800 dark:text-rose-300 font-medium">
            👉 Quan sát khung trực quan bên trái để thấy rõ sự bất hợp lý của hình học biểu đồ!
          </div>
        </div>
      `;
    }
  }

  function selectChartType(chartType) {
    activeChartType = chartType;
    const q = questionsData[currentIndex];

    // Cập nhật thẻ đánh giá
    const feedbackCard = document.getElementById("pedagogical-feedback-card");
    if (feedbackCard) {
      feedbackCard.innerHTML = renderFeedbackHtml(q, chartType);
    }

    document.querySelectorAll(".chart-choice-btn").forEach(btn => {
      btn.classList.remove("border-blue-600", "bg-blue-50/80", "dark:bg-blue-950/70", "text-blue-700", "dark:text-blue-300", "ring-2");
      btn.classList.add("border-slate-200", "dark:border-slate-700", "bg-white", "dark:bg-slate-900", "text-slate-700", "dark:text-slate-300");
    });
    const chosenBtn = document.getElementById(`btn-choice-${chartType}`);
    if (chosenBtn) {
      chosenBtn.classList.remove("border-slate-200", "dark:border-slate-700", "bg-white", "dark:bg-slate-900", "text-slate-700", "dark:text-slate-300");
      chosenBtn.classList.add("border-blue-600", "bg-blue-50/80", "dark:bg-blue-950/70", "text-blue-700", "dark:text-blue-300", "ring-2");
    }

    // Vẽ ngay lập tức trên ECharts
    renderECharts(q, chartType);
  }

  function toggleHighlight(isChecked) {
    showHighlight = isChecked;
    renderControlPanel(questionsData[currentIndex]);
  }

  // Khung Trái: Apache ECharts Engine cho cả 8 Dạng Biểu Đồ
  function renderECharts(q, chartType) {
    const canvas = document.getElementById("chart-visual-canvas");
    if (!canvas || !q) return;

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
    const rows = normalizeRows(q?.data_table?.rows);
    const modernColors = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#EF4444', '#14B8A6'];

    let option = {
      color: modernColors,
      title: {
        text: `${q.title || 'Biểu đồ'} - [Dạng: ${getChartLabel(chartType)}]`,
        left: "center",
        top: 8,
        textStyle: { fontSize: 13, fontWeight: "bold", fontFamily: 'Be Vietnam Pro', color: textColor }
      },
      tooltip: {
        trigger: (chartType === "pie") ? "item" : "axis",
        textStyle: { fontFamily: 'Be Vietnam Pro', fontSize: 12 }
      },
      legend: {
        top: 32,
        type: "scroll",
        textStyle: { fontSize: 11, fontFamily: 'Be Vietnam Pro', color: textColor }
      },
      grid: {
        top: 75,
        right: 60,
        bottom: 60,
        left: 60,
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
    // 2. Biểu đồ Cột Đơn / Cột ghép (bar, bar_single, bar_grouped)
    else if (chartType === "bar" || chartType === "bar_single" || chartType === "bar_grouped") {
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

      if (numYears === 1) {
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
        // >= 4 năm (Trường hợp phản biện: chia 2 hàng để thấy rõ sự rối rắm)
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
        option.title.subtext = "⚠️ Quá nhiều hình tròn (≥ 4 năm) gây rối mắt! Khuyên dùng biểu đồ Miền.";
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
      option.yAxis = [
        { 
          type: "value", 
          name: rows[0]?.unit || "",
          axisLine: { lineStyle: { color: axisLineColor } },
          splitLine: { lineStyle: { color: splitLineColor } },
          axisLabel: { color: textColor }
        },
        { 
          type: "value", 
          name: rows[1]?.unit || "",
          axisLine: { lineStyle: { color: axisLineColor } },
          splitLine: { show: false },
          axisLabel: { color: textColor }
        }
      ];
      option.series = [
        {
          name: rows[0]?.name || "Chỉ tiêu 1",
          type: "bar",
          data: rows[0]?.values || [],
          barMaxWidth: 30
        },
        {
          name: rows[1]?.name || "Chỉ tiêu 2",
          type: "line",
          yAxisIndex: 1,
          data: rows[1]?.values || [],
          lineStyle: { width: 3 },
          symbolSize: 8
        }
      ];
    }
    // 7. Biểu đồ Thanh Ngang (bar_horizontal)
    else if (chartType === "bar_horizontal") {
      const isSingleYear = categories.length === 1;
      if (isSingleYear) {
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
        option.series = [{
          name: categories[0] || "Giá trị",
          type: "bar",
          data: rows.map(r => r.values[0] || 0),
          barMaxWidth: 26
        }];
      } else {
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
          barMaxWidth: 20
        }));
      }
    }

    echartInstance.setOption(option);
  }

  // Render Cẩm Nang Từ Khóa & Bẫy Nhận Dạng (Tab 2)
  function renderKeywordGuide() {
    const container = document.getElementById("chart-guide-view");
    if (!container) return;

    if (!keywordGuide || keywordGuide.length === 0) {
      container.innerHTML = `<div class="p-4 text-center text-slate-400">Đang tải cẩm nang...</div>`;
      return;
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
            <span class="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              ${item.time_rule}
            </span>
          </div>

          <div>
            <span class="text-[10px] font-bold uppercase text-slate-400 block mb-1">Từ Khóa Vàng:</span>
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
        </div>
      `;
    }).join("");

    container.innerHTML = `
      <div class="space-y-3">
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3.5 rounded-xl shadow-xs space-y-1">
          <h3 class="font-bold text-xs flex items-center space-x-1.5">
            <span>📖</span>
            <span>Cẩm Nang Bóc Tách Từ Khóa & Phân Biệt 8 Dạng Biểu Đồ (Chuẩn 2026)</span>
          </h3>
          <p class="text-[11px] text-blue-100 leading-relaxed">
            Học sinh chỉ cần đối chiếu 3 bước: <strong>(1) Cụm từ khóa yêu cầu</strong> $\\rightarrow$ <strong>(2) Số mốc năm</strong> $\\rightarrow$ <strong>(3) Đơn vị tính</strong> để chọn chính xác 100% trong 5 giây!
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
      line: "Đường (Line)",
      bar: "Cột (Bar)",
      bar_single: "Cột Đơn",
      bar_grouped: "Cột Ghép",
      bar_stacked: "Cột Chồng",
      pie: "Tròn (Pie)",
      stacked_area: "Miền Chồng (Area)",
      combo_bar_line: "Kết Hợp (Combo)",
      bar_horizontal: "Thanh Ngang"
    };
    return map[t] || t;
  }

  function getChartIcon(t) {
    const map = {
      line: "📈",
      bar: "📊",
      bar_single: "📊",
      bar_grouped: "📶",
      bar_stacked: "🥞",
      pie: "🥧",
      stacked_area: "🏔️",
      combo_bar_line: "📉📊",
      bar_horizontal: "📋"
    };
    return map[t] || "📊";
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
      if (questionsData[currentIndex] && activeChartType) {
        renderECharts(questionsData[currentIndex], activeChartType);
      }
    }
  };
})();

window.ChartTrainer = ChartTrainer;