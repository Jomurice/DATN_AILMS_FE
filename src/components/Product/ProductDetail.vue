<!-- src/components/Product/ProductForm.vue -->
<template>
  <div class="container py-5" style="max-width: 900px;">
    <div class="d-flex align-items-center justify-content-between mb-4">
      <h4 class="fw-bold mb-0">{{ isEdit ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới' }}</h4>
      <button class="btn btn-outline-secondary" @click="$router.push('/product')"> ← Quay lại</button>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-body p-4">
        <div v-if="error" class="alert alert-danger">{{ error }}</div>

        <form @submit.prevent="submitForm" novalidate class="row g-3">
          <div class="col-md-4">
            <label class="form-label">Mã SKU <span class="text-danger">*</span></label>
            <input v-model.trim="form.sku" class="form-control" required/>
          </div>

          <div class="col-md-8">
            <label class="form-label">Tên sản phẩm <span class="text-danger">*</span></label>
            <input v-model.trim="form.name" class="form-control"
            :class="{'is-invalid': touched.productId && nameError}" required/>
            <div class="invalid-feedback" v-if="touched.name">{{ nameError }}</div>
          </div>

          <div class="col-md-4">
            <label class="form-label">Thương hiệu <span class="text-danger">*</span></label>
            <input v-model.trim="form.brand"
            :class="{'is-invalid': touched.productId && brandError}" class="form-control" />
            <div class="invalid-feedback" v-if="touched.brand && brandError">{{ brandError }}</div>
          </div>

          <div class="col-md-4">
            <label class="form-label">Màu sắc <span class="text-danger">*</span></label>
            <input v-model.trim="form.color"
            :class="{'is-invalid': touched.productId && colorError}" class="form-control" />
            <div class="invalid-feedback" v-if="touched.color && colorError">{{ colorError }}</div>
          </div>

          <div class="col-md-4">
            <label class="form-label">Lưu trữ</label>
            <input v-model.trim="form.storage" class="form-control" />
          </div>

          <div class="col-md-6">
            <label class="form-label">Loại (Category) <span class="text-danger">*</span></label>
            <select v-model="form.categoryId" class="form-select" :class="{'is-invalid': touched.categoryId && categoryError}">
              <option value="">-- Chọn loại --</option>
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
            <div class="invalid-feedback" v-if="touched.categoryId && categoryError">{{ categoryError }}</div>
          </div>

          <div class="col-12">
            <label class="form-label">Thông số kỹ thuật</label>
            <textarea v-model.trim="form.specifications" class="form-control" rows="4" maxlength="1000"
              placeholder="VD: CPU..., RAM..., SSD..., Màn..."></textarea>
          </div>

          <div class="col-12 d-flex gap-2">
            <button class="btn btn-primary" :disabled="submitting">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
              {{ isEdit ? 'Cập nhật' : 'Thêm mới' }}
            </button>
            <button type="button" class="btn btn-outline-secondary" @click="$router.push('/product')">Huỷ</button>
          </div>
        </form>
      </div>
    </div>

    <div class="small text-muted mt-3"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { productService } from '../../services/productService'; 
import { categoryService } from '../../services/categoryService';

const route = useRoute();
const router = useRouter();
const productId = route.params.id;
const isEdit = ref(false);
const categories = ref([]);
const form = ref({
  sku: '', name: '', brand: '', specifications: '', color: '', storage: '', categoryId: ''
});
const submitting = ref(false);
const error = ref('');
const touched = ref({ brand: false, name: false, color:false, categoryId: false });


const nameError = computed(() => {
  const v = form.value.name?.trim() || ''
  if (!v) return 'Vui lòng nhập tên sản phẩm.'
  if (v.length > 200) return 'Tên tối đa 200 ký tự.'
  return ''
})

const brandError = computed(() => {
  const v = form.value.brand?.trim() || ''
  if (!v) return 'Vui lòng nhập nhãn hiệu.'
  if (v.length > 50) return 'Nhãn hiệu tối đa 50 ký tự.'
  return ''
})

const colorError = computed(() => {
  const v = form.value.color?.trim() || ''
  if (!v) return 'Vui lòng nhập màu sắc.'
  if (v.length > 50) return 'Màu sắc tối đa 50 ký tự.'
  return ''
})

const categoryError = computed(() => {
  const v = form.value.categoryId || ''
  if (!v) return 'Vui lòng chọn loại sản phẩm.'
  return ''
})

async function loadData() {
  categories.value = await categoryService.getAll();
  if (productId != null) {
    isEdit.value = true;
    try {
      form.value  = await productService.getById(productId);
    } catch (error) {
      console.log("error",error);
    }
  }else{
    isEdit.value = false;
  }
}


async function submitForm() {
  touched.value = { brand: true, name: true, color: true, categoryId: true };
  console.log(touched.value)
  console.log(nameError.value)
  if (brandError.value || colorError.value || nameError.value || categoryError.value) return;

  submitting.value = true; error.value = ''
  try {
    if (isEdit.value) {
      await productService.update(productId, { ...form.value })
    } else {
      await productService.create({ ...form.value })
    }
    router.push('/product')
  } catch (e) {
    error.value = e?.response?.data?.message || e.message || 'Lưu thất bại.'
  } finally {
    submitting.value = false
  }
}

onMounted(loadData)
</script>
