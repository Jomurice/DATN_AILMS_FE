<template>
  <div class="card w-50 p-2">
    <div class="d-flex align-items-center justify-content-between">
      <h3>Chi tiết hàng hóa</h3>
      <p class="fs-4 exit" @click="$emit('close')">X</p>
    </div>

    <table class="table table-hover">
      <thead>
        <tr>
          <th>MÃ SERIAL</th>
          <th>TRẠNG THÁI</th>
          <th>LOẠI</th>
          <th>MÀU</th>
          <th>HÃNG</th>
          <th>THUỘC TÍNH</th>
          <th>THÔNG SỐ</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="pd in node">
          <td>{{ pd.serialNumber }}</td>
          <td>{{ pd.status }}</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
      </tbody>
    </table>

  </div>
</template>

<script setup>
defineProps({
  node: Array,
})

defineEmits(["close"])
</script>

<style scoped>
.card {
  height: calc(100vh - 200px);
  overflow: auto;
}

.product-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 20px;
}

.exit {
  cursor: pointer !important;
}
</style>