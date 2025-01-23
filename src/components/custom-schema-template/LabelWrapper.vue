<template>
  <div class="label-wrapper p10 ">
    <div class="w70 f13 f-grey">{{label}}</div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: "LabelWrapper",
  props:{
    label:{
      type:String,
      default:"无标签"
    }
  },
}
</script>

<style scoped lang="scss">
.label-wrapper{
  display:flex;
  align-items: center;
}
</style>