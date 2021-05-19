<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头部区域 -->
      <div class="login_img">
        <img src="../assets/logo.png" alt="">
      </div>
      <!-- 表单区域 -->
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" class="login_form">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="fa fa-user"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" prefix-icon="fa fa-lock" show-password></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 这是登录表单的数据绑定对象
      loginForm: {
        username: '',
        password: ''
      },
      // 表单验证规则对象
      loginFormRules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入用户密码', trigger: 'blur' },
          { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    login() {
      // validate 预验证表单数据是否合法
      this.$refs.loginFormRef.validate( async valid => {
        // console.log(valid);
        if(!valid) return;
        const {data: res} = await this.$http.post('login',this.loginForm)
        // console.log(res);
        if(res.meta.status !== 200) return this.$message.error('登录失败！')
        this.$message.success('登录成功！')
      })
    },
    // 重置表单数据
    resetLoginForm() {
      // console.log(this);
      this.$refs.loginFormRef.resetFields()
    }
  }
}
</script>

<style lang="less" scoped>
  .login_container {
    background-color: #264a6d;
    height: 100%;
  } 

  .login_box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 5px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);

    .login_img {
      width: 130px;
      height: 130px;
      background-color: #fff;
      border: 1px solid #fff;
      border-radius: 50%;
      padding: 10px;
      box-shadow: 0 0 10px #eee;
      position: absolute;
      left: 50%;
      transform: translate(-50%,-50%);
      
      img {
        width: 130px;
        height: 130px;
        border-radius: 50%;
      }
    }
  }

  .login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
  }

  .btns {
    display: flex;
    justify-content: flex-end; //横轴上，尾部对齐
  }
</style>    