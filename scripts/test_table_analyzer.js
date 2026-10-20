const assert = require('assert');

function parseVNNumber(val) {
  if (typeof val === 'number') return val;
  let s = String(val || '').trim().replace(/\s+/g, '').replace(/%/g, '');
  if (s.includes('.') && s.includes(',')) {
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (s.includes(',')) {
    s = s.replace(',', '.');
  }
  const num = parseFloat(s);
  return isNaN(num) ? 0 : num;
}

function parsePastedTable(rawText) {
  if (!rawText || !rawText.trim()) return null;
  const lines = rawText.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return null;

  // Detect delimiter
  const firstLine = lines[0];
  let delimiter = '\t';
  if (firstLine.includes('\t')) delimiter = '\t';
  else if (firstLine.includes('|')) delimiter = '|';
  else if (firstLine.includes(';')) delimiter = ';';
  else if (firstLine.includes(',')) delimiter = ',';
  else delimiter = /\s{2,}/;

  const headers = firstLine.split(delimiter).map(c => c.trim()).filter(Boolean);
  if (headers.length < 2) return null;

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(delimiter).map(c => c.trim()).filter(Boolean);
    if (cells.length < 2) continue;
    const rawName = cells[0];
    const unitMatch = rawName.match(/\((.*?)\)/);
    const unit = unitMatch ? unitMatch[1] : '';
    const cleanName = rawName.replace(/\(.*?\)/, '').trim();
    const values = cells.slice(1).map(c => parseVNNumber(c));
    rows.push({
      name: cleanName || rawName,
      unit: unit,
      values: values
    });
  }

  if (rows.length === 0) return null;
  return { headers, rows };
}

function analyzeTableStructure(parsed, promptText) {
  const { headers, rows } = parsed;
  const categories = headers.slice(1);
  const numYears = categories.length;
  const prompt = (promptText || '').toLowerCase();

  // Unit detection
  const validRows = rows.filter(r => !/tổng\s*(số|cộng)?$/i.test(r.name.trim()));
  const units = [...new Set(validRows.map(r => (r.unit || '').trim()).filter(Boolean))];

  // Column sums
  const colSums = [];
  for (let c = 0; c < numYears; c++) {
    const sum = validRows.reduce((acc, r) => acc + (r.values[c] || 0), 0);
    colSums.push(Math.round(sum * 10) / 10);
  }
  const isSum100 = colSums.length > 0 && colSums.every(s => Math.abs(s - 100) <= 2.5);
  const isBase100 = validRows.length > 0 && validRows.every(r => Math.abs((r.values[0] || 0) - 100) <= 0.5);

  let optimal_chart = "bar";
  let chart_name = "Biểu đồ cột (Bar Chart)";
  let confidence = 95;
  let explanation = "";

  if (units.length > 1) {
    optimal_chart = "combo_bar_line";
    chart_name = "Biểu đồ kết hợp Cột + Đường (2 Trục Tung)";
    confidence = 99;
    explanation = `Bảng số liệu có ${units.length} đơn vị đo lường khác nhau (${units.join(", ")}). Theo quy chuẩn thi THPT, bắt buộc phải vẽ Biểu đồ Kết hợp với 2 trục tung riêng biệt.`;
  } else if (/tốc độ tăng trưởng|tốc độ phát triển/i.test(prompt) || isBase100) {
    optimal_chart = "line";
    chart_name = "Biểu đồ đường (Line Chart)";
    confidence = 98;
    explanation = "Yêu cầu đề bài có từ khóa vàng 'tốc độ tăng trưởng' (hoặc năm gốc 100%). Biểu đồ đường là lựa chọn chuẩn xác tuyệt đối để thể hiện tốc độ phát triển.";
  } else if (/quy mô và cơ cấu/i.test(prompt)) {
    if (numYears <= 3) {
      optimal_chart = "pie";
      chart_name = "Biểu đồ tròn bán kính khác nhau (Multi-Pie)";
      confidence = 97;
      explanation = `Đề bài yêu cầu thể hiện 'quy mô và cơ cấu' trong ${numYears} năm (≤ 3 năm). Vẽ biểu đồ tròn với bán kính tỉ lệ thuận theo quy mô tổng số.`;
    } else {
      optimal_chart = "bar_stacked";
      chart_name = "Biểu đồ cột chồng (Stacked Bar)";
      confidence = 96;
      explanation = `Đề bài yêu cầu 'quy mô và cơ cấu' qua chuỗi ${numYears} năm (≥ 4 năm). Biểu đồ cột chồng thể hiện vừa tổng quy mô (chiều cao cột) vừa cơ cấu các bộ phận.`;
    }
  } else if (/chuyển dịch cơ cấu|thay đổi cơ cấu|cơ cấu|tỷ trọng|tỉ trọng/i.test(prompt) || isSum100) {
    if (numYears >= 4 || (numYears >= 3 && /chuyển dịch|thay đổi/i.test(prompt))) {
      optimal_chart = "stacked_area";
      chart_name = "Biểu đồ miền (Stacked Area)";
      confidence = 98;
      explanation = `Yêu cầu thể hiện cơ cấu / chuyển dịch cơ cấu qua chuỗi thời gian dài ${numYears} mốc năm (≥ 3-4 năm). Biểu đồ miền là chuẩn mực tối ưu.`;
    } else {
      optimal_chart = "pie";
      chart_name = "Biểu đồ tròn (Pie Chart)";
      confidence = 98;
      explanation = `Yêu cầu thể hiện cơ cấu trong ${numYears} mốc năm (≤ 3 năm). Biểu đồ tròn là lựa chọn tối ưu theo quy chuẩn Atlat và SGK.`;
    }
  } else {
    optimal_chart = "bar";
    chart_name = "Biểu đồ cột (Bar Chart)";
    confidence = 95;
    explanation = "Đề bài yêu cầu so sánh quy mô hoặc thể hiện sự biến động qua các năm với 1 đơn vị thống nhất. Biểu đồ cột là lựa chọn tối ưu.";
  }

  return {
    numYears,
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

console.log(">>> TESTING TABLE PARSER & RULE ENGINE <<<");

// Test Sample 1: 4 years structure (%)
const s1 = `Năm\t2010\t2015\t2020\t2024
Nông nghiệp (%)\t18.9\t17.0\t14.8\t11.8
Công nghiệp (%)\t38.2\t36.7\t33.7\t37.6
Dịch vụ (%)\t42.9\t46.3\t51.5\t50.6`;
const p1 = parsePastedTable(s1);
const r1 = analyzeTableStructure(p1, "Theo bảng số liệu, để thể hiện sự chuyển dịch cơ cấu GDP nước ta...");
console.log("Sample 1 (4 years structure):", r1.optimal_chart, "| Conf:", r1.confidence + "%");
assert.strictEqual(r1.optimal_chart, "stacked_area");

// Test Sample 2: Growth rate
const s2 = `Năm, 2015, 2018, 2021, 2024
Than sạch (%), 100.0, 93.5, 108.4, 115.2
Dầu thô (%), 100.0, 125.8, 65.2, 54.6`;
const p2 = parsePastedTable(s2);
const r2 = analyzeTableStructure(p2, "Thể hiện tốc độ tăng trưởng sản lượng các sản phẩm");
console.log("Sample 2 (Growth rate):", r2.optimal_chart, "| Conf:", r2.confidence + "%");
assert.strictEqual(r2.optimal_chart, "line");

// Test Sample 3: Multi-unit combo
const s3 = `Năm\t2015\t2020\t2024
Sản lượng (Nghìn tấn)\t43.5\t44.0\t43.8
Giá trị (Tỉ đồng)\t1500\t2800\t4200`;
const p3 = parsePastedTable(s3);
const r3 = analyzeTableStructure(p3, "Thể hiện sản lượng và giá trị sản xuất");
console.log("Sample 3 (Multi-unit combo):", r3.optimal_chart, "| Conf:", r3.confidence + "%");
assert.strictEqual(r3.optimal_chart, "combo_bar_line");

// Test Sample 4: 2 years structure
const s4 = `Năm\t2015\t2024
Nông nghiệp\t17.0\t11.8
Công nghiệp\t36.7\t37.6
Dịch vụ\t46.3\t50.6`;
const p4 = parsePastedTable(s4);
const r4 = analyzeTableStructure(p4, "Thể hiện cơ cấu GDP năm 2015 và 2024");
console.log("Sample 4 (2 years structure):", r4.optimal_chart, "| Conf:", r4.confidence + "%");
assert.strictEqual(r4.optimal_chart, "pie");

console.log(">>> ALL 4 TABLE ANALYZER TESTS PASSED 100%! <<<");

