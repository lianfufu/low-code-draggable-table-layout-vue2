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
        <tbody>
        <tr v-for="(row, rowIndex) in rows" :key="rowIndex" :style="{ height: rowHeights[rowIndex] + 'px' }">
          <td
              v-for="(cell, cellIndex) in row"
              :key="cellIndex"
              :style="{ width: columnWidths[cellIndex]}"
              class="resizable-cell flex-td"
          >
            <div class="table-container">
              {{ cell }}
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
        ['Cell 1-1', 'Cell 1-2', 'Cell 1-3'],
        ['Cell 2-1', 'Cell 2-2', 'Cell 2-3'],
        ['Cell 3-1', 'Cell 3-2', 'Cell 3-3'],
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
      this.columnWidths.push(100/this.colCount+"%");
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
      // 调整列宽，确保最小宽度
      const newWidth = Math.max(50, this.getRealWidthOfColumn(this.columnWidths[this.resizingColumnIndex]) + deltaX);
      // 如果是非最后一列，需要调整相邻列的宽度
      if (this.resizingColumnIndex < this.columnWidths.length - 1) {
        const nextColumnWidth = this.getRealWidthOfColumn(this.columnWidths[this.resizingColumnIndex + 1]) - deltaX;
        console.log(deltaX,newWidth,nextColumnWidth);
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
  },
};
</script>

<style scoped>
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
  width: 4000px;
  height: 1px;
  cursor: ns-resize;
  background-color: #999;
  position: absolute;
  bottom: 0;
  left: -2000px;
  z-index: 999;
}

.row-resizer:hover {
  background-color: #0000ff;
}

.col-resizer {
  width: 1px;
  height: 4000px;
  cursor: ew-resize;
  background-color: #999;
  position: absolute;
  top: -2000px;
  right: 0;
  bottom: 0;
  z-index: 999;
}

.col-resizer:hover {
  background-color: #0000ff;
}
</style>