<template>
  <LabelWrapper :label="label">
    <Imgpond v-model="myValue" :count="1"/>
  </LabelWrapper>
</template>

<script>
import myWriteSchemaMixin from "@/mixin/myWriteSchemaMixin";
export default {
  name: "SchemaUpload",
  mixins: [myWriteSchemaMixin],
}
</script>

<style scoped lang="scss">

</style>