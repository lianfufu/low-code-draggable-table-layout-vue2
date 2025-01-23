import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import("@/views/home.vue")
  },
  {
    path: '/schema',
    name: 'Schema',
    component: () => import("@/views/schema.vue")
  }
]

const router = new VueRouter({
  routes
})

export default router
