<template>
    <draggable
        :class="isWidget?'nest-widget-height':'outer-widget-height'"
        v-model="list"
        ghostClass="ghost"
        chosenClass="chosen"
        selector="selector"
        :animation="500"
        :sort="true"
        :group="{name:'xtwangzi'}">
      <WidgetShape v-for="(item,key,index) in list" :cur-component="item" :key="item.id" v-bind="item" @deleteWidget="deleteWidget">
        <component v-if="item.component!=='MCTable'" :is="item.component" v-bind="item">
          <ControlNestWidget :isWidget="true" :widgets.sync="item.children"></ControlNestWidget>
        </component>
        <component v-else :is="item.component" v-bind="item" :children.sync="item.children"/>
      </WidgetShape>
    </draggable>
</template>

<script>

export default {
  name: "ControlNestWidget",
  emits:["updateTableChildData"],
  props:{
    isWidget:{
      type:Boolean,
      default: false
    },
    widgets:{
      type:Array,
      default:() => []
    },
    cellRowIndex:{
      type:Number,
      default:Number.NaN
    },
    cellColIndex:{
      type:Number,
      default:Number.NaN
    },
  },
  inject:["control"],
  data(){
    return{
      list:[]
    }
  },
  watch:{
    widgets:{
      handler(value){
        this.list=value
      },
      immediate: true,
      deep:true
    },
    list:{
      handler(value){
        if(!Number.isNaN(this.cellColIndex)&&!Number.isNaN(this.cellRowIndex)){
          value.forEach(item=>{
            item.rowIndex=this.cellRowIndex;
            item.colIndex=this.cellColIndex;
          });
        }
        console.log(value);
        this.$emit("update:widgets",value);
      }
    },
    immediate: true,
    deep:true
  },
  methods:{
    deleteWidget(component){
      this.list.splice(this.list.indexOf(component),1);
      this.control.curComponent=null;
      this.$emit("updateTableChildData",component);
    }
  }
}
</script>

<style scoped lang="scss">
//.control-nest-widget{
//  height:100%;
//}
.outer-widget-height{
  min-height: 600px;
}
.nest-widget-height{
  min-height: 30px;
}
</style>