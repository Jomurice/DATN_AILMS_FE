<script setup>
import { ref, onMounted } from "vue";
import { locationService } from "../../services/locationService";

const sidebarOpen = ref(true);
const cities = ref([]);

async function loadCities() {
  try {
    const all = await locationService.getAllLocation();
    for (const city of all) {
      const detail = await locationService.getLocationById(city.id);
      city.children = detail.children || [];
    }
    cities.value = all;
  } catch (err) {
    console.error("❌ Error loading cities:", err);
  }
}

onMounted(() => {
  loadCities();
});
</script>

<template>
  <div class="d-flex vh-100">
    <div class="d-flex flex-column">
      
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
          <h5 class="fw-bold mb-3"> Danh sách địa chỉ</h5>
          <ul class="list-unstyled">
            <li v-for="city in cities" :key="city.id">
              <details>
                <summary class="fw-semibold">{{ city.name }}</summary>
                <ul class="ms-3 text-secondary">
                  <li v-for="ward in city.children" :key="ward.id" class="py-1">
                    + {{ ward.name }}
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
    </div>

 
    <div class="flex-grow-1 d-flex flex-column">
     
      <div class="d-flex align-items-center bg-white border-bottom p-2 justify-content-between">
        <div class="d-flex align-items-center gap-3">
          <div class="input-group input-group-sm" style="max-width: 250px;">
            <span class="input-group-text">🔍</span>
            <input type="text" class="form-control" placeholder="Tìm kiếm..." />
          </div>
        </div>

        <div class="d-flex align-items-center gap-3">
          <span class="fw-semibold">Số lượng sản phẩm: 0</span>
          <button class="btn btn-sm btn-primary">+</button>
        </div>
      </div>

     
      <div class="p-3 overflow-auto">
        <table class="table table-bordered table-striped align-middle">
          <thead class="table-light">
            <tr>
              <th>STT</th>
              <th>Tên</th>
              <th>Code</th>
              <th>Location</th>
              <th>Created</th>
              <th>Số lượng SP</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Tên kho</td>
              <td>WH001</td>
              <td>Hà Nội</td>
              <td>2025-09-25</td>
              <td>100</td>
            </tr>
          </tbody>
        </table>
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
</style>
