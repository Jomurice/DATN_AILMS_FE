<template>
  <div class="container-fluid px-3 py-2">
    <div class="pbox">
      <!-- Aside -->
      <aside class="side">
        <div class="brand"><i class="fa-solid fa-truck-ramp-box me-2"></i>Đơn xuất (Phiếu xuất)</div>

        <div class="d-flex gap-2">
          <input type="text" class="form-control mb-3" v-model.trim="searchInput" placeholder="Nhập mã phiếu muốn tìm"
            @keyup.enter="checkSearInput" />
          <button class="btn btn-primary mb-3" @click="checkSearInput"><i
              class="fa-solid fa-magnifying-glass"></i></button>
        </div>

        <div class="mb-2 d-flex gap-2 flex-wrap">
          <button class="btn btn-sm" :class="chipCls('')" @click="status = ''">Tất cả</button>
          <button class="btn btn-sm" :class="chipCls('CONFIRMED')" @click="status = 'CONFIRMED'">Chờ xử lý</button>
          <button class="btn btn-sm" :class="chipCls('EXPORT')" @click="status = 'EXPORT'">Hoàn tất</button>
          <button class="btn btn-sm" :class="chipCls('PENDING_CANCEL')" @click="status = 'PENDING_CANCEL'">Chờ
            hủy</button>
          <button class="btn btn-sm" :class="chipCls('CANCELLED')" @click="status = 'CANCELLED'">Hủy</button>
        </div>

        <div class="list-group small">
          <button v-for="o in orders.content" :key="o.id"
            class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
            :class="{ active: selectedOrder?.id === o.id }" @click="openOrder(o)">
            <div>
              <div class="fw-bold">{{ clip(o.code, 20) }}</div>
              <div class="fw-semibold">{{ clip(o.customer, 20) }}</div>
              <div class="badge bg-light text-dark mt-1">{{ toViStatus(o.status) }}</div>
            </div>
            <small class="text-muted">{{ fmtDate(o.createAt) }}</small>
          </button>

          <div class="mt-3 gap-2 d-flex justify-content-center flex-wrap">
            <!-- Prev -->
            <button class="btn btn-outline-primary btn-sm" :disabled="payloadSearch.page === 0"
              @click="changePage(payloadSearch.page - 1)">
              &lt;
            </button>

            <!-- First -->
            <button v-if="visiblePages[0] > 1" class="btn btn-outline-primary btn-sm" @click="changePage(0)">
              1
            </button>

            <span v-if="visiblePages[0] > 2">...</span>

            <!-- Pages -->
            <button v-for="page in visiblePages" :key="page" class="btn btn-sm" :class="(page - 1) === payloadSearch.page
              ? 'btn-primary text-white'
              : 'btn-outline-primary'" @click="changePage(page - 1)">
              {{ page }}
            </button>

            <span v-if="visiblePages.at(-1) < totalPages - 1">...</span>

            <!-- Last -->
            <button v-if="visiblePages.at(-1) < totalPages" class="btn btn-outline-primary btn-sm"
              @click="changePage(totalPages - 1)">
              {{ totalPages }}
            </button>

            <!-- Next -->
            <button class="btn btn-outline-primary btn-sm" :disabled="payloadSearch.page >= totalPages - 1"
              @click="changePage(payloadSearch.page + 1)">
              &gt;
            </button>
          </div>

          <div v-if="!loading && !orders.content.length" class="text-muted p-3">Không có phiếu phù hợp</div>
          <div v-if="loading" class="text-center py-3">
            <div class="spinner-border text-dark"></div>
          </div>
        </div>
      </aside>

      <!-- Main -->
      <main class="main">
        <div class="section-card" v-if="selectedOrder">
          <div class="d-flex align-items-center justify-content-between px-3 pt-3 pb-2">
            <div class="fw-bold">
              <div>{{ selectedOrder.code }} — <span class="text-muted">KH: {{ clip(customer.lastName + " " +
                customer.firstName, 28) }}</span>
              </div>
              <small class="text-muted">
                Ngày tạo: {{ fmtDate(selectedOrder.createAt) }} — Trạng thái: {{ toViStatus(selectedOrder.status) }}
              </small>
            </div>

            <div class="d-flex gap-2">
              <div class="text-center">
                <button class="btn btn-outline-danger btn-sm" @click="contactModalVisible = true">
                  <i class="fa-solid fa-envelope me-1"></i> Liên hệ Admin
                </button>
              </div>
              <RouterLink class="btn btn-outline-primary btn-sm" to="/outbound/new">+ Tạo phiếu xuất</RouterLink>
              <button class="btn btn-outline-secondary btn-sm" @click="selectedOrder = null">← Quay lại</button>
            </div>
          </div>



          <!-- Toolbar -->
          <div class="px-3 pb-3 d-flex align-items-center flex-wrap gap-3">
            <div class="badge-card">
              <div class="text-muted small">Tổng dòng hàng hóa</div>
              <div class="num">{{ selectedOrder.items?.length || 0 }}</div>
            </div>

            <!-- QUÉT NHANH -->
            <div class="flex-grow-1 d-flex align-items-center gap-2">
              <input ref="quickInputRef" v-model.trim="quickSerial" @keyup.enter="handleQuickScan"
                class="form-control mono" style="width: 740px;"
                placeholder="Quét nhanh serial… (vd: iphone15prm-0001)" />
              <button class="btn btn-primary" :disabled="!isCancel" @click="handleQuickScan">Quét</button>
              <button class="btn btn-success" :disabled="!isCancel" @click="startQrScanner">Quét QR</button>
            </div>
          </div>

          <!-- qr -->
          <div v-if="qrScannerVisible" class="my-3">
            <div id="qr-reader" style="width: 100%;"></div>
            <button class="btn btn-secondary mt-2" @click="stopQrScanner">Dừng QR</button>
          </div>

          <!-- Table (gọn, không sort/pager) -->
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
                <tr v-for="it in (selectedOrder.items || [])" :key="it.id || it.sku">
                  <td class="mono nowrap">{{ it.sku }}</td>
                  <td class="nowrap" :title="it.name">{{ clip(it.name, 24) }}</td>
                  <td class="nowrap">{{ clip(it.categoryName, 18) }}</td>
                  <td class="nowrap">{{ clip(it.brandName, 18) }}</td>
                  <td class="nowrap">{{ clip(it.color || '—', 16) }}</td>
                  <td class="text-end nowrap mono">
                    <span>{{ it.scannedQuantity }}/{{ it.orderQuantity }}</span>
                    <button class="btn btn-link btn-sm ms-1" title="Xem serial đã quét"
                      @click="openSerialsModal(it.sku)">
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
            <button v-if="isConfirmCancel" class="btn btn-warning mx-2" @click="rejectCancel()">Không hủy</button>
            <button v-if="isConfirmCancel" class="btn btn-danger mx-2" @click="confirmCancel()">Xác nhận
              hủy</button>
            <button class="btn btn-success" :disabled="!isAllScanned || submitting" @click="confirmExport()">
              {{ submitting ? 'Đang xuất hàng...' : 'Xuất hàng' }}
            </button>
            <div v-if="toastMsg" class="toast-box">{{ toastMsg }}</div>
            <button class="btn btn-danger ms-2" :disabled="!isCancel" @click="showCancelModal = true" >Hủy
              đơn</button>
          </div>
        </div>

        <div v-else class="section-card">
          <div class="px-3 pt-3 pb-2 d-flex align-items-center justify-content-between">
            <h5 class="fw-bold mb-0">Chọn 1 phiếu xuất để thực hiện</h5>
            <RouterLink class="btn btn-outline-primary btn-sm" to="/outbound/new">+ Tạo phiếu xuất</RouterLink>
          </div>
          <div class="p-3 text-muted">Hãy chọn phiếu từ danh sách bên trái.</div>
        </div>
      </main>
    </div>

    <!-- Modal: Serial đã quét -->
    <div v-if="modalSku" class="modal-overlay">
      <div class="card w-50 p-2 notranslate" translate="no">
        <div class="d-flex align-items-center justify-content-between">
          <h5 class="mb-0">Đã quét Serial — SKU: {{ modalSku }}</h5>
          <button class="btn btn-sm btn-outline-secondary" @click="modalSku = null">Đóng</button>
        </div>
        <div class="table-responsive mt-2">
          <table class="table table-sm" translate="no">
            <thead>
              <tr>
                <th class="notranslate">Serial</th>
                <th>Trạng thái</th>
                <th>Vị trí</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in modalSerials" :key="s.serialNumber">
                <td class="mono nowrap notranslate">{{ s.serialNumber }}</td>
                <td class="nowrap">{{ s.status }}</td>
                <td class="nowrap notranslate">{{ s.warehouseId || s.binId || '—' }}</td>
              </tr>
              <tr v-if="!modalSerials?.length">
                <td colspan="3" class="text-center text-muted">Chưa có serial</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toastMsg" class="toast-box">{{ toastMsg }}</div>
  </div>




  <!-- modal cancel outbound -->
  <div v-if="cancelModalVisible" class="modal-overlay">
    <div class="card p-4 w-50 shadow">
      <div class="d-flex align-items-center justify-content-between mb-3">
        <h5 class="mb-0">
          <i class="fa-solid fa-truck-ramp-box me-2 text-primary"></i>Hủy đơn xuất
        </h5>
        <button class="btn btn-sm btn-outline-secondary" @click="cancelModalVisible = false">
          Đóng
        </button>
      </div>

      <div class="mb-3">
        <label class="form-label fw-semibold">Lý do hủy đơn</label>
        <textarea v-model.trim="note" class="form-control" placeholder="Nhập lý do hủy đơn" rows="4"></textarea>
      </div>

      <div class="d-flex justify-content-end">
        <button class="btn btn-danger px-4" @click="cancelOutbound(selectedOrder.id)">
          Hủy đơn
        </button>
        <div v-if="toastMsg" class="toast-box">{{ toastMsg }}</div>
      </div>
    </div>
  </div>

  <!-- Modal xác confirm -->
  <ConfirmModal :show="showCancelModal" title="Xác nhận hủy phiếu xuất"
    message="Hành động này sẽ hoàn trả serial về kho. Bạn có chắc chắn muốn hủy phiếu này không?"
    confirm-text="Xác nhận hủy" cancel-text="Không" @confirm="cancelModalVisible = true,showCancelModal = false"" @cancel="showCancelModal = false" />


  <!-- Modal: Liên hệ Admin -->
  <div v-if="contactModalVisible"
    class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50">
    <div class="card p-4 w-50 shadow">
      <!-- Заголовок -->
      <div class="d-flex align-items-center justify-content-between mb-3">
        <h5 class="mb-0">
          <i class="fa-solid fa-envelope me-2 text-primary"></i>Liên hệ Admin
        </h5>
        <button class="btn btn-sm btn-outline-secondary" @click="contactModalVisible = false">
          Đóng
        </button>
      </div>


      <div class="table-responsive mb-3">
        <table class="table table-striped table-bordered table-hover align-middle text-center">
          <thead class="table-primary">
            <tr>
              <th scope="col">SKU</th>
              <th scope="col">Tên hàng hóa</th>
              <th scope="col">Loại</th>
              <th scope="col">Hãng</th>
              <th scope="col">Màu</th>
              <th scope="col">Số lượng</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colspan="6" class="text-muted">Không có dữ liệu</td>
            </tr>
          </tbody>
        </table>
      </div>


      <div class="mb-3">
        <label class="form-label fw-semibold">Tin nhắn</label>
        <textarea v-model.trim="contactMessage" class="form-control" placeholder="Nhập tin nhắn của bạn..."
          rows="4"></textarea>
      </div>


      <div class="d-flex justify-content-end">
        <button class="btn btn-primary px-4" @click="sendMessageToAdmin">
          <i class="fa-solid fa-paper-plane me-2"></i>Gửi
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { tokenService } from "@/services/TokenService";
import { outboundOrderService } from "@/services/outbound/outboundOrderService";
import { customerService } from "../../services/outbound/CustomerService";
import { Html5Qrcode } from "html5-qrcode";
import { watch } from "vue";
import ConfirmModal from "../modal/ConfirmModal.vue";
import { toast } from "vue-sonner";


const auth = tokenService();
const userId = ref("");

const clip = (s, n = 20) => s && s.length > n ? (s.slice(0, n) + '...') : (s || '');
const fmtDate = d => { if (!d) return '—'; try { if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d; const t = new Date(d); return isNaN(+t) ? d : t.toISOString().slice(0, 10) } catch { return d } };
const norm = s => String(s || '').trim();
const contactModalVisible = ref(false);
const cancelModalVisible = ref(false);
const note = ref('');
const submitting = ref(false);
const canceling = ref(false);
const qrScanner = ref(null);
const qrScannerVisible = ref(false);

// state
const orders = ref([]); const loading = ref(true); const status = ref(''); const selectedOrder = ref(null);
const quickSerial = ref('');
const quickInputRef = ref(null);
const customer = ref([]);
const modalSerials = ref({});
const modalSku = ref(null);
const toastMsg = ref(""); let toastTimer = null;
const searchInput = ref("");
const showCancelModal = ref(false);
const payloadSearch = ref({
  search: "",
  status: null,
  page: 0,
  size: 5,
  sort: "code,asc"
});

// filters
const chipCls = s => ({ 'btn-outline-secondary': status.value !== s, 'btn-primary text-white': status.value === s });
const toViStatus = s => {
  const k = String(s || '').toUpperCase();
  if (k === 'CONFIRMED') return 'Chờ xử lý';
  if (k === 'EXPORT') return 'Hoàn tất';
  if (k === 'PENDING_CANCEL') return 'Chờ hủy';
  if (k === 'CANCELLED') return 'Đã hủy';
  return s || '—';
};

const isAllScanned = computed(() => {
  const statusUp = String(selectedOrder.value.status || "").toUpperCase();
  if (statusUp === "EXPORT" || statusUp === "PENDING_CANCEL") return false;

  if (!selectedOrder.value?.items?.length) return false;
  return selectedOrder.value.items.every(it => Number(it.scannedQuantity || 0) >= Number(it.orderQuantity || 0));
});

const isCancel = computed(() => {
  const statusUp = String(selectedOrder.value.status || "").toUpperCase();
  if (statusUp === "EXPORT" || statusUp === "PENDING_CANCEL" || statusUp === "CANCELLED") return false;
  return true;
});

const isConfirmCancel = computed(() => {
  const statusUp = String(selectedOrder.value.status || "").toUpperCase();
  if (statusUp === "PENDING_CANCEL") return true;
  return false;
});


async function openSerialsModal(sku) {
  modalSku.value = String(sku || '').toLowerCase();
  modalSerials.value = [];
  try {
    modalSerials.value = await outboundOrderService.getSerials(selectedOrder.value.id, sku);
    
  } catch {
    // showToast('Không tải được serial đã quét');
    toast.error('Không tải được serial đã quét');
  }
};

const totalPages = computed(() =>
  Math.ceil((orders.value.totalElements || 0) / payloadSearch.value.size)
);

const visiblePages = computed(() => {
  const current = payloadSearch.value.page + 1; // 1-based
  const total = totalPages.value;
  const delta = 3; // số trang trước & sau

  let start = Math.max(1, current - delta);
  let end = Math.min(total, current + delta);

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});


function normalizeOrder(order) {
  const items = (order.items || []).map(x => ({
    id: x.id ?? x.outboundOrderItemId ?? null,
    productId: x.productId ?? x.product?.id ?? null,
    sku: x.sku ?? x.product?.sku ?? '',
    name: x.name ?? x.product?.name ?? '',
    categoryName: x.categoryName ?? x.product?.categoryName ?? x.product?.category?.name ?? '',
    brandName: x.brandName ?? x.product?.brandName ?? x.product?.brand?.name ?? '',
    color: x.color ?? x.product?.color ?? '',
    orderQuantity: Number(x.orderQuantity ?? x.qty ?? 0),
    scannedQuantity: Number(x.scannedQuantity ?? 0),
  }));
  return { ...order, items };
}

async function openOrder(o) {
  try {
    let full = o;
    if (!Array.isArray(o.items) || !o.items.length) {
      full = await outboundOrderService.getById(o.id, { includeItems: true });
    }
    customer.value = await customerService.getById(full.customerId);
    selectedOrder.value = normalizeOrder(full);
    modalSerials.value = {};
    toast.success('Đã tải chi tiết phiếu');
  } catch (error) {
    console.error('Cannot load order details', error);
    // showToast('Không tải được chi tiết phiếu');
    toast.error('Không tải được chi tiết phiếu');
  }
};

async function cancelOutbound() {
  if (!selectedOrder.value) return;
  if (!note.value) {
    // showToast('Vui lòng nhập lý do hủy đơn');
    toast.warning('Vui lòng nhập lý do hủy đơn');
    return;
  }
  const req = {
    note: note.value,
    canceledBy: userId.value,
  };

  canceling.value = true;
  try {
    await outboundOrderService.cancelOrder(selectedOrder.value.id, req);
    toast.success('Đã gửi yêu cầu hủy đơn');
    // showToast('Đã gửi yêu cầu hủy đơn');
    orders.value = await outboundOrderService.getAll();
    cancelModalVisible.value = false;
    note.value = '';
  } catch (error) {
    console.log('Cancel outbound error:', error);
    // showToast('Gửi yêu cầu hủy đơn thất bại');
    toast.error('Gửi yêu cầu hủy đơn thất bại');
  } finally {
    canceling.value = false;
  }
};

async function confirmCancel() {
  try {
    await outboundOrderService.confirmCancel(selectedOrder.value.id);
    // showToast('Hủy đơn thành công');
    toast.success('Hủy đơn thành công');
    orders.value = await outboundOrderService.getAll();
  } catch (error) {
    console.log('Confirm cancel error:', error);
    // showToast('Hủy đơn thất bại');
    toast.error('Hủy đơn thất bại');
  }
};

async function rejectCancel() {
  try {
    await outboundOrderService.rejectCancel(selectedOrder.value.id);
    // showToast('Đã từ chối hủy đơn');
    toast.success('Đã từ chối hủy đơn');
    resetForm();
    orders.value = await outboundOrderService.getAll();

  } catch (error) {
    console.log('Reject cancel error:', error);
    // showToast('Từ chối hủy đơn thất bại');
    toast.error('Từ chối hủy đơn thất bại');
  }
};

async function handleQuickScan(serialInput) {
  console.log('Handling quick scan for serial:', serialInput);

  if (typeof serialInput === 'string' && serialInput.trim()) {
    quickSerial.value = serialInput;
  }

  const serial = norm(quickSerial.value);
  if (!serial) return;

  if (!selectedOrder.value?.items?.length) {
    // showToast('Chưa chọn phiếu');
    toast.error('Chưa chọn phiếu');
    return;
  }

  const reqScanned = {
    serialNumber: serial,
    warehouseId: selectedOrder.value.warehouseId,
    scannedByUserId: userId.value,
  };

  console.log('Quick scanning serial request:', reqScanned);

  try {
    await outboundOrderService.scanned(
      selectedOrder.value.id,
      reqScanned
    );

    // showToast('Quét thành công');
    toast.success('Quét thành công');

    // reload order
    const updatedOrder = await outboundOrderService.getById(
      selectedOrder.value.id,
      { includeItems: true }
    );
    selectedOrder.value = normalizeOrder(updatedOrder);

  } catch (error) {
    const msg = error.response?.data?.message;
    console.log('Quick scan error:', msg);

    if (msg === 'Serial had been scanned') {
      // showToast('Serial này đã được quét trước đó');
      toast.warning('Serial này đã được quét trước đó');
    } else if (msg === 'Serial not found') {
      // showToast('Không tìm thấy serial này trong kho');
      toast.error('Không tìm thấy serial này trong kho');
    } else if (msg === 'Serial not in order') {
      // showToast('Serial không thuộc sản phẩm trong phiếu');
      toast.error('Serial không thuộc sản phẩm trong phiếu');
    } else {
      // showToast('Quét thất bại');
      toast.error('Quét thất bại');
    }
  } finally {
    quickSerial.value = '';
    quickInputRef.value?.focus();
  }
};


function startQrScanner() {
  if (!selectedOrder.value) 
  
  return toast.error("Chọn phiếu trước khi quét QR");;
  qrScannerVisible.value = true;
  qrScanner.value = new Html5Qrcode("qr-reader");
  qrScanner.value.start(
    { facingMode: "environment" },
    {
      fps: 10,
      qrbox: 250
    },
    (decodedText) => {
      handleQuickScan(decodedText);
      stopQrScanner();
    },
    (errorMessage) => {
      console.log("error scan: ", errorMessage)
    }
  ).catch(err => {
    console.error("QR Scanner start error", err);
    // showToast("Không thể mở camera để quét QR");
    toast.error("Không thể mở camera để quét QR");
    qrScannerVisible.value = false;
  });
};

function stopQrScanner() {
  if (qrScanner.value) {
    qrScanner.value.stop().then(() => {
      qrScanner.value.clear();
      qrScannerVisible.value = false;
    }).catch(err => {
      console.error("QR Scanner stop error", err);
      qrScannerVisible.value = false;
    });
  } else {
    qrScannerVisible.value = false;
  }
};


async function confirmExport() {
  if (!selectedOrder.value) return;
  const req = {
    exportedBy: userId.value,
  };
  try {
    await outboundOrderService.confirmExport(selectedOrder.value.id, req);
    // showToast('Đã xuất hàng & xác nhận phiếu');
    toast.success('Đã xuất hàng & xác nhận phiếu');
    const updatedOrder = await outboundOrderService.getById(selectedOrder.value.id, { includeItems: true });
    selectedOrder.value = normalizeOrder(updatedOrder);
    resetForm();
  } catch (error) {
    console.log('Confirm export error:', error);
    // showToast('Xuất hàng thất bại');
    toast.error('Xuất hàng thất bại');
  }
};

function checkSearInput() {
  if (!searchInput.value) {
    // showToast('Vui lòng nhập mã phiếu để tìm kiếm');
    toast.warning('Vui lòng nhập mã phiếu để tìm kiếm');
    return false;
  }
  handleSearch();
  return true;
};

function changePage(newPage) {
  orders.value.conntent = [];
  if (newPage < 0 || newPage >= Math.ceil((orders.value.totalElements || 0) / payloadSearch.value.size)) return;
  payloadSearch.value.page = newPage;
  handleSearch();
};

async function handleSearch() {
  payloadSearch.value.search = searchInput.value.trim() || null
  payloadSearch.value.status = status.value || null;

  loading.value = true;
  console.log('Searching orders with payload:', payloadSearch.value);
  try {
    orders.value = await outboundOrderService.search(payloadSearch.value);
  } catch {
    // showToast('Không tìm thấy phiếu xuất phù hợp');
    toast.error('Không tìm thấy phiếu xuất phù hợp');
  } finally {
    loading.value = false;
  }
};

function showToast(msg = '') { toastMsg.value = msg; clearTimeout(toastTimer); toastTimer = setTimeout(() => toastMsg.value = '', 1600); }

function resetForm() {
  note.value = '';
  selectedOrder.value = null;
};

async function load() {

  loading.value = true;

  try {
    orders.value = await outboundOrderService.search(payloadSearch.value);
    console.log('Loaded orders:', orders.value);
  } catch { 
    // showToast('Không tải được danh sách phiếu'); 
    toast.error('Không tải được danh sách phiếu');
  }
  finally { loading.value = false; }
};

watch(status, () => {
  orders.value = [];
  handleSearch();
});

onMounted(async () => {
  auth.loadToken();
  userId.value = auth.userId;
  console.log('Authenticated userId:', userId.value);
  load();

});
</script>

<style scoped>
.pbox {
  display: flex;
  gap: 16px;
  width: 100%;
}

.side {
  width: 320px;
  background: #fff;
  border-radius: 14px;
  padding: 14px;
  position: sticky;
  top: 96px;
  overflow: auto;
}

.brand {
  font-weight: 700;
  font-size: 18px;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}


.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-card {
  background: #fff;
  border: 1px solid #eef2f7;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.badge-card {
  background: #fff;
  border: 1px solid #eef2f7;
  border-radius: 10px;
  padding: 8px 14px;
  text-align: center;
  display: inline-flex;
  flex-direction: column;
  min-width: 140px;
}

.badge-card .num {
  font-weight: 700;
  color: #1f2937;
  font-size: 18px;
}

.table-balanced th,
.table-balanced td {
  vertical-align: middle;
  white-space: nowrap;
  height: 56px;
  padding-top: 12px;
  padding-bottom: 12px;
}

.thead-soft th {
  background: #cfe3ff;
  color: #0b1324;
  font-weight: 600;
  letter-spacing: .2px;
  border-top: 1px solid #9ec5fe;
  border-bottom: 1px solid #9ec5fe;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.toast-box {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #111;
  color: #fff;
  padding: 10px 14px;
  border-radius: 8px;
  z-index: 20000;
}

@media (max-width: 992px) {
  .pbox {
    flex-direction: column;
  }

  .side {
    width: 100%;
    height: auto;
    position: static;
  }
}
</style>
