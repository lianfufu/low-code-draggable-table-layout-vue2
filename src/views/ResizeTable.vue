<script>
export default {
  name:"ResizeTable",
  data() {
    return {
      rows: [
        ['Cell 1-1', 'Cell 1-2', 'Cell 1-3'],
        ['Cell 2-1', 'Cell 2-2', 'Cell 2-3'],
        ['Cell 3-1', 'Cell 3-2', 'Cell 3-3'],
      ],
      isResizingRow: false,
      resizingRowIndex: null,
      initialY: 0,
      rowHeights: [40, 40, 40], // 初始行高
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
      this.$set(this.rowHeights, this.resizingRowIndex, Math.max(20, this.rowHeights[this.resizingRowIndex] + deltaY));
      this.initialY = event.clientY;
    },
    stopResizingRow() {
      this.isResizingRow = false;
      document.removeEventListener('mousemove', this.resizeRow);
      document.removeEventListener('mouseup', this.stopResizingRow);
    },
  },
  computed: {
    tableStyle() {
      // 这里可以添加其他表格级别的样式，但目前我们不需要额外的样式
      return {};
    },
  },
};
</script>

<template>
  <div class="table-container">
    <table>
      <thead>
      <tr>
        <th>Header 1</th>
        <th>Header 2</th>
        <th>Header 3</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(row, rowIndex) in rows" :key="rowIndex" :style="{ height: rowHeights[rowIndex] + 'px' }">
        <td v-for="(cell, cellIndex) in row" :key="cellIndex" class="resizable-cell">
          {{ cell }}
          <div class="row-resizer" @mousedown="startResizingRow(rowIndex)"></div>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-container {
  overflow: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
  position: relative;
}

.resizable-cell {
  position: relative; /* 确保 .row-resizer 相对于此元素定位 */
}

.row-resizer {
  width: 100%; /* 使拖拽柄宽度与单元格宽度一致 */
  height: 5px; /* 设置拖拽柄的高度 */
  cursor: ns-resize;
  background-color: #999; /* 设置拖拽柄的背景色，以便更容易看到 */
  position: absolute;
  bottom: 0; /* 将拖拽柄放置在单元格的底部 */
  left: 0;
  z-index: 10; /* 确保拖拽柄显示在其他内容之上 */
}

/* 可选：为拖拽柄添加一些视觉效果，如鼠标悬停时改变颜色 */
.row-resizer:hover {
  background-color: #666;
}
</style>
