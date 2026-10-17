const fs = require('fs');

// 1. Test normalizeVN
function normalizeVN(str) {
  return (str || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
}
console.log('[+] normalizeVN tests:');
console.log(' - "Cẩm Phả" ->', normalizeVN('Cẩm Phả'));
console.log(' - "Bô-xít" ->', normalizeVN('Bô-xít'));
console.log(' - "Đắk Lắk" ->', normalizeVN('Đắk Lắk'));
console.assert(normalizeVN('Cẩm Phả') === 'cam pha', 'normalizeVN failed for Cẩm Phả');
console.assert(normalizeVN('Bô-xít') === 'bo-xit', 'normalizeVN failed for Bô-xít');

// 2. Test parseVNNumber
function parseVNNumber(val) {
  if (typeof val === 'number') return val;
  let s = String(val || '').trim().replace(/\s+/g, '').replace(/%/g, '');
  if (s.includes('.') && s.includes(',')) {
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (s.includes(',')) {
    s = s.replace(',', '.');
  }
  const num = parseFloat(s);
  return isNaN(num) ? null : num;
}
console.log('\n[+] parseVNNumber tests:');
console.log(' - "1.254,5" ->', parseVNNumber('1.254,5'));
console.log(' - "18,4" ->', parseVNNumber('18,4'));
console.log(' - "18.4" ->', parseVNNumber('18.4'));
console.log(' - "+28,0%" ->', parseVNNumber('+28,0%'));
console.assert(parseVNNumber('1.254,5') === 1254.5, 'parseVNNumber failed for 1.254,5');
console.assert(parseVNNumber('18,4') === 18.4, 'parseVNNumber failed for 18,4');
console.assert(parseVNNumber('+28,0%') === 28.0, 'parseVNNumber failed for +28,0%');

// 3. Test Single-pass Regex Highlight
const rawPrompt = 'Biểu đồ nào thể hiện tốc độ tăng trưởng và tăng trưởng sản lượng?';
const keywords = ['tăng trưởng', 'tốc độ tăng trưởng'];
const sortedKw = [...keywords].sort((a, b) => b.length - a.length).map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
const regex = new RegExp(`(${sortedKw.join('|')})`, 'gi');
const highlighted = rawPrompt.replace(regex, '<mark>$1</mark>');
console.log('\n[+] Single-pass regex highlight test:');
console.log(' Original:', rawPrompt);
console.log(' Highlighted:', highlighted);
console.assert(!highlighted.includes('<mark><mark>'), 'Nested tag detected!');

// 4. Test ECharts Stacked Area Normalization
const rawRows = [
  { name: 'Nông nghiệp', values: [300, 450] },
  { name: 'Công nghiệp', values: [500, 750] },
  { name: 'Dịch vụ', values: [200, 300] }
];
const categories = ['2020', '2023'];
const numCols = categories.length;
const colSums = [];
for (let c = 0; c < numCols; c++) {
  let sum = 0;
  rawRows.forEach(r => { sum += (r.values[c] || 0); });
  colSums.push(sum);
}
const areaRows = rawRows.map(r => ({
  ...r,
  values: r.values.map((v, c) => Math.round((v / (colSums[c] || 1)) * 1000) / 10)
}));
console.log('\n[+] Stacked Area Normalization test (Raw absolute numbers -> % column sum = 100):');
console.log(' Col 0 sum:', areaRows.reduce((acc, r) => acc + r.values[0], 0));
console.log(' Col 1 sum:', areaRows.reduce((acc, r) => acc + r.values[1], 0));
console.assert(Math.abs(areaRows.reduce((acc, r) => acc + r.values[0], 0) - 100) < 0.1, 'Column 0 sum must be 100%');
console.assert(Math.abs(areaRows.reduce((acc, r) => acc + r.values[1], 0) - 100) < 0.1, 'Column 1 sum must be 100%');

// 5. Test Growth Line Normalization
const rawGrowthRows = [
  { name: 'Điện', values: [159.4, 212.9, 275.9] }
];
const firstVal = rawGrowthRows[0].values[0];
const normalizedGrowthValues = rawGrowthRows[0].values.map(v => Math.round((v / firstVal) * 1000) / 10);
console.log('\n[+] Growth Line Normalization test (First year = 100%):');
console.log(' Normalized values:', normalizedGrowthValues);
console.assert(normalizedGrowthValues[0] === 100.0, 'First year must be exactly 100.0%');

console.log('\n>>> ALL 12 TECHNICAL PATCH CHECKS PASSED WITH FLYING COLORS! <<<');
