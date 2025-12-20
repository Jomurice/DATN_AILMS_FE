<template>
  <div class="container py-4" style="max-width: 1000px;">
    
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4 class="fw-bold mb-0">Tạo phiếu kiểm kê</h4>
      <button class="btn btn-outline-secondary" @click="$router.push('/inventory-check')">
        <i class="fa-solid fa-arrow-left me-1"></i> Quay lại danh sách
      </button>
    </div>

    <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
      <i class="fa-solid fa-triangle-exclamation me-2"></i> {{ error }}
      <button type="button" class="btn-close" @click="error = ''"></button>
    </div>

    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body p-4">
        <form @submit.prevent="submit" class="row g-3">
          
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label fw-bold">Mã phiếu (Tự động)</label>
              <div class="input-group">
                <span class="input-group-text bg-light"><i class="fa-solid fa-barcode"></i></span>
                <input type="text" class="form-control bg-light fw-bold text-primary" 
                      :value="draftCode" disabled />
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold">Kho cần kiểm kê <span class="text-danger">*</span></label>
              <select v-model="form.warehouseId" class="form-select" required @change="onWarehouseChange">
                <option value="" disabled>-- Chọn kho --</option>
                <option v-for="w in warehouses" :key="w.id" :value="w.id">
                  {{ w.name }} {{ w.location ? `- ${w.location}` : '' }}
                </option>
              </select>
              <div class="form-text text-primary" v-if="loadingPreview">
                 <span class="spinner-border spinner-border-sm me-1"></span> Đang tải dữ liệu kho...
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold">Ngày kiểm kê (Hôm nay) <span class="text-danger">*</span></label>
              <div class="input-group">
                 <span class="input-group-text bg-light"><i class="fa-regular fa-calendar-days"></i></span>
                 <input 
                    v-model="form.inventoryDate" 
                    type="date" 
                    class="form-control fw-bold bg-light" 
                    required 
                    disabled 
                 />
              </div>
              
              <div class="alert alert-info border-0 bg-info-subtle text-info-emphasis small mt-2 mb-0 p-2">
                  <i class="fa-solid fa-clock me-1"></i> 
                  <strong>Lưu ý:</strong> Phiếu kiểm kê chỉ có hiệu lực và phải được thực hiện trong <strong>Ngày hôm nay</strong> theo quy định chốt sổ.
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label fw-bold">Người tạo</label>
              <div class="input-group">
                <span class="input-group-text bg-light"><i class="fa-solid fa-user"></i></span>
                <input type="text" class="form-control bg-light fw-bold" 
                       :value="currentUser.name || currentUser.username" disabled />
              </div>
              <div class="form-text text-muted">Phiếu được tạo bởi tài khoản này.</div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold">Mục đích kiểm kê</label>
              <textarea v-model="form.note" class="form-control" rows="5" 
                        placeholder="Ví dụ: Kiểm kê định kỳ cuối tháng, Kiểm kê đột xuất..."></textarea>
            </div>
          </div>

          <div class="col-12 text-end border-top pt-3">
            <button type="button" class="btn btn-light me-2" @click="$router.back()">Hủy bỏ</button>
            <button type="submit" class="btn btn-primary px-4" :disabled="submitting">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
              {{ submitting ? 'Đang xử lý...' : 'Tạo phiếu' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="col-12" v-if="form.warehouseId">
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <div>
            <h5 class="mb-0 fw-bold text-primary">
              <i class="fa-solid fa-boxes-stacked me-2"></i>
              Danh sách tồn kho hiện tại
            </h5>
            <small class="text-muted">Chỉ hiển thị sản phẩm đang có mặt trong kho (IN_WAREHOUSE).</small>
          </div>
          <span class="badge bg-primary rounded-pill fs-6">{{ previewItems.length }} sản phẩm</span>
        </div>
        
        <div v-if="loadingPreview" class="text-center py-5">
          <div class="spinner-border text-primary"></div>
          <div class="mt-2 text-muted">Đang đồng bộ dữ liệu từ hệ thống...</div>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover mb-0 align-middle">
            <thead class="table-light">
              <tr>
                <th style="width: 50px;">#</th>
                <th>SKU</th>
                <th>Tên Sản Phẩm</th>
                <th>Serial Number</th>
                <th class="text-center">Trạng thái</th>
                <th class="text-center">Ngày nhập</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in paginatedPreviewItems" :key="item.id">
                <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
                <td class="fw-bold text-primary">{{ item.productSku || 'N/A' }}</td>
                <td class="small">{{ item.productName || 'Unknown Product' }}</td>
                <td class="font-monospace">{{ item.serialNumber }}</td>
                <td class="text-center">
                    <span class="badge bg-success">{{ item.status }}</span>
                </td>
                <td class="text-center small text-muted">
                    {{ item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '-' }}
                </td>
              </tr>
              
              <tr v-if="!previewItems.length">
                  <td colspan="6" class="text-center py-5 text-muted">
                    <i class="fa-solid fa-box-open fs-2 mb-3 d-block opacity-50"></i>
                    Kho này hiện chưa có sản phẩm nào khả dụng (IN_WAREHOUSE).
                  </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card-footer bg-white d-flex justify-content-between align-items-center py-3" v-if="previewItems.length > pageSize">
            <small class="text-muted">
                Hiển thị {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, previewItems.length) }} 
                trong tổng số {{ previewItems.length }} dòng
            </small>
            
            <nav>
                <ul class="pagination pagination-sm mb-0">
                    <li class="page-item" :class="{disabled: currentPage === 1}">
                        <button class="page-link" @click="currentPage--">Trước</button>
                    </li>
                    <li class="page-item disabled">
                        <span class="page-link text-dark fw-bold">Trang {{ currentPage }} / {{ totalPages }}</span>
                    </li>
                    <li class="page-item" :class="{disabled: currentPage === totalPages}">
                        <button class="page-link" @click="currentPage++">Sau</button>
                    </li>
                </ul>
            </nav>
        </div>
        </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { inventoryCheckService } from "../../services/inventoryCheckService";
import { warehouseService } from "../../services/WarehouseService";
import { tokenService } from "../../services/TokenService";
import { toast } from "vue-sonner";

const router = useRouter();
const auth = tokenService();
auth.loadToken();

// State
const warehouses = ref([]);
const previewItems = ref([]);
const loadingPreview = ref(false);
const submitting = ref(false);
const error = ref("");
const currentCheckCount = ref(0); 
const minDate = ref(""); 

// Phân trang
const currentPage = ref(1);
const pageSize = ref(10); 

// Current User Info
const currentUser = ref({ 
    name: auth.userName || 'Unknown', 
    id: auth.userId, 
    username: auth.userName 
});

// Form Data
const form = ref({
  warehouseId: "",
  createdBy: auth.userId,
  checkedBy: auth.userId,
  inventoryDate: "", 
  note: ""
});

// Computed: Mã nháp
const draftCode = computed(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const nextNum = String(currentCheckCount.value + 1).padStart(4, '0');
    return `INVCHK-${yyyy}${mm}${dd}-${nextNum}`;
});

// Computed: Phân trang Client-side
const totalPages = computed(() => Math.ceil(previewItems.value.length / pageSize.value) || 1);

const paginatedPreviewItems = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return previewItems.value.slice(start, end);
});

// 1. Load Data
async function loadData() {
  try {
    // ✅ AUTO SET NGÀY HÔM NAY (Vì chỉ cho phép tạo phiếu hôm nay)
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    // Gán cứng vào form (UI đã disable không cho sửa)
    form.value.inventoryDate = todayStr;

    warehouses.value = await warehouseService.getAllWarehouses() || [];
    const allChecks = await inventoryCheckService.getAll("ALL", 0, 1);
    if(allChecks && allChecks.totalElements) {
        currentCheckCount.value = allChecks.totalElements;
    }
  } catch (e) {
    console.error("Error loading data:", e);
    error.value = "Không thể tải dữ liệu.";
    toast.error("Không thể tải dữ liệu.");
  }
}

// 2. Handle Warehouse Change
async function onWarehouseChange() {
    if(!form.value.warehouseId) return;
    
    loadingPreview.value = true;
    previewItems.value = [];
    currentPage.value = 1; 
    error.value = ""; 

    try {
        const res = await inventoryCheckService.getStockPreview(form.value.warehouseId);
        const validStatuses = ['IN_WAREHOUSE', 'AVAILABLE', 'IN_STOCK'];
        previewItems.value = res.filter(item => validStatuses.includes(item.status));

    } catch (e) {
        console.error("Lỗi tải tồn kho:", e);
        error.value = "Không thể tải dữ liệu tồn kho.";
        toast.error("Không thể tải dữ liệu tồn kho.");
    } finally {
        loadingPreview.value = false;
    }
}

// 3. Submit Form
async function submit() {
  if (!form.value.warehouseId) {
    error.value = "Vui lòng chọn kho cần kiểm kê.";
    return;
  }

  submitting.value = true;
  error.value = "";
  
  try {
    // Luôn lấy ngày hôm nay làm chuẩn
    const now = new Date();
    
    // Gửi payload
    const payload = {
      warehouseId: form.value.warehouseId,
      createdBy: form.value.createdBy,
      checkedBy: form.value.checkedBy,
      note: form.value.note,
      deadline: now.toISOString() // BE sẽ override lại lần nữa cho chắc
    };

    await inventoryCheckService.create(payload);
    toast.success("Tạo phiếu kiểm kê thành công!");
    router.push('/inventory-check');

  } catch (e) {
    error.value = e.response?.data?.message || "Có lỗi xảy ra khi tạo phiếu. Vui lòng thử lại.";
    toast.error(error.value);
    window.scrollTo(0,0);
  } finally {
    submitting.value = false;
  }
}

onMounted(loadData);
</script>

<style scoped>
.card { border-radius: 12px; }
.page-link { cursor: pointer; color: #333; }
.page-item.disabled .page-link { background: #f8f9fa; color: #6c757d; }
.page-item:not(.disabled) .page-link:hover { background: #e9ecef; }
</style>