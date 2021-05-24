import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login'
import Home from '../components/Home'
import Welcome from '../components/Welcome'
import Users from '../views/user/Users'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: 'login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 为路由对象添加一个导航守卫
router.beforeEach((to, from, next) => {
  // 1. 如果用户所在页面是登录页，则直接放行
  if (to.path === '/login') return next()
  // 2. 如果是其他页面，则检查sessionStorage中是否有token值
  // 2.1 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  // 2.2 如果没有token，则强制跳转到登录页
  if (!tokenStr) return next('/login')
  next()
})

export default router
