<template>
  <div class="page">
    <div class="head">
      <h2>Đơn mua: <span class="mono">{{ clip(order?.code, 24) }}</span></h2>
      <div class="actions">
        <RouterLink class="btn" to="/inbound">← Danh sách</RouterLink>
        <span :class="['badge', stClass(order?.status)]">{{ stLabel(order?.status) }}</span>
      </div>
    </div>

    <!-- PO info -->
    <div class="card">
      <div class="info-grid">
        <div>
          <div class="lbl">Mã đơn</div>
          <div class="mono">{{ order?.code }}</div>
        </div>
        <div>
          <div class="lbl">Nhà phân phối</div>
          <div>{{ clip(order?.supplier, 28) }}</div>
        </div>
        <div>
          <div class="lbl">Ngày tạo</div>
          <div class="mono">{{ fmtDate(order?.createdAt) }}</div>
        </div>
        <div>
          <div class="lbl">Trạng thái</div>
          <div><span :class="['badge', stClass(order?.status)]">{{ stLabel(order?.status) }}</span></div>
        </div>
      </div>
    </div>

    <!-- Add items (header -> detail) -->
    <div class="card">
      <div class="section-head">
        <h3>Thêm sản phẩm vào đơn</h3>
        <small class="muted">* Tạo purchase_order_detail sau khi ấn “Gửi dòng”</small>
      </div>

      <div class="grid grid-3">
        <div class="col">
          <label class="lbl">Tìm sản phẩm</label>
          <input v-model.trim="searchProduct" class="ipt" placeholder="Tìm theo tên hoặc SKU…" @input="filterProducts"/>
          <select v-model="selectedProductId" class="ipt mt8" size="6">
            <option v-for="p in filteredProducts" :key="p.id" :value="p.id" :title="p.name">
              {{ clip(p.name, 28) }} — {{ p.sku }}
            </option>
          </select>
        </div>

        <div class="col">
          <label class="lbl">Số lượng</label>
          <div class="row-inline">
            <input v-model.number="qty" type="number" class="ipt" min="1" max="9999" placeholder="1"/>
            <button class="btn" @click="stageLine">+ Thêm dòng</button>
          </div>
          <div v-if="err" class="err mt8">{{ err }}</div>
          <div class="muted mt8">Dòng chờ gửi: {{ staged.length }}</div>
        </div>

        <div class="col">
          <button class="btn primary mt8" :disabled="staged.length===0 || pushing" @click="pushStaged">
            {{ pushing ? 'Đang gửi...' : 'Gửi dòng' }}
          </button>
        </div>
      </div>

      <!-- Staged table -->
      <div v-if="staged.length" class="table-wrap mt12">
        <table class="tbl">
          <thead>
            <tr>
              <th>SKU</th><th>Tên SP</th><th class="right">SL</th><th class="center">Xóa</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(it, i) in staged" :key="it.productId + '-' + i">
              <td class="mono">{{ it.sku }}</td>
              <td :title="it.name">{{ clip(it.name, 32) }}</td>
              <td class="right mono">{{ it.orderQuantity }}</td>
              <td class="center"><button class="btn small" @click="staged.splice(i,1)">Xóa</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Scan area -->
    <div class="card">
      <div class="section-head">
        <h3>Quét SKU (tăng scannedQuantity)</h3>
        <small class="muted">* Đã bỏ “Quét Serial” từng dòng — quét SKU ở đây</small>
      </div>
      <div class="scan-row">
        <input v-model.trim="scanSku" class="ipt mono" placeholder="Nhập/scan SKU rồi Enter…" @keyup.enter="onScan"/>
        <button class="btn" @click="onScan">Xác nhận</button>
      </div>
    </div>

    <!-- Items -->
    <div class="card">
      <div class="section-head">
        <h3>Hàng hóa</h3>
        <div class="muted">Tổng dòng: {{ items.length }}</div>
      </div>

      <div class="table-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th @click="toggleSort('sku')" class="th-sort">
                SKU <SortIcon :dir="sortKey==='sku'?sortDir:null"/>
              </th>
              <th @click="toggleSort('name')" class="th-sort">
                Tên hàng hóa <SortIcon :dir="sortKey==='name'?sortDir:null"/>
              </th>
              <th @click="toggleSort('categoryName')" class="th-sort">
                Loại <SortIcon :dir="sortKey==='categoryName'?sortDir:null"/>
              </th>
              <th @click="toggleSort('brandName')" class="th-sort">
                Hãng <SortIcon :dir="sortKey==='brandName'?sortDir:null"/>
              </th>
              <th @click="toggleSort('color')" class="th-sort">
                Màu <SortIcon :dir="sortKey==='color'?sortDir:null"/>
              </th>
              <th class="right" @click="toggleSort('orderQuantity')">
                orderQuantity <SortIcon :dir="sortKey==='orderQuantity'?sortDir:null"/>
              </th>
              <th class="right" @click="toggleSort('scannedQuantity')">
                scannedQuantity <SortIcon :dir="sortKey==='scannedQuantity'?sortDir:null"/>
              </th>
              <th>Tiến độ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="it in sortedItems" :key="it.id || it.productId">
              <td class="mono">{{ it.sku }}</td>
              <td :title="it.name">{{ clip(it.name, 24) }}</td>
              <td>{{ clip(it.categoryName, 18) }}</td>
              <td>{{ clip(it.brandName, 18) }}</td>
              <td>{{ clip(it.color, 16) }}</td>
              <td class="right mono">{{ it.orderQuantity }}</td>
              <td class="right mono">{{ it.scannedQuantity }}</td>
              <td style="min-width:160px">
                <div class="progress"><div class="bar" :style="{ width: pct(it)+'%' }"></div></div>
                <div class="mono small">{{ it.scannedQuantity }} / {{ it.orderQuantity }}</div>
              </td>
            </tr>
            <tr v-if="sortedItems.length===0">
              <td colspan="8" class="muted center">Không có dữ liệu</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="bar mt12">
        <button class="btn primary" :disabled="!allDone || completing" @click="completeOrder">
          {{ completing ? 'Đang hoàn tất...' : 'Hoàn tất nhập hàng' }}
        </button>
      </div>
      <div class="muted sm mt8">* Hoàn tất khi mọi dòng có scannedQuantity = orderQuantity.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { purchaseOrderService } from "@/services/purchaseOrderService";

/** Sort icon nhỏ */
const SortIcon = {
  name: "SortIcon",
  props: { dir: { type: String, default: null } },
  template: `<span class="sort-ico" :class="cls" aria-hidden="true">▲</span>`,
  computed: {
    cls(){ return { asc: this.dir === "asc", desc: this.dir === "desc", off: !this.dir } }
  }
};

const route = useRoute();
const router = useRouter();
const id = route.params.id;

const order = ref(null);
const items = ref([]);
const loading = ref(false);

const scanSku = ref("");
const completing = ref(false);

// --- thêm sản phẩm
const products = ref([]);
const searchProduct = ref("");
const filteredProducts = ref([]);
const selectedProductId = ref(null);
const qty = ref(1);
const staged = ref([]);  // dòng chờ gửi
const pushing = ref(false);
const err = ref("");

function clip(s,n=20){ return s ? (s.length>n ? s.slice(0,n)+"..." : s) : ""; }
function fmtDate(d){
  try{
    if(!d) return "-";
    if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    const t = new Date(d); return isNaN(+t) ? d : t.toISOString().slice(0,10)
  }catch{ return d }
}
function stLabel(s){
  const k = String(s||"").toUpperCase();
  if (k==="PENDING") return "Chờ xử lý";
  if (k==="IN_PROGRESS") return "Đang nhập";
  if (k==="COMPLETED" || k==="DONE") return "Hoàn tất";
  return s||"-";
}
function stClass(s){
  const k = String(s||"").toUpperCase();
  return k==="PENDING" ? "badge-warn" : k==="IN_PROGRESS" ? "badge-info" : (k==="COMPLETED"||k==="DONE") ? "badge-ok" : "badge-mono";
}

// normalize BE -> FE
function mapItems(po){
  const arr = Array.isArray(po?.items) ? po.items : [];
  return arr.map(it => {
    const p = it.product || it;
    return {
      id: it.id || null,
      productId: p.id || it.productId,
      sku: p.sku || "",
      name: p.name || "",
      categoryName: p.categoryName || "",
      brandName: p.brandName || "",
      color: p.color || "",
      orderQuantity: it.orderQuantity != null ? it.orderQuantity : (it.qty ?? 0),
      scannedQuantity: it.scannedQuantity != null ? it.scannedQuantity : 0,
    }
  });
}

const allDone = computed(() =>
  items.value.length>0 && items.value.every(x => Number(x.scannedQuantity)>=Number(x.orderQuantity))
);

// sort
const sortKey = ref("name");
const sortDir = ref("asc");
function toggleSort(key){
  if (sortKey.value===key) sortDir.value = sortDir.value==="asc" ? "desc" : "asc";
  else { sortKey.value = key; sortDir.value = "asc"; }
}
const sortedItems = computed(() => {
  const key = sortKey.value, dir = sortDir.value;
  return items.value.slice().sort((a,b) => {
    const va = a?.[key] ?? ""; const vb = b?.[key] ?? "";
    if (typeof va === "number" && typeof vb === "number") return dir==="asc" ? (va-vb) : (vb-va);
    const sa = String(va).toLowerCase(), sb = String(vb).toLowerCase();
    if (sa<sb) return dir==="asc" ? -1 : 1;
    if (sa>sb) return dir==="asc" ? 1 : -1;
    return 0;
  });
});

function pct(it){
  const o = Number(it.orderQuantity||0); const s = Math.min(Number(it.scannedQuantity||0), o);
  return o>0 ? Math.round(s*100/o) : 0;
}

async function load(){
  loading.value = true;
  try{
    const po = await purchaseOrderService.getById(id, { includeItems: true });
    order.value = po;
    items.value = mapItems(po);

    // load dropdown products
    products.value = await purchaseOrderService.listProducts();
    filteredProducts.value = products.value.slice(0, 100);
  }catch(e){
    console.error(e);
    order.value = null; items.value = [];
  }finally{
    loading.value = false;
  }
}

function onScan(){
  const sku = String(scanSku.value||"").trim();
  if(!sku) return;
  const target = items.value.find(x => String(x.sku||"").toLowerCase()===sku.toLowerCase());
  if(!target){ alert(`Không tìm thấy SKU ${sku} trong đơn.`); scanSku.value=""; return; }
  const max = Number(target.orderQuantity||0), cur = Number(target.scannedQuantity||0);
  if(cur>=max){ alert("Dòng này đã đủ số lượng."); scanSku.value=""; return; }
  target.scannedQuantity = cur+1;
  if (String(order.value?.status||"").toUpperCase()==="PENDING") order.value.status="IN_PROGRESS";
  scanSku.value="";
}

async function completeOrder(){
  if(!allDone.value) return;
  completing.value = true;
  try{
    await purchaseOrderService.complete(id, {});
    order.value.status = "COMPLETED";
    alert("Hoàn tất nhập hàng!");
    router.push("/inbound");
  }catch(e){
    console.error(e);
    alert("Hoàn tất thất bại.");
  }finally{
    completing.value = false;
  }
}

// ---- add items (staged -> addItem) ----
function filterProducts(){
  const kw = (searchProduct.value||"").toLowerCase();
  filteredProducts.value = products.value.filter(p => `${p.name||""} ${p.sku||""}`.toLowerCase().includes(kw));
}
function stageLine(){
  err.value = "";
  if(!selectedProductId.value){ err.value = "Chưa chọn sản phẩm."; return; }
  if(!qty.value || qty.value<1 || qty.value>9999){ err.value="Số lượng 1–9999"; return; }
  const p = products.value.find(x => x.id===selectedProductId.value);
  if(!p){ err.value="Không tìm thấy sản phẩm"; return; }

  // gộp theo productId
  const ex = staged.value.find(x => x.productId===p.id);
  if (ex) ex.orderQuantity = Math.min(9999, ex.orderQuantity + Number(qty.value||0));
  else staged.value.push({
    productId: p.id, orderQuantity: Number(qty.value||0),
    sku: p.sku, name: p.name
  });
  qty.value = 1;
}
async function pushStaged(){
  if(!staged.value.length) return;
  pushing.value = true;
  try{
    for(const it of staged.value){
      await purchaseOrderService.addItem(id, { productId: it.productId, orderQuantity: it.orderQuantity });
    }
    staged.value = [];
    await load(); // reload lại items từ BE
    alert("Đã thêm dòng vào đơn.");
  }catch(e){
    console.error(e);
    alert("Gửi dòng thất bại.");
  }finally{
    pushing.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.page { padding:16px; }
.head { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
.actions{ display:flex; gap:8px; align-items:center; }

.card{ background:#fff; border-radius:12px; padding:12px; box-shadow:0 2px 10px rgba(0,0,0,.05); margin-bottom:12px; }
.info-grid{ display:grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap:10px; }
.lbl{ font-weight:700; color:#334155; margin-bottom:4px; }
.mono{ font-variant-numeric: tabular-nums; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono","Courier New", monospace; }

.section-head{ display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
.scan-row{ display:flex; gap:8px; }
.ipt{ padding:10px 12px; border:1px solid #e5e7eb; border-radius:10px; min-width:260px; }

.grid{ display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:12px; }
.grid-3{ grid-template-columns: repeat(3, minmax(0,1fr)); }
.col{ display:flex; flex-direction:column; }
.row-inline{ display:flex; gap:8px; align-items:center; }

.tbl{ width:100%; border-collapse:collapse; }
.tbl th, .tbl td{ padding:10px 12px; border-bottom:1px solid #edf1f5; }
.tbl thead th{ background:#f7f9fc; text-align:left; font-weight:700; color:#333; user-select:none; }
.th-sort{ cursor:pointer; }
.sort-ico{ display:inline-block; margin-left:6px; transition: transform .18s ease; opacity:.6; font-size:10px; }
.sort-ico.off{ opacity:.25; transform: rotate(0deg); }
.sort-ico.asc{ transform: rotate(0deg); }
.sort-ico.desc{ transform: rotate(180deg); }

.progress{ width:100%; height:8px; background:#eef2ff; border-radius:999px; overflow:hidden; }
.progress .bar{ height:100%; background:#4c7dff; }

.bar{ display:flex; gap:8px; justify-content:flex-end; }
.btn{ background:#eef2ff; border:1px solid #d9e0ff; padding:10px 12px; border-radius:10px; cursor:pointer; font-weight:600; }
.btn.primary{ background:#4c7dff; color:#fff; border-color:#4c7dff; }
.btn.small{ padding:6px 10px; font-size:12px; }
.btn:hover{ filter:brightness(.97); }

.badge{ padding:4px 8px; border-radius:999px; font-size:12px; font-weight:700; }
.badge-info{ background:#eaf5ff; color:#1365d3; }
.badge-ok{ background:#e6fbef; color:#097a47; }
.badge-warn{ background:#fff4e5; color:#995f00; }
.badge-mono{ background:#f1f5f9; color:#475569; }

.muted{ color:#64748b; }
.small{ font-size:12px; }
.sm{ font-size:12px; }
.center{ text-align:center; }
.mt8{ margin-top:8px; }
.mt12{ margin-top:12px; }

@media (max-width: 1000px){
  .info-grid{ grid-template-columns: repeat(2, minmax(0,1fr)); }
}
@media (max-width: 560px){
  .scan-row{ flex-direction:column; }
  .grid-3{ grid-template-columns: 1fr; }
}
</style>
