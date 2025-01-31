<template>
  <div class="widget-shape drag" @click.stop="setCurComponent">
    <div class="operate-bar">
      <div class="f14" v-show="isSelected" @click="doDeleteComponent">
        x
      </div>
      <div class="f14" v-show="!isSelected">
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
    width: 30px;
    text-align: center;
    height:20px;
    line-height:20px;
    position: absolute;
    top:0;
    right:-35px;
    background-color: #cccccc;
    z-index: 999;
  }
}
.drag:hover{
  cursor: default;
}
</style>