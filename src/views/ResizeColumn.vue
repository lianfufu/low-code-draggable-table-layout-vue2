<template>
  <div class="table-container">
    <table>
      <thead>
      <tr>
        <th v-for="(header, index) in headers" :key="index">{{ header }}</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(row, rowIndex) in rows" :key="rowIndex" :style="{ height: rowHeights[rowIndex] + 'px' }">
        <td
            v-for="(cell, cellIndex) in row"
            :key="cellIndex"
            :style="{ width: columnWidths[cellIndex] + 'px' }"
            class="resizable-cell"
        >
          {{ cell }}
          <div class="row-resizer" @mousedown="startResizingRow(rowIndex)"></div>
          <div
              class="col-resizer"
              v-if="cellIndex < row.length - 1"
              @mousedown="startResizingColumn(cellIndex, rowIndex)"
          ></div>
        </td>
        <td :style="{ width: columnWidths[row.length - 1] + 'px' }">
          {{ row[row.length - 1] }}
          <!-- 最后一列没有列宽拖拽柄 -->
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name:"ReszieColumn",
  data() {
    return {
      headers: ['Header 1', 'Header 2', 'Header 3'],
      rows: [
        ['Cell 1-1', 'Cell 1-2', 'Cell 1-3'],
        ['Cell 2-1', 'Cell 2-2', 'Cell 2-3'],
        ['Cell 3-1', 'Cell 3-2', 'Cell 3-3'],
      ],
      rowHeights: [30, 30, 30], // 初始行高
      columnWidths: [100, 100, 100], // 初始列宽
      isResizingRow: false,
      isResizingColumn: false,
      resizingRowIndex: null,
      resizingColumnIndex: null,
      initialY: 0,
      initialX: 0,
    };
  },
  methods: {
    startResizingRow(rowIndex) {
      this.isResizingRow = true;
      this.resizingRowIndex = rowIndex;
      this.initialY = event.clientY;
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
      this.isResizingColumn = true;
      this.resizingColumnIndex = columnIndex;
      this.initialX = event.clientX;
      // 保存当前列的初始宽度，用于后续计算
      this.initialColumnWidth = this.columnWidths[columnIndex];
      document.addEventListener('mousemove', this.resizeColumn);
      document.addEventListener('mouseup', this.stopResizingColumn);
    },
    resizeColumn(event) {
      if (!this.isResizingColumn) return;
      const deltaX = event.clientX - this.initialX;
      // 调整列宽，确保最小宽度
      const newWidth = Math.max(50, this.initialColumnWidth + deltaX);
      // 如果是非最后一列，需要调整相邻列的宽度
      if (this.resizingColumnIndex < this.columnWidths.length - 1) {
        const nextColumnWidth = this.columnWidths[this.resizingColumnIndex + 1] - deltaX;
        // 确保相邻列的最小宽度
        if (nextColumnWidth >= 50) {
          this.$set(this.columnWidths, this.resizingColumnIndex, newWidth);
          this.$set(this.columnWidths, this.resizingColumnIndex + 1, nextColumnWidth);
        }
      } else {
        // 如果是最后一列，只调整当前列
        this.$set(this.columnWidths, this.resizingColumnIndex, newWidth);
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
  overflow: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed; /* 确保列宽固定 */
}

th, td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
  position: relative;
}

.resizable-cell {
  position: relative;
}

.row-resizer {
  width: 100%;
  height: 5px;
  cursor: ns-resize;
  background-color: #999;
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 10;
}

.row-resizer:hover {
  background-color: #666;
}

.col-resizer {
  width: 5px;
  cursor: ew-resize;
  background-color: #999;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
}

.col-resizer:hover {
  background-color: #666;
}
</style>