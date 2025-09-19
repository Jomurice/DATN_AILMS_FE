<template>
    <div>
        <div class="d-flex mb-2 align-items-center justify-content-between">
            <div class="search">
                <input type="text" class="form-control  rounded-3" placeholder="Nhập tên hàng hóa muốn tìm">
            </div>

            <h2>Đặt hàng hóa</h2>

            <div></div>
        </div>

        <div class="d-flex gap-2">

            <div class="card rounded-3 col-md-5 p-2">
                <div class="d-flex flex-wrap justify-content-between">
                    <div v-for="p in products" :key="p.id" :title="p.name" @click="addProduct(p)"
                        class="list rounded-3  m-2 px-2">
                        {{ p.name }}
                    </div>
                </div>
            </div>

            <div class="card rounded-3 order col-md-7 d-flex order p-3">
                <div v-for="(o, index) in items" class="d-flex justify-content-between">
                    <p>{{ index + 1 }}</p>
                    <p class="sku">{{ o.sku }}</p>
                    <p class="name"> {{ o.name }}</p>
                    <nav class="quantity">
                        <span @click="o.quantity = Math.max(1, o.quantity - 1)"> - </span>
                        <input type="text" v-model.number="o.quantity" min="1">
                        <span @click="o.quantity++"> + </span>
                    </nav>
                    <p @click="deleteProduct(o.id)"><i class="fa-solid fa-trash"></i></p>
                </div>

                <div class="d-flex justify-content-end mt-3">
                    <button @click="order()" :class="items.length > 0
                        ? 'border rounded-3 btn btn-success'
                        : 'border rounded-3 btn btn-secondary'" :disabled="items.length === 0">
                        Đặt hàng
                    </button>
                </div>
            </div>

            <div v-if="isLoading" class="modal-overlay text-center py-5">
                <div class="spinner-border text-info" role="status"></div>
                <div class="small mx-2 fs-5 text-info mt-2">Đang tải...</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { productService } from '../../services/productService';

const products = ref([]);
const items = ref([]);
const isLoading = ref(false);


async function load() {
    isLoading.value = true;
    
    try {
        products.value = await productService.getAll();
        items.value = JSON.parse(localStorage.getItem("listOrder")) || [];
    } catch (error) {
        console.log("error", error);
    } finally {
        isLoading.value = false;
    }
}

async function order(item) {
    const payload = { productId: item.id, orderQuantity: item.quantity };

    try {

    } catch (error) {
        console, log("error", error);
    }
}

function addProduct(product) {
    const existing = items.value.find(p => p.id === product.id);

    if (existing) {
        existing.quantity++;
    } else {
        items.value.push({
            id: product.id,
            sku: product.sku,
            name: product.name,
            quantity: 1
        });
    }

    localStorage.setItem("listOrder", JSON.stringify(items.value));
}


function deleteProduct(id) {
    items.value = items.value.filter(p => p.id !== id);
    localStorage.setItem("listOrder", JSON.stringify(items.value));
    load();
}

onMounted(() => {
    load();
})

watch(items, (newItems) => {
    localStorage.setItem("listOrder", JSON.stringify(newItems));
}, { deep: true });

</script>

<style scoped>

.search{
    display: block;
    text-overflow: ellipsis;
    white-space: normal;
    width: 18%;
}

.form-control {
  border: none;
  border-radius: 10px;
}

.list {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 180px;
    height: 55px;
    white-space: normal;
    border: 1px solid rgb(199, 199, 199);
    cursor: pointer;
    padding: 4px;
}

.list:hover {
    border: 1px solid blue;

}

.order {
    overflow: auto;
    height: calc(100vh - 200px);
}

.name {
    width: 230px;
}

.sku {
    width: 150px;
}

h2 {
    margin-right: 300px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  background: rgba(0, 0, 0, 0.147);
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.quantity>input {
    width: 30px;
    height: 25px;
    text-align: center;
    border: 0;
}

.quantity>span {
    cursor: pointer;
    font-size: 23px;
}

i:hover {
    color: blue;
    cursor: pointer;
}
</style>