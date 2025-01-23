import Vue from 'vue';

function initCustomComponentsConfig(){
    const files = require.context('@/components/custom-components', true,/component.json$/);
    const data=[];
    let fields = {};
    console.log(files);

    files.keys().forEach(key => {
        const [,name]= key.split('/');
        const originData={component:name,...files(key)};
        fields[name] = originData.fields;
        data.push(getSchemaDefaultValue(originData));
    });

    Vue.prototype.$fields = fields
    Vue.prototype.$initializing = data
    console.log(fields,data);
}
initCustomComponentsConfig();
function getSchemaDefaultValue(inputVal){
    const res={};
    for (const inputValKey in inputVal) {
        // console.log(inputValKey==="children",(typeof inputVal[inputValKey] === 'object'));
        if(inputValKey==="children"||typeof inputVal[inputValKey] !== 'object'){
            res[inputValKey] = inputVal[inputValKey];
            continue;
        }
        //注意如何处理children
        rescursiveGetDeepValue(res,inputVal[inputValKey]);
    }
    return res;
}

function rescursiveGetDeepValue(res,inputVal){{
    // const res={};
    for (const inputValKey in inputVal){
        if(inputVal[inputValKey].type !== 'object'){
            res[inputValKey] = inputVal[inputValKey].value;
        }else{
            res[inputValKey]={};
            rescursiveGetDeepValue(res[inputValKey],inputVal[inputValKey].child);
        }
    }
}}