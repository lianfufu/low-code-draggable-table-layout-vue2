<template>
  <ul>
    <li v-for="(item,key,index) in curFields" :key="index">
      <component :is="getComponentName(item.type)" v-bind="item" v-model="component[key]">
        <custom-schema-template v-if="item.child" :component="component[key]" :cur-fields="item.child"/>
      </component>
    </li>
  </ul>
</template>

<script>
export default {
  name: "CustomSchemaTemplate",
  props:{
    component:{
      type:Object,
      default: () => {}
    },
    curFields:{
      type:Object,
      default: () => {}
    }
  },
  methods:{
    getComponentName(type){
      console.log("schema-"+type);
      return "schema-"+type;
    }
  }
}
</script>

<style scoped lang="scss">

</style>