<template>
  <div class="container-fluid px-3 py-4">
    <div class="pbox">
      <!-- Aside -->
      <aside class="side">
        <div class="brand"><i class="fa-solid fa-receipt me-2"></i>Đơn mua (Phiếu nhập)</div>

        <div class="mb-2 d-flex gap-2 flex-wrap">
          <button class="btn btn-sm" :class="chipCls('ALL')" @click="status='ALL'">Tất cả</button>
          <button class="btn btn-sm" :class="chipCls('UPCOMING')" @click="status='UPCOMING'">Sắp xảy ra</button>
          <button class="btn btn-sm" :class="chipCls('IN_PROGRESS')" @click="status='IN_PROGRESS'">Đang thực hiện</button>
          <button class="btn btn-sm" :class="chipCls('DONE')" @click="status='DONE'">Hoàn tất</button>
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
              <div class="fw-bold">{{ o.code }}</div>
              <div class="fw-semibold">{{ o.supplier }}</div>
              <div class="badge bg-light text-dark mt-1">{{ toViStatus(o.status) }}</div>
            </div>
            <small class="text-muted">{{ o.eta }}</small>
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
              <div>{{ selectedOrder.code }} — <span class="text-muted">{{ selectedOrder.supplier }}</span></div>
              <small class="text-muted">ETA: {{ selectedOrder.eta }} • Trạng thái: {{ toViStatus(selectedOrder.status) }}</small>
            </div>
            <button class="btn btn-outline-secondary btn-sm" @click="selectedOrder=null">← Quay lại</button>
          </div>

          <!-- Toolbar -->
          <div class="px-3 pb-3 d-flex align-items-center flex-wrap gap-3">
            <div class="badge-card">
              <div class="text-muted small">Tổng loại hàng hóa:</div>
              <div class="num">{{ selectedOrder.items?.length || 0 }}</div>
            </div>

            <div class="flex-grow-1 d-flex align-items-center gap-2">
              <input
                ref="quickInputRef"
                v-model.trim="quickSerial"
                @keyup.enter="handleQuickScan"
                class="form-control"
                placeholder="Quét nhanh serial… (vd: iphone15prm-0001)"
              />
              <button class="btn btn-primary" @click="handleQuickScan">Quét</button>
            </div>
          </div>

          <!-- Table -->
          <div class="table-responsive">
            <table class="table table-hover mb-0 table-balanced">
              <colgroup>
                <col style="width:12%"/><col style="width:28%"/><col style="width:14%"/>
                <col style="width:12%"/><col style="width:20%"/><col style="width:7%;min-width:110px"/>
                <col style="width:7%;min-width:110px"/>
              </colgroup>

              <thead class="thead-soft">
                <tr class="text-uppercase fw-semibold">
                  <th>SKU</th>
                  <th>Tên hàng hóa</th>
                  <th>Loại</th>
                  <th>Hãng</th>
                  <th>Màu</th>
                  <th class="text-end">Số lượng</th>
                  <th class="text-center">Quét serial</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="it in pagedItems" :key="it.sku">
                  <td class="mono nowrap">{{ it.sku }}</td>
                  <td class="nowrap">{{ it.name }}</td>
                  <td class="nowrap">{{ it.categoryName }}</td>
                  <td class="nowrap">{{ it.brandName }}</td>
                  <td class="nowrap">{{ it.color || '—' }}</td>
                  <td class="text-end nowrap">
                    <span>{{ scannedCount(it.sku) }}/{{ it.qty }}</span>
                    <button class="btn btn-link btn-sm ms-1" title="Xem serial đã quét" @click="openSerialsModal(it.sku)">
                      <i class="fa-solid fa-eye"></i>
                    </button>
                  </td>
                  <td class="text-center nowrap">
                    <button class="btn btn-outline-primary" @click="handleRowScanWithGlobal(it)">Quét</button>
                  </td>
                </tr>

                <tr v-if="!selectedOrder.items?.length">
                  <td colspan="7" class="text-center text-muted py-3">Phiếu này chưa có dòng hàng</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pager -->
          <div class="pager-bar">
            <div class="d-flex align-items-center gap-2">
              <span class="small text-muted">Số mục</span>
              <select v-model.number="pageSize" class="form-select form-select-sm w-auto">
                <option v-for="n in pageSizeOptions" :key="n" :value="n">{{ n }}</option>
              </select>
              <button class="btn btn-sm btn-outline-secondary" :disabled="page<=1" @click="page--">&lt;</button>
              <span class="px-2">{{ page }}</span>
              <button class="btn btn-sm btn-outline-secondary" :disabled="page>=pageCount" @click="page++">&gt;</button>
            </div>
          </div>

          <div class="px-3 py-3 d-flex justify-content-end">
            <button class="btn btn-success" :disabled="!canComplete" @click="completeOrder">Nhập hàng</button>
          </div>
        </div>

        <div v-else class="section-card">
          <div class="px-3 pt-3 pb-2 d-flex align-items-center justify-content-between">
            <h5 class="fw-bold mb-0">Chọn 1 phiếu mua để bắt đầu quét</h5>
          </div>
          <div class="p-3 text-muted">Hãy chọn phiếu từ danh sách bên trái.</div>
        </div>
      </main>
    </div>

    <!-- Modal: chặn auto-translate -->
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
              <tr v-for="s in scannedBySku[modalSku]?.details || []" :key="s.serialNumber">
                <td class="mono nowrap notranslate">{{ s.serialNumber }}</td>
                <td class="nowrap">{{ s.status }}</td>
                <td class="nowrap notranslate">{{ s.binId || '—' }}</td>
              </tr>
              <tr v-if="!scannedBySku[modalSku]?.details?.length">
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
import { ref, computed, onMounted, watch } from 'vue'
import { purchaseOrderService } from '../../services/purchaseOrderService'
import { inventoryClient } from '../../services/inventoryClient'

const orders = ref([])
const loading = ref(true)
const status = ref('ALL')
const selectedOrder = ref(null)

const quickSerial = ref('')
const quickInputRef = ref(null)

const scannedBySku = ref({}) // { [sku]: { count, serials:[], details:[] } }
const modalSku = ref(null)
const toastMsg = ref('')
let toastTimer = null

// Fallback demo khi BE lỗi (mặc định false)
const FAKE_SCAN_ON_ERROR = String(import.meta.env?.VITE_FAKE_SCAN_ON_ERROR || '').toLowerCase() === 'true'

// Paging
const page = ref(1)
const pageSize = ref(10)
const pageSizeOptions = [5, 10, 20, 50]

const filteredOrders = computed(() =>
  status.value === 'ALL' ? orders.value : orders.value.filter(o => o.status === status.value)
)
const totalItems = computed(() => selectedOrder.value?.items?.length || 0)
const pageCount = computed(() => Math.max(1, Math.ceil(totalItems.value / pageSize.value)))
const pagedItems = computed(() => {
  const arr = selectedOrder.value?.items || []
  const start = (page.value - 1) * pageSize.value
  return arr.slice(start, start + pageSize.value)
})
watch([selectedOrder, pageSize], () => { page.value = 1 })

const chipCls = s => ({
  'btn-outline-secondary': status.value !== s,
  'btn-primary text-white': status.value === s,
})
const toViStatus = s => ({ UPCOMING:'Sắp xảy ra', IN_PROGRESS:'Đang thực hiện', DONE:'Hoàn tất' }[s] || s)

const scannedCount = sku => scannedBySku.value[sku]?.count || 0
const canComplete = computed(() =>
  selectedOrder.value?.items?.length && Object.values(scannedBySku.value).some(x => (x?.count||0) > 0)
)

const showToast = (msg='') => { toastMsg.value = msg; clearTimeout(toastTimer); toastTimer = setTimeout(()=>toastMsg.value='',1800) }
const skuFromSerial = serial => String(serial||'').split('-')[0]?.trim()?.toLowerCase() || ''

function normalizeOrder(order){
  const items = (order.items || []).map(x => ({
    productId:     x.productId ?? x.product?.id ?? null,
    sku:           x.sku ?? x.product?.sku ?? '',
    name:          x.name ?? x.product?.name ?? '',
    categoryName:  x.categoryName ?? x.product?.category?.name ?? '',
    brandName:     x.brandName ?? x.product?.brand?.name ?? '',
    color:         x.color ?? x.product?.color ?? '',
    qty:           x.qty ?? x.quantity ?? 0,
  }))
  return { ...order, items }
}

// Quét nhanh
async function handleQuickScan(){
  const serial = quickSerial.value?.trim()
  if(!serial) return
  const sku = skuFromSerial(serial)
  const item = selectedOrder.value?.items?.find(x => x.sku?.toLowerCase() === sku)
  if(!item){ showToast('Serial không khớp SKU nào trong phiếu này'); quickSerial.value = ''; return }
  await scanSerialForItem(serial, item)
  quickSerial.value = ''
  quickInputRef.value?.focus()
}

// Quét theo dòng
async function handleRowScanWithGlobal(item){
  const serial = quickSerial.value?.trim()
  if(!serial){ showToast('Nhập/scan serial ở ô “Quét nhanh” trước'); quickInputRef.value?.focus(); return }
  if(skuFromSerial(serial) !== String(item.sku).toLowerCase()){
    showToast(`Serial không khớp SKU dòng này (${item.sku})`); quickInputRef.value?.focus(); return
  }
  await scanSerialForItem(serial, item)
  quickSerial.value = ''
  quickInputRef.value?.focus()
}

// Scan -> cập nhật tiến độ (có fallback tuỳ chọn)
async function scanSerialForItem(serial, item){
  let detail = null
  try{
    detail = await inventoryClient.scan(serial) // {id, serialNumber, status, productId, binId}
  }catch(e){
    if(FAKE_SCAN_ON_ERROR){
      detail = { serialNumber: serial, status: 'INBOUND', productId: item.productId ?? null, binId: null }
    }else{
      showToast('Quét thất bại'); return
    }
  }

  if(item.productId && detail?.productId && String(detail.productId) !== String(item.productId)){
    showToast('BE trả về serial thuộc sản phẩm khác dòng này'); return
  }

  const cur = scannedBySku.value[item.sku] || { count:0, serials:[], details:[] }
  if(cur.serials.includes(serial)){ showToast('Serial này đã quét trong phiếu'); return }

  cur.serials.push(serial)
  cur.details.unshift({
    serialNumber: serial,
    status: detail?.status || 'INBOUND',
    binId: detail?.binId || null
  })
  cur.count = cur.serials.length
  scannedBySku.value[item.sku] = { ...cur }

  showToast('Đã quét ✓')
}

function openSerialsModal(sku){ modalSku.value = sku }

async function openOrder(o){
  try{
    let full = o
    if(!Array.isArray(o.items) || !o.items.length){
      full = await purchaseOrderService.getById(o.id, { includeItems: true })
    }
    selectedOrder.value = normalizeOrder(full)
    scannedBySku.value = {}
    page.value = 1
  }catch{
    showToast('Không tải được chi tiết phiếu')
  }
}

async function completeOrder(){
  if(!selectedOrder.value) return
  try{
    await purchaseOrderService.complete(selectedOrder.value.id, { confirmedAt: new Date().toISOString() })
    selectedOrder.value.status = 'DONE'
    showToast('Đã nhập hàng & xác nhận phiếu')
  }catch{
    showToast('Nhập hàng thất bại')
  }
}

onMounted(async ()=>{
  try{ orders.value = await purchaseOrderService.list() }
  catch{ showToast('Không tải được danh sách phiếu') }
  finally{ loading.value = false }
})
</script>

<style scoped>
.pbox { display:flex; gap:16px; width:100%; }
.side { width:320px; background:#fff; border-radius:14px; padding:14px; position:sticky; top:96px; height:calc(100vh - 110px); overflow:auto; }
.brand { font-weight:700; font-size:18px; display:flex; align-items:center; margin-bottom:10px; }
.main { flex:1; display:flex; flex-direction:column; gap:16px; }
.section-card { background:#fff; border:1px solid #eef2f7; border-radius:12px; box-shadow:0 1px 2px rgba(0,0,0,0.03); }

.badge-card { background:#fff; border:1px solid #eef2f7; border-radius:10px; padding:8px 14px; text-align:center; display:inline-flex; flex-direction:column; min-width:140px; }
.badge-card .num { font-weight:700; color:#1f2937; font-size:18px; }

/* Bảng: không 3 chấm, không xuống hàng */
.table-balanced th, .table-balanced td {
  vertical-align:middle; white-space:nowrap; overflow:visible; text-overflow:clip;
  height:56px; padding-top:12px; padding-bottom:12px;
}
.nowrap { white-space:nowrap; }

.thead-soft th {
  background:#cfe3ff; color:#0b1324; font-weight:600; letter-spacing:.2px;
  border-top:1px solid #9ec5fe; border-bottom:1px solid #9ec5fe;
}
.mono { font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace; }

/* Pager */
.pager-bar { display:flex; justify-content:flex-end; padding:10px 16px; gap:10px; border-top:1px solid #eef2f7; background:#fafbfc; }

/* Modal & Toast */
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.6); z-index:10000; }
.toast-box { position:fixed; bottom:20px; right:20px; background:#111; color:#fff; padding:10px 14px; border-radius:8px; z-index:20000; }

/* Ngăn Google Translate dịch các cụm kỹ thuật */
.notranslate { -webkit-user-select:text; user-select:text; }
</style>
