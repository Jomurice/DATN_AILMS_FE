<script setup>
import { ref, computed } from "vue";

const sidebarOpen = ref(true);
const search = ref("");

const cities = {
  HCM: ["Tân Phú", "Tân Bình"],
  "Hà Nội": [],
  "Cà Mau": [],
  "Bạc Liêu": [],
};

const warehouses = ref([
  { name: "WH-HCM", code: "WH-TP", location: "Tân Phú", created: "20/09/2025", quantity: 10 },
  { name: "WH-HN", code: "WH-01", location: "Hà Nội", created: "18/09/2025", quantity: 5 },
]);

const filteredWarehouses = computed(() =>
  warehouses.value.filter((wh) =>
    wh.name.toLowerCase().includes(search.value.toLowerCase())
  )
);

const totalProducts = computed(() =>
  warehouses.value.reduce((sum, wh) => sum + wh.quantity, 0)
);
</script>



<template>
  <div class="d-flex vh-100">
    <!-- Sidebar -->
    <div v-if="sidebarOpen" class="bg-light border-end p-3" style="width: 250px;">
      <h5 class="fw-bold mb-3">Kho hàng</h5>
      <ul class="list-unstyled">
        <li v-for="(districts, city) in cities" :key="city">
          <details>
            <summary class="fw-semibold">{{ city }}</summary>
            <ul class="ms-3 text-secondary">
              <li v-for="(d, i) in districts" :key="i">+ {{ d }}</li>
            </ul>
          </details>
        </li>
      </ul>
    </div>

    <!-- Main content -->
    <div class="flex-grow-1 d-flex flex-column">
      <!-- Top bar -->
      <div class="d-flex justify-content-between align-items-center bg-white border-bottom p-2">
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-sm btn-outline-secondary" @click="sidebarOpen = !sidebarOpen">
            <span v-if="sidebarOpen">✖</span>
            <span v-else>☰</span>
          </button>

          <div class="input-group input-group-sm" style="max-width: 250px;">
            <span class="input-group-text">🔍</span>
            <input
              v-model="search"
              type="text"
              class="form-control"
              placeholder="Tìm kiếm..."
            />
          </div>
        </div>

        <div class="d-flex align-items-center gap-3">
          <span class="fw-semibold">Số lượng sản phẩm: {{ totalProducts }}</span>
          <button class="btn btn-sm btn-primary">+</button>
        </div>
      </div>

      <!-- Table -->
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
            <tr v-for="(wh, index) in filteredWarehouses" :key="wh.code">
              <td>{{ index + 1 }}</td>
              <td>{{ wh.name }}</td>
              <td>{{ wh.code }}</td>
              <td>{{ wh.location }}</td>
              <td>{{ wh.created }}</td>
              <td>{{ wh.quantity }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

