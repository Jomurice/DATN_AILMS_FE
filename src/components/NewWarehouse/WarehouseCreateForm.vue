<script setup>
import { ref, onMounted, watch } from "vue";
import { warehouseService } from "../../services/warehouseService";
import { locationService } from "../../services/locationService";

const form = ref({
  name: "",
  code: "",
  type: "",
  parentId: null,
  location: "", // 👈 обычная строка
});

const warehouses = ref([]);
const loading = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

// 📦 Загрузка всех складов (если нужно выбрать родителя)
async function loadOptions() {
  try {
    warehouses.value = await warehouseService.getAllWarehouses();
  } catch (e) {
    console.error("Lỗi khi tải dữ liệu:", e);
  }
}

// 🧾 Создание склада
async function createWarehouse() {
  loading.value = true;
  successMessage.value = "";
  errorMessage.value = "";

  try {
    await warehouseService.createWarehouse(form.value);
    successMessage.value = "Tạo kho hàng thành công!";

    // сбрасываем форму
    form.value = {
      name: "",
      code: "",
      type: "",
      parentId: null,
      location: "",
    };

    await loadOptions();
  } catch (err) {
    console.error("Error create:", err);
    errorMessage.value = "Không thể tạo kho hàng!";
  } finally {
    loading.value = false;
  }
}

// 🔁 Если выбран родительский склад — копируем его location (строкой)
watch(
  () => form.value.parentId,
  (newParentId) => {
    if (newParentId) {
      const parent = warehouses.value.find((w) => w.id === newParentId);
      if (parent?.location) {
        form.value.location = parent.location; // 👈 строка
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
        <label class="form-label">Loại</label>
        <select v-model="form.type" class="form-select" required>
          <option disabled value="">-- Chọn loại kho --</option>
          <option value="WAREHOUSE">WAREHOUSE</option>
          <option value="ZONE">ZONE</option>
          <option value="AISLE">AISLE</option>
          <option value="SHELF">SHELF</option>
          <option value="BIN">BIN</option>
        </select>
      </div>

      <div class="col-md-6">
        <label class="form-label">Kho cha</label>
        <select v-model="form.parentId" class="form-select">
          <option :value="null">-- Không có --</option>
          <option v-for="w in warehouses" :key="w.id" :value="w.id">
            {{ w.name }} ({{ w.code }})
          </option>
        </select>
      </div>

      <!-- 🗺 location как строка -->
      <div class="col-md-6">
        <label class="form-label">Vị trí (Location)</label>
        <input
          v-model="form.location"
          type="text"
          class="form-control"
          placeholder="Nhập vị trí (ví dụ: Hanoi - Ward 5)"
          required
        />
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
