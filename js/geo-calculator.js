/**
 * GeoAtlas Interactive - Geographic Calculator Engine v2.0 (Phân hệ 3)
 * Full 10 Core High-School Geography Formulas:
 * 1. density: Mật độ dân số
 * 2. natural_increase: Tỉ lệ gia tăng tự nhiên
 * 3. crop_yield: Năng suất cây trồng
 * 4. per_capita: Bình quân lương thực / GDP đầu người
 * 5. trade_balance: Cán cân XNK & Tỉ lệ xuất/nhập
 * 6. trade_system: Hệ phương trình tìm Xuất khẩu & Nhập khẩu từ Tổng và Cán cân
 * 7. structure_share: Tỷ trọng cơ cấu % & nhận xét chuyển dịch
 * 8. growth_rate: Tốc độ tăng trưởng % (năm gốc 100%)
 * 9. climate_stats: Thống kê khí hậu (Biên độ nhiệt năm & Phân loại Bắc/Nam)
 * 10. map_scale_timezone: Khoảng cách tỷ lệ bản đồ & Múi giờ quốc tế
 * 
 * Features:
 * - 1-Click "Nạp Ví Dụ Mẫu" for all 10 formulas
 * - Click-to-Bind Interactive Sample Tables
 * - Multi-unit conversion with explicit KaTeX multipliers
 * - Step-by-step KaTeX solutions
 */

const GeoCalculator = (function () {
  const FORMULAS = {
    // 1. Mật độ dân số
    density: {
      id: "density",
      name: "1. Mật độ dân số",
      desc: "Số dân cư trú trên một đơn vị diện tích lãnh thổ.",
      latex: `\\text{Mật độ dân số} = \\frac{\\text{Dân số (người)}}{\\text{Diện tích (km}^2\\text{)}} \\quad (\\text{người/km}^2)`,
      inputs: [
        {
          key: "population",
          label: "Dân số",
          defaultVal: 23.2,
          units: [
            { label: "Triệu người", factor: 1000000, latexMult: "\\times 10^6" },
            { label: "Nghìn người", factor: 1000, latexMult: "\\times 1000" },
            { label: "Người", factor: 1, latexMult: "" }
          ]
        },
        {
          key: "area",
          label: "Diện tích",
          defaultVal: 21.3,
          units: [
            { label: "Nghìn km²", factor: 1000, latexMult: "\\times 1000" },
            { label: "km²", factor: 1, latexMult: "" },
            { label: "ha (hecta)", factor: 0.01, latexMult: "\\div 100" }
          ]
        }
      ],
      sampleTable: {
        title: "Dân số & Diện tích các Vùng Kinh tế Việt Nam (Niên giám 2024)",
        headers: ["Vùng kinh tế", "Dân số (Triệu người)", "Diện tích (Nghìn km²)"],
        rows: [
          ["Đồng bằng sông Hồng", "23.2", "21.3"],
          ["Trung du & MN Bắc Bộ", "12.9", "95.2"],
          ["Bắc Trung Bộ & DHMT", "20.6", "95.8"],
          ["Tây Nguyên", "6.1", "54.5"],
          ["Đông Nam Bộ", "18.8", "23.6"],
          ["Đồng bằng sông Cửu Long", "17.4", "40.9"]
        ]
      },
      solve: (vals) => {
        const popExact = vals.population.val * vals.population.unitObj.factor;
        const areaExact = vals.area.val * vals.area.unitObj.factor;
        if (areaExact <= 0) return { error: "Diện tích phải lớn hơn 0" };

        const density = popExact / areaExact;
        return {
          resultText: `${Math.round(density).toLocaleString()} người/km²`,
          stepsLatex: [
            `\\text{Bước 1: Quy đổi Dân số} = ${vals.population.val} ${vals.population.unitObj.latexMult} = ${popExact.toLocaleString()} \\text{ người}`,
            `\\text{Bước 2: Quy đổi Diện tích} = ${vals.area.val} ${vals.area.unitObj.latexMult} = ${areaExact.toLocaleString()} \\text{ km}^2`,
            `\\text{Bước 3: Mật độ} = \\frac{${popExact.toLocaleString()}}{${areaExact.toLocaleString()}} = ${density.toFixed(2)} \\approx \\mathbf{${Math.round(density).toLocaleString()} \\text{ người/km}^2}`
          ],
          note: density > 1000 ? "Mật độ rất cao (đặc trưng châu thổ sông Hồng hoặc vùng đô thị lớn)." : "Mật độ phản ánh phân bố dân cư theo điều kiện tự nhiên."
        };
      }
    },

    // 2. Tỉ lệ gia tăng tự nhiên
    natural_increase: {
      id: "natural_increase",
      name: "2. Tỉ lệ gia tăng dân số tự nhiên",
      desc: "Chênh lệch giữa tỉ suất sinh thô và tỉ suất tử thô trong năm.",
      latex: `T_g = \\frac{\\text{Sinh (\\textperthousand)} - \\text{Tử (\\textperthousand)}}{10} \\quad (\\%)`,
      inputs: [
        {
          key: "birth_rate",
          label: "Tỉ suất sinh thô (‰)",
          defaultVal: 15.2,
          units: [{ label: "‰ (phần nghìn)", factor: 1, latexMult: "" }]
        },
        {
          key: "death_rate",
          label: "Tỉ suất tử thô (‰)",
          defaultVal: 6.1,
          units: [{ label: "‰ (phần nghìn)", factor: 1, latexMult: "" }]
        }
      ],
      sampleTable: {
        title: "Tỉ suất Sinh và Tử thô Việt Nam qua các năm",
        headers: ["Năm", "Tỉ suất sinh thô (‰)", "Tỉ suất tử thô (‰)"],
        rows: [
          ["Năm 2015", "16.2", "6.8"],
          ["Năm 2018", "15.7", "6.5"],
          ["Năm 2021", "15.4", "6.3"],
          ["Năm 2024", "15.2", "6.1"]
        ]
      },
      solve: (vals) => {
        const birth = vals.birth_rate.val;
        const death = vals.death_rate.val;
        const tg = (birth - death) / 10;
        return {
          resultText: `${tg.toFixed(2)}%`,
          stepsLatex: [
            `\\text{Hiệu số sinh tử (\\textperthousand)} = ${birth} - ${death} = ${(birth - death).toFixed(1)}\\textperthousand`,
            `\\text{Đổi sang phần trăm (\\%): } T_g = \\frac{${birth} - ${death}}{10} = \\mathbf{${tg.toFixed(2)}\\%}`
          ],
          note: tg < 1.0 ? "Gia tăng dân số đã giảm xuống dưới 1.0%/năm, khẳng định thành tựu kế hoạch hóa gia đình." : "Tỉ lệ gia tăng dân số ở mức trung bình."
        };
      }
    },

    // 3. Năng suất cây trồng
    crop_yield: {
      id: "crop_yield",
      name: "3. Năng suất cây trồng",
      desc: "Sản lượng thu hoạch trên một đơn vị diện tích gieo trồng.",
      latex: `\\text{Năng suất} = \\frac{\\text{Sản lượng (tạ)}}{\\text{Diện tích (ha)}} \\quad (\\text{tạ/ha})`,
      inputs: [
        {
          key: "production",
          label: "Sản lượng lúa / cây trồng",
          defaultVal: 43.5,
          units: [
            { label: "Triệu tấn", factor: 10000000, latexMult: "\\times 10^7 \\text{ tạ}" },
            { label: "Nghìn tấn", factor: 10000, latexMult: "\\times 10^4 \\text{ tạ}" },
            { label: "Tấn", factor: 10, latexMult: "\\times 10 \\text{ tạ}" },
            { label: "Tạ", factor: 1, latexMult: "" }
          ]
        },
        {
          key: "crop_area",
          label: "Diện tích gieo trồng",
          defaultVal: 7.12,
          units: [
            { label: "Triệu ha", factor: 1000000, latexMult: "\\times 10^6 \\text{ ha}" },
            { label: "Nghìn ha", factor: 1000, latexMult: "\\times 1000 \\text{ ha}" },
            { label: "ha", factor: 1, latexMult: "" }
          ]
        }
      ],
      sampleTable: {
        title: "Diện tích & Sản lượng Lúa cả nước và các Vùng Trọng điểm (2024)",
        headers: ["Địa phương / Vùng", "Sản lượng (Triệu tấn)", "Diện tích (Triệu ha)"],
        rows: [
          ["Cả nước", "43.5", "7.12"],
          ["Đồng bằng sông Cửu Long", "24.1", "3.82"],
          ["Đồng bằng sông Hồng", "6.2", "0.98"],
          ["Bắc Trung Bộ & DHMT", "5.1", "0.95"]
        ]
      },
      solve: (vals) => {
        const prodExactTạ = vals.production.val * vals.production.unitObj.factor;
        const areaExactHa = vals.crop_area.val * vals.crop_area.unitObj.factor;
        if (areaExactHa <= 0) return { error: "Diện tích phải lớn hơn 0" };

        const yieldTaHa = prodExactTạ / areaExactHa;
        const yieldTanHa = yieldTaHa / 10;
        return {
          resultText: `${yieldTaHa.toFixed(1)} tạ/ha (${yieldTanHa.toFixed(2)} tấn/ha)`,
          stepsLatex: [
            `\\text{Bước 1: Quy đổi Sản lượng ra tạ} = ${vals.production.val} ${vals.production.unitObj.latexMult} = ${prodExactTạ.toLocaleString()} \\text{ tạ}`,
            `\\text{Bước 2: Quy đổi Diện tích ra ha} = ${vals.crop_area.val} ${vals.crop_area.unitObj.latexMult} = ${areaExactHa.toLocaleString()} \\text{ ha}`,
            `\\text{Bước 3: Năng suất} = \\frac{${prodExactTạ.toLocaleString()}}{${areaExactHa.toLocaleString()}} = \\mathbf{${yieldTaHa.toFixed(1)} \\text{ tạ/ha}} = \\mathbf{${yieldTanHa.toFixed(2)} \\text{ tấn/ha}}`
          ],
          note: yieldTaHa > 60 ? "Năng suất cao vượt trội (áp dụng giống lúa thuần chất lượng cao và thâm canh tốt)." : "Năng suất đạt mức trung bình cả nước."
        };
      }
    },

    // 4. Bình quân Lương thực / GDP đầu người
    per_capita: {
      id: "per_capita",
      name: "4. Bình quân Lương thực / GDP đầu người",
      desc: "Mức hưởng thụ sản lượng hoặc giá trị kinh tế trung bình trên mỗi cá nhân.",
      latex: `\\text{Bình quân} = \\frac{\\text{Tổng sản lượng (hoặc GDP)}}{\\text{Dân số}} \\quad (\\text{kg/người hoặc USD/người})`,
      inputs: [
        {
          key: "total_amount",
          label: "Tổng sản lượng (hoặc GDP)",
          defaultVal: 43.5,
          units: [
            { label: "Triệu tấn (lương thực)", factor: 1000000000, latexMult: "\\times 10^9 \\text{ kg}" },
            { label: "Nghìn tấn", factor: 1000000, latexMult: "\\times 10^6 \\text{ kg}" },
            { label: "Tỷ USD (GDP)", factor: 1000000000, latexMult: "\\times 10^9 \\text{ USD}" },
            { label: "Triệu USD (GDP)", factor: 1000000, latexMult: "\\times 10^6 \\text{ USD}" }
          ]
        },
        {
          key: "population",
          label: "Dân số",
          defaultVal: 100.3,
          units: [
            { label: "Triệu người", factor: 1000000, latexMult: "\\times 10^6" },
            { label: "Nghìn người", factor: 1000, latexMult: "\\times 1000" },
            { label: "Người", factor: 1, latexMult: "" }
          ]
        }
      ],
      sampleTable: {
        title: "Sản lượng Lúa & Dân số Việt Nam qua các năm",
        headers: ["Năm", "Sản lượng lúa (Triệu tấn)", "Dân số (Triệu người)"],
        rows: [
          ["Năm 2018", "44.0", "94.7"],
          ["Năm 2020", "42.8", "97.6"],
          ["Năm 2022", "42.7", "99.5"],
          ["Năm 2024", "43.5", "100.3"]
        ]
      },
      solve: (vals) => {
        const prodExact = vals.total_amount.val * vals.total_amount.unitObj.factor;
        const popExact = vals.population.val * vals.population.unitObj.factor;
        if (popExact <= 0) return { error: "Dân số phải lớn hơn 0" };

        const bq = prodExact / popExact;
        const unitName = vals.total_amount.unitObj.label.includes("USD") ? "USD/người/năm" : "kg/người/năm";
        return {
          resultText: `${bq.toFixed(1)} ${unitName}`,
          stepsLatex: [
            `\\text{Bước 1: Quy đổi Đại lượng} = ${vals.total_amount.val} ${vals.total_amount.unitObj.latexMult} = ${prodExact.toLocaleString()}`,
            `\\text{Bước 2: Quy đổi Dân số} = ${vals.population.val} ${vals.population.unitObj.latexMult} = ${popExact.toLocaleString()}`,
            `\\text{Bước 3: Bình quân} = \\frac{${prodExact.toLocaleString()}}{${popExact.toLocaleString()}} = \\mathbf{${bq.toFixed(1)} \\text{ ${unitName}}}`
          ],
          note: bq > 400 ? "Mức bình quân vững chắc vượt chuẩn an ninh lương thực quốc gia." : "Cần tiếp tục mở rộng quy mô kinh tế."
        };
      }
    },

    // 5. Cán cân XNK & Tỉ lệ Xuất/Nhập
    trade_balance: {
      id: "trade_balance",
      name: "5. Cán cân XNK & Tỉ lệ Xuất/Nhập",
      desc: "Xác định chênh lệch thương mại và tỉ lệ độ mở xuất khẩu so với nhập khẩu.",
      latex: `\\text{Cán cân} = X - M \\quad | \\quad \\text{Tỉ lệ X/M} = \\frac{X}{M} \\times 100 \\quad (\\%)`,
      inputs: [
        {
          key: "export_val",
          label: "Giá trị Xuất khẩu (X)",
          defaultVal: 395.0,
          units: [{ label: "Tỷ USD", factor: 1, latexMult: "" }]
        },
        {
          key: "import_val",
          label: "Giá trị Nhập khẩu (M)",
          defaultVal: 368.0,
          units: [{ label: "Tỷ USD", factor: 1, latexMult: "" }]
        }
      ],
      sampleTable: {
        title: "Kim ngạch Xuất Khẩu & Nhập Khẩu Việt Nam (2018 - 2024)",
        headers: ["Năm", "Xuất khẩu (Tỷ USD)", "Nhập khẩu (Tỷ USD)"],
        rows: [
          ["Năm 2018", "243.7", "236.9"],
          ["Năm 2020", "281.4", "261.3"],
          ["Năm 2022", "371.3", "358.9"],
          ["Năm 2024", "395.0", "368.0"]
        ]
      },
      solve: (vals) => {
        const x = vals.export_val.val;
        const m = vals.import_val.val;
        const balance = x - m;
        const ratio = m > 0 ? (x / m) * 100 : 0;
        const status = balance >= 0 ? `Xuất siêu (Thặng dư) +${balance.toFixed(2)} tỷ USD` : `Nhập siêu (Thâm hụt) ${balance.toFixed(2)} tỷ USD`;

        return {
          resultText: `${status} (Tỉ lệ X/M: ${ratio.toFixed(1)}%)`,
          stepsLatex: [
            `\\text{Cán cân thương mại: } B = X - M = ${x} - ${m} = \\mathbf{${balance >= 0 ? '+' : ''}${balance.toFixed(2)} \\text{ tỷ USD}}`,
            `\\text{Tỉ lệ Xuất/Nhập: } \\frac{X}{M} \\times 100 = \\frac{${x}}{${m}} \\times 100 = \\mathbf{${ratio.toFixed(1)}\\%}`
          ],
          note: balance >= 0 ? "Nước ta duy trì xuất siêu vững chắc, tăng cường dự trữ ngoại hối quốc gia." : "Cần kiểm soát nhập khẩu hàng hóa tiêu dùng không thiết yếu."
        };
      }
    },

    // 6. Hệ phương trình tìm X và M
    trade_system: {
      id: "trade_system",
      name: "6. Tìm Xuất khẩu (X) & Nhập khẩu (M)",
      desc: "Bài toán ngược: Tìm giá trị X và M khi đề bài cho Tổng kim ngạch (T) và Cán cân (B).",
      latex: `\\begin{cases} X + M = T \\\\ X - M = B \\end{cases} \\implies X = \\frac{T + B}{2}, \\quad M = \\frac{T - B}{2}`,
      inputs: [
        {
          key: "total_turnover",
          label: "Tổng kim ngạch XNK (T = X + M)",
          defaultVal: 763.0,
          units: [{ label: "Tỷ USD", factor: 1, latexMult: "" }]
        },
        {
          key: "balance_val",
          label: "Cán cân thương mại (B = X - M)",
          defaultVal: 27.0,
          units: [{ label: "Tỷ USD (dấu + là xuất siêu, dấu - là nhập siêu)", factor: 1, latexMult: "" }]
        }
      ],
      sampleTable: {
        title: "Tổng kim ngạch & Cán cân Thương mại Việt Nam qua các năm",
        headers: ["Năm", "Tổng kim ngạch T (Tỷ USD)", "Cán cân thương mại B (Tỷ USD)"],
        rows: [
          ["Năm 2020", "544.1", "+19.9"],
          ["Năm 2022", "730.2", "+12.4"],
          ["Năm 2023", "683.0", "+28.0"],
          ["Năm 2024", "763.0", "+27.0"]
        ]
      },
      solve: (vals) => {
        const t = vals.total_turnover.val;
        const b = vals.balance_val.val;
        const x = (t + b) / 2;
        const m = (t - b) / 2;

        return {
          resultText: `Xuất khẩu (X) = ${x.toFixed(2)} tỷ USD | Nhập khẩu (M) = ${m.toFixed(2)} tỷ USD`,
          stepsLatex: [
            `\\text{Hệ phương trình: } \\begin{cases} X + M = ${t} \\\\ X - M = ${b} \\end{cases}`,
            `\\text{Tính Xuất khẩu: } X = \\frac{T + B}{2} = \\frac{${t} + (${b})}{2} = \\mathbf{${x.toFixed(2)} \\text{ tỷ USD}}`,
            `\\text{Tính Nhập khẩu: } M = \\frac{T - B}{2} = \\frac{${t} - (${b})}{2} = \\mathbf{${m.toFixed(2)} \\text{ tỷ USD}}`
          ],
          note: "Dạng bài tập tính toán trọng điểm hay xuất hiện trong Đề thi Tốt nghiệp THPT môn Địa lý."
        };
      }
    },

    // 7. Tỷ trọng cơ cấu (%) & Mức độ chuyển dịch cơ cấu (điểm %)
    structure_share: {
      id: "structure_share",
      name: "7. Tỷ trọng cơ cấu (%) & Chuyển dịch (điểm %)",
      desc: "Tính tỉ trọng phần trăm của bộ phận trong tổng thể và xác định mức độ chuyển dịch cơ cấu (điểm %) giữa 2 năm.",
      latex: `\\text{Tỉ trọng} = \\frac{A_i}{\\text{Tổng}} \\times 100\\% \\quad | \\quad \\Delta = \\%_{T2} - \\%_{T1} \\quad (\\text{điểm \\%})`,
      inputs: [
        {
          key: "part_val_1",
          label: "Giá trị thành phần Năm 1 (A1)",
          defaultVal: 63.2,
          units: [{ label: "Đơn vị bất kỳ", factor: 1, latexMult: "" }]
        },
        {
          key: "total_val_1",
          label: "Tổng số Năm 1 (T1)",
          defaultVal: 193.2,
          units: [{ label: "Cùng đơn vị với thành phần", factor: 1, latexMult: "" }]
        },
        {
          key: "part_val_2",
          label: "Giá trị thành phần Năm 2 (A2 - so sánh)",
          defaultVal: 158.4,
          units: [{ label: "Cùng đơn vị với Năm 1", factor: 1, latexMult: "" }]
        },
        {
          key: "total_val_2",
          label: "Tổng số Năm 2 (T2 - so sánh)",
          defaultVal: 430.0,
          units: [{ label: "Cùng đơn vị với Năm 1", factor: 1, latexMult: "" }]
        }
      ],
      sampleTable: {
        title: "Chuyển dịch Cơ cấu GDP theo Ngành kinh tế Việt Nam (2015 - 2024)",
        headers: ["Ngành kinh tế", "A1 (Năm 2015)", "T1 (Tổng 2015)", "A2 (Năm 2024)", "T2 (Tổng 2024)"],
        rows: [
          ["Công nghiệp & Xây dựng", "63.2", "193.2", "158.4", "430.0"],
          ["Dịch vụ", "76.8", "193.2", "182.8", "430.0"],
          ["Nông, lâm, thủy sản", "33.6", "193.2", "50.8", "430.0"],
          ["Nuôi trồng thủy sản", "3512.4", "5356.7", "3512.4", "5356.7"]
        ]
      },
      solve: (vals) => {
        const p1 = vals.part_val_1.val;
        const t1 = vals.total_val_1.val;
        const p2 = vals.part_val_2.val;
        const t2 = vals.total_val_2.val;

        if (t1 <= 0) return { error: "Tổng số Năm 1 phải lớn hơn 0" };

        const share1 = (p1 / t1) * 100;
        const hasYear2 = t2 > 0;
        const share2 = hasYear2 ? (p2 / t2) * 100 : share1;
        const delta = share2 - share1;

        if (!hasYear2 || (p1 === p2 && t1 === t2)) {
          return {
            resultText: `Tỉ trọng = ${share1.toFixed(2)}%`,
            stepsLatex: [
              `\\text{Tỉ trọng} = \\frac{\\text{Thành phần A}}{\\text{Tổng số T}} \\times 100 = \\frac{${p1}}{${t1}} \\times 100 = \\mathbf{${share1.toFixed(2)}\\%}`
            ],
            note: share1 > 50 ? "Chiếm tỷ trọng áp đảo (>50%) trong cơ cấu tổng thể." : "Thành phần cấu thành trong cơ cấu ngành."
          };
        }

        const dirText = delta > 0 ? `tăng +${delta.toFixed(2)} điểm %` : (delta < 0 ? `giảm ${delta.toFixed(2)} điểm %` : "không đổi (0 điểm %)");

        return {
          resultText: `Năm 1: ${share1.toFixed(2)}% | Năm 2: ${share2.toFixed(2)}% => Chuyển dịch: ${dirText}`,
          stepsLatex: [
            `\\text{Bước 1 (Tỉ trọng Năm 1): } \\%_1 = \\frac{${p1}}{${t1}} \\times 100 = \\mathbf{${share1.toFixed(2)}\\%}`,
            `\\text{Bước 2 (Tỉ trọng Năm 2): } \\%_2 = \\frac{${p2}}{${t2}} \\times 100 = \\mathbf{${share2.toFixed(2)}\\%}`,
            `\\text{Bước 3 (Mức độ chuyển dịch cơ cấu): } \\Delta = \\%_2 - \\%_1 = ${share2.toFixed(2)}\\% - ${share1.toFixed(2)}\\% = \\mathbf{${delta >= 0 ? '+' : ''}${delta.toFixed(2)} \\text{ điểm \\%}}`
          ],
          note: `Lưu ý chuẩn SGK & Đề thi THPT: Đơn vị của chuyển dịch cơ cấu luôn là "điểm phần trăm" (điểm %), tuyệt đối không nhầm lẫn với "tốc độ tăng trưởng (%)".`
        };
      }
    },

    // 8. Tốc độ tăng trưởng (%)
    growth_rate: {
      id: "growth_rate",
      name: "8. Tốc độ tăng trưởng (%)",
      desc: "Lấy giá trị năm gốc làm mốc 100%, tính chỉ số phát triển cho các năm sau.",
      latex: `\\text{Tốc độ tăng trưởng năm } n = \\frac{X_n}{X_0} \\times 100 \\quad (\\%)`,
      inputs: [
        {
          key: "base_val",
          label: "Giá trị năm gốc (X0)",
          defaultVal: 159.4,
          units: [{ label: "Đơn vị bất kỳ", factor: 1, latexMult: "" }]
        },
        {
          key: "current_val",
          label: "Giá trị năm so sánh (Xn)",
          defaultVal: 275.9,
          units: [{ label: "Cùng đơn vị với năm gốc", factor: 1, latexMult: "" }]
        }
      ],
      sampleTable: {
        title: "Sản lượng Điện phát ra của nước ta qua các năm",
        headers: ["Năm", "Sản lượng (Tỉ kWh)", "Tốc độ tăng trưởng (%)"],
        rows: [
          ["Năm 2015 (Gốc)", "159.4", "100.0"],
          ["Năm 2018", "212.9", "133.6"],
          ["Năm 2020", "235.4", "147.7"],
          ["Năm 2024", "275.9", "173.1"]
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
            `\\text{Năm gốc: } X_0 = 100\\%`,
            `\\text{Tốc độ năm } n = \\frac{${vn}}{${v0}} \\times 100 = \\mathbf{${rate.toFixed(1)}\\%}`,
            `\\text{Tăng trưởng ròng: } ${rate.toFixed(1)}\\% - 100\\% = \\mathbf{${diff.toFixed(1)}\\%} \\quad (\\times ${(vn/v0).toFixed(2)} \\text{ lần})`
          ],
          note: `Chỉ số sau giai đoạn so sánh tăng gấp ${(vn / v0).toFixed(2)} lần.`
        };
      }
    },

    // 9. Thống kê Khí hậu: Biên độ nhiệt, Ttb & Lượng mưa
    climate_stats: {
      id: "climate_stats",
      name: "9. Thống kê Khí hậu & Biên độ nhiệt",
      desc: "Tính biên độ nhiệt năm (ΔT), nhiệt độ trung bình năm (Ttb), tổng lượng mưa và phân loại miền khí hậu Bắc/Nam.",
      latex: `\\Delta T = T_{\\text{max}} - T_{\\text{min}} \\quad | \\quad T_{\\text{tb}} \\quad (^{\\circ}\\text{C}) \\quad | \\quad \\text{Lượng mưa (mm)}`,
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
        },
        {
          key: "avg_t",
          label: "Nhiệt độ trung bình năm (Ttb)",
          defaultVal: 23.9,
          units: [{ label: "°C", factor: 1, latexMult: "" }]
        },
        {
          key: "rainfall",
          label: "Tổng lượng mưa cả năm",
          defaultVal: 1680,
          units: [
            { label: "mm", factor: 1, latexMult: "" },
            { label: "m (mét)", factor: 1000, latexMult: "\\times 1000 \\text{ mm}" }
          ]
        }
      ],
      sampleTable: {
        title: "Đặc trưng Khí hậu 4 Trạm Tiêu biểu (Atlat Trang 9)",
        headers: ["Trạm khí tượng", "Tmax (°C)", "Tmin (°C)", "Ttb (°C)", "Lượng mưa (mm)"],
        rows: [
          ["Hà Nội (Láng)", "29.8", "16.4", "23.9", "1680"],
          ["Huế", "29.4", "19.7", "25.1", "2868"],
          ["Đà Nẵng", "29.1", "21.3", "25.7", "2044"],
          ["TP. Hồ Chí Minh", "29.7", "26.0", "27.1", "1930"]
        ]
      },
      solve: (vals) => {
        const tmax = vals.max_t.val;
        const tmin = vals.min_t.val;
        const avgt = vals.avg_t.val;
        const rainExact = vals.rainfall.val * vals.rainfall.unitObj.factor;
        const deltaT = tmax - tmin;

        let classification = "";
        let regionTag = "";
        if (deltaT >= 9.0 || tmin < 18.0) {
          regionTag = "Miền Bắc";
          classification = "Miền khí hậu phía Bắc (đặc trưng biên độ nhiệt lớn ≥ 9°C, có mùa đông lạnh với tháng lạnh < 18°C do gió mùa Đông Bắc).";
        } else if (deltaT <= 5.0 && tmin >= 20.0) {
          regionTag = "Miền Nam";
          classification = "Miền khí hậu phía Nam (đặc trưng cận xích đạo gió mùa, biên độ nhiệt nhỏ ≤ 5°C, nhiệt độ cao đều quanh năm, không có mùa đông lạnh).";
        } else {
          regionTag = "Trung Bộ";
          classification = "Vùng Duyên hải miền Trung (chuyển tiếp, mưa thu đông đặc biệt lớn do gió mùa Đông Bắc kết hợp địa hình chắn gió Trường Sơn và bão).";
        }

        return {
          resultText: `Biên độ nhiệt: ${deltaT.toFixed(1)}°C | Ttb: ${avgt.toFixed(1)}°C | Mưa: ${rainExact.toLocaleString()} mm (${regionTag})`,
          stepsLatex: [
            `\\text{Bước 1 (Biên độ nhiệt năm): } \\Delta T = T_{\\text{max}} - T_{\\text{min}} = ${tmax} - ${tmin} = \\mathbf{${deltaT.toFixed(1)}^{\\circ}\\text{C}}`,
            `\\text{Bước 2 (Nhiệt độ TB năm): } T_{\\text{tb}} = \\mathbf{${avgt.toFixed(1)}^{\\circ}\\text{C}}`,
            `\\text{Bước 3 (Tổng lượng mưa cả năm): } = \\mathbf{${rainExact.toLocaleString()} \\text{ mm}}`,
            `\\text{Kết luận phân loại: } \\mathbf{${regionTag}} \\text{ - } ${classification}`
          ],
          note: classification
        };
      }
    },

    // 10. Khoảng cách Tỷ lệ bản đồ & Múi giờ quốc tế
    map_scale_timezone: {
      id: "map_scale_timezone",
      name: "10. Khoảng cách Bản đồ & Múi giờ",
      desc: "Quy đổi khoảng cách thực địa từ tỷ lệ bản đồ Atlat (1:6.000.000) và tính giờ quốc tế.",
      latex: `D_{\\text{km}} = d_{\\text{cm}} \\times \\frac{\\text{Mẫu số tỷ lệ}}{100.000} \\quad | \\quad T_B = T_A + (M_B - M_A)`,
      inputs: [
        {
          key: "map_distance_cm",
          label: "Khoảng cách đo trên bản đồ (cm)",
          defaultVal: 4.5,
          units: [{ label: "cm trên bản đồ", factor: 1, latexMult: "" }]
        },
        {
          key: "map_scale_den",
          label: "Mẫu số tỷ lệ bản đồ",
          defaultVal: 6000000,
          units: [
            { label: "1 : 6.000.000 (Atlat chuẩn)", factor: 1, latexMult: "" },
            { label: "1 : 3.000.000", factor: 1, latexMult: "" },
            { label: "1 : 1.000.000", factor: 1, latexMult: "" }
          ]
        }
      ],
      sampleTable: {
        title: "Tỷ lệ Bản đồ Atlat & Múi giờ các Thủ đô",
        headers: ["Tuyến đo / Thành phố", "Khoảng cách trên Atlat (cm)", "Múi giờ quốc tế"],
        rows: [
          ["Hà Nội - Hải Phòng", "1.7 cm (1:6.000.000)", "Hà Nội: Múi giờ số 7 (GMT+7)"],
          ["Hà Nội - TP. Hồ Chí Minh", "19.2 cm (1:6.000.000)", "Tokyo: Múi giờ số 9 (GMT+9)"],
          ["Đà Nẵng - Quy Nhơn", "4.5 cm (1:6.000.000)", "London: Múi giờ số 0 (GMT+0)"],
          ["Cần Thơ - Cà Mau", "2.8 cm (1:6.000.000)", "New York: Múi giờ -5 (GMT-5)"]
        ]
      },
      solve: (vals) => {
        const dCm = vals.map_distance_cm.val;
        const scaleDen = vals.map_scale_den.val;
        const dKm = (dCm * scaleDen) / 100000;
        const kmPerCm = scaleDen / 100000;

        return {
          resultText: `Khoảng cách thực tế: ${dKm.toFixed(1)} km`,
          stepsLatex: [
            `\\text{Tỷ lệ } 1 : ${scaleDen.toLocaleString()} \\implies 1\\text{ cm trên bản đồ} = \\frac{${scaleDen}}{100.000} = \\mathbf{${kmPerCm} \\text{ km thực địa}}`,
            `\\text{Khoảng cách thực tế: } D = ${dCm} \\times ${kmPerCm} = \\mathbf{${dKm.toFixed(1)} \\text{ km}}`
          ],
          note: `Ở tỷ lệ Atlat 1:6.000.000, chỉ cần nhân khoảng cách đo được trên thước (cm) với 60 để ra ngay km thực địa!`
        };
      }
    }
  };

  let currentFormulaKey = "density";
  let inputValues = {};

  function init() {
    renderFormulaSelect();
    selectFormula(currentFormulaKey);
  }

  function renderFormulaSelect() {
    const sel = document.getElementById("calc-formula-select");
    if (!sel) return;

    sel.innerHTML = Object.keys(FORMULAS).map(k => `
      <option value="${k}">${FORMULAS[k].name}</option>
    `).join("");

    sel.onchange = (e) => selectFormula(e.target.value);
  }

  function selectFormula(fKey) {
    if (!FORMULAS[fKey]) fKey = "density";
    currentFormulaKey = fKey;
    const formula = FORMULAS[fKey];

    // Reset inputs to default values
    inputValues = {};
    formula.inputs.forEach(inp => {
      inputValues[inp.key] = {
        val: inp.defaultVal,
        unitIdx: 0,
        unitObj: inp.units[0]
      };
    });

    // Render KaTeX công thức toán học
    renderFormulaLatex(formula);

    // Render bảng số liệu mẫu Click-to-Bind
    renderSampleTable(formula);

    // Render các ô nhập liệu
    renderInputs(formula);

    // Tính toán kết quả
    calculateAndRender();
  }

  function renderFormulaLatex(formula) {
    const box = document.getElementById("calc-katex-formula");
    if (!box) return;

    if (window.katex) {
      try {
        katex.render(formula.latex, box, { displayMode: true, throwOnError: false });
      } catch (e) {
        box.innerText = formula.latex;
      }
    } else {
      box.innerText = formula.latex;
    }
  }

  function renderSampleTable(formula) {
    const container = document.getElementById("calc-table-display");
    if (!container || !formula.sampleTable) return;

    const t = formula.sampleTable;
    const headersHtml = t.headers.map(h => `<th class="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-center">${h}</th>`).join("");
    const rowsHtml = t.rows.map(row => {
      const cells = row.map((c, idx) => {
        const isHeaderCol = idx === 0;
        return `
          <td 
            onclick="GeoCalculator.bindSampleRow('${formula.id}', ${JSON.stringify(row).replace(/"/g, '&quot;')})"
            class="px-3 py-2 text-xs ${isHeaderCol ? 'font-semibold text-slate-900 dark:text-white text-left' : 'font-mono tabular-nums text-blue-600 dark:text-blue-400 text-center cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/40'} border-b border-slate-100 dark:border-slate-800"
            title="Bấm vào hàng này để tự động nạp số liệu vào máy tính"
          >
            ${c}
          </td>
        `;
      }).join("");
      return `<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer">${cells}</tr>`;
    }).join("");

    container.innerHTML = `
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-700 dark:text-slate-300">${t.title}</span>
          <button 
            onclick="GeoCalculator.loadDefaultSample()"
            class="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition flex items-center space-x-1"
          >
            <span>⚡ Nạp Ví Dụ Mẫu</span>
          </button>
        </div>
        <div class="w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <table class="w-full border-collapse">
            <thead><tr>${headersHtml}</tr></thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>
        <p class="text-[10px] text-slate-400 dark:text-slate-500 italic">
          💡 Mẹo: Bấm trực tiếp vào bất kỳ hàng nào trong bảng trên để nạp số liệu vào máy tính!
        </p>
      </div>
    `;
  }

  function renderInputs(formula) {
    const container = document.getElementById("calc-inputs-container");
    if (!container) return;

    container.innerHTML = formula.inputs.map(inp => {
      const current = inputValues[inp.key];
      const unitOptions = inp.units.map((u, idx) => `
        <option value="${idx}" ${idx === current.unitIdx ? 'selected' : ''}>${u.label}</option>
      `).join("");

      return `
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">${inp.label}:</label>
          <div class="flex items-center space-x-2">
            <input 
              type="number" 
              step="any"
              value="${current.val}" 
              oninput="GeoCalculator.onInputChange('${inp.key}', this.value)"
              class="flex-1 p-2 text-xs font-mono tabular-nums rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select 
              onchange="GeoCalculator.onUnitChange('${inp.key}', this.value)"
              class="p-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none shrink-0"
            >
              ${unitOptions}
            </select>
          </div>
        </div>
      `;
    }).join("");
  }

  function onInputChange(key, val) {
    if (inputValues[key]) {
      inputValues[key].val = parseFloat(val) || 0;
      calculateAndRender();
    }
  }

  function onUnitChange(key, unitIdx) {
    const formula = FORMULAS[currentFormulaKey];
    const inp = formula.inputs.find(i => i.key === key);
    if (inp && inputValues[key]) {
      inputValues[key].unitIdx = parseInt(unitIdx, 10);
      inputValues[key].unitObj = inp.units[parseInt(unitIdx, 10)];
      calculateAndRender();
    }
  }

  function loadDefaultSample() {
    const formula = FORMULAS[currentFormulaKey];
    if (formula?.sampleTable?.rows?.[0]) {
      bindSampleRow(formula.id, formula.sampleTable.rows[0]);
    }
  }

  function bindSampleRow(formulaId, row) {
    const formula = FORMULAS[formulaId];
    if (!formula || !Array.isArray(row)) return;

    if (formulaId === "density") {
      inputValues.population.val = parseFloat(row[1]) || 0;
      inputValues.area.val = parseFloat(row[2]) || 0;
    } else if (formulaId === "natural_increase") {
      inputValues.birth_rate.val = parseFloat(row[1]) || 0;
      inputValues.death_rate.val = parseFloat(row[2]) || 0;
    } else if (formulaId === "crop_yield") {
      inputValues.production.val = parseFloat(row[1]) || 0;
      inputValues.crop_area.val = parseFloat(row[2]) || 0;
    } else if (formulaId === "per_capita") {
      inputValues.total_amount.val = parseFloat(row[1]) || 0;
      inputValues.population.val = parseFloat(row[2]) || 0;
    } else if (formulaId === "trade_balance") {
      inputValues.export_val.val = parseFloat(row[1]) || 0;
      inputValues.import_val.val = parseFloat(row[2]) || 0;
    } else if (formulaId === "trade_system") {
      inputValues.total_turnover.val = parseFloat(row[1]) || 0;
      inputValues.balance_val.val = parseFloat(row[2].replace('+', '')) || 0;
    } else if (formulaId === "structure_share") {
      inputValues.part_val_1.val = parseFloat(row[1]) || 0;
      inputValues.total_val_1.val = parseFloat(row[2]) || 0;
      inputValues.part_val_2.val = parseFloat(row[3]) || 0;
      inputValues.total_val_2.val = parseFloat(row[4]) || 0;
    } else if (formulaId === "growth_rate") {
      inputValues.base_val.val = 159.4;
      inputValues.current_val.val = parseFloat(row[1]) || 0;
    } else if (formulaId === "climate_stats") {
      inputValues.max_t.val = parseFloat(row[1]) || 0;
      inputValues.min_t.val = parseFloat(row[2]) || 0;
      inputValues.avg_t.val = parseFloat(row[3]) || 0;
      inputValues.rainfall.val = parseFloat(row[4]) || 0;
    } else if (formulaId === "map_scale_timezone") {
      inputValues.map_distance_cm.val = parseFloat(row[1]) || 4.5;
    }

    renderInputs(formula);
    calculateAndRender();
  }

  function calculateAndRender() {
    const resultBox = document.getElementById("calc-result-display");
    if (!resultBox) return;

    const formula = FORMULAS[currentFormulaKey];
    const res = formula.solve(inputValues);

    if (res.error) {
      resultBox.innerHTML = `
        <div class="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
          ⚠️ ${res.error}
        </div>
      `;
      return;
    }

    let stepsHtml = "";
    if (res.stepsLatex && Array.isArray(res.stepsLatex)) {
      stepsHtml = res.stepsLatex.map((step, i) => `
        <div class="py-1 text-xs text-slate-700 dark:text-slate-300" id="step-katex-${i}"></div>
      `).join("");
    }

    resultBox.innerHTML = `
      <div class="bg-gradient-to-br from-blue-50 to-indigo-50/60 dark:from-slate-800 dark:to-slate-800/80 p-4 rounded-xl border border-blue-200 dark:border-slate-700 space-y-3 shadow-xs">
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-0.5">Kết quả tính toán:</span>
          <div class="text-base sm:text-lg font-black text-blue-900 dark:text-blue-200 font-mono tabular-nums">
            ${res.resultText}
          </div>
        </div>

        <div class="space-y-1.5 pt-2 border-t border-blue-200/60 dark:border-slate-700">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Lời giải từng bước (KaTeX):</span>
          <div class="bg-white/90 dark:bg-slate-900/90 p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1.5">
            ${stepsHtml}
          </div>
        </div>

        ${res.note ? `
          <div class="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
            <strong>Nhận xét Địa lý:</strong> ${res.note}
          </div>
        ` : ''}
      </div>
    `;

    // Render KaTeX cho từng bước giải
    if (window.katex && res.stepsLatex) {
      res.stepsLatex.forEach((step, i) => {
        const el = document.getElementById(`step-katex-${i}`);
        if (el) {
          try {
            katex.render(step, el, { throwOnError: false });
          } catch (e) {
            el.innerText = step;
          }
        }
      });
    }
  }

  return {
    init,
    selectFormula,
    onInputChange,
    onUnitChange,
    bindSampleRow,
    loadDefaultSample
  };
})();

window.GeoCalculator = GeoCalculator;
