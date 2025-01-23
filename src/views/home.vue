<script>

import PageHeader from "@/components/PageHeader.vue";
import PageBody from "components/PageBody.vue";

export default {
  name: "home",
  components: {PageBody, PageHeader}
}
</script>

<template>
  <div class="main">
    <page-header></page-header>
    <page-body></page-body>
  </div>
</template>

<style scoped lang="scss">
.main{
  overflow: hidden;
  background-color: #f7f8fa;
}
</style>