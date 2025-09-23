<script setup>
import { ref, computed, onMounted } from "vue";
import { locationService } from "../../services/locationService";
import { newWarehouseService } from "../../services/newWarehouseService";
import LocationTree from "./LocationTree.vue";

const sidebarOpen = ref(true);
const cities = ref([]);
const warehouses = ref([]);
const selectedWarehouses = ref([]);
const search = ref("");

// загрузка городов
async function loadLocation() {
  try {
    const response = await locationService.getAllLocation();
    cities.value = response.filter(item => item.parentId === null);
  } catch (error) {
    console.error("Error load data: ", error);
  }
}

// загрузка складов по локации
async function loadWarehousesByLocation(locationId) {
  try {
    const response = await newWarehouseService.getTreeByLocation(locationId);
    warehouses.value = response;
    selectedWarehouses.value = response;
  } catch (error) {
    console.error("Error load warehouses: ", error);
  }
}

// выбор склада
function selectWarehouse(wh) {
  selectedWarehouses.value = wh.children?.length
    ? [wh, ...wh.children]
    : [wh];
}

// поиск
const filteredWarehouses = computed(() => {
  if (!search.value) return selectedWarehouses.value;
  return selectedWarehouses.value.filter(wh =>
    wh.name.toLowerCase().includes(search.value.toLowerCase())
  );
});

onMounted(() => {
  loadLocation();
});
</script>

<template>
  <div class="d-flex vh-100">
    <!-- Sidebar -->
    <transition name="slide-fade">
      <div v-if="sidebarOpen" class="bg-light border-end p-3 sidebar">
        <h5 class="fw-bold mb-3">📍 Khu vực</h5>

        <!-- дерево городов -->
        <LocationTree :nodes="cities" @select="loadWarehousesByLocation" />

        <!-- список складов -->
        <div v-if="warehouses.length > 0" class="mt-3">
          <h6 class="fw-bold">📦 Kho</h6>
          <ul class="list-unstyled">
            <template v-for="wh in warehouses" :key="wh.id">
              <li @click="selectWarehouse(wh)" style="cursor: pointer;">
                {{ wh.name }}

                <ul v-if="wh.children && wh.children.length" class="ms-3">
                  <li
                    v-for="child in wh.children"
                    :key="child.id"
                    @click.stop="selectWarehouse(child)"
                    style="cursor: pointer;"
                  >
                    ↳ {{ child.name }}
                  </li>
                </ul>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </transition>

    <!-- Main -->
    <div class="flex-grow-1 d-flex flex-column">
      <!-- Top bar -->
      <div class="d-flex justify-content-between align-items-center bg-white border-bottom p-2">
        <div class="d-flex align-items-center gap-2">
          <button
            class="btn btn-sm btn-outline-secondary"
            @click="
              (e) => {
                sidebarOpen = !sidebarOpen;
                e.currentTarget.blur();
              }
            "
          >
            <span v-if="sidebarOpen"> > </span>
            <span v-else> < </span>
          </button>

          <div class="input-group input-group-sm" style="max-width: 250px;">
            <input
              v-model="search"
              type="text"
              class="form-control"
              placeholder="Tìm kiếm..."
            />
            <span class="input-group-text">
              <i class="fa-solid fa-magnifying-glass"></i>
            </span>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="p-3 overflow-auto">
        <div class="table-responsive">
          <table class="table table-bordered table-striped align-middle">
            <thead class="table-primary">
              <tr>
                <th>STT</th>
                <th>Tên</th>
                <th>Code</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Current Quantity</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(wh, index) in filteredWarehouses" :key="wh.id">
                <td>{{ index + 1 }}</td>
                <td>{{ wh.name }}</td>
                <td>{{ wh.code }}</td>
                <td>{{ wh.type }}</td>
                <td>{{ wh.capacity }}</td>
                <td>{{ wh.currentQuantity }}</td>
                <td>{{ wh.locationId }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Debug -->
        <pre>{{ warehouses }}</pre>
      </div>
    </div>
  </div>
</template>

<style>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
.sidebar {
  width: 280px;
  max-height: 100vh;
  overflow-y: auto;
}
</style>
