<template>
  <div class="table-container" :style="{width:parentWidth+'px'}">
    <draggable
        v-model="list"
        ghostClass="ghost"
        chosenClass="chosen"
        selector="selector"
        :animation="500"
        :sort="true"
        :group="{name:'xtwangzi'}">
      <table>
        <col :style="{width:rows[1][0].width}" />
        <col :style="{width:rows[1][1].width}" />
        <col :style="{width:rows[1][2].width}" />
        <tbody>
        <tr v-for="(row, rowIndex) in rows" :key="rowIndex" :style="{ height: rowHeights[rowIndex] + 'px' }">
          <td
              v-for="(cell, cellIndex) in row"
              :key="cellIndex"
              :style="{ width: cell.width}"
              class="resizable-cell flex-td"
              :colspan="cell.colSpan"
              :rowspan="cell.rowSpan"
              :data-rowIndex="rowIndex" :data-colIndex="cellIndex" :data-colSpan="cell.colSpan" :data-rowSpan="cell.rowSpan"
          >
            <div class="table-container">
              {{ cell.value }}
            </div>
            <div class="row-resizer" @mousedown="startResizingRow(rowIndex)"></div>
            <div
                class="col-resizer"
                v-if="cellIndex < row.length - 1"
                @mousedown="startResizingColumn(cellIndex, rowIndex)"
            ></div>
          </td>
        </tr>
        </tbody>
      </table>
    </draggable>
  </div>
</template>

<script>
export default {
  name:"ReszieColumn",
  data() {
    return {
      list:[],
      headers: ['Header 1', 'Header 2', 'Header 3'],
      rows: [
        [{value:'Cell 1-1',width:'80%',rowIndex:0,colIndex:0,rowSpan:1,colSpan:2}, {value:'Cell 1-2',width:'20%',rowIndex:0,colIndex:2,rowSpan:1,colSpan:1}],
        [{value:'Cell 2-1',width:'60%',rowIndex:1,colIndex:0,rowSpan:1,colSpan:1}, {value:'Cell 2-2',width:'20%',rowIndex:1,colIndex:1,rowSpan:1,colSpan:1}, {value:'Cell 2-3',width:'20%',rowIndex:1,colIndex:2,rowSpan:1,colSpan:1}],
      ],
      rowHeights: [], // 初始行高
      columnWidths: [], // 初始列宽
      isResizingRow: false,
      isResizingColumn: false,
      resizingRowIndex: null,
      resizingColumnIndex: null,
      parentWidth:430,
      colCount:3,
      rowCount:3,
      initialY: 0,
      initialX: 0,
    };
  },
  mounted() {
    for(let i=0;i<this.colCount;i++){
      this.columnWidths.push(100/this.colCount);
    }

    for(let j=0;j<this.rowCount;j++){
      this.rowHeights.push(30);
    }
    console.log(this.columnWidths,this.rowHeights);
  },
  methods: {
    getPercentColumnWidth(numWidth){
      return 100*numWidth/this.parentWidth+'%';
    },
    getRealWidthOfColumn(strWidth){
      return Number.parseFloat(strWidth)*this.parentWidth/100;
    },
    getSumWidthOfColumn(strWidth,strWidth1){
      const numberWidth=Number.parseFloat(strWidth)*this.parentWidth/100;
      const numberWidth1=Number.parseFloat(strWidth1)*this.parentWidth/100;
      return this.getPercentColumnWidth(numberWidth+numberWidth1);
    },
    startResizingRow(rowIndex) {
      event.stopPropagation(); // 阻止事件冒泡到draggable组件
      event.preventDefault();  // 阻止默认行为，以防万一
      this.isResizingRow = true;
      this.resizingRowIndex = rowIndex;
      this.initialY = event.clientY;
      // console.log(event);
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

      let leftTopCell;
      this.rows.some(row => {
        return row.some(cell => {
          if (cell.value === "Cell 2-1") {
            leftTopCell = cell;
            return true; // 退出内层循环
          }
          return false;
        });
      });
      leftTopCell.width=this.getPercentColumnWidth(this.getRealWidthOfColumn(leftTopCell.width)+deltaX);
      // let centerBottomCell;
      // this.rows.some(row => {
      //   return row.some(cell => {
      //     if (cell.value === "Cell 2-2") {
      //       centerBottomCell = cell;
      //       return true; // 退出内层循环
      //     }
      //     return false;
      //   });
      // });
      // centerBottomCell.width=this.getPercentColumnWidth(this.getRealWidthOfColumn(centerBottomCell.width)+deltaX);

      // 调整列宽，确保最小宽度
      // const newWidth = Math.max(50, this.getRealWidthOfColumn(this.columnWidths[this.resizingColumnIndex]) + deltaX);
      const newWidth = this.getRealWidthOfColumn(leftTopCell.width)+deltaX;
      // 如果是非最后一列，需要调整相邻列的宽度
      if (this.resizingColumnIndex < this.columnWidths.length - 1) {

        let leftTopCell1;
        this.rows.some(row => {
          return row.some(cell => {
            if (cell.value === "Cell 2-2") {
              leftTopCell1 = cell;
              return true; // 退出内层循环
            }
            return false;
          });
        });

        const nextColumnWidth=this.getRealWidthOfColumn(leftTopCell1.width)-deltaX;
        if(nextColumnWidth<0||newWidth<0){
          this.initialX = event.clientX;
          return;
        }
        console.log(newWidth,nextColumnWidth);
        leftTopCell1.width=this.getPercentColumnWidth(this.getRealWidthOfColumn(leftTopCell1.width)-deltaX);
        // let centerBottomCell;
        // this.rows.some(row => {
        //   return row.some(cell => {
        //     if (cell.value === "Cell 2-3") {
        //       centerBottomCell = cell;
        //       return true; // 退出内层循环
        //     }
        //     return false;
        //   });
        // });
        console.log("cell12,cell23",leftTopCell.width,leftTopCell1.width);
        // centerBottomCell.width=this.getPercentColumnWidth(this.getRealWidthOfColumn(centerBottomCell.width)-deltaX);

        // this.getSumWidthOfColumn()

        // 确保相邻列的最小宽度
        // if (nextColumnWidth >= 50) {
        //   this.$set(this.columnWidths, this.resizingColumnIndex, this.getPercentColumnWidth(newWidth));
        //   this.$set(this.columnWidths, this.resizingColumnIndex + 1, this.getPercentColumnWidth(nextColumnWidth));
        // }
        // this.$set(this.columnWidths, this.resizingColumnIndex, this.getPercentColumnWidth(newWidth));
        // this.$set(this.columnWidths, this.resizingColumnIndex + 1, this.getPercentColumnWidth(nextColumnWidth));
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
  },
};
</script>

<style lang="scss" scoped>
.table-container {
  width: 600px;
  overflow: auto;
}

table {
  width: 100%;
  table-layout: fixed; /* 确保列宽固定 */
  overflow: hidden;
  .flex-td {
    word-wrap: break-word !important;
    .table-container{
      //display: table-cell;
      height: auto;
      background-color: #c0ccda;
    }
  }
}

th, td {
  box-sizing: border-box;
  border: 1px solid #ccc;
  text-align: left;
  position: relative;
}

.resizable-cell {
  position: relative;
}

.row-resizer {
  width: 100%;
  height: 1px;
  cursor: ns-resize;
  background-color: #999;
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
  height: 100%;
  cursor: ew-resize;
  background-color: #999;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

.col-resizer:hover {
  background-color: #0000ff;
}
</style>