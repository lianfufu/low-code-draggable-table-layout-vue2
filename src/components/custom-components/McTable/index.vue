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
          <td :style="{width:everyColWidth}" v-for="(item2,index2) in item" :key="index2">
            <ControlNestWidget :cell-col-index="index2" :cell-row-index="index" :isWidget="true" @updateTableChildData="doUpdateWidgets(index,index2)" :widgets.sync="item2"/>
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
    },
    everyColWidth(){
      return 100/this.colCount+"%";
    }
  },
  watch:{
    tableDataArr2:{
      handler(newVal,oldVal){
        console.log(newVal);
      },
      deep:true,
    },
    // children:{
    //   handler(value){
    //     this.tabData=value;
    //   },
    //   immediate:true,
    //   deep:true
    // }
  },
  methods:{
    doUpdateWidgets(rowIndex,colIndex,delValue){
      console.log(this.children,rowIndex,colIndex);
      const target=this.children.findIndex(item=>item.rowIndex===rowIndex&&item.colIndex===colIndex);
      if(target!==-1){
        this.children.splice(target,1);
      }
      // console.log(target,"target");
      // if(target&&target.length===1){
      //   const targetIndex=this.children.indexOf(target);
      //   console.log(targetIndex);
      //   this.children.splice(targetIndex,1);//只改children就够了。但不会触发这个tableDataArr2()，因为children地址没变。但不影向点击单元格的内容，内层会删除元素了。
      //   //
      //   console.log(this.children);
      // }
    }
  }
}
</script>

<style lang="scss" scoped>
.wrap {
  .table{
    table-layout: fixed;
    td {
      word-wrap: break-word !important;
    }
  }
}
</style>
