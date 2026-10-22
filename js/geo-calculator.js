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
  // Hàm định dạng số chuẩn Việt Nam (Dấu chấm hàng nghìn, dấu phẩy thập phân)
  function formatVN(val, decimals = null) {
    if (val === null || val === undefined || val === "") return "";
    const num = Number(val);
    if (isNaN(num)) return String(val);
    let str;
    if (decimals !== null && typeof decimals === "number") {
      str = num.toFixed(decimals);
    } else {
      str = String(num);
    }
    const parts = str.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.length > 1 ? parts.join(",") : parts[0];
  }

  function formatIntVN(val) {
    return formatVN(Math.round(Number(val) || 0), 0);
  }

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
          defaultVal: 8.718,
          units: [
            { label: "Triệu người", factor: 1000000, latexMult: "\\times 10^6" },
            { label: "Nghìn người", factor: 1000, latexMult: "\\times 1000" },
            { label: "Người", factor: 1, latexMult: "" }
          ]
        },
        {
          key: "area",
          label: "Diện tích",
          defaultVal: 3.360,
          units: [
            { label: "Nghìn km²", factor: 1000, latexMult: "\\times 1000" },
            { label: "km²", factor: 1, latexMult: "" },
            { label: "ha (hecta)", factor: 0.01, latexMult: "\\div 100" }
          ]
        }
      ],
      sampleTable: {
        title: "Dân số & Diện tích một số Đơn vị Hành chính Tiêu biểu 6 Vùng Kinh tế (Chuẩn Atlat GD 2026, tr.5)",
        headers: ["Tỉnh / Thành phố", "Dân số (Triệu người)", "Diện tích (Nghìn km²)"],
        rows: [
          ["Cả nước (Năm 2024)", "100.300", "331.344"],
          ["Thành phố Hà Nội", "8.718", "3.360"],
          ["Thành phố Hồ Chí Minh (ĐNB)", "13.609", "6.773"],
          ["Tỉnh Bắc Ninh (ĐBSH - Mật độ cao nhất)", "3.509", "0.823"],
          ["Tỉnh Hưng Yên (ĐBSH)", "3.209", "2.515"],
          ["Thành phố Hải Phòng (ĐBSH)", "4.103", "3.195"],
          ["Tỉnh Ninh Bình (ĐBSH)", "3.819", "3.943"],
          ["Tỉnh Quảng Ninh (ĐBSH)", "1.397", "6.208"],
          ["Tỉnh Lai Châu (TDMNBB - Mật độ thấp nhất)", "0.496", "9.069"],
          ["Tỉnh Điện Biên (TDMNBB)", "0.657", "9.540"],
          ["Tỉnh Sơn La (TDMNBB)", "1.331", "14.109"],
          ["Tỉnh Cao Bằng (TDMNBB)", "0.559", "6.700"],
          ["Tỉnh Thanh Hoá (BTB)", "3.764", "11.115"],
          ["Tỉnh Nghệ An (BTB - Diện tích lớn nhất)", "3.472", "16.486"],
          ["Thành phố Huế", "1.179", "4.947"],
          ["Thành phố Đà Nẵng (DHNTB)", "2.820", "11.860"],
          ["Tỉnh Khánh Hoà (DHNTB)", "1.882", "8.556"],
          ["Tỉnh Đắk Lắk (Tây Nguyên)", "2.831", "18.096"],
          ["Tỉnh Lâm Đồng (Tây Nguyên)", "3.324", "24.233"],
          ["Thành phố Đồng Nai", "4.428", "12.737"],
          ["Thành phố Cần Thơ (ĐBSCL)", "3.207", "6.361"],
          ["Tỉnh An Giang (ĐBSCL)", "3.679", "9.889"],
          ["Tỉnh Cà Mau (ĐBSCL - Cực Nam)", "2.141", "7.942"]
        ]
      },
      solve: (vals) => {
        const popExact = vals.population.val * vals.population.unitObj.factor;
        const areaExact = vals.area.val * vals.area.unitObj.factor;
        if (areaExact <= 0) return { error: "Mẫu số (diện tích) phải lớn hơn 0" };

        const density = popExact / areaExact;
        return {
          resultText: `${formatIntVN(density)} người/km²`,
          stepsLatex: [
            `\\text{Bước 1: Quy đổi Dân số} = ${vals.population.val} ${vals.population.unitObj.latexMult} = ${formatIntVN(popExact)} \\text{ người}`,
            `\\text{Bước 2: Quy đổi Diện tích} = ${vals.area.val} ${vals.area.unitObj.latexMult} = ${formatIntVN(areaExact)} \\text{ km}^2`,
            `\\text{Bước 3: Mật độ} = \\frac{${formatIntVN(popExact)}}{${formatIntVN(areaExact)}} = ${density.toFixed(2)} \\approx \\mathbf{${formatIntVN(density)} \\text{ người/km}^2}`
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
        title: "Tỉ suất Sinh và Tử thô Việt Nam qua các Thời kỳ và theo Vùng (Chuẩn Atlat GD, tr.15)",
        headers: ["Thời kỳ / Vùng kinh tế", "Tỉ suất sinh thô (‰)", "Tỉ suất tử thô (‰)"],
        rows: [
          ["Cả nước Năm 1979 (Bùng nổ dân số)", "32.5", "7.3"],
          ["Cả nước Năm 1989", "30.1", "6.9"],
          ["Cả nước Năm 1999 (Kế hoạch hóa gia đình)", "19.9", "5.6"],
          ["Cả nước Năm 2009", "17.6", "6.8"],
          ["Cả nước Năm 2015", "16.2", "6.8"],
          ["Cả nước Năm 2019", "16.3", "6.3"],
          ["Cả nước Năm 2024 (Hiện nay)", "15.2", "6.1"],
          ["Vùng Tây Nguyên (Mức sinh cao)", "18.2", "6.4"],
          ["Vùng Trung du và miền núi Bắc Bộ", "17.5", "6.8"],
          ["Vùng Đồng bằng sông Hồng", "14.8", "6.2"],
          ["Vùng Đông Nam Bộ (Mức sinh thấp)", "13.9", "5.8"],
          ["Vùng Đồng bằng sông Cửu Long", "14.2", "6.0"]
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
        title: "Diện tích & Sản lượng Lúa, Ngô, Cây công nghiệp cả nước và các Vùng (Atlat GD, tr.19)",
        headers: ["Cây trồng / Vùng", "Sản lượng (Triệu tấn)", "Diện tích (Triệu ha)"],
        rows: [
          ["Lúa - Cả nước (Năm 2024)", "43.5", "7.12"],
          ["Lúa - Đồng bằng sông Cửu Long (Vựa lúa số 1)", "24.1", "3.82"],
          ["Lúa - Đồng bằng sông Hồng (Thâm canh cao)", "6.2", "0.98"],
          ["Lúa - Bắc Trung Bộ và Duyên hải miền Trung", "5.1", "0.95"],
          ["Lúa - Trung du và miền núi Bắc Bộ", "3.8", "0.65"],
          ["Lúa - Đông Nam Bộ", "1.5", "0.26"],
          ["Lúa - Tây Nguyên", "1.2", "0.22"],
          ["Ngô - Cả nước", "4.4", "0.88"],
          ["Ngô - Trung du và miền núi Bắc Bộ", "1.8", "0.39"],
          ["Ngô - Tây Nguyên", "1.2", "0.21"],
          ["Cà phê nhân - Cả nước", "1.85", "0.71"],
          ["Cà phê nhân - Tỉnh Đắk Lắk", "0.55", "0.21"],
          ["Cà phê nhân - Tỉnh Lâm Đồng (Năng suất cao)", "0.52", "0.17"],
          ["Chè búp khô - Tỉnh Thái Nguyên", "0.26", "0.022"]
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
            `\\text{Bước 1: Quy đổi Sản lượng ra tạ} = ${vals.production.val} ${vals.production.unitObj.latexMult} = ${formatIntVN(prodExactTạ)} \\text{ tạ}`,
            `\\text{Bước 2: Quy đổi Diện tích ra ha} = ${vals.crop_area.val} ${vals.crop_area.unitObj.latexMult} = ${formatIntVN(areaExactHa)} \\text{ ha}`,
            `\\text{Bước 3: Năng suất} = \\frac{${formatIntVN(prodExactTạ)}}{${formatIntVN(areaExactHa)}} = \\mathbf{${yieldTaHa.toFixed(1)} \\text{ tạ/ha}} = \\mathbf{${yieldTanHa.toFixed(2)} \\text{ tấn/ha}}`
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
        title: "Sản lượng Lúa & GRDP bình quân đầu người theo Vùng và Địa phương (Atlat GD, tr.18-19)",
        headers: ["Chỉ tiêu / Địa phương", "Sản lượng (Triệu tấn) hoặc GDP (Tỷ USD)", "Dân số (Triệu người)"],
        rows: [
          ["Lương thực cả nước Năm 1995 (Lịch sử)", "26.1", "72.0"],
          ["Lương thực cả nước Năm 2005", "39.6", "82.4"],
          ["Lương thực cả nước Năm 2015", "45.1", "91.7"],
          ["Lương thực cả nước Năm 2024 (Hiện nay)", "43.5", "100.3"],
          ["Lương thực - Đồng bằng sông Cửu Long (Vựa lúa)", "24.1", "17.5"],
          ["Lương thực - Đồng bằng sông Hồng", "6.2", "23.4"],
          ["Lương thực - Trung du và miền núi Bắc Bộ", "3.8", "12.9"],
          ["Lương thực - Vùng Đông Nam Bộ", "1.5", "18.3"],
          ["GRDP - Cả nước Năm 2024 (USD/người)", "430.0", "100.3"],
          ["GRDP - TP. Hồ Chí Minh (Đô thị đặc biệt)", "72.5", "9.50"],
          ["GRDP - Thủ đô Hà Nội", "55.4", "8.50"],
          ["GRDP - Thành phố Hải Phòng", "13.5", "2.10"],
          ["GRDP - Thành phố Đà Nẵng", "6.2", "1.25"],
          ["GRDP - Tỉnh Lai Châu (Miền núi)", "0.92", "0.496"]
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
            `\\text{Bước 1: Quy đổi Đại lượng} = ${vals.total_amount.val} ${vals.total_amount.unitObj.latexMult} = ${formatIntVN(prodExact)}`,
            `\\text{Bước 2: Quy đổi Dân số} = ${vals.population.val} ${vals.population.unitObj.latexMult} = ${formatIntVN(popExact)}`,
            `\\text{Bước 3: Bình quân} = \\frac{${formatIntVN(prodExact)}}{${formatIntVN(popExact)}} = \\mathbf{${bq.toFixed(1)} \\text{ ${unitName}}}`
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
        title: "Kim ngạch Xuất Khẩu & Nhập Khẩu Việt Nam và các Đối tác Lớn (Chuẩn Atlat GD, tr.26)",
        headers: ["Mốc thời gian / Đối tác thương mại", "Xuất khẩu (Tỷ USD)", "Nhập khẩu (Tỷ USD)"],
        rows: [
          ["Cả nước Năm 2000 (Nhập siêu)", "14.5", "15.6"],
          ["Cả nước Năm 2005", "32.4", "36.8"],
          ["Cả nước Năm 2010 (Nhập siêu đỉnh điểm)", "72.2", "84.8"],
          ["Cả nước Năm 2012 (Bắt đầu xuất siêu)", "114.6", "113.8"],
          ["Cả nước Năm 2015", "162.0", "165.8"],
          ["Cả nước Năm 2018", "243.7", "236.9"],
          ["Cả nước Năm 2020 (Thặng dư lớn)", "282.7", "262.7"],
          ["Cả nước Năm 2024 (Kỷ lục xuất siêu)", "405.5", "380.8"],
          ["Đối tác: Hoa Kỳ (Xuất siêu lớn nhất)", "115.0", "15.2"],
          ["Đối tác: Trung Quốc (Nhập siêu lớn nhất)", "61.2", "138.5"],
          ["Đối tác: Liên minh Châu Âu (EU - Xuất siêu)", "51.5", "17.2"],
          ["Đối tác: Khối ASEAN (Nhập siêu)", "36.8", "45.2"],
          ["Đối tác: Hàn Quốc (Nhập siêu linh kiện)", "25.4", "54.8"],
          ["Đối tác: Nhật Bản (Thương mại cân bằng)", "24.6", "23.8"]
        ]
      },
      solve: (vals) => {
        const x = vals.export_val.val;
        const m = vals.import_val.val;
        if (m <= 0) return { error: "Mẫu số (kim ngạch nhập khẩu M) phải lớn hơn 0 để tính tỉ lệ Xuất/Nhập" };
        const balance = x - m;
        const ratio = (x / m) * 100;
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
        title: "Tổng kim ngạch (T = X+M) & Cán cân (B = X-M) Việt Nam và Thị trường (Đồng bộ Bảng 5)",
        headers: ["Năm / Thị trường", "Tổng kim ngạch T (Tỷ USD)", "Cán cân thương mại B (Tỷ USD)"],
        rows: [
          ["Năm 2000", "30.1", "-1.1"],
          ["Năm 2005", "69.2", "-4.4"],
          ["Năm 2010", "157.0", "-12.6"],
          ["Năm 2012 (Chuyển sang xuất siêu)", "228.4", "+0.8"],
          ["Năm 2015", "327.8", "-3.8"],
          ["Năm 2018", "480.6", "+6.8"],
          ["Năm 2020", "545.4", "+20.0"],
          ["Năm 2022", "730.2", "+11.2"],
          ["Năm 2024 (Hiện nay)", "786.3", "+24.7"],
          ["Thị trường Hoa Kỳ (Năm 2024)", "130.2", "+99.8"],
          ["Thị trường Trung Quốc (Năm 2024)", "199.7", "-77.3"],
          ["Thị trường EU (Năm 2024)", "68.7", "+34.3"],
          ["Thị trường ASEAN (Năm 2024)", "82.0", "-8.4"]
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
        title: "Chuyển dịch Cơ cấu GDP, Thủy sản, Lao động & Dân số Việt Nam (2015 - 2024)",
        headers: ["Nội dung chuyển dịch cơ cấu", "A1 (Năm 2015)", "T1 (Tổng 2015)", "A2 (Năm 2024)", "T2 (Tổng 2024)"],
        rows: [
          ["GDP: Công nghiệp & Xây dựng (Tăng điểm %)", "63.2", "193.2", "158.4", "430.0"],
          ["GDP: Khu vực Dịch vụ (Tăng điểm %)", "76.8", "193.2", "182.8", "430.0"],
          ["GDP: Nông, lâm, thủy sản (Giảm điểm %)", "33.6", "193.2", "50.8", "430.0"],
          ["Thủy sản: Sản lượng nuôi trồng (Tăng mạnh)", "3512.4", "6582.1", "5420.0", "9280.0"],
          ["Thủy sản: Sản lượng khai thác biển (Giảm tỉ trọng)", "3069.7", "6582.1", "3860.0", "9280.0"],
          ["Lao động: Khu vực Nông lâm thủy sản (Giảm)", "23.1", "53.0", "14.2", "52.4"],
          ["Lao động: Khu vực Công nghiệp xây dựng (Tăng)", "12.1", "53.0", "17.5", "52.4"],
          ["Lao động: Khu vực Dịch vụ (Tăng)", "17.8", "53.0", "20.7", "52.4"],
          ["Dân số: Dân số Thành thị (Đô thị hóa tăng)", "31.1", "91.7", "38.3", "100.3"],
          ["Lâm nghiệp: Diện tích Rừng trồng (Tăng)", "3886.3", "14062.5", "4735.6", "14865.4"]
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
        title: "Tốc độ Tăng trưởng Sản lượng Điện, Than, Hàng hóa & Khách Du lịch (Năm gốc 2015 = 100%)",
        headers: ["Đối tượng / Năm", "Sản lượng thực tế", "Tốc độ tăng trưởng (%)"],
        rows: [
          ["Điện phát ra Năm 2015 (Gốc: 159.4 tỷ kWh)", "159.4", "100.0"],
          ["Điện phát ra Năm 2018", "212.9", "133.6"],
          ["Điện phát ra Năm 2020", "235.4", "147.7"],
          ["Điện phát ra Năm 2022", "259.6", "162.9"],
          ["Điện phát ra Năm 2024", "275.9", "173.1"],
          ["Than sạch Năm 2015 (Gốc: 41.7 triệu tấn)", "41.7", "100.0"],
          ["Than sạch Năm 2018", "42.4", "101.7"],
          ["Than sạch Năm 2020", "48.4", "116.1"],
          ["Than sạch Năm 2024", "49.8", "119.4"],
          ["Hàng hóa VC Năm 2015 (Gốc: 1139.4 triệu tấn)", "1139.4", "100.0"],
          ["Hàng hóa VC Năm 2018", "1528.2", "134.1"],
          ["Hàng hóa VC Năm 2021", "1621.5", "142.3"],
          ["Hàng hóa VC Năm 2024", "2350.0", "206.2"],
          ["Khách quốc tế 2015 (Gốc: 7.94 triệu lượt)", "7.94", "100.0"],
          ["Khách quốc tế Năm 2019", "18.01", "226.8"],
          ["Khách quốc tế Năm 2024", "17.50", "220.4"]
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
          defaultVal: 23.8,
          units: [{ label: "°C", factor: 1, latexMult: "" }]
        },
        {
          key: "rainfall",
          label: "Tổng lượng mưa cả năm",
          defaultVal: 1676,
          units: [
            { label: "mm", factor: 1, latexMult: "" },
            { label: "m (mét)", factor: 1000, latexMult: "\\times 1000 \\text{ mm}" }
          ]
        }
      ],
      sampleTable: {
        title: "Đặc trưng Khí hậu 15 Trạm Khí tượng Chuẩn Atlat GD (tr.8 - kèm Hoàng Sa & Trường Sa)",
        headers: ["Trạm khí tượng", "Tmax (°C)", "Tmin (°C)", "Ttb (°C)", "Lượng mưa (mm)"],
        rows: [
          ["Hà Nội (Trạm Láng - Miền Bắc)", "29.8", "16.4", "23.8", "1676"],
          ["Lạng Sơn (Đông Bắc - Mùa đông lạnh)", "27.0", "13.7", "21.2", "1311"],
          ["Tuyên Quang (Việt Bắc)", "28.7", "16.0", "23.5", "1665"],
          ["Sơn La (Tây Bắc)", "25.8", "14.6", "21.2", "1420"],
          ["Điện Biên Phủ (Thung lũng Tây Bắc)", "26.5", "16.2", "22.0", "1530"],
          ["Hà Tĩnh (Bắc Trung Bộ)", "29.7", "17.5", "24.1", "2658"],
          ["Huế (Mưa thu đông cực lớn)", "29.4", "20.0", "25.2", "2868"],
          ["Đà Nẵng (Duyên hải miền Trung)", "29.5", "21.5", "25.9", "2505"],
          ["Quy Nhơn (Nam Trung Bộ)", "30.1", "23.4", "27.1", "1852"],
          ["Nha Trang (Khánh Hoà)", "29.0", "24.1", "26.8", "1412"],
          ["Buôn Ma Thuột (Tây Nguyên)", "26.0", "21.2", "24.0", "1904"],
          ["Đà Lạt (Khí hậu ôn đới núi cao)", "19.9", "15.3", "17.9", "1739"],
          ["Hoàng Sa (Biển Đông)", "28.6", "22.0", "23.6", "2769"],
          ["Trường Sa (Biển Đông - Biên độ nhiệt nhỏ)", "29.2", "26.5", "28.0", "2666"],
          ["Tân Sơn Hoà (TP. Hồ Chí Minh)", "29.4", "26.2", "28.1", "1964"],
          ["Cần Thơ (Đồng bằng sông Cửu Long)", "28.1", "25.4", "26.9", "1674"],
          ["Cà Mau (Bán đảo Cực Nam)", "28.3", "25.4", "26.8", "2360"],
          ["Phú Quốc (Vịnh Thái Lan)", "28.5", "26.0", "27.3", "2882"]
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
          resultText: `Biên độ nhiệt: ${deltaT.toFixed(1)}°C | Ttb: ${avgt.toFixed(1)}°C | Mưa: ${formatIntVN(rainExact)} mm (${regionTag})`,
          stepsLatex: [
            `\\text{Bước 1 (Biên độ nhiệt năm): } \\Delta T = T_{\\text{max}} - T_{\\text{min}} = ${tmax} - ${tmin} = \\mathbf{${deltaT.toFixed(1)}^{\\circ}\\text{C}}`,
            `\\text{Bước 2 (Nhiệt độ TB năm): } T_{\\text{tb}} = \\mathbf{${avgt.toFixed(1)}^{\\circ}\\text{C}}`,
            `\\text{Bước 3 (Tổng lượng mưa cả năm): } = \\mathbf{${formatIntVN(rainExact)} \\text{ mm}}`,
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
        title: "Tỷ lệ Bản đồ Atlat & Múi giờ các Thủ đô Quốc tế (Chuẩn đề thi THPT)",
        headers: ["Tuyến đo trên Atlat / Thành phố quốc tế", "Khoảng cách đo (cm)", "Múi giờ quốc tế / Chênh lệch"],
        rows: [
          ["Hà Nội - Hải Phòng (Atlat tr.4-5 tỉ lệ 1:6.000.000)", "1.7", "Thực địa: 102 km"],
          ["Hà Nội - Vinh (Atlat tr.4 tỉ lệ 1:6.000.000)", "4.8", "Thực địa: 288 km"],
          ["Hà Nội - TP. Hồ Chí Minh (Đường bay chim bay)", "19.2", "Thực địa: 1.152 km"],
          ["Đà Nẵng - Quy Nhơn (Atlat tr.4-5)", "4.5", "Thực địa: 270 km"],
          ["TP. Hồ Chí Minh - Cần Thơ (Atlat tr.5)", "2.8", "Thực địa: 168 km"],
          ["Cần Thơ - Cà Mau (Atlat tr.5)", "2.5", "Thực địa: 150 km"],
          ["Bán đảo Cà Mau (Bản đồ tr.6 tỉ lệ 1:9.000.000)", "3.2", "Thực địa: 288 km"],
          ["Quần đảo Trường Sa (Atlat tr.5 tỉ lệ 1:6.000.000)", "7.5", "Thực địa: 450 km"],
          ["Hà Nội (Thủ đô Việt Nam - Mốc so sánh)", "0.0", "Múi giờ số 7 (GMT+7): 12h00 trưa"],
          ["Luân Đôn / London (Anh - Múi giờ gốc)", "0.0", "Múi giờ số 0 (GMT+0): 05h00 sáng"],
          ["Pari / Paris (Pháp) - Béc-lin (Đức)", "0.0", "Múi giờ số 1 (GMT+1): 06h00 sáng"],
          ["Mát-xcơ-va / Moscow (Nga)", "0.0", "Múi giờ số 3 (GMT+3): 08h00 sáng"],
          ["Bắc Kinh / Beijing (Trung Quốc) - Singapore", "0.0", "Múi giờ số 8 (GMT+8): 13h00 chiều"],
          ["Tô-ky-ô / Tokyo (Nhật Bản) - Xơ-un (Hàn Quốc)", "0.0", "Múi giờ số 9 (GMT+9): 14h00 chiều"],
          ["Xít-ni / Sydney (Úc)", "0.0", "Múi giờ số 10 (GMT+10): 15h00 chiều"],
          ["Niu Oóc / New York (Hoa Kỳ - Bờ Đông)", "0.0", "Múi giờ số -5 (GMT-5): 00h00 đêm"],
          ["Lốt An-giơ-lét / Los Angeles (Bờ Tây Hoa Kỳ)", "0.0", "Múi giờ số -8 (GMT-8): 21h00 tối hôm trước"]
        ]
      },
      solve: (vals) => {
        const dCm = vals.map_distance_cm.val;
        const scaleDen = vals.map_scale_den.val;
        if (scaleDen <= 0) return { error: "Mẫu số tỉ lệ bản đồ phải lớn hơn 0" };
        if (dCm < 0) return { error: "Khoảng cách đo trên bản đồ (cm) không được âm" };
        const dKm = (dCm * scaleDen) / 100000;
        const kmPerCm = scaleDen / 100000;

        return {
          resultText: `Khoảng cách thực tế: ${dKm.toFixed(1)} km`,
          stepsLatex: [
            `\\text{Tỷ lệ } 1 : ${formatIntVN(scaleDen)} \\implies 1\\text{ cm trên bản đồ} = \\frac{${scaleDen}}{100.000} = \\mathbf{${kmPerCm} \\text{ km thực địa}}`,
            `\\text{Khoảng cách thực tế: } D = ${dCm} \\times ${kmPerCm} = \\mathbf{${dKm.toFixed(1)} \\text{ km}}`
          ],
          note: `Ở tỷ lệ Atlat 1:6.000.000, chỉ cần nhân khoảng cách đo được trên thước (cm) với 60 để ra ngay km thực địa!`
        };
      }
    }
  };

  let currentFormulaKey = "density";
  let inputValues = {};
  let currentSolutionData = null;

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

  function parseVNNumber(val) {
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    if (!val) return 0;
    let clean = String(val).replace(/[\u00A0\u2009\u202F\s]/g, '').trim();
    if (clean.includes(',') && !clean.includes('.')) {
      clean = clean.replace(',', '.');
    } else if (clean.includes('.') && clean.includes(',')) {
      clean = clean.replace(/\./g, '').replace(',', '.');
    }
    const n = parseFloat(clean);
    return isNaN(n) ? 0 : n;
  }



    function formatLatexNumber(latexStr) {
    if (typeof latexStr !== "string") return latexStr;
    // Thay số thập phân a,b thành a{,}b trong LaTeX để KaTeX không tạo khoảng trống phân cách
    return latexStr.replace(/(\d+),(\d+)/g, "$1{,}$2");
  }

  function renderInputs(formula) {
    const container = document.getElementById("calc-inputs-container");
    if (!container) return;

    container.innerHTML = formula.inputs.map(inp => {
      const current = inputValues[inp.key];
      const unitOptions = inp.units.map((u, idx) => `
        <option value="${idx}" ${idx === current.unitIdx ? 'selected' : ''}>${u.label}</option>
      `).join("");

      const displayVal = current.raw !== undefined ? current.raw : current.val;

      return `
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">${inp.label}:</label>
          <div class="flex items-center space-x-2">
            <input 
              type="text" 
              inputmode="decimal"
              value="${displayVal}" 
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
      inputValues[key].val = parseVNNumber(val);
      inputValues[key].raw = val;
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
      let base = 159.4;
      const title = String(row[0] || "");
      if (title.includes("Than")) base = 41.7;
      else if (title.includes("Hàng hóa")) base = 1139.4;
      else if (title.includes("Khách")) base = 7.94;
      else if (title.includes("Điện")) base = 159.4;

      inputValues.base_val.val = base;
      inputValues.current_val.val = parseFloat(row[1]) || 0;
    } else if (formulaId === "climate_stats") {
      inputValues.max_t.val = parseFloat(row[1]) || 0;
      inputValues.min_t.val = parseFloat(row[2]) || 0;
      inputValues.avg_t.val = parseFloat(row[3]) || 0;
      inputValues.rainfall.val = parseFloat(row[4]) || 0;
    } else if (formulaId === "map_scale_timezone") {
      const d = parseFloat(row[1]) || 0;
      if (d > 0) {
        inputValues.map_distance_cm.val = d;
        if (String(row[0]).includes("1:9.000.000")) {
          inputValues.map_scale_den.val = 9000000;
        } else {
          inputValues.map_scale_den.val = 6000000;
        }
      }
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

    currentSolutionData = {
      formulaName: formula.name,
      resultText: res.resultText,
      steps: res.stepsLatex || [],
      note: res.note || ""
    };

    let stepsHtml = "";
    if (res.stepsLatex && Array.isArray(res.stepsLatex)) {
      stepsHtml = res.stepsLatex.map((step, i) => `
        <div class="py-1 text-xs text-slate-700 dark:text-slate-300" id="step-katex-${i}"></div>
      `).join("");
    }

    resultBox.innerHTML = `
      <div class="bg-gradient-to-br from-blue-50 to-indigo-50/60 dark:from-slate-800 dark:to-slate-800/80 p-4 rounded-xl border border-blue-200 dark:border-slate-700 space-y-3 shadow-xs">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-0.5">Kết quả tính toán:</span>
            <div class="text-base sm:text-lg font-black text-blue-900 dark:text-blue-200 font-mono tabular-nums">
              ${res.resultText}
            </div>
          </div>
          <button 
            onclick="GeoCalculator.copySolution()"
            title="Sao chép toàn bộ lời giải và đáp số"
            class="px-2.5 py-1.5 rounded-lg border border-blue-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-xs font-bold text-blue-700 dark:text-blue-300 transition flex items-center space-x-1.5 shadow-2xs"
          >
            <span>📋</span>
            <span class="hidden sm:inline">Sao chép lời giải</span>
          </button>
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
            const formattedStep = formatLatexNumber(step);
            katex.render(formattedStep, el, { throwOnError: false });
          } catch (e) {
            el.innerText = step;
          }
        }
      });
    }
  }

  function copySolution() {
    if (!currentSolutionData) return;
    const cleanSteps = currentSolutionData.steps.map(s => {
      return "  + " + s
        .replace(/\\text\{([^}]+)\}/g, "$1")
        .replace(/\\mathbf\{([^}]+)\}/g, "$1")
        .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1)/($2)")
        .replace(/\\times/g, "x")
        .replace(/\\div/g, "/")
        .replace(/\\approx/g, "≈")
        .replace(/\\quad/g, " ")
        .replace(/\\textperthousand/g, "‰")
        .replace(/\\%/g, "%")
        .replace(/[{}]/g, "")
        .replace(/\\/g, "");
    }).join("\n");

    const textToCopy = `[GeoAtlas - Máy Tính Địa Lý THPT]\nCông thức: ${currentSolutionData.formulaName}\n- Đáp số: ${currentSolutionData.resultText}\n- Các bước giải:\n${cleanSteps}\n${currentSolutionData.note ? "- Nhận xét Địa lý: " + currentSolutionData.note : ""}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        if (typeof window.showAppToast === "function") {
          window.showAppToast("📋 Đã sao chép lời giải chi tiết vào bộ nhớ tạm!");
        }
      });
    } else {
      const ta = document.createElement("textarea");
      ta.value = textToCopy;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      if (typeof window.showAppToast === "function") {
        window.showAppToast("📋 Đã sao chép lời giải chi tiết vào bộ nhớ tạm!");
      }
    }
  }



  return {
    init,
    selectFormula,
    onInputChange,
    onUnitChange,
    bindSampleRow,
    loadDefaultSample,
    copySolution,
    parseVNNumber,
    formatLatexNumber
  };
})();

window.GeoCalculator = GeoCalculator;
