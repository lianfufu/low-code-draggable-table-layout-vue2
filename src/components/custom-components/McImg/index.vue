<!--
 * @Description: 图片组件
 * @Autor: WangYuan
 * @Date: 2021-05-21 19:13:20
 * @LastEditors: WangYuan
 * @LastEditTime: 2021-12-27 17:02:20
-->
<template>
  <div class="mc-img">
    <img :src="computedImgUrl" alt="占位图片" :style="{borderRadius:radius+'px'}"/>
  </div>
</template>

<script>
export default {
  name: "McImg",
  props:{
    imagePath:{
      type:String,
      default:"https://img01.yzcdn.cn/public_files/2019/03/05/2b60ed750a93a1bd6e17fc354c86fa78.png!large.webp"
    },
    radius:{
      type:Number,
      default:0
    }
  },
  computed:{
    computedImgUrl(){
      return this.imagePath?this.imagePath:"https://img01.yzcdn.cn/public_files/2019/03/05/2b60ed750a93a1bd6e17fc354c86fa78.png!large.webp";
    }
  }
};
</script>

<style lang="scss" scoped>
.mc-img {
  width: 100%;
  img{
    overflow:hidden;
    width:100%;
  }
}
</style>
