<template>
  <div class="container py-4" style="max-width: 900px;">
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h4 class="fw-bold mb-0">{{ isEdit ? 'Cập nhật người dùng' : 'Thêm người dùng' }}</h4>
      <button class="btn btn-outline-secondary" @click="$router.push('/admin/account')">← Quay lại</button>
    </div>

    <div class="card section-card">
      <div class="card-body">
        <div v-if="error" class="alert alert-danger">{{ error }}</div>

        <form @submit.prevent="submit" class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Tên đăng nhập <span class="text-danger">*</span></label>
            <input v-model.trim="form.username" class="form-control" required />
          </div>
          <div class="col-md-6">
            <label class="form-label">Họ và tên <span class="text-danger">*</span></label>
            <input v-model.trim="form.name" class="form-control" required />
          </div>

          <div class="col-md-6">
            <label class="form-label">Email <span class="text-danger">*</span></label>
            <input type="email" v-model.trim="form.email" class="form-control" required />
          </div>
          <div class="col-md-6">
            <label class="form-label">Số điện thoại</label>
            <input v-model.trim="form.phone" class="form-control" />
          </div>

          <div class="col-md-6">
            <label class="form-label">Ngày sinh</label>
            <input type="date" v-model="form.dob" class="form-control" />
          </div>
          <div class="col-md-6">
            <label class="form-label d-block">Giới tính</label>
            <div class="d-flex gap-3">
              <label class="form-check">
                <input class="form-check-input" type="radio" v-model="form.gender" :value="true" />
                <span class="ms-1">Nam</span>
              </label>
              <label class="form-check">
                <input class="form-check-input" type="radio" v-model="form.gender" :value="false" />
                <span class="ms-1">Nữ</span>
              </label>
            </div>
          </div>

          <div class="col-12">
            <label class="form-label">Địa chỉ</label>
            <textarea v-model.trim="form.address" rows="3" class="form-control"></textarea>
          </div>

          <div class="col-md-6" v-if="!isEdit">
            <label class="form-label">Mật khẩu <span class="text-danger">*</span></label>
            <input type="password" v-model.trim="form.password" class="form-control" required />
          </div>

          <div class="col-md-6">
            <label class="form-label">Chức vụ (có thể chọn nhiều)</label>
            <select v-model="form.roles" multiple class="form-select">
              <option v-for="r in roleOptions" :key="r" :value="r">{{ r }}</option>
            </select>
            <div class="form-text">Giữ Ctrl/⌘ để chọn nhiều.</div>
          </div>

          <div class="col-12 d-flex gap-2">
            <button class="btn btn-primary" :disabled="submitting">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
              {{ isEdit ? 'Cập nhật' : 'Thêm mới' }}
            </button>
            <button type="button" class="btn btn-outline-secondary" @click="$router.push('/admin/account')">Huỷ</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { userService } from '../../services/userService'
import { roleService } from '../../services/RoleService' 

const route = useRoute()
const router = useRouter()
const isEdit = ref(!!route.params.id)
const submitting = ref(false)
const error = ref('')

const roleOptions = ref(['ADMIN','USER']) 
const form = ref({
  id: null, username:'', name:'', email:'', password:'',
  phone:'', dob:null, address:'', gender:true, roles:[]
})

async function load(){
  try {
    
    try {
      const rs = await roleService.getAll()
      const names = Array.isArray(rs) ? rs.map(r => r.name || r).filter(Boolean) : []
      if (names.length) roleOptions.value = [...new Set(names)]
    } catch {}

    if (isEdit.value) {
      const u = await userService.getUserById(route.params.id)
      form.value = {
        id: u.id,
        username: u.username || '',
        name: u.name || '',
        email: u.email || '',
        phone: u.phone || '',
        dob: u.dob || null,
        address: u.address || '',
        gender: u.gender ?? true,
        roles: Array.isArray(u.roles) ? u.roles : (u.roles ? [u.roles] : []),
        password: '' 
      }
    }
  } catch(e){ error.value = e?.message || 'Không thể tải dữ liệu.' }
}

async function submit(){
  submitting.value = true; error.value = ''
  try{
    const payload = { ...form.value }
    if (isEdit.value) {
      delete payload.password 
      await userService.updateUser(form.value.id, payload)
    } else {
      await userService.createUser(payload)
    }
    router.push('/admin/account')
  } catch(e){ error.value = e?.response?.data?.message || e.message || 'Lưu thất bại.' }
  finally{ submitting.value = false }
}

onMounted(load)
</script>

<style scoped>
.section-card{ background:#fff; border:1px solid #eef2f7; border-radius:12px; box-shadow:0 1px 2px rgba(0,0,0,.03); }
</style>
