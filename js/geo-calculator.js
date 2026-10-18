/**
 * GeoAtlas Interactive - Geographic Calculator Engine (Phân hệ 3)
 * Features:
 * - 6 High-Yield Formulas (Mật độ, Bình quân, Cán cân & Bài toán ngược, Tỷ trọng, Tốc độ, Biên độ nhiệt)
 * - Click-to-Bind Interactive Sample Table: click any cell to populate inputs!
 * - Unit Normalizer with explicit KaTeX multiplier resolution (x 1000 or x 10^6)
 */

const GeoCalculator = (function () {
  const FORMULAS = {
    // 1. Mật độ dân số
    density: {
      id: "density",
      name: "Mật độ dân số",
      desc: "Số dân cư trú trên một đơn vị diện tích lãnh thổ.",
      latex: `\\text{Mật độ dân số} = \\frac{\\text{Dân số}}{\\text{Diện tích}} \\quad (\\text{người/km}^2)`,
      inputs: [
        {
          key: "population",
          label: "Dân số",
          defaultVal: 99.5,
          units: [
            { label: "Triệu người", factor: 1000000, latexMult: "\\times 10^6" },
            { label: "Nghìn người", factor: 1000, latexMult: "\\times 1000" },
            { label: "Người", factor: 1, latexMult: "" }
          ]
        },
        {
          key: "area",
          label: "Diện tích",
          defaultVal: 331.34,
          units: [
            { label: "Nghìn km²", factor: 1000, latexMult: "\\times 1000" },
            { label: "km²", factor: 1, latexMult: "" },
            { label: "ha (hecta)", factor: 0.01, latexMult: "\\div 100" }
          ]
        }
      ],
      sampleTable: {
        title: "Bảng số liệu tham khảo Dân số & Diện tích các Vùng Việt Nam",
        headers: ["Vùng kinh tế", "Dân số (Triệu người)", "Diện tích (Nghìn km²)"],
        rows: [
          ["Đồng bằng sông Hồng", "23.2", "21.3"],
          ["Trung du & MN Bắc Bộ", "12.9", "95.2"],
          ["Bắc Trung Bộ & DHNTB", "20.6", "95.8"],
          ["Tây Nguyên", "6.1", "54.5"],
          ["Đông Nam Bộ", "18.8", "23.6"],
          ["Đồng bằng sông Cửu Long", "17.4", "40.9"]
        ]
      },
      solve: (vals) => {
        const popUnit = vals.population.unitObj;
        const areaUnit = vals.area.unitObj;
        const popVal = vals.population.val;
        const areaVal = vals.area.val;

        const popExact = popVal * popUnit.factor;
        const areaExact = areaVal * areaUnit.factor;
        if (areaExact <= 0) return { error: "Diện tích phải lớn hơn 0" };

        const density = popExact / areaExact;
        return {
          resultText: `${Math.round(density).toLocaleString()} người/km²`,
          stepsLatex: [
            `\\text{Bước 1: Quy đổi chuẩn đơn vị: } \\text{Dân số} = ${popVal} ${popUnit.latexMult} = ${popExact.toLocaleString()} \\text{ người}`,
            `\\text{Bước 2: Quy đổi Diện tích} = ${areaVal} ${areaUnit.latexMult} = ${areaExact.toLocaleString()} \\text{ km}^2`,
            `\\text{Bước 3: Thay vào công thức: } \\text{Mật độ} = \\frac{${popExact.toLocaleString()}}{${areaExact.toLocaleString()}} = ${density.toFixed(2)} \\approx \\mathbf{${Math.round(density).toLocaleString()} \\text{ người/km}^2}`
          ],
          note: density > 1000 ? "Mật độ rất cao (đặc trưng châu thổ sông Hồng hoặc vùng đô thị lớn)." : "Mật độ phản ánh phân bố dân cư theo đặc điểm tự nhiên."
        };
      }
    },

    // 2. Bình quân lương thực / GDP đầu người
    per_capita: {
      id: "per_capita",
      name: "Bình quân Lương thực / GDP đầu người",
      desc: "Mức hưởng thụ sản lượng hoặc giá trị kinh tế trung bình trên mỗi cá nhân.",
      latex: `\\text{Bình quân} = \\frac{\\text{Tổng sản lượng (hoặc GDP)}}{\\text{Dân số}} \\quad (\\text{kg/người hoặc USD/người})`,
      inputs: [
        {
          key: "total_amount",
          label: "Tổng sản lượng lương thực",
          defaultVal: 43.5,
          units: [
            { label: "Triệu tấn", factor: 1000000000, latexMult: "\\times 10^9 \\text{ kg}" },
            { label: "Nghìn tấn", factor: 1000000, latexMult: "\\times 10^6 \\text{ kg}" },
            { label: "Tấn", factor: 1000, latexMult: "\\times 1000 \\text{ kg}" }
          ]
        },
        {
          key: "population",
          label: "Dân số",
          defaultVal: 99.5,
          units: [
            { label: "Triệu người", factor: 1000000, latexMult: "\\times 10^6" },
            { label: "Nghìn người", factor: 1000, latexMult: "\\times 1000" },
            { label: "Người", factor: 1, latexMult: "" }
          ]
        }
      ],
      sampleTable: {
        title: "Bảng số liệu Sản lượng Lúa & Dân số Việt Nam qua các năm",
        headers: ["Năm", "Sản lượng lúa (Triệu tấn)", "Dân số (Triệu người)"],
        rows: [
          ["Năm 2015", "45.1", "91.7"],
          ["Năm 2018", "44.0", "94.7"],
          ["Năm 2020", "42.8", "97.6"],
          ["Năm 2023", "43.5", "99.5"]
        ]
      },
      solve: (vals) => {
        const prodExact = vals.total_amount.val * vals.total_amount.unitObj.factor;
        const popExact = vals.population.val * vals.population.unitObj.factor;
        if (popExact <= 0) return { error: "Dân số phải lớn hơn 0" };

        const bq = prodExact / popExact;
        return {
          resultText: `${bq.toFixed(1)} kg/người/năm`,
          stepsLatex: [
            `\\text{Bước 1: Quy đổi Sản lượng ra kg} = ${vals.total_amount.val} ${vals.total_amount.unitObj.latexMult} = ${prodExact.toLocaleString()} \\text{ kg}`,
            `\\text{Bước 2: Quy đổi Dân số ra người} = ${vals.population.val} ${vals.population.unitObj.latexMult} = ${popExact.toLocaleString()} \\text{ người}`,
            `\\text{Bước 3: Tính bình quân: } \\text{BQLT} = \\frac{${prodExact.toLocaleString()}}{${popExact.toLocaleString()}} = \\mathbf{${bq.toFixed(1)} \\text{ kg/người}}`
          ],
          note: bq > 400 ? "Mức bình quân vượt ngưỡng 400 kg/người, đảm bảo vững chắc an ninh lương thực quốc gia." : "Cần tăng cường nâng cao sản lượng."
        };
      }
    },

    // 3. Cán cân xuất nhập khẩu & Bài toán ngược tìm Xuất/Nhập
    trade_balance: {
      id: "trade_balance",
      name: "Cán cân XNK & Tìm Xuất/Nhập",
      desc: "Tính cán cân thương mại hoặc tìm riêng Xuất khẩu, Nhập khẩu khi biết Tổng kim ngạch và Cán cân.",
      latex: `\\begin{aligned} \\text{Cán cân} &= \\text{Xuất khẩu} - \\text{Nhập khẩu} \\\\ \\text{Xuất khẩu} &= \\frac{\\text{Tổng kim ngạch} + \\text{Cán cân}}{2} \\end{aligned}`,
      inputs: [
        {
          key: "total_turnover",
          label: "Tổng kim ngạch (hoặc Xuất khẩu)",
          defaultVal: 683.0,
          units: [{ label: "Tỉ USD", factor: 1, latexMult: "" }]
        },
        {
          key: "balance_val",
          label: "Cán cân (hoặc Nhập khẩu)",
          defaultVal: 28.0,
          units: [{ label: "Tỉ USD", factor: 1, latexMult: "" }]
        }
      ],
      sampleTable: {
        title: "Bảng số liệu Thương mại Quốc tế Việt Nam",
        headers: ["Chỉ tiêu", "Năm 2020 (Tỉ USD)", "Năm 2023 (Tỉ USD)"],
        rows: [
          ["Tổng kim ngạch XNK", "544.1", "683.0"],
          ["Cán cân thương mại", "+19.9", "+28.0"],
          ["Giá trị Xuất khẩu", "282.0", "355.5"],
          ["Giá trị Nhập khẩu", "262.1", "327.5"]
        ]
      },
      solve: (vals) => {
        const total = vals.total_turnover.val;
        const balance = vals.balance_val.val;

        // Bài toán ngược: Biết Tổng kim ngạch T và Cán cân B -> Tìm X và N
        const xk = (total + balance) / 2;
        const nk = total - xk;

        return {
          resultText: `Xuất khẩu: ${xk.toFixed(2)} tỉ USD | Nhập khẩu: ${nk.toFixed(2)} tỉ USD`,
          stepsLatex: [
            `\\text{Công thức hệ phương trình: } \\begin{cases} X + N = ${total} \\\\ X - N = ${balance} \\end{cases}`,
            `\\text{Bước 1: Tính Xuất khẩu: } X = \\frac{\\text{Tổng} + \\text{Cán cân}}{2} = \\frac{${total} + (${balance})}{2} = \\mathbf{${xk.toFixed(2)} \\text{ tỉ USD}}`,
            `\\text{Bước 2: Tính Nhập khẩu: } N = \\text{Tổng} - X = ${total} - ${xk.toFixed(2)} = \\mathbf{${nk.toFixed(2)} \\text{ tỉ USD}}`
          ],
          note: balance >= 0 ? `Xuất siêu (thặng dư) ${balance} tỉ USD. Nền kinh tế giữ vững vị thế xuất siêu ấn tượng.` : `Nhập siêu ${Math.abs(balance)} tỉ USD.`
        };
      }
    },

    // 4. Tỷ trọng cơ cấu (%)
    structure_share: {
      id: "structure_share",
      name: "Tỷ trọng cơ cấu (%)",
      desc: "Tính tỉ lệ phần trăm của một bộ phận thành phần trong tổng thể.",
      latex: `\\text{Tỉ trọng}_i = \\frac{\\text{Giá trị thành phần}_i}{\\text{Tổng số}} \\times 100 \\quad (\\%)`,
      inputs: [
        {
          key: "part_val",
          label: "Giá trị thành phần",
          defaultVal: 3512.4,
          units: [{ label: "Đơn vị bất kỳ", factor: 1, latexMult: "" }]
        },
        {
          key: "total_val",
          label: "Tổng số toàn ngành / cả nước",
          defaultVal: 5356.7,
          units: [{ label: "Cùng đơn vị với thành phần", factor: 1, latexMult: "" }]
        }
      ],
      sampleTable: {
        title: "Sản lượng Thủy sản Nuôi trồng phân theo Vùng (Nghìn tấn)",
        headers: ["Vùng kinh tế", "Sản lượng (Nghìn tấn)", "Tỷ trọng mẫu (%)"],
        rows: [
          ["Đồng bằng sông Cửu Long", "3512.4", "65.6"],
          ["Đồng bằng sông Hồng", "874.5", "16.3"],
          ["Bắc Trung Bộ & DHNTB", "592.1", "11.1"],
          ["Cả nước (Tổng số)", "5356.7", "100.0"]
        ]
      },
      solve: (vals) => {
        const part = vals.part_val.val;
        const tot = vals.total_val.val;
        if (tot <= 0) return { error: "Tổng số phải lớn hơn 0" };

        const share = (part / tot) * 100;
        return {
          resultText: `${share.toFixed(2)}%`,
          stepsLatex: [
            `\\text{Áp dụng công thức: } \\text{Tỉ trọng} = \\frac{\\text{Thành phần}}{\\text{Tổng số}} \\times 100`,
            `= \\frac{${part}}{${tot}} \\times 100 = \\mathbf{${share.toFixed(2)}\\%}`
          ],
          note: share > 50 ? "Chiếm tỷ trọng áp đảo quá bán (>50%) trong cơ cấu toàn quốc." : "Thành phần thứ yếu trong cơ cấu."
        };
      }
    },

    // 5. Tốc độ tăng trưởng
    growth_rate: {
      id: "growth_rate",
      name: "Tốc độ tăng trưởng (%)",
      desc: "Lấy giá trị năm gốc làm mốc 100%, tính chỉ số phát triển cho các năm sau.",
      latex: `\\text{Tốc độ tăng trưởng năm } n = \\frac{X_n}{X_0} \\times 100 \\quad (\\%)`,
      inputs: [
        {
          key: "base_val",
          label: "Giá trị năm gốc (năm 0)",
          defaultVal: 100.0,
          units: [{ label: "Đơn vị bất kỳ", factor: 1, latexMult: "" }]
        },
        {
          key: "current_val",
          label: "Giá trị năm so sánh (năm n)",
          defaultVal: 162.3,
          units: [{ label: "Cùng đơn vị với năm gốc", factor: 1, latexMult: "" }]
        }
      ],
      sampleTable: {
        title: "Sản lượng Điện phát ra qua các năm",
        headers: ["Năm", "Sản lượng (Tỉ kWh)", "Tốc độ tăng trưởng (%)"],
        rows: [
          ["Năm 2015 (Năm gốc)", "159.4", "100.0"],
          ["Năm 2018", "212.9", "133.6"],
          ["Năm 2020", "235.4", "147.7"],
          ["Năm 2023", "275.9", "173.1"]
        ]
      },
      solve: (vals) => {
        const v0 = vals.base_val.val;
        const vn = vals.current_val.val;
        if (v0 <= 0) return { error: "Năm gốc phải lớn hơn 0" };

        const rate = (vn / v0) * 100;
        const diff = rate - 100;
        return {
          resultText: `${rate.toFixed(1)}% (Tăng ${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%)`,
          stepsLatex: [
            `\\text{Năm gốc quy ước: } X_0 = 100\\%`,
            `\\text{Tốc độ năm } n: \\frac{${vn}}{${v0}} \\times 100 = \\mathbf{${rate.toFixed(1)}\\%}`,
            `\\text{Tăng thêm so với năm gốc: } ${rate.toFixed(1)}\\% - 100\\% = \\mathbf{${diff.toFixed(1)}\\%}`
          ],
          note: `Sau giai đoạn so sánh, chỉ số tăng gấp ${(vn / v0).toFixed(2)} lần.`
        };
      }
    },

    // 6. Biên độ nhiệt năm
    temp_range: {
      id: "temp_range",
      name: "Biên độ nhiệt độ năm",
      desc: "Chênh lệch giữa nhiệt độ trung bình tháng nóng nhất và tháng lạnh nhất.",
      latex: `\\Delta T = T_{\\text{max}} - T_{\\text{min}} \\quad (^{\\circ}\\text{C})`,
      inputs: [
        {
          key: "max_t",
          label: "Nhiệt độ tháng cao nhất (Tmax)",
          defaultVal: 29.8,
          units: [{ label: "°C", factor: 1, latexMult: "" }]
        },
        {
          key: "min_t",
          label: "Nhiệt độ tháng thấp nhất (Tmin)",
          defaultVal: 16.4,
          units: [{ label: "°C", factor: 1, latexMult: "" }]
        }
      ],
      sampleTable: {
        title: "Nhiệt độ các trạm khí tượng tiêu biểu",
        headers: ["Trạm khí tượng", "Tháng nóng nhất (°C)", "Tháng lạnh nhất (°C)"],
        rows: [
          ["Hà Nội (Láng)", "29.8", "16.4"],
          ["Huế", "29.4", "19.7"],
          ["Đà Nẵng", "29.1", "21.3"],
          ["TP. Hồ Chí Minh (Tân Sơn Hòa)", "29.7", "26.0"]
        ]
      },
      solve: (vals) => {
        const tmax = vals.max_t.val;
        const tmin = vals.min_t.val;
        const diff = tmax - tmin;

        return {
          resultText: `${diff.toFixed(1)}°C`,
          stepsLatex: [
            `\\text{Áp dụng công thức: } \\Delta T = T_{\\text{max}} - T_{\\text{min}}`,
            `= ${tmax}^{\\circ}\\text{C} - ${tmin}^{\\circ}\\text{C} = \\mathbf{${diff.toFixed(1)}^{\\circ}\\text{C}}`
          ],
          note: diff >= 10 ? "Biên độ nhiệt lớn (>10°C), đặc trưng cho miền khí hậu phía Bắc chịu ảnh hưởng sâu sắc của gió mùa Đông Bắc." : "Biên độ nhiệt nhỏ (<5°C), đặc trưng cho miền khí hậu phía Nam nóng đều quanh năm."
        };
      }
    }
  };

  let activeFormulaId = "density";

  function init() {
    renderFormulaSelector();
    loadFormula(activeFormulaId);
  }

  function renderFormulaSelector() {
    const sel = document.getElementById("calc-formula-select");
    if (!sel) return;

    sel.innerHTML = Object.keys(FORMULAS).map(k => `
      <option value="${k}" ${k === activeFormulaId ? 'selected' : ''}>
        ${FORMULAS[k].name}
      </option>
    `).join("");

    sel.addEventListener("change", (e) => {
      loadFormula(e.target.value);
    });
  }

  function loadFormula(formulaId) {
    activeFormulaId = formulaId;
    const f = FORMULAS[formulaId];
    if (!f) return;

    // Hiển thị công thức KaTeX
    const mathDisplay = document.getElementById("calc-katex-formula");
    if (mathDisplay && window.katex) {
      katex.render(f.latex, mathDisplay, { displayMode: true, throwOnError: false });
    }

    // Render bảng số liệu mẫu (Khung trái 60%) có cơ chế Click-to-Bind
    renderSampleTable(f.sampleTable);

    // Render các ô nhập liệu (Khung phải 40%)
    renderInputs(f);

    // Tự động tính toán
    calculate();
  }

  function renderSampleTable(tbl) {
    const container = document.getElementById("calc-table-display");
    if (!container || !tbl) return;

    const headersHtml = tbl.headers.map(h => `<th class="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-center whitespace-nowrap">${h}</th>`).join("");
    const rowsHtml = tbl.rows.map(r => {
      const rowName = r[0];
      const cells = r.slice(1).map((val, cellIdx) => `
        <td 
          class="px-3 py-2 text-xs font-mono tabular-nums text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 text-center whitespace-nowrap click-to-bind" 
          title="Bấm để truyền số ${val} vào ô nhập"
          onclick="GeoCalculator.bindValueToInput(${cellIdx}, '${val}')"
        >
          ${val}
        </td>
      `).join("");
      return `<tr><td class="px-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 min-w-[140px] max-w-[220px] whitespace-normal">${rowName}</td>${cells}</tr>`;
    }).join("");

    container.innerHTML = `
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-700 dark:text-slate-300">📌 ${tbl.title}</span>
          <span class="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-semibold">Click-to-Bind: Bấm ô số để nạp</span>
        </div>
        <div class="w-full overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs">
          <table class="w-full border-collapse">
            <thead><tr>${headersHtml}</tr></thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderInputs(f) {
    const container = document.getElementById("calc-inputs-container");
    if (!container) return;

    container.innerHTML = f.inputs.map((inp, idx) => {
      const unitOptions = inp.units.map((u, uIdx) => `
        <option value="${uIdx}">${u.label}</option>
      `).join("");

      return `
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">${inp.label}:</label>
          <div class="flex space-x-2">
            <input 
              type="number" 
              step="any" 
              id="calc-input-${idx}" 
              value="${inp.defaultVal}" 
              class="w-2/3 p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 font-mono tabular-nums bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              oninput="GeoCalculator.calculate()"
            />
            <select 
              id="calc-unit-${idx}" 
              class="w-1/3 p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
              onchange="GeoCalculator.calculate()"
            >
              ${unitOptions}
            </select>
          </div>
        </div>
      `;
    }).join("");
  }

  // Cơ chế Click-to-Bind với bộ lọc số liệu thông minh (chuyển dấu phẩy thành dấu chấm)
  function bindValueToInput(inputIndex, valStr) {
    if (valStr === undefined || valStr === null) return;
    const cleanStr = valStr.toString().trim()
      .replace(/[+%]/g, '')
      .replace(/\s+/g, '')
      .replace(',', '.');
    const cleanNum = parseFloat(cleanStr);
    const validNum = isNaN(cleanNum) ? 0 : cleanNum;

    const inputEl = document.getElementById(`calc-input-${inputIndex}`);
    if (inputEl) {
      inputEl.value = validNum;
      inputEl.classList.add("ring-2", "ring-blue-500", "bg-blue-50");
      setTimeout(() => inputEl.classList.remove("ring-2", "ring-blue-500", "bg-blue-50"), 800);
      calculate();
    }
  }

  function calculate() {
    const f = FORMULAS[activeFormulaId];
    if (!f) return;

    const collectedVals = {};
    const inputs = f.inputs || [];
    inputs.forEach((inp, idx) => {
      const inputEl = document.getElementById(`calc-input-${idx}`);
      const rawVal = inputEl ? inputEl.value : "";
      const parsedVal = parseFloat(String(rawVal).replace(',', '.'));
      const val = isNaN(parsedVal) ? 0 : parsedVal;

      const unitSelect = document.getElementById(`calc-unit-${idx}`);
      const unitIdx = unitSelect ? parseInt(unitSelect.value) || 0 : 0;
      collectedVals[inp.key] = {
        val: val,
        unitObj: inp.units?.[unitIdx] || inp.units?.[0] || { factor: 1, latexMult: "" }
      };
    });

    const res = f.solve(collectedVals);
    renderResults(res);
  }

  function renderResults(res) {
    const box = document.getElementById("calc-result-display");
    if (!box) return;

    if (res.error) {
      box.innerHTML = `<div class="card-pedagogical-critique p-3.5 rounded-xl text-xs font-semibold">⚠️ ${res.error}</div>`;
      return;
    }

    const stepsHtml = res.stepsLatex.map(s => {
      const div = document.createElement("div");
      div.className = "overflow-x-auto py-1";
      katex.render(s, div, { displayMode: true, throwOnError: false });
      return div.outerHTML;
    }).join("");

    box.innerHTML = `
      <div class="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500">Kết quả tính toán</span>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">Chuẩn THPT</span>
        </div>

        <div class="text-center py-1">
          <div class="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono tabular-nums tracking-tight">
            ${res.resultText}
          </div>
        </div>

        <!-- Các bước giải KaTeX với hệ số nhân tường minh -->
        <div class="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700 space-y-1 text-xs overflow-x-auto">
          ${stepsHtml}
        </div>

        ${res.note ? `
          <div class="card-pedagogical-warning p-3 rounded-lg text-xs leading-relaxed">
            <strong>Nhận xét địa lý:</strong> ${res.note}
          </div>
        ` : ''}
      </div>
    `;
  }

  return {
    init,
    calculate,
    bindValueToInput
  };
})();

window.GeoCalculator = GeoCalculator;
