<template>
    <div class="container-fluid">
        <div class="form">
            <h2>Đổi mật khẩu</h2>
            <form action="" class="m-4" @submit.prevent="handleChangePass">
                <div>
                    <label for="txtEmail">Mật khẩu mới :</label>
                    <input type="password" v-model="formPassword.newPassword" class="form-control mt-2"
                        placeholder="Mật khẩu mới" required>
                </div>

                <div>
                    <label for="txtEmail">Xác nhận mật khẩu :</label>
                    <input type="password" v-model="formPassword.confirmPassword" class="form-control mt-2"
                        placeholder="Xác nhận mật khẩu" required>
                </div>

                <span v-if="message" :class="messageType">{{ message }}</span>

                <div class="d-flex justify-content-end mt-3 gap-3">
                    <button class="btn btn-primary" type="submit">{{ isLoading ? 'Đang xử lý...' : 'Xác nhận' }}</button>
                </div>

            </form>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { authService } from '../../services/authService';
import { useRouter } from 'vue-router';
import { passwordService } from '../../services/PasswordService';

const router = useRouter();
const formPassword = ref({
    email: '',
    newPassword: '',
    confirmPassword: ''
})

const message = ref('');
const messageType = ref('');

const isLoading = ref(false);

const showMessage = (msg, type) => {
    message.value = msg;
    messageType.value = type === 'success' ? 'text-success fw-bold' : 'text-danger fw-bold';
    setTimeout(() => {
        message.value = '';
    }, 5000);
}


async function handleChangePass() {
    isLoading.value = true;

    if (formPassword.value.newPassword.length < 6) {
        showMessage('Mật khẩu phải có ít nhất 6 ký tự !', 'error');
        isLoading.value = false;
        return;
    }

    if (formPassword.value.newPassword !== formPassword.value.confirmPassword) {
        showMessage('Mật khẩu xác nhận phải giống mật khẩu mới !', 'error');
        isLoading.value = false;
        return;
    }

    formPassword.value.email = localStorage.getItem('email');
    try {
        await passwordService.resetPassword(formPassword.value);
        router.push('/');
    } catch (error) {
        console.log("error", error);
        const errorMsg = "Đã xảy ra lỗi. Vui lòng thử lại sau.";
        showMessage(errorMsg, 'error');
    } finally {
        isLoading.value = false;
    }
}


</script>

<style>
html,
body {
    height: 100%;
    margin: 0;
}

.container-fluid {
    /* background-image: url("../../assets/hinh2.png"); */
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    align-items: center;
    justify-items: center;
}

.form {
    background-color: rgb(154, 154, 154, 0.9);
    border-radius: 15px;
    width: 40%;
}

/* form {
    display: flex;
    flex-direction: column;
    justify-items: flex-end;
    gap: 10px;
} */

h2 {
    text-align: center;
    margin-top: 5px;
}
</style>