<template>
  <div class="container-fluid px-3 py-4">
    <div class="pbox">
      <!-- Aside -->
      <aside class="side">
        <div class="brand">
          <i class="fa-solid fa-clipboard-check me-2"></i>Phiếu kiểm kê kho
        </div>

        <div class="mb-2 d-flex gap-2 flex-wrap">
          <button class="btn btn-sm" :class="chip('ALL')" @click="setStatus('ALL')">Tất cả</button>
          <button class="btn btn-sm" :class="chip('PENDING')" @click="setStatus('PENDING')">Chờ xử lý</button>
          <button class="btn btn-sm" :class="chip('IN_PROGRESS')" @click="setStatus('IN_PROGRESS')">Đang xử lý</button>
          <button class="btn btn-sm" :class="chip('COMPLETED')" @click="setStatus('COMPLETED')">Hoàn tất</button>
        </div>

        <div class="list-group small">
          <button v-for="o in filteredChecks" :key="o.id"
            class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
            :class="{ active: selectedCheck?.id === o.id }" @click="openCheck(o)">
            <div>
              <div class="fw-bold">{{ cut(o.code, 20) }}</div>
              <div class="fw-semibold">{{ cut(o.warehouseName, 20) }}</div>
              <div class="badge bg-light text-dark mt-1">{{ viStatus(o.status) }}</div>
            </div>
            <small class="text-muted">{{ formatDate(o.createdAt) }}</small>
          </button>

          <div v-if="!loading && !filteredChecks.length" class="text-muted p-3">
            Không có phiếu phù hợp
          </div>
          <div v-if="loading" class="text-center py-3">
            <div class="spinner-border text-dark"></div>
          </div>
        </div>
      </aside>

      <!-- Main -->
      <main class="main">
        <div class="section-card" v-if="selectedCheck">
          <div class="d-flex align-items-center justify-content-between px-3 pt-3 pb-2">
            <div class="fw-bold">
              <div>{{ selectedCheck.code }} — <span class="text-muted">{{ cut(selectedCheck.warehouseName, 28) }}</span></div>
              <small class="text-muted">
                Người tạo: {{ selectedCheck.createdByName }} • Ngày tạo: {{ formatDate(selectedCheck.createdAt) }} • Hạn kiểm kê: {{ formatDate(selectedCheck.deadline) }} • Trạng thái: {{ viStatus(selectedCheck.status) }}
              </small>
            </div>
            <div class="d-flex gap-2">
              <input
                v-model.trim="scanSerial"
                @keyup.enter="handleScanSerial"
                class="form-control mono"
                placeholder="Quét serial..."
                style="width: 250px;"
              />
              <button class="btn btn-primary btn-sm" @click="handleScanSerial">Quét</button>
              <button class="btn btn-outline-secondary btn-sm" @click="selectedCheck = null">← Quay lại</button>
            </div>
          </div>

          <!-- Chi tiết phiếu -->
          <div class="px-3 pb-3">
            <div class="row">
              <div class="col-md-6">
                <label class="form-label fw-semibold">Người kiểm kê</label>
                <input v-model="checkerName" class="form-control" disabled />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">Ghi chú</label>
                <input v-model="selectedCheck.note" class="form-control" disabled />
              </div>
            </div>
          </div>

          <!-- Tabs cho table -->
          <div class="px-3 pb-3">
            <ul class="nav nav-tabs">
              <li class="nav-item" v-for="tab in tabs" :key="tab.key">
                <button class="nav-link" :class="{ active: activeTab === tab.key }" @click="activeTab = tab.key">
                  {{ tab.label }} ({{ tab.count }})
                </button>
              </li>
            </ul>
          </div>

          <!-- Table -->
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="thead-soft">
                <tr class="text-uppercase fw-semibold">
                  <th>Hãng</th>
                  <th>Loại</th>
                  <th>Tên sản phẩm</th>
                  <th>Số serial</th>
                  <th>Số lượng hệ thống</th>
                  <th v-if="activeTab === 'ALL' || activeTab === 'CHECKED' || activeTab === 'UNCHECKED'">Trạng thái</th>
                  <th v-if="activeTab === 'DIFFERENCE'">Số lượng chênh lệch</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in filteredItems" :key="item.id">
                  <td>{{ item.brand || 'N/A' }}</td>
                  <td>{{ item.category || 'N/A' }}</td>
                  <td>{{ item.productName || 'N/A' }}</td>
                  <td>{{ item.serialNumber }}</td>
                  <td class="text-center">{{ item.systemQuantity }}</td>
                  <td v-if="activeTab === 'ALL' || activeTab === 'CHECKED' || activeTab === 'UNCHECKED'" class="text-center">
                    <span :class="getStatusClass(item.status)">{{ item.status || 'UNKNOWN' }}</span>
                  </td>
                  <td v-if="activeTab === 'DIFFERENCE'" class="text-center">
                    <span :class="getDifferenceClass(item.difference)">{{ item.difference }}</span>
                  </td>
                </tr>
                <tr v-if="!filteredItems.length">
                  <td colspan="6" class="text-center text-muted py-3">Không có dữ liệu</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="px-3 py-3 d-flex justify-content-end gap-2">
            <button class="btn btn-primary" @click="handleSaveTemporary" :disabled="submitting">
              Lưu tạm
            </button>
            <button class="btn btn-success" @click="handleCompleteCheck" :disabled="submitting || !canComplete">
              Hoàn tất
            </button>
          </div>
        </div>

        <div v-else class="section-card">
          <div class="px-3 pt-3 pb-2 d-flex align-items-center justify-content-between">
            <h5 class="fw-bold mb-0">Chọn 1 phiếu kiểm kê để xử lý</h5>
          </div>
          <div class="p-3 text-muted">Hãy chọn phiếu từ danh sách bên trái.</div>
        </div>
      </main>
    </div>

    <!-- Serial Scan Modal (nếu cần mở rộng) -->
    <div v-if="serialModalVisible" class="modal-overlay d-flex align-items-center justify-content-center">
      <div class="card w-50 p-2">
        <div class="d-flex align-items-center justify-content-between">
          <h5 class="mb-0">Quét serial cho {{ selectedItem?.serialNumber }}</h5>
          <button class="btn btn-sm btn-outline-secondary" @click="serialModalVisible = false">Đóng</button>
        </div>
        <input v-model="scanSerial" @keyup.enter="handleScanSerial" class="form-control" placeholder="Nhập serial..." />
        <button class="btn btn-primary mt-2" @click="handleScanSerial">Xác nhận</button>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toastMsg" class="toast-box">{{ toastMsg }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { RouterLink } from "vue-router";
import { inventoryCheckService } from "@/services/inventory/CreateInventoryService.js"; 
import { tokenService } from "@/services/TokenService.js"; 

// ===== Refs =====
const auth = tokenService();
const userId = ref("");
const checks = ref([]); // List phiếu kiểm kê
const loading = ref(true);
const status = ref("ALL");
const selectedCheck = ref(null);
const scanSerial = ref(""); // Thanh quét serial luôn hiển thị
const activeTab = ref("ALL");
const serialModalVisible = ref(false);
const selectedItem = ref(null);
const toastMsg = ref("");
let toastTimer = null;

// Checker name (từ user hiện tại)
const checkerName = computed(() => auth.userName || "—");

// ======== Helpers ========
const cut = (s, n = 20) => s && s.length > n ? s.slice(0, n) + "..." : s || "";
const formatDate = (x) => {
  if (!x) return "—";
  try {
    const t = new Date(x);
    return isNaN(+t) ? x : t.toISOString().slice(0, 10);
  } catch {
    return x;
  }
};
const key = (s) => String(s || "").trim().toLowerCase();

// ======== Filters ========
const chip = (s) => ({ "btn-outline-secondary": status.value !== s, "btn-primary text-white": status.value === s });
const viStatus = (s) => {
  const k = String(s || "").toUpperCase();
  if (k === "PENDING") return "Chờ xử lý";
  if (k === "IN_PROGRESS") return "Đang xử lý";
  if (k === "COMPLETED") return "Hoàn tất";
  return s || "—";
};
const filteredChecks = computed(() => {
  if (status.value === "ALL") return checks.value;
  return checks.value.filter(o => String(o.status || "").toUpperCase() === status.value);
});

// ======== Tabs & Filtered Items ========
const tabs = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'CHECKED', label: 'Đã kiểm' },
  { key: 'UNCHECKED', label: 'Chưa kiểm' },
  { key: 'DIFFERENCE', label: 'Chênh lệch' }
];

const filteredItems = computed(() => {
  if (!selectedCheck.value || !selectedCheck.value.items) return [];
  let items = [...selectedCheck.value.items];

  // Lọc theo tab
  if (activeTab.value === 'CHECKED') {
    items = items.filter(i => (i.countedQuantity || 0) > 0);
  } else if (activeTab.value === 'UNCHECKED') {
    items = items.filter(i => (i.countedQuantity || 0) === 0);
  } else if (activeTab.value === 'DIFFERENCE') {
    items = items.filter(i => (i.systemQuantity || 0) !== (i.countedQuantity || 0));
    items.forEach(i => i.difference = (i.systemQuantity || 0) - (i.countedQuantity || 0));
  }

  // Update count for tabs
  tabs[0].count = selectedCheck.value.items.length;
  tabs[1].count = items.filter(i => (i.countedQuantity || 0) > 0).length;
  tabs[2].count = items.filter(i => (i.countedQuantity || 0) === 0).length;
  tabs[3].count = items.filter(i => (i.systemQuantity || 0) !== (i.countedQuantity || 0)).length;

  return items;
});

// ======== Computed ========
const canComplete = computed(() => {
  if (!selectedCheck.value) return false;
  const s = String(selectedCheck.value.status || "").toUpperCase();
  if (s === "COMPLETED") return false;
  return selectedCheck.value.items.every(i => (i.countedQuantity || 0) > 0); // Ví dụ: Tất cả checked
});

// ======== Methods ========
const setStatus = (s) => status.value = s;

async function initChecks() {
  loading.value = true;
  try {
    auth.loadToken();
    userId.value = auth.userId;
    const response = await inventoryCheckService.getAll(); // Giả sử service có getAll()
    checks.value = response;
  } catch (error) {
    console.error("Lỗi load danh sách phiếu:", error);
    showToast("Không tải được danh sách phiếu kiểm kê.");
  } finally {
    loading.value = false;
  }
}

async function openCheck(o) {
  try {
    const full = await inventoryCheckService.getCheckById(o.id); // Giả sử service có getById()
    selectedCheck.value = full;
    console.log('Chi tiết phiếu:', full);
    showToast("Đã tải chi tiết phiếu thành công!");
  } catch (err) {
    console.error("Lỗi open check:", err);
    showToast("Không tải được chi tiết phiếu kiểm kê.");
  }
}

async function handleScanSerial() {
  const serial = scanSerial.value.trim();
  if (!serial) return showToast("Chưa nhập serial");
  if (!selectedCheck.value) return showToast("Chưa chọn phiếu");

  try {
    const response = await inventoryCheckService.scanSerial(selectedCheck.value.id, serial, userId.value);
    console.log('Scan response:', response);
    
    // Update local item (tăng countedQuantity)
    const existingItem = selectedCheck.value.items.find(item => item.serialNumber === serial);
    if (existingItem) {
      existingItem.countedQuantity += 1;
      updateItemStatus(existingItem);
      await updateItem(existingItem);
    } else {
      // Add new overage item (nếu API return new item)
      selectedCheck.value.items.push({
        id: response.id,
        productDetailId: response.productDetailId,
        productName: response.productName || 'Unknown',
        serialNumber: serial,
        brand: 'N/A',
        category: 'N/A',
        systemQuantity: 0,
        countedQuantity: 1,
        status: 'OVERAGE',
        note: '',
      });
    }
    scanSerial.value = '';
    showToast(`✅ Quét serial ${serial} thành công.`);
  } catch (error) {
    console.error('Lỗi scan:', error);
    showToast(`❌ Lỗi quét serial: ${error.response?.data?.message || error.message}`);
  }
}

function updateItemStatus(item) {
  const sys = item.systemQuantity || 0;
  const cnt = item.countedQuantity || 0;
  if (sys === cnt) item.status = 'MATCHED';
  else if (sys > cnt) item.status = 'SHORTAGE';
  else item.status = 'OVERAGE';
}

async function updateItem(item) {
  try {
    const payload = {
      countedQuantity: item.countedQuantity,
      note: item.note,
    };
    await inventoryCheckService.updateItem(item.id, payload); // Giả sử service có updateItem
    showToast('Cập nhật item thành công.');
  } catch (error) {
    console.error('Lỗi update item:', error);
    showToast('Lỗi cập nhật item.');
  }
}

async function handleSaveTemporary() {
  submitting.value = true;
  try {
    for (const item of selectedCheck.value.items) {
      if (item.countedQuantity !== item.systemQuantity || item.note) {
        await updateItem(item);
      }
    }
    showToast('Lưu tạm thành công.');
  } catch (error) {
    console.error('Lỗi save temporary:', error);
    showToast('Lỗi lưu tạm.');
  } finally {
    submitting.value = false;
  }
}

async function handleCompleteCheck() {
  if (!canComplete.value) return showToast("Vui lòng kiểm kê đầy đủ.");
  try {
    submitting.value = true;
    const response = await inventoryCheckService.completeCheck(selectedCheck.value.id); // Giả sử service có completeCheck
    console.log('Complete response:', response);
    showToast(`✅ Hoàn tất phiếu ${selectedCheck.value.code} thành công!`);
    await initChecks(); // Reload list
    selectedCheck.value = null;
  } catch (error) {
    console.error('Lỗi complete:', error);
    showToast(`❌ Lỗi hoàn tất: ${error.response?.data?.message || error.message}`);
  } finally {
    submitting.value = false;
  }
}

function getStatusClass(status) {
  switch (status) {
    case 'MATCHED': return 'text-success';
    case 'SHORTAGE': return 'text-danger';
    case 'OVERAGE': return 'text-warning';
    default: return 'text-muted';
  }
}

function getDifferenceClass(diff) {
  if (diff === 0) return 'text-success';
  if (diff > 0) return 'text-danger'; // Thiếu
  return 'text-warning'; // Thừa
}

function showToast(msg = '') { 
  toastMsg.value = msg; 
  clearTimeout(toastTimer); 
  toastTimer = setTimeout(() => toastMsg.value = '', 3000); 
}

onMounted(async () => {
  await initChecks();
});
</script>

<style scoped>
/* Copy style từ template bạn gửi – giống inbound form */
.pbox { display: flex; gap: 16px; width: 100%; }
.side {
  width: 320px; background: #fff; border-radius: 14px; padding: 14px;
  position: sticky; top: 96px; height: calc(100vh - 110px); overflow: auto;
}
.brand { font-weight: 700; font-size: 18px; display: flex; align-items: center; margin-bottom: 10px; }
.main { flex: 1; display: flex; flex-direction: column; gap: 16px; }
.section-card { background: #fff; border: 1px solid #eef2f7; border-radius: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.03); }

.badge-card { background: #fff; border: 1px solid #eef2f7; border-radius: 10px; padding: 8px 14px; text-align: center; display: inline-flex; flex-direction: column; min-width: 140px; }
.badge-card .num { font-weight: 700; color: #1f2937; font-size: 18px; }

.table-responsive { overflow-x: auto; }
.table-hover th, .table-hover td { vertical-align: middle; white-space: nowrap; height: 56px; }
.nowrap { white-space: nowrap; }
.thead-soft th { background: #cfe3ff; color: #0b1324; font-weight: 600; letter-spacing: 0.2px; border-top: 1px solid #9ec5fe; border-bottom: 1px solid #9ec5fe; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 10000; }
.toast-box { position: fixed; bottom: 20px; right: 20px; background: #111; color: #fff; padding: 10px 14px; border-radius: 8px; z-index: 20000; }

.nav-tabs .nav-link { border: 1px solid #dee2e6; border-top-left-radius: 0.375rem; border-top-right-radius: 0.375rem; }
.nav-tabs .nav-link.active { border-bottom-color: #fff; background: #fff; }

@media (max-width: 992px) {
  .pbox { flex-direction: column; }
  .side { width: 100%; height: auto; position: static; }
}
</style>