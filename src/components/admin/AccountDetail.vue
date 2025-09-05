<template>
    <div class="container m-0 p-4">
        <div class=" account-form col-md-8">
            <h2>{{ isEdit ? 'Sửa thông tin người dùng' : 'Thêm người dùng' }}</h2>
            <form @submit.prevent="submit()">

                <div>
                    <label for="txtUsername">Tên đăng nhập : </label>
                    <input v-model="form.username" class="form-control" placeholder="Tên đăng nhập" required />
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
                    <input type="password" v-model="form.password" class="form-control" placeholder="Mật khẩu " required />
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

                <div>
                    <label for="">Quyền hạn :</label>
                    <select class="form-select" v-model="form.roles">
                        <option disabled  value="">----- Chọn quyền hạn ------</option>
                        <option v-for="role in roles" :key="role.id" :value="role">{{ role.name }}</option>
                    </select>
                </div>


                <div class="d-flex gap-3 mt-3">
                    <button type="submit" class="btn btn-primary">{{ isEdit ? 'Sửa' : 'Thêm' }}</button>
                    <button type="button" class="btn btn-danger" @click="Enable(form.id)">Khóa</button>
                    <button type="button" class="btn btn-primary" @click="resetForm()">Làm mới</button>
                </div>
            </form>
        </div>
    </div>
</template>


<script setup>
import { ref, onMounted } from "vue";
import { userService } from "../../services/UserService";
import { roleService } from "../../services/RoleService";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const userId = route.params.id;
const isEdit = ref(true);
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


async function load() {
    if (userId != null) {
        try {
            form.value = await userService.getUserById(userId);
            roles.value = await roleService.getRoleById(form.value.roles);
            console.log(roles.value);
            form.value.roles = {...roles.value};

        } catch (error) {
            console.log("Failed to fetch user: ", error)
        }
        isEdit.value = true;
    } else {
        isEdit.value = false;
        roles.value = await roleService.getAll();
    }

}


async function submit() {
    if (isEdit.value === true) {
        update();
    } else {
        try {
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
        roles: ['WO']
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

input,
textarea,
select {
    padding: 6px;
    border-radius: 4px;
    border: 1px solid #ccc;
}

.gender {
    margin-right: 8px;
}
</style>