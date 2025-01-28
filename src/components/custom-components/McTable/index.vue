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
          <td class="flex-td" :style="{width:everyColWidth}" v-for="(item2,index2) in item" :key="index2">
            <McTableItemContainer>
              <ControlNestWidget :cell-col-index="index2" :cell-row-index="index" :isWidget="true" @updateTableChildData="doUpdateWidgetsForDel(index,index2)" @update:widgets="doUpdateWidgets" :widgets.sync="item2"/>
            </McTableItemContainer>
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
      tabData:[],
      colWidths:[],
      rowWidths:[]
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
  mounted() {
    for(let i=0;i<this.colCount;i++){
      this.colWidths.push(100/this.colCount+"%");
    }
    
    for(let j=0;j<this.rowCount;j++){
      this.rowWidths.push("30px");
    }
  },
  computed:{
    tableDataArr2(){
      console.log("删除后重新计算tableDataArr2");
      const res=[];
      for (let i=0;i<this.rowCount;i++){
        res[i]=[];
        for (let j=0;j<this.colCount;j++){
          const matchedChild=this.tabData.filter(item=>item.rowIndex===i&&item.colIndex===j);
          if(matchedChild&&matchedChild.length>0){
            if(matchedChild.length===1){
              const first=matchedChild[0];
              first.id=this.$getRandomCode(8);
              res[i][j]=[first];
            }else{
              res[i][j]=matchedChild;
            }
          }else{
            res[i][j]=[];
          }
        }
      }
      return res;
    },
    everyColWidth(){
      return 100/this.colCount+"%";
    },
  },
  watch:{
    tableDataArr2:{
      handler(newVal,oldVal){
        console.log(newVal);
      },
      deep:true,
    },
    children:{
      handler(value){
        this.tabData=value;
      },
      immediate:true,
      deep:true
    },
    tabData:{
      handler(value){
        this.$emit("update:children",value);
      },
      immediate:true,
      deep:true
    },
    colCount:{
      hanlder(value){

      }
    }
  },
  methods:{
    doUpdateWidgetsForDel(rowIndex,colIndex,delValue){
      const target=this.tabData.findIndex(item=>item.rowIndex===rowIndex&&item.colIndex===colIndex);
      if(target!==-1){
        this.tabData.splice(target,1);
      }
    },
    doUpdateWidgets(newValue){
      const newItems=[];
      if(newValue&&Array.isArray(newValue)){
        for (const item of newValue) {
          if(item.id){
            const target = this.tabData.find(item2=>item2.id===item.id);
            if(!target){
              newItems.push(item);
            }
          }
        }
      }
      newItems.length>0&&newItems.forEach(item=>{
        this.tabData.push(item);
      })
      console.log("监听item2的改变",newValue,newItems);
    }
  }
}
</script>

<style lang="scss" scoped>
.wrap {
  .table{
    table-layout: fixed;
    .flex-td {
      word-wrap: break-word !important;
      border: 1px solid greenyellow;
    }
  }
}
</style>
