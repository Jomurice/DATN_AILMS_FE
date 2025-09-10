<template>
  <div class=" w-100 mt-1">
    <div class="dbox">
      <main class="main">

        <div class="d-flex justify-content-between align-items-center mb-3">

          <div></div>

          <h3 class="page-title">Trang chủ</h3>

          <nav class="col-md-3 d-flex gap-3">
            <select class="col-md-6 form-select">
              <option value="" >Chi Nhánh</option>
            </select>
            <select v-model="timeframe" class="col-md-6 form-select">
              <option v-for="time in timeframes" :key="time.value" :value="time.value">{{ time.label }}</option>
            </select>
          </nav>
        </div>

        <div class="stats">
          <div v-for="s in statCards" :key="s.title" class="card border-0 shadow-sm rounded-4 stat-card">
            <div class="card-body d-flex align-items-center gap-3">
              <div class="stat-icon" :class="s.iconClass"><i :class="s.icon"></i></div>
              <div>
                <div class="text-muted small">{{ s.title }}</div>
                <div class="stat-value">{{ s.display }}</div>
                <div class="small text-muted">{{ s.note }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- CHART -->
        <div class="card w-100 border-0 shadow-sm rounded-4">
          <div class="card-body">
            <div class="chart-header">
              <!-- Trái: tiêu đề + filter series -->
              <div class="d-flex align-items-center gap-2 flex-wrap">
                <h6 class="m-0 chart-title">Nhập / Xuất theo thời gian</h6>
                <div class="btn-group btn-group-sm ms-1">
                  <button v-for="op in seriesOptions" :key="op.value" class="btn btn-sm"
                    :class="series === op.value ? 'btn-primary' : 'btn-outline-secondary'" @click="series = op.value">{{
                      op.label }}</button>
                </div>
              </div>
              <div class="chart-foot">
                <div class="small text-muted">Ngang: thời gian - Cao: số lượng</div>
              </div>
            </div>

            <div class="chart-wrap">
              <canvas ref="chartRef"></canvas>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Chart from 'chart.js/auto'
import { getDashboardStats, getInboundOutboundSeries } from '../../services/dashboardService'

/* ===== UI state ===== */
const timeframes = [
  {label:'Hôm nay', value:'today'},
  {label:'Hôm qua', value:'yesterday'},
  {label:'Tuần này', value:'thisweek'},
  {label:'Tuần trước', value:'lastweek'},
  {label:'Tháng này', value:'thismonth'},
  {label:'Tháng trước', value:'lastmonth'},
  {label:'Năm nay', value:'thisyear'},
  {label:'Năm trước', value:'lastyear'},
  {label:'Tùy trọn', value:'option'}
]
const seriesOptions = [
  { label: 'Tổng', value: 'all' },
  { label: 'Nhập', value: 'inbound' },
  { label: 'Xuất', value: 'outbound' },
]

const timeframe = ref('today')
const series = ref('all')

/* ===== Stats ===== */
const stats = ref({ inStock: 0, exported: 0, employees: 0 })
const fmt = v => Number.isFinite(v) ? v.toLocaleString() : String(v)
const statCards = computed(() => [
  { title: 'Sản phẩm trong kho', display: fmt(stats.value.inStock), note: 'Cập nhật hôm nay', icon: 'fa-solid fa-boxes-stacked', iconClass: 'bg-success-subtle text-success' },
  { title: 'Đã xuất', display: 'Coming soon', note: 'Coming soon', icon: 'fa-solid fa-truck-ramp-box', iconClass: 'bg-info-subtle text-info' },
  { title: 'Đã xuất', display: 'Coming soon', note: 'Coming soon', icon: 'fa-solid fa-truck-ramp-box', iconClass: 'bg-info-subtle text-info' },
  { title: 'Số lượng nhân viên', display: fmt(stats.value.employees), note: 'hoạt động', icon: 'fa-solid fa-users', iconClass: 'bg-warning-subtle text-warning' },
])

/* ===== Chart ===== */
const chartRef = ref(null)
let chart

const colors = {
  inbound: { bg: 'rgba(59,130,246,.35)', border: 'rgba(59,130,246,1)' },  // xanh
  outbound: { bg: 'rgba(239,68,68,.35)', border: 'rgba(239,68,68,1)' },   // đỏ
}

async function drawChart() {
  const { labels, inbound, outbound } = await getInboundOutboundSeries(timeframe.value)

  const datasets = []
  if (series.value === 'all' || series.value === 'inbound') {
    datasets.push({
      type: 'bar',
      label: 'Nhập',
      data: inbound,
      backgroundColor: colors.inbound.bg,
      borderColor: colors.inbound.border,
      borderWidth: 1,
      categoryPercentage: 0.6,
      barPercentage: 0.9,
    })
  }
  if (series.value === 'all' || series.value === 'outbound') {
    datasets.push({
      type: 'bar',
      label: 'Xuất',
      data: outbound,
      backgroundColor: colors.outbound.bg,
      borderColor: colors.outbound.border,
      borderWidth: 1,
      categoryPercentage: 0.6,
      barPercentage: 0.9,
    })
  }

  const cfg = {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        // Legend chỉ hiển thị, không click ẩn/hiện
        legend: {
          position: 'top',
          onClick: () => { },
          labels: { color: '#6b7280', font: { weight: 500 } },
        },
        tooltip: { mode: 'index', intersect: false },
      },
      scales: {
        x: {
          stacked: false,
          ticks: { color: '#6b7280' },
          grid: { color: '#f1f5f9' },
          title: { display: true, text: 'Thời gian', color: '#6b7280', font: { weight: 500 } }
        },
        y: {
          beginAtZero: true,
          ticks: { precision: 0, color: '#6b7280' },
          grid: { color: '#f1f5f9' },
          title: { display: true, text: 'Số lượng', color: '#6b7280', font: { weight: 500 } }
        },
      },
    },
  }

  if (!chart) chart = new Chart(chartRef.value.getContext('2d'), cfg)
  else { chart.data.labels = labels; chart.data.datasets = datasets; chart.update() }
}

async function loadStats() {
  const s = await getDashboardStats(timeframe.value)
  stats.value = s
}

onMounted(async () => {
  await loadStats()
  await drawChart()
})
watch(timeframe, async () => { await loadStats(); await drawChart() })
watch(series, async () => { await drawChart() })
</script>

<style scoped>
/* .dbox{ display:flex; gap:20px; --top-offset:96px; } */
.side {
  width: 270px;
  background: #0f1f2a;
  color: #e9eef3;
  border-radius: 14px;
  padding: 16px;
  position: sticky;
  top: var(--top-offset);
  height: calc(100vh - var(--top-offset) - 16px);
  overflow: auto;
}

.form-select {
  max-height: 30px;
  padding-top: 0;
}

/* .main{ flex:1 1 auto; min-width:0; max-width:1280px; } */

.brand {
  font-weight: 700;
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 18px;
}

.status {
  background: #122636;
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 12px;
  font-size: 14px;
}

.side-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.side-item {
  color: #e9eef3;
  text-decoration: none;
  padding: 10px 14px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  font-size: 15px;
}

.side-item:hover {
  background: #173249;
}

.side-item.active,
.side-item.router-link-exact-active {
  background: #1f6bff;
  color: #fff;
}

.page-title {
  margin-left: 350px;
  font-weight: 800;
  font-size: 28px;
  /* margin-bottom: 20px; */
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.stat-card {
  min-height: 110px;
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

/* số nhạt theo yêu cầu */
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
  height: 80%;
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

@media (max-width:1200px) {
  .stats {
    grid-template-columns: repeat(2, minmax(260px, 1fr));
  }
}

@media (max-width:992px) {
  .dbox {
    flex-direction: column;
  }

  .side {
    width: 100%;
    position: static;
    height: auto;
    overflow: visible;
  }
}

@media (max-width:576px) {
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
