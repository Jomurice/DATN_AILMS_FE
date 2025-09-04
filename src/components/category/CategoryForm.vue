<template>
  <div class="container py-5 w-75">

    <div class="card border-0 shadow-sm">
      <div class="d-flex align-items-center justify-content-between m-4">
        <h4 class="fw-bold mb-0">{{ isEdit ? 'Cập nhật loại' : 'Thêm loại mới' }}</h4>
        <div>
          <button class="btn btn-outline-secondary" @click="$router.push('/category')">← Quay lại</button>
        </div>
      </div>

      <div class="card-body p-4">
        <div v-if="error" class="alert alert-danger">{{ error }}</div>
        <form @submit.prevent="handleSubmit" novalidate>
          <div class="mb-3">
            <label class="form-label">Tên loại <span class="text-danger">*</span></label>
            <input v-model.trim="form.name" type="text" class="form-control" placeholder="VD: Laptop, Ultrabook..."
              :class="{ 'is-invalid': touched.name && nameError }" maxlength="100" required />
            <div class="invalid-feedback" v-if="touched.name && nameError">{{ nameError }}</div>
          </div>

          <div class="mb-3">
            <label class="form-label">Mô tả</label>
            <textarea v-model.trim="form.description" class="form-control" rows="3"
              placeholder="Mô tả ngắn gọn về loại hàng..."></textarea>
          </div>
          <span v-if="message" class="text-danger">{{ message }}</span>

          <div class="d-flex gap-2">
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
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { categoryService } from '../../services/categoryService';

const route = useRoute();
const router = useRouter();
const categoryId = route.params.id;
const isEdit = ref(false);
const form = ref({ name: '', description: '' });
const submitting = ref(false);
const message = ref('');
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

const showMessage = (msg) =>{
  message.value = msg;
  setTimeout(() => {
    message.value = ''
  },5000);
}

async function loadData() {

  if (categoryId != null) {
    isEdit.value = true;
    try {
    form.value = await categoryService.getById(categoryId);
    } catch (error) {
      console.log("error",error);
      showMessage('Không tìm thấy loại hàng. Vui lòng thử lại sau.');
    }
  }else{
    const cats = await categoryService.getAll();
    existing.value = cats;
    isEdit.value = false;
  }
}

async function handleSubmit() {
  touched.value.name = true;
  if(nameError.value) return;

  if(categoryId){
    update();
  }else{
    try { 
      await categoryService.create(...form.value);
      resetForm();
      router.push('/category');
    } catch (error) {
      console.log("error",error);
      showMessage('Thêm mới thất bại. Vui lòng thử lại sau !');
    }
  }
  
}

async function update() {
  try {
    await categoryService.update(categoryId,{...form.value});
    resetForm();
    router.push('/category');
  } catch (error) {
     console.log("error",error);
    showMessage('Sửa thất bại. Vui lòng thử lại sau !');
  }
}

function resetForm(){
  form.value.name = '';
  form.value.description = '';
}

onMounted(loadData);
</script>

<style scoped>
.card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
