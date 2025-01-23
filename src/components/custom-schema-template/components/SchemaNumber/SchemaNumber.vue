<template>
  <LabelWrapper :label="label">
    <el-slider v-bind="myOptions" show-input class="my-slider" v-model="myValue"/>
  </LabelWrapper>
</template>

<script>
import myWriteSchemaMixin from "@/mixin/myWriteSchemaMixin";
export default {
  name: "SchemaNumber",
  mixins:[myWriteSchemaMixin],
  props:{
    value:{
      type:Number,
      default:0
    }
  },
}
</script>

<style scoped lang="scss">
.schema-number{
  padding:0 10px;
  display:flex;
  align-items: center;
  .label{
    width:70px;
  }
  .my-slider{
    flex:1
  }
}
</style>