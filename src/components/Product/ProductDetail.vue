<template>
  <div class="card p-2">
    <div class="d-flex align-items-center justify-content-between">
      <h3>Chi tiết hàng hóa</h3>
      <p class="fs-4 exit" @click="$emit('close')">X</p>
    </div>

    <table class="table table-hover">
      <thead>
        <tr>
          <th>MÃ SERIAL</th>
          <th>TÊN</th>
          <th>HÃNG</th>
          <th>LOẠI</th>
          <th>MÀU</th>
          <th>THÔNG SỐ</th>
          <th>TRẠNG THÁI</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="pd in serials" :key="pd.id">
          <td>{{ pd.serialNumber }}</td>
          <td :title="node.name">{{ node.name }}</td>
          <td>{{ node.brandName }}</td>
          <td>{{ node.categoryName }}</td>
          <td :title="node.color">{{ node.color }}</td>
          <td :title="node.specifications">{{ node.specifications }}</td>
          <td>{{ pd.status }}</td>
        </tr>
        <tr>
          <td colspan="7" v-if="serials.length === 0" class="text-center">Không có dữ liệu</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed } from "vue"

const props = defineProps({
  node: Object
})
defineEmits(["close"])

const serials = computed(() =>
  Object.values(props.node).filter(item => item && item.serialNumber)
)
</script>

<style scoped>
.card {
  width: 80%;
  height: calc(100vh - 200px);
  overflow: auto;
}

.exit {
  cursor: pointer !important;
}

th ,td {
  max-width: 150px;
  white-space: nowrap;
  text-overflow: ellipsis; 
  overflow: hidden;
}
</style>