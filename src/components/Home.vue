<template>
  <el-container class="home_container">
    <el-header>
      <div>
        <img src="../assets/logo.png" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <!-- 侧边栏区域 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 侧边栏菜单区域 -->
        <el-menu background-color="#313743" 
        text-color="#fff" 
        active-text-color="#39a1fb" 
        unique-opened
        :collapse='isCollapse'
        :collapse-transition='false'
        router
        :default-active="activePath">
          <!-- 一级菜单 -->
          <el-submenu :index="item.id +'' " v-for="item in menuList" :key="item.id">
            <!-- 一级菜单模板 -->
            <template slot="title">
              <i :class="iconObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>

            <!-- 二级菜单 -->
            <el-menu-item :index="'/'+subItem.path " v-for="subItem in item.children" :key="subItem.id" @click="saveActivePath('/'+subItem.path)">
              <template slot="title">
                <i class="fa fa-th-large"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 左侧菜单数据
      menuList: [],
      iconObj: {
        '125': 'fa fa-users',
        '103': 'fa fa-key',
        '101': 'fa fa-shopping-basket',
        '102': 'fa fa-wpforms',
        '145': 'fa fa-database'
      },
      // 是否折叠
      isCollapse: false,
      // 被激活的链接地址
      activePath: ''
    }
  },
  created() {
    // 获取菜单数据
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    // 实现退出功能
    logout() {
      // 删除sessionStorage中的token
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取菜单数据
    async getMenuList() {
      const {data: res} = await this.$http.get('menus')
      this.menuList = res.data
      console.log(res.data);
    },
    // 点击折叠展开
    toggleCollapse() {
      this.isCollapse = ! this.isCollapse
    },
    // 保存链接激活状态
    saveActivePath(activePath) {
      window.sessionStorage.setItem('activePath',activePath)
      this.activePath = activePath
    }
  },
}
</script>

<style lang="less" scoped>
  .home_container {
    height: 100%;
  }

  .el-header {
    background-color: #363d40;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: #fff;
    font-size: 18px;

    >div {
      display: flex;
      align-items: center;

      >img {
        height: 60px;
        width: 60px;
      }

      >span {
        margin-left: 20px;
      }
    }

    
  }

  .el-aside {
    background-color: #313743;

    .toggle-button {
      background-color: #4a5064;
      text-align: center;
      color: #fff;
      font-size: 10px;
      line-height: 24px;
      letter-spacing: .2em;
      cursor: pointer;
    }

    .el-menu {
      border-right: none;
    }
  }

  .el-main {
    background-color: #e9edf1;
  }

  .fa {
    margin-right: 10px;
  }
</style>