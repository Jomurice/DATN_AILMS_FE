<template>
  <div class="full-width-wrap-modified"> 
    <div class="head">
      <h2>Tạo phiếu kiểm kê</h2>
    </div>

    <div class="card">
      <div class="grid">
        <div class="col">
          <label class="lbl">Mã phiếu</label>
          <input v-model="inventoryForm.code" class="ipt" disabled placeholder="Mã tự động" />
        </div>
        <div class="col">
          <label class="lbl">Người tạo</label>
          <input type="text" v-model="username" class="ipt" disabled />
        </div>
        <div class="col">
          <label class="lbl">Ngày tạo</label>
          <input v-model="inventoryForm.createDate" type="date" class="ipt" disabled />
        </div>
        <div class="col">
          <label class="lbl">Hạn kiểm kê (*)</label>
          <input v-model="inventoryForm.deadline" type="date" class="ipt" required />
        </div>
        <div class="col">
          <label class="lbl">Kho (*)</label>
          <select v-model="inventoryForm.warehouseId" class="ipt" required>
            <option disabled value="">-- Chọn kho kiểm kê --</option>
            <option v-for="w in warehouses" :key="w.id" :value="w.id">{{ w.name }}</option>
          </select>
        </div>
        
        <div class="col-span-2">
          <label class="lbl">Ghi chú</label>
          <textarea v-model.trim="inventoryForm.note" class="ipt" rows="2" placeholder="Ghi chú về lần kiểm kê này"></textarea>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="section-head">
        <h3>Danh sách chi tiết sản phẩm</h3>
        <button v-if="localItems.length > 0" class="btn btn-sm btn-info" disabled>
            Đã tải {{ localItems.length }} sản phẩm
        </button>
      </div>
      
      <div class="table-wrap mt-3">
        <table class="tbl table-bordered">
            <thead>
                <tr>
                    <th class="center">Stt</th>
                    <th style="width: 20%;">Hãng</th>
                    <th style="width: 20%;">Loại</th>
                    <th style="width: 20%;">Tên sản phẩm</th>
                    <th style="width: 20%;">Số serial</th>
                    <th style="width: 10%;">Số lượng hệ thống</th>
                </tr>
            </thead>
            <tbody>
                <tr v-if="localItems.length === 0">
                    <td colspan="6" class="text-center text-muted">
                        {{ inventoryForm.warehouseId ? 'Kho này không có sản phẩm nào cần kiểm kê.' : 'Vui lòng chọn Kho để tải sản phẩm.' }}
                    </td>
                </tr>
                <tr v-for="(item, idx) in localItems" :key="item.productDetailId">
                    <td class="center">{{ idx + 1 }}</td>
                    <td>{{ item.brand || 'N/A' }}</td>
                    <td>{{ item.category || 'N/A' }}</td>
                    <td>{{ item.productName || 'N/A' }}</td>
                    <td>{{ item.serialNumber || 'N/A' }}</td>
                    <td class="text-center fw-bold text-primary">
                        <span>{{ item.systemQuantity || 1 }}</span>
                    </td>
                </tr>
            </tbody>
        </table>
      </div>
    </div>

    <div class="bar mt-4">
      <button type="button" class="btn btn-secondary" @click="handleCancelCheck()">
       Huỷ
      </button>

      <button class="btn btn-primary"
        :disabled="submitting || !isValidForm" 
        @click="handleCreateCheck()">
        {{ submitting ? 'Đang tạo phiếu...' : 'Tạo Phiếu' }}
      </button>
    </div>

    <div v-if="toastMsg" class="toast-box">{{ toastMsg }}</div>

    <div v-if="isCancelModalVisible" class="custom-modal-backdrop">
        <div class="custom-modal-dialog">
            <div class="custom-modal-content">
                <div class="custom-modal-header">
                    <h5 class="custom-modal-title">Xác nhận Hủy bỏ</h5>
                </div>
                <div class="custom-modal-body text-center">
                    <p class="h5">Bạn có chắc chắn muốn huỷ phiếu kiểm kê này không?</p>
                    <small class="text-muted">Tất cả dữ liệu chưa lưu sẽ bị mất.</small>
                </div>
                <div class="custom-modal-footer">
                    <button type="button" class="btn btn-secondary" @click="confirmCancel()">
                        Chắc chắn
                    </button>
                    <button type="button" class="btn btn-primary" @click="isCancelModalVisible = false">
                        Quay lại
                    </button>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { inventoryCheckService } from "../../services/inventory/CreateInventoryService.js"; 
import { tokenService } from "../../services/TokenService.js"; 
import { warehouseService } from "../../services/WarehouseService.js";

// --- KHỞI TẠO & DỮ LIỆU STATE ---
const auth = tokenService();
auth.loadToken();
const username = auth.userName || "—";
const currentUserId = auth.userId || '00000000-0000-0000-0000-000000000000'; 

const warehouses = ref([]); 
const submitting = ref(false); 
const toastMsg = ref("");
let toastTimer = null;
const isCancelModalVisible = ref(false); 

const inventoryForm = ref({
  code: 'PCK-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
  createDate: new Date().toISOString().substring(0, 10),
  createdBy: currentUserId,
  checkedBy: currentUserId,
  deadline: "",
  warehouseId: "",
  note: "",
});

const localItems = ref([]);

// --- WATCHER: Tự động tải sản phẩm khi Kho thay đổi ---
watch(() => inventoryForm.value.warehouseId, async (newWarehouseId) => {
    console.log('=== WATCHER TRIGGERED ===');
    console.log('New warehouseId:', newWarehouseId);
    localItems.value = []; 
    if (newWarehouseId) {
        try {
            console.log('Đang gọi API với warehouseId:', newWarehouseId);
            const products = await inventoryCheckService.getProductsByWarehouse(newWarehouseId);
            console.log('Products từ API:', products); // Raw data từ BE
            
            localItems.value = products.map((p, idx) => {
                console.log(`Mapping item ${idx}:`, p);
                return {
                    productDetailId: p.productDetailId,
                    productName: p.productName || 'N/A',
                    serialNumber: p.serialNumber || p.productSerialNumber || p.serialCode || 'N/A', // Fallback serial
                    brand: p.brand || 'N/A', // Hãng
                    category: p.category || 'N/A', // Loại
                    systemQuantity: p.systemQuantity || 1, // SL hệ thống (1 per serial)
                    countedQuantity: p.systemQuantity || 1, // Ban đầu = system
                    note: p.note || '',
                };
            });
            console.log('LocalItems sau map:', localItems.value);
            showToast(`Đã tải ${localItems.value.length} sản phẩm cần kiểm kê.`);

        } catch (error) {
            console.error("Lỗi tải sản phẩm theo kho:", error);
            console.error('Error response:', error.response?.data || error.message);
            showToast("❌ Lỗi: Không thể tải danh sách sản phẩm tồn kho.");
        }
    } else {
        console.log('No warehouse selected');
    }
    console.log('=== END WATCHER ===');
});

// --- LOGIC VALIDATION & FORM ---
const isValidForm = computed(() => {
    if (!inventoryForm.value.deadline || !inventoryForm.value.warehouseId) return false;
    if (localItems.value.length === 0) return false;
    return true;
});

function resetForm() {
    inventoryForm.value = { 
        code: 'PCK-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
        createDate: new Date().toISOString().substring(0, 10),
        createdBy: currentUserId,
        checkedBy: currentUserId,
        deadline: "",
        warehouseId: "",
        note: "",
    };
    localItems.value = [];
}

function handleCancelCheck() {
    isCancelModalVisible.value = true;
}

function confirmCancel() {
    resetForm();
    isCancelModalVisible.value = false;
    showToast("Phiếu kiểm kê đã được huỷ.");
}

// --- HÀM TẠO PHIẾU - LƯU VÀO DB TỰ ĐỘNG ---
async function handleCreateCheck() {
  if (!isValidForm.value) {
    showToast("Vui lòng nhập đầy đủ thông tin bắt buộc và chọn kho.");
    return;
  }
  
  submitting.value = true;
  
  const headerPayload = {
    warehouseId: inventoryForm.value.warehouseId,
    createdBy: inventoryForm.value.createdBy,
    checkedBy: inventoryForm.value.checkedBy,
    note: inventoryForm.value.note,
    deadline: inventoryForm.value.deadline + "T00:00:00", 
  };

  try {
    console.log('=== TẠO PHIẾU: Bắt đầu ===');
    console.log('Header payload:', headerPayload);
    const newCheckResponse = await inventoryCheckService.createCheck(headerPayload);
    console.log('BE response create header:', newCheckResponse);
    const newCheckId = newCheckResponse.id;
    inventoryForm.value.code = newCheckResponse.code; 

    console.log('=== TẠO ITEMS: Loop ' + localItems.value.length + ' items ===');
    for (const item of localItems.value) {
      const itemPayload = {
        serialNumber: item.serialNumber,
        countedQuantity: item.countedQuantity, 
        note: item.note,
        productDetailId: item.productDetailId, 
      };
      console.log('Item payload:', itemPayload);
      const itemResponse = await inventoryCheckService.addItemManual(newCheckId, itemPayload);
      console.log('BE response add item:', itemResponse);
    }
    
    console.log('=== TẠO PHIẾU: Thành công - Lưu vào DB ===');
    showToast(`✅ Tạo phiếu kiểm kê ${inventoryForm.value.code} thành công!`);
    resetForm(); 

  } catch (error) {
    console.error("Lỗi tạo phiếu:", error);
    console.error('Full error:', error.response || error);
    const errorMessage = error.response?.data?.message || error.message || 'Lỗi không xác định.';
    showToast(`❌ Lỗi tạo phiếu: ${errorMessage}`);
  } finally {
    submitting.value = false;
  }
}

function showToast(msg = '') { 
  toastMsg.value = msg; 
  clearTimeout(toastTimer); 
  toastTimer = setTimeout(() => toastMsg.value = '', 3000); 
}

async function loadInitialData() {
  try {
    warehouses.value = await warehouseService.getAllWarehouses();
    console.log('Warehouses loaded:', warehouses.value);
  } catch (e) {
    console.error("Không thể load danh sách kho:", e);
  }
}

onMounted(() => {
  loadInitialData();
});
</script>

<style scoped>
/* Toàn màn hình */
.full-width-wrap-modified {
    padding: 20px; 
    width: 100%; 
    margin: 0 auto;
}

/* CSS CHUNG */
.head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; }
.card { background: #fff; border-radius: 10px; padding: 15px; box-shadow: 0 1px 4px rgba(0, 0, 0, .08); margin-bottom: 20px; }
.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 15px; }
.col { display: flex; flex-direction: column; padding: 0; }
.col-span-2 { grid-column: span 2 / span 2; }
.section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.lbl { font-weight: 600; margin-bottom: 5px; color: #333; }
.ipt, select { padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; transition: border-color 0.2s; }
.ipt:focus, select:focus { border-color: #0d6efd; outline: none; }

.table-wrap { overflow-x: auto; }
.tbl { width: 100%; border-collapse: collapse; }
.tbl th, .tbl td { padding: 8px 12px; border: 1px solid #eee; text-align: left; vertical-align: middle; }
.tbl thead th { background: #f8f9fa; font-weight: 700; color: #333; }

.bar { display: flex; gap: 10px; justify-content: flex-end; }
.btn { padding: 8px 15px; border-radius: 8px; cursor: pointer; font-weight: 500; border: none; transition: background-color 0.2s; }

.btn-secondary { background: #6c757d; color: #fff; } 
.btn-primary { background: #0d6efd; color: #fff; } 

.toast-box {
  position: fixed; bottom: 20px; right: 20px; background: #333;
  color: #fff; padding: 10px 15px; border-radius: 8px; z-index: 20000;
}

/* --- CSS cho Custom Modal --- */
.custom-modal-backdrop {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background-color: rgba(0, 0, 0, 0.5); 
    display: flex; justify-content: center; align-items: center;
    z-index: 1050;
}

.custom-modal-dialog {
    background: white; border-radius: 10px; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    width: 90%; max-width: 450px; 
}

.custom-modal-content { display: flex; flex-direction: column; }
.custom-modal-header { padding: 15px; border-bottom: 1px solid #eee; }
.custom-modal-title { margin: 0; font-size: 1.25rem; color: #333; }
.custom-modal-body { padding: 20px; }
.custom-modal-footer {
    padding: 15px; border-top: 1px solid #eee;
    display: flex; justify-content: flex-end; 
    gap: 10px;
}
.custom-modal-footer .btn-secondary { order: -1; } 
</style>