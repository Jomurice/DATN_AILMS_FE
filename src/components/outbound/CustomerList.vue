<template>
    <div class="container-fluid">

        <div class="d-flex justify-content-end align-items-center m-2 gap-2">

            <div>
                <button class="btn btn-outitem-primary btn-success" title="Thêm khách hàng mới"
                    @click="showCustomerForm = true">+ Thêm mới</button>
            </div>

            <div class="btn border-primary btn-outitem-primary btn-sm">
                <label for="file" class="m-0"><i class="fas fa-file-import"></i> Excel/CSV</label>
                <input id="file" type="file" accept=".xlsx,.xls,.csv" @change="onImport" hidden />
            </div>
        </div>

        <!-- TABLE CARD -->
        <div class="card shadow-sm rounded-4 p-3 border-0">
            <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <span class="fw-semibold">Tổng: {{ pages.totalElements || 0 }} Khách hàng</span>
                <div class="d-flex align-items-center gap-2 flex-wrap">

                    <!-- Filter -->
                    <div class="d-flex align-items-center gap-1">
                        <select v-model="payload.status" @change="onFilterChange" class="form-select form-select-sm"
                            style="min-width: 150px;">
                            <option :value="null">Tất cả</option>
                            <option :value="true">Hoạt động</option>
                            <option :value="false">Không hoạt động</option>
                        </select>
                    </div>

                    <!-- Search -->
                    <div class="d-flex align-items-center gap-1">
                        <input v-model.trim="payload.search" @input="onSearchInput" type="text"
                            class="form-control form-control-sm" placeholder="Tìm theo tên hoặc số điện th..."
                            style="min-width: 200px;" />
                    </div>

                    <!-- Page size -->
                    <div class="d-flex align-items-center gap-1">
                        <select v-model.number="payload.pageable.size" @change="onChangePageSize"
                            class="form-select form-select-sm" style="min-width: 80px;">
                            <option v-for="n in [10, 20, 50, 100]" :key="n" :value="n">{{ n }}</option>
                        </select>
                    </div>

                </div>
            </div>

            <!-- TABLE -->
            <div class="table-responsive">
                <table class="table table-hover table-bordered align-middle text-center" style="min-width: 1200px;">
                    <thead class="table-light sticky-top">
                        <tr>
                            <th>STT</th>
                            <th>Họ và tên</th>
                            <th>Giới Tính</th>
                            <th>Email</th>
                            <th>SĐT</th>
                            <th>Địa Chỉ</th>
                            <th>Trạng Thái</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(c, index) in customers" :key="c.id">
                            <td>{{ payload.pageable.page * payload.pageable.size + index + 1 }}</td>
                            <td class="text-break">{{ c.lastName }} {{ c.firstName }}</td>
                            <td class="text-break">{{ c.gender ? 'Nam' : 'Nữ' }}</td>
                            <td class="text-break">{{ c.email }}</td>
                            <td class="text-break">{{ c.phone }}</td>
                            <td class="text-break">{{ c.address }}</td>
                            <td>
                                <span :class="['badge', c.status ? 'bg-success' : 'bg-secondary']">
                                    {{ c.status ? 'Hoạt Động' : 'Không Hoạt Động' }}
                                </span>
                            </td>
                            <td class="d-flex justify-content-center gap-2">
                                <button class="btn btn-sm btn-outline-warning" @click="editCustomer(c)">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm"
                                    :class="c.status ? 'btn-outline-danger' : 'btn-outline-success'"
                                    @click="toggleStatus(c)">
                                    <i :class="c.status ? 'fas fa-user-slash' : 'fas fa-user-check'"></i>
                                </button>
                            </td>
                        </tr>
                        <tr v-if="!loading && customers.length === 0">
                            <td colspan="9" class="text-center text-muted py-4">Không có dữ liệu</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <nav class="d-flex justify-content-center align-items-center mt-3 gap-2 flex-wrap">
                <button class="btn btn-outline-primary btn-sm" :disabled="pages.number === 0"
                    @click="changePage(pages.number - 1)">
                    &lt;
                </button>
                <button v-for="page in pageNumbers" :key="page" class="btn btn-sm"
                    :class="page === pages.number ? 'btn-primary text-white' : 'btn-outline-primary'"
                    @click="changePage(page)">
                    {{ page + 1 }}
                </button>
                <button class="btn btn-outline-primary btn-sm" :disabled="pages.number === pages.totalPages - 1"
                    @click="changePage(pages.number + 1)">
                    &gt;
                </button>
            </nav>

        </div>

        <!-- LOADING -->
        <div v-if="loading" class="text-center my-3">
            <div class="spinner-border text-info" role="status"></div>
        </div>

        <div v-if="showCustomerForm" class="modal-overlay">
            <CustomerForm :customerId="editingCustomerId" @save="handleCustomerSave" @cancel="handleCancel" />
        </div>


    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { customerService } from '../../services/outbound/CustomerService';
import CustomerForm from './CustomerForm.vue';

const payload = ref({
    search: '',
    status: null,
    pageable: { page: 0, size: 10, sort: 'firstName,asc' }
});

const customers = ref([]);
const pages = ref({ number: 0, totalPages: 1, totalElements: 0 });
const loading = ref(false);
const showForm = ref(false);
const editingCustomerId = ref(null);
const showCustomerForm = ref(false);
const errors = ref({});

const pageNumbers = computed(() => {
    const total = pages.value.totalPages;
    const current = pages.value.number;
    const result = [];
    const start = Math.max(current - 2, 0);
    const end = Math.min(current + 2, total - 1);
    for (let i = start; i <= end; i++) result.push(i);
    return result;
});

// function handleCustomerSave() {
//     showCustomerForm.value = false;
// }

function handleCancel() {
    showCustomerForm.value = false;
    loadCustomers();
}


async function loadCustomers() {
    loading.value = true;
    try {
        const res = await customerService.getAll({
            page: payload.value.pageable.page,
            size: payload.value.pageable.size,
            search: payload.value.search || null,
            status: payload.value.status
        });
        customers.value = res.content ?? [];
        pages.value = res;
    } catch (e) { console.error(e); }
    finally { loading.value = false; }
}

function changePage(newPage) { if (newPage < 0 || newPage >= pages.value.totalPages) return; payload.value.pageable.page = newPage; loadCustomers(); }
function onChangePageSize() { payload.value.pageable.page = 0; loadCustomers(); }
function onSearchInput() { payload.value.pageable.page = 0; loadCustomers(); }
function onFilterChange() { payload.value.pageable.page = 0; loadCustomers(); }

function editCustomer(c) {
    editingCustomerId.value = c.id; 
    showCustomerForm.value = true;  
    errors.value = {};
}

async function toggleStatus(c) { try { await customerService.active(c.id); loadCustomers(); } catch (e) { console.error(e); } }

function formatDate(date) { if (!date) return '-'; const d = new Date(date); return d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', { hour12: false }); }

onMounted(loadCustomers);
</script>

<style scoped>
.table-hover tbody tr:hover {
    background-color: #f0f8ff;
}

.text-break {
    white-space: normal !important;
    word-break: break-word;
}

.fade-enter-active,
.fade-leave-active {
    transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

.btn {
    max-width: 130px;
    max-height: 40px;
    padding: 8px 12px;
    border-radius: 10px;
    cursor: pointer;
    font-size: 15px;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}
</style>
