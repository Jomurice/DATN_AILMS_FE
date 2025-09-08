<template>
  <div class="container py-4" style="max-width: 900px;">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="fw-bold mb-0">Chi tiết tài khoản</h4>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-primary" @click="$router.push(`/admin/account/${id}/edit`)">Sửa</button>
        <button class="btn btn-outline-secondary" @click="$router.push('/admin/account')">← Quay lại</button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5"><div class="spinner-border"></div></div>

    <div v-else class="card section-card">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-6"><b>ID:</b> {{ u.id }}</div>
          <div class="col-md-6"><b>Tên đăng nhập:</b> {{ u.username }}</div>
          <div class="col-md-6"><b>Họ tên:</b> {{ u.name }}</div>
          <div class="col-md-6"><b>Email:</b> {{ u.email }}</div>
          <div class="col-md-6"><b>Giới tính:</b> {{ u.gender ? 'Nam' : 'Nữ' }}</div>
          <div class="col-md-6"><b>Số điện thoại:</b> {{ u.phone || '—' }}</div>
          <div class="col-md-6"><b>Ngày sinh:</b> {{ u.dob || '—' }}</div>
          <div class="col-md-6"><b>Trạng thái:</b> <span :class="u.enabled ? 'badge bg-success' : 'badge bg-secondary'">{{ u.enabled ? 'Đang hoạt động' : 'Đã khoá' }}</span></div>
          <div class="col-12"><b>Địa chỉ:</b> {{ u.address || '—' }}</div>
          <div class="col-12"><b>Chức vụ:</b> <span v-for="r in (u.roles||[])" :key="r" class="badge bg-info me-1">{{ r }}</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { userService } from '../../services/userService'

const route = useRoute()
const id = route.params.id
const u = ref({})
const loading = ref(true)

onMounted(async () => {
  try { u.value = await userService.getUserById(id) }
  finally { loading.value = false }
})
</script>

<style scoped>
.section-card{ background:#fff; border:1px solid #eef2f7; border-radius:12px; box-shadow:0 1px 2px rgba(0,0,0,.03); }
</style>
