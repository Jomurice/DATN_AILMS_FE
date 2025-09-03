<template>
  <div class="receipt-list">
    <h2>Danh sách phiếu nhập kho</h2>
    <table>
      <thead>
        <tr>
          <th>Mã phiếu</th>
          <th>Ngày nhập</th>
          <th>Nhà cung cấp</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="receipt in receipts" :key="receipt.id">
          <td>{{ receipt.code }}</td>
          <td>{{ receipt.date }}</td>
          <td>{{ receipt.supplier }}</td>
          <td>
            <router-link :to="`/products/${receipt.code}`">
              Xem sản phẩm
            </router-link>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const receipts = ref([
  { id: 1, code: 'PN001', date: '2025-09-01', supplier: 'Công ty A' },
  { id: 2, code: 'PN002', date: '2025-09-02', supplier: 'Công ty B' }
])
</script>

<style scoped>
.receipt-list {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  padding: 8px 12px;
  border-bottom: 1px solid #eee;
  text-align: left;
}
th {
  background: #f3f4f6;
}
router-link {
  color: #2563eb;
  text-decoration: underline;
  cursor: pointer;
}
</style>