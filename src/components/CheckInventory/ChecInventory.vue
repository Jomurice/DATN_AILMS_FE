<template>
  <div class="container-fluid px-3 py-4">
    <div class="pbox">
      <aside class="side">
        <div class="brand">
          <i class="fa-solid fa-clipboard-check me-2"></i>Phiếu Kiểm Kê
        </div>

        <div class="mb-2 d-flex gap-2 flex-wrap">
          <button class="btn btn-sm" :class="chip('ALL')" @click="status = 'ALL'">
            Tất cả
          </button>
          <button class="btn btn-sm" :class="chip('DRAFT')" @click="status = 'DRAFT'">
            Chờ xử lý
          </button>
          <button class="btn btn-sm" :class="chip('IN_PROGRESS')" @click="status = 'IN_PROGRESS'">
            Đang thực hiện
          </button>
          <button class="btn btn-sm" :class="chip('COMPLETED')" @click="status = 'COMPLETED'">
            Hoàn tất
          </button>
        </div>

        <div class="list-group small">
          <button v-for="o in filteredChecks" :key="o.id"
            class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
            :class="{ active: selectedCheck?.id === o.id }" @click="openCheck(o)">
            <div>
              <div class="fw-bold">{{ cut(o.code, 20) }}</div>
              <div class="fw-semibold">{{ cut(o.warehouseName, 20) }}</div>
              <div class="badge bg-light mt-1" :class="statusBg(o.status)">
                {{ viStatus(o.status) }}
              </div>
            </div>
            <small class="text-muted">{{ d(o.createdAt) }}</small>
          </button>

          <div v-if="!loading && !filteredChecks.length" class="text-muted p-3">
            Không có phiếu phù hợp
          </div>
          <div v-if="loading" class="text-center py-3">
            <div class="spinner-border text-primary"></div>
          </div>
        </div>
      </aside>

      <main class="main">
        <div class="section-card" v-if="selectedCheck">
          <div class="px-3 pt-3 pb-2 mb-3 border-bottom">
            <div class="d-flex align-items-center justify-content-between">
              <h5 class="fw-bold mb-0 text-primary">
                {{ selectedCheck.code }}
              </h5>
              <button class="btn btn-outline-secondary btn-sm" @click="selectedCheck = null">
                ← Quay lại
              </button>
            </div>

            <div class="grid-check-info small mt-2">
              <div><span class="text-muted">Kho:</span> <span class="fw-semibold">{{ selectedCheck.warehouseName }}</span></div>
              <div><span class="text-muted">Người tạo:</span> <span>{{ selectedCheck.createdByName }}</span></div>
              <div><span class="text-muted">Người kiểm kê:</span> <span class="fw-bold text-success">{{ checkUser.name }}</span></div>
              <div><span class="text-muted">Ngày tạo:</span> <span>{{ d(selectedCheck.createdAt) }}</span></div>
              <div><span class="text-muted">Hạn kiểm kê:</span> <span class="fw-bold text-danger">{{ d(selectedCheck.deadline) }}</span></div>
              <div><span class="text-muted">Ghi chú:</span> <span>{{ cut(selectedCheck.note, 30) || '—' }}</span></div>
              <div><span class="text-muted">Trạng thái:</span> <span :class="statusText(selectedCheck.status)">{{ viStatus(selectedCheck.status) }}</span></div>
            </div>
          </div>

          <div class="px-3 pb-3 d-flex align-items-center flex-wrap gap-3">
            <div class="flex-grow-1 d-flex align-items-center gap-2">
              <input ref="quickInputRef" v-model.trim="quickSerial" @keyup.enter="handleQuickScan"
                class="form-control mono" placeholder="Quét nhanh serial..."
                :disabled="!canScan" />
              <button class="btn btn-primary" @click="handleQuickScan" :disabled="!canScan || isScanning">
                <span v-if="isScanning" class="spinner-border spinner-border-sm me-2"></span>
                Quét
              </button>
            </div>
          </div>

          <ul class="nav nav-tabs px-3" role="tablist">
            <li class="nav-item" v-for="tab in tabs" :key="tab.status">
              <button class="nav-link" :class="{ active: currentTab === tab.status }" @click="currentTab = tab.status">
                {{ tab.name }} ({{ tab.count }})
              </button>
            </li>
          </ul>

          <div class="table-responsive p-3">
            <table class="table table-hover mb-0 table-sm align-middle">
              <thead class="thead-soft">
                <tr class="text-uppercase fw-semibold">
                  <th style="width: 50px;">#</th>
                  <th>Hãng</th>
                  <th>Loại</th>
                  <th>Tên sản phẩm</th>
                  <th>Số serial</th>
                  <th class="text-center">SL Hệ thống</th>
                  <th class="text-center">SL Thực tế (*)</th>
                  <th class="text-center">Chênh lệch</th>
                  <th style="width: 150px;">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in filteredCheckItems" :key="item.id">
                  <td class="center">{{ idx + 1 }}</td>
                  <td>{{ item.brandName || '—' }}</td>
                  <td>{{ item.categoryName || '—' }}</td>
                  <td>{{ item.productName || item.productSku }}</td>
                  <td class="mono fw-semibold">{{ item.serialNumber }}</td>
                  
                  <td class="text-center text-primary fw-bold">{{ item.systemQuantity }}</td>

                  <td>
                    <input type="number" 
                           v-model.number="item.countedQuantity" 
                           class="form-control form-control-sm text-end" 
                           min="0" 
                           :disabled="!canEditCount"
                           @change="updateDifference(item)"
                    />
                  </td>

                  <td class="text-center fw-bold" :class="getDifferenceClass(item)">
                      {{ item.difference || 0 }}
                  </td>
                  
                  <td>
                    <span class="badge" :class="statusBg(item.status)">
                        {{ viStatus(item.status) }}
                    </span>
                  </td>
                </tr>
                <tr v-if="!filteredCheckItems.length">
                  <td colspan="9" class="text-center text-muted py-3">
                    Không có hàng hóa nào thuộc danh mục: {{ tabs.find(t => t.status === currentTab)?.name }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="px-3 py-3 d-flex justify-content-end gap-2 border-top">
            <button class="btn btn-outline-success" 
                    :disabled="!canSaveTemp" 
                    @click="showSaveModal = true">
              Lưu tạm
            </button>

            <button class="btn btn-primary" :disabled="!canCompleteFinal" @click="completeCheck">
              Hoàn tất
            </button>
          </div>
        </div>

        <div v-else class="section-card">
          <div class="p-4 text-center">
            <h5 class="fw-bold mb-0">Chọn 1 Phiếu Kiểm Kê để bắt đầu đếm</h5>
            <div class="text-muted mt-2">
              Sử dụng danh sách bên trái để chọn phiếu.
            </div>
          </div>
        </div>
      </main>
    </div>

    <div v-if="showSaveModal" class="custom-modal-backdrop">
      <div class="custom-modal-dialog">
        <div class="custom-modal-content">
          <div class="custom-modal-header">
            <h5 class="custom-modal-title">Xác nhận Lưu Tạm</h5>
          </div>
          <div class="custom-modal-body text-center">
            <p class="h5">Bạn có chắc chắn muốn lưu tạm kết quả kiểm kê hiện tại?</p>
            <small class="text-muted">Các thay đổi sẽ được lưu nhưng phiếu chưa được hoàn tất.</small>
          </div>
          <div class="custom-modal-footer">
            <button type="button" class="btn btn-primary" @click="showSaveModal = false">
              Huỷ
            </button>
            <button type="button" class="btn btn-secondary" @click="saveCountedItems">
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="toastMsg" class="toast-box">{{ toastMsg }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
// Giả định API Service
import { inventoryPerformService } from "@/services/inventory/InventoryPerformService"; 
import { tokenService } from "@/services/TokenService"; 
import api from "@/services/axios"; // Giả định axios đã được cấu hình

const route = useRoute();
const auth = tokenService();
const userId = ref("");

/* ========== helpers ========== */
const cut = (s, n = 20) => s && s.length > n ? s.slice(0, n) + "..." : s || "";
const d = (x) => {
  if (!x) return "—";
  try {
    const t = new Date(x);
    return isNaN(+t) ? x : t.toISOString().slice(0, 10);
  } catch { return x; }
};
const key = (s) => String(s || "").trim().toLowerCase();
let toastTimer = null;

/* ========== state ========== */
const checks = ref([]); // Danh sách phiếu kiểm kê
const loading = ref(true);
const status = ref("ALL"); // Trạng thái lọc danh sách
const selectedCheck = ref(null); // Phiếu đang được chọn
const checkItems = ref([]); // Chi tiết items của phiếu đang chọn
const quickSerial = ref("");
const quickInputRef = ref(null);
const isScanning = ref(false);

const currentTab = ref("ALL"); // Tab hiện tại trong bảng chi tiết
const showSaveModal = ref(false); // Điều khiển modal lưu tạm
const toastMsg = ref("");

// Dữ liệu người kiểm kê (Giả định lấy từ Auth user)
const checkUser = computed(() => ({
    id: auth.userId,
    name: auth.userName || 'Tài khoản hiện tại'
}));

/* ========== filters / computed ========== */

// Lọc trạng thái danh sách phiếu
const filteredChecks = computed(() => {
  if (status.value === "ALL") return checks.value;
  return checks.value.filter((o) => {
    const k = String(o.status || "").toUpperCase();
    return k === status.value;
  });
});

// Logic phân loại và đếm số lượng cho từng tab
const tabs = computed(() => {
    const items = checkItems.value;
    const all = items.length;
    const checked = items.filter(i => i.status === 'MATCHED' || i.status === 'OVERAGE' || i.status === 'SHORTAGE').length;
    const unchecked = items.filter(i => i.status === 'DRAFT' || i.status === 'UNKNOWN').length;
    const variance = items.filter(i => i.difference !== 0).length;

    return [
        { name: "Tất cả", status: "ALL", count: all },
        { name: "Đã kiểm", status: "CHECKED", count: checked },
        { name: "Chưa kiểm", status: "UNCHECKED", count: unchecked },
        { name: "Chênh lệch", status: "VARIANCE", count: variance },
    ];
});

// Lọc Item theo Tab
const filteredCheckItems = computed(() => {
    const items = checkItems.value;
    const tab = currentTab.value;
    if (tab === 'ALL') return items;
    
    if (tab === 'CHECKED') {
        return items.filter(i => i.status === 'MATCHED' || i.status === 'OVERAGE' || i.status === 'SHORTAGE');
    }
    if (tab === 'UNCHECKED') {
        return items.filter(i => i.status === 'DRAFT' || i.status === 'UNKNOWN');
    }
    if (tab === 'VARIANCE') {
        return items.filter(i => i.difference !== 0);
    }
    return items;
});


const canEditCount = computed(() => {
    const status = (selectedCheck.value?.status || "").toUpperCase();
    return status === "IN_PROGRESS" || status === "DRAFT";
});

const canScan = computed(() => {
    const status = (selectedCheck.value?.status || "").toUpperCase();
    return status === "IN_PROGRESS" || status === "DRAFT";
});

const canSaveTemp = computed(() => {
    const status = (selectedCheck.value?.status || "").toUpperCase();
    // Chỉ cho phép lưu tạm khi đang thực hiện
    return status === "IN_PROGRESS"; 
});

const canCompleteFinal = computed(() => {
    if (!selectedCheck.value) return false;
    // Yêu cầu: tất cả sản phẩm phải được kiểm (đã có trạng thái khác UNKNOWN/DRAFT)
    const status = (selectedCheck.value?.status || "").toUpperCase();
    if (status !== "IN_PROGRESS") return false;

    // Kiểm tra tất cả đã được đánh dấu kiểm chưa
    const unchecked = checkItems.value.some(i => i.status === 'DRAFT' || i.status === 'UNKNOWN');
    return !unchecked;
});

// Helpers
const chip = (s) => ({
    "btn-outline-secondary": status.value !== s,
    "btn-primary text-white": status.value === s,
});
const viStatus = (s) => {
    const k = String(s || "").toUpperCase();
    if (k === "DRAFT" || k === "PENDING" || k === "UPCOMING") return "Chờ xử lý";
    if (k === "IN_PROGRESS") return "Đang thực hiện";
    if (k === "COMPLETED" || k === "DONE") return "Hoàn tất";
    if (k === "MATCHED") return "Khớp";
    if (k === "SHORTAGE") return "Thiếu";
    if (k === "OVERAGE") return "Thừa";
    if (k === "UNKNOWN") return "Chưa kiểm";
    return s || "—";
};
const statusBg = (s) => {
    const k = String(s || "").toUpperCase();
    if (k === "DRAFT" || k === "UNKNOWN") return "bg-secondary text-white";
    if (k === "IN_PROGRESS") return "bg-info text-dark";
    if (k === "COMPLETED") return "bg-success text-white";
    if (k === "SHORTAGE") return "bg-danger text-white";
    if (k === "OVERAGE") return "bg-warning text-dark";
    if (k === "MATCHED") return "bg-success text-white";
    return "bg-light text-dark";
};
const statusText = (s) => {
    const k = String(s || "").toUpperCase();
    if (k === "IN_PROGRESS") return "text-info fw-bold";
    if (k === "COMPLETED") return "text-success fw-bold";
    return "text-muted";
};


/* ========== methods ========== */

// Cập nhật chênh lệch khi input thay đổi
const updateDifference = (item) => {
    item.difference = (item.countedQuantity || 0) - (item.systemQuantity || 0);

    // Cập nhật trạng thái item tạm thời (dựa trên FE)
    if (item.difference === 0) item.status = 'MATCHED';
    else if (item.difference < 0) item.status = 'SHORTAGE';
    else if (item.difference > 0) item.status = 'OVERAGE';
    else item.status = 'UNKNOWN'; 
};

const getDifferenceClass = (item) => {
    if (item.difference < 0) return 'text-danger';
    if (item.difference > 0) return 'text-warning';
    if (item.difference === 0) return 'text-success';
    return '';
};


// Mở phiếu kiểm kê (Load header + items)
async function openCheck(o) {
  try {
    loading.value = true;
    
    // 1. GỌI API: Lấy chi tiết header phiếu
    const fullCheck = await inventoryPerformService.getCheckById(o.id);

    // 2. GỌI API: Lấy danh sách items chi tiết
    const items = await inventoryPerformService.getItemsByCheckId(o.id);
    
    // 3. Chuẩn hóa và tính toán difference/status ban đầu
    checkItems.value = items.map(item => ({
        ...item,
        difference: (item.countedQuantity || 0) - (item.systemQuantity || 0),
        // Giả định backend đã trả về status đúng (MATCHED, UNKNOWN...)
    }));

    selectedCheck.value = fullCheck;
    
    // 4. Nếu phiếu là DRAFT, chuyển sang IN_PROGRESS (Dựa vào API startCheck)
    if (fullCheck.status === 'DRAFT') {
        const startedCheck = await inventoryPerformService.startCheck(o.id, checkUser.value.id);
        selectedCheck.value = startedCheck;
    }

    toast("Đã tải chi tiết phiếu thành công!");
  } catch (err) {
    console.error("openCheck error", err);
    toast("Không tải được chi tiết phiếu kiểm kê.");
  } finally {
    loading.value = false;
  }
}

// Lưu tạm thời kết quả đếm (Gửi PUT cho tất cả Items đã chỉnh sửa)
async function saveCountedItems() {
    isSaving.value = true;
    showSaveModal.value = false; // Đóng modal
    try {
        const itemsToUpdate = checkItems.value.filter(i => 
            // Lọc ra các item đã thay đổi CountedQuantity hoặc Note (hoặc tất cả)
            i.status !== 'UNKNOWN' && i.status !== 'DRAFT' 
        );

        // Gửi từng PUT request cho mỗi item (dựa trên Controller: PUT /{id}/items/{itemId})
        for (const item of checkItems.value) {
            const itemPayload = {
                countedQuantity: item.countedQuantity,
                note: item.note,
                // Không gửi productDetailId khi UPDATE Item
            };
            
            await inventoryPerformService.updateItemManual(item.id, itemPayload);
        }
        
        toast('✅ Đã lưu kết quả đếm tạm thời.');

    } catch (error) {
        console.error("Lỗi khi lưu tạm:", error);
        toast('❌ Lỗi: Không thể lưu tạm kết quả kiểm kê.');
    } finally {
        isSaving.value = false;
    }
}

// Hoàn tất Kiểm kê
async function completeCheck() {
    if (!confirm("Xác nhận hoàn tất kiểm kê? Bạn sẽ không thể chỉnh sửa sau khi hoàn tất.")) return;
    
    isSaving.value = true;
    try {
        // 1. Đảm bảo tất cả các thay đổi cuối cùng đã được lưu (Gọi saveCountedItems)
        await saveCountedItems(); 

        // 2. GỌI API: Hoàn tất phiếu (POST /api/inventories/{id}/complete)
        await inventoryPerformService.completeCheck(selectedCheck.value.id);
        
        toast('✅ Hoàn tất kiểm kê thành công!');
        
        // Cập nhật lại danh sách phiếu và reset view
        await loadChecks();
        selectedCheck.value = null;

    } catch (err) {
        console.error("Complete error", err);
        toast(err.response?.data?.message || "Có lỗi khi hoàn tất kiểm kê");
    } finally {
        isSaving.value = false;
    }
}

// Xử lý Quét Serial (Tương tác với API Scan)
async function handleQuickScan() {
    const serial = String(quickSerial.value || "").trim();
    if (!serial || !selectedCheck.value) return;

    isScanning.value = true;
    try {
        // 1. GỌI API: Scan Serial (POST /api/inventories/{id}/scan)
        const updatedItem = await inventoryPerformService.scanSerial(
            selectedCheck.value.id, 
            serial, 
            checkUser.value.id
        );

        // 2. Cập nhật giao diện cục bộ (Tìm và cập nhật item trong checkItems)
        const itemIndex = checkItems.value.findIndex(item => item.id === updatedItem.id);
        if (itemIndex !== -1) {
            // Cập nhật thông tin từ API response (CountedQuantity, Status)
            checkItems.value[itemIndex].countedQuantity = updatedItem.countedQuantity;
            checkItems.value[itemIndex].status = updatedItem.status;
            updateDifference(checkItems.value[itemIndex]); // Tính lại chênh lệch
        } else {
            // Trường hợp Serial này là Overage (thừa), BE tạo Item mới và trả về
            // Trong FE cần xử lý để thêm item này vào danh sách checkItems (cần reload items hoặc xử lý logic thêm item mới)
            // Tạm thời: Gây ra reload toàn bộ items để đơn giản hóa
            await openCheck(selectedCheck.value); 
        }

        toast(`✅ Serial ${serial} đã được quét.`);

    } catch (err) {
        console.error("Scan error", err);
        const msg = err.response?.data?.message;
        toast(msg || "Có lỗi xảy ra khi quét Serial");
    } finally {
        quickSerial.value = "";
        isScanning.value = false;
        quickInputRef.value?.focus();
    }
}

// Load danh sách phiếu kiểm kê
async function loadChecks() {
    try {
        loading.value = true;
        checks.value = await inventoryPerformService.getAllChecks();
    } catch {
        toast("Không tải được danh sách phiếu kiểm kê");
    } finally {
        loading.value = false;
    }
}

function toast(msg = "") {
    toastMsg.value = msg;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (toastMsg.value = ""), 1600);
}

/* ========== onMounted ========== */
onMounted(async () => {
    auth.loadToken();
    userId.value = auth.userId;
    await loadChecks();
    
    // Nếu có ID trong URL, tự động mở phiếu đó
    if (route.params.id) {
        // Tìm phiếu trong danh sách hoặc tạo đối tượng giả để mở
        const checkToOpen = checks.value.find(c => c.id === route.params.id) || { id: route.params.id };
        if (checkToOpen.id) {
            await openCheck(checkToOpen);
        }
    }
});
</script>

<style scoped>
/* Thêm CSS cho Modal */
.custom-modal-backdrop {
    position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.5); 
    display: flex; justify-content: center; align-items: center; z-index: 1050;
}
.custom-modal-dialog {
    background: white; border-radius: 10px; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3); width: 90%; max-width: 450px; 
}
.custom-modal-content { display: flex; flex-direction: column; }
.custom-modal-header, .custom-modal-footer { padding: 15px; border-top: 1px solid #eee; }
.custom-modal-body { padding: 20px; }
.custom-modal-footer { justify-content: flex-end; gap: 10px; }

/* Grid cho thông tin Header */
.grid-check-info {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px 15px;
    padding-bottom: 10px;
}
.grid-check-info .lbl {
    font-weight: 500;
    color: #4b5563;
}
.thead-soft th {
    background: #e9ecef !important;
    color: #495057 !important;
}
/* Các style khác (pbox, side, main, toast-box) giữ nguyên như code gốc của bạn */
</style>