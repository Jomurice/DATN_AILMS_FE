<template>
  <div class="page">
    <div class="head">
      <h2>Tạo đơn mua</h2>
      <div class="actions">
        <RouterLink class="btn" to="/inbound">← Quay lại danh sách</RouterLink>
      </div>
    </div>

    <!-- Thông tin đơn -->
    <div class="card">
      <div class="grid">
        <div class="col">
          <label class="lbl">Mã đơn</label>
          <input v-model.trim="form.code" class="ipt" placeholder="${}" />
          <small class="muted"
            >Gợi ý: <span class="mono">{{ suggestCode }}</span></small
          >
        </div>
        <div class="col">
          <label class="lbl">Nhà phân phối</label>
          <input
            v-model.trim="form.supplier"
            class="ipt"
            placeholder="Tên nhà phân phối"
          />
        </div>
        <div class="col">
          <label class="lbl">Ngày tạo</label>
          <input v-model="form.createdAt" type="date" class="ipt" />
        </div>
        <div class="col">
          <label class="lbl">Người tạo</label>
          <div class="mono">{{ creatorName || "—" }}</div>
          <small class="muted"
            >userId: <span class="mono">{{ creatorName || "—" }}</span></small
          >
        </div>

        <div class="col">
       
          <div class="col">
            <label class="lbl">Kho nhập</label>
            <select v-model="form.warehouseId" class="ipt">
              <option disabled value="">-- Chọn kho --</option>
              <option v-for="w in warehouses" :key="w.id" :value="w.id">
                {{ w.name }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Thêm sản phẩm -->
    <div class="card">
      <div class="section-head">
        <h3>Thêm sản phẩm</h3>
        <div>
          <label for="file" class="btn">Excel/CSV</label>
          <input
            id="file"
            type="file"
            accept=".xlsx,.xls,.csv"
            @change="onImport"
            hidden
          />
        </div>
      </div>

      <div class="grid grid-2">
        <div class="col">
          <label class="lbl">Tìm sản phẩm</label>
          <input
            v-model.trim="searchProduct"
            class="ipt"
            placeholder="Tìm theo tên hoặc SKU…"
            @input="filterProducts"
          />
          <select v-model="selectedProductId" class="ipt mt8" size="7">
            <option
              v-for="p in filteredProducts"
              :key="p.id"
              :value="p.id"
              :title="p.name"
            >
              {{ clip(p.name, 28) }} — {{ p.sku }}
            </option>
          </select>
        </div>

        <div class="col">
          <label class="lbl">Số lượng</label>
          <div class="row-inline">
            <input
              v-model.number="qty"
              type="number"
              class="ipt"
              min="1"
              max="9999"
              placeholder="1"
            />
            <button class="btn primary" @click="addLine">+ Thêm</button>
          </div>
          <div v-if="err" class="err mt8">{{ err }}</div>

          <div class="stat mt12">
            <div>
              <span class="muted">Sản phẩm hiển thị:</span>
              {{ filteredProducts.length }}
            </div>
            <div>
              <span class="muted">Dòng đã chọn:</span> {{ form.items.length }}
            </div>
          </div>
        </div>
      </div>

      <div class="table-wrap mt12">
        <table class="tbl">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Tên sản phẩm</th>
              <th>Loại</th>
              <th>Hãng</th>
              <th>Màu</th>
              <th class="right">Số lượng</th>
              <th class="center" style="width: 1%">Xóa</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(it, idx) in form.items" :key="it.productId + '-' + idx">
              <td class="mono">{{ it.sku }}</td>
              <td :title="it.name">{{ clip(it.name, 32) }}</td>
              <td>{{ clip(it.categoryName, 20) }}</td>
              <td>{{ clip(it.brandName, 18) }}</td>
              <td>{{ clip(it.color, 16) }}</td>
              <td class="right mono">{{ it.orderQuantity }}</td>
              <td class="center">
                <button class="btn small" @click="removeLine(idx)">Xóa</button>
              </td>
            </tr>
            <tr v-if="form.items.length === 0">
              <td colspan="7" class="muted center">Chưa có sản phẩm</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="bar">
      <button class="btn" @click="genCode">Gợi ý mã</button>
      <button
        class="btn primary"
        :disabled="submitting || form.items.length === 0"
        @click="submit"
      >
        {{ submitting ? "Đang lưu..." : "Tạo đơn" }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { purchaseOrderService } from "@/services/purchaseOrderService";
import { tokenService } from "@/services/TokenService"; // đổi tên cho dễ hiểu
import { warehouseService } from "@/services/WarehouseService";
import { productDetailsService } from "../../services/product/productDetailsService";

const router = useRouter();

/* state */
const user = ref(null);
const userId = ref("");
const creatorName = ref("");

const form = ref({
  code: "",
  supplier: "",
  status: "PENDING",
  createdAt: todayStr(),
  warehouseId: "", 
  items: [], 
});

const products = ref([]);
const searchProduct = ref("");
const filteredProducts = ref([]);
const selectedProductId = ref(null);
const qty = ref(1);
const err = ref("");
const submitting = ref(false);
const warehouses = ref([]); 

const auth = tokenService();
// đảm bảo lấy lại token từ localStorage

/* utils */
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function clip(s, n = 20) {
  return s ? (s.length > n ? s.slice(0, n) + "..." : s) : "";
}
const suggestCode = computed(() => {
  const d = new Date();
  return `PO-${d.getFullYear()}${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}${String(d.getDate()).padStart(2, "0")}-${String(d.getHours()).padStart(
    2,
    "0"
  )}${String(d.getMinutes()).padStart(2, "0")}${String(d.getSeconds()).padStart(
    2,
    "0"
  )}`;
});
function genCode() {
  form.value.code = suggestCode.value;
}
function getAuthUser() {
  try {
    return JSON.parse(localStorage.getItem("auth_user") || "null");
  } catch {
    return null;
  }
}

/* add/remove lines */
function validateAdd() {
  err.value = "";
  if (!selectedProductId.value) {
    err.value = "Chưa chọn sản phẩm.";
    return false;
  }
  if (!qty.value || qty.value < 1 || qty.value > 9999) {
    err.value = "Số lượng phải từ 1–9999.";
    return false;
  }
  return true;
}
function addLine() {
  if (!validateAdd()) return;
  const p = products.value.find((x) => x.id === selectedProductId.value);
  if (!p) {
    err.value = "Không tìm thấy sản phẩm đã chọn.";
    return;
  }
  const ex = form.value.items.find((x) => x.productId === p.id);
  if (ex)
    ex.orderQuantity = Math.min(
      9999,
      Math.max(1, (ex.orderQuantity || 0) + Number(qty.value))
    );
  else
    form.value.items.push({
      productId: p.id,
      orderQuantity: Number(qty.value),
      sku: p.sku,
      name: p.name,
      categoryName: p.categoryName,
      brandName: p.brandName,
      color: p.color,
    });
  qty.value = 1;
}
function removeLine(idx) {
  form.value.items.splice(idx, 1);
}
function filterProducts() {
  const kw = (searchProduct.value || "").toLowerCase();
  filteredProducts.value = products.value.filter((p) =>
    `${p.name || ""} ${p.sku || ""}`.toLowerCase().includes(kw)
  );
}

/* import excel/csv */
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
      } catch {}
      if (XLSX) {
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf);
        const ws = wb.Sheets[wb.SheetNames[0]];
        rows = XLSX.utils.sheet_to_json(ws); // [{SKU:'abc', QTY:10}, ...]
      } else {
        rows = csvToJson(await file.text());
      }
    } else {
      rows = csvToJson(await file.text());
    }
    let added = 0;
    rows.forEach((r) => {
      const sku = String(r.SKU ?? r.sku ?? "").trim();
      const q = Number(r.QTY ?? r.qty ?? r.quantity ?? 0);
      if (!sku || !q || q < 1) return;
      const p = products.value.find(
        (x) => String(x.sku || "").toLowerCase() === sku.toLowerCase()
      );
      if (!p) return;
      const ex = form.value.items.find((x) => x.productId === p.id);
      if (ex) ex.orderQuantity = Math.min(9999, (ex.orderQuantity || 0) + q);
      else
        form.value.items.push({
          productId: p.id,
          orderQuantity: Math.min(9999, q),
          sku: p.sku,
          name: p.name,
          categoryName: p.categoryName,
          brandName: p.brandName,
          color: p.color,
        });
      added++;
    });
    alert(`Đã nhập ${added} dòng từ file.`);
  } catch (e) {
    console.error(e);
    alert("Không đọc được file. Kiểm tra cột SKU và QTY.");
  } finally {
    ev.target.value = "";
  }
}
function csvToJson(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = splitCSVLine(lines[0]);
  const out = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = splitCSVLine(lines[i]);
    const obj = {};
    headers.forEach((h, idx) => (obj[h] = parts[idx]));
    out.push(obj);
  }
  return out;
}
function splitCSVLine(line) {
  return line.split(",").map((x) => x.replace(/^"|"$/g, "").trim());
}

/* submit */
async function submit() {
  if (!form.value.code?.trim()) return alert("Chưa nhập mã đơn.");
  if (!form.value.supplier?.trim()) return alert("Chưa nhập nhà phân phối.");
  if (form.value.items.length === 0) return alert("Chưa có sản phẩm.");
  if (!userId.value)
    return alert("Không tìm thấy userId. Vui lòng đăng nhập lại.");

  const payload = {
    code: form.value.code.trim(),
    supplier: form.value.supplier.trim(),
    status: "PENDING",
    createdAt: form.value.createdAt,
    createdBy: userId.value,
    warehouseId: form.value.warehouseId, // ✅ gửi lên BE
    items: form.value.items.map((x) => ({
      productId: x.productId,
      orderQuantity: x.orderQuantity,
    })),
  };

  

  submitting.value = true;
  try {

    const res = await purchaseOrderService.create(payload);
    console.log("Load data",res)
    const poId = res?.id;

    const payloadSerial ={
    purchaseOrderId: poId,
    createdByUserId: userId.value
    }
    const resSerial = await productDetailsService.createSerialForPO(payloadSerial)
    console.log("Serial PO",resSerial)
    alert("Tạo đơn thành công!");
    // if (id) router.push(`/inbound/${encodeURIComponent(id)}`);
    // else 
    router.push("/inbound");
  } catch (e) {
    console.error(e);
    alert("Lỗi khi tạo đơn.");
  } finally {
    submitting.value = false;
  }
}

/* load products + init */
async function loadProducts() {
  try {
    const list = await purchaseOrderService.listProducts();
    products.value = Array.isArray(list) ? list : [];
    filteredProducts.value = products.value.slice(0, 100);
  } catch (e) {
    console.warn("loadProducts failed", e);
    products.value = [];
    filteredProducts.value = [];
  }
}
async function loadWarehouses() {
  try {
    const res = await warehouseService.getAllWarehouses("/api/warehouses");
    warehouses.value = res;
  } catch (e) {
    console.error("loadWarehouses failed", e);
    warehouses.value = [];
  }
}

onMounted(() => {
  auth.loadToken();
  if (!form.value.code) genCode();
  userId.value = auth.userId;
  creatorName.value = auth.userName;
  user.value?.name || user.value?.fullName || user.value?.email || "";
  loadProducts();
  loadWarehouses();
});
</script>

<style scoped>
.page {
  padding: 16px;
}
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.actions {
  display: flex;
  gap: 8px;
}
.card {
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 12px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.grid-2 {
  grid-template-columns: 1.2fr 0.8fr;
}
.col {
  display: flex;
  flex-direction: column;
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
  margin-bottom: 10px;
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
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
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
  background: #eef2ff;
  border: 1px solid #d9e0ff;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
}
.btn.primary {
  background: #4c7dff;
  color: #fff;
  border-color: #4c7dff;
}
.btn.small {
  padding: 6px 10px;
  font-size: 12px;
}
.btn:hover {
  filter: brightness(0.97);
}
@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr 1fr;
  }
  .grid-2 {
    grid-template-columns: 1fr;
  }
}
</style>
