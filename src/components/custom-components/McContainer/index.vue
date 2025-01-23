<!--
 * @Description: What's this for
 * @Autor: WangYuan
 * @Date: 2021-12-20 17:09:06
 * @LastEditors: WangYuan
 * @LastEditTime: 2021-12-27 17:41:08
-->
<template>
  <div class="cnt">
    <div class="cnt-header" :style="{backgroundColor:headBgc}">
      {{title}}
    </div>
    <div class="container" :style="{paddingBottom:padding+'px',paddingTop:padding+'px'}">
      <div :style="getCoreContentStyle">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "McContainer",
  props:{
    padding:{
      type:Number,
      default:0
    },
    title:{
      type:String,
      default:"容器标头",
    },
    headBgc:{
      type:String,
      default:"#DD6161",
    },
    minHeight:{
      type:Number,
      default:50
    },
    contentBgc:{
      type:String,
      default:"#e6e6e6",
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