<template>
  <HeaderWrapper :label="label">
    <slot></slot>
  </HeaderWrapper>
</template>

<script>
export default {
  name: "SchemaObject",
  props:{
    label:{
      type:String,
      default:"默认头内容",
    }
  }
}
</script>

<style scoped lang="scss">

</style>