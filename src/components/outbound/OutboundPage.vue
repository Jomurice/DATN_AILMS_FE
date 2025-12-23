<template>
  <div class="pbox">
    <OutboundAside class="aside" :orders="orders" :loading="loading" :payload="payloadSearch" :show-side="showSide"
      :visible-pages="orderPagination.visiblePages.value" :status="payloadSearch.status"
      :total-pages="orderPagination.totalPages.value" @show-side="showSideModal" @search="handleSearch"
      @change-status="handleChangeStatus" @select-order="openOrder" @change-page="handleOrderPageChange"
      @clear-input="clearInputSearch" />

    <OutboundMain :order="selectedOrder" :customer="customer" :qrScannerVisible="qrScannerVisible" :role="role"
      :loading-order="loadingOrder" :modal-serials="modalSerials" :modal-sku="modalSku" :serial="quickSerial"
      :payload="payloadSerial" :loading="loadingModalSku" :visible-pages="serialPagination.visiblePages.value"
      @scan="handleQuickScan" @scanQr="handleScanQr" @change-page="handleSerialPageChange" @stopCamera="stopQrScanner"
      @export="confirmExport" @cancel="openCancelModal" @confirm="openNoteCancelModal" @reject="rejectCancel"
      @open-serials-modal="openSerialsModal" @close="closeModalSerial" />

    <ConfirmModal modal-id="confirmCancel" :show="modalState === 'CONFIRM_CANCEL'" title="Xác nhận hủy phiếu xuất"
      message="Hành động này sẽ hoàn trả serial về kho. Bạn có chắc chắn muốn hủy phiếu này không?"
      confirm-text="Xác nhận hủy" @close-modal="closeCancelModal"
      @confirm="() => { cancelModalVisible = true; closeCancelModal(); }" @cancel="closeCancelModal" />

    <ConfirmModal modal-id="noteCancel" :show="modalState === 'NOTE_CANCEL'" title="Lý do hủy"
      :message="selectedOrder?.note" confirm-text="Xác nhận hủy" cancel-text="Không hủy" @close-modal="closeCancelModal"
      @confirm="() => { confirmCancel(); closeCancelModal() }" @cancel="() => { rejectCancel(), closeCancelModal() }" />


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

    <div v-if="toastMsg" class="toast-box">{{ toastMsg }}</div>

    <div v-if="loadingScan" class="modal-overlay">
      <div class="spinner-border"></div>
    </div>

  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { tokenService } from "@/services/TokenService";
import OutboundAside from './OutboundAside.vue'
import OutboundMain from './OutboundMain.vue'
import ConfirmModal from '../modal/ConfirmModal.vue'
import { usePagination } from '../../utils/usePagination'
import { outboundOrderService } from '../../services/outbound/outboundOrderService'
import { customerService } from '../../services/outbound/CustomerService'
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "vue-sonner";


// state
const auth = tokenService();
const userId = ref('');
const role = ref('');

const orders = ref('');
const selectedOrder = ref(null);
const customer = ref({});
const modalSku = ref('');
const modalSerials = ref({});
const quickSerial = ref('');
const quickInputRef = ref(null);
const qrScanner = ref(null);
const qrScannerVisible = ref(false);
const showNoteCancelModal = ref(false);
const cancelModalVisible = ref(false);
const modalState = ref(null)
const note = ref('');
const showSide = ref(false)
const scanCooldown = ref(false);

// loading
const loading = ref(false);
const loadingScan = ref(false);
const loadingModalSku = ref(false);
const loadingOrder = ref(false);


const status = ref('')
const payloadSearch = ref({
  search: null,
  status: null,
  page: 0,
  size: 5,
  sort: "createAt,desc"
});

const payloadSerial = ref({
  sku: '',
  page: 0,
  size: 5,
});

const openCancelModal = () => modalState.value = 'CONFIRM_CANCEL'
const openNoteCancelModal = () => modalState.value = 'NOTE_CANCEL'
const closeCancelModal = () => modalState.value = null

const orderPagination = usePagination(orders, payloadSearch);
const serialPagination = usePagination(modalSerials, payloadSerial);

const closeModalSerial = () => {
  payloadSerial.value = {
    sku: '',
    page: 0,
    size: 5,
  };
  modalSku.value = null;
  modalSerials.value = [];
};

const showSideModal = () => {
  if (showSide.value === true) {
    showSide.value = false;
    return;
  }

  showSide.value = true;


}

function clearInputSearch() {
  payloadSearch.value.search = null;
  loadOrders();
};

function handleSearch(keyword) {
  if (!keyword) {
    toast.error('Vui lòng nhập mã phiếu để tìm kiếm');
    return false;
  }

  payloadSearch.value.search = keyword
  payloadSearch.value.page = 0
  payloadSearch.value.status = null
  loadOrders()
};

function handleChangeStatus(status) {
  payloadSearch.value.search = null
  payloadSearch.value.status = status
  payloadSearch.value.page = 0
  loadOrders()
};

function handleOrderPageChange(p) {
  payloadSearch.value.page = p
  loadOrders()
};

function handleSerialPageChange(p) {
  payloadSerial.value.page = p
  openSerialsModal(modalSku.value)
};



// api
async function loadOrders() {
  orders.value = [];
  loading.value = true
  try {

    // payloadSearch.value.status = status.value || null
    orders.value = await outboundOrderService.search(payloadSearch.value);
  } catch {
    toast.error("Lỗi tải danh sách đơn xuất ")
  } finally {
    loading.value = false
  }
}

async function openOrder(o) {
  loadingOrder.value = true;
  selectedOrder.value = [];
  try {
    let full = o;
    if (!Array.isArray(o.items) || !o.items.length) {
      full = await outboundOrderService.getById(o.id, { includeItems: true });
    }
    customer.value = await customerService.getById(full.customerId);
    selectedOrder.value = normalizeOrder(full);
    modalSerials.value = {};
    showSide.value = false;
  } catch {
    toast.error('Không tải được chi tiết phiếu');
  } finally {
    loadingOrder.value = false;
  }
};

async function openSerialsModal(sku) {
  modalSku.value = String(sku || '');
  modalSerials.value = [];

  if (!modalSku.value) {
    toast.error('SKU không hợp lệ')
    return
  }
  payloadSerial.value.sku = modalSku.value;

  loadingModalSku.value = true;
  try {
    modalSerials.value = await outboundOrderService.getSerials(selectedOrder.value.id, payloadSerial.value);
  } catch {
    toast.error('Không tải được chi tiết đơn hàng');
  } finally {
    loadingModalSku.value = false
  }
};

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
};

async function cancelOutbound() {
  if (!selectedOrder.value) return;
  if (!note.value) {
    toast.error('Vui lòng nhập lý do hủy đơn');
    return;
  }
  const req = {
    note: note.value,
    canceledBy: userId.value,
  };

  cancelModalVisible.value = true;
  try {
    await outboundOrderService.cancelOrder(selectedOrder.value.id, req);
    toast.success('Đã gửi yêu cầu hủy đơn');
    resetForm();
    loadOrders();
    note.value = '';
  } catch (e) {
    console.log(e)
    toast.error('Gửi yêu cầu hủy đơn thất bại');
  } finally {
    cancelModalVisible.value = false;
  }
};

async function confirmCancel() {
  try {
    await outboundOrderService.confirmCancel(selectedOrder.value.id);
    toast.success('Hủy đơn thành công');
    resetForm();
    loadOrders();
  } catch {
    toast.error('Hủy đơn thất bại');
  }
  showNoteCancelModal.value = false
};

async function rejectCancel() {
  try {
    await outboundOrderService.rejectCancel(selectedOrder.value.id);
    toast.success('Đã từ chối hủy đơn');
    showNoteCancelModal.value = false
    resetForm();
    loadOrders();
  } catch {
    toast.error('Từ chối hủy đơn thất bại');
  }

};

async function handleQuickScan(serialInput) {

  if (typeof serialInput === 'string' && serialInput.trim()) {
    quickSerial.value = serialInput;
  }

  // if (isScanning.value || scanCooldown.value) return;

  // isScanning.value = true;

  const serial = quickSerial.value.trim() || '';
  if (!serial) {
    toast.error('Vui lòng nhập mã serial để quét');
    return
  };

  if (!selectedOrder.value?.items?.length) {
    toast.error('Chưa chọn phiếu');
    return;
  }

  const reqScanned = {
    serialNumber: serial,
    warehouseId: selectedOrder.value.warehouseId,
    scannedByUserId: userId.value,
  };

  loadingScan.value = true
  try {
    await outboundOrderService.scanned(
      selectedOrder.value.id,
      reqScanned
    );

    toast.success('Quét thành công');

    // reload order
    const updatedOrder = await outboundOrderService.getById(
      selectedOrder.value.id,
      { includeItems: true }
    );
    selectedOrder.value = normalizeOrder(updatedOrder);

  } catch (error) {
    const msg = error.response?.data?.message;

    if (msg === 'Serial had been scanned') {
      toast.error('Serial này đã được quét trước đó');
    } else if (msg === 'Serial not found') {
      toast.error('Không tìm thấy serial này trong kho');
    } else if (msg === 'Serial not in order') {
      toast.error('Serial không thuộc sản phẩm trong phiếu');
    } else {
      toast.error('Quét thất bại');
    }
  } finally {
    quickSerial.value = '';
    quickInputRef.value?.focus();
    loadingScan.value = false;
  }
};



function handleScanQr() {
  if (!selectedOrder.value) return toast.error("Chọn phiếu trước khi quét QR");
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
      // stopQrScanner();
    },
    (errorMessage) => {
      console.log("error scan: ", errorMessage)
    }
  ).catch(err => {
    toast.error("Không thể mở camera để quét QR");
    qrScannerVisible.value = false;
  });
};

function stopQrScanner() {
  if (qrScanner.value) {
    qrScanner.value.stop().then(() => {
      qrScanner.value.clear();
      qrScannerVisible.value = false;
      isScanning.value = false;
      scanCooldown.value = false;
    }).catch(err => {
      console.error("QR Scanner stop error", err);
      qrScannerVisible.value = false;
      toast.error("Lỗi khi dừng camera");
    });
  } else {
    qrScannerVisible.value = false;
    isScanning.value = false;
    scanCooldown.value = false;
  }
}


async function confirmExport() {
  if (!selectedOrder.value) return;
  const req = {
    exportedBy: userId.value,
  };
  try {
    await outboundOrderService.confirmExport(selectedOrder.value.id, req);
    toast.success('Đã xuất hàng & xác nhận phiếu');
    resetForm();
    loadOrders();
  } catch (error) {
    console.log('Confirm export error:', error);
    toast.error('Xuất hàng thất bại');
  }
};


function resetForm() {
  note.value = '';
  selectedOrder.value = null;
  customer.value = '';
  modalSerials.value = null;
  payloadSearch.value = {
    search: null,
    status: null,
    page: 0,
    size: 5,
    sort: "createAt,desc"
  }
};


// ================= WATCH =================
watch(status, () => {
  payloadSearch.value.page = 0
  loadOrders()
})

onMounted(async () => {
  auth.loadToken();
  userId.value = auth.userId;
  role.value = auth.role
  loadOrders();
});
</script>

<style scoped>
.pbox {
  display: flex;
  gap: 16px;
  width: 100%;
  min-height: calc(100vh - 150px);
}

.pbox>*:last-child {
  flex: 1;
  min-width: 0;
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

/* mobile */

@media (max-width: 768px) {
  .pbox {
    flex-direction: column;
    gap: 12px;
  }


  .modal-overlay .card {
    width: 95% !important;
    padding: 16px !important;
  }
}
</style>
