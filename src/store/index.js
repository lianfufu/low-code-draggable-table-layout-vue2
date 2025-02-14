import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    fields:null,//全部左侧的定义的各个类型的fields
    curComponent: null,
    curFields: null // 初始化为 null 或你想要的任何默认值
  },
  getters:{
    curFields(state){
      if(state.curComponent?.component==="McImg"||
          state.curComponent?.component==="McTab"||
          state.curComponent?.component==="McTable"||
          state.curComponent?.component==="McTitle"){
        if(state.curComponent?.component&&state.fields[state.curComponent.component]){
          return state.fields[state.curComponent.component];
        }
      }else{
        return state.fields;
      }
    }
  },
  mutations: {
    setCurComponent(state, curComponent){
      state.curComponent = curComponent;
    },
    setFields(state, fields){
      state.fields = fields;
    },
    setCurFields(state, curFields){
      state.curFields = curFields;
    }
  },
  actions: {
  },
  modules: {
  }
})
