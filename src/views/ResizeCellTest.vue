
<template>
  <div class="resizable-cell" ref="cell" :style="{ width: cellWidth + 'px' }">
    <div class="cell-content">
      <!-- 单元格内容 -->
      内容
    </div>
    <div class="resizer" @mousedown="startResizing"></div>
  </div>
</template>

<script>
export default {
  name: "ResizeCellTest",
  data() {
    return {
      cellWidth: 200, // 初始宽度
      isResizing: false,
      initialX: 0,
    };
  },
  methods: {
    startResizing(event) {
      this.isResizing = true;
      this.initialX = event.clientX;
      document.addEventListener('mousemove', this.resize);
      document.addEventListener('mouseup', this.stopResizing);
    },
    resize(event) {
      if (!this.isResizing) return;
      const deltaX = event.clientX - this.initialX;
      this.cellWidth = Math.max(100, this.cellWidth + deltaX); // 最小宽度为 100px
      this.initialX = event.clientX;
    },
    stopResizing() {
      this.isResizing = false;
      document.removeEventListener('mousemove', this.resize);
      document.removeEventListener('mouseup', this.stopResizing);
    },
  },
};
</script>

<style scoped>
.resizable-cell {
  position: relative;
  display: inline-block;
  border: 1px solid #ccc;
}

.cell-content {
  padding: 10px;
}

.resizer {
  position: absolute;
  top: 0;
  right: 0;
  width: 10px;
  height: 100%;
  cursor: ew-resize;
  background-color: #ddd;
}
</style>