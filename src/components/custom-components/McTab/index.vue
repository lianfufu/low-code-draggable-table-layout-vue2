<!--
 * @Description: tab组件
 * @Autor: WangYuan
 * @Date: 2021-05-21 19:13:20
 * @LastEditors: WangYuan
 * @LastEditTime: 2022-01-01 09:13:02
-->
<template>
  <div class="wrap">
    <div class="wrap-body" :style="bodyStyle">
      <ul class="tabs" :style="{width:tabWidth}">
        <li v-for="(item,index) in tabList" :key="index" class="tab-item" :style="{width:tabItemWidth}">
          <img class="tab-item-img" :style="imgStyle" v-show="attrs.type==='image-text'||attrs.type==='image'" :src="item.image?item.image:'http://127.0.0.1:3000/defaultabimg.png'" alt="BannersImg"/>
          <span :style="textStyle" class="ellipsis-1" v-show="attrs.type==='image-text'||attrs.type==='text'">{{item.label}}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'McTab',
  props:{
    tabList:{
      type:Array,
      default:()=>[]
    },
    attrs:{
      type:Object,
      default:()=>{}
    },
    styles:{
      type:Object,
      default:()=>{}
    }
  },
  computed:{
    tabItemWidth(){
      return `${375/this.attrs.max}px`
    },
    tabWidth(){
      const width=this.tabList.length*375/this.attrs.max;
      return `${width<=375?375:width}px`
    },
    bodyStyle(){
      return{
        color:this.styles.titleColor?this.styles.titleColor:"#000000",
        backgroundColor:this.styles.cmpBackground?this.styles.cmpBackground:"#ffffff",
        fontSize:this.styles.fontSize+'px',
      }
    },
    imgStyle(){
      return {
        width:`${this.styles.imgWidth}%`,
        padding:this.styles.imgPadding+"px",
        borderRadius:this.styles.imgRadius+"px",
        marginTop:this.styles.cmpUpperPadding+"px",
      }
    },
    textStyle(){
      return {
        marginBottom:this.styles.cmpLowerPadding+"px",
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.wrap {
  .wrap-body {
    overflow-x:hidden;
    &::-webkit-scrollbar {
      display: none; /* Chrome Safari */
    }

    .tabs {
      .tab-item {
        display: inline-block;
        text-align: center;

        .tab-item-img {
          width:100%;
          overflow: hidden;
          //height: 100%;
           margin-bottom: 5px;
        }
      }
    }
  }
}
</style>
