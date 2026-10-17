/**
 * GeoAtlas Interactive - Chart Trainer & Counter-factual Engine (Phân hệ 2)
 * Features:
 * - Anti-overlap grid & legend configuration in Apache ECharts
 * - Keyword Highlighting Toggle ("Gợi ý bóc tách")
 * - Structural analysis cards (T time points, U units, total 100%)
 * - Counter-factual Chart Rendering: clicking ANY of the 5 chart buttons renders that chart immediately on ECharts, with green for optimal or yellow/red with pedagogical critique!
 * - Robust row normalization: handles both object rows {name, unit, values} and array rows ["Name", v1, v2], converting commas to decimal dots!
 */

const ChartTrainer = (function () {
  let questionsData = [];
  let currentIndex = 0;
  let showHighlight = true;
  let activeChartType = null;
  let echartInstance = null;

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

  // Bản vá 2.1: Chống vẽ nhầm dòng "Tổng số" / "Cả nước" vào cơ cấu
  function separateTotalRow(rows) {
    if (!Array.isArray(rows)) return { totalRow: null, componentRows: [] };
    const isTotal = (name) => /^(tổng|tổng số|tổng cộng|cả nước|tổng số toàn ngành)$/i.test((name || '').trim());
    const totalRow = rows.find(r => isTotal(r.name));
    const componentRows = rows.filter(r => !isTotal(r.name));
    return {
      totalRow,
      componentRows: componentRows.length > 0 ? componentRows : rows
    };
  }

  // Bản vá 2.2: Phát hiện khoảng cách năm không đều trong bảng số liệu
  function detectUnevenYearGaps(headers) {
    if (!Array.isArray(headers) || headers.length <= 2) return null;
    const rawYears = headers.slice(1);
    const years = rawYears.map(h => {
      const m = String(h).match(/\d{4}/);
      return m ? parseInt(m[0], 10) : null;
    });

    if (years.some(y => y === null || isNaN(y))) return null;

    const gaps = [];
    for (let i = 0; i < years.length - 1; i++) {
      gaps.push(years[i + 1] - years[i]);
    }

    const allEqual = gaps.every(g => g === gaps[0]);
    if (!allEqual && gaps.length > 0) {
      const gapStr = gaps.map(g => `${g} năm`).join(" - ");
      return {
        years,
        gaps,
        gapStr,
        warningText: `Chú ý: Khoảng cách thời gian giữa các năm không đều nhau (${gapStr})!`
      };
    }
    return null;
  }

  async function init() {
    let usedFallback = false;
    try {
      const res = await fetch("./public/data/chart_questions.json");
      if (!res.ok) throw new Error("HTTP response not OK: " + res.status);
      const data = await res.json();
      questionsData = data.questions || [];
      renderQuestion(0);
    } catch (err) {
      console.warn("[ChartTrainer] Fetch thất bại. Kích hoạt TẦNG 3 Dữ liệu Hạt giống:", err);
      if (window.GEO_ATLAS_FALLBACK_DATA && window.GEO_ATLAS_FALLBACK_DATA.chartQuestions) {
        questionsData = window.GEO_ATLAS_FALLBACK_DATA.chartQuestions;
        usedFallback = true;
        renderQuestion(0);
        if (typeof window.showOfflineToast === 'function') {
          window.showOfflineToast();
        }
      } else {
        console.error("[ChartTrainer] Không tìm thấy dữ liệu dự phòng!", err);
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
    activeChartType = q.optimal_chart; // Mặc định vẽ biểu đồ chuẩn

    // Render bảng điều khiển bên phải (Khung 5 cột)
    renderControlPanel(q);

    // Vẽ ngay biểu đồ chuẩn lên khung bên trái (Khung 7 cột)
    setTimeout(() => {
      renderECharts(q, q.optimal_chart);
    }, 50);
  }

  function renderControlPanel(q) {
    const container = document.getElementById("chart-control-panel");
    if (!container || !q) return;

    // Bản vá 2.3: Chống vỡ HTML khi Highlight từ khóa (Single-Pass Regex Highlight)
    let promptDisplay = q.raw_prompt || "";
    if (showHighlight && Array.isArray(q.keywords) && q.keywords.length > 0) {
      const validKw = q.keywords.filter(k => typeof k === 'string' && k.trim().length > 0);
      if (validKw.length > 0) {
        const sortedKw = [...validKw]
          .sort((a, b) => b.length - a.length)
          .map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        const regex = new RegExp(`(${sortedKw.join('|')})`, 'gi');
        promptDisplay = promptDisplay.replace(
          regex,
          '<mark class="bg-amber-100 text-amber-900 font-semibold px-1.5 py-0.5 rounded border border-amber-300">$1</mark>'
        );
      }
    }

    const headers = q?.data_table?.headers || [];
    const rows = normalizeRows(q?.data_table?.rows);

    // Bảng dữ liệu HTML với tabular-nums & anti-overflow
    const headersHtml = headers.map(h => `<th class="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-center whitespace-nowrap">${h}</th>`).join("");
    const rowsHtml = rows.map(r => {
      const cells = (r.values || []).map(v => `<td class="px-3 py-2 text-xs font-mono tabular-nums text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 text-center whitespace-nowrap">${typeof v === 'number' ? v.toLocaleString() : v}</td>`).join("");
      return `<tr><td class="px-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 min-w-[140px] max-w-[220px] whitespace-normal">${r.name} ${r.unit ? `<span class="text-[10px] text-slate-400 font-normal">(${r.unit})</span>` : ''}</td>${cells}</tr>`;
    }).join("");

    // 5 Nút Thử & Sai Trực Quan (Counter-factual Buttons)
    const chartTypes = [
      { key: "pie", label: "Biểu đồ Tròn", icon: "🥧" },
      { key: "stacked_area", label: "Biểu đồ Miền", icon: "🏔️" },
      { key: "line", label: "Biểu đồ Đường", icon: "📈" },
      { key: "bar", label: "Biểu đồ Cột", icon: "📊" },
      { key: "combo_bar_line", label: "Biểu đồ Kết Hợp", icon: "📉📊" }
    ];

    const buttonsHtml = chartTypes.map(c => {
      const isSelected = activeChartType === c.key;
      const isOptimal = c.key === q.optimal_chart;
      return `
        <button 
          onclick="ChartTrainer.selectChartType('${c.key}')"
          id="btn-choice-${c.key}"
          class="chart-choice-btn p-2.5 rounded-xl border text-xs font-semibold transition flex items-center justify-between ${
            isSelected 
              ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20 shadow-xs' 
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }"
        >
          <span class="flex items-center space-x-1.5 truncate">
            <span>${c.icon}</span>
            <span class="truncate">${c.label}</span>
          </span>
          <span class="choice-tag text-[10px] px-2 py-0.5 rounded-full font-bold ml-1 shrink-0 ${
            isOptimal 
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
          }">
            ${isOptimal ? 'Chuẩn' : 'Thử'}
          </span>
        </button>
      `;
    }).join("");

    const struct = q?.structural_analysis || {};
    const unitsStr = Array.isArray(struct.units) ? struct.units.join(", ") : (struct.units || "N/A");

    container.innerHTML = `
      <div class="space-y-4">
        <!-- Header & Nav -->
        <div class="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
          <div class="flex items-center space-x-2 truncate">
            <span class="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-600 text-white shrink-0">
              Câu ${currentIndex + 1}/${questionsData.length}
            </span>
            <span class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">${q.title || ''}</span>
          </div>
          <div class="flex items-center space-x-1 shrink-0 ml-2">
            <button onclick="ChartTrainer.prev()" class="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700">←</button>
            <button onclick="ChartTrainer.next()" class="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700">→</button>
          </div>
        </div>

        <!-- Toggle Bóc Tách & Đề Bài -->
        <div class="bg-blue-50/70 dark:bg-blue-950/40 p-3.5 rounded-xl border border-blue-200 dark:border-blue-800 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">Yêu Cầu Đề Bài</span>
            <label class="flex items-center space-x-1.5 cursor-pointer text-xs font-semibold text-blue-800 dark:text-blue-200">
              <input type="checkbox" id="chk-toggle-highlight" ${showHighlight ? 'checked' : ''} onchange="ChartTrainer.toggleHighlight(this.checked)" class="rounded text-blue-600 focus:ring-blue-500">
              <span>Gợi ý bóc tách</span>
            </label>
          </div>
          <p class="text-xs leading-relaxed text-slate-900 dark:text-slate-100 font-medium">
            ${promptDisplay}
          </p>
        </div>

        <!-- Bảng Thông Số Bóc Tách Tự Động -->
        <div class="grid grid-cols-3 gap-2 text-center text-xs">
          <div class="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span class="text-[10px] text-slate-400 block uppercase font-bold">Số mốc năm (T)</span>
            <span class="font-bold text-blue-600 dark:text-blue-400 text-sm tabular-nums">${struct.time_points || 0} năm</span>
          </div>
          <div class="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span class="text-[10px] text-slate-400 block uppercase font-bold">Đơn vị đo (U)</span>
            <span class="font-bold text-purple-600 dark:text-purple-400 text-xs truncate block" title="${unitsStr}">${unitsStr}</span>
          </div>
          <div class="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span class="text-[10px] text-slate-400 block uppercase font-bold">Tổng = 100%?</span>
            <span class="font-bold ${struct.is_total_100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'} text-xs">${struct.is_total_100 ? 'Có (Cơ cấu)' : 'Không'}</span>
          </div>
        </div>

        ${(() => {
          const unevenInfo = detectUnevenYearGaps(headers);
          if (!unevenInfo) return '';
          return `
            <div class="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start space-x-2 shadow-xs">
              <span class="text-base shrink-0">⚠️</span>
              <div class="leading-relaxed">
                <span class="font-bold">${unevenInfo.warningText}</span>
                <div class="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                  👉 Bẫy thi THPT: Khi vẽ biểu đồ đường/cột, khoảng cách các mốc năm trên trục hoành phải tương ứng tỉ lệ thời gian.
                </div>
              </div>
            </div>
          `;
        })()}

        <!-- Bảng số liệu thu gọn có bọc thẻ overflow-x-auto -->
        <div class="w-full overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs max-h-40">
          <table class="w-full border-collapse">
            <thead><tr>${headersHtml}</tr></thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>

        <!-- 5 Nút Thử & Sai Trực Quan (Counter-factual Chart Selection) -->
        <div class="space-y-2">
          <span class="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            Bấm chọn để vẽ thử và kiểm tra tính hợp lý (Thử & Sai Trực Quan):
          </span>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            ${buttonsHtml}
          </div>
        </div>

        <!-- Hộp Đánh Giá Sư Phạm Phản Hồi Tức Thì (WCAG AAA) -->
        <div id="pedagogical-feedback-card" class="mt-3">
          ${renderFeedbackHtml(q, activeChartType)}
        </div>
      </div>
    `;
  }

  function renderFeedbackHtml(q, selectedType) {
    if (!q) return "";
    const isOptimal = selectedType === q.optimal_chart;

    if (isOptimal) {
      return `
        <div class="card-pedagogical-optimal p-4 rounded-xl space-y-2 shadow-xs">
          <div class="flex items-center space-x-2">
            <span class="text-lg">✅</span>
            <h4 class="font-bold text-sm">Chính xác tuyệt đối! (${q.optimal_chart_name || getChartLabel(selectedType)})</h4>
          </div>
          <p class="text-xs leading-relaxed bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-emerald-300 dark:border-emerald-800">
            ${q.pedagogical_explanation || 'Lựa chọn hoàn toàn phù hợp với cấu trúc bảng số liệu và yêu cầu đề bài.'}
          </p>
        </div>
      `;
    } else {
      const critique = q?.counter_factual?.[selectedType] || "Dạng biểu đồ này không phản ánh đúng mục tiêu nhận thức của câu hỏi.";
      return `
        <div class="card-pedagogical-critique p-4 rounded-xl space-y-2 shadow-xs">
          <div class="flex items-center space-x-2">
            <span class="text-lg">⚠️</span>
            <h4 class="font-bold text-sm">Chưa tối ưu hoặc Sai quy tắc vẽ!</h4>
          </div>
          <p class="text-xs leading-relaxed bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-rose-300 dark:border-rose-800">
            ${critique}
          </p>
          <div class="text-[11px] text-rose-800 dark:text-rose-300 font-medium">
            👉 Hãy quan sát biểu đồ vẽ bên khung trái để thấy rõ sự bất hợp lý!
          </div>
        </div>
      `;
    }
  }

  function selectChartType(chartType) {
    activeChartType = chartType;
    const q = questionsData[currentIndex];

    // Cập nhật lại giao diện nút & đánh giá
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

    // Vẽ ngay lập tức biểu đồ đó trên Apache ECharts ở Khung trái
    renderECharts(q, chartType);
  }

  function toggleHighlight(isChecked) {
    showHighlight = isChecked;
    renderControlPanel(questionsData[currentIndex]);
  }

  // Khung trái (7 cột): Vẽ biểu đồ Apache ECharts với Anti-overlap Grid & Legend
  function renderECharts(q, chartType) {
    const canvas = document.getElementById("chart-visual-canvas");
    if (!canvas || !q) return;

    // Bản vá 2.1: Quản lý vòng đời ECharts Singleton & NotMerge
    let chartInstance = echarts.getInstanceByDom(canvas) || echarts.init(canvas);
    echartInstance = chartInstance;
    chartInstance.clear();

    const headers = q?.data_table?.headers || [];
    const categories = headers.slice(1);
    const rows = normalizeRows(q?.data_table?.rows);
    const { totalRow, componentRows } = separateTotalRow(rows);
    const modernColors = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];

    let option = {
      color: modernColors,
      title: {
        text: `${q.title || 'Biểu đồ'} - [Dạng: ${getChartLabel(chartType)}]`,
        left: "center",
        top: 8,
        textStyle: { fontSize: 13, fontWeight: "bold", fontFamily: 'Be Vietnam Pro' }
      },
      tooltip: {
        trigger: chartType === "pie" ? "item" : "axis",
        textStyle: { fontFamily: 'Be Vietnam Pro', fontSize: 12 }
      },
      legend: {
        top: 32,
        type: "scroll",
        textStyle: { fontSize: 11, fontFamily: 'Be Vietnam Pro' }
      },
      grid: {
        top: 75,
        right: 65,
        bottom: 60,
        left: 65,
        containLabel: true
      }
    };

    // Bản vá 2.2: Chuẩn hóa 3 quy tắc vẽ biểu đồ Địa lý THPT
    if (chartType === "line") {
      option.xAxis = { 
        type: "category", 
        data: categories, 
        boundaryGap: false,
        axisLabel: { hideOverlap: true, interval: 0, rotate: 15, fontFamily: 'Be Vietnam Pro' }
      };

      // Quy tắc Đường Tốc độ tăng trưởng: Chuẩn hóa năm đầu tiên về 100% nếu bảng là số tuyệt đối
      const isGrowthPrompt = /tốc độ tăng trưởng/i.test(q.raw_prompt || '') || 
                             /tốc độ tăng trưởng/i.test(q.title || '') || 
                             (Array.isArray(q.keywords) && q.keywords.some(k => /tốc độ tăng trưởng/i.test(k)));
      const isAbsoluteData = !q.structural_analysis?.is_total_100 && !(rows[0]?.unit && rows[0].unit.includes('%'));

      let lineRows = rows;
      if (isGrowthPrompt && isAbsoluteData) {
        lineRows = rows.map(r => {
          const firstVal = r.values[0] || 1;
          return {
            ...r,
            values: r.values.map(v => Math.round((v / firstVal) * 1000) / 10)
          };
        });
        option.yAxis = {
          type: "value",
          scale: true,
          axisLabel: { formatter: '{value}%', fontFamily: 'Be Vietnam Pro' }
        };
      } else {
        option.yAxis = { 
          type: "value", 
          scale: true,
          axisLabel: { fontFamily: 'Be Vietnam Pro' }
        };
      }

      option.series = lineRows.map(r => ({
        name: r.name,
        type: "line",
        data: r.values,
        smooth: true,
        symbolSize: 8,
        lineStyle: { width: 3 }
      }));
    } else if (chartType === "bar") {
      option.xAxis = { 
        type: "category", 
        data: categories,
        axisLabel: { hideOverlap: true, interval: 0, rotate: 15, fontFamily: 'Be Vietnam Pro' }
      };
      option.yAxis = { 
        type: "value",
        axisLabel: { fontFamily: 'Be Vietnam Pro' }
      };
      option.series = rows.map(r => ({
        name: r.name,
        type: "bar",
        data: r.values,
        barMaxWidth: 35
      }));
    } else if (chartType === "stacked_area") {
      // Quy tắc Biểu đồ Miền: yAxis từ 0 đến 100%, xAxis boundaryGap=false, tự động quy đổi sang % nếu chưa là %
      option.xAxis = { 
        type: "category", 
        data: categories, 
        boundaryGap: false,
        axisLabel: { hideOverlap: true, interval: 0, rotate: 15, fontFamily: 'Be Vietnam Pro' }
      };
      option.yAxis = { 
        type: "value", 
        min: 0, 
        max: 100, 
        axisLabel: { formatter: '{value}%', fontFamily: 'Be Vietnam Pro' } 
      };

      // Dùng componentRows để không vẽ chồng dòng "Tổng số"
      const isAlreadyPercent = q.structural_analysis?.is_total_100 || (componentRows[0]?.unit && componentRows[0].unit.includes('%'));
      let areaRows = componentRows;
      if (!isAlreadyPercent) {
        const numCols = categories.length;
        const colSums = [];
        for (let c = 0; c < numCols; c++) {
          let sum = 0;
          componentRows.forEach(r => { sum += (r.values[c] || 0); });
          colSums.push(sum);
        }
        areaRows = componentRows.map(r => ({
          ...r,
          values: r.values.map((v, c) => {
            const sum = colSums[c] || 1;
            return Math.round((v / sum) * 1000) / 10;
          })
        }));
      }

      option.series = areaRows.map(r => ({
        name: r.name,
        type: "line",
        stack: "Total",
        areaStyle: { opacity: 0.8 },
        data: r.values,
        smooth: false
      }));
    } else if (chartType === "pie") {
      // Bản vá 1: Thuật toán chia tâm đa biểu đồ tròn cho N năm
      delete option.grid;
      delete option.xAxis;
      delete option.yAxis;

      const N = categories.length;
      let pieConfigs = [];

      if (N <= 1) {
        pieConfigs = [
          { center: ['50%', '50%'], radius: '58%', titleX: '50%', titleY: '88%' }
        ];
      } else if (N === 2) {
        pieConfigs = [
          { center: ['28%', '50%'], radius: '44%', titleX: '28%', titleY: '88%' },
          { center: ['72%', '50%'], radius: '44%', titleX: '72%', titleY: '88%' }
        ];
      } else if (N === 3) {
        pieConfigs = [
          { center: ['18%', '50%'], radius: '32%', titleX: '18%', titleY: '80%' },
          { center: ['50%', '50%'], radius: '32%', titleX: '50%', titleY: '80%' },
          { center: ['82%', '50%'], radius: '32%', titleX: '82%', titleY: '80%' }
        ];
      } else {
        // N >= 4 (Bấm thử sai): Chia 2 hàng (y = 32% và y = 75%), radius: 22%
        const row1Count = Math.ceil(N / 2);
        const row2Count = N - row1Count;

        for (let i = 0; i < row1Count; i++) {
          const xPercent = Math.round(((i + 1) / (row1Count + 1)) * 100);
          pieConfigs.push({
            center: [`${xPercent}%`, '32%'],
            radius: '22%',
            titleX: `${xPercent}%`,
            titleY: '52%'
          });
        }

        for (let i = 0; i < row2Count; i++) {
          const xPercent = Math.round(((i + 1) / (row2Count + 1)) * 100);
          pieConfigs.push({
            center: [`${xPercent}%`, '75%'],
            radius: '22%',
            titleX: `${xPercent}%`,
            titleY: '95%'
          });
        }
      }

      // Tạo series gồm N hình tròn, dùng componentRows để loại bỏ dòng "Tổng số"
      option.series = pieConfigs.map((cfg, i) => ({
        name: categories[i] ? `Năm ${categories[i]}` : `Cơ cấu ${i + 1}`,
        type: "pie",
        radius: cfg.radius,
        center: cfg.center,
        avoidLabelOverlap: true,
        data: componentRows.map(r => ({
          name: r.name,
          value: r.values[i] || 0
        })),
        label: {
          formatter: "{b}: {d}%",
          fontSize: N >= 4 ? 9 : (N === 3 ? 10 : 11),
          fontFamily: 'Be Vietnam Pro'
        }
      }));

      // Gắn nhãn tiêu đề Năm bên dưới mỗi hình tròn
      const yearTitles = pieConfigs.map((cfg, i) => ({
        text: categories[i] ? `Năm ${categories[i]}` : '',
        left: cfg.titleX,
        top: cfg.titleY,
        textAlign: 'center',
        textStyle: {
          fontSize: N >= 4 ? 11 : 12,
          fontWeight: 'bold',
          color: '#1e293b',
          fontFamily: 'Be Vietnam Pro'
        }
      }));

      option.title = [
        {
          text: `${q.title || 'Biểu đồ'} - [Dạng: ${getChartLabel(chartType)}]`,
          left: "center",
          top: 8,
          textStyle: { fontSize: 13, fontWeight: "bold", fontFamily: 'Be Vietnam Pro' }
        },
        ...yearTitles
      ];
    } else if (chartType === "combo_bar_line") {
      // Quy tắc Biểu đồ Kết hợp: 2 trục tung độc lập (Trục 0 bên trái cho Cột, Trục 1 bên phải cho Đường)
      option.xAxis = { 
        type: "category", 
        data: categories,
        axisLabel: { hideOverlap: true, interval: 0, rotate: 15, fontFamily: 'Be Vietnam Pro' }
      };
      option.yAxis = [
        { 
          type: "value", 
          name: rows[0]?.unit ? `${rows[0].name} (${rows[0].unit})` : (rows[0]?.name || "Cột"),
          position: "left",
          axisLabel: { fontFamily: 'Be Vietnam Pro' }
        },
        { 
          type: "value", 
          name: rows[1]?.unit ? `${rows[1].name} (${rows[1].unit})` : (rows[1]?.name || "Đường"),
          position: "right",
          splitLine: { show: false },
          axisLabel: { fontFamily: 'Be Vietnam Pro' }
        }
      ];
      option.series = [
        {
          name: rows[0]?.name || "Chỉ tiêu 1",
          type: "bar",
          yAxisIndex: 0,
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

    chartInstance.setOption(option, true);
  }

  function getChartLabel(t) {
    const map = {
      line: "Đường",
      bar: "Cột",
      pie: "Tròn",
      stacked_area: "Miền",
      combo_bar_line: "Kết hợp"
    };
    return map[t] || t;
  }

  return {
    init,
    selectChartType,
    toggleHighlight,
    next: () => renderQuestion(currentIndex + 1),
    prev: () => renderQuestion(currentIndex - 1),
    resize: () => echartInstance && echartInstance.resize()
  };
})();

window.ChartTrainer = ChartTrainer;
