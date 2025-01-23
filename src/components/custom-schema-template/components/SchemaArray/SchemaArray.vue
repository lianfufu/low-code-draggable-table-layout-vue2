<template>
  <HeaderWrapper :label="label">
<!--    <slot></slot>因为加了这句话会导致component传入了array，不符合component为object的要求-->
    <div class="array-body">
      <ul v-for="(item,index) in myValue" :key="index" style="margin: 10px">
        <li class="data-item" >
          <component v-for="(curField,key,index) in child" :key="index" :is="getComponentName(curField.type)" v-model="item[key]">

          </component>
          <span @click="deleteCurData(item)" class="close-icon">×</span>
        </li>
      </ul>
      <div class="add-button" @click="addData">
        增加数据
      </div>
    </div>
  </HeaderWrapper>
</template>

<script>
import myWriteSchemaMixin from "@/mixin/myWriteSchemaMixin";

export default {
  name: "SchemaArray",
  mixins:[myWriteSchemaMixin],
  props:{
    label:{
      type:String,
      default:"默认头内容",
    },
    child:{
      type:Object,
      default:()=>{}
    }
  },
  data(){
    return {
      defaultData:{
        id: "0001",
        label: "新增内容",
        image:""
      }
    }
  },
  methods:{
    getComponentName(type){
      console.log("schema-"+type);
      return "schema-"+type;
    },
    deleteCurData(item){
      this.myValue.splice(this.myValue.indexOf(item),1);
    },
    addData(){
      this.myValue.push({
        ...this.defaultData,
        id:this.$getRandomCode(8)
      });
    }
  }
}
</script>

<style scoped lang="scss">
.array-body{
  margin:20px 20px 10px;
  overflow:hidden;
  background-color: #f7f8fa;
  .data-item{
    position: relative;
    padding:10px;
    background-color: #fff;
    box-shadow: 0 0.05333333rem 0.10666667rem rgba(0, 0, 0, 0.1);
    &:hover{
      .close-icon{
        opacity: 1;
        cursor: pointer;
      }
    }
    .close-icon{
      position:absolute;
      display:flex;
      align-items:center;
      justify-content:center;
      width:16px;
      height:16px;
      font-size:20px;
      background-color: lightgray;
      border-radius:8px;
      right:-7px;
      top:-7px;
      color:red;
      opacity: 0;
    }
  }
  .add-button{
    margin: 10px;
    text-align: center;
    height:40px;
    line-height: 40px;
    font-size: 14px;
    border:1px $color-theme solid;
    background-color: #fff;
    color:$color-theme;
    &:hover{
      cursor:pointer;
    }
  }
}
</style>