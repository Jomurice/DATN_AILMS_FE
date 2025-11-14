<template>
  <div class="page">

    <!-- Header -->
    <header class="head">
      <h2>Tạo đơn mua</h2>
      <RouterLink class="btn" to="/inbound">← Quay lại</RouterLink>
    </header>

    <section class="card">
      <div class="grid">
        
        <div class="col">
          <label class="lbl">Mã đơn</label>
          <input v-model.trim="form.code" class="ipt" placeholder="Nhập mã..." />
          <small class="muted">Gợi ý: <span class="mono">{{ suggestCode }}</span></small>
        </div>

        <!-- autocomplete -->
        <div class="col supplier-col">
          <label class="lbl">Nhà phân phối</label>
          <input
            v-model="supplierQuery"
            class="ipt"
            placeholder="Nhập tên nhà phân phối…"
            @input="searchSuppliers"
            @focus="focusSupplierInput"
          />
          <ul v-if="showSupplierList" class="dropdown">
            <li
              v-for="s in suppliers"
              :key="s.id"
              @click="selectSupplier(s)"
            >
              {{ s.companyName }}
            </li>
            <li v-if="suppliers.length === 0" class="muted small p8">
              Không tìm thấy nhà phân phối
            </li>
          </ul>
        </div>

        <div class="col">
          <label class="lbl">Ngày tạo</label>
          <input v-model="form.createdAt" type="date" class="ipt" />
        </div>

        <div class="col">
          <label class="lbl">Người tạo</label>
          <div class="mono">{{ creatorName || "—" }}</div>
        </div>

        <div class="col">
          <label class="lbl">Kho</label>
          <select v-model="form.warehouseId" class="ipt">
            <option disabled value="">-- Chọn kho --</option>
            <option v-for="w in warehouses" :key="w.id" :value="w.id">{{ w.name }}</option>
          </select>
        </div>

      </div>
    </section>

  
    <section class="card">
      <header class="section-head">
        <h3>Thêm sản phẩm</h3>
      </header>

      <div class="grid grid-2">
        <div class="col">
          <label class="lbl">Tìm sản phẩm</label>
          <input
            v-model.trim="searchProduct"
            class="ipt"
            placeholder="Tên hoặc SKU…"
            @input="filterProducts"
          />
          <select v-model="selectedProductId" class="ipt mt8" size="7">
            <option v-for="p in filteredProducts" :key="p.id" :value="p.id">
              {{ clip(p.name, 28) }} — {{ p.sku }}
            </option>
          </select>
        </div>

        <div class="col">
          <label class="lbl">Số lượng</label>
          <div class="row-inline">
            <input v-model.number="qty" type="number" min="1" max="9999" class="ipt" />
            <button class="btn primary" @click="addLine">+ Thêm</button>
          </div>
          <div v-if="err" class="err mt8">{{ err }}</div>
          <div class="stat mt12">
            <div><span class="muted">Sản phẩm:</span> {{ filteredProducts.length }}</div>
            <div><span class="muted">Đã chọn:</span> {{ form.items.length }}</div>
          </div>
        </div>
      </div>

      <div class="table-wrap mt12">
        <table class="tbl">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Tên</th>
              <th>Loại</th>
              <th>Hãng</th>
              <th>Màu</th>
              <th class="right">SL</th>
              <th class="center">Xóa</th>
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

    </section>

    <!-- Bottom bar -->
    <footer class="bar">
      <button class="btn" @click="genCode">Gợi ý mã</button>
      <button class="btn primary" :disabled="submitting || !form.items.length" @click="submit">
        {{ submitting ? "Đang lưu..." : "Tạo đơn" }}
      </button>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { purchaseOrderService } from "@/services/purchaseOrderService";
import { tokenService } from "@/services/TokenService";
import { warehouseService } from "@/services/WarehouseService";
import { productDetailsService } from "@/services/product/productDetailsService";
import { supplierService } from "@/services/purchaseOrder/supplierService.js";

const router = useRouter();


const form = ref({
  code: "",
  supplierId: "",
  status: "PENDING",
  createdAt: todayStr(),
  warehouseId: "",
  items: [],
});

const products = ref([]);
const filteredProducts = ref([]);
const warehouses = ref([]);

const supplierQuery = ref("");
const suppliers = ref([]);
const showSupplierList = ref(false);
let supplierSearchTimeout = null;

const searchProduct = ref("");
const selectedProductId = ref(null);
const qty = ref(1);
const err = ref("");
const submitting = ref(false);

const creatorName = ref("");
const userId = ref("");


function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function clip(s, n = 20) {
  return s && s.length > n ? s.slice(0, n) + "..." : s || "";
}

const suggestCode = computed(() => {
  const d = new Date();
  const pad = (x) => String(x).padStart(2, "0");
  return `PO-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(
    d.getDate()
  )}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
});

function genCode() {
  form.value.code = suggestCode.value;
}


async function focusSupplierInput() {
  showSupplierList.value = true;

  if (!supplierQuery.value.trim()) {
    try {
      const res = await supplierService.getSuppliers({
        page: 0,
        size: 10,
        active: true,
      });
      suppliers.value = res.content || res || [];
    } catch (e) {
      console.error(e);
      suppliers.value = [];
    }
  }
}

function selectSupplier(s) {
  form.value.supplierId = s.id;
  supplierQuery.value = s.companyName;
  showSupplierList.value = false;
}

async function searchSuppliers() {
  showSupplierList.value = true;
  clearTimeout(supplierSearchTimeout);

  supplierSearchTimeout = setTimeout(async () => {
    if (!supplierQuery.value.trim()) {
      suppliers.value = [];
      return;
    }
    try {
      const res = await supplierService.getSuppliers({
        page: 0,
        size: 8,
        companyName: supplierQuery.value,
        active: true,
      });
      suppliers.value = res.content || res || [];
    } catch (e) {
      console.error(e);
      suppliers.value = [];
    }
  }, 300);
}


function validateAdd() {
  err.value = "";
  if (!selectedProductId.value) return (err.value = "Chưa chọn sản phẩm.");
  if (!qty.value || qty.value < 1 || qty.value > 9999)
    return (err.value = "Số lượng không hợp lệ.");
  return true;
}

function addLine() {
  if (!validateAdd()) return;
  const p = products.value.find((x) => x.id === selectedProductId.value);
  if (!p) return (err.value = "Không tìm thấy sản phẩm.");
  const existing = form.value.items.find((x) => x.productId === p.id);
  if (existing) {
    existing.orderQuantity = Math.min(9999, existing.orderQuantity + qty.value);
  } else {
    form.value.items.push({
      productId: p.id,
      orderQuantity: qty.value,
      sku: p.sku,
      name: p.name,
      categoryName: p.categoryName,
      brandName: p.brandName,
      color: p.color,
    });
  }
  qty.value = 1;
}

function removeLine(idx) {
  form.value.items.splice(idx, 1);
}

function filterProducts() {
  const k = searchProduct.value.toLowerCase();
  filteredProducts.value = products.value.filter((p) =>
    (p.name + " " + p.sku).toLowerCase().includes(k)
  );
}


function validateForm() {
  if (!form.value.code.trim()) return "Chưa nhập mã.";
  if (!form.value.supplierId) return "Chưa chọn nhà phân phối.";
  if (!form.value.warehouseId) return "Chưa chọn kho.";
  if (!userId.value) return "Không tìm thấy userId.";
  if (!form.value.items.length) return "Chưa thêm sản phẩm.";
  return null;
}

function buildPayload() {
  return {
    ...form.value,
    createdBy: userId.value,
    items: form.value.items.map((x) => ({
      productId: x.productId,
      orderQuantity: x.orderQuantity,
    })),
  };
}

async function submit() {
  const error = validateForm();
  if (error) return alert(error);

  const payload = buildPayload();
  submitting.value = true;

  try {
    const res = await purchaseOrderService.create(payload);
    await productDetailsService.createSerialForPO({
      purchaseOrderId: res.id,
      createdByUserId: userId.value,
    });
    alert("Tạo đơn thành công!");
    router.push("/inbound");
  } catch (e) {
    console.error(e);
    alert("Lỗi khi tạo đơn.");
  } finally {
    submitting.value = false;
  }
}

/* ---------------- INIT ---------------- */
async function initAuth() {
  const auth = tokenService();
  auth.loadToken();
  userId.value = auth.userId;
  creatorName.value = auth.userName;
}

async function loadProducts() {
  products.value = await purchaseOrderService.listProducts();
  filteredProducts.value = products.value.slice(0, 100);
}

async function loadWarehouses() {
  warehouses.value = await warehouseService.getAllWarehouses("/api/warehouses");
}

async function init() {
  await initAuth();
  if (!form.value.code) genCode();
  await loadProducts();
  await loadWarehouses();
}

onMounted(init);
</script>

<style scoped>
.page { padding: 16px; }
.head { display: flex; justify-content: space-between; margin-bottom: 10px; }
.card { background: #fff; padding: 12px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,.05); margin-bottom: 12px; }
.grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.grid-2 { grid-template-columns: 1.2fr 0.8fr; }
.col { display: flex; flex-direction: column; position: relative; }
.lbl { margin-bottom: 6px; font-weight: 700; }
.ipt { padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 10px; }
.row-inline { display: flex; gap: 8px; align-items: center; }
.tbl { width: 100%; border-collapse: collapse; }
.tbl th, .tbl td { padding: 10px; border-bottom: 1px solid #edf1f5; }
.tbl th { background: #f7f9fc; }
.right { text-align: right; }
.center { text-align: center; }
.err { background: #fee2e2; border: 1px solid #fecaca; padding: 8px; border-radius: 8px; color: #b91c1c; }
.mono { font-family: ui-monospace, monospace; }
.muted { color: #7a8594; }
.bar { display: flex; justify-content: flex-end; gap: 8px; }
.btn { background: #eef2ff; padding: 10px 12px; border-radius: 10px; border: 1px solid #d9e0ff; cursor: pointer; font-weight: 600; }
.btn.primary { background: #4c7dff; color: #fff; border-color: #4c7dff; }
.btn.small { padding: 6px 10px; font-size: 12px; }

/* ---------------- Supplier autocomplete ---------------- */
.supplier-col { position: relative; }
.dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  max-height: 220px;
  overflow-y: auto;
  z-index: 50;
  padding: 4px 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transition: opacity 0.2s ease;
}
.dropdown li { padding: 8px 10px; cursor: pointer; }
.dropdown li:hover { background: #eef2ff; }

.mt8 { margin-top: 8px; }
.mt12 { margin-top: 12px; }
</style>
