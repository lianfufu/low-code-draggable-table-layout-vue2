<!--
 * @Description: tab组件
 * @Autor: WangYuan
 * @Date: 2021-05-21 19:13:20
 * @LastEditors: WangYuan
 * @LastEditTime: 2022-01-01 09:13:02
-->
<template>
  <div class="wrap" :style="{paddingBottom:padding+'px',paddingTop:padding+'px'}" @click="sourceTargetClickIsTD">
<!--    <div style="opacity: 0;height: 0">{{writableIsClickTD}}-{{isShowOperationBar}}-{{isClickedTD}}</div>-->
    <div>{{writableIsClickTD}}-{{isShowOperationBar}}-{{isClickedTD}}</div>
    <cell-operation-bar :isShowPop.sync="isShowPop" :isClickedAtOperationBar.sync="isClickedAtOperationBar" v-show="isShowOperationBarRealBind" :positionVal="operationBarPosition"/>
    <table ref="mytable" class="table" :border="isShowBorder?1:0">
      <tbody>
        <tr v-for="(item,index) in tableDataArr2" :style="{height:rowHeights[index]+'px'}" :key="index">
          <td :data-rowIndex="index" :data-colIndex="index2" :class="[isShowBorder?'':'no-border',isSelectedCell(index,index2)?'selected-cell':'']" v-for="(item2,index2) in item" :key="index2" @mousedown="tdMouseDown" @mousemove="tdMouseMove" @mouseup="tdMouseUp" :valign="model" @click.stop="showTableConfig(item2,index,index2)" class="resizable-cell flex-td" :style="getCellStyle(columnWidths,item2,index2)">
            <McTableItemContainer>
              <ControlNestWidget :cell-col-index="index2" :cell-row-index="index" :isWidget="true" @updateTableChildData="doUpdateWidgetsForDel(index,index2)" @update:widgets="doUpdateWidgets" :widgets.sync="item2"/>
            </McTableItemContainer>
            <div class="row-resizer" @drag.stop @dragend.stop @dragstart.stop @mousedown="startResizingRow(index)"></div>
            <div
                class="col-resizer"
                v-if="index2 < colCount - 1"
                @dragstart.stop
                @drag.stop
                @dragend.stop
                @mousedown="startResizingColumn(index2, index)"
            ></div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>

import _ from "lodash";

export default {
  name: 'McTable',
  data(){
    return {
      tabData:[],
      columnWidths:[],
      rowHeights:[],
      isResizingRow: false,
      isResizingColumn: false,
      resizingRowIndex: null,
      resizingColumnIndex: null,
      parentWidth:430,
      initialY: 0,//控制拖拽柄拖拽位置的逻辑Y
      initialX: 0,//控制拖拽柄拖拽位置的逻辑X
      pickedCellY: 0,//控制选择表格单元格位置的初始逻辑Y
      pickedCellX: 0,//控制选择表格单元格位置的初始逻辑X
      cellIsMouseMove:false,
      selectedMinRowIndex:Number.NaN,
      selectedMaxRowIndex:Number.NaN,
      selectedMinColIndex:Number.NaN,
      selectedMaxColIndex:Number.NaN,
      pickedRowIndex:Number.NaN,//按下第一次鼠标时的行索引
      pickedColIndex:Number.NaN,//按下第一次鼠标时的列索引
      operationBarPosition:{
        left:0,
        top:0,
      },
      isShowOperationBar:false,
      writableIsClickTD:false,//为了控制单元格操作栏的显隐
      isClickedAtOperationBar:false,//判断是否点击了操作柄内部的元素
      isShowPop:false,//控制是否显示拆分的弹出框
    }
  },
  inject:["control"],
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
    },
    model:{
      type:String,
      default:"top"//内部单元格对齐方式
    },
    isShowBorder:{
      type:Boolean,
      default:true
    },
    globalCellBgc:{
      type:String,
      default:"globalCellBgc"
    }
  },
  mounted() {
    for(let i=0;i<this.colCount;i++){
      this.columnWidths.push(100/this.colCount+"%");
    }
    
    for(let j=0;j<this.rowCount;j++){
      this.rowHeights.push(40);
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
    isClickedTD(){
      if(!this.control.curComponent){
        console.log("这里curComponent不存在才给的false");
        return false;
      }
      if(!this.control.curComponent.component||this.control.curComponent.component==="McTable"){
        return true;//因为设定过当点击td，这个时候没有设置component属性
      }
      console.log("其他情况才给的false",this.control.curComponent,this.control.curComponent.component==="McTable");
      return false;
    },
    isShowOperationBarRealBind(){
      return this.isClickedAtOperationBar||(this.isShowOperationBar&&this.writableIsClickTD);
    }
  },
  watch:{
    isShowOperationBarRealBind:{
      handler(value){
        console.log(value,"isShowOperationBarRealBind");
        this.isShowPop=false;
        // if(value){
        //   this.isShowPop=false;
        // }
      },
      immediate:true,
      deep:true
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
      handler(value){
        // 只要修改了列的个数，先前的列的宽度设置都将被重置
        this.columnWidths=[];
        for(let i=0;i<this.colCount;i++){
          this.columnWidths.push(100/this.colCount+"%");
        }
      }
    },
    rowCount:{
      handler(value,oldValue){
        if(value>oldValue){//原有的高度值不要被改变
          for(let i=oldValue;i<this.rowCount;i++){
            this.rowHeights.push(40);
          }
        }else{
          for(let i=0;i<oldValue-this.rowCount;i++){
            this.rowHeights.pop();
          }
        }
      }
    },
    isClickedTD:{
      handler(value){
        console.log(value);
        if(!value){
          this.clearCurSelectedCells();
          console.log(value,"最后没有执行清空操作？");
        }
      },
      deep:true,//迷惑的地方
    },
    isShowOperationBar:{
      handler(value){
        console.log(value);
        if(!value&&!this.isClickedTD&&this.writableIsClickTD){
          this.clearCurSelectedCells();//如果不显示bar，则同时要清空所有选择的单元格。是一种强绑定关系
          console.log(value,"最后没有执行清空操作？");
        }
      },
      deep:true,//迷惑的地方
    },
    tableDataArr2:{
      handler(value){
        console.log("tableDataArr2改变了",value);
      },
      deep:true
    }
  },
  methods:{
    getCellStyle(columnWidths,list,index){
      //todo 这种区别对待的，最好要做一个统一处理
      if(!list||list.length===0){
        return {
          width:columnWidths[index],
          backgroundColor:this.globalCellBgc
        };
      }
      console.log(list[0].cellFieldsVal?.contentBgc||this.globalCellBgc);
      return {
        width:columnWidths[index],
        padding:list[0].cellFieldsVal?.padding+'px',
        backgroundColor:list[0].cellFieldsVal?.contentBgc??'#ffffff'
      }
    },
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
    },
    //管理选中的单元格
    isSelectedCell(rowIndex,colIndex){
      if(Number.isNaN(this.selectedMinColIndex)){
        return false;
      }
      return this.selectedMinRowIndex<=rowIndex&&this.selectedMaxRowIndex>=rowIndex&&this.selectedMinColIndex<=colIndex&&this.selectedMaxColIndex>=colIndex;
    },
    clearCurSelectedCells(){
      this.selectedMinColIndex=Number.NaN;
      this.selectedMaxColIndex=Number.NaN;
      this.selectedMinRowIndex=Number.NaN;
      this.selectedMinRowIndex=Number.NaN;
      this.pickedColIndex=Number.NaN;
      this.pickedRowIndex=Number.NaN;
      console.log("执行了清理单元格所有的，为何？");
      this.isShowOperationBar=false;
    },
    pushCurSelectCell(rowIndex,colIndex){
      if(Number.isNaN(this.selectedMinRowIndex)){
        this.selectedMinRowIndex=rowIndex;
        this.selectedMaxRowIndex=rowIndex;
        this.selectedMinColIndex=colIndex;
        this.selectedMaxColIndex=colIndex;
        this.pickedColIndex=colIndex;
        this.pickedRowIndex=rowIndex;
        return;
      }
      this.selectedMinRowIndex=Math.min(rowIndex,this.pickedRowIndex);
      this.selectedMaxRowIndex=Math.max(rowIndex,this.pickedRowIndex);
      this.selectedMinColIndex=Math.min(colIndex,this.pickedColIndex);
      this.selectedMaxColIndex=Math.max(colIndex,this.pickedColIndex);

      console.log(this.pickedRowIndex,this.selectedMinRowIndex,this.selectedMaxRowIndex,"--",this.pickedColIndex,this.selectedMinColIndex,this.selectedMaxColIndex);
    },
    handleMouseMove(event) {
      const target = document.elementFromPoint(event.clientX, event.clientY);
      if (target && target.tagName === 'TD') {
        console.log(target);
        const rowIndex=target.dataset.rowindex;
        const colIndex=target.dataset.colindex;
        this.pushCurSelectCell(Number(rowIndex),Number(colIndex));
      }
    },
    //控制是否按下移动td能否拖拽单元格
    tdMouseDown(){
      if(event.target.nodeName==="TD"){
        this.cellIsMouseMove=true;
        this.isShowOperationBar=false;
        this.pickedCellX=event.clientX;
        this.pickedCellY=event.clientY;
        event.stopPropagation(); // 阻止事件冒泡到draggable组件
        event.preventDefault();  // 阻止默认行为，以防万一
      }
    },
    tdMouseMove(){
      if(this.cellIsMouseMove){
        console.log("移动了",event.clientX,event.clientY);
        this.handleMouseMove(event);
        event.stopPropagation(); // 阻止事件冒泡到draggable组件
        event.preventDefault();
      }
    },
    //计算单元格操作柄的位置
    calculateCellOperationBarLocation(event){
      const rect = this.$refs.mytable.getBoundingClientRect();
      const refLeft=rect.x;
      const refTop=rect.y-this.padding;
      this.operationBarPosition.left=(event.clientX-refLeft+50)+'px';
      this.operationBarPosition.top=(event.clientY-refTop-50)+'px';
      console.log(this.operationBarPosition);
      this.isShowOperationBar=true;
    },
    sourceTargetClickIsTD(){
      const isClickTDViewFromWrapperDiv=  event.target.nodeName === "TD"||event.target.nodeName === "TR"||event.target.nodeName === "TBODY";
      if(!isClickTDViewFromWrapperDiv){
        const isFromChild = event.target.closest('.cell-operation-bar');
        if(!isFromChild){
          this.isShowOperationBar=false;
          this.isClickedAtOperationBar=false;
          console.log("点击了target的类型为",event.target);
        }else{
          console.log("dianle来自cell-operation-bar类");
        }

      }
    },
    tdMouseUp(){
      if(this.cellIsMouseMove){
        this.pickedCellX=0;
        this.pickedCellY=0;
        // console.log(this.writableIsClickTD);
      }
      this.cellIsMouseMove=false;
      this.writableIsClickTD=true;
      this.calculateCellOperationBarLocation(event);
    },
    //和显示修改、配置单元格颜色有关的
    showTableConfig(item,rowIndex,colIndex){
      this.selectedMinColIndex=colIndex;
      this.selectedMaxColIndex=colIndex;
      this.selectedMinRowIndex=rowIndex;
      this.selectedMaxRowIndex=rowIndex;
      this.pickedColIndex=colIndex;
      this.pickedRowIndex=rowIndex;
      if(!item||item.length===0){
        return;
      }
      //todo 如果item[0]为空，则不允许调摄颜色。
      console.log(item[0],item[0].cellFields,item[0].cellFieldsVal);
      this.control.curComponent = item[0].cellFieldsVal;//字段值
      this.control.curFields=item[0].cellFields;//字段定义
    },

    //和操作表格线操作柄相关的写法
    getPercentColumnWidth(numWidth){
      return 100*numWidth/this.parentWidth+'%';
    },
    getRealWidthOfColumn(strWidth){
      return Number.parseFloat(strWidth)*this.parentWidth/100;
    },
    startResizingRow(rowIndex) {
      event.stopPropagation(); // 阻止事件冒泡到draggable组件
      event.preventDefault();  // 阻止默认行为，以防万一
      this.isResizingRow = true;
      this.resizingRowIndex = rowIndex;
      this.initialY = event.clientY;
      // console.log(this.initialY,"initialY");
      document.addEventListener('mousemove', this.resizeRow);
      document.addEventListener('mouseup', this.stopResizingRow);
    },
    resizeRow(event) {
      if (!this.isResizingRow) return;
      const deltaY = event.clientY - this.initialY;
      // console.log("deltaY",deltaY);
      // 调整行高，确保最小高度
      const newHeight = Math.max(30, this.rowHeights[this.resizingRowIndex] + deltaY);
      this.$set(this.rowHeights, this.resizingRowIndex, newHeight);
      this.initialY = event.clientY;
    },
    stopResizingRow() {
      this.isResizingRow = false;
      document.removeEventListener('mousemove', this.resizeRow);
      document.removeEventListener('mouseup', this.stopResizingRow);
    },
    startResizingColumn(columnIndex, rowIndex) {
      event.stopPropagation(); // 阻止事件冒泡到draggable组件
      event.preventDefault();  // 阻止默认行为，以防万一
      this.isResizingColumn = true;
      this.resizingColumnIndex = columnIndex;
      this.initialX = event.clientX;
      // console.log(event);
      console.log(this.initialX,"initialX");
      // 保存当前列的初始宽度，用于后续计算
      // this.initialColumnWidth = this.columnWidths[columnIndex];
      document.addEventListener('mousemove', this.resizeColumn);
      document.addEventListener('mouseup', this.stopResizingColumn);
    },
    resizeColumn(event) {
      console.log(event,"没进来纵向调整");
      if (!this.isResizingColumn) return;
      const deltaX = event.clientX - this.initialX;
      // 调整列宽，确保最小宽度

      const newWidth = Math.max(50, this.getRealWidthOfColumn(this.columnWidths[this.resizingColumnIndex]) + deltaX);
      // console.log(deltaX,newWidth,"最新宽度");
      // 如果是非最后一列，需要调整相邻列的宽度
      if (this.resizingColumnIndex < this.columnWidths.length - 1) {
        const nextColumnWidth = this.getRealWidthOfColumn(this.columnWidths[this.resizingColumnIndex + 1]) - deltaX;

        // 确保相邻列的最小宽度
        if (nextColumnWidth >= 50) {
          this.$set(this.columnWidths, this.resizingColumnIndex, this.getPercentColumnWidth(newWidth));
          this.$set(this.columnWidths, this.resizingColumnIndex + 1, this.getPercentColumnWidth(nextColumnWidth));
        }
      } else {
        // 如果是最后一列，只调整当前列
        this.$set(this.columnWidths, this.resizingColumnIndex, this.getPercentColumnWidth(newWidth));
      }
      this.initialX = event.clientX;
    },
    stopResizingColumn() {
      this.isResizingColumn = false;
      document.removeEventListener('mousemove', this.resizeColumn);
      document.removeEventListener('mouseup', this.stopResizingColumn);
    },
  }
}
</script>

<style lang="scss" scoped>
.wrap {
  position: relative;
  .table{
    width: 100%;
    table-layout: fixed;
    .flex-td {
      word-wrap: break-word !important;
    }
  }
}
.resizable-cell {
  position: relative;
}
th, td {
  //overflow: hidden;
  box-sizing: border-box;
  border: 1px solid #ccc;
  text-align: left;
  position: relative;
}
td:hover{
  cursor: cell;
}
td.selected-cell{
  border: 1px solid #155bd4 !important;
  background-color: rgba(30, 144, 255, 0.5) !important;
}
.no-border{
  border: none !important;
}

.resizable-cell {
  position: relative;
}

.row-resizer {
  width: 100%;
  height: 1px;
  cursor: ns-resize;
  //background-color: #999;
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 998;
}

.row-resizer:hover {
  background-color: #0000ff;
}

.col-resizer {
  width: 1px;
  //height: 4000px;
  height: 100%;
  cursor: ew-resize;
  //background-color: #999;
  position: absolute;
  //top: -2000px;
  right: 0;
  bottom: 0;
  z-index: 998;
}

.col-resizer:hover {
  background-color: #0000ff;
}
</style>
