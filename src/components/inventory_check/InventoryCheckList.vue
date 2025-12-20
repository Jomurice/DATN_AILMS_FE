<template>
  <div class="container-fluid px-3 py-4">
    <div class="pbox">
      <aside class="side d-flex flex-column">
        <div class="brand"><i class="fa-solid fa-clipboard-check me-2"></i>Kiểm kê kho</div>

        <div class="mb-3 d-flex gap-2 flex-wrap">
          <button class="btn btn-sm" :class="chipCls('ALL')" @click="changeFilter('ALL')">Tất cả</button>
          
          <button class="btn btn-sm" :class="chipCls('DRAFT')" @click="changeFilter('DRAFT')">Phiếu mới</button>
          
          <button class="btn btn-sm" :class="chipCls('IN_PROGRESS')" @click="changeFilter('IN_PROGRESS')">Đang kiểm</button>
          
          <button class="btn btn-sm" :class="chipCls('PENDING_RECONCILIATION')" @click="changeFilter('PENDING_RECONCILIATION')">Chờ xử lý</button>
          
          <button class="btn btn-sm" :class="chipCls('CLOSED')" @click="changeFilter('CLOSED')">Hoàn thành</button>
        </div>

        <div class="list-group small flex-grow-1 overflow-auto mb-3 custom-scroll">
          <button
            v-for="ic in list"
            :key="ic.id"
            class="list-group-item list-group-item-action"
            :class="{ active: selectedCheck?.id === ic.id }"
            @click="selectCheck(ic)"
          >
            <div class="d-flex justify-content-between">
              <div class="fw-bold">{{ ic.code }}</div>
              <div class="badge bg-light text-dark border">{{ viStatus(ic.status) }}</div>
            </div>
            <div class="fw-semibold text-truncate mt-1">{{ ic.warehouseName }}</div>
            <div class="d-flex justify-content-between text-muted mt-1 small">
              <span>{{ fmtDate(ic.createdAt) }}</span>
              <span>{{ ic.createdByName }}</span>
            </div>
          </button>

          <div v-if="!loading && list.length === 0" class="text-muted p-3 text-center">Không có dữ liệu</div>
          <div v-if="loading" class="text-center py-3"><div class="spinner-border spinner-border-sm text-primary"></div></div>
        </div>

        <div class="pagination-controls d-flex justify-content-between align-items-center pt-2 border-top">
            <button class="btn btn-sm btn-outline-secondary" :disabled="page === 0" @click="changePage(page - 1)">
                <i class="fa-solid fa-chevron-left"></i> Trước
            </button>
            <span class="small text-muted fw-bold">Trang {{ page + 1 }} / {{ totalPages }}</span>
            <button class="btn btn-sm btn-outline-secondary" :disabled="page >= totalPages - 1" @click="changePage(page + 1)">
                Sau <i class="fa-solid fa-chevron-right"></i>
            </button>
        </div>
      </aside>

      <main class="main">
        <div class="section-card" v-if="selectedCheck">
          <div class="d-flex align-items-center justify-content-between px-3 pt-3 pb-2 border-bottom">
            <div>
              <h5 class="fw-bold mb-1">{{ selectedCheck.code }}</h5>
              <div class="text-muted small">
                Kho: <span class="text-dark fw-bold">{{ selectedCheck.warehouseName }}</span> • 
                Người tạo: {{ selectedCheck.createdByName }}
              </div>
            </div>
            <div class="d-flex gap-2">
              <RouterLink to="/inventory-check/new" class="btn btn-outline-primary btn-sm">
                 <i class="fa-solid fa-plus"></i> Tạo phiếu mới
              </RouterLink>
            </div>
          </div>

          <div class="p-3">
            <div class="row g-3 mb-3">
              <div class="col-md-6">
                <label class="fw-bold small text-muted">Trạng thái</label>
                <div><span class="badge" :class="badgeClass(selectedCheck.status)">{{ viStatus(selectedCheck.status) }}</span></div>
              </div>
              
                      <div class="col-md-6">
          <label class="fw-bold small text-muted">Ngày thực hiện</label>
          <div class="fw-bold text-primary">
            <i class="fa-regular fa-calendar me-1"></i>
            {{ new Date().toLocaleDateString('vi-VN') }}
          </div>
        </div>

              <div class="col-12">
                <label class="fw-bold small text-muted">Mục đích kiểm kê</label>
                <div class="p-2 bg-light rounded text-secondary">{{ selectedCheck.note || 'Không có ghi chú' }}</div>
              </div>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-4">
              <button v-if="selectedCheck.status === 'DRAFT'" class="btn btn-danger" @click="deleteCheck">
                  <i class="fa-solid fa-trash me-1"></i> Xóa
              </button>
              
              <RouterLink :to="`/inventory-check/${selectedCheck.id}`" class="btn btn-primary">
                  {{ getActionLabel(selectedCheck.status) }} 
                  <i class="fa-solid fa-arrow-right ms-1"></i>
              </RouterLink>
            </div>
          </div>
        </div>

        <div v-else class="section-card d-flex flex-column align-items-center justify-content-center p-5 text-muted" style="min-height: 300px;">
          <i class="fa-solid fa-clipboard-list fs-1 mb-3 text-secondary opacity-50" style="font-size: 4rem;"></i>
          <h5>Chọn phiếu kiểm kê để xem chi tiết</h5>
          <RouterLink to="/inventory-check/new" class="btn btn-primary mt-3">Tạo phiếu mới</RouterLink>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { inventoryCheckService } from "../../services/inventoryCheckService";

const list = ref([]);
const loading = ref(false);
const selectedCheck = ref(null);

const page = ref(0);
const size = ref(10);
const totalPages = ref(1);
const currentFilter = ref("ALL");

// Helpers
const chipCls = (s) => ({ 'btn-outline-secondary': currentFilter.value !== s, 'btn-primary text-white': currentFilter.value === s });

const viStatus = (s) => {
    const map = { 
        DRAFT: 'Mới tạo', 
        IN_PROGRESS: 'Đang kiểm kê', 
        PENDING_RECONCILIATION: 'Chờ xử lý', 
        CLOSED: 'Đã chốt', 
        COMPLETED: 'Đã xong'
    };
    return map[s] || s;
};

const badgeClass = (s) => {
    const map = { 
        DRAFT: 'bg-secondary', 
        IN_PROGRESS: 'bg-primary', 
        PENDING_RECONCILIATION: 'bg-warning text-dark', 
        CLOSED: 'bg-success',
        COMPLETED: 'bg-success' 
    };
    return map[s] || 'bg-secondary';
};

// LABEL HÀNH ĐỘNG
const getActionLabel = (status) => {
    if (status === 'DRAFT') return 'Bắt đầu kiểm kê'; 
    if (status === 'IN_PROGRESS') return 'Tiếp tục kiểm kê';
    if (status === 'PENDING_RECONCILIATION') return 'Xem & Chốt';
    return 'Xem chi tiết';
}

const fmtDate = (d) => {
    // Luôn trả về ngày hôm nay bất kể dữ liệu đầu vào là gì
    return new Date().toLocaleDateString('vi-VN');
};

async function load() {
  loading.value = true;
  try {
    const resPage = await inventoryCheckService.getAll(currentFilter.value, page.value, size.value);
    if (resPage && resPage.content) {
        list.value = resPage.content;
        totalPages.value = resPage.totalPages;
    } else {
        list.value = Array.isArray(resPage) ? resPage : [];
        totalPages.value = 1;
    }
    if (!list.value.find(i => i.id === selectedCheck.value?.id)) selectedCheck.value = null;
  } catch (e) { list.value = []; } 
  finally { loading.value = false; }
}

function changePage(newPage) {
    if (newPage < 0 || newPage >= totalPages.value) return;
    page.value = newPage;
    load();
}

function changeFilter(status) {
    currentFilter.value = status;
    page.value = 0; 
    load();
}

function selectCheck(ic) { selectedCheck.value = ic; }

async function deleteCheck() {
  if (!confirm("Bạn chắc chắn muốn xóa phiếu này?")) return;
  try {
    await inventoryCheckService.delete(selectedCheck.value.id);
    selectedCheck.value = null;
    load();
  } catch (e) { alert("Xóa thất bại: " + (e.response?.data?.message || "Có lỗi xảy ra")); }
}

onMounted(load);
</script>

<style scoped>
.pbox { display: flex; gap: 16px; width: 100%; height: calc(100vh - 120px); }
.side { width: 350px; background: #fff; border-radius: 12px; padding: 12px; border: 1px solid #eef2f7; display: flex; flex-direction: column; }
.main { flex: 1; display: flex; flex-direction: column; }
.section-card { background: #fff; border: 1px solid #eef2f7; border-radius: 12px; height: 100%; }
.brand { font-weight: 700; font-size: 18px; margin-bottom: 10px; display: flex; align-items: center; }
.list-group-item.active { background-color: #e8f4ff; color: #000; border-color: #cce5ff; }
.custom-scroll::-webkit-scrollbar { width: 6px; }
.custom-scroll::-webkit-scrollbar-thumb { background-color: #ddd; border-radius: 4px; }
</style>