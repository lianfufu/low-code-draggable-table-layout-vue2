<template>
  <LabelWrapper :label="label">
    <div style="flex:1">
      <div
          class="flex row-right"
          style="width: calc(100% - 24px);"
      >
        <el-color-picker
            v-model="myValue"
            :predefine="predefineColors"
            show-alpha
        ></el-color-picker>
      </div>
    </div>
  </LabelWrapper>
</template>

<script>
import myWriteSchemaMixin from "@/mixin/myWriteSchemaMixin";
export default {
  name: "SchemaColor",
  mixins: [myWriteSchemaMixin],
  props:{
    value:{
      type:String,
      default:"#000000"
    }
  },
  data(){
    return{
      predefineColors: [
        "#ffffff",
        "#f5f5f5f5",
        "#F2F2F2",
        "#FF4444",
        "#FFCD00",
        "#3FBC87",
        "#5197FF",
        "#BADCFF",
        "#000000",
      ],
    }
  }
}
</script>

<style scoped lang="scss">

</style>