<!--
 * @Description: tab组件
 * @Autor: WangYuan
 * @Date: 2021-05-21 19:13:20
 * @LastEditors: WangYuan
 * @LastEditTime: 2022-01-01 09:13:02
-->
<template>
  <div class="wrap" :style="{paddingBottom:padding+'px',paddingTop:padding+'px'}">
    <table class="table" :border="isShowBorder?1:0">
      <tbody>
        <tr v-for="(item,index) in tableDataArr2" :style="{height:rowHeights[index]+'px'}" :key="index">
          <td :class="[isShowBorder?'':'no-border',isSelectedCell(index,index2)?'selected-cell':'']" v-for="(item2,index2) in item" :key="index2" :ref="`td_${index}_${index2}`" @mousedown="tdMouseDown" @mousemove="tdMouseMove" @mouseup="tdMouseUp" :valign="model" @click.stop="showTableConfig(item2,index,index2)" class="resizable-cell flex-td" :style="getCellStyle(columnWidths,item2,index2)">
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
      pickedCellY: 0,//控制拖拽柄拖拽位置的逻辑Y
      pickedCellX: 0,//控制拖拽柄拖拽位置的逻辑X
      cellIsMouseMove:false,
      curOriginalHoverCells:[],//原始经过的单元格
      allCellRefs:[],//通过ref绑定的所有的td对象
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
      this.rowHeights.push(30);
    }
    this.collectTds();
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
    //真正要被选择的单元格
    curSelectedCells(){
      if(!this.curOriginalHoverCells||this.curOriginalHoverCells.length<1){
        return [];
      }else if(this.curOriginalHoverCells.length===1){
        return [this.curOriginalHoverCells[0]];
      }else{
        const {minRowIndex,maxRowIndex,minColIndex,maxColIndex}=this.calculateTriblePoints(this.curOriginalHoverCells);
        const res=[];
        for(let i=minRowIndex;i<=maxRowIndex;i++){
          for(let j=minColIndex;j<=maxColIndex;j++){
            res.push({
              rowIndex:i,
              colIndex:j
            });
          }
        }
        return res;
      }
    }
  },
  watch:{
    tableDataArr2:{
      handler(newVal){
        this.collectTds();
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
      handler(value){
        // console.log(value);
        this.columnWidths=[];
        for(let i=0;i<this.colCount;i++){
          this.columnWidths.push(100/this.colCount+"%");
        }
      }
    }
  },
  methods:{
    getCellStyle(columnWidths,list,index){
      if(!list||list.length===0){
        return {
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
    collectTds() {
      // 遍历所有的行和列来收集td的引用
      this.allCellRefs=[];
      this.tableDataArr2.forEach((row, rowIndex) => {
        row.forEach((cell, cellIndex) => {
          const tdRef = `td_${rowIndex}_${cellIndex}`;
          if (this.$refs[tdRef]) {
            this.allCellRefs.push({
              elem:this.$refs[tdRef][0],
              rowIndex:rowIndex,
              colIndex:cellIndex,
            }); // 注意这里使用来获取DOM元素
          }
        });
      });
      console.log(this.allCellRefs,"收集的所有refs");
    },
    isSelectedCell(rowIndex,colIndex){
      const matchedItem=this.curSelectedCells.find(item=>item.rowIndex===rowIndex&&item.colIndex===colIndex);
      return !!matchedItem;
    },
    pushCurSelectCell(rowIndex,colIndex){
      const matchedItem=this.curOriginalHoverCells.find(item=>item.rowIndex===rowIndex&&item.colIndex===colIndex);
      if(!matchedItem){
        this.curOriginalHoverCells.push({
          rowIndex,
          colIndex
        });
        console.log("push后的对象",this.curOriginalHoverCells);
      }
    },
    popCurSelectCell(rowIndex,colIndex){
      const matchedIndex=this.curOriginalHoverCells.findIndex(item=>item.rowIndex===rowIndex&&item.colIndex===colIndex);
      // console.log(matchedIndex,"移除的index",this.curOriginalHoverCells);
      if(matchedIndex!==-1&&matchedIndex!==0){
        const {minRowIndex,maxRowIndex,minColIndex,maxColIndex}=this.calculateTriblePoints(this.curOriginalHoverCells);
        const newCurOriginalHoverCells=_.cloneDeep(this.curOriginalHoverCells).splice(matchedIndex,1);
        const {minRowIndexNew,maxRowIndexNew,minColIndexNew,maxColIndexNew}=this.calculateTriblePoints(newCurOriginalHoverCells);
        if(minRowIndex!==minRowIndexNew||maxRowIndex!==maxRowIndexNew||minColIndex!=minColIndexNew||maxColIndex!=maxColIndexNew){
          this.curOriginalHoverCells.splice(matchedIndex,1);
        }
      }
    },
    calculateTriblePoints(curOriginalHoverCells){
      const minRowIndex=curOriginalHoverCells.sort((x,y)=>{
        return x.rowIndex<y.rowIndex?-1:x.rowIndex>y.rowIndex?1:0;
      })[0].rowIndex;
      const maxRowIndex=curOriginalHoverCells.sort((x,y)=>{
        return x.rowIndex<y.rowIndex?1:x.rowIndex>y.rowIndex?-1:0;
      })[0].rowIndex;
      const minColIndex=curOriginalHoverCells.sort((x,y)=>{
        return x.colIndex<y.colIndex?-1:x.colIndex>y.colIndex?1:0;
      })[0].colIndex;
      const maxColIndex=curOriginalHoverCells.sort((x,y)=>{
        return x.colIndex<y.colIndex?1:x.colIndex>y.colIndex?-1:0;
      })[0].colIndex;
      return {
        minRowIndex,
        maxRowIndex,
        minColIndex,
        maxColIndex
      }
    },
    handleMouseMove(event) {
      // 获取鼠标坐标
      const mouseX = event.clientX;
      const mouseY = event.clientY;

      // 遍历所有 td 元素来检查鼠标是否在其边界内
      const tds = this.allCellRefs;
      for (let td of tds) {
        const rect = td.elem.getBoundingClientRect();
        if (
            mouseX >= rect.left &&
            mouseX <= rect.right &&
            mouseY >= rect.top &&
            mouseY <= rect.bottom
        ) {
          // 如果鼠标在 td 边界内，则记录该 td 的位置
          this.pushCurSelectCell(td.rowIndex,td.colIndex);
        }else{
          this.popCurSelectCell(td.rowIndex,td.colIndex);
        }
      }
    },
    //控制是否按下移动td能否拖拽单元格
    tdMouseDown(){
      if(event.target.nodeName==="TD"){
        this.cellIsMouseMove=true;
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
    tdMouseUp(){
      if(this.cellIsMouseMove){
        this.pickedCellX=0;
        this.pickedCellY=0;
      }
      this.cellIsMouseMove=false;
    },
    //和显示修改、配置单元格颜色有关的
    showTableConfig(item,rowIndex,colIndex){
      this.curOriginalHoverCells=[{
        rowIndex,
        colIndex
      }];
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
      console.log(this.initialY);
      document.addEventListener('mousemove', this.resizeRow);
      document.addEventListener('mouseup', this.stopResizingRow);
    },
    resizeRow(event) {
      if (!this.isResizingRow) return;
      const deltaY = event.clientY - this.initialY;
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
      // 保存当前列的初始宽度，用于后续计算
      // this.initialColumnWidth = this.columnWidths[columnIndex];
      document.addEventListener('mousemove', this.resizeColumn);
      document.addEventListener('mouseup', this.stopResizingColumn);
    },
    resizeColumn(event) {
      if (!this.isResizingColumn) return;
      const deltaX = event.clientX - this.initialX;
      // 调整列宽，确保最小宽度
      const newWidth = Math.max(50, this.getRealWidthOfColumn(this.columnWidths[this.resizingColumnIndex]) + deltaX);
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
  z-index: 999;
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
  z-index: 999;
}

.col-resizer:hover {
  background-color: #0000ff;
}
</style>
