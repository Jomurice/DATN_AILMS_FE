<template>
    <div class="container">
        <div class="row w-100 justify-content-center">
            <div class="card border-0 rounded-4">

                <div class="d-flex justify-content-between align-items-center">
                    <h2 class="mb-0 mt-3">Inbound Product</h2>

                    <button class="scan btn btn-light border-0 p-0 me-2 mt-2" @click="openCamera">
                        <img src="../../assets/scan.png" alt="Scan QR" />
                    </button>
                </div>

                <div class="card-body p-4">
                    <form @submit.prevent="handleSubmit">
                        <div class="mb-3">
                            <label class="form-label fw-bold">Số seri</label>
                            <input type="text" v-model="form.serialNumber" class="form-control rounded-3" required />
                        </div>

                        <div class="mb-3">
                            <label class="form-label fw-bold">Tên sản phẩm</label>
                            <input type="text" v-model="form.productName" class="form-control rounded-3" required />
                        </div>

                        <div class="mb-3">
                            <label class="form-label fw-bold">Số lượng</label>
                            <input type="number" v-model="form.quantity" class="form-control rounded-3" min="1" />
                        </div>

                        <div class="mb-3">
                            <label class="form-label fw-bold">Loại sản phẩm</label>
                            <select v-model="form.category" class="form-select rounded-3">
                                <option disabled value="">Chọn loại</option>
                                <option>Laptop</option>
                                <option>Mainboard</option>
                                <option>Chip</option>
                            </select>
                        </div>

                        <div class="mb-3">
                            <label class="form-label fw-bold">Ghi chú</label>
                            <textarea v-model="form.notes" class="form-control rounded-3" rows="3"></textarea>
                        </div>

                        <div class="d-flex gap-3">
                            <button type="submit" class="btn btn-primary btn-lg rounded-3 shadow-sm">Thêm</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";

const form = reactive({
    serialNumber: "",
    productName: "",
    category: "",
    quantity: 1,
    notes: "",
});


function handleSubmit() {
    console.log("Inbound Product:", form);
    alert("Product saved successfully!");
}

</script>

<style scoped>
.card {
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.scan img {
    width: 30px;
    height: 30px;
}

h2 {
    width: 100%;
    font-size: 20px;
    font-weight: bold;
}

@media (min-width: 1028px) {
    .scan {
        display: none;
    }

    h2 {
        text-align: center;
        font-size: 35px;
    }
}
</style>
