<template>
  <div class="container-fluid px-4 py-4" v-if="check">
    
    <div v-if="toastMsg" class="position-fixed top-0 end-0 p-3" style="z-index: 9999">
        <div class="toast show align-items-center shadow border-0" 
            :class="toastIsError ? 'bg-white text-danger border border-danger' : 'bg-success text-white'"
            role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body fw-bold">
                    <i :class="toastIsError ? 'fa-solid fa-circle-exclamation' : 'fa-solid fa-check-circle'" class="me-2"></i>
                    {{ toastMsg }}
                </div>
                <button type="button" class="btn-close me-2 m-auto" 
                        :class="!toastIsError ? 'btn-close-white' : ''" 
                        @click="toastMsg=''"></button>
            </div>
        </div>
    </div>
    <div class="d-flex justify-content-between align-items-start mb-3">
      <div>
        <h4 class="fw-bold mb-1">
            {{ check.code }} 
            <span class="badge bg-secondary">{{ viStatus(check.status) }}</span>
        </h4>
        <div class="text-muted small">
            Kho: {{ check.warehouseName }}
        </div>
      </div>

      <div class="d-flex gap-2">
        <button class="btn btn-light border" @click="$router.push('/inventory-check')">Danh sách</button>
        
        <template v-if="check.status === 'IN_PROGRESS' || check.status === 'DRAFT'">
            <button v-if="rolesLoaded && (role === 'ADMIN' || role === 'LM')" class="btn btn-success" @click="handleComplete">
                <i class="fa-solid fa-check me-1"></i> Hoàn tất
            </button>
        </template>

        <button 
            v-if="check.status === 'PENDING_RECONCILIATION' && rolesLoaded && (role === 'ADMIN' || role === 'LM')" 
            class="btn btn-dark" 
            @click="handleClose"
        >
            <i class="fa-solid fa-gavel me-1"></i> Chốt sổ
        </button>
      </div>
    </div>

    <div v-if="check.status === 'IN_PROGRESS' || check.status === 'DRAFT'" class="alert alert-warning border-start border-warning border-4 small mb-3 shadow-sm" role="alert">
        <i class="fa-solid fa-clock me-2"></i>
        <strong>LƯU Ý QUAN TRỌNG:</strong> Vui lòng hoàn tất kiểm kê và chốt sổ trước khi kho hoạt động trở lại để đảm bảo chính xác.
    </div>

    <div class="alert alert-light border d-flex justify-content-between align-items-center mb-3">
        <div><strong>Tổng số lượng:</strong> {{ items.length }}</div>
        <div><span class="text-success fw-bold">Đã đếm: {{ stats.counted }}</span></div>
        <div><span class="text-danger fw-bold">Chưa đếm: {{ stats.notCounted }}</span></div>
        <div v-if="stats.overage > 0"><span class="text-warning fw-bold text-dark">Hàng thừa: {{ stats.overage }}</span></div>
    </div>

    <div v-if="check.status === 'IN_PROGRESS' || check.status === 'DRAFT'" class="mb-3">
        <div class="input-group">
            <input 
                ref="scanInput"
                v-model="scanQuery" 
                class="form-control" 
                placeholder="Quét mã vạch vào đây..." 
                @keyup.enter="handleScan"
                @input="handleSuggest"
                :disabled="processing"
                autocomplete="off"
            />
            <button class="btn btn-primary" type="button" @click="handleScan" :disabled="processing">Quét</button>
            <button class="btn btn-success" @click="startQrScanner">Quét QR</button>
        </div>
        
        <div v-if="qrScannerVisible" class="my-3">
          <div id="qr-reader" style="width: 100%;"></div>
          <button class="btn btn-secondary mt-2" @click="stopQrScanner">Dừng QR</button>
        </div>

        <ul v-if="suggestions.length" class="list-group position-absolute shadow mt-1" style="z-index: 1050; width: 50%;">
            <li v-for="s in suggestions" :key="s" class="list-group-item list-group-item-action cursor-pointer" @click="selectSuggestion(s)">{{ s }}</li>
        </ul>

        <div v-if="scanMessage" class="mt-2 fw-bold" :class="scanError ? 'text-danger' : 'text-success'">
            <i :class="scanError ? 'fa-solid fa-circle-exclamation' : 'fa-solid fa-check-circle'"></i> {{ scanMessage }}
        </div>
    </div>

    <div class="card border shadow-sm">
      <div class="card-header bg-light py-2 d-flex justify-content-between align-items-center">
          <span class="fw-bold">Chi tiết kiểm kê</span>
          
          <div class="btn-group btn-group-sm" v-if="check.status !== 'DRAFT' && check.status !== 'IN_PROGRESS'">
             <button class="btn btn-outline-secondary" @click="tableFilter='ALL'; currentPage=1" :class="{active: tableFilter==='ALL'}">Tất cả</button>
             <button class="btn btn-outline-success" @click="tableFilter='MATCHED'; currentPage=1" :class="{active: tableFilter==='MATCHED'}">Khớp</button>
             <button class="btn btn-outline-danger" @click="tableFilter='SHORTAGE'; currentPage=1" :class="{active: tableFilter==='SHORTAGE'}">Thiếu</button>
          </div>
      </div>
      
      <div class="table-responsive">
        <table class="table table-bordered table-hover mb-0 align-middle text-center">
          <thead class="table-light">
            <tr>
                <th class="text-start">SKU</th>
                <th class="text-start">Tên Sản Phẩm</th>
                <th>Serial</th>
                <th>Ngày nhập</th>
                <th>Hệ thống</th>
                <th>Thực tế</th>
                <th>Trạng thái</th>
                <th>Người quét</th> <th>Giờ quét</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in paginatedItems" :key="item.id" :class="getRowClass(item)">
              <td class="text-start fw-bold text-primary">{{ item.productSku || '-' }}</td>
              
              <td class="text-start small">
                  <span v-if="item.productName">{{ item.productName }}</span>
                  <span v-else class="text-muted fst-italic opacity-75">-- Chưa xác định --</span>
              </td>

              <td class="font-monospace">{{ item.serialNumber }}</td>
              <td class="small text-muted">{{ item.importDate ? new Date(item.importDate).toLocaleDateString('vi-VN') : '-' }}</td>
              <td>{{ item.systemQuantity }}</td>
              
              <td :class="{'fw-bold text-success': item.countedQuantity > 0}">
                  {{ item.countedQuantity }}
              </td>

              <td>
                <span class="badge rounded-pill px-3" :class="itemStatusBadge(item)">
                    {{ viItemStatus(item) }}
                </span>
              </td>

              <td class="small fw-bold text-dark">{{ item.scannedByName || '-' }}</td>
              
              <td class="small text-muted">
                {{ item.checkedTime ? new Date(item.checkedTime).toLocaleTimeString('vi-VN') : '' }}
              </td>
            </tr>
            <tr v-if="!paginatedItems.length">
                <td colspan="9" class="text-center text-muted py-4">Không có dữ liệu.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card-footer bg-white d-flex justify-content-between align-items-center py-2" v-if="totalPages > 1">
          <small class="text-muted">Hiển thị {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, filteredItems.length) }} trong tổng số {{ filteredItems.length }} dòng</small>
          
          <nav>
              <ul class="pagination pagination-sm mb-0">
                  <li class="page-item" :class="{disabled: currentPage === 1}">
                      <button class="page-link" @click="currentPage--">Trước</button>
                  </li>
                  <li class="page-item disabled">
                      <span class="page-link text-dark fw-bold">Trang {{ currentPage }} / {{ totalPages }}</span>
                  </li>
                  <li class="page-item" :class="{disabled: currentPage === totalPages}">
                      <button class="page-link" @click="currentPage++">Sau</button>
                  </li>
              </ul>
          </nav>
      </div>
    </div>

  </div>
  <div v-else class="text-center py-5 text-muted">Loading...</div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { inventoryCheckService } from "../../services/inventoryCheckService";
import { tokenService } from "../../services/TokenService";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "vue-sonner";

const route = useRoute(); const router = useRouter(); const auth = tokenService();
const checkId = route.params.id;

const role = ref("");
const rolesLoaded = ref(false);

const authState = tokenService();


function loadUserRole() {

  role.value = authState.role || "";  
  rolesLoaded.value = true;
}

// State
const check = ref(null); const items = ref([]); 
const scanQuery = ref(""); const processing = ref(false);
const scanMessage = ref(""); const scanError = ref(false); 
const suggestions = ref([]); const scanInput = ref(null);
const tableFilter = ref('ALL');

// Pagination State
const currentPage = ref(1);
const pageSize = ref(10); 

// QR Scanner
const qrScanner = ref(null);
const qrScannerVisible = ref(false);

// Stats
const stats = computed(() => {
    const counted = items.value.filter(i => i.countedQuantity > 0).length;
    const notCounted = items.value.filter(i => i.systemQuantity > 0 && i.countedQuantity === 0).length;
    const overage = items.value.filter(i => i.systemQuantity === 0 && i.countedQuantity > 0).length;
    return { counted, notCounted, overage };
});

const toastMsg = ref("");
const toastIsError = ref(false); // Thêm state để biết là lỗi hay thành công
let toastTimer = null;

// Filter & Sort
const filteredItems = computed(() => {
    let list = [...items.value];
    if (tableFilter.value !== 'ALL') list = list.filter(i => i.status === tableFilter.value);

    // Sort: Chưa quét lên đầu khi đang kiểm
    if (check.value?.status === 'IN_PROGRESS' || check.value?.status === 'DRAFT') {
        return list.sort((a, b) => {
            const aCnt = a.countedQuantity || 0;
            const bCnt = b.countedQuantity || 0;
            if (aCnt === 0 && bCnt > 0) return -1;
            if (aCnt > 0 && bCnt === 0) return 1;
            if (aCnt > 0 && bCnt > 0) return new Date(b.checkedTime || 0) - new Date(a.checkedTime || 0);
            return 0;
        });
    }
    // Sort: Theo trạng thái khi đã xong
    return list.sort((a, b) => {
        const p = { SHORTAGE: 1, OVERAGE: 2, MATCHED: 3, UNKNOWN: 4 };
        return (p[a.status] || 99) - (p[b.status] || 99);
    });
});

const totalPages = computed(() => Math.ceil(filteredItems.value.length / pageSize.value) || 1);
const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return filteredItems.value.slice(start, end);
});

const viStatus = (s) => ({ DRAFT:'Chưa kiểm', IN_PROGRESS:'Đang kiểm', PENDING_RECONCILIATION:'Chờ xử lý', CLOSED:'Đã đóng' }[s] || s);

const viItemStatus = (item) => {
    if (check.value.status === 'IN_PROGRESS' || check.value.status === 'DRAFT') {
        if (item.status === 'OVERAGE') return 'Hàng thừa';
        return item.countedQuantity > 0 ? 'Đã quét' : 'Chưa quét';
    }
    const map = { MATCHED: 'Khớp', SHORTAGE: 'Thiếu', OVERAGE: 'Thừa', UNKNOWN: 'Chưa rõ' };
    return map[item.status] || item.status;
};

const itemStatusBadge = (item) => {
     if (item.status === 'OVERAGE') return 'bg-warning text-dark';
     if (item.status === 'SHORTAGE') return 'bg-danger';
     if (item.status === 'MATCHED') return 'bg-success';
     if (item.countedQuantity > 0) return 'bg-success text-white border-0';
     return 'bg-light text-dark border';
};

const getRowClass = (item) => {
    if (item.status === 'OVERAGE') return 'table-warning'; 
    if (item.status === 'SHORTAGE' && check.value.status !== 'IN_PROGRESS' && check.value.status !== 'DRAFT') return 'table-danger'; 
    return '';
}

// ********* QR & TOAST
// 🔥 2. SỬA HÀM showToast ĐỂ HỖ TRỢ HIỂN THỊ LỖI
function showToast(msg = "", isError = false) {
  toastMsg.value = msg;
  toastIsError.value = isError;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toastMsg.value = ""), 3000); // Tăng lên 3s để kịp đọc
}

function startQrScanner() {
  console.log('camera')
  qrScannerVisible.value = true;
  qrScanner.value = new Html5Qrcode("qr-reader");
  qrScanner.value.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    (decodedText) => {
      handleScan(decodedText);
      toast.success(`Đã quét: ${decodedText}`);
      stopQrScanner(); 
    },
    (errorMessage) => { console.log("error scan: ",errorMessage) }
  ).catch(err => {
    console.error("QR Scanner start error", err);
    toast.error("Không thể mở camera để quét QR");
    showToast("Không thể mở camera để quét QR", true);
    qrScannerVisible.value = false;
  });
}
function stopQrScanner() {
  if (qrScanner.value) {
    qrScanner.value.stop().then(() => {
      qrScanner.value.clear();
      qrScannerVisible.value = false;
    }).catch(err => {
      qrScannerVisible.value = false;
    });
  } else {
    qrScannerVisible.value = false;
  }
}

async function loadData() {
  try {
    check.value = await inventoryCheckService.getById(checkId);
    items.value = await inventoryCheckService.getItems(checkId);
  } catch (e) { 
    toast.error("Không tải được dữ liệu phiếu kiểm kê.");
    console.error("Error loading inventory check data:", e);
    router.push('/inventory-check'); 
  }
}

async function handleScan(serialCamera) {
  if (typeof serialCamera === 'string' && serialCamera.trim()) {
    scanQuery.value = serialCamera;
  }
  
    const sn = scanQuery.value.trim(); 
    if (!sn) return;
    
    processing.value = true; 
    scanMessage.value = "";
    
    try {
        const res = await inventoryCheckService.scanSerial(checkId, sn, auth.userId);
        
        if(check.value.status === 'DRAFT') check.value.status = 'IN_PROGRESS';

        scanMessage.value = `OK: ${res.serialNumber}`; 
        toast.success(`Đã quét: ${res.serialNumber}`);
        // showToast(`Đã quét: ${res.serialNumber}`); // Có thể bật nếu muốn thông báo cả khi thành công
        scanError.value = false;
        scanQuery.value = ""; 
        suggestions.value = []; 
        
        const idx = items.value.findIndex(i => i.id === res.id || (i.serialNumber && res.serialNumber && i.serialNumber.toLowerCase() === res.serialNumber.toLowerCase()));
        if (idx !== -1) items.value[idx] = res; else items.value.push(res);
        items.value = [...items.value];
        
        currentPage.value = 1;
        nextTick(() => scanInput.value?.focus());

    } catch (e) {
        scanError.value = true;
        const errData = e.response?.data;
        let msg = "";
        let backendMsg = errData?.message || e.message || "Quét thất bại";

        // 🔥 3. GỌI showToast ĐỂ HIỆN LỖI LÊN GÓC TRÊN CÙNG
        if (backendMsg.includes("SERIAL_ALREADY_SCANNED")) {
            msg = "Serial này đã được quét rồi!";
            toast.error(msg);
            // showToast(msg, true);
        } else if (backendMsg.includes("không có trong sổ sách") || backendMsg.includes("hàng thừa")) {
            msg = "Lỗi: Serial này không có trong sổ sách tồn kho của kho này";
            toast.error(msg);
            // showToast(msg, true);
        } else {
            msg = "Lỗi: " + backendMsg;
            toast.error(msg);
            // showToast(msg, true);
        }
        scanMessage.value = msg; // Vẫn giữ hiển thị ở dưới ô input
    } finally {
        processing.value = false;
        nextTick(() => scanInput.value?.focus());
    }
}

let suggestTimeout;
function handleSuggest() {
  clearTimeout(suggestTimeout);
  if (!scanQuery.value || scanQuery.value.length < 2) { suggestions.value = []; return; }
  suggestTimeout = setTimeout(async () => { 
    try { 
      suggestions.value = await inventoryCheckService.suggestSerials(checkId, scanQuery.value); 
    } catch {

    } }, 300);
}
function selectSuggestion(s) { scanQuery.value = s; suggestions.value = []; handleScan(); }

async function handleComplete() { if(confirm("Xác nhận hoàn tất phiên đếm?")) { await inventoryCheckService.completeCheck(checkId); await loadData(); } }

async function handleClose() { 
    const msg = "Xác nhận CHỐT SỔ?\n\n- Hệ thống sẽ ghi nhận kết quả kiểm kê.\n- Số liệu chênh lệch (Khớp/Thiếu) sẽ được lưu lại để bộ phận kế toán xử lý sau.\n\nBạn có chắc chắn muốn đóng phiếu không?";
    if(confirm(msg)) { 
        try {
            await inventoryCheckService.closeCheck(checkId, auth.userId); 
            alert("Đã đóng phiếu kiểm kê thành công!");
            await loadData();
        } catch(e) {
            alert("Lỗi: " + (e.response?.data?.message || e.message));
        }
    } 
}

onMounted(() => { 
  auth.loadToken(); 
  loadUserRole();
  loadData(); 
  });
</script>

<style scoped>
.cursor-pointer { cursor: pointer; }
.table th { font-weight: 600; font-size: 0.9rem; vertical-align: middle; }
.table td { vertical-align: middle; font-size: 0.95rem; }
.page-link { cursor: pointer; color: #333; }
.page-item.disabled .page-link { background: #f8f9fa; color: #6c757d; }
.page-item:not(.disabled) .page-link:hover { background: #e9ecef; }
</style>