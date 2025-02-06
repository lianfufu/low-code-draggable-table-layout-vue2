<template>
  <div class="cell-operation-bar" :style="positionVal" @click="myIsClickedAtOperationBar=true">
    <div class="merge-cell">
      <el-button size="mini" @click="sendMergeRowOrColumn">合并单元格</el-button>
    </div>
    <div class="split-cell">
      <el-button size="mini" @click="isShowPop=!isShowPop">拆分单元格</el-button>
      <div class="popover-split-box" v-show="isShowPop">
        <div class="count">
          <span>行数：</span>
          <el-input-number size="mini" v-model="myRowCount"/>
        </div>
        <div class="count">
          <span>列数：</span>
          <el-input-number size="mini" v-model="myColCount"/>
        </div>
        <el-button size="mini" type="primary" @click="sendCurRowAndColSplitCountInfo">确认</el-button>
      </div>
    </div>
    <div class="delete-row">
      <el-button size="mini" @click="deleteLocateRow">删除所在行</el-button>
    </div>
    <div class="delete-col">
      <el-button size="mini" @click="deleteLocateCol">删除所在列</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: "CellOperationBar",
  data(){
    return {
      isShowPop:false,
      myRowCount:1,
      myColCount:1,
      myIsClickedAtOperationBar:false,
    }
  },
  emits:["updateCurCellSplitInfo","doMergeCells","doDeleteRow","doDeleteCol"],
  props:{
    positionVal:{
      type:Object,
      default:()=>({
        left:0,
        top:0
      })
    },
    isClickedAtOperationBar:{
      type:Boolean,
      default:false,
    },
  },
  watch:{
    isClickedAtOperationBar:{
      handler(value){
        this.myIsClickedAtOperationBar=value;
      },
      immediate:true,
    },
    myIsClickedAtOperationBar:{
      handler(value){
        this.$emit("update:isClickedAtOperationBar",value);
      }
    },
  },
  methods:{
    sendCurRowAndColSplitCountInfo(){
      this.$emit("updateCurCellSplitInfo",this.myRowCount,this.myColCount);
    },
    sendMergeRowOrColumn(){
      this.$emit("doMergeCells",this.myRowCount,this.myColCount);
    },
    deleteLocateRow(){
      this.$emit("doDeleteRow");
    },
    deleteLocateCol(){
      this.$emit("doDeleteCol");
    }
  }
}
</script>

<style scoped lang="scss">
.cell-operation-bar{
  position: absolute;
  display: flex;
  height: 30px;
  width: 300px;
  border-radius: 5px;
  z-index: 999;
  .split-cell,
  .merge-cell,
  .delete-row,
  .delete-col{
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    width: 70px;
    height:100%;
  }
  .split-cell{
    width: 90px;
  }
  .split-cell{
    position: relative;
    .el-button.el-button--default.el-button--mini{
      width: 90px !important;
    }
    .popover-split-box{
      position: absolute;
      z-index: 999;
      left:0;
      top:28px;
      border: 1px #c0ccda solid;
      width: 90px;
      height: 94px;
      background-color: #fff;
      :deep(.el-button.el-button--primary.el-button--mini){
        position: absolute;
        right: 5px;
        bottom: 5px;
        width: 50px !important;
        height: 22px !important;
        line-height: 22px !important;
        padding: 0 !important;
        font-size: 11px !important;
      }
      .count{
        padding-left: 2px;
        font-size: 11px;
        height: 28px;
        line-height: 28px;
        :deep(.el-input.el-input--mini){
          line-height: 22px;
          input.el-input__inner{
            width: 50px !important;
            height: 22px !important;
          }
        }
        :deep(.el-input.el-input--mini){
          input.el-input__inner{
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
        }
        .el-input{
          width: 18px !important;
        }
        :deep(.el-input-number.el-input-number--mini){
          width: 50px !important;
          .el-input-number__decrease,
          .el-input-number__increase{
            background-color: gainsboro !important;
            width: 16px !important;
            border: none !important;
            height: 22px !important;
          }
        }
      }
    }
  }
  .el-button.el-button--default.el-button--mini{
    padding: 7px !important;
    font-size: 11px !important;
  }
}
</style>