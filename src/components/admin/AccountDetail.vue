<template>
    <div class="container m-0 p-4">
        <div class=" account-form col-md-8">
            <h2>Account Management</h2>
            <form>
                <label for="txtUsername">User Name : </label>
                <input v-model="form.username" placeholder="Username" required />

                <label for="txtFullName">Full Name : </label>
                <input v-model="form.name" placeholder="Name" required />

                <label for="txtEmail">Email : </label>
                <input type="email" v-model="form.email" placeholder="Email" required />

                <label for="txtPassword">Password : </label>
                <input type="password" v-model="form.password" placeholder="Password" required />


                <label for="txtPhone">Number Phone : </label>
                <input v-model="form.phone" placeholder="Number Phone" required />

                <label for="txtdob">Dob : </label>
                <input type="date" v-model="form.dob" placeholder="Birthday" required />

                <label for="txtAddress">Address : </label>
                <textarea v-model="form.address" placeholder="Address" rows="3" required />

                <div>
                    <label for="txtGender" class="gender">Gender : </label>
                    <input type="radio" v-model="form.gender" :value="true"> Male
                    <input type="radio" v-model="form.gender" :value="false"> Female
                </div>
                <select v-model="form.roles" multiple>
                    <option disabled value="">Chọn loại</option>
                    <option v-for="role in allRoles" :key="role" :value="role"></option>
                </select>


                <div class="d-flex gap-3 mt-3">
                    <button type="button" class="btn btn-primary" @click="Submit(form.id)">{{ isEdit ? 'Update' : 'Create'}}</button>
                    <button type="button" class="btn btn-danger" @click="Enable(form.id)">Enbale</button>
                    <button type="button" class="btn btn-primary" @click="resetForm()">Reset</button>
                </div>
            </form>
        </div>
    </div>
</template>


<script setup>
import { ref, onMounted } from "vue";
import { userService } from "../../services/UserService";
import { useRoute,useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const userId = route.params.id;
const isEdit = ref(true);
const allRoles = ref(["Admin", "WO", "LM"]);
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
            const user = await userService.getUserById(userId);
            form.value = { ...user, roles: [...user.roles] };
        } catch (error) {
            console.log("Failed to fetch user: ", error)
        }
        isEdit.value = true;
    } else {
        isEdit.value = false;
    }

}


async function Submit(id) {
    if (isEdit.value === true) {
        update(id);
    } else {
        try {
            const resp = await userService.createUser(form.value);
            console.log("User created successfully!", resp);
            router.push('/admin/account');
        } catch (error) {
            console.log("Failed to create user: ", error)
        }
    };
    console.log(isEdit.value)
    resetForm();
}


async function update(id) {
    try {
        const resp = await userService.updateUser(id, form.value);
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