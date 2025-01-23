<template>
  <div :class="['schema-select', isNeedOnSameRow?'flex-same-row':'flex-different-row']">
    <div class="label-area" :style="{marginBottom:isNeedOnSameRow?'0':'15px'}">
      <span class="label-title w70 f13 f-grey">
        {{label}}
      </span>
      <span class="select-value f14">
        {{showValue}}
      </span>
    </div>
    <div class="select-area">
      <el-tooltip v-for="item in data" :content="item.value" :key="item.value" effect="light">
        <div @click="changeMyValue(item.value)" :class="['mode-select-item', 'flex-center',item.value===myValue?'select-item-active':'']">
          <span>{{item.label}}</span>
        </div>
      </el-tooltip>
    </div>
  </div>
</template>

<script>
import myWriteSchemaMixin from "@/mixin/myWriteSchemaMixin";

export default {
  name: "SchemaSelect",
  mixins:[myWriteSchemaMixin],
  // data(){
  //   return{
  //     curSelectValue:"无效值xxx",
  //   }
  // },
  props:{
    value:{
      type:String,
      default:"left"
    },
    data:{
      type:Array,
      default:()=>[]
    }
  },
  methods:{
    changeMyValue(val){
      this.myValue=val;
    }
  },
  computed:{
    isNeedOnSameRow(){
      return !(this.data && this.data.length > 3);
    },
    showValue(){
      if(!this.data){
        return "居左";
      }else{
        const matched = this.data.filter(item=>item.value===this.myValue);
        if(matched&&matched.length===1){
          return matched[0].label;
        }else{
          return "未匹配值";
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
.schema-select{
  display:flex;
  padding:10px;
  .label-area{
    display:flex;
    align-items: center;
  }
  .select-area{
    display:flex;
    flex-wrap:wrap;
    .mode-select-item{
      padding:8px 12px;
      border:1px solid #dcdee0;
      font-size: 12px;
      font-weight: 500;
      &:hover{
        cursor:pointer;
        color: #155bd4;
        border-color: #155bd4;
        background-color: #e0edff;
      }
    }
    .select-item-active{
      cursor:pointer;
      color: #155bd4;
      border-color: #155bd4;
      background-color: #e0edff;
    }
  }
}

.flex-same-row{
  justify-content: space-between !important;
}
.flex-different-row{
  flex-direction: column;
}
</style>