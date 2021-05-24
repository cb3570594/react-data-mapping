import DataMapping from './index.vue';

const install = (Vue)=>{
  Vue.component(DataMapping.name, DataMapping);
}

// 默认导出组件
export default {
  install,
  DataMapping,
};

export {
  DataMapping,
}
