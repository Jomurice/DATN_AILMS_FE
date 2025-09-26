<script setup>
import { ref, onMounted, watch } from "vue";
import { warehouseService } from "../../services/warehouseService";
import { locationService } from "../../services/locationService";

const form = ref({
  name: "",
  code: "",
  type: "",
  currentQuantity: 0,
  capacity: 0,
  parentId: null,
  locationId: null,
});

const warehouses = ref([]);
const locations = ref([]);
const loading = ref(false);
const successMessage = ref("");
const errorMessage = ref("");


async function loadOptions() {
  try {
    warehouses.value = await warehouseService.getAllWarehouses();

    const all = await locationService.getAllLocation();
    
    locations.value = all.flatMap(city => {
      return city.children?.length
        ? city.children.map(ward => ({
            id: ward.id,
            name: `${city.name} - ${ward.name}`,
          }))
        : [];
    });
  } catch (e) {
    console.error("Lỗi khi tải dữ liệu:", e);
  }
}


async function createWarehouse() {
  loading.value = true;
  successMessage.value = "";
  errorMessage.value = "";

  try {
    await warehouseService.createWarehouse(form.value);
    successMessage.value = "Tạo kho hàng thành công!";

    form.value = {
      name: "",
      code: "",
      type: "",
      currentQuantity: 0,
      capacity: 0,
      parentId: null,
      locationId: null,
    };

  
    await loadOptions();
  } catch (err) {
    console.error("Error create:", err);
    errorMessage.value = "Không thể tạo kho hàng!";
  } finally {
    loading.value = false;
  }
}


watch(
  () => form.value.parentId,
  (newParentId) => {
    if (newParentId) {
      const parent = warehouses.value.find(w => w.id === newParentId);
      if (parent?.location?.id) {
        form.value.locationId = parent.location.id;
      }
    }
  }
);

onMounted(() => {
  loadOptions();
});
</script>

<template>
  <div class="card mb-4 p-3 shadow-sm">
    <h5 class="mb-3 fw-bold">Tạo kho hàng mới</h5>

    <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

    <form @submit.prevent="createWarehouse" class="row g-3">
      <div class="col-md-6">
        <label class="form-label">Tên kho hàng</label>
        <input v-model="form.name" type="text" class="form-control" required />
      </div>

      <div class="col-md-6">
        <label class="form-label">Mã kho</label>
        <input v-model="form.code" type="text" class="form-control" required />
      </div>

      <div class="col-md-6">
        <label class="form-label">Loại kho</label>
        <select v-model="form.type" class="form-select" required>
          <option disabled value="">-- Chọn loại kho --</option>
          <option value="WAREHOUSE">WAREHOUSE</option>
          <option value="ZONE">ZONE</option>
          <option value="AISLE">AISLE</option>
          <option value="SHELF">SHELF</option>
          <option value="BIN">BIN</option>
        </select>
      </div>

      <div class="col-md-3">
        <label class="form-label">Số lượng hiện tại</label>
        <input v-model.number="form.currentQuantity" type="number" min="0" class="form-control" />
      </div>

      <div class="col-md-3">
        <label class="form-label">Sức chứa</label>
        <input v-model.number="form.capacity" type="number" min="0" class="form-control" />
      </div>

      <div class="col-md-6">
        <label class="form-label">Kho cha</label>
        <select v-model="form.parentId" class="form-select">
          <option :value="null"> -- Không có  -- </option>
          <option v-for="w in warehouses" :key="w.id" :value="w.id">
            {{ w.name }} ({{ w.code }})
          </option>
        </select>
      </div>

      <div class="col-md-6">
        <label class="form-label">Vị trí (Ward)</label>
        <select v-model="form.locationId" class="form-select" required>
          <option disabled value="">-- Chọn vị trí (ward) --</option>
          <option v-for="l in locations" :key="l.id" :value="l.id">
            {{ l.name }}
          </option>
        </select>
      </div>

      <div class="col-12 text-end">
        <button type="submit" class="btn btn-success" :disabled="loading">
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
