<template>
  <div class="container-fluid py-4">
    <!-- COLLAPSIBLE FORM -->
    <div class="mb-4">
      <button
        class="btn btn-success d-flex align-items-center gap-2 shadow-sm mb-2"
        @click="showForm = !showForm"
      >
        <i class="fas" :class="showForm ? 'fa-angle-up' : 'fa-plus'"></i>
        {{ showForm ? "Đóng Form" : "Thêm Nhà Cung Cấp" }}
      </button>

      <transition name="fade">
        <div v-if="showForm" class="card shadow-sm rounded-4 border-0">
          <div class="card-header bg-primary text-white rounded-top-4">
            <h5 class="mb-0">Thêm / Sửa Nhà Cung Cấp</h5>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <!-- Tên Công Ty -->
              <div class="col-md-4">
                <label class="form-label"
                  >Tên Công Ty <span class="text-danger">*</span></label
                >
                <input
                  v-model="formSupplier.companyName"
                  type="text"
                  class="form-control"
                  placeholder="Tên Công Ty"
                  :class="{ 'is-invalid': errors.companyName }"
                />
                <div v-if="errors.companyName" class="invalid-feedback">
                  {{ errors.companyName }}
                </div>
              </div>

              <!-- Người Liên Hệ -->
              <div class="col-md-4">
                <label class="form-label"
                  >Người Liên Hệ <span class="text-danger">*</span></label
                >
                <input
                  v-model="formSupplier.contactName"
                  type="text"
                  class="form-control"
                  placeholder="Người Liên Hệ"
                  :class="{ 'is-invalid': errors.contactName }"
                />
                <div v-if="errors.contactName" class="invalid-feedback">
                  {{ errors.contactName }}
                </div>
              </div>

              <!-- Email -->
              <div class="col-md-4">
                <label class="form-label">Email</label>
                <input
                  v-model="formSupplier.email"
                  type="email"
                  class="form-control"
                  placeholder="Email"
                  :class="{ 'is-invalid': errors.email }"
                />
                <div v-if="errors.email" class="invalid-feedback">
                  {{ errors.email }}
                </div>
              </div>

              <!-- Phone -->
              <div class="col-md-4">
                <label class="form-label">Số Điện Thoại</label>
                <input
                  v-model="formSupplier.phone"
                  type="text"
                  class="form-control"
                  placeholder="Số Điện Thoại"
                  :class="{ 'is-invalid': errors.phone }"
                />
                <div v-if="errors.phone" class="invalid-feedback">
                  {{ errors.phone }}
                </div>
              </div>

              <!-- Address -->
              <div class="col-md-8">
                <label class="form-label">Địa Chỉ</label>
                <input
                  v-model="formSupplier.address"
                  type="text"
                  class="form-control"
                  placeholder="Địa Chỉ"
                />
              </div>
            </div>

            <div class="mt-4 text-end">
              <button
                class="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
                @click="saveSupplier"
              >
                <i class="fas fa-save"></i> Lưu
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- TABLE CARD -->
    <div class="card shadow-sm rounded-4 p-3 border-0">
      <div
        class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2"
      >
        <span class="fw-semibold"
          >Tổng: {{ pages.totalElements || 0 }} Nhà Cung Cấp</span
        >
        <div class="d-flex align-items-center gap-2 flex-wrap">
          <!-- Filter -->
          <div class="d-flex align-items-center gap-1">
            <select
              v-model="payload.active"
              @change="onFilterChange"
              class="form-select form-select-sm"
              style="min-width: 150px"
            >
              <option :value="null">Tất cả</option>
              <option :value="true">Hoạt động</option>
              <option :value="false">Không hoạt động</option>
            </select>
          </div>

          <!-- Search -->
          <div class="d-flex align-items-center gap-1">
            <input
              v-model.trim="payload.companyName"
              @input="onSearchInput"
              type="text"
              class="form-control form-control-sm"
              placeholder="Tìm theo tên công ty..."
              style="min-width: 200px"
            />
          </div>

          <!-- Page size -->
          <div class="d-flex align-items-center gap-1">
            <select
              v-model.number="payload.pageable.size"
              @change="onChangePageSize"
              class="form-select form-select-sm"
              style="min-width: 80px"
            >
              <option v-for="n in [10, 20, 50, 100]" :key="n" :value="n">
                {{ n }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- TABLE -->
      <div class="table-responsive" style="max-height: 500px; overflow-x: auto">
        <table
          class="table table-hover table-bordered align-middle text-center"
          style="min-width: 1200px"
        >
          <thead class="table-light sticky-top">
            <tr>
              <th>STT</th>
              <th>Tên Công Ty</th>
              <th>Người Liên Hệ</th>
              <th>Email</th>
              <th>SĐT</th>
              <th>Địa Chỉ</th>
              <th>Cập Nhật</th>
              <th>Trạng Thái</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(s, index) in suppliers" :key="s.id">
              <td>
                {{ payload.pageable.page * payload.pageable.size + index + 1 }}
              </td>
              <td class="text-break">{{ s.companyName }}</td>
              <td class="text-break">{{ s.contactName }}</td>
              <td class="text-break">{{ s.email }}</td>
              <td class="text-break">{{ s.phone }}</td>
              <td class="text-break">{{ s.address }}</td>
              <td>{{ formatDate(s.updatedAt) }}</td>
              <td>
                <span
                  :class="['badge', s.active ? 'bg-success' : 'bg-secondary']"
                >
                  {{ s.active ? "Hoạt Động" : "Không Hoạt Động" }}
                </span>
              </td>
              <td class="d-flex justify-content-center gap-2">
                <button
                  class="btn btn-sm btn-outline-warning"
                  @click="editSupplier(s)"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  class="btn btn-sm"
                  :class="
                    s.active ? 'btn-outline-danger' : 'btn-outline-success'
                  "
                  @click="toggleStatus(s)"
                >
                  <i
                    :class="
                      s.active ? 'fas fa-user-slash' : 'fas fa-user-check'
                    "
                  ></i>
                </button>
              </td>
            </tr>
            <tr v-if="!loading && suppliers.length === 0">
              <td colspan="9" class="text-center text-muted py-4">
                Không có dữ liệu
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <nav
        class="d-flex justify-content-center align-items-center mt-3 gap-2 flex-wrap"
      >
        <button
          class="btn btn-outline-primary btn-sm"
          :disabled="pages.number === 0"
          @click="changePage(pages.number - 1)"
        >
          &lt;
        </button>
        <button
          v-for="page in pageNumbers"
          :key="page"
          class="btn btn-sm"
          :class="
            page === pages.number
              ? 'btn-primary text-white'
              : 'btn-outline-primary'
          "
          @click="changePage(page)"
        >
          {{ page + 1 }}
        </button>
        <button
          class="btn btn-outline-primary btn-sm"
          :disabled="pages.number === pages.totalPages - 1"
          @click="changePage(pages.number + 1)"
        >
          &gt;
        </button>
      </nav>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="text-center my-3">
      <div class="spinner-border text-info" role="status"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { supplierService } from "@/services/purchaseOrder/supplierService.js";
import { toast } from "vue-sonner";

const payload = ref({
  companyName: "",
  active: null,
  pageable: { page: 0, size: 10, sort: "companyName,asc" },
});

const suppliers = ref([]);
const pages = ref({ number: 0, totalPages: 1, totalElements: 0 });
const loading = ref(false);
const showForm = ref(false);
const formSupplier = ref({
  id: null,
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  address: "",
});
const errors = ref({});

const pageNumbers = computed(() => {
  const total = pages.value.totalPages;
  const current = pages.value.number;
  const result = [];
  const start = Math.max(current - 2, 0);
  const end = Math.min(current + 2, total - 1);
  for (let i = start; i <= end; i++) result.push(i);
  return result;
});

async function loadSuppliers() {
  loading.value = true;
  try {
    const res = await supplierService.getSuppliers({
      page: payload.value.pageable.page,
      size: payload.value.pageable.size,
      companyName: payload.value.companyName || null,
      active: payload.value.active,
    });
    suppliers.value = res.content ?? [];
    pages.value = res;
  } catch (e) {
    console.error(e);
    toast.error("Không thể tải danh sách nhà cung cấp");
  } finally {
    loading.value = false;
  }
}

function validateForm() {
  const e = {};
  if (!formSupplier.value.companyName?.trim())
    e.companyName = "Tên công ty là bắt buộc";
  if (!formSupplier.value.contactName?.trim())
    e.contactName = "Người liên hệ là bắt buộc";
  if (
    formSupplier.value.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formSupplier.value.email)
  )
    e.email = "Email không hợp lệ";
  if (
    formSupplier.value.phone &&
    !/^[0-9+\-\s]{6,20}$/.test(formSupplier.value.phone)
  )
    e.phone = "Số điện thoại không hợp lệ";
  errors.value = e;
  return Object.keys(e).length === 0;
}

async function saveSupplier() {
  if (!validateForm()) return;

  loading.value = true;
  try {
    if (formSupplier.value.id) {
      await supplierService.updateSupplier(
        formSupplier.value.id,
        formSupplier.value
      );
      toast.success("Cập nhật nhà cung cấp thành công");
    } else {
      await supplierService.createSupplier(formSupplier.value);
      toast.success("Tạo nhà cung cấp thành công");
    }
    formSupplier.value = {
      id: null,
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      address: "",
    };
    showForm.value = false;
    loadSuppliers();
  } catch (e) {
    console.error(e);
    toast.error("Lưu nhà cung cấp thất bại");
  } finally {
    loading.value = false;
  }
}

async function toggleStatus(s) {
  try {
    await supplierService.toggleStatus(s.id);
    toast.success("Cập nhật trạng thái thành công");
    loadSuppliers();
  } catch (e) {
    console.error(e);
    toast.error("Cập nhật trạng thái thất bại");
  }
}

function changePage(newPage) {
  if (newPage < 0 || newPage >= pages.value.totalPages) return;
  payload.value.pageable.page = newPage;
  loadSuppliers();
}
function onChangePageSize() {
  payload.value.pageable.page = 0;
  loadSuppliers();
}
function onSearchInput() {
  payload.value.pageable.page = 0;
  loadSuppliers();
}
function onFilterChange() {
  payload.value.pageable.page = 0;
  loadSuppliers();
}

function editSupplier(s) {
  formSupplier.value = { ...s };
  showForm.value = true;
  errors.value = {};
}

function formatDate(date) {
  if (!date) return "-";
  const d = new Date(date);
  return (
    d.toLocaleDateString("vi-VN") +
    " " +
    d.toLocaleTimeString("vi-VN", { hour12: false })
  );
}

onMounted(loadSuppliers);
</script>

<style scoped>
.table-hover tbody tr:hover {
  background-color: #f0f8ff;
}
.text-break {
  white-space: normal !important;
  word-break: break-word;
}
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
