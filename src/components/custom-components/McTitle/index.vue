<!--
 * @Description: 标题组件
 * @Autor: WangYuan
 * @Date: 2021-06-04 15:37:07
 * @LastEditors: WangYuan
 * @LastEditTime: 2021-12-28 09:23:23
-->
<template>
  <div class="title">
    <div :style="getStyles">{{title}}</div>
  </div>
</template>

<script>
export default {
  name: "McTitle",
  props:{
    title:{
      type:String,
      default:"默认文本"
    },
    model:{
      type:String,
      default:"默认文本"
    },
    styles:{
      type:Object,
      default:()=>{}
    }
  },
  computed:{
    getStyles(){
      if(!this.styles){
        return {
          fontSize:"20px",
          color:"black",
          textAlign:"left"
        }
      }else{
        return{
          fontSize:this.styles.titleSize+"px",
          color:this.styles.titleColor,
          textAlign:this.model,
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.title{
  padding:0 10px;
}
</style>
