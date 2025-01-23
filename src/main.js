import Vue from 'vue'
import App from '@/App.vue'
import router from '@/router'
import store from '@/store'
import globalMethods from "@/utils/globalMethods";
import "@/utils/mywrite/myGlobalSchemaRegister";
import "@/utils/globalRegister";

// 适配文件,移动端(小于540px)才进行适配
import '@/utils/adapter.js'

import Element from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import draggable from "vuedraggable";
import _ from "lodash";
import Imgpond from 'imgpond'
import request from '@/utils/imageRequest'

Vue.use(Element);
Vue.component("draggable",draggable);
Vue.config.productionTip = false
Vue.use(globalMethods);
console.log(process.env.VUE_APP_UPLOAD_API);
Vue.prototype._=_;
Vue.use(Imgpond, {
  request,
  url: process.env.VUE_APP_UPLOAD_API + 'api/v1/user/onload/files',
  // param: {
  //   domainId: 3,
  //   dir: 'img'
  // },
  sizeExceededWarningHTML:
      '<a href="https://www.kdocs.cn/l/smLPgaIjt" target="_blank">点击查看压缩指南</a>',
  poweredBy: 'element'
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
