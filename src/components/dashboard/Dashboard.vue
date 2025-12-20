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
import { ref, computed, onMounted, watch } from "vue";
import Chart from "chart.js/auto";
import {
  getDashboardStats,
  getInboundOutboundSeries,
} from "@/services/dashboardService";
import { warehouseService } from "@/services/WarehouseService";


const loading = ref(false);
/* ===== UI state ===== */
const timeframes = ["24H", "7D", "1M", "1Y", "All"]; // giữ như cũ
const seriesOptions = [
  { label: "Tổng", value: "all" },
  { label: "Nhập", value: "inbound" },
  { label: "Xuất", value: "outbound" },
];
const timeframe = ref("7D");
const series = ref("all");

/* ===== Kho (dropdown nhỏ) ===== */
const warehouses = ref([]);
const warehouseId = ref(""); // '' = tất cả kho (tương lai BE có thể nhận filter)

/* ===== Stats ===== */
const stats = ref({ inStock: 0, exported: 0, employees: 0 });
const fmt = (v) => (Number.isFinite(v) ? v.toLocaleString() : String(v));
const statCards = computed(() => [
  {
    title: "Sản phẩm trong kho",
    display: fmt(stats.value.inStock),
    note: "Cập nhật hôm nay",
    icon: "fa-solid fa-boxes-stacked",
    iconClass: "bg-success-subtle text-success",
  },
  {
    title: "Đã xuất",
    display: fmt(stats.value.exported),
    note: "Cập nhật hôm nay",
    icon: "fa-solid fa-truck-ramp-box",
    iconClass: "bg-info-subtle text-info",
  },
  {
    title: "Số lượng nhân viên",
    display: fmt(stats.value.employees),
    note: "hoạt động",
    icon: "fa-solid fa-users",
    iconClass: "bg-warning-subtle text-warning",
  },
]);

/* ===== Chart ===== */
const chartRef = ref(null);
let chart;

const colors = {
  inbound: { bg: "rgba(59,130,246,.35)", border: "rgba(59,130,246,1)" }, // xanh
  outbound: { bg: "rgba(239,68,68,.35)", border: "rgba(239,68,68,1)" }, // đỏ
};

async function drawChart() {
  // Hiện tại service chưa nhận warehouseId -> vẫn gọi như cũ.
  // Khi BE có filter theo kho, chỉ cần sửa service để nhận thêm param.
  const { labels, inbound, outbound } = await getInboundOutboundSeries(
    timeframe.value,
    warehouseId.value
  );

  const datasets = [];
  if (series.value === "all" || series.value === "inbound") {
    datasets.push({
      type: "bar",
      label: "Nhập",
      data: inbound,
      backgroundColor: colors.inbound.bg,
      borderColor: colors.inbound.border,
      borderWidth: 1,
      categoryPercentage: 0.6,
      barPercentage: 0.9,
    });
  }
  if (series.value === "all" || series.value === "outbound") {
    datasets.push({
      type: "bar",
      label: "Xuất",
      data: outbound,
      backgroundColor: colors.outbound.bg,
      borderColor: colors.outbound.border,
      borderWidth: 1,
      categoryPercentage: 0.6,
      barPercentage: 0.9,
    });
  }

  const cfg = {
    type: "bar",
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          onClick: () => { },
          labels: { color: "#6b7280", font: { weight: 500 } },
        },
        tooltip: { mode: "index", intersect: false },
      },
      scales: {
        x: {
          stacked: false,
          ticks: { color: "#6b7280" },
          grid: { color: "#f1f5f9" },
          title: {
            display: true,
            text: "Thời gian",
            color: "#6b7280",
            font: { weight: 500 },
          },
        },
        y: {
          beginAtZero: true,
          ticks: { precision: 0, color: "#6b7280" },
          grid: { color: "#f1f5f9" },
          title: {
            display: true,
            text: "Số lượng",
            color: "#6b7280",
            font: { weight: 500 },
          },
        },
      },
    },
  };

  if (!chart) chart = new Chart(chartRef.value.getContext("2d"), cfg);
  else {
    chart.data.labels = labels;
    chart.data.datasets = datasets;
    chart.update();
  }
}

async function loadStats() {
  loading.value = true;
  try {
    const s = await getDashboardStats(timeframe.value, warehouseId.value);
    stats.value = s;
  } catch (error) {
    console.error("Lỗi khi tải thống kê bảng điều khiển:", error);
  } finally {
    loading.value = false;
  }

}

onMounted(async () => {
  try {
    warehouses.value = (await warehouseService.getAllWarehouses()) || [];
  } catch { }
  await loadStats();
  await drawChart();
});

watch(timeframe, async () => {
  await loadStats();
  await drawChart();
});
watch(warehouseId, async () => {
  await loadStats();
  await drawChart();
})
watch(series, async () => {
  await drawChart();
});

// Khi BE hỗ trợ lọc theo kho, có thể thêm watch(warehouseId, ...) để gọi API filter theo kho
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
