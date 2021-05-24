import $ from 'jquery';
import Vue from 'vue';


/**
 * params {Object} config
 * params {JSX.Element | String} config.content
 * params {Number | String} config.width
 */
export default (config) => {
  const content = config.content;
  let width = config.width;

  if (!width) {
    width = '150px';
  }
  
  if (typeof config.width === 'number') {
    width = config.width + 'px';
  }

  let emptyDom = '<div style="width: ' + width + '"></div>';

  if (content) {
    if (typeof content === 'function') {
      const vueCon = Vue.extend({
        render: content,
      });
      const nodeCon = new vueCon();
      nodeCon.$mount();
      emptyDom = nodeCon.$el;
    } else {
      emptyDom = $(content);
    }
  } else {
    emptyDom = $('<div class="no-data" style="width: ' + width + '"></div>');
    const iconDom = $('<i class="no-data-icon data-mapping-icon data-mapping-icon-kongshuju"></i>');
  
    emptyDom.append(iconDom);
  }
  return emptyDom;
};
