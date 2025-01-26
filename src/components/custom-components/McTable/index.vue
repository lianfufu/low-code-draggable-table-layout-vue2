<!--
 * @Description: tab组件
 * @Autor: WangYuan
 * @Date: 2021-05-21 19:13:20
 * @LastEditors: WangYuan
 * @LastEditTime: 2022-01-01 09:13:02
-->
<template>
  <div class="wrap" :style="{paddingBottom:padding+'px',paddingTop:padding+'px'}">
    <table class="table" border="1">
      <tbody>
        <tr v-for="(item,index) in tableDataArr2" :key="index">
          <td v-for="(item2,index2) in item" :key="index2">
            <ControlNestWidget :isWidget="true" :widgets.sync="item2"/>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>

export default {
  name: 'McTable',
  data(){
    return {
      tabData:[]
    }
  },
  props:{
    children:{
      type:Array,
      default:()=>[]
    },
    padding:{
      type:Number,
      default:0
    },
    colCount:{
      type:Number,
      default:3
    },
    rowCount:{
      type:Number,
      default:2
    }
  },
  computed:{
    tableDataArr2(){
      const res=[];
      for (let i=0;i<this.rowCount;i++){
        res[i]=[];
        for (let j=0;j<this.colCount;j++){
          const matchedChild=this.children.filter(item=>item.rowIndex===i&&item.colIndex===j);
          if(matchedChild&&matchedChild.length>0){
            const first=matchedChild[0];
            first.id=this.$getRandomCode(8);
            res[i][j]=[first];
          }else{
            res[i][j]=[];
          }
        }
      }
      return res;
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
