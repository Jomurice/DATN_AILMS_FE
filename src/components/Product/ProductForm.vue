<template>
  <div class="row  justify-content-center">
    <div class="card rounded-4 p-3 w-75">

      <div class="d-flex align-items-center justify-content-between">
        <h4 class="fw-bold mb-0">{{ isEdit ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới' }}</h4>
        <button class="btn btn-outline-secondary" @click="$router.push('/product')"> ← Quay lại</button>
      </div>

      <div>
        <div class="card-body">
          <div v-if="error" class="alert alert-danger">{{ error }}</div>

          <form @submit.prevent="submitForm" class="row g-3">
            <div class="col-md-4">
              <label class="form-label">Mã SKU <span class="text-danger">*</span></label>
              <input v-model.trim="form.sku" class="form-control" required />
            </div>

            <div class="col-md-8">
              <label class="form-label">Tên sản phẩm <span class="text-danger">*</span></label>
              <input v-model.trim="form.name" class="form-control" :class="{ 'is-invalid': touched.name && nameError }"
                maxlength="255" required />
              <div class="invalid-feedback" v-if="touched.name">{{ nameError }}</div>
            </div>

            <div class="col-md-4">
              <label class="form-label">Thương hiệu <span class="text-danger">*</span></label>
              <select v-model="categoryBrand.brandId" class="form-select"
                :class="{ 'is-invalid': touched.brandId && brandError }">
                <option value="">-- Thương hiệu --</option>
                <option v-for="b in brands" :key="b.id" :value="b.id">{{ b.name }}</option>
              </select>
              <div class="invalid-feedback" v-if="touched.brand && brandError">{{ brandError }}</div>
            </div>

            <div class="col-md-4">
              <label class="form-label">Màu sắc <span class="text-danger">*</span></label>
              <input v-model.trim="form.color" class="form-control"
                :class="{ 'is-invalid': touched.color && colorError }" />
              <div class="invalid-feedback" v-if="touched.color && colorError">{{ colorError }}</div>
            </div>

            <div class="col-md-4">
              <label class="form-label">Lưu trữ (Dung lượng)</label>
              <input v-model.trim="form.storage" class="form-control" />
            </div>

            <div class="col-md-4">
              <label class="form-label">Loại (Category) <span class="text-danger">*</span></label>
              <select v-model="categoryBrand.categoryId" class="form-select"
                :class="{ 'is-invalid': touched.categoryId && categoryError }">
                <option value="">-- Chọn loại --</option>
                <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
              <div class="invalid-feedback" v-if="touched.categoryId && categoryError">{{ categoryError }}</div>
            </div>

            <div class="col-md-4">
              <label for="txtThuoctinh">Thuộc tính khác:</label>
              <p class="addAttribute" @click="isModal = true">+ Thêm thuộc tính</p>
            </div>

            <div class="col-12">
              <label class="form-label">Thông số kỹ thuật</label>
              <textarea v-model.trim="form.specifications" class="form-control" rows="4" maxlength="1000"
                placeholder="VD: CPU..., RAM..., SSD..., Màn..."></textarea>
            </div>

            <div class="col-12 d-flex gap-2">
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
                {{ isEdit ? 'Cập nhật' : 'Thêm mới' }}
              </button>
              <button type="button" class="btn btn-outline-secondary" @click="$router.push('/product')">Huỷ</button>
            </div>
          </form>
        </div>
      </div>

      <attribute v-if="isModal" @close="isModal = false" />

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { productService } from '../../services/productService'
import { categoryService } from '../../services/categoryService'

import { brandService } from '../../services/BrandService'
import Attribute from './Attribute.vue'

const route = useRoute();
const router = useRouter();
const productId = route.params.id;
const isEdit = ref(false);
const isModal = ref(false);

const categories = ref();
const brands = ref();
const categoryBrand = ref({ categoryId: '', brandId: '' });
const form = ref({ sku: '', name: '', brandId: '', specifications: '', color: '', storage: '', categoryId: '' })
const submitting = ref(false)
const error = ref('')
const touched = ref({ brand: false, name: false, brandId: false, color: false, categoryId: false })

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
const categoryError = computed(() => (form.value.categoryId ? '' : 'Vui lòng chọn loại sản phẩm.'))

async function loadData() {
  categories.value = await categoryService.getAll();
  brands.value = await brandService.getAllBrand();
  if (productId) {
    isEdit.value = true
    const p = await productService.getById(productId)
    if (p) form.value = { ...form.value, ...p }
  } else {
    isEdit.value = false
  }
}

async function submitForm() {

  // touched.value = { brand: true, name: true, color: true, categoryId: true }
  // if (brandError.value || colorError.value || nameError.value || categoryError.value) return
  // submitting.value = true; error.value = ''
  submitting.value = true;
  try {
    if (isEdit.value) await productService.update(productId, { ...form.value })
    else {
      form.value.categoryId = await categoryService.createCategoryBrand(categoryBrand.value);
      await productService.create({ ...form.value })
    }
    console.log(form.value);
    router.push('/product')
  } catch (e) {
    error.value = 'Lưu thất bại.'
    console.log("error", e);

  } finally {
    submitting.value = false
  }

}



onMounted(loadData)
</script>

<style>
.addAttribute {
  cursor: pointer !important;
}
</style>
