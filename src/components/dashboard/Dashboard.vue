<template>
  <div class="container-fluid py-3">
    <div class="dbox">
      <main class="main">
        <h3 class="page-title"></h3>

        <!-- STAT CARDS -->
        <div class="stats">
          <div v-for="s in statCards" :key="s.title" class="card border-0 shadow-sm rounded-4 stat-card">
            <div class="card-body d-flex align-items-center gap-3">
              <div class="stat-icon" :class="s.iconClass">
                <i :class="s.icon"></i>
              </div>
              <div>
                <div class="text-muted small">{{ s.title }}</div>
                <div class="stat-value">{{ s.display }}</div>
                <div class="small text-muted">{{ s.note }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- CHART -->
        <div class="card border-0 shadow-sm rounded-4">
          <div class="card-body">
            <div class="chart-header">
              <!-- Trái: tiêu đề + filter series (GIỮ NGUYÊN) -->
              <div class="d-flex align-items-center gap-2 flex-wrap">
                <h6 class="m-0 chart-title">Nhập / Xuất theo thời gian</h6>
                <div class="btn-group btn-group-sm ms-1">
                  <button v-for="op in seriesOptions" :key="op.value" class="btn btn-sm" :class="series === op.value
                    ? 'btn-primary'
                    : 'btn-outline-secondary'
                    " @click="series = op.value">
                    {{ op.label }}
                  </button>
                </div>
              </div>

              <!-- Phải: DROPDOWN KHO (nhỏ) đặt NGAY BÊN TRÁI cụm thời gian + cụm thời gian (GIỮ NGUYÊN VỊ TRÍ) -->
              <div class="d-flex align-items-center gap-2 flex-wrap">
                <select v-model="warehouseId" class="form-select form-select-sm" style="width: 160px">
                  <option :value="''">Tất cả kho</option>
                  <option v-for="w in warehouses" :key="w.id" :value="w.id">
                    {{ w.name }}
                  </option>
                </select>

                <span class="small text-muted me-1">Thời gian</span>
                <div class="btn-group btn-group-sm">
                  <button v-for="tf in timeframes" :key="tf" class="btn btn-sm" :class="timeframe === tf ? 'btn-primary' : 'btn-outline-primary'
                    " @click="timeframe = tf">
                    {{ tf }}
                  </button>
                </div>
              </div>
            </div>

            <div v-if="loading" class="chart-wrap text-center d-flex flex-column justify-content-center align-items-center">
              <div class="spinner-border text-primary" role="status"> </div>
              <div class="small mx-2 fs-5 text-primary mt-2">Đang tải...</div>
            </div>

            <div v-else class="chart-wrap">
              <canvas ref="chartRef"></canvas>
            </div>


            <div class="chart-foot">
              <div class="small text-muted">X: thời gian • Y: số lượng</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
<script setup>
// Khi BE hỗ trợ lọc theo kho, có thể thêm watch(warehouseId, ...) để gọi API filter theo kh<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import Chart from "chart.js/auto";
import { getDashboardStats, getInboundOutboundSeries } from "@/services/dashboardService";
import { warehouseService } from "@/services/WarehouseService";
import { toast } from "vue-sonner";

const loading = ref(false);
const timeframe = ref("7D");
const series = ref("all");
const warehouseId = ref("");
const warehouses = ref([]);
const stats = ref({ inStock: 0, exported: 0, employees: 0 });

const timeframes = ["24H", "7D", "1M", "1Y", "All"];
const seriesOptions = [
  { label: "Tổng", value: "all" },
  { label: "Nhập", value: "inbound" },
  { label: "Xuất", value: "outbound" },
];

/* ===== Chart Logic ===== */
const chartRef = ref(null);
let chartInstance = null; // Đổi tên để tránh nhầm lẫn

async function drawChart() {
  if (!chartRef.value) return;

  const { labels, inbound, outbound } = await getInboundOutboundSeries(
    timeframe.value,
    warehouseId.value
  );

  // QUAN TRỌNG: Hủy chart cũ trước khi vẽ chart mới trên canvas mới
  if (chartInstance) {
    chartInstance.destroy();
  }

  const datasets = [];
  if (series.value === "all" || series.value === "inbound") {
    datasets.push({
      label: "Nhập",
      data: inbound,
      backgroundColor: "rgba(59,130,246,.35)",
      borderColor: "rgba(59,130,246,1)",
      borderWidth: 1,
    });
  }
  if (series.value === "all" || series.value === "outbound") {
    datasets.push({
      label: "Xuất",
      data: outbound,
      backgroundColor: "rgba(239,68,68,.35)",
      borderColor: "rgba(239,68,68,1)",
      borderWidth: 1,
    });
  }

  chartInstance = new Chart(chartRef.value.getContext("2d"), {
    type: "bar",
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true } }
    },
  });
}

/* ===== Data Loading ===== */
async function updateDashboardData() { // Thống nhất tên hàm
  loading.value = true;
  try {
    // 1. Load Stats (Cards)
    const s = await getDashboardStats(timeframe.value, warehouseId.value);
    stats.value = s;

    // 2. Tắt loading để Vue render lại thẻ <canvas>
    loading.value = false;
    
    // 3. Đợi DOM cập nhật xong rồi mới vẽ Chart
    await nextTick();
    await drawChart();
  } catch (error) {
    console.error("Lỗi tải dashboard:", error);
    toast.error('Tải dữ liệu thất bại!');
    loading.value = false;
  }
}

onMounted(async () => {
  try {
    warehouses.value = (await warehouseService.getAllWarehouses()) || [];
  } catch {}
  await updateDashboardData();
});

/* ===== Watchers (Chỉ cần 2 cái này là đủ) ===== */

// Khi thay đổi thời gian hoặc kho -> Load lại tất cả
watch([timeframe, warehouseId], async () => {
  await updateDashboardData();
});

// Khi chỉ thay đổi loại hiển thị (Nhập/Xuất) -> Chỉ vẽ lại chart, không gọi API stats
watch(series, async () => {
  await drawChart();
});
</script>
<style scoped>
.dbox {
  display: flex;
  gap: 20px;
  --top-offset: 96px;
}

.main {
  flex: 1 1 auto;
  width: 100%;
  min-width: 0;
  /* max-width: 1280px; */
}

.page-title {
  font-weight: 800;
  font-size: 28px;
  margin-bottom: 16px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.stat-card {
  min-height: 140px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-value {
  font-size: 2.2rem;
  font-weight: 600;
  line-height: 1;
  color: #6b7280;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.chart-title {
  font-weight: 600;
  color: #111827;
}

.chart-wrap {
  height: 360px;
}

.chart-wrap canvas {
  width: 100%;
  height: 100%;
}

.chart-foot {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

@media (max-width: 1200px) {
  .stats {
    grid-template-columns: repeat(2, minmax(260px, 1fr));
  }
}

@media (max-width: 992px) {
  .dbox {
    flex-direction: column;
  }
}

@media (max-width: 576px) {
  .stats {
    grid-template-columns: 1fr;
  }

  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .chart-foot {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
