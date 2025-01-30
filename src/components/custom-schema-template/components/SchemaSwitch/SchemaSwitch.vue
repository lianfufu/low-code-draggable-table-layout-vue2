<template>
  <LabelWrapper :label="label">
    <div style="text-align: right;flex:1">
      <el-switch v-model="myValue" active-text="显示" active-color="#115BD4"></el-switch>
    </div>
  </LabelWrapper>
</template>

<script>
import myWriteSchemaMixin from "@/mixin/myWriteSchemaMixin";
export default {
  name: "SchemaSwitch",
  mixins:[myWriteSchemaMixin],
  props:{
    value:{
      type:Boolean,
      default:true
    }
  },
}
</script>

<style scoped lang="scss">
</style>