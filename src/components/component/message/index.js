import messageBox from './src/index';
export default {
  install(Vue) {
    Vue.prototype.$message = messageBox;
  }
};
