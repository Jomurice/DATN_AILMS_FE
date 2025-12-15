<template>
  <div>
    <div class="head">
      <h2>Tạo đơn xuất</h2>
      <div class="d-flex gap-2">

        <div>
          <button class="btn btn-outitem-primary btn-primary" title="Thêm khách hàng mới"
            @click="showCustomerForm = true">+ Thêm mới</button>
        </div>

        <div class="btn border-primary btn-outitem-primary btn-sm">
          <label for="file" class="m-0"><i class="fas fa-file-import"></i> Excel/CSV</label>
          <input id="file" type="file" accept=".xlsx,.xls,.csv" @change="onImport" hidden />
        </div>
      </div>
    </div>


    <div class="mb-3">
      <button class="btn btn-outline-primary d-flex align-items-center gap-2 shadow-sm mb-2"
        @click="showForm = !showForm">
        <i class="fas" :class="showForm ? 'fa-angle-up' : 'fa-plus'"></i>
        {{ showForm ? "Đóng Form" : "Thông tin đơn hàng" }}
      </button>
      <!-- Thông tin đơn -->
      <Transition name="fade">
        <div class="card" v-if="showForm">
          <div class="grid">
            <div class="col ">
              <label class="lbl">Mã phiếu</label>
              <nav class="d-flex gap-2 align-items-center">
                <div class="position-relative" style="width: 670px;">
                  <input ref="codeInput" v-model.trim="code" class="ipt" style="width: 670px;" :disabled="!!responseOrder?.id"
                    placeholder="Nhập mã phiếu muốn tìm" />

                  <button v-if="code || responseOrder?.id" class="btn-clear" @click="clearOrder" type="button">
                    ✕
                  </button>
                </div>

                <button class="btn btn-sm btn-primary" :disabled="!!responseOrder?.id"  @click="searchOrders">
                  <i class="fa-solid fa-magnifying-glass"></i>
                </button>
              </nav>

            </div>

            <div class="col search-customer-wrapper">
              <label class="lbl">Khách hàng</label>

              <input type="text" v-model="searchCustomer" class="ipt"
                placeholder="Nhập tên hoặc số điện thoại khách hàng" @input="searchCustomers" @focus="loadCustomer" />

              <!-- Dropdown list -->
              <div v-if="showDropdown" class="dropdown-list">
                <div v-if="isLoading" class="dropdown-item loading">Đang tìm...</div>

                <div v-else-if="customers.length === 0" class="dropdown-item no-result">
                  Không tìm thấy khách hàng
                </div>

                <div v-else class="dropdown-item" v-for="cust in customers" :key="cust.id"
                  @click="selectCustomer(cust)">
                  <div class="name">{{ cust.lastName }} {{ cust.firstName }}</div>
                </div>
              </div>
            </div>

            <div class="col">
              <label class="lbl">Ngày tạo</label>
              <input v-model="responseOrder.createAt" type="date" class="ipt" disabled />
            </div>

            <div class="col">
              <label class="lbl">Người tạo</label>
              <input type="text" v-model="username" class="ipt" disabled />
            </div>
          </div>
        </div>
      </Transition>
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
          <div>
            <div class="d-flex grid gap-3">
              <div class="col">
                <label class="lbl">Tìm sản phẩm</label>
                <input v-model.trim="searchProduct" class="ipt" placeholder="Tìm theo tên hoặc SKU"
                  @input="filterProducts" />
              </div>

              <div class="col">
                <label class="lbl">Số lượng</label>
                <input v-model.number="form.orderQuantity" type="number" class="ipt" min="1" :max="stock" />
                <span>Còn: {{ stock }} sản phẩm</span>
                <div v-if="err" class="err mt8">{{ err }}</div>
              </div>


              <div class="col">
                <label for="" class="lbl">Ghi chú</label>
                <input type="text" v-model.trim="form.note" class="ipt" placeholder="Thông tin chi tiết của hàng hóa"
                  maxlength="255"></input>
              </div>
            </div>
            <div class="d-flex justify-content-end mt-2">
              <button class="btn btn-success" @click="handleAddItem()">+ Thêm</button>
            </div>


            <table class="table table-hover mt-3">
              <thead class="table-secondary">
                <tr>
                  <th>TÊN</th>
                  <th>HÃNG</th>
                  <th>LOẠI</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="p in products" :key="p.id" @click="selectProduct(p)"
                  :class="form.productId === p.id ? 'table-primary' : ''">
                  <td>{{ p.name }}</td>
                  <td>{{ p.brandName }}</td>
                  <td>{{ p.categoryName }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div id="order" class="tab-pane container col-md-12 p-0 m-0">
          <div class="table-wrap">
            <table class="tbl">
              <thead>
                <tr>
                  <th class="center">#</th>
                  <th>TÊN HÀNG</th>
                  <th>SỐ LƯỢNG</th>
                  <th>THÔNG SỐ</th>
                  <th class="text-center">XÓA</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="responseOrder.length === 0">
                  <td colspan="8" class="text-center">Chưa có sản phẩm nào trong đơn.</td>
                </tr>
                <tr v-for="(item, idx) in responseOrder.items" :key="item.productId">
                  <td class="center">{{ idx + 1 }}</td>
                  <td>{{ item.product?.name }}</td>
                  <td class=" mono">{{ item.orderQuantity }}</td>
                  <td>{{ item.product?.note }}</td>
                  <td class="center">
                    <button class="btn small btn-danger" @click="removeItem(item.product?.id)"><i
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
      <button class="btn" :class="responseOrder === 0 ? 'btn-secondary' : 'btn-primary'"
        :disabled="submitting || responseOrder.length === 0" @click="createOrder()">
        {{ submitting ? 'Đang đặt hàng...' : 'Tạo đơn hàng' }}
      </button>
    </div>
    <div v-if="toastMsg" class="toast-box">{{ toastMsg }}</div>

    <!-- Modal thêm khách hàng -->
    <div v-if="showCustomerForm" class="modal-overlay">
      <CustomerForm @save="handleCustomerSave" @cancel="showCustomerForm = false" />
    </div>
    <div v-if="isLoading" class="modal-overlay-loading text-center py-5">
      <div class="spinner-border text-info" role="status"></div>
      <div class="small mx-2 fs-5 text-info mt-2">Đang tải...</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { productService } from "../../services/product/productService";
import { tokenService } from "../../services/TokenService";
import { outboundOrderService } from "../../services/outbound/outboundOrderService";
import { outboundItemService } from "../../services/outbound/OutboundOrderItemService";
import { stockService } from "../../services/StockService";
import { customerService } from "../../services/outbound/CustomerService";
import CustomerForm from "./CustomerForm.vue";

const auth = tokenService();
auth.loadToken();
const username = auth.userName || "—";

const orders = ref({
  id: "",
  code: "",
  customerId: "",
  createdBy: auth.userId || null,
  createAt: "",
  items: [],
});

const products = ref([]);
const responseOrder = ref([]);
const form = ref({ productId: "", name: "", orderQuantity: 1, note: "" });
const err = ref("");
const submitting = ref(false);
const stock = ref(0);
const searchCustomer = ref("");
const customers = ref([]);
const showDropdown = ref(false);
const showForm = ref(false);
const isLoading = ref(false);
const selectedCustomer = ref(null);
const toastMsg = ref("");
let toastTimer = null;
const showCustomerForm = ref(false);
const code = ref("");
const searchProduct = ref("");
const codeInput = ref(null);


// function clip(s, n = 20) {
//   if (!s) return "";
//   return s.length > n ? s.slice(0, n) + "..." : s;
// }

/* -------- import excel/csv -------- */
// async function onImport(ev) {
//   const file = ev.target.files?.[0];
//   if (!file) return;
//   try {
//     let rows = [];
//     const ext = file.name.split(".").pop()?.toLowerCase();

//     if (ext === "xlsx" || ext === "xls") {
//       let XLSX = null;
//       try {
//         XLSX = (await import(/* @vite-ignore */ "xlsx")).default;
//       } catch {
//         // nếu chưa cài xlsx → fallback CSV
//       }
//       if (XLSX) {
//         const buf = await file.arrayBuffer();
//         const wb = XLSX.read(buf);
//         const ws = wb.Sheets[wb.SheetNames[0]];
//         rows = XLSX.utils.sheet_to_json(ws); // [{SKU:'abc', QTY:10}, ...]
//       } else {
//         rows = csvToJson(await file.text());
//       }
//     } else {
//       rows = csvToJson(await file.text());
//     }
//     let added = 0;
//     rows.forEach(r => {
//       const sku = String(r.SKU ?? r.sku ?? "").trim();
//       const q = Number(r.QTY ?? r.qty ?? r.quantity ?? 0);
//       if (!sku || !q || q < 1) return;
//       const p = products.value.find(x => String(x.sku || "").toLowerCase() === sku.toLowerCase());
//       if (!p) return;
//       const ex = form.value.items.find(x => x.productId === p.id);
//       if (ex) ex.orderQuantity = Math.min(9999, (ex.orderQuantity || 0) + q);
//       else form.value.items.push({
//         productId: p.id, orderQuantity: Math.min(9999, q),
//         sku: p.sku, name: p.name, categoryName: p.categoryName, brandName: p.brandName, color: p.color,
//       });
//       added++;
//     });
//     alert(`Đã nhập ${added} dòng từ file.`);
//   } catch (e) { console.error(e); alert("Không đọc được file. Kiểm tra cột SKU và QTY."); }
//   finally { ev.target.value = ""; }
// }

// function csvToJson(text) {
//   const items = text.split(/\r?\n/).filter(Boolean);
//   if (items.length < 2) return [];
//   const headers = splitCSVitem(items[0]); const out = [];
//   for (let i = 1; i < items.length; i++) {
//     const parts = splitCSVitem(items[i]); const obj = {};
//     headers.forEach((h, idx) => (obj[h] = parts[idx]));
//     out.push(obj);
//   }
//   return out;
// }
// function splitCSVitem(item) { return item.split(",").map(x => x.replace(/^"|"$/g, "").trim()); }


async function createOrder() {

  orders.value = responseOrder.value
  orders.value.customerId = selectedCustomer.value ? selectedCustomer.value.id : null;
  if (!orders.value.customerId?.trim()) return showToast("Chưa nhập thông tin khách hàng.");
  if (responseOrder.value.length === 0) return showToast("Chưa có sản phẩm nào trong đơn.");
  submitting.value = true;

  orders.value.status = "CONFIRMED";

  try {
    await outboundOrderService.updateStatus(responseOrder.value.id, orders.value)
    localStorage.removeItem("currentOrder");
    showToast('Tạo đơn hàng thành công');
    resetForm();
    responseOrder.value = [];
  } catch (error) {
    console.error("Error creating order:", error);
  } finally {
    submitting.value = false;
  }
}

async function selectProduct(product) {
  form.value.productId = product.id;
  form.value.name = product.name;
  stock.value = await stockService.getStocks(product.id);
  console.log("Selected product:", form.value, "Stock:", stock.value, " Product:", product.id);
}

function validateAdd() {
  err.value = "";
  if (!form.value.productId) {
    err.value = "Chưa chọn sản phẩm.";
    return false;
  }
  if (!form.value.orderQuantity || form.value.orderQuantity < 1 || form.value.orderQuantity > 999) {
    err.value = "Số lượng phải từ 1–999.";
    return false;
  }

  if (form.value.orderQuantity > stock.value) {
    showToast(`Số lượng vượt quá tồn kho (${stock.value}).`);
    return false;
  }
  return true;
}


async function handleAddItem() {
  if (!validateAdd()) return;

  isLoading.value = true;

  const newItem = {
    productId: form.value.productId,
    orderQuantity: Number(form.value.orderQuantity),
  };

  try {
    // Chưa có order thì tạo mới
    if (!responseOrder.value.id) {
      // add item vào giỏ tạm
      orders.value.items.push(newItem);

      // tạo order
      responseOrder.value = await outboundOrderService.create(orders.value);
      code.value = responseOrder.value.code;

      // lưu localStorage
      localStorage.setItem(
        "currentOrder",
        JSON.stringify({
          id: responseOrder.value.id,
          code: responseOrder.value.code,
        })
      );

      // add item lên server
      await outboundItemService.addItem(orders.value, responseOrder.value.id);

      showToast("Đã thêm sản phẩm vào đơn");

      load();
      return;
    }

    //Đã có order rồi thì thêm item
    let existingItem = responseOrder.value.items.find(
      (x) => x.product?.id === newItem.productId
    );

    if (existingItem) {
      // tăng số lượng
      existingItem.orderQuantity += newItem.orderQuantity;
    } else {
      // thêm mới vào UI
      responseOrder.value.items.push({
        product: { id: newItem.productId },
        orderQuantity: newItem.orderQuantity,
      });
    }

    // chuẩn hóa format gửi server
    orders.value.items = responseOrder.value.items.map((item) => ({
      productId: item.product.id,
      orderQuantity: item.orderQuantity,
    }));

    await outboundItemService.addItem(orders.value, responseOrder.value.id);

    showToast("Đã thêm sản phẩm vào đơn");
    load();
  } catch (error) {
    console.error("Error:", error);
  } finally {
    isLoading.value = false;
  }
}



async function removeItem(idProduct) {
  if (!confirm("Bạn có chắc muốn xóa sản phẩm khỏi đơn ?")) return;
  await outboundItemService.deleteItem(responseOrder.value.id, idProduct);
  load();
}

function resetForm() {
  form.value = { productId: "", name: "", orderQuantity: 1, note: "" };
  err.value = "";
  stock.value = 0;
  searchCustomer.value = "";
};

function clearOrder() {
  code.value = "";
  responseOrder.value = {};
  localStorage.removeItem("currentOrder");

  nextTick(() => {
    codeInput.value?.focus();
  });
};


let debounceTimeout = null;

async function searchCustomers() {
  clearTimeout(debounceTimeout);
  showDropdown.value = true;

  debounceTimeout = setTimeout(async () => {
    if (!searchCustomer.value.trim()) {
      const res = await customerService.getAll({
        page: 0,
        size: 10,
        search: searchCustomer.value.trim(),
        status: true
      });
      customers.value = res?.content || res || [];
      return;
    }

    isLoading.value = true;
    try {
      console.log("Search:", searchCustomer.value.trim());
      const res = await customerService.getAll({
        page: 0,
        size: 10,
        search: searchCustomer.value.trim(),
        status: true
      });
      customers.value = res?.content || res || [];
    } catch {
      customers.value = [];
    } finally {
      isLoading.value = false;
    }
  }, 350);
}

async function loadCustomer() {
  showDropdown.value = true;
  if (!searchCustomer.value.trim()) {
    try {
      const res = await customerService.getAll({
        page: 0,
        size: 10,
        search: searchCustomer.value.trim(),
        status: true
      });
      customers.value = res?.content || res || [];
      console.log("Loaded customers:", customers.value);
    } catch (error) {
      console.error("Error loading customers:", error);
      customers.value = [];
    }
  }
}


function selectCustomer(customer) {
  selectedCustomer.value = customer;
  searchCustomer.value = `${customer.lastName} ${customer.firstName}`;
  customers.value = [];
  showDropdown.value = false;
}

// document.addEventListener("click", (e) => {
//   const wrapper = document.querySelector('.search-customer-wrapper');
//   if (wrapper && !wrapper.contains(e.target)) {
//     showDropdown.value = false;
//   }
// });

async function searchOrders() {
  if (!code.value.trim()) {
    showToast("Vui lòng nhập mã phiếu để tìm kiếm.");
    return;
  };

  isLoading.value = true;

  try {
    const order = await outboundOrderService.getByCode(code.value.trim());
    if (order) {
      responseOrder.value = order;
      code.value = order.code;
      console.log("Found order:", responseOrder.value);
      localStorage.setItem(
        "currentOrder",
        JSON.stringify({
          id: responseOrder.value.id,
          code: responseOrder.value.code,
        })
      );
      showToast("Đã tải đơn hàng.");
    } else {
      showToast("Không tìm thấy đơn hàng.");
    }
  } catch (error) {
    console.error("Error searching order:", error);
    const msg = error.response?.data?.message;
    if (msg === 'Order already completed') {
      showToast("Đơn hàng đã được tạo !");
    } else
      showToast("Lỗi khi tìm đơn hàng.");
  } finally {
    isLoading.value = false;
  }
};

async function load() {
  isLoading.value = true;

  try {
    products.value = await productService.getAll();

    const savedOrder = localStorage.getItem("currentOrder")
      ? JSON.parse(localStorage.getItem("currentOrder"))
      : null;

    if (savedOrder?.id) {
      const fullOrder = await outboundOrderService.getById(savedOrder.id);
      responseOrder.value = fullOrder || [];
      code.value = fullOrder.code;
    }
  } catch (e) {
    console.error("loadProduct failed", e);
    products.value = [];
  }
  finally {
    isLoading.value = false;
  }
  resetForm();
}

function showToast(msg = '') { toastMsg.value = msg; clearTimeout(toastTimer); toastTimer = setTimeout(() => toastMsg.value = '', 1600); }


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
  -webkit-item-clamp: 2;
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

.btn-clear {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  font-size: 16px;
  color: #888;
  cursor: pointer;
}

.btn-clear:hover {
  color: #dc3545;
}


.table tbody {
  max-height: 300px;
  overflow-y: auto;
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

.row-initem {
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

.search-customer-wrapper {
  position: relative;
}

.dropdown-list {
  position: absolute;
  width: 100%;
  top: 100%;
  left: 0;
  background: #fff;
  border: 1px solid #ddd;
  max-height: 250px;
  overflow-y: auto;
  border-radius: 6px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  z-index: 200;
}

.dropdown-item {
  padding: 8px 12px;
  cursor: pointer;
}

.dropdown-item:hover {
  background: #f4f8ff;
}

.loading {
  color: #888;
}

.no-result {
  color: red;
}

.dropdown-item .phone {
  font-size: 12px;
  color: #666;
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

.modal-overlay-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  background: rgba(0, 0, 0, 0.147);
  align-items: center;
  justify-content: center;
  z-index: 9999;
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
