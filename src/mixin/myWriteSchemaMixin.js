export default {
    data(){
        return{
            myValue:undefined
        }
    },
    props:{
        id:{},
        value:{},
        label:{
            type:String,
            default:"无标签"
        },
        options:{
            type: Object,
            default: () => {}
        }
    },
    computed:{
        myOptions(){
            return {...this.options};
        }
    },
    watch:{
        value:{
            handler(newValue){
                this.myValue = newValue;
            },
            immediate:true,
            deep:true
        },
        myValue:{
            handler(newValue, oldValue){
                this.$emit("input", newValue);
                this.$emit("change", newValue);
            },
            immediate: true,
            deep:true
        }
    }
}