<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { locationService } from "../../services/locationService";
import { warehouseService } from "../../services/warehouseService";

const router = useRouter();
const sidebarOpen = ref(true);
const cities = ref([]);
const wardsList = ref([]);
const selectedLocationId = ref(null);
const warehouses = ref([]);
const loading = ref(false);


const showEditModal = ref(false);
const editForm = ref({
  id: null,
  name: "",
  code: "",
  type: "",
  currentQuantity: 0,
  capacity: 0,
  parentId: null,
  locationId: null,
});


async function loadCities() {
  try {
    const all = await locationService.getAllLocation();
    for (const city of all) {
      const detail = await locationService.getLocationById(city.id);
      city.children = detail.children || [];
    }
    cities.value = all;


    wardsList.value = cities.value.flatMap(city =>
      city.children?.map(ward => ({
        id: ward.id,
        name: `${city.name} - ${ward.name}`,
      })) || []
    );
  } catch (err) {
    console.error("Lỗi tải cities:", err);
  }
}


function flattenWarehouses(tree, parentName = null) {
  let result = [];
  for (const node of tree) {
    result.push({
      id: node.id,
      name: node.name,
      code: node.code,
      location: node.location?.name || "-",
      createdAt: node.createdAt || "-",
      productCount: node.productCount || 0,
      parent: parentName,
      type: node.type,
      currentQuantity: node.currentQuantity,
      capacity: node.capacity,
      parentId: node.parentId || null,
      locationId: node.locationId || null,
    });
    if (node.children?.length) {
      result = result.concat(flattenWarehouses(node.children, node.name));
    }
  }
  return result;
}


async function loadWarehouses() {
  try {
    if (selectedLocationId.value) {
      const tree = await warehouseService.getTreeByLocation(selectedLocationId.value);
      warehouses.value = flattenWarehouses(tree);
    } else {
      const all = await warehouseService.getAllWarehouses();
      warehouses.value = all;
    }
  } catch (err) {
    console.error("Lỗi tải warehouses:", err);
  }
}


function goToCreateWarehouse() {
  router.push("/warehouses/create");
}


function openEditModal(w) {
  editForm.value = {
    id: w.id,
    name: w.name,
    code: w.code,
    type: w.type,
    currentQuantity: w.currentQuantity,
    capacity: w.capacity,
    parentId: w.parentId,
    locationId: w.locationId,
  };
  showEditModal.value = true;
}


async function updateWarehouse() {
  loading.value = true;
  try {
    const { id, ...payload } = editForm.value;
    await warehouseService.updateWarehouse(id, payload);
    showEditModal.value = false;
    await loadWarehouses();
  } catch (err) {
    console.error("Lỗi cập nhật warehouse:", err);
    alert("Cập nhật thất bại");
  } finally {
    loading.value = false;
  }
}


watch(
  () => editForm.value.parentId,
  (newParentId) => {
    if (newParentId) {
      const parent = warehouses.value.find(w => w.id === newParentId);
      if (parent?.locationId) {
        editForm.value.locationId = parent.locationId;
      }
    }
  }
);

watch(selectedLocationId, () => {
  loadWarehouses();
});

onMounted(() => {
  loadCities();
  loadWarehouses();
});
</script>

<template>
  <div class="d-flex vh-100">
    <!-- Sidebar -->
    <!-- <div class="d-flex flex-column">
      <div class="bg-light border-end p-2 text-center">
        <button
          class="btn btn-sm btn-outline-secondary w-100"
          @click="sidebarOpen = !sidebarOpen"
        >
          <span v-if="sidebarOpen">✖</span>
          <span v-else>☰</span>
        </button>
      </div>
      <transition name="slide">
        <div v-if="sidebarOpen" class="bg-light border-end p-3 sidebar flex-grow-1">
          <h5 class="fw-bold mb-3">Danh sách địa chỉ</h5>
          <ul class="list-unstyled">
            <li>
              <button
                class="btn btn-sm w-100 mb-2 btn-outline-primary"
                @click="selectedLocationId = null"
              >
                <i class="fa-solid fa-warehouse"></i>
              </button>
            </li>
            <li v-for="city in cities" :key="city.id">
              <details>
                <summary class="fw-semibold">{{ city.name }}</summary>
                <ul class="ms-3 text-secondary">
                  <li
                    v-for="ward in city.children"
                    :key="ward.id"
                    class="py-1"
                    @click="selectedLocationId = ward.id"
                    style="cursor: pointer;"
                  >
                    <span :class="{ 'text-primary fw-semibold': selectedLocationId === ward.id }">
                      + {{ ward.name }}
                    </span>
                  </li>
                  <li v-if="!city.children?.length" class="text-muted fst-italic">
                    (Không có phường)
                  </li>
                </ul>
              </details>
            </li>
          </ul>
        </div>
      </transition>
    </div> -->

    <!--  Table -->
    <div class="flex-grow-1 d-flex flex-column">
      <div class="d-flex align-items-center bg-white border-bottom p-2 justify-content-between">
        <div class="d-flex align-items-center gap-3">
          <div class="input-group input-group-sm" style="max-width: 250px;">
            <input type="text" class="form-control" placeholder="Tìm kiếm..." />
            <span class="input-group-text"><i class="fa-solid fa-magnifying-glass"></i></span>
          </div>
        </div>
        <div class="d-flex align-items-center gap-3">
          <button 
            class="btn btn-success d-flex align-items-center gap-2 px-3 py-1" 
            @click="goToCreateWarehouse"
          >
            <i class="fa-solid fa-plus"></i>
            <span>Thêm</span>
          </button>
        </div>
      </div>

      <div class="p-3 overflow-auto">
        <table class="table table-bordered table-striped align-middle">
          <thead class="table-light">
            <tr>
              <th>#</th>
              <th>Tên kho</th>
              <th>Code</th>
              <th>Kho cha</th>
              <th>Vị trí</th>
              <th>Ngày tạo</th>
              <th>Số lượng SP</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(w, index) in warehouses" :key="w.id">
              <td>{{ index + 1 }}</td>
              <td>{{ w.name }}</td>
              <td>{{ w.code }}</td>
              <td>{{ w.parent || "-" }}</td>
              <td>{{ w.location }}</td>
              <td>{{ w.createdAt }}</td>
              <td>{{ w.productCount }}</td>
              <td>
                <button class="btn btn-outline-warning" @click="openEditModal(w)">
                  <i class="fa-solid fa-pen"></i>
                </button>
              </td>
            </tr>
            <tr v-if="!warehouses.length">
              <td colspan="8" class="text-center text-muted">Không có dữ liệu</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Edit Modal -->
  <div v-if="showEditModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
    <div class="modal-dialog  modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Chỉnh sửa kho</h5>
          <button type="button" class="btn-close" @click="showEditModal = false"></button>
        </div>
        <div class="modal-body">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Tên kho</label>
              <input v-model="editForm.name" type="text" class="form-control" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Code</label>
              <input v-model="editForm.code" type="text" class="form-control" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Loại</label>
              <select v-model="editForm.type" class="form-select">
                <option value="WAREHOUSE">WAREHOUSE</option>
                <option value="ZONE">ZONE</option>
                <option value="AISLE">AISLE</option>
                <option value="SHELF">SHELF</option>
                <option value="BIN">BIN</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Số lượng hiện tại</label>
              <input v-model.number="editForm.currentQuantity" type="number" min="0" class="form-control" />
            </div>
            <div class="col-md-3">
              <label class="form-label">Sức chứa</label>
              <input v-model.number="editForm.capacity" type="number" min="0" class="form-control" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Kho cha</label>
              <select v-model="editForm.parentId" class="form-select">
                <option :value="null">— Không có</option>
                <option v-for="w in warehouses" :key="w.id" :value="w.id">
                  {{ w.name }} ({{ w.code }})
                </option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label">Vị trí (Ward)</label>
              <select v-model="editForm.locationId" class="form-select">
                <option disabled value="">-- Chọn ward --</option>
                <option v-for="w in wardsList" :key="w.id" :value="w.id">
                  {{ w.name }}
                </option>
              </select>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showEditModal = false">Hủy</button>
          <button class="btn btn-success" @click="updateWarehouse" :disabled="loading">
            {{ loading ? "Đang lưu..." : "Lưu" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  width: 250px;
  min-width: 250px;
  max-width: 250px;
  overflow-y: auto;
  transition: all 0.3s ease;
}
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}
.modal {
  display: block;
}
</style>
