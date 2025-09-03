
<template>
  <div class="container py-5" style="max-width: 720px;">
    <div class="d-flex align-items-center justify-content-between mb-4">
      <h4 class="fw-bold mb-0">{{ isEdit ? 'Cập nhật loại' : 'Thêm loại mới' }}</h4>
      <div>
        <button class="btn btn-outline-secondary" @click="$router.push('/categories')">← Quay lại</button>
      </div>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-body p-4">
        <div v-if="error" class="alert alert-danger">{{ error }}</div>
        <form @submit.prevent="submitForm" novalidate>
          <div class="mb-3">
            <label class="form-label">Tên loại <span class="text-danger">*</span></label>
            <input
              v-model.trim="form.name"
              type="text"
              class="form-control"
              placeholder="VD: Laptop, Ultrabook..."
              :class="{'is-invalid': touched.name && nameError}"
              maxlength="100"
              required
            />
            <div class="invalid-feedback" v-if="touched.name && nameError">
              {{ nameError }}
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Mô tả</label>
            <textarea
              v-model.trim="form.description"
              class="form-control"
              rows="3"
              placeholder="Mô tả ngắn gọn về loại hàng..."
            ></textarea>
          </div>

          <div class="d-flex gap-2">
            <button class="btn btn-primary" :disabled="submitting">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
              {{ isEdit ? 'Cập nhật' : 'Thêm mới' }}
            </button>
            <button type="button" class="btn btn-outline-secondary" @click="$router.push('/categories')">Huỷ</button>
          </div>
        </form>
      </div>
    </div>

    <div class="small text-muted mt-3">
      
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { categoryService } from '../../services/categoryService';

const route = useRoute();
const router = useRouter();

const isEdit = computed(() => !!route.params.id);
const form = ref({ name: '', description: '' });
const submitting = ref(false);
const error = ref('');
const touched = ref({ name: false });

const existing = ref([]); 

const nameError = computed(() => {
  const v = form.value.name?.trim() || '';
  if (!v) return 'Vui lòng nhập tên loại.';
  if (v.length > 100) return 'Tên loại tối đa 100 ký tự.';
  
  const dup = existing.value.find(c =>
    c.name?.trim().toLowerCase() === v.toLowerCase() &&
    (!isEdit.value || c.id !== route.params.id)
  );
  if (dup) return 'Tên loại đã tồn tại.';
  return '';
});

async function loadData() {
  const cats = await categoryService.list();
  existing.value = cats;

  if (isEdit.value) {
    const item = await categoryService.getById(String(route.params.id));
    if (!item || !item.id) {
      error.value = 'Không tìm thấy loại hàng.';
      return;
    }
    form.value = {
      name: item.name ?? '',
      description: item.description ?? ''
    };
  }
}

async function submitForm() {
  touched.value.name = true;
  if (nameError.value) return;

  submitting.value = true;
  error.value = '';
  try {
    if (isEdit.value) {
      await categoryService.update(String(route.params.id), { ...form.value });
    } else {
      await categoryService.create({ ...form.value });
    }
    router.push('/categories');
  } catch (e) {
    error.value = e?.response?.data?.message || e.message || 'Lưu thất bại.';
  } finally {
    submitting.value = false;
  }
}

onMounted(loadData);
</script>
