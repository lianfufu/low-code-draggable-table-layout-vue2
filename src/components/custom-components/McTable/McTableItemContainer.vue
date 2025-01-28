<!--
 * @Description: What's this for
 * @Autor: WangYuan
 * @Date: 2021-12-20 17:09:06
 * @LastEditors: WangYuan
 * @LastEditTime: 2021-12-27 17:41:08
-->
<template>
  <div class="cnt">
    <div class="container" :style="{paddingBottom:padding+'px',paddingTop:padding+'px'}">
      <div>
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "McTableItemContainer",
  props:{
    padding:{
      type:Number,
      default:0
    },
    contentBgc:{
      type:String,
      default:"#e6e6e6",
    },
    // height:{
    //   type:Number,
    //   default:0,
    // }
  },
};
</script>

<style lang="scss" scoped>
//.cnt{
//  .container{
//    border: 1px solid #13ce66;
//  }
//}
</style>