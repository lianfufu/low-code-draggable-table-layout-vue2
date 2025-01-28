<template>
  <div class="body">
    <div class="control-models">
      <draggable
          v-model="$initializing"
          class="models-container"
          :group="{name:'xtwangzi',pull:'clone'}"
          :sort="false"
          :clone="handleClone"
          animation="300">
        <div class="model-item" v-for="(item, index) in $initializing" :key="index">
          <i class="iconfont" :class="item.icon"></i>
          <span>{{item.name}}</span>
        </div>
      </draggable>
    </div>
    <div class="control-page">
      <div class="panel">
        <div class="panel-content">
          <control-nest-widget :widgets.sync="widgets"/>
        </div>
      </div>
    </div>
    <div class="control-config">
      <custom-schema-template
      v-if="curComponent"
      :component="curComponent"
      :curFields="curFields"/>
      <div class="widget-config-source">
        {{ curComponent?JSON.stringify(curComponent):"无" }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "PageBody",
  data(){
    return{
      curComponent:null,
      widgets:[]
    }
  },
  provide(){
    return{
      control:this
    }
  },
  computed:{
    curFields(){
      return this.$fields[this.curComponent.component];
    }
  },
  methods: {
    handleClone(model){
      console.log(model);
      const res= {
        ...this._.cloneDeep(model),
        id: this.$getRandomCode(8),
      };
      console.log(res);
      return res;
    }
  },
  // watch:{
  //   widgets:{
  //     handler(value){
  //       console.log(value,"widgets改变了");
  //     },
  //     immediate:true,
  //     deep:true
  //   }
  // }
}
</script>

<style scoped lang="scss">
.body{
  display: flex;
  margin-top: 58px;
  height: calc(100vh - 58px);
  .control-models{
    width: 236px;
    height: 100%;
    background-color: #FFFFFF;
    .models-container{
      display: flex;
      flex-wrap: wrap;
      padding:10px 20px;
      .model-item{
        flex:50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 90px;
        padding:15px 0;
        &:hover{
          cursor: pointer;
          color: #fff !important;
          background: $color-theme;
        }
        i {
          font-size: 29px; /*no*/
          margin-top: 5px; /*no*/
          margin-bottom: 10px; /*no*/
        }
      }
    }
  }
  .control-page{
    display: flex;
    flex: 1;
    justify-content: center;
    height: 100%;
    overflow: auto;
    .panel {
      width: 100%;
      max-width: 900px;

      .panel-content {
        width: 375px;
        min-height: 600px;
        margin: 50px auto;
        background: #fff;
        box-shadow: 0px 10px 24px rgba(0, 0, 0, 0.1);
      }
    }
  }
  .control-config{
    width: 360px;
    height: 100%;
    padding:10px;
    background-color: #FFFFFF;
    overflow-y: auto;
  }
}
.widget-config-source{
  padding:10px;
}
</style>