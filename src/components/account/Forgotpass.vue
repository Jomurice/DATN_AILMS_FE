<template>
    <div class="container-fluid">
        <div class="form">
            <h2>Quên mật khẩu</h2>
            <form action="" class="m-4" @submit.prevent="isOtp ? handleVerify() : handleForgot()">
                <div>
                    <label for="txtEmail">Email :</label>
                    <input type="email" v-model="forgotPassword.email" class="form-control mt-2" placeholder="Email" required>
                </div>

                <div v-if="isOtp">
                    <label for="txtOtp">Mã OTP :</label>
                    <input type="text" v-model="forgotPassword.otpCode" class="form-control mt-2" placeholder="Nhập mã OTP" required>
                </div>

                <span v-if="message" :class="messageType">{{ message }}</span>
                
                <div class="d-flex justify-content-end mt-3 gap-3">
                    <button v-if="isOtp" class="btn btn-info" @click="handleResendOtp()" :disabled="resendDisabled">
                        {{ resendText }}
                    </button>
                    <button class="btn" :class="isOtp ? 'btn-success' : 'btn-primary'" type="submit" :disabled="isLoading">
                        {{ isLoading ? 'Đang xử lý...' : (isOtp ? 'Xác nhận' : 'Gửi OTP') }}
                    </button>
                </div>
                
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { passwordService } from '../../services/PasswordService';

const router = useRouter();
const forgotPassword = ref({
    email:'',
    otpCode:''    
})
const isOtp = ref(false);
const isLoading = ref(false);

const message = ref('');
const messageType = ref('');

const resendDisabled = ref(false);
const resendText = ref('Gửi lại OTP');
const RESEND_TIME = 60;

const showMessage = (msg, type) => {
    message.value = msg;
    messageType.value = type === 'success' ? 'text-success fw-bold' : 'text-danger fw-bold';

    setTimeout(() => {
        message.value = '';
    }, 5000);
};

const startResendTimer = () => {
    resendDisabled.value = true;
    let timer = RESEND_TIME;
    resendText.value = `Gửi lại sau ${timer}s`;
    const interval = setInterval(() => {
        timer--;
        resendText.value = `Gửi lại sau ${timer}s`;
        if (timer <= 0) {
            clearInterval(interval);
            resendDisabled.value = false;
            resendText.value = 'Gửi lại OTP';
        }
    }, 1000);
};

async function handleForgot() {
    isLoading.value = true;
    try {
        await passwordService.forgotPass(forgotPassword.value);
        localStorage.setItem('email',forgotPassword.value.email);
        isOtp.value = true;
        showMessage("Mã OTP đã được gửi đến email của bạn, vui lòng kiểm tra!", 'success');
        startResendTimer();
    } catch (error) {
        const errorMsg = "Đã xảy ra lỗi. Vui lòng thử lại sau.";
        console.log("error",error);
        showMessage(errorMsg, 'error');
    } finally {
        isLoading.value = false;
    }
}

async function handleVerify() {
    if (forgotPassword.value.otpCode.length < 6) {
        showMessage("OTP phải có ít nhất 6 ký tự!", 'error');
        return;
    }

    isLoading.value = true;
    try {
        await passwordService.verifyOTP(forgotPassword.value);
        router.push('change-password');
    } catch (error) {
        const errorMsg = "Mã OTP không hợp lệ!";
        console.log("error",error);
        showMessage(errorMsg, 'error');
    } finally {
        isLoading.value = false;
    }
}

async function handleResendOtp() {
    if (resendDisabled.value) return;
    isLoading.value = true;
    try {
         await passwordService.forgotPass(forgotPassword.value);
        localStorage.setItem('email',forgotPassword.value.email);
        showMessage("Đã gửi lại mã OTP mới. Vui lòng kiểm tra email!", 'success');
        startResendTimer();
    } catch (error) {
        const errorMsg = "Đã xảy ra lỗi khi gửi lại OTP.";
        console.log("error",error);
        showMessage(errorMsg, 'error');
    } finally {
        isLoading.value = false;
    }
}
</script>

<style>
/* CSS không thay đổi */
.container-fluid {
    background-image: url("../../assets/hinh2.png");
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    min-height: 100vh;
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

h2 {
    text-align: center;
    margin-top: 5px;
}
</style>