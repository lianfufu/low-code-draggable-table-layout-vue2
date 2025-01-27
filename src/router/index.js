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
  },
  {
    path: '/resize',
    name: 'Resize',
    component: () => import("@/views/ResizeCellTest.vue")
  },
  {
    path: '/resizetable',
    name: 'ResizeTable',
    component: () => import("@/views/ResizeTable.vue")
  },
  {
    path: '/resizecolumn',
    name: 'ResizeColumn',
    component: () => import("@/views/ResizeColumn.vue")
  }
]

const router = new VueRouter({
  routes
})

export default router
