<template>
  <div>
    <div class="head">
      <h2>Tạo đơn mua</h2>
     <div class="d-flex gap-2">
       <div class="actions">
        <button class="btn btn-outline-primary btn-sm border-primary" @click="createOrder(order)">+ Tạo đơn mua</button>
      </div>

      <div class="btn border-primary btn-outline-primary btn-sm">
        <label for="file" class="m-0" ><i class="fas fa-file-import"></i> Excel/CSV</label>
        <input id="file" type="file" accept=".xlsx,.xls,.csv" @change="onImport" hidden />
      </div>
     </div>
    </div>

    <!-- Thông tin đơn -->
    <div class="card">
      <div class="d-flex grid grid-3">
        <div class="col">
          <label class="lbl">Mã đơn</label>
          <input v-model.trim="order.code" class="ipt" placeholder="VD: HD-2025-0001" disabled />
        </div>
        <div class="col">
          <label class="lbl">Nhà phân phối</label>
          <input v-model.trim="order.supplier" class="ipt" placeholder="Tên nhà phân phối" />
        </div>
        <div class="col">
          <label class="lbl">Ngày tạo</label>
          <input v-model="order.createdAt" type="date" class="ipt" disabled />
        </div>
      </div>
    </div>

    <!-- Thêm sản phẩm -->
    <div class="card">
      <div class="section-head">
        <h3>Thêm sản phẩm</h3>
      </div>
      <ul class="nav nav-tabs" role="tablist">
        <li class="nav-item">
          <a class="nav-link active" href="#listProducts" data-bs-toggle="tab">Danh sách hàng hóa</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#order" data-bs-toggle="tab">Đơn hàng</a>
        </li>
      </ul>

      <div class="tab-content">
        <div id="listProducts" class="container col-md-12 m-0 tab-pane active">
          <div class="d-flex grid grid-2">

            <div class="col-md-5">
              <div class="grid">
                <div class="col">
                  <label class="lbl">Tìm sản phẩm</label>
                  <input v-model.trim="searchProduct" class="ipt" placeholder="Tìm theo tên hoặc SKU"
                    @input="filterProducts" />
                </div>

                <div class="col">
                  <label class="lbl">Số lượng</label>
                  <input v-model.number="form.orderQuantity" type="number" class="ipt" min="1" max="999" />
                  <div v-if="err" class="err mt8">{{ err }}</div>
                </div>
              </div>

              <div class="col">
                <label for="" class="lbl">Ghi chú</label>
                <textarea name="" id="" rows="4" class="ipt" placeholder="Thông tin chi tiết của hàng hóa"
                  maxlength="255"></textarea>
              </div>

              <div class="d-flex justify-content-end mt-2">
                <button class="btn btn-success" @click="createOrderItem()">+ Thêm</button>
              </div>
            </div>

            <select v-model="form.productId" class="col-md-7 ipt" size="7">
              <option v-for="p in products" :key="p.id" :value="p.id" :title="p.name">
                {{ clip(p.name, 28) }}
              </option>
            </select>
          </div>
        </div>

        <div id="order" class="tab-pane container col-md-12 p-0 m-0">
          <div class="table-wrap">
            <table class="tbl">
              <thead>
                <tr>
                  <th class="center">#</th>
                  <th>TÊN HÀNG</th>
                  <th>LOẠI</th>
                  <th>HÃNG</th>
                  <th>SỐ LƯỢNG</th>
                  <th>THÔNG SỐ</th>
                  <th class="text-center">XÓA</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="orderItems.length === 0">
                  <td colspan="8" class="text-center">Chưa có sản phẩm nào trong đơn.</td>
                </tr>
                <tr v-for="(line, idx) in orderItems" :key="line.productId">
                  <td class="center">{{ idx + 1 }}</td>
                  <td>
                    <div><strong>{{ line.product?.name }}</strong></div>
                    <div class="muted">{{ line.product?.sku }}</div>
                  </td>
                  <td>{{ line.product?.brandName }}</td>
                  <td>{{ line.product?.categoryName }}</td>
                  <td class=" mono">{{ line.orderQuantity }}</td>
                  <td>{{ line.product?.specifications }}</td>
                  <td class="center">
                    <button class="btn small btn-danger" @click="removeItem(line.id)"><i
                        class="fa fa-trash"></i></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div class="bar">
      <button class="btn" :class="orderItems === 0 ? 'btn-secondary' : 'btn-primary'"
        :disabled="submitting || orderService.length === 0" @click="submit">
        {{ submitting ? 'Đang đặt hàng...' : 'Đặt hàng' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { orderService } from "../../services/order/Orders";
import { orderDetailService } from "../../services/order/OrderDetail";
import { productService } from "../../services/product/productService";
import { tokenService } from "../../services/TokenService";
import { storeToRefs } from "pinia";

const router = useRouter();
const auth = tokenService();
auth.loadToken();
storeToRefs(auth);

const order = ref({
  code: "",
  supplier: "",
  createdBy: auth.user.id || null
});

const products = ref([]);
const orderItems = ref([]);
const form = ref({ productId: "", orderQuantity: 1 });
const searchProduct = ref("");
const filteredProducts = ref([]);
const selectedProductId = ref(null);
const qty = ref(1);
const err = ref("");
const submitting = ref(false);

/* -------- utils -------- */
function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}
function clip(s, n = 20) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n) + "..." : s;
}


function getOrderId() {
  return localStorage.getItem("order");
}

/* add/remove lines */
function validateAdd(){
  err.value = "";
  if (!form.value.productId) {
    err.value = "Chưa chọn sản phẩm.";
    return false;
  }
  if (!form.value.orderQuantity || form.value.orderQuantity < 1 || form.value.orderQuantity > 9999) {
    err.value = "Số lượng phải từ 1–999.";
    return false;
  }
  return true;
}

function validateQuantity() {
  if (!validateAdd()) return;
  const p = products.value.find(x => x.id === form.value.productId);
  if (!p) { err.value = "Không tìm thấy sản phẩm đã chọn."; return false; }

  const ex = orderItems.value.find(x => x.productId === p.id);
  if (ex) {
    const sum = (ex.orderQuantity || 0) + Number(form.value.orderQuantity);
    ex.orderQuantity = Math.max(1, Math.min(999, sum));
    return false;
  }
  // form.value.orderQuantity = 1;
  return true;
}



/* -------- import excel/csv -------- */
async function onImport(ev) {
  const file = ev.target.files?.[0];
  if (!file) return;
  try {
    let rows = [];
    const ext = file.name.split(".").pop()?.toLowerCase();

    if (ext === "xlsx" || ext === "xls") {
      let XLSX = null;
      try {
        XLSX = (await import(/* @vite-ignore */ "xlsx")).default;
      } catch {
        // nếu chưa cài xlsx → fallback CSV
      }
      if (XLSX) {
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf);
        const ws = wb.Sheets[wb.SheetNames[0]];
        rows = XLSX.utils.sheet_to_json(ws); // [{SKU:'abc', QTY:10}, ...]
      }else{
        rows = csvToJson(await file.text());
      }
    }else{
      rows = csvToJson(await file.text());
    }
    let added=0;
    rows.forEach(r=>{
      const sku=String(r.SKU??r.sku??"").trim();
      const q=Number(r.QTY??r.qty??r.quantity??0);
      if(!sku || !q || q<1) return;
      const p = products.value.find(x => String(x.sku||"").toLowerCase()===sku.toLowerCase());
      if(!p) return;
      const ex = form.value.items.find(x => x.productId===p.id);
      if(ex) ex.orderQuantity = Math.min(9999, (ex.orderQuantity||0)+q);
      else form.value.items.push({
        productId: p.id, orderQuantity: Math.min(9999,q),
        sku:p.sku, name:p.name, categoryName:p.categoryName, brandName:p.brandName, color:p.color,
      });
      added++;
    });
    alert(`Đã nhập ${added} dòng từ file.`);
  }catch(e){ console.error(e); alert("Không đọc được file. Kiểm tra cột SKU và QTY."); }
  finally{ ev.target.value=""; }
}

function csvToJson(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if(lines.length<2) return [];
  const headers = splitCSVLine(lines[0]); const out=[];
  for(let i=1;i<lines.length;i++){
    const parts = splitCSVLine(lines[i]); const obj={};
    headers.forEach((h,idx)=> (obj[h]=parts[idx]));
    out.push(obj);
  }
  return out;
}
function splitCSVLine(line){ return line.split(",").map(x=>x.replace(/^"|"$/g,"").trim()); }

/* -------- submit -------- */
async function submit() {
  if (!form.value.code?.trim()) return alert("Chưa nhập mã đơn.");

  if (form.value.items.length === 0) return alert("Chưa có sản phẩm.");
  if (!userId.value) return alert("Không tìm thấy userId. Vui lòng đăng nhập lại.");

  const payload = {
    code: form.value.code.trim(),
    supplier: form.value.supplier.trim(),
    status: "PENDING",
    createdAt: form.value.createdAt,
    userId: userId.value,
    createdBy: creatorName.value,
    items: form.value.items.map(x => ({ productId: x.productId, orderQuantity: x.orderQuantity })),
  };

  submitting.value = true;
  try{
    const res = await purchaseOrderService.create(payload);
    const id = res?.id;
    alert("Tạo đơn thành công!");
    if(id) router.push(`/inbound/${encodeURIComponent(id)}`); else router.push("/inbound");
  }catch(e){ console.error(e); alert("Lỗi khi tạo đơn."); }
  finally{ submitting.value=false; }
}

async function createOrder() {
  const suggestCode = computed(() => {
    const d = new Date();
    return `HD-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}${String(d.getSeconds()).padStart(2, "0")}`;
  });
  order.value.code = suggestCode.value;
  if (!order.value.supplier?.trim()) return alert("Chưa nhập nhà phân phối.");

  try {
    console.log("Order created:", order.value);
    localStorage.setItem("order", await orderService.create(order.value))
    load();
  } catch (error) {
    console.error("Error creating order:", error);
  }
  alert("Tạo đơn thành công!");
}

async function createOrderItem() {

  if (!validateQuantity()) return;

  try {
    const newItem = await orderDetailService.create(form.value, getOrderId());
    orderItems.value.push(newItem);
    load();
    alert("Thêm sản phẩm thành công!");
  } catch (error) {
    console.error("Error creating order item:", error);
  }
}

async function removeItem(id) {

  try {
    await orderDetailService.remove(id);
    alert("Xóa sản phẩm thành công!");
    load();
  } catch (error) {
    console.error("Error removing order item:", error);
  }
}

async function load() {
  try {
    products.value = await productService.getAll();
    // const list = Array.isArray(products.value) ? data.result : data;
    order.value = await orderService.getById(getOrderId());
    console.log("Loaded order:", order.value);
    orderItems.value = order.value?.items || [];
  } catch (e) {
    console.warn("loadProduct failed", e);
    products.value = [];
    filteredProducts.value = [];
  }
}

onMounted(() => {
  load();
});
</script>

<style scoped>
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 3px;
}

.actions {
  display: flex;
  gap: 8px;
}

.card {
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, .05);
  margin-bottom: 12px;
}

.product {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 160px;
  height: 55px;
  white-space: normal;
  border: 1px solid rgb(199, 199, 199);
  cursor: pointer;
  padding: 4px;
}


.product:hover {
  border: 1px solid blue;

}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.grid-2 {
  grid-template-columns: 1.2fr .8fr;
}

.col {
  display: flex;
  flex-direction: column;
  padding: 0;
}

.lbl {
  font-weight: 700;
  margin-bottom: 6px;
  color: #0b1324;
}

.ipt {
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
}

.row-inline {
  display: flex;
  gap: 8px;
  align-items: center;
}

.stat {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.mt8 {
  margin-top: 8px;
}

.mt12 {
  margin-top: 12px;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.table-wrap {
  overflow: auto;
}

.tbl {
  width: 100%;
  border-collapse: collapse;
}

.tbl th,
.tbl td {
  padding: 10px 12px;
  border-bottom: 1px solid #edf1f5;
}

.tbl thead th {
  background: #f7f9fc;
  text-align: left;
  font-weight: 700;
  color: #333;
}

.right {
  text-align: right;
}

.center {
  text-align: center;
}

.mono {
  font-variant-numeric: tabular-nums;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.err {
  color: #b91c1c;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 6px 8px;
}

.muted {
  color: #7a8594;
}

.bar {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.btn {
  max-width: 130px;
  max-height: 40px;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 15px;
}



.btn.small {
  padding: 6px 10px;
  font-size: 12px;
}

.btn:hover {
  filter: brightness(0.97);
}

@media (max-width: 900px) {

  .grid,
  .grid-2 {
    grid-template-columns: 1fr;
  }
}
</style>
