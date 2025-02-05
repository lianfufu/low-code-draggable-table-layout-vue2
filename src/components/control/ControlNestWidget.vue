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
      <WidgetShape v-for="(item,key,index) in list" v-if="item.component!=='MCTextContainer'" :cur-component="item" :key="item.id" v-bind="item" @deleteWidget="deleteWidget">
        <component v-if="item.component!=='McTable'&&item.component!=='MCTextContainer'" :is="item.component" v-bind="item">
          <ControlNestWidget :isWidget="true" :widgets.sync="item.children"></ControlNestWidget>
        </component>
        <component v-else-if="item.component==='McTable'" :is="item.component" v-bind="item" :colCount.sync="item.colCount" :rowCount.sync="item.rowCount" :children.sync="item.children"/>
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
    cellRowSpan:{
      type:Number,
      default:Number.NaN
    },
    cellColSpan:{
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
        //当数据是为了列表进行服务的，拖进来新的对象的时候，记录要拖入的目标单元格
        if(!Number.isNaN(this.cellColIndex)&&!Number.isNaN(this.cellRowIndex)){
          value.forEach(item=>{
            item.rowIndex=this.cellRowIndex;
            item.colIndex=this.cellColIndex;
            item.rowSpan=this.cellRowSpan;
            item.colSpan=this.cellColSpan;
            if(!item.cellFields){
              item.cellFields={
                "contentBgc": {
                  "label": "背景色",
                  "type": "color",
                  "value": "#fff"
                },
                "padding": {
                  "label": "内边距",
                  "type": "number",
                  "value": 3
                }
              }
            }
            if(!item.cellFieldVal){
              item.cellFieldVal={};
              for (const cellFieldsKey in item.cellFields) {
                if(item.cellFields.hasOwnProperty(cellFieldsKey)){
                  if(item.cellFields[cellFieldsKey].value){
                    item.cellFieldVal[cellFieldsKey]=item.cellFields[cellFieldsKey].value;
                  }
                }
              }
            }
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