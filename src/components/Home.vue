<template>
  <div>
    Home主页
    <el-button type="info" @click="logout">退出</el-button>
  </div>
</template>

<script>
export default {
  methods: {
    // 实现退出功能
    logout() {
      // 删除sessionStorage中的token
      window.sessionStorage.clear()
      this.$router.push('/login')
    }
  },
}
</script>

<style lang="less" scoped>

</style>