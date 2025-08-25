<template>
    <div class="account-manager">
        <div class="col-md-8 p-3">
            <h2>Account Management</h2>
            <form @submit.prevent="handleSubmit" class="account-form">
                <label for="txtUsername">User Name : </label>
                <input v-model="form.username" placeholder="Username" required />

                <label for="txtFullName">Full Name : </label>
                <input v-model="form.name" placeholder="Name" required />

                <label for="txtEmail">Email : </label>
                <input type="email" v-model="form.email" placeholder="Email" required />

                <label for="txtPhone">Number Phone : </label>
                <input v-model="form.phone" placeholder="Number Phone" required />

                <label for="txtdob">Dob : </label>
                <input v-model="form.dob" placeholder="Birthday" required />

                <label for="txtAddress">Address : </label>
                <textarea v-model="form.address" placeholder="Address" rows="3" required />

                <div>
                    <label for="txtGender" class="gender">Gender : </label>
                    <input type="radio" v-model="form.gender" :value="true" checked> Male
                    <input type="radio" v-model="form.gender" :value="false"> Female
                </div>

                <label for="txtRole">Role : </label>
                <select v-model="form.role">
                    <option value="Admin">Admin</option>
                    <option value="User">User</option>
                </select>

                <div class="d-flex gap-3 mt-3">
                    <button type="submit">Create</button>
                    <button @click="update()">Update</button>
                    <button @click="deleteAccount(form.id)">Enbale</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import axios from 'axios';

const accounts = ref([
    { id: 1, username: 'NV001', name: 'Nguyễn Văn A', gender: true, dob: '02/02/2004', phone: '0963258741', address: '158 Tran Binh Trong, Phuong gi do, Tp Gi day', email: 'a@company.com', role: 'Admin' },
    { id: 2, username: 'NV002', name: 'Trần Thị B', gender: false, dob: '15/09/2000', phone: '0914725836', address: '3b Nam ky Khoi Nghia, Phuong gi do, Tp Gi day', email: 'b@company.com', role: 'User' }
])
const form = ref({ id: null, username: '', name: '', password: '', gender: true, phone: '', dob: null, address: '', email: '', role: 'User' })


async function load() {
    const token = localStorage.getItem("token");

   try {
        const response = await axios.get(`http://localhost:8080/identity/user/${account.id}`);
        console.log("Account fetched successfully:", response.data);
        form.value = response.data;
    } catch (error) {
        console.log("Error fetching account:", error);
    }
}

async function handleSubmit() {
    const token = localStorage.getItem("token");

    try {
        const response = await axios.post('http://localhost:8080/identity/user', {
            Headers: {
                Authorization: `Bearer ${token}`,
            },
            data: form.value
        });
        console.log("Account created successfully:", response.data);
        resetForm()
    } catch (error) {
        console.log("Error creating account:", error);
    }
}

async function update() {
    const token = localStorage.getItem("token");

    try {
        const response = await axios.put(`http://localhost:8080/identity/user/${form.value.id}`, {
            Headers: {
                Authorization: `Bearer ${token}`,
            },
            data: form.value
        });
        console.log("Account updated successfully:", response.data);
        resetForm()
    } catch (error) {
        console.log("Error updating account:", error);
    }
}


async function deleteAccount(id) {
    const token = localStorage.getItem("token");

    try {
        const response = await axios.delete(`http://localhost:8080/identity/user/${id}`, {
            Headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        console.log("Account deleted successfully:", response.data);
        resetForm()
    } catch (error) {
        console.log("Error deleting account:", error);
    }
}

function resetForm() {
    form.value = { id: null, username: '', name: '', gender: true, phone: null, dob: null, address: '', email: '', role: 'User' }
    isEdit.value = false
}

onMounted(() => {
    load()
})
</script>

<style scoped>
.account-manager {
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 10px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}



.form-container>h2 {
    width: 100%;
}

form {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
}

input,
select {
    padding: 6px;
    border-radius: 4px;
    border: 1px solid #ccc;
}

.gender {
    margin-right: 8px;
}

button {
    padding: 6px 12px;
    border-radius: 4px;
    border: none;
    background: #2563eb;
    color: #fff;
    cursor: pointer;
}

button[type="button"] {
    background: #f59e0b;
}

ul {
    list-style: none;
    padding: 0;
}

li {
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
}
</style>