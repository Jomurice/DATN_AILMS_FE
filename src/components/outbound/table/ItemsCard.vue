<template>
  <div>
    <div v-for="it in items" :key="it.sku" class="item-card mb-2">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <div class="sku mono fs-5">SKU: {{ it.sku }}</div>
          <div class="name mono">TÊN: {{ it.name }}</div>
        </div>

        <button class="btn btn-sm btn-outline-primary" @click="$emit('open-serials-modal', it.sku)"
          title="Xem serial đã quét">
          <i class="fa-solid fa-eye"></i>
        </button>
      </div>

      <!-- Meta info -->
      <div class="meta">
        <span>Loại: <b>{{ it.categoryName }}</b></span>
        <span>Hãng: <b>{{ it.brandName }}</b></span>
        <span>Màu: <b>{{ it.color || '—' }}</b></span>
      </div>

      <!-- Quantity -->
      <div class="qty">
        <span>Đã quét</span>
        <span class="mono fw-bold">
          {{ it.scannedQuantity }} / {{ it.orderQuantity }}
        </span>
      </div>
    </div>

    <div v-if="loading" class="text-center">
      <span class="spinner-border"></span>
    </div>

    <div v-else-if="!items?.length" class="text-center text-muted py-3">
      Phiếu này chưa có dòng hàng
    </div>
  </div>
</template>

<script setup>
defineProps({ items: Array, loading: Boolean, })
defineEmits(['open-serials-modal'])
</script>

<style scoped>
.item-card {
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  border: 1px solid #e9ecef;
}

/* SKU */
.sku {
  font-size: 13px;
  color: #6c757d;
}

/* Name */
.name {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.3;
}

/* Meta info */
.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  font-size: 15px;
  color: #495057;
  margin-top: 6px;
}

/* Quantity */
.qty {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px dashed #dee2e6;
  font-size: 14px;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
}
</style>
