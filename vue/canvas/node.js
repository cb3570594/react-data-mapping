'use strict';

import {Node} from 'butterfly-dag';
// import * as ReactDOM from 'react-dom';
import Vue from 'vue';
import $ from 'jquery';
import * as _ from 'lodash';
import {Tips} from 'butterfly-dag';
import emptyDom from './empty';
import Endpoint from './endpoint';

export default class TableNode extends Node {
  constructor(opts) {
    super(opts);
    // 标题高度
    this.TITLE_HEIGHT = 34;
    // 列标题高度
    this.COLUMNS_TITLE_HEIGHT = 28;
    // 每列宽度
    this.COLUMN_WIDTH = 60;
    // 每行高度
    this.ROW_HEIGHT = 26;
    // 垂直间距
    this.PADDING_VERTICAL = 10;
    // 水平间距
    this.PADDING_HORIZONTAL = _.get(opts, '_extraPos.paddingCenter') || 150;
    // 排序宽度
    this.SORTABLE_WIDTH = 40;

    this.height = 0;
    this.width = 0;

    this.fieldsList = [];
  }
  _addEventListener() {
    $(this.dom).on('mouseDown', (e) => {
      const LEFT_KEY = 0;
      if (e.button !== LEFT_KEY) {
        return;
      }

      if (this.draggable) {
        this._isMoving = true;
        this.emit('InnerEvents', {
          type: 'node:dragBegin',
          data: this
        });
      } else {
        // 单纯为了抛错事件给canvas，为了让canvas的dragtype不为空，不会触发canvas:click事件
        this.emit('InnerEvents', {
          type: 'node:mouseDown',
          data: this
        });

        return true;
      }
    });
  }
  mounted() {
    this._createNodeEndpoint();
    // 保持title宽度
    if (!this.fieldsList.length) {
      $(this.dom).find('.title').css('width', this.options._emptyWidth || 150);
    }
    const fieldItems = $(this.dom).find('.field-item');
    const fieldItemDoms = Array.prototype.slice.apply(fieldItems);
    fieldItemDoms.forEach((_fieldItem, index) => {
      if(_fieldItem.scrollWidth > _fieldItem.clientWidth) {
        const fieldItem = $(fieldItems[index])
        Tips.createTip({
          className: 'field-item-tooltip',
          targetDom: fieldItem[0],
          genTipDom: () => fieldItem.text(),
        });
      }
    })
  }
  draw(obj) {
    let _dom = obj.dom;
    if (!_dom) {
      _dom = $('<div></div>')
        .attr('class', 'node table-node')
        .attr('id', obj.name);
    }
    if (!_.isEmpty(obj.options._sourceClassName) && _.get(obj, 'options.type') === 'source') {
      _dom.addClass(obj.options._sourceClassName)
    }
    if (!_.isEmpty(obj.options._targetClassName) && _.get(obj, 'options.type') === 'target') {
      _dom.addClass(obj.options._targetClassName)
    }
    const node = $(_dom);
    // 计算节点坐标
    if (obj.top !== undefined) {
      node.css('top', `${obj.top + _.get(obj, 'options._extraPos.paddingTop', 0)}px`);
    }
    if (obj.left !== undefined) {
      node.css('left', `${obj.left + _.get(obj, 'options._extraPos.paddingLeft', 0)}px`);
    }

    this._calcSize(node, obj);

    this._createTableName(node); // 表名
    this._createFieldTitle(node); // 字段标题
    this._createFields(node); // 字段
    return node[0];
  }
  _createTableName(container = this.dom) {
    let title = _.get(this, 'options.title');
    if (title) {
      let titleDom = $(`<div class="title">${title}</div>`);
      titleDom.css({
        'height': this.TITLE_HEIGHT + 'px',
        'line-height': this.TITLE_HEIGHT + 'px'
      });
      $(container).append(titleDom);
    }
  }
  _createFieldTitle(container = this.dom) {
    let columns = _.get(this, 'options._columns', []);
    let hasFieldTitle = _.some(columns, (item) => {
      return item.title;
    });
    if (hasFieldTitle) {
      const columnsTitleDom = $('<div class="filed-title"></div>')
      columns.forEach(_col => {
        const columnsTitleItem = $(`<span class="filed-title-item">${_col.title}</span>`);
        columnsTitleItem.css('width', (_col.width || this.COLUMN_WIDTH) + 'px');
        columnsTitleDom.append(columnsTitleItem);
      });
      columnsTitleDom.css('height', this.COLUMNS_TITLE_HEIGHT + 'px')
                     .css('line-height', this.COLUMNS_TITLE_HEIGHT + 'px')
      container.append(columnsTitleDom);
    }
  }
  _createSortableBtn(field) {
    let sortFieldDom = $(`
      <span class="field-sort">
        <i class="data-mapping-icon data-mapping-icon-paixu-top move-up"></i>
        <i class="data-mapping-icon data-mapping-icon-paixu-bottom move-down"></i>
      </span>
    `);
    sortFieldDom.css({
      width: this.SORTABLE_WIDTH + 'px',
    });
    sortFieldDom.find('.move-up').click(this._moveUp.bind(this, field));
    sortFieldDom.find('.move-down').click(this._moveDown.bind(this, field));
    return sortFieldDom;
  }
  _createFields(container = this.dom) {
    let fields = _.get(this, 'options.fields');
    let columns = _.get(this, 'options._columns', []);
    let sortable = _.get(this, 'options.sortable');
    let isObject = Object.prototype.toString.call(sortable) === "[object Object]";
    let type = _.get(this, 'options.type', '');

    if (fields && fields.length) {
      fields.forEach((_field, index) => {
        let fieldDom = $('<div class="field"></div>');
        let _primaryKey = columns[0].key;
        let sortFieldDom = undefined;
  
        if (sortable && typeof(sortable) === 'boolean') {
          sortFieldDom = this._createSortableBtn(_field);
        }
        fieldDom.css({
          height: this.ROW_HEIGHT + 'px',
          'line-height': this.ROW_HEIGHT + 'px'
        });
        columns.forEach((_col) => {
          if (_col.render) {
            let fieldItemDom = $(`<span class="field-item"></span>`);
            fieldItemDom.css('width', (_col.width || this.COLUMN_WIDTH) + 'px');
            const vueComponent = Vue.extend({
              render: _col.render,
              props: {
                name: String,
                _field: Object,
                index: Number
              }
            })
            const nodeCon = new vueComponent({
              propsData: {
                name: _field[_col.key],
                _field,
                index
              },
              methods: {
                log() {
                  console.log(this.name)
                }
              }
            })
            nodeCon.$mount()
            // ReactDOM.render(_col.render(_field[_col.key], _field, index), fieldItemDom[0]);
            fieldItemDom[0].append(nodeCon.$el);
            fieldDom.append(fieldItemDom);
          } else {
            let fieldItemDom = $(`<span class="field-item">${_field[_col.key]}</span>`);
            fieldItemDom.css('width', (_col.width || this.COLUMN_WIDTH) + 'px');
            fieldDom.append(fieldItemDom);
          }
          if (_col.primaryKey) {
            _primaryKey = _col.key;
          }
          
        });
        if (sortFieldDom) {
          fieldDom.append(sortFieldDom);
        }
        if (type === 'source') {
          let rightPoint = $('<div class="point right-point"></div>');
          fieldDom.append(rightPoint);
          if (isObject && sortable.source) {
            sortFieldDom = this._createSortableBtn(_field);
            fieldDom.append(sortFieldDom);
          }
        }
        if (type === 'target') {
          let leftPoint = $('<div class="point left-point"></div>');
          fieldDom.append(leftPoint);
          if (isObject && sortable.target) {
            sortFieldDom = this._createSortableBtn(_field);
            fieldDom.append(sortFieldDom);
          }
        }
        container.append(fieldDom);
        this.fieldsList.push({
          id: _field[_primaryKey],
          dom: fieldDom
        })
        
      });
    } else {
      const _emptyContent = _.get(this.options, '_emptyContent');
      const noDataTree = emptyDom({
        content: _emptyContent,
        width: this.options._emptyWidth
      });

      container.append(noDataTree);
    }
  }
  _createNodeEndpoint() {
    let type = this.options.type;
    this.fieldsList.forEach((item) => {
      this.addEndpoint({
        id: item.id,
        orientation: type === 'source' ? [1,0] : [-1,0],
        type: type,
        _isNodeSelf: true,
        dom: item.dom[0],
        Class: Endpoint
      });
      if (type === 'source') {
        this.addEndpoint({
          id: item.id + '-right',
          orientation: [1,0],
          type: type,
          _isNodeSelf: false,
          dom: $(item.dom).find('.right-point')[0],
          Class: Endpoint,
          linkable: false
        });
      } else if (type === 'target') {
        this.addEndpoint({
          id: item.id + '-left',
          orientation: [-1,0],
          type: type,
          _isNodeSelf: false,
          dom: $(item.dom).find('.left-point')[0],
          Class: Endpoint,
          disLinkable: false
        });
      }
    });
  }
  _calcSize(node, obj) {
    let hasTitle = _.get(obj, 'options.title');
    let fields = _.get(obj, 'options.fields', []);
    let sortable = _.get(obj, 'options.sortable');
    let type = _.get(obj, 'options.type');

    if (hasTitle) {
      this.height += this.TITLE_HEIGHT;
    }
    this.height += fields.length * this.ROW_HEIGHT;
    
    let columns = _.get(obj, 'options._columns');
    columns.forEach((item) => {
      this.width += item.width || this.COLUMN_WIDTH;
    });

    if (typeof(sortable) === 'boolean') this.width += this.SORTABLE_WIDTH;
    
    if (Object.prototype.toString.call(sortable) === '[object Object]') {
      if (type === 'source') this.width += this.SORTABLE_WIDTH;
      if (type === 'target') this.width += this.SORTABLE_WIDTH;
    }
    // todo: 记得算上SORTABLE_WIDTH
  }

  _moveUp(curField, event) {
    event.preventDefault();
    event.stopPropagation();
    let curIndex = this.fieldsList.findIndex(i => i.id === curField.id);
    let oldFields = _.get(this, 'options.fields', []);
    let oldFieldsItem = oldFields.splice(curIndex, 1);
    let point = this.getEndpoint(curField.id);
    let curFieldDom = point.dom;
    let curFieldData = this.fieldsList[curIndex];
    // 处理边界
    if (curIndex === 0) {
      console.warn('this field has reach the top!');
      return;
    }
    let preFieldData = this.fieldsList[curIndex - 1];
    let preFieldDom = preFieldData.dom;

    // 交换dom
    $(preFieldDom).before(curFieldDom);

    // 交换数据
    this.fieldsList[curIndex] = preFieldData;
    this.fieldsList[curIndex - 1] = curFieldData;
    oldFields.splice(curIndex - 1, 0, oldFieldsItem[0]);

    // 发送事件，更新线段和锚点坐标
    this.emit('custom.field.sort', {
      nodeId: this.id,
      pointIds: [curFieldData.id, preFieldData.id]
    });
  }

  _moveDown(curField, event) {
    event.preventDefault();
    event.stopPropagation();
    let curIndex = this.fieldsList.findIndex(i => i.id === curField.id);
    let oldFields = _.get(this, 'options.fields', []);
    let oldFieldsItem = oldFields.splice(curIndex, 1);
    let point = this.getEndpoint(curField.id);
    let curFieldDom = point.dom;
    let curFieldData = this.fieldsList[curIndex];
    // 处理边界
    if (curIndex === this.fieldsList.length - 1) {
      console.warn('this field has reach the bottom!');
      return;
    }
    let nextFieldData = this.fieldsList[curIndex + 1];
    let nextFieldDom = nextFieldData.dom;

    // 交换dom
    $(nextFieldDom).after(curFieldDom);

    // 交换数据
    this.fieldsList[curIndex] = nextFieldData;
    this.fieldsList[curIndex + 1] = curFieldData;
    oldFields.splice(curIndex + 1, 0, oldFieldsItem[0]);

    // 发送事件，更新线段和锚点坐标
    this.emit('custom.field.sort', {
      nodeId: this.id,
      pointIds: [curFieldData.id, nextFieldData.id]
    });
    
  }
};
