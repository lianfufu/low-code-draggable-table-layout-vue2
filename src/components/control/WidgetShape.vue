<template>
  <div class="widget-shape" @click.stop="setCurComponent">
    <div class="operate-bar">
      <div v-show="isSelected" @click="doDeleteComponent">
        X
      </div>
      <div v-show="!isSelected">
        {{ name }}
      </div>
    </div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: "WidgetShape",
  props:{
    name:{
      type:String,
      default:"物料实例"
    },
    curComponent:null
  },
  emits:["deleteWidget"],
  inject:["control"],
  computed:{
    isSelected(){
      return this.control.curComponent?.id === this.curComponent.id;
    }
  },
  methods:{
    setCurComponent(){
      this.control.curComponent = this.curComponent;
    },
    doDeleteComponent(){
      this.$emit("deleteWidget",this.curComponent);
    }
  }
}
</script>

<style scoped lang="scss">
.widget-shape{
  position: relative;
  width:100%;
  &:hover{
    outline:1px dashed $color-theme;
  }
  .operate-bar{
    width:75px;
    text-align: center;
    height:28px;
    line-height:28px;
    position: absolute;
    top:0;
    right:-80px;
    background-color: #cccccc;
  }
}
</style>