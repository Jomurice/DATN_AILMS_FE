<template>
  <div class="container-fluid px-3 py-4">
    <div class="pbox">
      <!-- Aside -->
      <aside class="side">
        <div class="brand"><i class="fa-solid fa-receipt me-2"></i>Đơn mua (Phiếu nhập)</div>

        <div class="mb-2 d-flex gap-2 flex-wrap">
          <button class="btn btn-sm" :class="chip('ALL')" @click="status='ALL'">Tất cả</button>
          <button class="btn btn-sm" :class="chip('PENDING')" @click="status='PENDING'">Chờ xử lý</button>
          <button class="btn btn-sm" :class="chip('IN_PROGRESS')" @click="status='IN_PROGRESS'">Đang thực hiện</button>
          <button class="btn btn-sm" :class="chip('COMPLETED')" @click="status='COMPLETED'">Hoàn tất</button>
        </div>

        <div class="list-group small">
          <button
            v-for="o in filteredOrders"
            :key="o.id"
            class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
            :class="{ active: selectedOrder?.id === o.id }"
            @click="openOrder(o)"
          >
            <div>
              <div class="fw-bold">{{ cut(o.code, 20) }}</div>
              <div class="fw-semibold">{{ cut(o.supplier, 20) }}</div>
              <div class="badge bg-light text-dark mt-1">{{ viStatus(o.status) }}</div>
            </div>
            <small class="text-muted">{{ d(o.createdAt || o.eta) }}</small>
          </button>

          <div v-if="!loading && !filteredOrders.length" class="text-muted p-3">Không có phiếu phù hợp</div>
          <div v-if="loading" class="text-center py-3"><div class="spinner-border text-dark"></div></div>
        </div>
      </aside>

      <!-- Main -->
      <main class="main">
        <div class="section-card" v-if="selectedOrder">
          <div class="d-flex align-items-center justify-content-between px-3 pt-3 pb-2">
            <div class="fw-bold">
              <div>{{ selectedOrder.code }} — <span class="text-muted">{{ cut(selectedOrder.supplier, 28) }}</span></div>
              <small class="text-muted">
                Ngày tạo: {{ d(selectedOrder.createdAt || selectedOrder.eta) }} • Trạng thái:
                {{ viStatus(selectedOrder.status) }}
              </small>
            </div>
            <div class="d-flex gap-2">
              <RouterLink class="btn btn-outline-primary btn-sm" to="/inbound/new">+ Tạo đơn mua</RouterLink>
              <button class="btn btn-outline-secondary btn-sm" @click="selectedOrder=null">← Quay lại</button>
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
              <input
                ref="quickInputRef"
                v-model.trim="quickSerial"
                @keyup.enter="handleQuickScan"
                class="form-control mono"
                placeholder="Quét nhanh serial… (vd: iphone15prm-0001)"
                :disabled="!canScan" 
              />
              <button class="btn btn-primary" @click="handleQuickScan">Quét</button>
            </div>
          </div>

          <!-- Table (gọn, không sort/pagination) -->
          <div class="table-responsive">
            <table class="table table-hover mb-0 table-balanced">
              <thead class="thead-soft">
                <tr class="text-uppercase fw-semibold">
                  <th>SKU</th><th>Tên hàng hóa</th><th>Loại</th><th>Hãng</th>
                  <th>Màu</th><th class="text-end">Số lượng</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="it in (selectedOrder.items||[])" :key="(it.id || it.sku)">
                  <td class="mono nowrap">{{ it.sku }}</td>
                  <td class="nowrap" :title="it.name">{{ cut(it.name, 28) }}</td>
                  <td class="nowrap">{{ cut(it.categoryName, 18) }}</td>
                  <td class="nowrap">{{ cut(it.brandName, 18) }}</td>
                  <td class="nowrap">{{ cut(it.color || '—', 16) }}</td>
                  <td class="text-end nowrap mono">
                    <span>{{ scannedCount(it.sku) }}/{{ it.orderQuantity }}</span>
                    <button class="btn btn-link btn-sm ms-1" 
                            title="Xem serial đã quét" 
                            @click="openSerialsModal(it.sku, it.productId)">
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
            <button class="btn btn-success" :disabled="!canComplete" @click="completeOrder" > Nhập hàng</button>
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

    <!-- Modal: Serial đã quét -->
<!-- Modal: Serial đã quét -->
<div v-if="modalSku" class="modal-overlay d-flex align-items-center justify-content-center">
  <div class="card w-50 p-2 notranslate" translate="no">
    <div class="d-flex align-items-center justify-content-between">
      <h5 class="mb-0">Đã quét Serial — SKU: {{ modalSku }}</h5>
      <button class="btn btn-sm btn-outline-secondary" @click="modalSku=null">Đóng</button>
    </div>
    <div class="table-responsive mt-2">
      <table class="table table-sm" translate="no">
        <thead>
          <tr>
            <th class="notranslate">Serial</th>
            <th>Trạng thái</th>
            <th>Vị trí (Bin)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in modalSerials" :key="s.serialNumber">
            <td class="mono nowrap notranslate">{{ s.serialNumber }}</td>
            <td class="nowrap">{{ s.status }}</td>
            <td class="nowrap notranslate">{{ s.binId || s.warehouseId || '—' }}</td>
          </tr>
          <tr v-if="!modalSerials.length">
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
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { purchaseOrderService } from "@/services/purchaseOrderService";
import { tokenService } from "@/services/TokenService";
import { fire, EVENTS } from "@/services/eventBus";
import api from "@/services/axios";   // ✅ import đúng axios instance

const auth = tokenService();
const userId = ref('')

/* ========== helpers ========== */
const cut = (s, n=20) => s && s.length > n ? s.slice(0, n) + '...' : (s || '');
const d = x => {
  if(!x) return '—';
  try {
    if(typeof x === 'string' && /^\d{4}-\d{2}-\d{2}/.test(x)) return x;
    const t = new Date(x);
    return isNaN(+t) ? x : t.toISOString().slice(0,10);
  } catch { return x; }
};
const key = s => String(s||'').trim().toLowerCase();
const skuFromSerial = s => String(s||'').split('-')[0]?.trim()?.toLowerCase() || '';
const inflight = new Set();

/* ========== state ========== */
const orders = ref([]);
const loading = ref(true);
const status = ref('ALL');
const selectedOrder = ref(null);
const quickSerial = ref('');
const quickInputRef = ref(null);
const scannedBySku = ref({}); 
const modalSku = ref(null);
const toastMsg = ref(""); 
let toastTimer = null;
const modalSerials = ref([]);     // danh sách serials hiển thị trong modal

/* ========== filters ========== */
const chip = s => ({ 'btn-outline-secondary': status.value!==s, 'btn-primary text-white': status.value===s });
const viStatus = s => {
  const k = String(s||'').toUpperCase();
  if(k==='PENDING'||k==='UPCOMING') return 'Chờ xử lý';
  if(k==='IN_PROGRESS') return 'Đang thực hiện';
  if(k==='COMPLETED'||k==='DONE') return 'Hoàn tất';
  return s||'—';
};
const filteredOrders = computed(() => {
  if(status.value==='ALL') return orders.value;
  return orders.value.filter(o => {
    const k = String(o.status||'').toUpperCase();
    if(status.value==='PENDING') return k==='PENDING'||k==='UPCOMING';
    if(status.value==='COMPLETED') return k==='COMPLETED'||k==='DONE';
    return k===status.value;
  });
});

/* ========== computed ========== */
const scannedCount = sku => scannedBySku.value[key(sku)]?.count || 0;
const canComplete = computed(() => {
  if (!selectedOrder.value) return false;

  const statusUp = String(selectedOrder.value.status || '').toUpperCase();
  if (statusUp === 'COMPLETED' || statusUp === 'DONE') return false;

  const m = scannedBySku.value;
  return Object.keys(m).some(k => (m[k]?.count || 0) > 0);
});


/* ========== open order ========== */
async function openOrder(o){
  try {
    let full = o;
    if(!Array.isArray(o.items)||!o.items.length){
      full = await purchaseOrderService.getById(o.id,{ includeItems:true });
    }
    selectedOrder.value = normalizeOrder(full);

    // ✅ khởi tạo scannedBySku từ dữ liệu đã quét
    scannedBySku.value = {};
    for (const item of selectedOrder.value.items || []) {
      const skuKey = key(item.sku);
      scannedBySku.value[skuKey] = {
        count: item.scannedQuantity || (item.scannedSerials?.length || 0),
        details: item.scannedSerials?.map(s => ({
          serialNumber: s.serialNumber,
          status: s.status,
          binId: s.binId
        })) || []
      };
    }
  } catch {
    toast('Không tải được chi tiết phiếu');
  }
}

function normalizeOrder(order){
  const items = (order.items||[]).map(x => ({
    id: x.id ?? x.purchaseOrderItemId ?? null,
    productId: x.productId ?? x.product?.id ?? null,
    sku: x.sku ?? x.product?.sku ?? '',
    name: x.name ?? x.product?.name ?? '',
    categoryName: x.categoryName ?? x.product?.categoryName ?? x.product?.category?.name ?? '',
    brandName: x.brandName ?? x.product?.brandName ?? x.product?.brand?.name ?? '',
    color: x.color ?? x.product?.color ?? '',
    orderQuantity: Number(x.orderQuantity ?? x.qty ?? 0)
  }));
  return { ...order, items };
}

/* ========== quick scan ========== */
async function handleQuickScan() {
  const serial = String(quickSerial.value || '').trim();
  if (!serial) return;

  if (!selectedOrder.value?.items?.length) {
    toast("Chưa chọn phiếu");
    return;
  }

  try {
    const item = selectedOrder.value.items.find(i =>
      serial.toLowerCase().includes(i.sku.toLowerCase())
    );

    if (!item) {
      toast("Serial không khớp với SKU nào trong phiếu");
      return;
    }

  await api.post(
    "/api/product-details/confirm-scan",
    {
      serialNumber: serial,
      warehouseId: selectedOrder.value?.warehouseId,   // hoặc lấy từ order hiện tại
      scannedByUserId: userId.value
    }
);


    toast("Quét thành công!");

    // ✅ Cách A: update local
    const skuKey = key(item.sku);
    if (!scannedBySku.value[skuKey]) {
      scannedBySku.value[skuKey] = { count: 0, details: [] };
    }
    scannedBySku.value[skuKey].count++;
    scannedBySku.value[skuKey].details.push({
      serialNumber: serial,
      status: "SCANNED",
      binId: null
    });

    // ✅ Hoặc dùng Cách B: reload order
    // const updated = await purchaseOrderService.getById(selectedOrder.value.id, { includeItems: true });
    // selectedOrder.value = normalizeOrder(updated);

  } catch (err) {
    console.error("Scan error", err);

    // ✅ xử lý lỗi chi tiết
    const code = err.response?.data?.code;
    const msg = err.response?.data?.message;

    if (code === "SERIAL_ALREADY_SCANNED") {
      toast("⚠️ Serial này đã được scan trước đó");
    } else if (code === "SERIAL_NOT_FOUND") {
      toast("❌ Serial không tồn tại trong hệ thống");
    } else if (code === "SKU_MISMATCH") {
      toast("⚠️ Serial không khớp với SKU trong phiếu");
    } else {
      toast(msg || "Có lỗi xảy ra khi quét");
    }
  } finally {
    quickSerial.value = "";
    quickInputRef.value?.focus();
  }
}

const canScan = computed(() => {
  if (!selectedOrder.value) return false;

  const status = (selectedOrder.value.status || '').toUpperCase();
  
  // Chỉ disable khi status là COMPLETED
  return status !== 'COMPLETED';
});



async function completeOrder() {
  if (!selectedOrder.value) {
    toast("Chưa chọn phiếu");
    return;
  }
  try {
    await api.post(
      `/api/purchase-orders/${selectedOrder.value.id}/complete`,
      {},
      { params: { userId: userId.value } }
    );
    toast("Nhập kho thành công!");

    // reload danh sách để cập nhật trạng thái
    orders.value = await purchaseOrderService.list();
    selectedOrder.value = null;
  } catch (err) {
    console.error("Complete error", err);
    toast(err.response?.data?.message || "Có lỗi khi nhập kho");
  }
}




/* ========== modal & toast ========== */
async function openSerialsModal(sku, productId) {
  if (!selectedOrder.value) return;

  modalSku.value = sku;
  modalSerials.value = []; // reset trước khi load

  try {
    // gọi API backend
    const res = await api.get(`/api/purchase-orders/${selectedOrder.value.id}/serials`, {
      params: { sku }
    });

    // trả về danh sách serial
    modalSerials.value = Array.isArray(res.data.result) ? res.data.result : [];

  } catch (err) {
    console.error("Load serials error", err);
    toast("Không tải được serials");
  }
}




function toast(msg=''){ 
  toastMsg.value = msg; 
  clearTimeout(toastTimer); 
  toastTimer = setTimeout(()=>toastMsg.value='',1600); 
}

/* ========== onMounted ========== */
onMounted(async ()=>{
  // userId.value = toke
  auth.loadToken();
  userId.value = auth.userId;
  try { orders.value = await purchaseOrderService.list(); }
  catch{ toast('Không tải được danh sách phiếu'); }
  finally{ loading.value=false; }
});
</script>

<style scoped>
.pbox{ display:flex; gap:16px; width:100%; }
.side{ width:320px; background:#fff; border-radius:14px; padding:14px; position:sticky; top:96px; height:calc(100vh - 110px); overflow:auto; }
.brand{ font-weight:700; font-size:18px; display:flex; align-items:center; margin-bottom:10px; }
.main{ flex:1; display:flex; flex-direction:column; gap:16px; }
.section-card{ background:#fff; border:1px solid #eef2f7; border-radius:12px; box-shadow:0 1px 2px rgba(0,0,0,0.03); }

.badge-card{ background:#fff; border:1px solid #eef2f7; border-radius:10px; padding:8px 14px; text-align:center; display:inline-flex; flex-direction:column; min-width:140px; }
.badge-card .num{ font-weight:700; color:#1f2937; font-size:18px; }

.table-balanced th, .table-balanced td{ vertical-align:middle; white-space:nowrap; height:56px; }
.nowrap{ white-space:nowrap; }
.thead-soft th{ background:#cfe3ff; color:#0b1324; font-weight:600; letter-spacing:.2px; border-top:1px solid #9ec5fe; border-bottom:1px solid #9ec5fe; }
.mono{ font-family: ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace; }

.modal-overlay{ position:fixed; inset:0; background:rgba(0,0,0,.6); z-index:10000; }
.toast-box{ position:fixed; bottom:20px; right:20px; background:#111; color:#fff; padding:10px 14px; border-radius:8px; z-index:20000; }

@media (max-width: 992px){
  .pbox{ flex-direction:column; }
  .side{ width:100%; height:auto; position:static; }
}
</style>
