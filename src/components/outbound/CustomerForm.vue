<template>
    <div class="w-50 bg-white rounded-4 shadow">
        <div class="bg-primary text-white p-2 rounded-top d-flex justify-content-between align-items-center">
            <h4 class="m-0">Thêm / Sửa thông tin khách hàng</h4>
            <button class="btn btn-sm btn-light" @click="$emit('cancel')">Đóng</button>
        </div>

        <!-- Form -->
        <form action="" @submit.prevent="handleSubmit">
            <div class="p-4 row g-4">
                <!-- Họ -->
                <div class="col-md-6">
                    <label for="lastName" class="form-label">Họ:<span class="text-danger">*</span></label>
                    <input type="text" id="lastName" v-model="customer.lastName" class="form-control"
                        placeholder="Nhập họ" />
                </div>

                <!-- Tên -->
                <div class="col-md-6">
                    <label for="firstName" class="form-label">Tên:<span class="text-danger">*</span></label>
                    <input type="text" id="firstName" v-model="customer.firstName" class="form-control"
                        placeholder="Nhập tên" />
                </div>

                <!-- Giới tính -->
                <div class="col-md-6">
                    <label class="form-label">Giới tính:<span class="text-danger">*</span></label>
                    <div class="d-flex gap-3">
                        <label class="form-check">
                            <input class="form-check-input" type="radio" v-model="customer.gender" :value="true" />
                            <span>Nam</span>
                        </label>

                        <label class="form-check">
                            <input class="form-check-input" type="radio" v-model="customer.gender" :value="false" />
                            <span>Nữ</span>
                        </label>
                    </div>
                </div>

                <!-- Ngày sinh -->
                <div class="col-md-6">
                    <label for="dob" class="form-label">Ngày sinh:</label>
                    <input type="date" id="dob" v-model="customer.dob" class="form-control" />
                </div>

                <!-- Phone -->
                <div class="col-md-6">
                    <label for="phone" class="form-label">Số điện thoại:<span class="text-danger">*</span></label>
                    <input type="text" id="phone" v-model="customer.phone" class="form-control"
                        placeholder="Nhập số điện thoại" />
                </div>

                <!-- Email -->
                <div class="col-md-6">
                    <label for="email" class="form-label">Email:<span class="text-danger">*</span></label>
                    <input type="email" id="email" v-model="customer.email" class="form-control"
                        placeholder="Nhập email" />
                </div>

                <!-- Address -->
                <div>
                    <label for=" address" class="form-label">Địa chỉ:<span class="text-danger">*</span></label>
                    <textarea type="text" id="address" rows="3" v-model="customer.address" class="form-control"
                        placeholder="Nhập địa chỉ" />
                </div>

                <div v-if="toastMessage.message" :class="{
                    'toast-success': toastMessage.type === 'success',
                    'toast-error': toastMessage.type === 'error',
                    'toast-warning': toastMessage.type === 'warning',
                    'toast-info': toastMessage.type === 'info'
                }">
                    {{ toastMessage.message }}
                </div>
            </div>



            <!-- Buttons -->
            <div class="p-3 text-end">
                <button class="btn btn-primary" :disabled="submitting" type="submit">
                    <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
                    <i class="fas fa-save"></i> Lưu
                </button>
                <button class="btn btn-secondary ms-2" @click="$emit('cancel')">Hủy</button>
            </div>
        </form>
    </div>

    <!-- <transition name="fade">
        <div v-if="toast.message" class="toast-box" :class="{
            'toast-success': toast.type === 'success',
            'toast-error': toast.type === 'error',
            'toast-warning': toast.type === 'warning',
            'toast-info': toast.type === 'info'
        }">
            {{ toast.message }}
        </div>
    </transition> -->
</template>


<script setup>
import { ref, defineProps, onMounted } from 'vue';
import { customerService } from '../../services/outbound/CustomerService';
import { toast } from 'vue-sonner';
const emit = defineEmits(['save', 'cancel']);

const props = defineProps({
    customerId: {
        type: String,
        default: null
    }
});

const toastMessage = ref({
    message: "",
    type: ""
});

const submitting = ref(false);
const error = ref(null);
const customer = ref({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: null,
    gender: true,
    address: ''
});

function resetForm() {
    customer.value = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dob: null,
        gender: true,
        address: ''
    };
    error.value = null;
}

function showToast(message, type = "info") {
    toastMessage.value.message = message;
    toastMessage.value.type = type;

    setTimeout(() => {
        toastMessage.value.message = "";
        toastMessage.value.type = "";
    }, 3000);
}


async function handleSubmit() {
    if (!customer.value.firstName || !customer.value.lastName || !customer.value.email || !customer.value.phone || !customer.value.address) {
            
        return toast.error('Vui lòng điền đầy đủ thông tin !');;
    }
    const vietnamPhoneRegex = /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5]|9[0-9])[0-9]{7}$/
    if (/\d/.test(customer.value.lastName) || /\s/.test(customer.value.lastName)) return showToast('Họ không được chứa khoảng trắng và số !', 'error');
    if (!vietnamPhoneRegex.test(customer.value.phone)) return showToast('Số điện thoại không hợp lệ !', 'error');


    submitting.value = true;
    try {
        let result;

        if (props.customerId) {
            result = await customerService.update(props.customerId, customer.value);
        } else {
            result = await customerService.create(customer.value);
        }

        emit('save', result);
        // showToast('Lưu thông tin khách hàng thành công!', 'success');
        toast.success('Lưu thông tin khách hàng thành công!');
        resetForm();
    } catch (error) {
        console.error('Error saving customer:', error);
        const errorMessage = error.response?.data?.message || 'Đã xảy ra lỗi khi lưu thông tin khách hàng.';
        if(errorMessage == 'Phone already exists') {
            toast.error('Số điện thoại đã tồn tại!');
            showToast('Số điện thoại đã tồn tại!', 'error');
            toast.error('Số điện thoại đã tồn tại!');
        }else if(errorMessage == 'Email already exists') {
            showToast('Email đã tồn tại!', 'error');
            toast.error('Email đã tồn tại!');
        }else {
            showToast(errorMessage, 'error');
            toast.error(errorMessage);
        }
        
    } finally {
        submitting.value = false;
    }
}



async function loadCustomer(id) {
    try {
        const data = await customerService.getById(id);
        Object.assign(customer.value, data);
    } catch (error) {
        console.error('Error loading customer:', error);
        toast.error('Không thể tải thông tin khách hàng.');
    }
}

onMounted(() => {
    if (props.customerId) {
        loadCustomer(props.customerId);
    }

    setTimeout(() => {
        error.value = "";
    }, 300);
});
</script>

<style scoped>
.toast-box {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 16px;
    border-radius: 8px;
    color: white;
    z-index: 9999;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    font-weight: 500;
    min-width: 200px;
    text-align: center;
}

/* Màu theo trạng thái */
.toast-success {
    color: #28a745;
}

.toast-error {
    color: #dc3545;
}

.toast-warning {
    color: black;
}

.toast-info {
    color: #17a2b8;
}

/* Fade animation */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
