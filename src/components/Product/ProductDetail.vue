<template>
  <div class="container py-4" style="max-width: 900px">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="fw-bold mb-0">Chi tiết sản phẩm</h4>
      <button class="btn btn-outline-secondary" @click="$router.back()">← Quay lại</button>
    </div>

    <div v-if="loading" class="text-center py-5"><div class="spinner-border"></div></div>

    <div v-else class="card border-0 shadow-sm">
      <div class="card-body p-4">
        <div class="row g-3">
          <div class="col-md-6"><b>Mã (SKU):</b> {{ p.sku }}</div>
          <div class="col-md-6"><b>Tên:</b> {{ p.name }}</div>
          <div class="col-md-6"><b>Loại:</b> {{ catName(p.categoryId) }}</div>
          <div class="col-md-6"><b>Hãng:</b> {{ p.brand || '—' }}</div>
          <div class="col-md-6"><b>Màu sắc:</b> {{ p.color || '—' }}</div>
          <div class="col-md-6"><b>Dung lượng:</b> {{ p.storage || '—' }}</div>
          <div class="col-12"><b>Thông số kỹ thuật:</b><br>{{ p.specifications || '—' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { productService } from '../../services/productService'
import { categoryService } from '../../services/categoryService'

const route = useRoute()
const p = ref({})
const cats = ref([])
const loading = ref(true)
const catName = id => cats.value.find(c=>c.id===id)?.name || '—'

onMounted(async () => {
  try {
    cats.value = await categoryService.getAll()
    p.value = await productService.getById(route.params.id)
  } finally {
    loading.value = false
  }
})
</script>
