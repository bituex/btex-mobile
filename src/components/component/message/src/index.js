import Vue from 'vue';
import messageVue from './Message.vue';
var defaults = {
  show: false,
  text: 'message',
  duration: '3000',
  type: 'success'
};
var MessageVueConstructor = Vue.extend(messageVue);
MessageVueConstructor.prototype.close = function() {
  var vm = this;
  this.$on('after-leave', _ => {
    if (vm.$el && vm.$el.parentNode) {
      vm.$el.parentNode.removeChild(vm.$el);
    }
    this.$destroy();
  });
  vm.show = false;
};
var messageBox = (options = {}) => {
  if (Vue.prototype.$isServer) return;
  options = Object.assign({}, defaults, options);
  var parent = document.body;
  var instance = new MessageVueConstructor({
    el: document.createElement('div'),
    data: options
  });
  parent.appendChild(instance.$el);
  Vue.nextTick(() => {
    instance.show = true;
    setTimeout(function() {
      instance.close();
    }, options.duration);
  });
  return instance;
};

export default messageBox;
