<template>
  <LabelWrapper :label="label">
    <el-input v-model="myValue" size='small'/>
  </LabelWrapper>
</template>

<script>
import myWriteSchemaMixin from "@/mixin/myWriteSchemaMixin";
export default {
  name: "SchemaString",
  mixins:[myWriteSchemaMixin],
  props:{
    value:{
      type:String,
      default:"默认文本"
    }
  }
}
</script>

<style scoped lang="scss">

</style>