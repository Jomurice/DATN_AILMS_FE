<template>
  <div class="container-fluid px-3 py-4">
    <div class="pbox">
      <!-- Aside -->
      <aside class="side">
        <div class="brand">
          <i class="fa-solid fa-receipt me-2"></i>Đơn mua (Phiếu nhập)
        </div>

        <!-- Search Input -->
        <div class="mb-3">
          <input
            v-model="searchKeyword"
            @input="debounceSearch"
            class="form-control"
            placeholder="Tìm kiếm theo mã đơn, nhà cung cấp..."
          />
        </div>

        <!-- Status Filter -->
        <div class="mb-2 d-flex gap-2 flex-wrap">
          <button class="btn btn-sm" :class="chip('ALL')" @click="setStatus('ALL')">Tất cả</button>
          <button class="btn btn-sm" :class="chip('IN_BOUND')" @click="setStatus('IN_BOUND')">Chờ xử lý</button>
          <button class="btn btn-sm" :class="chip('IN_PROGRESS')" @click="setStatus('IN_PROGRESS')">Đang thực hiện</button>
          <button class="btn btn-sm" :class="chip('COMPLETED')" @click="setStatus('COMPLETED')">Hoàn tất</button>
        </div>

        <div class="list-group small">
          <button v-for="o in orders" :key="o.id"
            class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
            :class="{ active: selectedOrder?.id === o.id }" @click="openOrder(o)">
            <div>
              <button
                class="btn btn-outline-success btn-sm qr-btn me-2"
                title="Tải QR"
                @click.stop="download(o.id)"
              >
                <i class="fa-solid fa-qrcode"></i>
                <span class="d-none d-md-inline ms-1">QR</span>
              </button>

              <div class="fw-bold">{{ cut(o.code, 20) }}</div>
              <div class="fw-semibold">{{ cut(o.supplier, 20) }}</div>
              <div class="badge bg-light text-dark mt-1">{{ viStatus(o.status) }}</div>
            </div>
            <small class="text-muted">{{ formatDate(o.createdAt || o.eta) }}</small>
          </button>

          <div v-if="!loading && !orders.length" class="text-muted p-3">
            Không có phiếu phù hợp
          </div>
          <div v-if="loading" class="text-center py-3">
            <div class="spinner-border text-dark"></div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="d-flex justify-content-between align-items-center mt-3 gap-2">
          <button 
            class="btn btn-sm btn-outline-secondary" 
            :disabled="currentPage === 0"
            @click="goToPage(currentPage - 1)"
          >
            <i class="fa-solid fa-chevron-left"></i>
          </button>
          
          <span class="small text-muted">
            Trang {{ currentPage + 1 }} / {{ totalPages }}
          </span>
          
          <button 
            class="btn btn-sm btn-outline-secondary"
            :disabled="currentPage >= totalPages - 1"
            @click="goToPage(currentPage + 1)"
          >
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </aside>

      <!-- Main -->
      <main class="main">
        <div class="section-card" v-if="selectedOrder">
          <div class="d-flex align-items-center justify-content-between px-3 pt-3 pb-2">
            <div class="fw-bold">
              <div>{{ selectedOrder.code }} — <span class="text-muted">{{ cut(selectedOrder.supplier, 28) }}</span></div>
              <small class="text-muted">
                Ngày tạo: {{ formatDate(selectedOrder.createdAt || selectedOrder.eta) }} • Trạng thái: {{ viStatus(selectedOrder.status) }}
              </small>
            </div>
            <div class="d-flex gap-2">
              <RouterLink class="btn btn-outline-primary btn-sm" to="/inbound/new">+ Tạo đơn mua</RouterLink>
              <button class="btn btn-outline-secondary btn-sm" @click="selectedOrder = null">← Quay lại</button>
            </div>
          </div>

          <!-- Toolbar -->
          <div class="px-3 pb-3 d-flex align-items-center flex-wrap gap-3">
            <div class="badge-card">
              <div class="text-muted small">Tổng dòng hàng hóa</div>
              <div class="num">{{ selectedOrder.items?.length || 0 }}</div>
            </div>

            <div class="flex-grow-1 d-flex align-items-center gap-2">
              <input
                ref="quickInputRef"
                v-model.trim="quickSerial"
                @keyup.enter="handleQuickScan"
                class="form-control mono"
                placeholder="Quét nhanh serial… (vd: iphone15prm-0001)"
                :disabled="!canScan"
              />
              <button class="btn btn-primary" @click="handleQuickScan" :disabled="!canScan">Quét</button>
              <button class="btn btn-success" @click="startQrScanner" :disabled="!canScan">Quét QR</button>
            </div>
          </div>

          <!-------------------- 
                QR Scanner 
          ----------------------->
          <div v-if="qrScannerVisible" class="qr-scanner-container my-3 px-3">
            <div class="qr-scanner-header mb-3">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <h6 class="mb-1"><i class="fa-solid fa-camera me-2"></i>Quét mã QR</h6>
                  <small class="text-muted">Đặt mã QR vào giữa khung hình</small>
                </div>
                <button class="btn btn-secondary btn-sm" @click="stopQrScanner">
                  <i class="fa-solid fa-times me-1"></i>Đóng
                </button>
              </div>
            </div>
            <div class="qr-reader-wrapper">
              <div id="qr-reader"></div>
              <div class="qr-scanner-overlay">
                <div class="qr-scanner-corner top-left"></div>
                <div class="qr-scanner-corner top-right"></div>
                <div class="qr-scanner-corner bottom-left"></div>
                <div class="qr-scanner-corner bottom-right"></div>
              </div>
            </div>
          </div>

          <!-- Table -->
          <div class="table-responsive">
            <table class="table table-hover mb-0 table-balanced">
              <thead class="thead-soft">
                <tr class="text-uppercase fw-semibold">
                  <th>SKU</th>
                  <th>Tên hàng hóa</th>
                  <th>Loại</th>
                  <th>Hãng</th>
                  <th>Màu</th>
                  <th class="text-end">Số lượng</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="it in selectedOrder.items || []" :key="it.id || it.sku">
                  <td class="mono nowrap">{{ it.sku }}</td>
                  <td class="nowrap" :title="it.name">{{ cut(it.name, 28) }}</td>
                  <td class="nowrap">{{ cut(it.categoryName, 18) }}</td>
                  <td class="nowrap">{{ cut(it.brandName, 18) }}</td>
                  <td class="nowrap">{{ cut(it.color || '—', 16) }}</td>
                  <td class="text-end nowrap mono">
                    <span>{{ it.scannedQuantity || 0 }}/{{ it.orderQuantity }}</span>
                    <button class="btn btn-link btn-sm ms-1" title="Xem serial đã quét" @click="openSerialsModal(it.sku, it.productId)">
                      <i class="fa-solid fa-eye"></i>
                    </button>
                  </td>
                </tr>
                <tr v-if="!selectedOrder.items?.length">
                  <td colspan="6" class="text-center text-muted py-3">Phiếu này chưa có dòng hàng</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="px-3 py-3 d-flex justify-content-end">
            <button 
              class="btn btn-success" 
              :disabled="!canComplete" 
              @click="completeOrder"
            >
              Nhập hàng
            </button>
          </div>
        </div>

        <div v-else class="section-card">
          <div class="px-3 pt-3 pb-2 d-flex align-items-center justify-content-between">
            <h5 class="fw-bold mb-0">Chọn 1 phiếu mua (đơn hàng) để nhập</h5>
            <RouterLink class="btn btn-outline-primary btn-sm" to="/inbound/new">+ Tạo đơn mua</RouterLink>
          </div>
          <div class="p-3 text-muted">Hãy chọn phiếu từ danh sách bên trái.</div>
        </div>
      </main>
    </div>

    <!-- Serial Modal -->
    <div v-if="modalSku" class="modal-overlay d-flex align-items-center justify-content-center">
      <div class="card serial-modal-card p-3 notranslate" translate="no">
        <div class="d-flex align-items-center justify-content-between mb-3">
          <h5 class="mb-0">Đã quét Serial — SKU: {{ modalSku }}</h5>
          <button class="btn btn-sm btn-outline-secondary" @click="modalSku = null">Đóng</button>
        </div>
        <div class="serial-table-wrapper">
          <table class="table table-sm table-hover mb-0" translate="no">
            <thead class="sticky-top bg-white">
              <tr>
                <th class="notranslate">Serial</th>
                <th>Trạng thái</th>
            
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in modalSerials" :key="s.serialNumber">
                <td class="mono nowrap notranslate">{{ s.serialNumber }}</td>
                <td class="nowrap">{{ s.status }}</td>

              </tr>
              <tr v-if="!modalSerials.length">
                <td colspan="3" class="text-center text-muted py-4">Chưa có serial</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toastMsg" class="toast-box">{{ toastMsg }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { purchaseOrderService } from "@/services/purchaseOrder/purchaseOrderService";
import { tokenService } from "@/services/TokenService";
import api from "@/services/axios";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "vue-sonner";

// ===== Refs =====
const auth = tokenService();
const userId = ref("");
const orders = ref([]);
const loading = ref(true);
const status = ref("ALL");
const selectedOrder = ref(null);
const quickSerial = ref("");
const quickInputRef = ref(null);
const scannedBySku = ref({});
const modalSku = ref(null);
const modalSerials = ref([]);
const toastMsg = ref("");
let toastTimer = null;

// Pagination & Search
const currentPage = ref(0);
const pageSize = ref(10);
const totalPages = ref(0);
const totalElements = ref(0);
const searchKeyword = ref("");
let searchTimeout = null;

// QR Scanner
const qrScanner = ref(null);
const qrScannerVisible = ref(false);

// ======== Helpers ========
const cut = (s, n = 20) => s && s.length > n ? s.slice(0, n) + "..." : s || "";
const formatDate = (x) => {
  if (!x) return "—";
  try {
    if (typeof x === "string" && /^\d{4}-\d{2}-\d{2}/.test(x)) return x;
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
  if (k === "IN_BOUND" ) return "Chờ xử lý";
  if (k === "IN_PROGRESS") return "Đang thực hiện";
  if (k === "COMPLETED") return "Hoàn tất";
  return s || "—";
};

// ======== Computed ========


const canComplete = computed(() => {
  if (!selectedOrder.value) return false;
  const s = String(selectedOrder.value.status || "").toUpperCase();
  
 
  if (s === "COMPLETED" || s === "DONE") return false;
  
  
  if (!selectedOrder.value.items?.length) return false;
  
  const allItemsScanned = selectedOrder.value.items.every(item => {
    return (item.scannedQuantity || 0) >= (item.orderQuantity || 0);
  });
  
  return allItemsScanned;
});

const canScan = computed(() => {
  if (!selectedOrder.value) return false;
  const s = String(selectedOrder.value.status || "").toUpperCase();
  return s !== "COMPLETED" && s !== "DONE";
});


const setStatus = (s) => {
  console.log('Setting status to:', s);
  status.value = s;
  currentPage.value = 0;
  loadOrders();
};


const debounceSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 0;
    loadOrders();
  }, 500);
};

const goToPage = (page) => {
  if (page >= 0 && page < totalPages.value) {
    currentPage.value = page;
    loadOrders();
  }
};

async function loadOrders() {
  loading.value = true;
  try {
    auth.loadToken();
    userId.value = auth.userId;
    
    const statusParam = status.value === "ALL" ? null : status.value;
    const keywordParam = searchKeyword.value.trim() || null;
    
    console.log('Loading orders with params:', { 
      page: currentPage.value, 
      size: pageSize.value, 
      status: statusParam, 
      keyword: keywordParam 
    });
    
    const result = await purchaseOrderService.searchPurchaseOrders({
      page: currentPage.value,
      size: pageSize.value,
      status: statusParam,
      keyword: keywordParam
    });
    
    console.log('Loaded orders:', result);
    
    orders.value = result.content || [];
    totalPages.value = result.totalPages || 0;
    totalElements.value = result.totalElements || 0;
  } catch (err) {
    console.error("Load orders error", err);
    toast.error("Lỗi tải danh sách phiếu");
  } finally {
    loading.value = false;
  }
}

function normalizeOrder(order) {
  const items = (order.purchaseOrderItems || order.items || []).map(it => {
    const product = it.product || {};
    const details = it.productDetails || [];
    const scannedCount = details.filter(d => d.status === "SCANNED" || d.status === "ACTIVE").length;

    return {
      id: it.id ?? it.purchaseOrderItemId,
      productId: product.id,
      sku: product.sku,
      name: product.name,
      categoryName: product.category?.name || "",
      brandName: product.brand?.name || "",
      color: product.color || "",
      storage: product.storage || "",
      orderQuantity: it.orderQuantity ?? 0,
      scannedQuantity: it.scannedQuantity ?? scannedCount,
      productDetails: details,
    };
  });
  return { ...order, items };
}

async function openOrder(o) {
  try {
    const full = await purchaseOrderService.getPurchaseOrderById(o.id, { includeItems: true });
    selectedOrder.value = normalizeOrder(full);
    scannedBySku.value = {};
    for (const item of selectedOrder.value.items || []) {
      scannedBySku.value[key(item.sku)] = {
        count: item.scannedQuantity || 0,
        details: item.productDetails?.map(pd => ({
          serialNumber: pd.serialNumber,
          status: pd.status,
          binId: pd.binId
        })) || []
      };
    }
    toast.success("Đã tải chi tiết phiếu thành công!");
  } catch (err) {
    console.error("openOrder error", err);
    toast.error("Lỗi tải chi tiết phiếu");
  }
}

async function handleQuickCameraScan(serialInput) {
  const serial = serialInput || String(quickSerial.value || "").trim();
  if (!serial) return toast.error("Vui lòng nhập serial để quét");
  if (!selectedOrder.value?.items?.length) return toast.error("Chưa chọn phiếu");

  try {
    const item = selectedOrder.value.items.find(i => serial.toLowerCase().includes(i.sku.toLowerCase()));
    if (!item) return toast.error("Serial không khớp với SKU nào trong phiếu");

    await api.post("/api/product-details/confirm-scan", {
      serialNumber: serial,
      warehouseId: selectedOrder.value?.warehouseId,
      scannedByUserId: userId.value
    });

    toast.success("Quét thành công!");

    const updated = await purchaseOrderService.getPurchaseOrderById(selectedOrder.value.id, { includeItems: true });
    selectedOrder.value = normalizeOrder(updated);
    
    const orderIndex = orders.value.findIndex(o => o.id === selectedOrder.value.id);
    if (orderIndex !== -1) {
      orders.value[orderIndex].status = selectedOrder.value.status;
    }
    
    
    scannedBySku.value = {};
    for (const itm of selectedOrder.value.items || []) {
      scannedBySku.value[key(itm.sku)] = {
        count: itm.scannedQuantity || 0,
        details: itm.productDetails?.map(pd => ({
          serialNumber: pd.serialNumber,
          status: pd.status,
          binId: pd.binId
        })) || []
      };
    }
  } catch (err) {
    const code = err.response?.data?.code;
    const msg = err.response?.data?.message;
    if (code === "SERIAL_ALREADY_SCANNED") toast.error("Serial này đã được scan trước đó");
    else if ( msg=== "Serial already scanned or in warehouse") toast.error("Serial tồn tại trong hệ thống");
    else if (code === "SERIAL_NOT_FOUND") toast.error("Serial không tồn tại trong hệ thống");
    else if (code === "SKU_MISMATCH") toast.error("Serial không khớp với SKU trong phiếu");
    else toast.error(msg || "Có lỗi xảy ra khi quét");
  } finally {
    quickSerial.value = "";
    quickInputRef.value?.focus();
  }
}

async function handleQuickScan() {
  const serial = String(quickSerial.value || "").trim();
  if (!serial) return;

  if (!selectedOrder.value?.items?.length) {
    toast.error("Chưa chọn phiếu");
    return;
  }

  try {
    const item = selectedOrder.value.items.find((i) =>
      serial.toLowerCase().includes(i.sku.toLowerCase())
    );

    if (!item) {
      toast.error("Serial không khớp với SKU nào trong phiếu");
      return;
    }

    await api.post("/api/product-details/confirm-scan", {
      serialNumber: serial,
      warehouseId: selectedOrder.value?.warehouseId,
      scannedByUserId: userId.value,
    });

    toast.success("Quét thành công!");
    
    
    const updated = await purchaseOrderService.getPurchaseOrderById(
      selectedOrder.value.id,
      { includeItems: true }
    );
    selectedOrder.value = normalizeOrder(updated);
    
  
    const orderIndex = orders.value.findIndex(o => o.id === selectedOrder.value.id);
    if (orderIndex !== -1) {
      orders.value[orderIndex].status = selectedOrder.value.status;
    }
    
    
    scannedBySku.value = {};
    for (const itm of selectedOrder.value.items || []) {
      scannedBySku.value[key(itm.sku)] = {
        count: itm.scannedQuantity || 0,
        details: itm.productDetails?.map(pd => ({
          serialNumber: pd.serialNumber,
          status: pd.status,
          binId: pd.binId
        })) || []
      };
    }
  } catch (err) {
    console.error("Scan error", err);
    const code = err.response?.data?.code;
    const msg = err.response?.data?.message;

    if (code === "SERIAL_ALREADY_SCANNED") {
      toast.error("Serial này đã được scan trước đó");
    } else if (code === "SERIAL_NOT_FOUND") {
      toast.error("Serial không tồn tại trong hệ thống");
    } else if (code === "SKU_MISMATCH") {
      toast.error("Serial không khớp với SKU trong phiếu");
    } else {
      toast.error(msg || "Có lỗi xảy ra khi quét");
    }
  } finally {
    quickSerial.value = "";
    quickInputRef.value?.focus();
  }
}

async function completeOrder() {
  if (!selectedOrder.value) return;
  
  try {
    await api.post(`/api/purchase-orders/${selectedOrder.value.id}/complete`, {}, { 
      params: { userId: userId.value } 
    });
    
    toast.success("Nhập kho thành công!");
    
    
    await loadOrders();
    
    
    selectedOrder.value = null;
  } catch (err) {
    console.error("Complete error", err);
    const msg = err.response?.data?.message;
    toast.error(msg || "Có lỗi khi nhập kho");
  }
}

async function openSerialsModal(sku, productId) {
  if (!selectedOrder.value) return;
  modalSku.value = sku;
  modalSerials.value = [];
  try {
    const res = await api.get(`/api/purchase-orders/${selectedOrder.value.id}/serials`, { params: { sku } });
    modalSerials.value = Array.isArray(res.data.result) ? res.data.result : [];
  } catch (err) {
    console.error("Load serials error", err);
    toast.error("Lỗi tải serials");
  }
}

function showToast(msg = "") {
  toastMsg.value = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toastMsg.value = ""), 1600);
}

function startQrScanner() {
  if (!selectedOrder.value) return toast.error("Chọn phiếu trước khi quét QR");
  if (!canScan.value) return toast.error("Không thể quét cho phiếu đã hoàn tất");
  
  qrScannerVisible.value = true;
  
  setTimeout(() => {
    qrScanner.value = new Html5Qrcode("qr-reader");
    qrScanner.value.start(
      { facingMode: "environment" },
      { 
        fps: 30,
        qrbox: { width: 300, height: 300 },
        aspectRatio: 1.0
      },
      (decodedText) => {
        handleQuickCameraScan(decodedText);
        
      },
      (errorMessage) => {
      }
    ).catch(err => {
      console.error("QR Scanner start error", err);
      toast.error("Lỗi khi khởi động camera");
      qrScannerVisible.value = false;
    });
  }, 100);
}

function stopQrScanner() {
  if (qrScanner.value) {
    qrScanner.value.stop().then(() => {
      qrScanner.value.clear();
      qrScannerVisible.value = false;
    }).catch(err => {
      console.error("QR Scanner stop error", err);
      qrScannerVisible.value = false;
      toast.error("Lỗi khi dừng camera");
    });
  } else {
    qrScannerVisible.value = false;
  }
}

const download = async (id) => {
  try {
    await purchaseOrderService.downloadQrCodes(id);
    toast.success('Tải QR thành công !');
  } catch (e) {
    console.error(e);
    toast.error('Tải QR thất bại !');
  }
};

onMounted(async () => {
  await loadOrders();
});
</script>

<style scoped>
.pbox { display: flex; gap: 16px; width: 100%; }
.side {
  width: 320px; background: #fff; border-radius: 14px; padding: 14px;
  position: sticky; top: 96px; height: calc(100vh - 110px); overflow: auto;
}
.brand { font-weight: 700; font-size: 18px; display: flex; align-items: center; margin-bottom: 10px; }
.main { flex: 1; display: flex; flex-direction: column; gap: 16px; }
.section-card { background: #fff; border: 1px solid #eef2f7; border-radius: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.03); }

.badge-card {
  background: #fff; border: 1px solid #eef2f7; border-radius: 10px;
  padding: 8px 14px; text-align: center; display: inline-flex; flex-direction: column; min-width: 140px;
}
.badge-card .num { font-weight: 700; color: #1f2937; font-size: 18px; }

.table-balanced th, .table-balanced td { vertical-align: middle; white-space: nowrap; height: 56px; }
.nowrap { white-space: nowrap; }
.thead-soft th { background: #cfe3ff; color: #0b1324; font-weight: 600; letter-spacing: 0.2px; border-top: 1px solid #9ec5fe; border-bottom: 1px solid #9ec5fe; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 10000; }
.toast-box { position: fixed; bottom: 20px; right: 20px; background: #111; color: #fff; padding: 10px 14px; border-radius: 8px; z-index: 20000; }

.serial-modal-card {
  width: 90%;
  max-width: 700px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
}

.serial-table-wrapper {
  overflow-y: auto;
  max-height: calc(80vh - 100px);
  border: 1px solid #eef2f7;
  border-radius: 8px;
}

.serial-table-wrapper::-webkit-scrollbar {
  width: 8px;
}

.serial-table-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.serial-table-wrapper::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.serial-table-wrapper::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.serial-table-wrapper .sticky-top {
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

/* QR Scanner Styles */
.qr-scanner-container {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
}

.qr-scanner-header h6 {
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.qr-reader-wrapper {
  position: relative;
  max-width: 500px;
  margin: 0 auto;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

#qr-reader {
  width: 100% !important;
  border: none !important;
  border-radius: 12px;
}

#qr-reader video {
  border-radius: 12px;
  object-fit: cover;
}

.qr-scanner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.qr-scanner-corner {
  position: absolute;
  width: 60px;
  height: 60px;
  border: 4px solid #28a745;
  box-shadow: 0 0 10px rgba(40, 167, 69, 0.5);
}

.qr-scanner-corner.top-left {
  top: 50%;
  left: 50%;
  margin-top: -150px;
  margin-left: -150px;
  border-right: none;
  border-bottom: none;
  border-radius: 12px 0 0 0;
}

.qr-scanner-corner.top-right {
  top: 50%;
  right: 50%;
  margin-top: -150px;
  margin-right: -150px;
  border-left: none;
  border-bottom: none;
  border-radius: 0 12px 0 0;
}

.qr-scanner-corner.bottom-left {
  bottom: 50%;
  left: 50%;
  margin-bottom: -150px;
  margin-left: -150px;
  border-right: none;
  border-top: none;
  border-radius: 0 0 0 12px;
}

.qr-scanner-corner.bottom-right {
  bottom: 50%;
  right: 50%;
  margin-bottom: -150px;
  margin-right: -150px;
  border-left: none;
  border-top: none;
  border-radius: 0 0 12px 0;
}

@media (max-width: 992px) {
  .pbox { flex-direction: column; }
  .side { width: 100%; height: auto; position: static; }
  .serial-modal-card { width: 95%; max-width: none; }
  
  .qr-scanner-corner {
    width: 40px;
    height: 40px;
  }
  
  .qr-scanner-corner.top-left {
    margin-top: -100px;
    margin-left: -100px;
  }
  
  .qr-scanner-corner.top-right {
    margin-top: -100px;
    margin-right: -100px;
  }
  
  .qr-scanner-corner.bottom-left {
    margin-bottom: -100px;
    margin-left: -100px;
  }
  
  .qr-scanner-corner.bottom-right {
    margin-bottom: -100px;
    margin-right: -100px;
  }
}
</style>