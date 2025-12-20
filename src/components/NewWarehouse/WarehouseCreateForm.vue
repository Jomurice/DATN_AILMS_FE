<script setup>
import { ref } from "vue";
import { warehouseService } from "../../services/warehouseService";
import { toast } from "vue-sonner";

/* =====================
  CONSTANT
===================== */
const MAX_LENGTH = 60;

/* =====================
  FORM STATE
===================== */
const form = ref({
  name: "",
  code: "",
  type: "",
  parentId: null,
  location: "",
});

const errors = ref({
  name: "",
  code: "",
  type: "",
  location: "",
});

const loading = ref(false);

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

  // NAME
  if (!form.value.name) {
    errors.value.name = "Bắt buộc";
    ok = false;
  } else if (form.value.name.length > MAX_LENGTH) {
    errors.value.name = `Tối đa ${MAX_LENGTH} ký tự`;
    ok = false;
  }

  // CODE
  if (!form.value.code) {
    errors.value.code = "Bắt buộc";
    ok = false;
  } else if (form.value.code.length > MAX_LENGTH) {
    errors.value.code = `Tối đa ${MAX_LENGTH} ký tự`;
    ok = false;
  }

  // TYPE
  if (!form.value.type) {
    errors.value.type = "Bắt buộc";
    ok = false;
  }

  // LOCATION
  if (!form.value.location) {
    errors.value.location = "Bắt buộc";
    toast.warning("Vui lòng nhập vị trí kho hàng");
    ok = false;
  } else if (form.value.location.length > MAX_LENGTH) {
    errors.value.location = `Tối đa ${MAX_LENGTH} ký tự`;
    toast.warning(`Vị trí kho hàng tối đa ${MAX_LENGTH} ký tự`);
    ok = false;
  }

  return ok;
}

/* =====================
  SUBMIT
===================== */
async function createWarehouse() {
  if (!validateForm()) {
    toast.warning("Vui lòng kiểm tra lại dữ liệu");
    return;
  }

  loading.value = true;

  try {
    await warehouseService.createWarehouse(form.value);
    toast.success("Tạo kho hàng thành công!");

    form.value = {
      name: "",
      code: "",
      type: "",
      parentId: null,
      location: "",
    };
  } catch (e) {
    console.error(e);
    toast.error("Không thể tạo kho hàng!");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="card mb-4 p-3 shadow-sm">
    <h5 class="mb-3 fw-bold">Tạo kho hàng mới</h5>

    <form @submit.prevent="createWarehouse" class="row g-3">

      <!-- NAME -->
      <div class="col-md-6">
        <label class="form-label">Tên kho hàng</label>
        <input
          v-model="form.name"
          type="text"
          class="form-control"
          :maxlength="MAX_LENGTH"
          :class="{ 'is-invalid': errors.name }"
        />
        <div class="d-flex justify-content-between">
          <div class="invalid-feedback d-block">
            {{ errors.name }}
          </div>
          <small class="text-muted">
            {{ form.name.length }}/{{ MAX_LENGTH }}
          </small>
        </div>
      </div>

      <!-- CODE -->
      <div class="col-md-6">
        <label class="form-label">Mã kho</label>
        <input
          v-model="form.code"
          type="text"
          class="form-control"
          :maxlength="MAX_LENGTH"
          :class="{ 'is-invalid': errors.code }"
        />
        <div class="d-flex justify-content-between">
          <div class="invalid-feedback d-block">
            {{ errors.code }}
          </div>
          <small class="text-muted">
            {{ form.code.length }}/{{ MAX_LENGTH }}
          </small>
        </div>
      </div>

      <!-- TYPE -->
      <div class="col-md-6">
        <label class="form-label">Loại</label>
        <select
          v-model="form.type"
          class="form-select"
          :class="{ 'is-invalid': errors.type }"
        >
          <option disabled value="">-- Chọn loại --</option>
          <option value="WAREHOUSE">WAREHOUSE</option>
        </select>
        <div class="invalid-feedback d-block">
          {{ errors.type }}
        </div>
      </div>

      <!-- LOCATION -->
      <div class="col-md-6">
        <label class="form-label">Vị trí</label>
        <input
          v-model="form.location"
          type="text"
          class="form-control"
          :maxlength="MAX_LENGTH"
          :class="{ 'is-invalid': errors.location }"
        />
        <div class="d-flex justify-content-between">
          <div class="invalid-feedback d-block">
            {{ errors.location }}
          </div>
          <small class="text-muted">
            {{ form.location.length }}/{{ MAX_LENGTH }}
          </small>
        </div>
      </div>

      <!-- SUBMIT -->
      <div class="col-12 text-end">
        <button
          type="submit"
          class="btn btn-success"
          :disabled="loading"
        >
          {{ loading ? "Đang tạo..." : "Tạo kho hàng" }}
        </button>
      </div>

    </form>
  </div>
</template>

<style scoped>
.card {
  border-radius: 12px;
  background: #fff;
}
</style>
