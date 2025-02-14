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
  computed:{
    isSelected(){
      return this.$store.state.curComponent?.id === this.curComponent.id;
    }
  },
  methods:{
    setCurComponent(){
      console.log("点击后设置store的curComponent的值",this.curComponent);
      this.$store.commit("setCurComponent",this.curComponent);
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
    z-index: 996;
  }
}
.drag:hover{
  cursor: default;
}
</style>