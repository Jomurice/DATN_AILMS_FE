// src/services/dashboardService.js
import api from "./axios";

/**
 * Chuẩn hoá tham số timeframe để gửi BE.
 * Bạn có thể đổi sang startDate/endDate nếu backend yêu cầu.
 */
function mapTimeframe(tf) {
  return { timeframe: tf }; // -> /api/dashboard/series?timeframe=7D
}

/* ====== Fallback mock khi BE chưa sẵn sàng (giống style productDetailService) ====== */
function gen(count, amp = 1, base = 5) {
  return Array.from({ length: count }, (_, i) =>
    Math.max(0, Math.round(base + (Math.sin(i * 0.7) + 1) * amp * 8))
  );
}
function mockSeries(tf) {
<<<<<<< HEAD
  if (tf === "today")
    return { labels: [...Array(24)].map((_, i) => `${i}:00`), inbound: gen(24, .6, 3), outbound: gen(24, .5, 2) };
  if (tf === "thisweek")
    return { labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], inbound: gen(7, .7, 4), outbound: gen(7, .6, 3) };
  if (tf === "thismonth")
    return { labels: [...Array(30)].map((_, i) => `${i + 1}`), inbound: gen(30, .5, 5), outbound: gen(30, .45, 4) };
  if (tf === "thisyear")
=======
  if (tf === "24H")
    return { labels: [...Array(24)].map((_, i) => `${i}:00`), inbound: gen(24, .6, 3), outbound: gen(24, .5, 2) };
  if (tf === "7D")
    return { labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], inbound: gen(7, .7, 4), outbound: gen(7, .6, 3) };
  if (tf === "1M")
    return { labels: [...Array(30)].map((_, i) => `${i + 1}`), inbound: gen(30, .5, 5), outbound: gen(30, .45, 4) };
  if (tf === "1Y")
>>>>>>> 989a55af60ed7303b16d542cf23bf937cd440561
    return { labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"], inbound: gen(12, .8, 8), outbound: gen(12, .7, 7) };
  return { labels: ["T-11","T-10","T-9","T-8","T-7","T-6","T-5","T-4","T-3","T-2","T-1","T"], inbound: gen(12, .9, 9), outbound: gen(12, .8, 8) };
}

/* ===================== PUBLIC API ===================== */

/** Lấy thống kê 3 ô đầu trang */
export const getDashboardStats = async (timeframe) => {
  try {
    const { data } = await api.get("/api/dashboard/stats", { params: mapTimeframe(timeframe) });
    const r = data?.result ?? data;
    // đảm bảo đủ field, giống cách bạn chuẩn hoá ở các service khác
    return {
      inStock: Number(r?.inStock ?? 0),
      exported: Number(r?.exported ?? 0),
      employees: Number(r?.employees ?? 0),
    };
  } catch (err) {
    // fallback để dev vẫn xem được UI
    return { inStock: 1313, exported: timeframe === "7D" ? 64 : 297, employees: 23 };
  }
};

/** Lấy series nhập/xuất cho biểu đồ */
export const getInboundOutboundSeries = async (timeframe) => {
  try {
    const { data } = await api.get("/api/dashboard/series", { params: mapTimeframe(timeframe) });
    const r = data?.result ?? data;
    if (Array.isArray(r?.labels) && Array.isArray(r?.inbound) && Array.isArray(r?.outbound)) {
      return r;
    }
    // nếu BE trả hình dạng khác, ném lỗi để chuyển sang mock
    throw new Error("Bad series shape");
  } catch (err) {
    return mockSeries(timeframe);
  }
};
