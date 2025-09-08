<template>
  <div class="container py-5" style="max-width: 900px;">
    <div class="d-flex align-items-center justify-content-between mb-4">
      <h4 class="fw-bold mb-0">{{ isEdit ? 'Cập nhật loại' : 'Thêm loại mới' }}</h4>
      <button class="btn btn-outline-secondary" @click="$router.push('/category')">← Quay lại</button>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-body p-4">
        <div v-if="error" class="alert alert-danger">{{ error }}</div>
        <div v-if="message" class="alert alert-warning py-2 mb-3">{{ message }}</div>

        <form @submit.prevent="handleSubmit" novalidate class="row g-3">
          <div class="col-12">
            <label class="form-label">Tên loại <span class="text-danger">*</span></label>
            <input
              v-model.trim="form.name"
              type="text"
              class="form-control"
              placeholder="VD: Điện thoại, Laptop…"
              :class="{ 'is-invalid': touched.name && nameError }"
              maxlength="100"
              required
            />
            <div class="invalid-feedback" v-if="touched.name && nameError">{{ nameError }}</div>
          </div>

          <div class="col-12">
            <label class="form-label">Mô tả</label>
            <textarea v-model.trim="form.description" class="form-control" rows="3"
              placeholder="Mô tả ngắn gọn về loại hàng..."></textarea>
          </div>

          <div class="col-12 d-flex gap-2">
            <button class="btn btn-primary" :disabled="submitting">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
              {{ isEdit ? 'Cập nhật' : 'Thêm mới' }}
            </button>
            <button type="button" class="btn btn-outline-secondary" @click="resetForm()">Huỷ</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { categoryService } from '../../services/categoryService'

const route = useRoute()
const router = useRouter()
const categoryId = route.params.id
const isEdit = ref(false)

const form = ref({ name: '', description: '' })
const submitting = ref(false)
const error = ref('')
const message = ref('')
const touched = ref({ name: false })

const existing = ref([])

const nameError = computed(() => {
  const v = form.value.name?.trim() || ''
  if (!v) return 'Vui lòng nhập tên loại.'
  if (v.length > 100) return 'Tên loại tối đa 100 ký tự.'
  const dup = existing.value.find(c =>
    c.name?.trim().toLowerCase() === v.toLowerCase() &&
    (!isEdit.value || c.id !== categoryId)
  )
  if (dup) return 'Tên loại đã tồn tại.'
  return ''
})

function showMessage(msg){
  message.value = msg
  setTimeout(() => { message.value = '' }, 4000)
}

async function loadData() {
  error.value = ''
  try {
    const cats = await categoryService.getAll()
    existing.value = Array.isArray(cats) ? cats : []

    if (categoryId) {
      isEdit.value = true
      const item = await categoryService.getById(categoryId)
      if (!item) {
        showMessage('Không tìm thấy loại hàng.')
      } else {
        form.value = { name: item.name || '', description: item.description || '' }
      }
    } else {
      isEdit.value = false
    }
  } catch (e) {
    error.value = e?.message || 'Không thể tải dữ liệu.'
  }
}

async function handleSubmit() {
  touched.value.name = true
  if (nameError.value) return

  submitting.value = true
  error.value = ''
  try {
    if (isEdit.value) {
      await categoryService.update(categoryId, { ...form.value })
    } else {
      await categoryService.create({ ...form.value }) // <-- tạo đúng payload
    }
    router.push('/category')
  } catch (e) {
    error.value = e?.response?.data?.message || e.message || 'Lưu thất bại.'
  } finally {
    submitting.value = false
  }
}

function resetForm(){
  form.value = { name: '', description: '' }
  touched.value.name = false
}

onMounted(loadData)
</script>

<style scoped>
.card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
