<template>
  <div class="brand-container">
    <div v-if="toastMsg" class="custom-toast shadow" :class="{ 'error': toastIsError }">
      <i class="fa-solid me-2" :class="toastIsError ? 'fa-circle-xmark' : 'fa-circle-check'"></i>
      {{ toastMsg }}
    </div>

    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="fw-bold m-0 text-dark">Quản lý Thương hiệu</h4>
        <small class="text-muted">Danh sách các nhãn hàng cung cấp</small>
      </div>
      <button class="btn btn-primary px-4 rounded-3 shadow-sm" @click="openCreateForm">
        <i class="fa-solid fa-plus me-2"></i>Thêm mới
      </button>
    </div>

    <div class="table-card shadow-sm border-0">
      <div class="p-3 border-bottom bg-white">
        <div class="search-input-group">
          <i class="fa-solid fa-magnifying-glass text-muted"></i>
          <input v-model="searchQuery" type="text" placeholder="Tìm kiếm tên..." class="form-control" />
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-light">
            <tr>
              <th class="ps-4" style="width: 100px;">STT</th>
              <th>TÊN THƯƠNG HIỆU</th>
              <th class="text-end pe-4" style="width: 150px;">HÀNH ĐỘNG</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="3" class="text-center py-5">
                <div class="spinner-border text-primary spinner-border-sm" role="status"></div>
                <div class="mt-2 text-muted small">Đang tải dữ liệu...</div>
              </td>
            </tr>
            
            <tr v-for="(brand, index) in filteredList" :key="brand.id">
              <td class="ps-4 text-muted">{{ index + 1 }}</td>
              <td>
                <div class="d-flex align-items-center">
                  <div class="brand-avatar-sm me-3">
                    {{ brand.name.charAt(0).toUpperCase() }}
                  </div>
                  <span class="fw-bold text-dark">{{ brand.name }}</span>
                </div>
              </td>
              <td class="text-end pe-4">
                <div class="d-flex justify-content-end gap-2">
                  <button class="btn btn-icon btn-edit" @click="startEdit(brand)" title="Chỉnh sửa">
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>
                  <!-- <button class="btn btn-icon btn-delete" @click="handleDelete(brand.id)" title="Xóa">
                    <i class="fa-solid fa-trash-can"></i>
                  </button> -->
                </div>
              </td>
            </tr>

            <tr v-if="!loading && filteredList.length === 0">
              <td colspan="3" class="text-center py-5 text-muted">
                <i class="fa-solid fa-tag fs-1 d-block mb-3 opacity-25"></i>
                Không tìm thấy dữ liệu phù hợp
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showModal" class="modal-backdrop-custom">
      <div class="modal-content-custom shadow-lg">
        <div class="modal-header-custom">
          <h5 class="fw-bold m-0 text-primary">
            <i class="fa-solid me-2" :class="isCreating ? 'fa-circle-plus' : 'fa-pen-to-square'"></i>
            {{ isCreating ? 'Thêm thương hiệu' : 'Cập nhật thương hiệu' }}
          </h5>
          <button class="btn-close" @click="closeModal"></button>
        </div>
        <div class="modal-body-custom">
          <div class="mb-2">
            <label class="form-label fw-bold small text-secondary">Tên thương hiệu <span class="text-danger">*</span></label>
            <input v-model="brandForm.name" type="text" class="form-control form-control-lg" 
                   placeholder="Nhập tên thương hiệu..." ref="nameInput" @keyup.enter="saveBrand" />
          </div>
        </div>
        <div class="modal-footer-custom border-0">
          <button class="btn btn-light px-4" @click="closeModal">Hủy bỏ</button>
          <button class="btn btn-primary px-4 ms-2" @click="saveBrand" :disabled="submitting">
            <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
            Lưu lại
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from "vue";
import { brandService } from "../../services/randService";
import { toast } from "vue-sonner";

const list = ref([]);
const loading = ref(false);
const submitting = ref(false);
const searchQuery = ref("");
const showModal = ref(false);
const isCreating = ref(false);
const nameInput = ref(null);

const brandForm = ref({ id: null, name: "" });
const toastMsg = ref("");
const toastIsError = ref(false);

const filteredList = computed(() => {
  const data = Array.isArray(list.value) ? list.value : (list.value.content || []);
  return data.filter(b => b.name.toLowerCase().includes(searchQuery.value.toLowerCase()));
});

function showToast(msg, isError = false) {
  toastMsg.value = msg;
  toastIsError.value = isError;
  setTimeout(() => (toastMsg.value = ""), 3000);
}

async function loadData() {
  loading.value = true;
  try {
    list.value = await brandService.getAll();
  } catch (e) {
    toast.error("Không thể tải dữ liệu thương hiệu"); 
  } finally {
    loading.value = false;
  }
}

function openCreateForm() {
  isCreating.value = true;
  brandForm.value = { id: null, name: "" };
  showModal.value = true;
  nextTick(() => nameInput.value?.focus());
}

function startEdit(brand) {
  isCreating.value = false;
  brandForm.value = { ...brand };
  showModal.value = true;
  nextTick(() => nameInput.value?.focus());
}

function closeModal() {
  showModal.value = false;
}

async function saveBrand() {
  if (!brandForm.value.name.trim()) return;
  submitting.value = true;
  try {
    if (isCreating.value) {
      await brandService.create({ name: brandForm.value.name });
      toast.success("Thêm thành công");
    } else {
      await brandService.update(brandForm.value.id, { name: brandForm.value.name });
      
      toast.success("Cập nhật thành công");
    }
    await loadData();
    closeModal();
  } catch (e) {
    toast.error("Lưu thất bại");
    
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(id) {
  if (!confirm("Bạn có chắc chắn muốn xóa thương hiệu này?")) return;
  try {
    await brandService.delete(id);
    toast.success("Xóa thành công");
    await loadData();
  } catch (e) {
    toast.error("Xóa thất bại");
   
  }
}

onMounted(loadData);
</script>

<style scoped>
.brand-container {
  padding: 1.5rem 2rem;
  background-color: #f8f9fa;
  min-height: calc(100vh - 60px);
}

.table-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #edf2f7;
}

.search-input-group {
  position: relative;
  width: 280px;
}

.search-input-group i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
}

.search-input-group input {
  padding-left: 38px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.table thead th {
  font-size: 0.75rem;
  font-weight: 700;
  color: #718096;
  background-color: #f7fafc;
  border-bottom: 1px solid #edf2f7;
  padding: 1rem;
}

.brand-avatar-sm {
  width: 32px;
  height: 32px;
  background: #ebf4ff;
  color: #3182ce;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.85rem;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  background: white;
  transition: all 0.2s;
}

.btn-edit { color: #d69e2e; }
.btn-edit:hover { background: #faf089; border-color: #d69e2e; }

.btn-delete { color: #e53e3e; }
.btn-delete:hover { background: #fff5f5; border-color: #e53e3e; }

.modal-backdrop-custom {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(26, 32, 44, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  backdrop-filter: blur(2px);
}

.modal-content-custom {
  background: white;
  width: 420px;
  border-radius: 12px;
}

.modal-header-custom {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #edf2f7;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body-custom { padding: 1.5rem; }
.modal-footer-custom {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: flex-end;
}

.custom-toast {
  position: fixed;
  top: 20px; right: 20px;
  background: #38a169; color: white;
  padding: 0.75rem 1.5rem; border-radius: 8px;
  z-index: 10000;
  font-weight: 600;
}
.custom-toast.error { background: #e53e3e; }
</style>