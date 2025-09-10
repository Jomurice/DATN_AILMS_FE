<template>
    <div class="container m-0 p-4">
        <div class=" account-form col-md-8">
            <h2>{{ isEdit ? 'Sửa thông tin người dùng' : 'Thêm người dùng' }}</h2>
            <form @submit.prevent="submit()">

                <div v-if="isEdit === false">
                    <label for="txtUsername">Tên đăng nhập : </label>
                    <input v-model="form.username" class="form-control"
                        :class="{ 'is-invalid': touched.name && usernameError }" placeholder="Tên đăng nhập" required />
                    <span class="invalid-feedback" v-if="touched.name && usernameError">{{ usernameError }}</span>
                </div>

                <div>
                    <label for="txtFullName">Họ và tên : </label>
                    <input v-model="form.name" class="form-control" placeholder="Họ và tên" required />
                </div>

                <div>
                    <label for="txtEmail">Email : </label>
                    <input type="email" v-model="form.email" class="form-control" placeholder="Email" required />
                </div>

                <div v-if="isEdit === false">
                    <label for="txtPassword">Mật khẩu : </label>
                    <input type="password" v-model="form.password" class="form-control"
                        :class="{ 'is-invalid': touched.name && message }" placeholder="Mật khẩu " min="" required />
                    <span class="invalid-feedback" v-if="touched.name && message">{{ message }}</span>

                </div>


                <div>
                    <label for="txtPhone">Số điện thoại : </label>
                    <input v-model="form.phone" class="form-control" placeholder="Số điện thoại" required />
                </div>

                <div>
                    <label for="txtdob">Ngày sinh : </label>
                    <input type="date" v-model="form.dob" class="form-control" required />
                </div>

                <div>
                    <label for="txtAddress">Địa chỉ : </label>
                    <textarea v-model="form.address" class="form-control" placeholder="Địa chỉ" rows="3" required />
                </div>

                <div>
                    <label for="txtGender" class="gender">Giới Tính : </label>
                    <input type="radio" v-model="form.gender" :value="true"> Nam
                    <input type="radio" v-model="form.gender" :value="false"> Nữ
                </div>

                <div class="d-flex gap-3">
                    <label for="txtRole">Quyền hạn :</label>
                    <nav v-for="r in roles" :key="r.name">
                        <input type="checkbox" v-model="form.roles" :value="r.name">
                        <span class="mx-1">{{ r.name }}</span>
                    </nav>

                </div>


                <div class="d-flex gap-3 mt-3">
                    <button type="submit" class="btn btn-primary">{{ isEdit ? 'Sửa' : 'Thêm' }}</button>
                    <button type="button" class="btn btn-danger" @click="Enable(form.id)">Khóa</button>
                    <button v-if="isEdit === false" type="button" class="btn btn-primary" @click="resetForm()">Làm
                        mới</button>
                </div>
            </form>
        </div>
        <div class="container py-4" style="max-width: 900px;">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h4 class="fw-bold mb-0">Chi tiết tài khoản</h4>
                <div class="d-flex gap-2">
                    <button class="btn btn-outline-primary"
                        @click="$router.push(`/admin/account/${id}/edit`)">Sửa</button>
                    <button class="btn btn-outline-secondary" @click="$router.push('/admin/account')">← Quay
                        lại</button>
                </div>
            </div>

            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border"></div>
            </div>

            <div v-else class="card section-card">
                <div class="card-body">
                    <div class="row g-3">
                        <div class="col-md-6"><b>ID:</b> {{ u.id }}</div>
                        <div class="col-md-6"><b>Tên đăng nhập:</b> {{ u.username }}</div>
                        <div class="col-md-6"><b>Họ tên:</b> {{ u.name }}</div>
                        <div class="col-md-6"><b>Email:</b> {{ u.email }}</div>
                        <div class="col-md-6"><b>Giới tính:</b> {{ u.gender ? 'Nam' : 'Nữ' }}</div>
                        <div class="col-md-6"><b>Số điện thoại:</b> {{ u.phone || '—' }}</div>
                        <div class="col-md-6"><b>Ngày sinh:</b> {{ u.dob || '—' }}</div>
                        <div class="col-md-6"><b>Trạng thái:</b> <span
                                :class="u.enabled ? 'badge bg-success' : 'badge bg-secondary'">{{ u.enabled ? 'Đang hoạt động' : 'Đã khoá' }}</span></div>
                        <div class="col-12"><b>Địa chỉ:</b> {{ u.address || '—' }}</div>
                        <div class="col-12"><b>Chức vụ:</b> <span v-for="r in (u.roles || [])" :key="r"
                                class="badge bg-info me-1">{{ r }}</span></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { userService } from "../../services/UserService";
import { roleService } from "../../services/RoleService";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const userId = route.params.id;
const isEdit = ref(false);
const message = ref('');
const existing = ref([]);
const touched = ref({ name: false });
const roles = ref([]);
const form = ref({
    id: null,
    username: '',
    name: '',
    password: '',
    gender: true,
    phone: '',
    dob: null,
    address: '',
    email: '',
    roles: []
});


const usernameError = computed(() => {

    if (form.value.username.includes(" ")) return "Tên đăng nhập k được có khoảng trắng";

    const usernameCheck = form.value.username?.trim();
    const dup = existing.value.find(n => n.username?.trim().toLowerCase() === usernameCheck.trim().toLowerCase() &&
        (!isEdit || n.id !== userId));
    if (dup) return "Tên tài khoản đã tồn tại. Vui lòng nhập tên khác !";
    return "";
})

const showMessage = (msg) => {
    message.value = msg;
    setTimeout(() => {
        message.value = "";
    }, 10000);
}



async function load() {
    roles.value = await roleService.getAll();

    if (userId != null) {
        isEdit.value = true;
        try {
            const user = await userService.getUserById(userId);
            form.value = { ...user, };

        } catch (error) {
            console.log("Failed to fetch user: ", error)
        }
    } else {
        const cats = await userService.getAllUsers();
        existing.value = cats;
    }

}


async function submit() {
    touched.value.name = true;
    if (usernameError.value) return;

    if (userId) {
        update();
    } else {
        try {
            if (form.value.password.length < 6) {
                return showMessage('Mật khẩu phải có độ dài ít nhất 6 ký tự !');
            }
            const resp = await userService.createUser(form.value);
            console.log("Thêm mới người dùng thành công!", resp);
            router.push('/admin/account');
        } catch (error) {
            console.log("Thêm mới người dùng thất bại: ", error)
        }
    };
    console.log(isEdit.value)
    resetForm();
}


async function update() {
    try {
        const resp = await userService.updateUser(form.value.id, form.value);
        console.log("User updated successfully!", resp);
        resetForm();
        router.push('/admin/account');
    } catch (error) {
        console.log("Failed to update user: ", error)
    }
}

async function Enable(id) {
    try {
        const resp = await userService.enableUser(id);
        console.log("User updated successfully!", resp);
        resetForm();
        router.push('account');
    } catch (error) {
        console.log("Failed to update user: ", error)
    }
}

function resetForm() {
    form.value = {
        id: null,
        username: '',
        name: '',
        password: '',
        gender: true,
        phone: '',
        dob: null,
        address: '',
        email: '',
        roles: ['']
    };
}

onMounted(() => {
    load();
});
</script>

<style scoped>
.container {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.account-form {
    position: relative;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}

.account-form>h2 {
    width: 100%;
}

form {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
}

nav {
    width: fit-content;
}

.gender {
    margin-right: 8px;
}

.section-card {
    background: #fff;
    border: 1px solid #eef2f7;
    border-radius: 12px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, .03);
}
</style>