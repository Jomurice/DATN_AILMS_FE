<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { warehouseService } from "../../services/warehouseService";
import { toast } from "vue-sonner";

const router = useRouter();

/* =====================
   CONSTANT
===================== */
const MAX_LENGTH = 60;

/* =====================
   STATE
===================== */
const selectedLocationId = ref(null);
const warehouses = ref([]);
const loading = ref(false);

const showEditModal = ref(false);

const editForm = ref({
  id: null,
  name: "",
  code: "",
  type: "",
  currentQuantity: null,
  capacity: null,
  parentId: null,
  location: "",
});

/* =====================
   VALIDATION STATE
===================== */
const errors = ref({
  name: "",
  code: "",
  type: "",
  location: "",
});

/* =====================
   VALIDATION
===================== */
function validateForm() {
  let ok = true;

  errors.value = {
    name: "",
    code: "",
    type: "",
    location: "",
  };

  if (!editForm.value.name) {
    errors.value.name = "Tên kho là bắt buộc";
    ok = false;
  } else if (editForm.value.name.length > MAX_LENGTH) {
    errors.value.name = `Tối đa ${MAX_LENGTH} ký tự`;
    ok = false;
  }

  if (!editForm.value.code) {
    errors.value.code = "Code là bắt buộc";
    ok = false;
  } else if (editForm.value.code.length > MAX_LENGTH) {
    errors.value.code = `Tối đa ${MAX_LENGTH} ký tự`;
    ok = false;
  }

  if (!editForm.value.type) {
    errors.value.type = "Loại kho là bắt buộc";
    ok = false;
  }

  if (!editForm.value.location) {
    errors.value.location = "Vị trí là bắt buộc";
    ok = false;
  } else if (editForm.value.location.length > MAX_LENGTH) {
    errors.value.location = `Tối đa ${MAX_LENGTH} ký tự`;
    ok = false;
  }

  return ok;
}

/* =====================
   LOAD WAREHOUSES
===================== */
async function loadWarehouses() {
  try {
    if (selectedLocationId.value) {
      warehouses.value =
        await warehouseService.getTreeByLocation(selectedLocationId.value);
    } else {
      warehouses.value = await warehouseService.getAllWarehouses();
    }
  } catch (err) {
    console.error("Lỗi tải warehouses:", err);
    toast.error("Lỗi tải danh sách kho");
  }
}

/* =====================
   NAVIGATE
===================== */
function goToCreateWarehouse() {
  router.push("/warehouses/create");
}

/* =====================
   OPEN EDIT MODAL
===================== */
function openEditModal(w) {
  editForm.value = {
    id: w.id,
    name: w.name || "",
    code: w.code || "",
    type: w.type || "",
    currentQuantity: w.currentQuantity,
    capacity: w.capacity,
    parentId: w.parentId,
    location: w.location || "",
  };

  errors.value = {
    name: "",
    code: "",
    type: "",
    location: "",
  };

  showEditModal.value = true;
}

/* =====================
   UPDATE WAREHOUSE
===================== */
async function updateWarehouse() {
  if (!validateForm()) {
    toast.warning("Vui lòng kiểm tra lại dữ liệu");
    return;
  }

  loading.value = true;
  try {
    const { id, ...payload } = editForm.value;
    await warehouseService.updateWarehouse(id, payload);
    showEditModal.value = false;
    await loadWarehouses();
    toast.success("Cập nhật kho thành công");
  } catch (err) {
    console.error("Lỗi cập nhật warehouse:", err);
    toast.error("Cập nhật thất bại");
  } finally {
    loading.value = false;
  }
}

/* =====================
   WATCH + MOUNT
===================== */
watch(selectedLocationId, loadWarehouses);

onMounted(() => {
  loadWarehouses();
});
</script>

<template>
  <div class="d-flex vh-100">
    <div class="flex-grow-1 d-flex flex-column">

      <!-- HEADER -->
      <div class="d-flex align-items-center bg-white border-bottom p-2 justify-content-between">
        <div class="input-group input-group-sm" style="max-width: 250px;">
      
        </div>

        <button
          class="btn btn-success d-flex align-items-center gap-2 px-3 py-1"
          @click="goToCreateWarehouse"
        >
          <i class="fa-solid fa-plus"></i>
          <span>Thêm</span>
        </button>
      </div>

      <!-- TABLE -->
      <div class="p-3 overflow-auto">
        <table class="table table-bordered table-striped align-middle">
          <thead class="table-light">
            <tr>
              <th>#</th>
              <th>Tên kho</th>
              <th>Code</th>
              <th>Loại Kho</th>
              <th>Vị trí</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(w, index) in warehouses" :key="w.id">
              <td>{{ index + 1 }}</td>
              <td>{{ w.name }}</td>
              <td>{{ w.code }}</td>
              <td>{{ w.type }}</td>
              <td>{{ w.location }}</td>
              <td>
                <button class="btn btn-outline-warning" @click="openEditModal(w)">
                  <i class="fa-solid fa-pen"></i>
                </button>
              </td>
            </tr>

            <tr v-if="!warehouses.length">
              <td colspan="6" class="text-center text-muted">
                Không có dữ liệu
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- EDIT MODAL -->
  <div
    v-if="showEditModal"
    class="modal fade show d-block"
    tabindex="-1"
    style="background: rgba(0,0,0,0.5);"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">

        <div class="modal-header">
          <h5 class="modal-title">Chỉnh sửa kho</h5>
          <button class="btn-close" @click="showEditModal = false"></button>
        </div>

        <div class="modal-body">
          <div class="row g-3">

            <!-- NAME -->
            <div class="col-md-6">
              <label class="form-label">Tên kho</label>
              <input
                v-model="editForm.name"
                class="form-control"
                :maxlength="MAX_LENGTH"
                :class="{ 'is-invalid': errors.name }"
              />
              <div class="invalid-feedback d-block">{{ errors.name }}</div>
            </div>

            <!-- CODE -->
            <div class="col-md-6">
              <label class="form-label">Code</label>
              <input
                v-model="editForm.code"
                class="form-control"
                :maxlength="MAX_LENGTH"
                :class="{ 'is-invalid': errors.code }"
              />
              <div class="invalid-feedback d-block">{{ errors.code }}</div>
            </div>

            <!-- TYPE -->
            <div class="col-md-6">
              <label class="form-label">Loại</label>
              <select
                v-model="editForm.type"
                class="form-select"
                :class="{ 'is-invalid': errors.type }"
              >
                <option value="WAREHOUSE">WAREHOUSE</option>
              </select>
              <div class="invalid-feedback d-block">{{ errors.type }}</div>
            </div>

            <!-- LOCATION -->
            <div class="col-md-6">
              <label class="form-label">Vị trí</label>
              <input
                v-model="editForm.location"
                class="form-control"
                :maxlength="MAX_LENGTH"
                :class="{ 'is-invalid': errors.location }"
              />
              <div class="invalid-feedback d-block">{{ errors.location }}</div>
            </div>

          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showEditModal = false">
            Hủy
          </button>
          <button class="btn btn-success" @click="updateWarehouse" :disabled="loading">
            {{ loading ? "Đang lưu..." : "Lưu" }}
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.modal {
  display: block;
}
</style>
