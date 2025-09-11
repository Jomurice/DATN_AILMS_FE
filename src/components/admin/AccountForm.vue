<template>
  <div class="d-flex justify-content-center">
    <div class="w-75 card p-3 rounded-4">

      <div class="d-flex align-items-center justify-content-between mb-3">
        <h4 class="fw-bold mb-0">{{ isEdit ? 'Cập nhật người dùng' : 'Thêm người dùng' }}</h4>
        <button class="btn btn-outline-secondary" @click="$router.push('/admin/account')">← Quay lại</button>
      </div>

      <div>
        <div class="card-body">
          <div v-if="error" class="alert alert-danger">{{ error }}</div>

          <form @submit.prevent="submit" class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Tên đăng nhập <span class="text-danger">*</span></label>
              <input v-model.trim="form.username" class="form-control" placeholder="Vui lòng nhập tên đăng nhập"
                required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Họ và tên <span class="text-danger">*</span></label>
              <input v-model.trim="form.name" class="form-control" placeholder="Vui long nhập họ và tên" required />
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

            <div class="col-md-6" v-if="!isEdit">
              <label class="form-label">Mật khẩu <span class="text-danger">*</span></label>
              <input type="password" v-model.trim="form.password" class="form-control"
                placeholder="Vui long nhập mật khẩu" required />
            </div>

            <div class="col-md-6">
              <label class="form-label">Email <span class="text-danger">*</span></label>
              <input type="email" v-model.trim="form.email" class="form-control"
                placeholder="Vui lòng nhập địa chỉ email" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Số điện thoại<span class="text-danger">*</span></label>
              <input type="text" v-model.trim="form.phone" class="form-control"
                placeholder="Vui lòng nhập số điện thoại" required />
            </div>

            <div class="col-md-6">
              <label class="form-label">Ngày sinh</label>
              <input type="date" v-model="form.dob" class="form-control" />
            </div>

            <div class="col-md-6">
              <label class="form-label">Chức vụ (có thể chọn nhiều)<span class="text-danger">*</span></label>
              <select v-model="form.roles" class="form-select" >
                <option value="">-- Vui lòng chọn chức vụ</option>
                <option v-for="r in roles" :key="r.name" :value="r.name" >{{ r.name }}</option>
              </select>
              <!-- <div class="form-text">Giữ Ctrl/⌘ để chọn nhiều.</div> -->
            </div>

            <div class="col-12">
              <label class="form-label">Địa chỉ<span class="text-danger">*</span></label>
              <textarea v-model.trim="form.address" rows="3" class="form-control" placeholder="Vui lòng nhập địa chỉ"
                required></textarea>
            </div>

            <div class="col-12 d-flex gap-2">
              <button class="btn btn-success" :disabled="submitting">
                <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
                {{ isEdit ? 'Cập nhật' : 'Thêm mới' }}
              </button>
              <button type="button" class="btn btn-outline-secondary"
                @click="$router.push('/admin/account')">Huỷ</button>
            </div>
          </form>
        </div>
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
const isEdit = ref(false);
const userId = route.params.id;
const submitting = ref(false);
const error = ref('');
const roles = ref([]);

const form = ref({

  username: '',
  name: '',
  password: '',
  phone: '',
  email: '',
  gender: true,
  dob: "",
  address: '',
  roles: []
})

async function load() {
  try {
      roles.value = await roleService.getAll();
    if (userId) {
      isEdit.value = true
      form.value = await userService.getUserById(userId);
      console.log(userService.getUserById(userId));
    }
  } catch (e) { error.value = e?.message || 'Không thể tải dữ liệu.' }
}

async function submit() {
  submitting.value = true; error.value = ''
  try {
    const payload = { ...form.value }
    if (isEdit.value) {
      delete payload.password
      await userService.updateUser(form.value.id, payload)
    } else {
      console.log(form.value);
      await userService.createUser(form.value)

    }
    router.push('/admin/account')
  } catch (e) { error.value = e?.response?.data?.message || e.message || 'Lưu thất bại.' }
  finally { submitting.value = false }
}

onMounted(load)
</script>

<style scoped></style>
