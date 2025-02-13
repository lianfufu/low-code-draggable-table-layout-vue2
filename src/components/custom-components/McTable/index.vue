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
    <cell-operation-bar v-show="isClickedAtOperationBar||(isShowOperationBar&&writableIsClickTD)" @updateCurCellSplitInfo="doSplitRowOrColumn" @doMergeCells="doMergeRowOrColumn" @doDeleteRow="doDeleteLocatedRow" @doDeleteCol="doDeleteLocatedCol" :isClickedAtOperationBar.sync="isClickedAtOperationBar" :positionVal="operationBarPosition"/>
    <table ref="mytable" class="table" :border="isShowBorder?1:0">
      <col v-for="(item,index) in columnWidths" :key="index" :style="{width:item+'%'}" />
      <tbody>
        <tr v-for="(item,index) in tableDataArr2" :style="{height:rowHeights[index]+'px'}" :key="index">
          <td :data-rowIndex="index" :data-colIndex="index2" :data-colSpan="item2[0]?item2[0].colSpan:1" :data-rowSpan="item2[0]?item2[0].rowSpan:1"  v-if="item2.length>0" :colspan="item2[0]?item2[0].colSpan:1" :rowspan="item2[0]?item2[0].rowSpan:1" :class="[isShowBorder?'':'no-border',isSelectedCell(index,index2)?'selected-cell':'']" v-for="(item2,index2) in item" :key="index2" @mousedown="tdMouseDown" @mousemove="tdMouseMove" @mouseup="tdMouseUp" :valign="model" @click.stop="showTableConfig(item2,index,index2,item2[0]?item2[0].rowSpan:1,item2[0]?item2[0].colSpan:1)" class="resizable-cell flex-td" :style="getCellStyle(columnWidths,item2,index2)">
            <McTableItemContainer>
              <ControlNestWidget :cellColSpan="item2[0]?item2[0].colSpan:1" :cellRowSpan="item2[0]?item2[0].rowSpan:1" :cell-col-index="index2" :cell-row-index="index" :isWidget="true" @updateTableChildData="doUpdateWidgetsForDel(index,index2)" @update:widgets="doUpdateWidgets" :widgets.sync="item2"/>
            </McTableItemContainer>
            <RowResizer :index="index" :rowHeights="rowHeights"/>
            <ColumnResizer :index="index" :index2="index2" :item2="item2" :colCount="colCount" :columnWidths="columnWidths" :parentWidth="parentWidth"/>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>

import {lcm} from "@/utils/mathUtils";
export default {
  name: 'McTable',
  data(){
    return {
      tabData:[],//绑定到页面的二维数组
      columnWidths:[],//所有列的列宽数组
      rowHeights:[],//所有行的行高数组
      myColCount:3,//列数
      myRowCount:2,//行数
      parentWidth:430,//当前画布宽度
      cellIsMouseMove:false,//用于控制计算鼠标移过的矩形范围的单元格被选择
      selectedMinRowIndex:Number.NaN,//选择框的左上角点的RowIndex
      selectedMaxRowIndex:Number.NaN,//选择框的右下角点的RowIndex
      selectedMinColIndex:Number.NaN,//选择框的左上角点的ColIndex
      selectedMaxColIndex:Number.NaN,//选择框的右下角点的ColIndex
      pickedRowIndex:Number.NaN,//按下第一次鼠标时的行索引
      pickedColIndex:Number.NaN,//按下第一次鼠标时的列索引
      pickedRowSpan:Number.NaN,//按下第一次鼠标时的单元格的行跨数
      pickedColSpan:Number.NaN,//按下第一次鼠标时的单元格的列跨数
      operationBarPosition:{
        left:0,
        top:0,
      },//操作栏相对于table的左上角点的位置
      isToChangeRowByNoneUI:false,//是否修改了行数是由于合并、拆分、删除单元格所导致的，而非右侧配置区的行数number slider导致的
      isToChangeColByNoneUI:false,//是否修改了列数是由于合并、拆分、删除单元格所导致的，而非右侧配置区的行数number slider导致的
      isShowOperationBar:false,//为了控制单元格操作栏的显隐
      writableIsClickTD:false,//为了控制单元格操作栏的显隐
      isClickedAtOperationBar:false,//判断是否点击了操作柄内部的元素
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
      default:true//是否显示表格及cell的边界线
    },
    globalCellBgc:{
      type:String,
      default:"globalCellBgc"//全局单元格样式
    }
  },
  mounted() {
    for(let i=0;i<this.colCount;i++){
      this.columnWidths.push(100/this.colCount);
    }
    
    for(let j=0;j<this.rowCount;j++){
      this.rowHeights.push(40);
    }
  },
  computed:{
    tableDataArr2(){
      console.log("删除后重新计算tableDataArr2");
      const res=[];
      const tdRowColIndexToRemove=[];
      for (let i=0;i<this.rowCount;i++){
        res[i]=[];
        for (let j=0;j<this.colCount;j++){
          //判断当前遍历的i，j是否属于被覆盖的单元格索引
          const matched=tdRowColIndexToRemove.findIndex(item=>item.rowIndex===i&&item.colIndex===j);
          if(matched!==-1){
            res[i][j]=[];
            tdRowColIndexToRemove.splice(matched,1);
            continue;
          }
          //获取component.json中预定义的匹配rowindex和colindex的项
          const matchedChild=this.tabData.filter(item=>item.rowIndex===i&&item.colIndex===j);
          if(matchedChild&&matchedChild.length>0){
            if(matchedChild.length===1){
              const first=matchedChild[0];
              first.id=this.$getRandomCode(8);
              res[i][j]=[first];
            }else{
              res[i][j]=matchedChild;
            }
            const rowSpan=matchedChild[0].rowSpan;//认为多个同index的单元格的rowSpan数据一致
            const colSpan=matchedChild[0].colSpan;//认为多个同index的单元格的colSpan数据一致
            if(rowSpan!==1||colSpan!==1){
              for(let k=i;k<rowSpan+i;k++){
                for(let l=j;l<colSpan+j;l++){
                  if(k===i&&l===j){
                    continue;
                  }
                  tdRowColIndexToRemove.push({
                    rowIndex:k,
                    colIndex:l
                  });
                }
              }
            }
          }else{
            res[i][j]=[{
              id:this.$getRandomCode(8),
              component:"MCTextContainer",
              rowIndex: i,
              colIndex: j,
              rowSpan: 1,
              colSpan: 1,
            }];
          }
        }
      }
      // tdRowColIndexToRemove.forEach(toRemoveItem=>{
      //   const matched=this.tabData.findIndex(item=>item.rowIndex===toRemoveItem.rowIndex&&item.colIndex===toRemoveItem.colIndex);
      //   if(matched!==-1){
      //     this.tabData.splice(matched,1);
      //   }
      // })
      return res;
    },
    isClickedTD(){
      if(!this.control.curComponent){
        console.log("这里curComponent不存在才给的false");
        return false;
      }
      if(!this.control.curComponent.component||this.control.curComponent.component==="McTable"||this.control.curComponent.component==="MCTextContainer"){
        return true;//因为设定过当点击td，这个时候没有设置component属性
      }
      console.log("其他情况才给的false",this.control.curComponent,this.control.curComponent.component==="McTable");
      return false;
    },
  },
  watch:{
    myRowCount:{
      handler(value){
        this.$emit("update:rowCount",value);
        console.log("发送了行数数据");
      },
      immediate:true,
    },
    myColCount:{
      handler(value){
        this.$emit("update:colCount",value);
      },
      immediate:true,
    },
    children:{
      handler(value){
        this.tabData=value;
      },
      immediate:true,
      deep:true
    },
    tableDataArr2:{
      handler(value){
        console.log(value,"tableDataArr2");
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
        this.myColCount=value;
        if(!this.isToChangeColByNoneUI){
          // 只要修改了列的个数，先前的列的宽度设置都将被重置
          this.columnWidths=[];
          for(let i=0;i<this.colCount;i++){
            this.columnWidths.push(100/this.colCount);
          }
        }else{
          this.isToChangeColByNoneUI=false;
        }
      },
    },
    rowCount:{
      handler(value,oldValue){
        this.myRowCount=value;
        if(value>oldValue){//原有的高度值不要被改变
          for(let i=oldValue;i<this.rowCount;i++){
            this.rowHeights.push(40);
          }
        }else{
          if(!this.isToChangeRowByNoneUI){
            for(let i=0;i<oldValue-this.rowCount;i++){
              this.rowHeights.pop();
            }
          }else{
            this.isToChangeRowByNoneUI=false;
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
        if(!value&&!this.isClickedAtOperationBar){
          this.clearCurSelectedCells();
        }
      },
      deep:true,//迷惑的地方
    },
  },
  methods:{
    //计算和设置单元格样式
    getCellStyle(columnWidths,list,index){
      const colSpan=list[0]?list[0].colSpan:1;
      let cellWidth=0;
      for(let i=index;i<index+colSpan;i++){
        cellWidth+=columnWidths[i];
      }

      //todo 这种区别对待的，最好要做一个统一处理
      if(!list||list.length===0){
        return {
          width:cellWidth+"%",
          backgroundColor:this.globalCellBgc
        };
      }
      console.log(list[0].cellFieldsVal?.contentBgc||this.globalCellBgc);
      return {
        width:cellWidth+"%",
        padding:list[0].cellFieldsVal?.padding+'px',
        backgroundColor:list[0].cellFieldsVal?.contentBgc??'#ffffff'
      }
    },

    //#region 物料对应实际数据的添加删除逻辑
    //当点击物料的删除按钮时，执行此方法
    doUpdateWidgetsForDel(rowIndex,colIndex,delValue){
      const target=this.tabData.findIndex(item=>item.rowIndex===rowIndex&&item.colIndex===colIndex);
      if(target!==-1){
        // this.tabData.splice(target,1);//初始版本写法
        //下面是优化，针对当删除到最后一个内容时，并不真正删除，而是将其变成MCTextContainer
        const allMatchedItems=this.tabData.filter(item=>item.rowIndex===rowIndex&&item.colIndex===colIndex);
        const colSpan=allMatchedItems[0].colSpan;
        const rowSpan=allMatchedItems[0].rowSpan;
        this.tabData.splice(target,1);
        if(allMatchedItems.length===1){
          console.log(allMatchedItems,"进来了计算allMatchedItems");
          this.tabData.push({
            id:this.$getRandomCode(8),
            component:"MCTextContainer",
            rowIndex: rowIndex,
            colIndex: colIndex,
            rowSpan: rowSpan,
            colSpan: colSpan,
          });
        }
      }
    },
    //当拖入新的物料数据时，执行此方法
    doUpdateWidgets(newValue){
      const newItems=[];//加入新对象的逻辑
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
    //#endregion 物料对应实际数据的添加删除逻辑

    //和显示修改、配置单元格颜色有关的
    showTableConfig(item,rowIndex,colIndex,rowSpan,colSpan){
      this.selectedMinColIndex=colIndex;
      this.selectedMaxColIndex=colIndex+colSpan-1;
      this.selectedMinRowIndex=rowIndex;
      this.selectedMaxRowIndex=rowIndex+rowSpan-1;
      this.pickedColIndex=colIndex;
      this.pickedRowIndex=rowIndex;
      this.pickedRowSpan=rowSpan;
      this.pickedColSpan=colSpan;
      if(!item||item.length===0){
        return;
      }
      //todo 如果item[0]为空，则不允许调摄颜色。
      console.log(item[0],item[0].cellFields,item[0].cellFieldsVal);
      this.control.curComponent = item[0].cellFieldsVal;//字段值
      this.control.curFields=item[0].cellFields;//字段定义
    },

    //#region UI交互单元格：选择单元格、清空选择单元格、添加/减少选择单元格
    //管理选中的单元格
    isSelectedCell(rowIndex,colIndex){
      if(Number.isNaN(this.selectedMinColIndex)){
        return false;
      }
      return this.selectedMinRowIndex<=rowIndex&&this.selectedMaxRowIndex>=rowIndex&&this.selectedMinColIndex<=colIndex&&this.selectedMaxColIndex>=colIndex;
    },
    //清除所有选择的单元格和隐藏操作栏
    clearCurSelectedCells(){
      this.selectedMinColIndex=Number.NaN;
      this.selectedMaxColIndex=Number.NaN;
      this.selectedMinRowIndex=Number.NaN;
      this.selectedMinRowIndex=Number.NaN;
      this.pickedColIndex=Number.NaN;
      this.pickedRowIndex=Number.NaN;
      this.pickedRowSpan=Number.NaN;
      this.pickedColSpan=Number.NaN;
      console.log("执行了清理单元格所有的，为何？");
      this.isShowOperationBar=false;
    },
    //鼠标按下事件处理器，控制是否按下移动td能否拖拽单元格。只有当按下的位置是td元素时，而非td元素内部的其他元素时，才允许触发移动鼠标更新选择范围的事件处理器
    tdMouseDown(){
      if(event.target.nodeName==="TD"){
        this.cellIsMouseMove=true;
        this.isShowOperationBar=false;//按下鼠标，隐藏操作栏
        this.pickedCellX=event.clientX;
        this.pickedCellY=event.clientY;
        event.stopPropagation(); // 阻止事件冒泡到draggable组件
        event.preventDefault();  // 阻止默认行为，以防万一
      }
    },
    //根据鼠标最新移入的单元格的行列索引及跨数，计算更新选择范围
    pushCurSelectCell(rowIndex,colIndex,rowSpan,colSpan){
      if(Number.isNaN(this.selectedMinRowIndex)){
        this.selectedMinRowIndex=rowIndex;
        this.selectedMaxRowIndex=rowIndex;
        this.selectedMinColIndex=colIndex;
        this.selectedMaxColIndex=colIndex;
        this.pickedColIndex=colIndex;
        this.pickedRowIndex=rowIndex;
        this.pickedRowSpan=rowSpan;
        this.pickedColSpan=colSpan;
        return;
      }
      this.selectedMinRowIndex=Math.min(rowIndex,this.pickedRowIndex);
      this.selectedMaxRowIndex=Math.max(rowIndex+rowSpan-1,this.pickedRowIndex);
      this.selectedMinColIndex=Math.min(colIndex,this.pickedColIndex);
      this.selectedMaxColIndex=Math.max(colIndex+colSpan-1,this.pickedColIndex);
      //然后考虑初始选择的如果是跨行列的对象效应，将会这么处理
      if(this.pickedRowSpan!==1|| this.pickedColSpan!==1){
        this.selectedMaxRowIndex=Math.max(this.selectedMaxRowIndex,this.pickedRowIndex+this.pickedRowSpan-1);
        this.selectedMaxColIndex=Math.max(this.pickedColIndex+this.pickedColSpan-1,this.selectedMaxColIndex);
      }

      console.log(this.pickedRowIndex,this.selectedMinRowIndex,this.selectedMaxRowIndex,"--",this.pickedColIndex,this.selectedMinColIndex,this.selectedMaxColIndex);
    },
    //鼠标移入核心逻辑，只有当移入的元素的最内层根本的元素是TD单元格时，才更新选择范围
    handleMouseMove(event) {
      const target = document.elementFromPoint(event.clientX, event.clientY);
      if (target && target.tagName === 'TD') {
        console.log(target);
        const rowIndex=target.dataset.rowindex;
        const colIndex=target.dataset.colindex;
        this.pushCurSelectCell(Number(rowIndex),Number(colIndex),Number(target.dataset.rowspan),Number(target.dataset.colspan));
      }
    },
    //鼠标移入事件的事件处理器
    tdMouseMove(){
      if(this.cellIsMouseMove){
        console.log("移动了",event.clientX,event.clientY);
        this.handleMouseMove(event);
        event.stopPropagation(); // 阻止事件冒泡到draggable组件
        event.preventDefault();
      }
    },
    //计算单元格操作栏的位置
    calculateCellOperationBarLocation(event){
      const rect = this.$refs.mytable.getBoundingClientRect();
      const refLeft=rect.x;
      const refTop=rect.y-this.padding;
      this.operationBarPosition.left=(event.clientX-refLeft+50)+'px';
      this.operationBarPosition.top=(event.clientY-refTop-50)+'px';
      console.log(this.operationBarPosition);
      this.isShowOperationBar=true;
    },
    //采用事件委托的方式，控制点击cell-operation-bar组件内部的哪些元素以后，不再去显示操作栏，即点击删除行/列按钮后，不再显示操作栏。
    sourceTargetClickIsTD(){
      const isClickTDViewFromWrapperDiv=  event.target.nodeName === "TD"||event.target.nodeName === "TR"||event.target.nodeName === "TBODY";//如果是false，才有可能选择的是来自于cell-operation-bar组件内部的哪些元素
      if(!isClickTDViewFromWrapperDiv){
        const isFromChild = event.target.closest('.cell-operation-bar') && !event.target.closest('.delete-row') && !event.target.closest('.delete-col');
        if(!isFromChild){
          this.isShowOperationBar=false;
          this.isClickedAtOperationBar=false;
          console.log("点击了target的类型为",event.target);
        }else{
          console.log("dianle来自cell-operation-bar类");
        }

      }
    },
    //抬起鼠标的事件处理器，取消当前所处于的选择单元格状态（cellIsMouseMove）
    tdMouseUp(){
      if(this.cellIsMouseMove){
        this.pickedCellX=0;
        this.pickedCellY=0;
      }
      this.cellIsMouseMove=false;
      this.writableIsClickTD=true;
      this.calculateCellOperationBarLocation(event);
    },
    //#endregion UI交互单元格：选择单元格、清空选择单元格、添加/减少选择单元格

    //拆分合并、删除行、删除列相关的
    //#region 控制单元格的宽高，当由于拆分合并、删除行、删除列所导致单元格的行列宽/高尺寸发生变化时
    //要求索引从小到大传入，确保合并单元格前后的总高度保持不变
    mergeCellHeight(allMergeIndices){
      let totalHeight=0;
      allMergeIndices.forEach(item=>{
        totalHeight+=this.rowHeights[item];
      });
      this.rowHeights[allMergeIndices[0]]=totalHeight;
      console.log(totalHeight,"totalHeight",allMergeIndices,this.rowHeights[allMergeIndices[0]],this.rowHeights);
      allMergeIndices.splice(0,1);
      const reverseIndices=allMergeIndices.reverse();
      console.log(reverseIndices,"reverseIndices");
      reverseIndices.forEach(item=>{
        this.rowHeights.splice(item,1);
      });
      console.log(this.rowHeights);
    },
    //要求索引从小到大传入，合并单元格，涉及到列的合并时。行贯通，而导致的列数减少的情况，确保合并单元格前后的总宽度保持不变
    mergeCellWidth(allMergeIndices){
      let totalWidth=0;
      allMergeIndices.forEach(item=>{
        totalWidth+=this.columnWidths[item];
      });
      this.columnWidths[allMergeIndices[0]]=totalWidth;
      // console.log(totalHeight,"totalHeight",allMergeIndices,this.rowHeights[allMergeIndices[0]],this.rowHeights);
      allMergeIndices.splice(0,1);
      const reverseIndices=allMergeIndices.reverse();
      console.log(reverseIndices,"reverseIndices");
      reverseIndices.forEach(item=>{
        this.columnWidths.splice(item,1);
      });
    },
    //删除所选单元格的高度，确保删除某行单元格时，对应位置的行高也要跟着删除（未被删除的单元格高度保持不变）。
    removeCellHeight(allIndiceToRemove){
      const reverseIndices=allIndiceToRemove.reverse();
      reverseIndices.forEach(item=>{
        this.rowHeights.splice(item,1);
      });
    },
    //删除所选单元格的宽度，确保删除某列单元格时，对应位置的列宽也要跟着删除（被删除的宽度，平均附加到未被删除的单元格宽度上）。
    removeCellWidth(allIndiceToRemove){
      let removeTotalWidths=0;
      const reverseIndices=allIndiceToRemove.reverse();
      reverseIndices.forEach(item=>{
        removeTotalWidths+=this.columnWidths[item];
        this.columnWidths.splice(item,1);
      });
      const evenlyAddWidth=removeTotalWidths/this.columnWidths.length;
      for (let i = 0; i < this.columnWidths.length; i++) {
        this.columnWidths[i] += evenlyAddWidth;
      }
    },
    //拆分单元格前后的总高度保持不变，被拆分出来的单元格高度保持一致
    splitCellHeight(splitEveryCellHeight,addRowCount){
      for(let i=this.selectedMinRowIndex;i<=this.selectedMaxRowIndex;i++){
        this.rowHeights[i]=splitEveryCellHeight;
      }
      if(addRowCount===0){
        return;
      }
      if(this.selectedMaxRowIndex+1<this.rowHeights.length){
        this.rowHeights.splice(this.selectedMaxRowIndex+1,0,...new Array(addRowCount).fill(splitEveryCellHeight));
      }else{
        this.rowHeights.push(...new Array(addRowCount).fill(splitEveryCellHeight));
      }
      console.log(splitEveryCellHeight,this.rowHeights);
    },
    //拆分单元格前后的总宽度保持不变，被拆分出来的单元格高度保持一致
    splitCellWidth(splitEveryCellWidth,addColCount){
      for(let i=this.selectedMinColIndex;i<=this.selectedMaxColIndex;i++){
        this.columnWidths[i]=splitEveryCellWidth;
      }
      if(addColCount===0){
        return;
      }
      if(this.selectedMaxColIndex+1<this.columnWidths.length){
        this.columnWidths.splice(this.selectedMaxColIndex+1,0,...new Array(addColCount).fill(splitEveryCellWidth));
      }else{
        this.columnWidths.push(...new Array(addColCount).fill(splitEveryCellWidth));
      }
      console.log(splitEveryCellWidth,this.columnWidths);
    },
    //#endregion 控制单元格的宽高，由于拆分合并、删除行、删除列所导致单元格的行列宽/高尺寸发生变化时
    //#region 具体实现拆分合并、删除行、删除列
    //合并单元格
    doMergeRowOrColumn(){
      console.log("合并单元格");
      if(this.selectedMaxColIndex===this.selectedMinColIndex&&this.selectedMaxRowIndex===this.selectedMinRowIndex){
        return;
      }

      const mergeRowSpan=this.selectedMaxRowIndex-this.selectedMinRowIndex+1;
      const mergeColSpan=this.selectedMaxColIndex-this.selectedMinColIndex+1;
      const mergeRowIndex=this.selectedMinRowIndex;
      const mergeColIndex=this.selectedMinColIndex;
      let allMatchedItems = [];
      for(let i=this.selectedMinRowIndex;i<=this.selectedMaxRowIndex;i++){//合并后，让他不再被选中，因为之前的selectedMinRowIndex会自动更新，也不要有操作柄
        for(let j=this.selectedMinColIndex;j<=this.selectedMaxColIndex;j++){
          // const curMatchedItems=this.
          //todo 已经合并过的单元格，现在不支持嵌套合并。已解决
          //todo 合并导致的行数减少，需要更新后续数据。已解决

          //搜集获取此范围内的全部cells。是从tableData中进行搜寻。如果被搜寻的对象是跨单元格的，即已经合并后的对象，这个时候的交叉碰撞逻辑是，如果左上角的角点等于当前的i和j就被收集进来
          const curMatchedItems=this.tabData.filter(item=>item.rowIndex===i&&item.colIndex===j);
          if(curMatchedItems&&curMatchedItems.length>0){
            curMatchedItems.forEach(item=>{
              item.rowIndex=mergeRowIndex;
              item.colIndex=mergeColIndex;
              item.colSpan=mergeColSpan;
              item.rowSpan=mergeRowSpan;
            });
            console.log("合并后的curMatchedItems",curMatchedItems);
            allMatchedItems.push(...curMatchedItems);
          }
        }
      }
      //如果合并导致列数或行数发生了改变，除了要修改总的列数和行数信息外，还要先修改各个单元格的索引号
      //由于列贯通，需要减少单元格行数的情况。
      console.log(this.selectedMaxColIndex-this.selectedMinColIndex+1===this.colCount&&this.selectedMaxRowIndex!==this.selectedMinRowIndex,"由于列贯通，需要减少单元格行数的情况。");
      if(this.selectedMaxColIndex-this.selectedMinColIndex+1===this.colCount&&this.selectedMaxRowIndex!==this.selectedMinRowIndex){
        //需要减少的行数
        const rowCountToSubtract=this.selectedMaxRowIndex-this.selectedMinRowIndex;
        //计算从哪个位置开始减少
        const startRowIndexToSubtract=this.selectedMaxRowIndex+1;
        console.log(rowCountToSubtract,startRowIndexToSubtract,this.rowCount-rowCountToSubtract);
        //减少后的实际行数
        const restRowCount=this.rowCount-rowCountToSubtract;
        const map=new Map();
        for(let k=startRowIndexToSubtract;k<this.rowCount;k++){
          const matchedCurRowCells=this.tabData.filter(item=>item.rowIndex===k);
          if(matchedCurRowCells&&matchedCurRowCells.length>0){
            map.set(k-rowCountToSubtract,matchedCurRowCells);
          }
        }
        console.log(map,'此处的map');
        map.forEach((value,key)=>{
          console.log(value,"value");
          value.forEach(item=>{
            item.rowIndex=key;
          });
        });
        // console.log("由于列贯通，需要减少单元格行数的情况。",restRowCount,this.colCount);
        // this.$emit("updateRowColCount",restRowCount,this.colCount);
        // console.log('Emitted updateRowColCount event');
        // this.myRowCount=restRowCount;

        //如果构成造成行数减小，那么行的rowSpan将设置为1
        if(allMatchedItems&&allMatchedItems.length>0){
          allMatchedItems.forEach(item=>{
            item.rowSpan=1;
          });
          console.log("行span设置为1无效？",allMatchedItems);
        }

        const mergeIndices=[];
        for(let s=this.selectedMinRowIndex;s<=this.selectedMaxRowIndex;s++){
          mergeIndices.push(s);
        }
        this.mergeCellHeight(mergeIndices);

        this.isToChangeRowByNoneUI=true;
        this.myRowCount=restRowCount;
        //计算更新选择框
        this.selectedMaxRowIndex=this.selectedMaxRowIndex-rowCountToSubtract;
        // console.log(this.itemComponent.rowCount,restRowCount);

      }

      //todo 列操作
      //由于行贯通选择【纵向选择】，导致的列数减少的情况
      if(this.selectedMaxRowIndex-this.selectedMinRowIndex+1===this.rowCount&&this.selectedMaxColIndex!==this.selectedMinColIndex){
        //需要减少的列数
        const colCountToSubtract=this.selectedMaxColIndex-this.selectedMinColIndex;
        //计算从哪个位置开始减少
        const startColIndexToSubtract=this.selectedMaxColIndex+1;
        console.log(colCountToSubtract,startColIndexToSubtract,this.colCount-colCountToSubtract);
        //减少后的实际列数
        const restColCount=this.colCount-colCountToSubtract;
        const map=new Map();
        for(let k=startColIndexToSubtract;k<restColCount;k++){
          const matchedCurRowCells=this.tabData.filter(item=>item.colIndex===k);
          if(matchedCurRowCells&&matchedCurRowCells.length>0){
            map.set(k-colCountToSubtract,matchedCurRowCells);
          }
        }

        map.forEach((value,key)=>{
          console.log(value,"value");
          value.forEach(item=>{
            item.colIndex=key;
          });
        });
        // console.log("由于列贯通，需要减少单元格行数的情况。",restRowCount,this.colCount);
        // this.$emit("updateRowColCount",restRowCount,this.colCount);
        // console.log('Emitted updateRowColCount event');
        // this.myRowCount=restRowCount;

        //如果构成造成行数减小，那么行的rowSpan将设置为1
        if(allMatchedItems&&allMatchedItems.length>0){
          allMatchedItems.forEach(item=>{
            item.colSpan=1;
          });
          console.log("行span设置为1无效？",allMatchedItems);
        }

        const mergeIndices=[];
        for(let s=this.selectedMinColIndex;s<=this.selectedMaxColIndex;s++){
          mergeIndices.push(s);
        }
        this.mergeCellWidth(mergeIndices);

        this.isToChangeColByNoneUI=true;
        this.myColCount=restColCount;
        //计算更新选择框
        this.selectedMaxColIndex=this.selectedMaxColIndex-colCountToSubtract;
        // console.log(this.itemComponent.rowCount,restRowCount);
      }
    },
    //拆分单元格用的小逻辑，批量更新单元格的列索引和列跨数
    changeItemColIndexAndSpan(items){
      if(items?.size>0){
        items.forEach((value,key)=>{
          key.colIndex=value.colIndex;
          key.colSpan=value.colSpan;
        });
      }
    },
    //拆分单元格用的小逻辑，批量更新单元格的行索引和行跨数
    changeItemRowIndexAndSpan(items){
      if(items?.size>0){
        items.forEach((value,key)=>{
          key.rowIndex=value.rowIndex;
          key.rowSpan=value.rowSpan;
        });
      }
    },
    //拆分单元格，总体思路是先拆分列，再拆分行。doSplitRowOrColumn方法执行拆分列的逻辑，如果行也要拆分在doSplitRowOrColumn方法中调用doSplitRow的逻辑
    doSplitRowOrColumn(splitRowCount,splitColCount){
      console.log(splitRowCount,splitColCount,"要拆分单元格了",this.tabData);
      if(Number.isNaN(splitColCount)||Number.isNaN(splitRowCount)){
        //todo 都没有一些错误提示框，可采用el-modal实现
        return;
      }

      if(splitRowCount===1&&splitColCount===1){
        //本身选择一个，拆分目标为1行1列，相当于不用做拆分
        return;
      }

      //判断是选中了1个单元格还是多个，如果选择多个，则不支持拆分
      //原理：点击的那个单元格，会出现在最终选择区域的四个角点之一的位置处。
      const isSelectedMultiCells=this.selectedMaxRowIndex>this.pickedRowIndex+this.pickedRowSpan||this.selectedMaxColIndex>this.pickedColIndex+this.pickedColSpan||this.selectedMinRowIndex<this.pickedRowIndex||this.selectedMinColIndex<this.pickedColIndex;
      if(isSelectedMultiCells){
        console.warn("选择了多个单元格,无法拆分");
        return;
      }

      //计算由于拆分当前单元格，由于列拆分，而制造的总的单元格数。例如，当前单元格跨3列，被拆分为了2列，此时的制造总单元格为其最小公倍数6
      const newSelectedColSpanCount=lcm(this.pickedColSpan,splitColCount);
      const newSelectedRowSpanCount=lcm(this.pickedRowSpan,splitRowCount);

      const addColCount=newSelectedColSpanCount-this.pickedColSpan;//如果跨3列，被拆分成了3列，最小公倍数是3。因此，此时无需新增列
      const addRowCount=newSelectedRowSpanCount-this.pickedRowSpan;

      const everyNewCreateDataColSpan=newSelectedColSpanCount/splitColCount;
      if(!Number.isInteger(everyNewCreateDataColSpan)){
        throw new Error("最小公倍数逻辑异常，因为没有被整除"+everyNewCreateDataColSpan);
      }

      //计算拆分出来的内容的宽度
      let selectedTotalColWidth=0;
      for(let i=this.selectedMinColIndex;i<=this.selectedMaxColIndex;i++){
        selectedTotalColWidth+=this.columnWidths[i];
      }
      const splitEveryCellWidth=selectedTotalColWidth/newSelectedColSpanCount;

      //最后需要统一处理的对象，放置频繁触发响应式，且避免索引和跨数变更，导致的参照改变，而引发的潜在异常。
      let curCellData;//需要将colSpan设置为everyNewCreateDataColSpan
      const newCreatedData=[];
      const cellRecordsForFullIn=new Map();
      const cellRecordsForLeftIntersectedWith=new Map();
      const cellRecordsForRightIntersectedWith=new Map();
      const cellRecordsForFullOuter=new Map();
      const cellRecordsForFullRight=new Map();

      if(splitColCount>1){
        //先处理列拆分吧，暂不处理行拆分。
        for(let i=0;i<this.rowCount;i++){
          //无论哪次都要进行执行的，收集完全右侧的内容
          //当列数发生变化的时候才执行下面的调整右侧的colIndex
          // const rightCells=this.tabData.filter(item=>item.rowIndex===i&&item.colIndex>this.selectedMaxColIndex&&item.colIndex<this.colCount);
          //采用这种方式，目的是：必须右侧看不到的内容既然存在，必须也跟着更新，不然会看到内容区会多出来非视觉区的其他对象了。
          if(newSelectedColSpanCount>this.pickedColSpan){
            const rightCells=this.tabData.filter(item=>item.rowIndex===i&&item.colIndex>this.selectedMaxColIndex);
            if(rightCells&&rightCells.length>0){
              rightCells.forEach(item=>{
                if(!cellRecordsForFullRight.has(item)){
                  const newColIndex=item.colIndex+addColCount;
                  cellRecordsForFullRight.set(item,{
                    colSpan:item.colSpan,
                    colIndex:newColIndex,
                  });
                }
              })
            }
          }

          //i在选择的水平段范围时，只执行初次。此时selectedMinRowIndex就等于pickedRowIndex了，pickedMaxRowIndex等于this.pickedRowIndex+this.pickedRowSpan-1
          if(i===this.pickedRowIndex){
            //获取该陀合并后的数据item
            curCellData=this.tabData.filter(item=>item.rowIndex===this.pickedRowIndex&&item.colIndex===this.pickedColIndex);
            for(let m=this.pickedColIndex;m<this.pickedColIndex+newSelectedColSpanCount;m+=everyNewCreateDataColSpan){
              if(m===this.pickedColIndex){
                continue;
              }
              newCreatedData.push({
                id:this.$getRandomCode(8),
                component:"MCTextContainer",
                rowIndex:i,
                colIndex:m,
                rowSpan:this.pickedRowSpan,
                colSpan:everyNewCreateDataColSpan
              });
            }
            continue;
          }
          if(i>this.pickedRowIndex&&i<=this.pickedRowIndex+this.pickedRowSpan-1){
            continue;//为了确保该范围内只执行1次。
          }

          //执行非水平选择段的处理逻辑
          //步骤1：先处理完全落入，minColIndex和maxColIndex之间的对象
          //当列数发生变化的时候才执行下面的调整涉及到的列信息
          if(newSelectedColSpanCount>this.pickedColSpan){
            for(let j=this.selectedMinColIndex;j<=this.selectedMaxColIndex;j++){
              const curCellsFullInSelectedColRange = this.tabData.filter(item=>item.rowIndex===i&&item.colIndex===j&&(item.colSpan===1||item.colIndex+item.colSpan-1<=this.selectedMaxColIndex));

              if(curCellsFullInSelectedColRange&&curCellsFullInSelectedColRange.length>0){
                const curNewColIndex=(j-this.pickedColIndex)*newSelectedColSpanCount/this.pickedColSpan+this.pickedColIndex;

                curCellsFullInSelectedColRange.forEach(item=>{
                  //其实如果正确逻辑的话，这里的每次循环的结果curNewColSpan的值都是一样的
                  const curNewColSpan=item.colSpan*newSelectedColSpanCount/this.pickedColSpan;
                  if(!cellRecordsForFullIn.has(item)){
                    cellRecordsForFullIn.set(item,{
                      colIndex:curNewColIndex,
                      colSpan:curNewColSpan,
                    });
                  }
                });
              }
            }
            //左侧存在部分相交的cells
            const cellsLeftIntersectedWithSelectedRange = this.tabData.filter(item=>(item.colSpan!==1&&item.rowIndex===i&&item.colIndex<this.selectedMinColIndex)&&(item.colIndex+item.colSpan-1>=this.selectedMinColIndex&&item.colIndex+item.colSpan-1<=this.selectedMaxColIndex));
            if(cellsLeftIntersectedWithSelectedRange&&cellsLeftIntersectedWithSelectedRange.length>0){
              //cellRecordsForLeftIntersectedWith
              cellsLeftIntersectedWithSelectedRange.forEach(item=>{
                const colSpanCountToJustify=(item.colSpan+item.colIndex-1)-this.pickedColIndex+1;
                const restColSpan=item.colSpan-colSpanCountToJustify;
                if(restColSpan<1){
                  throw new Error("逻辑异常，左侧的非选择区域的长度小于1，但仍被归为左侧存在相交");
                }
                const curNewSpan=restColSpan+colSpanCountToJustify*newSelectedColSpanCount/this.pickedColSpan;
                if(!cellRecordsForLeftIntersectedWith.has(item)){
                  cellRecordsForLeftIntersectedWith.set(item,{
                    colIndex:item.colIndex,
                    colSpan:curNewSpan,
                  });
                }
              });
            }
            //单元格起于选择selectedMinColIndex，终点又大于selectedMinColIndex的单元格
            const cellsFullOutSelectedColRange = this.tabData.filter(item=>(item.colSpan!==1&&item.rowIndex===i&&item.colIndex<this.selectedMinColIndex)&&(item.colIndex+item.colSpan-1>this.selectedMaxColIndex));
            if(cellsFullOutSelectedColRange&&cellsFullOutSelectedColRange.length>0){
              //cellRecordsForLeftIntersectedWith
              cellsFullOutSelectedColRange.forEach(item=>{
                const restColSpan=item.colSpan-this.pickedColSpan;
                if(restColSpan<1){
                  throw new Error("逻辑异常，左侧的非选择区域的长度小于1，但仍被归为左侧存在相交");
                }
                const curNewSpan=restColSpan+newSelectedColSpanCount;
                if(!cellRecordsForFullOuter.has(item)){
                  cellRecordsForFullOuter.set(item,{
                    colIndex:item.colIndex,
                    colSpan:curNewSpan,
                  });
                }
              });
            }
            //右侧存在部分相交的cells
            const cellsRightIntersectedWithSelectedRange = this.tabData.filter(item=>(item.colSpan!==1&&item.rowIndex===i&&item.colIndex>=this.selectedMinColIndex&&item.colIndex<=this.selectedMaxColIndex)&&(item.colIndex+item.colSpan-1>this.selectedMaxColIndex));
            if(cellsRightIntersectedWithSelectedRange&&cellsRightIntersectedWithSelectedRange.length>0){
              cellsRightIntersectedWithSelectedRange.forEach(item=>{
                const colSpanCountToJustify=this.selectedMaxColIndex-item.colIndex+1;
                const restColSpan=item.colSpan-colSpanCountToJustify;
                if(restColSpan<1){
                  throw new Error("逻辑异常，右侧的非选择区域的长度小于1，但仍被归为右侧存在相交");
                }
                const curNewSpan=restColSpan+colSpanCountToJustify*newSelectedColSpanCount/this.pickedColSpan;
                //注意colIndex和左侧相交相比，此处要发生变化。
                const curNewColIndex=(item.colIndex-this.pickedColIndex)*newSelectedColSpanCount/this.pickedColSpan+this.pickedColIndex;
                if(!cellRecordsForRightIntersectedWith.has(item)){
                  cellRecordsForRightIntersectedWith.set(item,{
                    colIndex:curNewColIndex,
                    colSpan:curNewSpan,
                  });
                }
              })
            }
          }
        }

        //更新上述数据
        if(curCellData?.length>0){
          curCellData.forEach(item=>{
            item.colSpan=everyNewCreateDataColSpan;
          });
        }
        if(newCreatedData?.length>0){
          newCreatedData.forEach(item=>{
            this.tabData.push(item);
          });
        }
        this.changeItemColIndexAndSpan(cellRecordsForFullIn);
        this.changeItemColIndexAndSpan(cellRecordsForLeftIntersectedWith);
        this.changeItemColIndexAndSpan(cellRecordsForRightIntersectedWith);
        this.changeItemColIndexAndSpan(cellRecordsForFullOuter);
        this.changeItemColIndexAndSpan(cellRecordsForFullRight);

        //还要记得更新总的行列数。
        this.splitCellWidth(splitEveryCellWidth,addColCount);
        this.isToChangeColByNoneUI=true;
        this.myColCount=this.colCount+addColCount;
      }
      splitRowCount===1?this.clearCurSelectedCells():this.doSplitRow(splitRowCount,splitColCount,curCellData,newCreatedData,everyNewCreateDataColSpan);
    },
    doSplitRow(splitRowCount,splitColCount,curCellData,newCreatedData,newPickedColSpan){
      console.log("执行行拆分逻辑了",splitColCount,this.myColCount);
      if(splitRowCount===1){
        this.clearCurSelectedCells();
        return;
      }
      const isColHasSplit=splitColCount>1;
      //最大框选到的colMaxIndex要修改。其实pickedColSpan也要改，
      if(isColHasSplit){//如果大于1，则newCreatedData势必有值，也就是上边拆分列时，多拆出来对象时，那么它最大的列选择索引才发生变化。
        this.pickedColSpan=newPickedColSpan;
        const maxRightNewCreatedCell=newCreatedData.sort((x,y)=>x.colIndex>y.colIndex?-1:x.colIndex<y.colIndex?-1:0)[0];
        console.log(newCreatedData,maxRightNewCreatedCell,"maxRightNewCreatedCell",maxRightNewCreatedCell.colIndex+newPickedColSpan-1);
        this.selectedMaxColIndex=maxRightNewCreatedCell.colIndex+newPickedColSpan-1;
        console.log("最右侧选择的列索引",this.selectedMaxColIndex);
      }
      const newSelectedRowSpanCount=lcm(this.pickedRowSpan,splitRowCount);
      const addRowCount=newSelectedRowSpanCount-this.pickedRowSpan;

      const everyNewCreateDataRowSpan=newSelectedRowSpanCount/splitRowCount;
      if(!Number.isInteger(everyNewCreateDataRowSpan)){
        throw new Error("最小公倍数逻辑异常，因为没有被整除"+everyNewCreateDataRowSpan);
      }

      //计算拆分出来的内容的高度，拆分出来的如果有40高度以下的情况，需要额外处理
      let selectedTotalRowHeight=0;
      for(let i=this.selectedMinRowIndex;i<=this.selectedMaxRowIndex;i++){
        selectedTotalRowHeight+=this.rowHeights[i];
      }
      const splitEveryCellHeight=selectedTotalRowHeight/newSelectedRowSpanCount;
      //最后需要统一处理的对象，放置频繁触发响应式，且避免索引和跨数变更，导致的参照改变，而引发的潜在异常。
      // let curCellData;//需要将colSpan设置为everyNewCreateDataColSpan
      // const newCreatedData=[];
      console.log("everyNewCreateDataRowSpan",everyNewCreateDataRowSpan);
      const finalNewCreate=[];
      const cellRecordsForFullIn=new Map();
      const cellRecordsForLeftIntersectedWith=new Map();//这里指的就是top了
      const cellRecordsForRightIntersectedWith=new Map();//这里指的就是bottom了
      const cellRecordsForFullOuter=new Map();
      const cellRecordsForFullRight=new Map();
      console.log("thisTabData的值",this.tabData);
      if(!isColHasSplit){
        //对应于curCellData是undefined的情况，此时newCreatedData也是空的
        curCellData=this.tabData.filter(item=>item.rowIndex===this.pickedRowIndex&&item.colIndex===this.pickedColIndex);
        for(let m=this.pickedRowIndex;m<this.pickedRowIndex+newSelectedRowSpanCount;m+=everyNewCreateDataRowSpan){
          if(m===this.pickedRowIndex){
            continue;
          }
          finalNewCreate.push({
            id:this.$getRandomCode(8),
            component:"MCTextContainer",
            colIndex:this.pickedColIndex,
            rowIndex:m,
            colSpan:this.pickedColSpan,
            rowSpan:everyNewCreateDataRowSpan
          });
        }
      }else{
        newCreatedData.forEach(item=>{
          curCellData.push(item);//各列的内容都往待修改rowIndex和rowSpan的curCellData加
          //各个列的内容，再都水平切割
          for(let m=this.pickedRowIndex;m<this.pickedRowIndex+newSelectedRowSpanCount;m+=everyNewCreateDataRowSpan){
            if(m===this.pickedRowIndex){
              continue;
            }
            finalNewCreate.push({
              id:this.$getRandomCode(8),
              component:"MCTextContainer",
              colIndex:item.colIndex,
              rowIndex:m,
              colSpan:this.pickedColSpan,
              rowSpan:everyNewCreateDataRowSpan
            });
          }
        });
        //把最原始选择的区域的，经列切割后的最左侧列，拆出来新的项放到finalNewCreate，并最终push到最终结果中
        for(let m=this.pickedRowIndex;m<this.pickedRowIndex+newSelectedRowSpanCount;m+=everyNewCreateDataRowSpan){
          if(m===this.pickedRowIndex){
            continue;
          }
          finalNewCreate.push({
            id:this.$getRandomCode(8),
            component:"MCTextContainer",
            colIndex:this.pickedColIndex,
            rowIndex:m,
            colSpan:this.pickedColSpan,
            rowSpan:everyNewCreateDataRowSpan
          });
        }
        console.log("列的curCellData，newCreatedData，finalNewCreate",curCellData,newCreatedData,finalNewCreate);
      }

      for(let i=0;i<this.myColCount;i++){
        if(newSelectedRowSpanCount>this.pickedRowSpan){//需要增添行的时候
          const bottomCells=this.tabData.filter(item=>item.colIndex===i&&item.rowIndex>this.selectedMaxRowIndex);
          if(bottomCells&&bottomCells.length>0){
            bottomCells.forEach(item=>{
              if(!cellRecordsForFullRight.has(item)){
                const newRowIndex=item.rowIndex+addRowCount;
                cellRecordsForFullRight.set(item,{
                  rowSpan:item.rowSpan,
                  rowIndex:newRowIndex,
                });
              }
            })
          }
        }

        if(i>=this.pickedColIndex&&i<=this.selectedMaxColIndex){
          continue;//为了确保该范围内只执行1次。
        }

        //执行非水平选择段的处理逻辑
        //步骤1：先处理完全落入，minColIndex和maxColIndex之间的对象
        //当列数发生变化的时候才执行下面的调整涉及到的列信息
        if(newSelectedRowSpanCount>this.pickedRowSpan){
          for(let j=this.selectedMinRowIndex;j<=this.selectedMaxRowIndex;j++){
            console.log("是否搜索前已经出现了undefined",i,j,this.tabData.filter(item=>item.colIndex===undefined&&item.colSpan===undefined));
            const curCellsFullInSelectedColRange = this.tabData.filter(item=>item.colIndex===i&&item.rowIndex===j&&(item.rowSpan===1||item.rowIndex+item.rowSpan-1<=this.selectedMaxRowIndex));

            if(curCellsFullInSelectedColRange&&curCellsFullInSelectedColRange.length>0){
              const curNewColIndex=(j-this.pickedRowIndex)*newSelectedRowSpanCount/this.pickedRowSpan+this.pickedRowIndex;
              console.log(curCellsFullInSelectedColRange,i,j,"当前收集到的curCellsFullInSelectedColRange",this.pickedColIndex,this.selectedMaxColIndex);
              curCellsFullInSelectedColRange.forEach(item=>{
                //其实如果正确逻辑的话，这里的每次循环的结果curNewColSpan的值都是一样的
                //防止加入到curData里的数据再次加入到fullin对象中
                if(!curCellData.includes(item)){
                  const curNewColSpan=item.rowSpan*newSelectedRowSpanCount/this.pickedRowSpan;
                  if(!cellRecordsForFullIn.has(item)){
                    cellRecordsForFullIn.set(item,{
                      rowIndex:curNewColIndex,
                      rowSpan:curNewColSpan,
                    });
                    console.log(item,"当前收集到的curCellsFullInSelectedColRange的itemitem",curNewColSpan);
                  }
                }
              });
            }
          }
          //左侧存在部分相交的cells
          const cellsLeftIntersectedWithSelectedRange = this.tabData.filter(item=>(item.rowSpan!==1&&item.colIndex===i&&item.rowIndex<this.selectedMinRowIndex)&&(item.rowIndex+item.rowSpan-1>=this.selectedMinRowIndex&&item.rowIndex+item.rowSpan-1<=this.selectedMaxRowIndex));

          if(cellsLeftIntersectedWithSelectedRange&&cellsLeftIntersectedWithSelectedRange.length>0){
            //cellRecordsForLeftIntersectedWith
            cellsLeftIntersectedWithSelectedRange.forEach(item=>{
              const rowSpanCountToJustify=(item.rowSpan+item.rowIndex-1)-this.pickedRowIndex+1;
              const restRowSpan=item.rowSpan-rowSpanCountToJustify;
              if(restRowSpan<1){
                throw new Error("逻辑异常，左侧的非选择区域的长度小于1，但仍被归为左侧存在相交");
              }
              const curNewSpan=restRowSpan+rowSpanCountToJustify*newSelectedRowSpanCount/this.pickedRowSpan;
              if(!cellRecordsForLeftIntersectedWith.has(item)){
                cellRecordsForLeftIntersectedWith.set(item,{
                  rowIndex:item.rowIndex,
                  rowSpan:curNewSpan,
                });
              }
            });
          }
          //单元格起于选择selectedMinColIndex，终点又大于selectedMinColIndex的单元格
          const cellsFullOutSelectedColRange = this.tabData.filter(item=>(item.rowSpan!==1&&item.colIndex===i&&item.rowIndex<this.selectedMinRowIndex)&&(item.rowIndex+item.rowSpan-1>this.selectedMaxRowIndex));
          if(cellsFullOutSelectedColRange&&cellsFullOutSelectedColRange.length>0){
            //cellRecordsForLeftIntersectedWith
            cellsFullOutSelectedColRange.forEach(item=>{
              const restRowSpan=item.rowSpan-this.pickedRowSpan;
              if(restRowSpan<1){
                throw new Error("逻辑异常，左侧的非选择区域的长度小于1，但仍被归为左侧存在相交");
              }
              const curNewSpan=restRowSpan+newSelectedRowSpanCount;
              if(!cellRecordsForFullOuter.has(item)){
                cellRecordsForFullOuter.set(item,{
                  rowIndex:item.rowIndex,
                  rowSpan:curNewSpan,
                });
              }
            });
          }
          //右侧存在部分相交的cells
          const cellsRightIntersectedWithSelectedRange = this.tabData.filter(item=>(item.rowSpan!==1&&item.colIndex===i&&item.rowIndex>=this.selectedMinRowIndex&&item.rowIndex<=this.selectedMaxRowIndex)&&(item.rowIndex+item.rowSpan-1>this.selectedMaxRowIndex));
          if(cellsRightIntersectedWithSelectedRange&&cellsRightIntersectedWithSelectedRange.length>0){
            cellsRightIntersectedWithSelectedRange.forEach(item=>{
              const rowSpanCountToJustify=this.selectedMaxRowIndex-item.rowIndex+1;
              const restRowSpan=item.rowSpan-rowSpanCountToJustify;
              if(restRowSpan<1){
                throw new Error("逻辑异常，右侧的非选择区域的长度小于1，但仍被归为右侧存在相交");
              }
              const curNewSpan=restRowSpan+rowSpanCountToJustify*newSelectedRowSpanCount/this.pickedRowSpan;
              //注意colIndex和左侧相交相比，此处要发生变化。
              const curNewColIndex=(item.rowIndex-this.pickedRowIndex)*newSelectedRowSpanCount/this.pickedRowSpan+this.pickedRowIndex;
              if(!cellRecordsForRightIntersectedWith.has(item)){
                cellRecordsForRightIntersectedWith.set(item,{
                  rowIndex:curNewColIndex,
                  rowSpan:curNewSpan,
                });
              }
            })
          }
        }
      }
      // console.log(cellRecordsForFullIn,curCellData,finalNewCreate,"左右两侧收集到的map",this.pickedColIndex,this.pickedColSpan);
      //更新上述数据
      if(curCellData?.length>0){
        curCellData.forEach(item=>{
          // console.log("curSpan打印OOOLD",item.rowSpan);
          item.rowSpan=everyNewCreateDataRowSpan;
          // console.log("curSpan打印",item.rowSpan,item);
        });
      }
      // console.log(everyNewCreateDataRowSpan,curCellData,"everyNewCreateDataRowSpanhecurCellData");
      if(finalNewCreate?.length>0){
        finalNewCreate.forEach(item=>{
          this.tabData.push(item);
        });
      }
      //console.log(cellRecordsForFullIn.has(curCellData[1]),cellRecordsForLeftIntersectedWith.has(curCellData[1]),cellRecordsForRightIntersectedWith.has(curCellData[1]),cellRecordsForFullOuter.has(curCellData[1]),cellRecordsForFullRight.has(curCellData[1]))
      this.changeItemRowIndexAndSpan(cellRecordsForFullIn);
      this.changeItemRowIndexAndSpan(cellRecordsForLeftIntersectedWith);
      this.changeItemRowIndexAndSpan(cellRecordsForRightIntersectedWith);
      this.changeItemRowIndexAndSpan(cellRecordsForFullOuter);
      this.changeItemRowIndexAndSpan(cellRecordsForFullRight);

      //还要记得更新总的行列数。
      this.splitCellHeight(splitEveryCellHeight,addRowCount);
      this.isToChangeRowByNoneUI=true;
      this.myRowCount=this.rowCount+addRowCount;
      this.clearCurSelectedCells();
    },
    //删除所在行
    doDeleteLocatedRow(){
      //考虑到有可能要支持选择多行。
      if(Number.isNaN(this.selectedMaxRowIndex)){
        return;//保险起见，应该不会遇到这种
      }
      //需要减少的行数，这里看出来和合并单元格的不同了，这里如果只选择一行，其实总行数还是要减1，而合并单元格就不是这样了
      const rowCountToSubtract=this.selectedMaxRowIndex-this.selectedMinRowIndex+1;
      //计算从哪个位置开始减少
      const startRowIndexToSubtract=this.selectedMaxRowIndex+1;
      //减少后的实际行数
      const restRowCount=this.rowCount-rowCountToSubtract;
      const cellsToDecreaseRowSpan=new Map();
      const cellsToDecreaseRowSpanAndColIndex=new Map();


      for(let i=this.selectedMinRowIndex;i<=this.selectedMaxRowIndex;i++){//合并后，让他不再被选中，因为之前的selectedMinRowIndex会自动更新，也不要有操作柄
        for(let j=0;j<this.colCount;j++){
          //移除当前ij单元格下的多个项
          let matchedIndex;
          do{
            matchedIndex=this.tabData.findIndex(item=>item.rowIndex===i&&item.colIndex===j&&(item.rowSpan===1||item.rowIndex+item.rowSpan-1<=this.selectedMaxRowIndex));
            if(matchedIndex===-1){
              break;
            }
            this.tabData.splice(matchedIndex,1);
          }
          while(matchedIndex!==-1)

          let matchedIndexForCellToDecreaseRowSpanAndCol=this.tabData.filter(item=>item.rowIndex===i&&item.colIndex===j&&(item.rowSpan!==1&&item.rowIndex+item.rowSpan-1>this.selectedMaxRowIndex));

          matchedIndexForCellToDecreaseRowSpanAndCol.forEach(item=>{
            //单元格最右侧多出来框选区域有多少用这个算：item.colSpan+item.colIndex-1-(this.selectedMaxColIndex-j);
            const spanToRemove=this.selectedMaxRowIndex-i+1;
            const restColSpan=item.rowSpan-spanToRemove;
            if(restColSpan<1){
              throw new Error("算法逻辑出了异常");
            }
            // const newColIndex=item.colSpan+
            if(!cellsToDecreaseRowSpanAndColIndex.has(item)){
              cellsToDecreaseRowSpanAndColIndex.set(item,restColSpan);
            }
          });

          let matchedIndexForCellToDecreaseRowSpan=this.tabData.filter(item=>(item.colIndex===j&&item.rowIndex<i)&&(item.rowSpan!==1&&item.rowIndex+item.rowSpan-1>=i));
          if(matchedIndexForCellToDecreaseRowSpan&&matchedIndexForCellToDecreaseRowSpan.length>0){
            matchedIndexForCellToDecreaseRowSpan.forEach((item)=>{
              //计算一下移出所选列跨数后，当前item的colSpan值
              let removeSpanCount;
              if(item.rowSpan+item.rowIndex-1>=this.selectedMaxRowIndex){
                // removeSpanCount=this.selectedMaxColIndex-this.selectedMinColIndex+1;
                //为了保险起见，减j而不是selectedMinColIndex
                removeSpanCount=this.selectedMaxRowIndex-i+1;
              }else{
                removeSpanCount=(item.rowSpan+item.rowIndex-1)-i+1;
              }
              const restSpanCount=item.rowSpan-removeSpanCount;
              if(restSpanCount<1){
                throw new Error("算法逻辑出了异常");
              }
              if(!cellsToDecreaseRowSpanAndColIndex.has(item)&&!cellsToDecreaseRowSpan.has(item)){
                cellsToDecreaseRowSpan.set(item,restSpanCount);
              }
            });
          }
        }
      }

      //更新其他大于删除所行的对象
      const map=new Map();
      for(let k=startRowIndexToSubtract;k<this.rowCount;k++){
        const matchedCurRowCells=this.tabData.filter(item=>item.rowIndex===k);
        if(matchedCurRowCells&&matchedCurRowCells.length>0){
          map.set(k-rowCountToSubtract,matchedCurRowCells);
        }
      }

      map.forEach((value,key)=>{
        console.log(value,"value");
        value.forEach(item=>{
          item.rowIndex=key;
        });
      });

      console.log(cellsToDecreaseRowSpan,cellsToDecreaseRowSpanAndColIndex,"2个map");
      cellsToDecreaseRowSpan.forEach((value,key)=>{
        key.rowSpan=value;
      });

      cellsToDecreaseRowSpanAndColIndex.forEach((value,key)=>{
        key.rowSpan=value;
      });

      const mergeIndices=[];
      for(let s=this.selectedMinRowIndex;s<=this.selectedMaxRowIndex;s++){
        mergeIndices.push(s);
      }
      this.removeCellHeight(mergeIndices);
      this.isToChangeRowByNoneUI=true;
      this.myRowCount=restRowCount;
      //计算更新选择框
      this.clearCurSelectedCells();

      //todo 只做数据的挪位置，而高度索引不变的做法看起来很奇怪，这里最好再实现一个高度联动。
      //todo 如果删除的行左侧有合并列单元格的对象。此时如何处理？
    },
    //删除所在列
    doDeleteLocatedCol(){
      console.log("删除所在列",Number.isNaN(this.selectedMaxColIndex));
      //考虑到有可能要支持选择多行。
      if(Number.isNaN(this.selectedMaxColIndex)){
        return;//保险起见，应该不会遇到这种
      }
      //需要减少的列数
      const colCountToSubtract=this.selectedMaxColIndex-this.selectedMinColIndex+1;
      //计算从哪个位置开始减少
      const startColIndexToSubtract=this.selectedMaxColIndex+1;
      //减少后的实际列数
      const restColCount=this.colCount-colCountToSubtract;
      const cellsToDecreaseRowSpan=new Map();
      const cellsToDecreaseRowSpanAndColIndex=new Map();


      for(let i=0;i<this.rowCount;i++){//合并后，让他不再被选中，因为之前的selectedMinRowIndex会自动更新，也不要有操作柄
        for(let j=this.selectedMinColIndex;j<=this.selectedMaxColIndex;j++){
          //移除当前ij单元格下的多个项，可做直接移出的
          let matchedIndex;
          do{
            matchedIndex=this.tabData.findIndex(item=>item.rowIndex===i&&item.colIndex===j&&(item.colSpan===1||item.colIndex+item.colSpan-1<=this.selectedMaxColIndex));//只针对最基础单元格的才删除
            if(matchedIndex===-1){
              break;
            }
            this.tabData.splice(matchedIndex,1);
          }
          while(matchedIndex!==-1)

          //单元格存在列span，恰巧单元格的起始colIndex等于当前的j，且colspan的最右侧，已经超出的框选的maxSelectedColIndex时，其实确保这个就可以了item=>item.rowIndex===i&&item.colIndex===j，为了保险起见增加其他判断条件
          //要减少colspan的值，colIndex在这种情况下保持不变

          let matchedIndexForCellToDecreaseRowSpanAndCol=this.tabData.filter(item=>item.rowIndex===i&&item.colIndex===j&&(item.colSpan!==1&&item.colIndex+item.colSpan-1>this.selectedMaxColIndex));

          matchedIndexForCellToDecreaseRowSpanAndCol.forEach(item=>{
            //单元格最右侧多出来框选区域有多少用这个算：item.colSpan+item.colIndex-1-(this.selectedMaxColIndex-j);
            const spanToRemove=this.selectedMaxColIndex-j+1;
            const restColSpan=item.colSpan-spanToRemove;
            if(restColSpan<1){
              throw new Error("算法逻辑出了异常");
            }
            // const newColIndex=item.colSpan+
            if(!cellsToDecreaseRowSpanAndColIndex.has(item)){
              cellsToDecreaseRowSpanAndColIndex.set(item,restColSpan);
            }
          })

          //单元格存在列span，且span后的最右侧在整个框选范围的左内侧，仅修改colspan的值即可
          let matchedIndexForCellToDecreaseRowSpan=this.tabData.filter(item=>(item.rowIndex===i&&item.colIndex<j)&&(item.colSpan!==1&&item.colIndex+item.colSpan-1>=j));

          if(matchedIndexForCellToDecreaseRowSpan&&matchedIndexForCellToDecreaseRowSpan.length>0){
            matchedIndexForCellToDecreaseRowSpan.forEach((item)=>{
              //计算一下移出所选列跨数后，当前item的colSpan值
              let removeSpanCount;
              if(item.colSpan+item.colIndex-1>=this.selectedMaxColIndex){
                // removeSpanCount=this.selectedMaxColIndex-this.selectedMinColIndex+1;
                //为了保险起见，减j而不是selectedMinColIndex
                removeSpanCount=this.selectedMaxColIndex-j+1;
              }else{
                removeSpanCount=(item.colSpan+item.colIndex-1)-j+1;
              }
              const restSpanCount=item.colSpan-removeSpanCount;
              if(restSpanCount<1){
                throw new Error("算法逻辑出了异常");
              }
              if(!cellsToDecreaseRowSpanAndColIndex.has(item)&&!cellsToDecreaseRowSpan.has(item)){
                cellsToDecreaseRowSpan.set(item,restSpanCount);
              }
            });
          }
        }
      }

      //更新其他大于删除所行的对象。todo这种做法，会使得我重新调整行列数据，尤其调大时，会导致原来的对象又出来了，其实还好。符合主体逻辑
      //todo 这种做法，会使得我重新调整行列数据，尤其调大时，会导致原来的对象又出来了，其实还好。符合主体逻辑
      const map=new Map();
      for(let k=startColIndexToSubtract;k<this.colCount;k++){
        const matchedCurRowCells=this.tabData.filter(item=>item.colIndex===k);
        if(matchedCurRowCells&&matchedCurRowCells.length>0){
          map.set(k-colCountToSubtract,matchedCurRowCells);
        }
      }

      map.forEach((value,key)=>{
        console.log(value,"value");
        value.forEach(item=>{
          item.colIndex=key;
        });
      });
      console.log(cellsToDecreaseRowSpan,cellsToDecreaseRowSpanAndColIndex,"2个map");
      cellsToDecreaseRowSpan.forEach((value,key)=>{
        key.colSpan=value;
      });

      cellsToDecreaseRowSpanAndColIndex.forEach((value,key)=>{
        key.colSpan=value;
      });

      const removeIndices=[];
      for(let s=this.selectedMinColIndex;s<=this.selectedMaxColIndex;s++){
        removeIndices.push(s);
      }
      this.removeCellWidth(removeIndices);
      this.isToChangeColByNoneUI=true;
      this.myColCount=restColCount;
      //计算更新选择框
      this.clearCurSelectedCells();

      //todo 只做数据的挪位置，而高度索引不变的做法看起来很奇怪，这里最好再实现一个高度联动。
      //todo 如果删除的行左侧有合并列单元格的对象。此时如何处理？
    },
    //#endregion 具体实现拆分合并、删除行、删除列
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
