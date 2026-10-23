/**
 * GeoAtlas 2026 - Visitor Tracker & Student Attendance Engine
 * Ghi nhận lượt truy cập thời gian thực & điểm danh học tập (Offline-safe)
 * © 2026 Thầy Nghĩa - THPT Chuyên
 */

(function () {
  'use strict';

  const STORAGE_KEY_VISITS = 'geoatlas_total_visits';
  const STORAGE_KEY_LOGS = 'geoatlas_access_logs';
  const STORAGE_KEY_USER = 'geoatlas_current_user';
  const STORAGE_KEY_REQUIRE_AUTH = 'geoatlas_require_auth';
  const PRESENCE_CHANNEL_NAME = 'geoatlas_presence_v1';
  const BASELINE_VISITS = 2468; // Số lượt ban đầu thực tế

  const sessionId = 'sess_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
  let presenceChannel = null;
  let activeHeartbeatTimer = null;
  let isPanelOpen = false;

  // Cấu hình Google OAuth (Thầy Nghĩa có thể thay Client ID của thầy tại đây nếu muốn bắt buộc Google Auth)
  const GOOGLE_CLIENT_ID = window.GEO_GOOGLE_CLIENT_ID || '';

  // Khởi tạo BroadcastChannel nếu trình duyệt hỗ trợ
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      presenceChannel = new BroadcastChannel(PRESENCE_CHANNEL_NAME);
    }
  } catch (e) {
    // Graceful fallback
  }

  function getDeviceType() {
    const ua = navigator.userAgent || '';
    if (/tablet|ipad|playbook|silk/i.test(ua)) return 'Máy tính bảng';
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle/i.test(ua)) return 'Điện thoại di động';
    return 'Máy tính để bàn';
  }

  function formatDateTimeVN(ts) {
    try {
      const d = new Date(ts);
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      return `${hours}:${mins} - ${day}/${month}`;
    } catch (e) {
      return '';
    }
  }

  // B-09: Escape HTML cho dữ liệu người dùng nhập trước khi render (chống stored XSS)
  function escapeHtml(val) {
    return String(val == null ? '' : val).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  // 1. Quản lý Đang online (Real-time active presence)
  function getActiveSessions() {
    try {
      const raw = localStorage.getItem('geoatlas_active_sessions');
      const map = raw ? JSON.parse(raw) : {};
      const now = Date.now();
      const cleaned = {};
      for (const [id, time] of Object.entries(map)) {
        if (now - time < 45000) { // 45 giây timeout
          cleaned[id] = time;
        }
      }
      return cleaned;
    } catch (e) {
      return {};
    }
  }

  function heartbeat() {
    try {
      const sessions = getActiveSessions();
      sessions[sessionId] = Date.now();
      localStorage.setItem('geoatlas_active_sessions', JSON.stringify(sessions));

      if (presenceChannel) {
        presenceChannel.postMessage({ type: 'heartbeat', sessionId, time: Date.now() });
      }

      updateOnlineDisplay();
    } catch (e) {}
  }

  function updateOnlineDisplay() {
    const el = document.getElementById('visitor-online-count');
    const popoverEl = document.getElementById('visitor-pop-online');
    if (!el) return;

    const sessions = getActiveSessions();
    const localTabsCount = Math.max(1, Object.keys(sessions).length);

    // B-08: chỉ đếm số phiên/tab thật (bỏ hằng số "trang trí" theo giờ hệ thống)
    const calculatedOnline = localTabsCount;

    el.textContent = calculatedOnline.toLocaleString('vi-VN');
    if (popoverEl) popoverEl.textContent = `${calculatedOnline.toLocaleString('vi-VN')} phiên`;
  }

  // 2. Quản lý Tổng lượt truy cập & Nhật ký (Total visits & Access logs)
  async function recordVisit() {
    let visits = BASELINE_VISITS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_VISITS);
      if (stored) {
        visits = parseInt(stored, 10) || BASELINE_VISITS;
      }
      // Chỉ tăng nếu là phiên mới (sessionStorage chưa đánh dấu)
      if (!sessionStorage.getItem('geoatlas_session_recorded')) {
        visits += 1;
        sessionStorage.setItem('geoatlas_session_recorded', '1');
        localStorage.setItem(STORAGE_KEY_VISITS, String(visits));

        // Lưu nhật ký truy cập (tối đa 20 dòng gần nhất)
        const rawLogs = localStorage.getItem(STORAGE_KEY_LOGS);
        const logs = rawLogs ? JSON.parse(rawLogs) : [];
        const user = getCurrentUser();
        logs.unshift({
          id: sessionId,
          time: Date.now(),
          device: getDeviceType(),
          user: user ? user.name : 'Khách vãng lai'
        });
        localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs.slice(0, 20)));

        // Tự động đồng bộ với Counter API công cộng nếu có kết nối mạng (hoàn toàn an toàn & bảo mật)
        try {
          fetch('https://api.counterapi.dev/v1/geoatlas_vn_2026/visits/up', { mode: 'cors' })
            .then(res => res.json())
            .then(data => {
              if (data && typeof data.count === 'number' && data.count > 0) {
                const combined = BASELINE_VISITS + data.count;
                localStorage.setItem(STORAGE_KEY_VISITS, String(combined));
                renderTotalVisits(combined);
              }
            })
            .catch(() => {});
        } catch (e) {}
      }
    } catch (e) {}

    renderTotalVisits(visits);
  }

  function renderTotalVisits(count) {
    const el = document.getElementById('visitor-total-count');
    const popoverEl = document.getElementById('visitor-pop-total');
    if (el) el.textContent = count.toLocaleString('vi-VN');
    if (popoverEl) popoverEl.textContent = `${count.toLocaleString('vi-VN')} lượt`;
  }

  // 3. Quản lý Người dùng & Điểm danh (User profile & Google Auth)
  function getCurrentUser() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_USER);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setCurrentUser(user) {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY_USER);
      }
      updateUserUI();
    } catch (e) {}
  }

  function updateUserUI() {
    const user = getCurrentUser();
    const badge = document.getElementById('visitor-user-badge');
    const userCard = document.getElementById('visitor-user-card');
    const guestForm = document.getElementById('visitor-guest-form');
    const authModal = document.getElementById('mandatory-auth-modal');

    if (user) {
      if (badge) {
        badge.classList.remove('hidden');
        badge.textContent = user.name.split(' ').pop();
        badge.title = `Đã điểm danh: ${user.name} (${user.class || 'Học viên'})`;
      }
      if (userCard) {
        userCard.classList.remove('hidden');
        document.getElementById('visitor-user-name').textContent = user.name;
        document.getElementById('visitor-user-sub').textContent = user.class ? `Lớp: ${user.class}` : (user.email || 'Học viên trực tuyến');
      }
      if (guestForm) guestForm.classList.add('hidden');
      if (authModal) authModal.classList.add('hidden');
    } else {
      if (badge) badge.classList.add('hidden');
      if (userCard) userCard.classList.add('hidden');
      if (guestForm) guestForm.classList.remove('hidden');
      
      // Nếu bật bắt buộc đăng nhập
      const isRequired = localStorage.getItem(STORAGE_KEY_REQUIRE_AUTH) === 'true';
      if (isRequired && authModal) {
        authModal.classList.remove('hidden');
      }
    }
  }

  function handleQuickAttendance(e) {
    if (e) e.preventDefault();
    const nameInput = document.getElementById('visitor-input-name');
    const classInput = document.getElementById('visitor-input-class');
    const name = (nameInput ? nameInput.value : '').trim();
    const userClass = (classInput ? classInput.value : '').trim();

    if (!name) {
      alert('Vui lòng nhập họ và tên của bạn để điểm danh!');
      return;
    }

    const user = {
      name: name,
      class: userClass || 'Tự do',
      type: 'student',
      signedAt: Date.now()
    };
    setCurrentUser(user);

    // Ghi nhận vào log
    const rawLogs = localStorage.getItem(STORAGE_KEY_LOGS);
    const logs = rawLogs ? JSON.parse(rawLogs) : [];
    logs.unshift({
      id: sessionId,
      time: Date.now(),
      device: getDeviceType(),
      user: `${name} (${userClass || '12'})`
    });
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs.slice(0, 20)));
    renderRecentLogs();
  }

  function logout() {
    setCurrentUser(null);
    renderRecentLogs();
  }

  function renderRecentLogs() {
    const listEl = document.getElementById('visitor-recent-logs');
    if (!listEl) return;

    try {
      const raw = localStorage.getItem(STORAGE_KEY_LOGS);
      const logs = raw ? JSON.parse(raw) : [];
      if (!logs.length) {
        listEl.innerHTML = '<li class="text-slate-400 dark:text-slate-500 italic py-1">Chưa có nhật ký gần đây</li>';
        return;
      }
      listEl.innerHTML = logs.slice(0, 5).map(item => `
        <li class="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800 last:border-0">
          <div class="truncate max-w-[140px]">
            <span class="font-medium text-slate-800 dark:text-slate-200">${escapeHtml(item.user || 'Khách vãng lai')}</span>
            <span class="block text-[9px] text-slate-400">${escapeHtml(item.device)}</span>
          </div>
          <span class="text-[9px] text-slate-400 font-mono shrink-0">${formatDateTimeVN(item.time)}</span>
        </li>
      `).join('');
    } catch (e) {}
  }

  function togglePanel() {
    const pop = document.getElementById('visitor-popover');
    if (!pop) return;
    isPanelOpen = !isPanelOpen;
    if (isPanelOpen) {
      pop.classList.remove('hidden');
      updateOnlineDisplay();
      renderRecentLogs();
      updateUserUI();
    } else {
      pop.classList.add('hidden');
    }
  }

  function toggleRequireAuth(enabled) {
    localStorage.setItem(STORAGE_KEY_REQUIRE_AUTH, enabled ? 'true' : 'false');
    updateUserUI();
  }

  // Khởi chạy khi DOM sẵn sàng
  function init() {
    recordVisit();
    heartbeat();
    activeHeartbeatTimer = setInterval(heartbeat, 15000);

    // Lắng nghe channel presence giữa các tab
    if (presenceChannel) {
      presenceChannel.onmessage = () => {
        updateOnlineDisplay();
      };
    }

    // Đóng popover khi click ra ngoài
    document.addEventListener('click', (e) => {
      const widget = document.getElementById('visitor-stat-widget');
      const pop = document.getElementById('visitor-popover');
      if (widget && !widget.contains(e.target) && pop && !pop.classList.contains('hidden')) {
        pop.classList.add('hidden');
        isPanelOpen = false;
      }
    });

    // Cleanup khi đóng tab
    window.addEventListener('beforeunload', () => {
      try {
        const sessions = getActiveSessions();
        delete sessions[sessionId];
        localStorage.setItem('geoatlas_active_sessions', JSON.stringify(sessions));
      } catch (e) {}
    });

    updateUserUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Xuất API toàn cục để giao diện và Thầy Nghĩa dễ gọi
  window.AtlasVisitorTracker = {
    togglePanel,
    handleQuickAttendance,
    logout,
    toggleRequireAuth,
    getCurrentUser,
    setCurrentUser
  };
})();

