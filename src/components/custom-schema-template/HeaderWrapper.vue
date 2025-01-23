<template>
  <div class="header-wrapper">
    <div class="header-container">
      <div class="header-label">{{label}}</div>
    </div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: "HeaderWrapper",
  props:{
    label:{
      type:String,
      default:"无标签"
    }
  },
}
</script>

<style scoped lang="scss">
.header-wrapper{
  margin-top: 5px;
  .header-container{
    padding:10px 12px;
    background-color: #e8f0fb40;
    .header-label{
      font-size:14px;
      margin-left: 20px;
      position: relative;
      &::before{
        content:"";
        position: absolute;
        top:0;
        left:-15px;
        width: 4px;
        height:14px;
        background-color: #155bd4;
      }
    }
  }
}
</style>