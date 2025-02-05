<!--
 * @Description: What's this for
 * @Autor: WangYuan
 * @Date: 2021-12-20 17:09:06
 * @LastEditors: WangYuan
 * @LastEditTime: 2021-12-27 17:41:08
-->
<template>
  <div class="mc-text-container" :style="{height:containerHeight+'px'}">

  </div>
</template>

<script>
export default {
  name: "MCTextContainer",
  props:{
    containerHeight:{
      type:Number,
      default:30
    }
  },
  computed:{
    getCoreContentStyle(){
      return {
        minHeight: this.minHeight+'px',
        backgroundColor: this.contentBgc,
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.cnt{
  .cnt-header{
    text-align: center;
    line-height: 30px;
    height:30px;
  }
  .container{
    border: 1px solid #13ce66;
  }
}
</style>