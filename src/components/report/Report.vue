<template>
  <div class="container-fluid px-4 py-4">
    <h4 class="fw-bold mb-4"><i class="fa-solid fa-chart-pie me-2 text-primary"></i>Báo cáo kết quả kiểm kê</h4>

    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body p-4">
        <div class="d-flex align-items-end gap-3">
            
            <div class="flex-grow-1" style="max-width: 300px;">
                <label class="form-label fw-bold small text-uppercase text-muted">Kho hàng</label>
                <select v-model="filterWarehouseId" class="form-select" @change="loadData">
                    <option value="">-- Tất cả kho --</option>
                    <option v-for="w in warehouses" :key="w.id" :value="w.id">{{ w.name }}</option>
                </select>
            </div>

            <div class="btn-group">
                <button class="btn" :class="timeFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'" @click="setQuickDate('all')">Tất cả</button>
                <button class="btn" :class="timeFilter === 'month' ? 'btn-primary' : 'btn-outline-secondary'" @click="setQuickDate('month')">Tháng này</button>
            </div>

            <button class="btn btn-light border text-danger" @click="resetFilter" title="Xóa bộ lọc">
                <i class="fa-solid fa-rotate-right"></i>
            </button>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <div>
            <h5 class="mb-0 fw-bold text-dark">Danh sách phiếu đã hoàn thành ({{ reportData.length }})</h5>
        </div>
      </div>
      
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-light text-secondary">
            <tr>
              <th class="ps-4">Mã Phiếu</th>
              <th>Kho Kiểm Kê</th>
              <th>Ngày Tạo</th>
              <th>Ngày Hoàn Thành</th>
              <th>Người Tạo</th>
              <th class="text-center">Trạng thái</th>
              <th class="text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in reportData" :key="item.id">
              <td class="ps-4 fw-bold text-primary">{{ item.code }}</td>
              <td>{{ item.warehouseName }}</td>
              
              <td class="text-muted">
                  {{ fmtDate(item.createdAt) }}
              </td>

              <td class="fw-bold text-success">
                  {{ fmtDate(item.updatedAt) }}
              </td>

              <td class="fw-semibold">{{ item.createdByName }}</td>
              
              <td class="text-center">
                 <span class="badge bg-success-subtle text-success border border-success px-3">Hoàn tất</span>
              </td>
              <td class="text-center">
                <button class="btn btn-sm btn-light border" @click="$router.push(`/inventory-check/${item.id}`)">
                    Xem chi tiết
                </button>
              </td>
            </tr>
            <tr v-if="!reportData.length">
                <td colspan="7" class="text-center py-5 text-muted">
                    <i class="fa-solid fa-folder-open fs-2 mb-2 opacity-25"></i><br/>
                    Không có dữ liệu nào.
                </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { inventoryCheckService } from "../../services/inventoryCheckService";
import { warehouseService } from "../../services/WarehouseService";

const router = useRouter();
const warehouses = ref([]);
const reportData = ref([]);
const filterWarehouseId = ref("");
const timeFilter = ref("all"); // Biến để active nút bấm
const startDate = ref("");
const endDate = ref("");

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '';

function setQuickDate(type) {
    timeFilter.value = type;
    const end = new Date();
    const start = new Date();
    
    if (type === 'all') {
        startDate.value = "";
        endDate.value = "";
    } else if (type === 'month') {
        start.setDate(1);
        startDate.value = start.toISOString().split('T')[0];
        endDate.value = end.toISOString().split('T')[0];
    }
    
    loadData();
}

async function loadData() {
    try {
        if(!warehouses.value.length) warehouses.value = await warehouseService.getAllWarehouses() || [];
        
        const allChecks = await inventoryCheckService.getAll("CLOSED", 0, 100);
        let data = allChecks.content || [];

        if (filterWarehouseId.value) data = data.filter(x => x.warehouseId === filterWarehouseId.value);
        
        // Logic lọc ngày (ẩn nhưng vẫn chạy khi bấm nút nhanh)
        if (startDate.value) {
            const start = new Date(startDate.value); start.setHours(0,0,0,0);
            data = data.filter(x => new Date(x.updatedAt) >= start);
        }
        if (endDate.value) {
            const end = new Date(endDate.value); end.setHours(23,59,59,999);
            data = data.filter(x => new Date(x.updatedAt) <= end);
        }

        reportData.value = data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    } catch (e) { console.error(e); }
}

function resetFilter() {
    filterWarehouseId.value = ""; 
    setQuickDate('all');
}

onMounted(() => { setQuickDate('all'); }); 
</script>

<style scoped> .card { border-radius: 12px; } </style>