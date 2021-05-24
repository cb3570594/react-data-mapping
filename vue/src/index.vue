<template>
  <div :class="_genClassName" ref="root"></div>
</template>

<script>
import $ from 'jquery';
import './index.less';
import Canvas from './canvas/canvas';
import 'butterfly-dag/dist/index.css';
import { transformInitData, transformChangeData } from './adaptor';
import * as _ from 'lodash';
export default {
  props: {
    className: {
      type: String,
    },
    width: {
      type: [Number, String],
    },
    height: {
      type: [Number, String],
    },
    columns: {
      type: Array,
    },
    type: {
      type: String,
    },
    sourceData: {
      type: [Array, Object],
    },
    targetData: {
      type: [Array, Object],
    },
    mappingData: {
      type: Array,
    },
    config: {
      type: Object,
    },
    emptyContent: {
      type: [String, Function],
    },
    emptyWidth: {
      type: [Number, String],
    },
    sourceClassName: {
      type: String,
    },
    targetClassName: {
      type: String,
    },
  },
  data() {
    return {
      canvas: null,
    };
  },
  computed: {
    _genClassName() {
      let classname = '';
      if (this.className) {
        classname = this.className + ' butterfly-data-mapping';
      } else {
        classname = 'butterfly-data-mapping';
      }
      return classname;
    },
  },
  mounted() {
    let root = this.$refs.root;
    if (this.width !== undefined || this.width !== 'auto') {
      root.style.width = (this.width || 500) + 'px';
    }
    if (this.height !== undefined || this.height !== 'auto') {
      root.style.height = (this.height || 500) + 'px';
    }

    let result = transformInitData({
      columns: this.columns,
      type: this.type || 'single',
      sortable: _.get(this, 'config.sortable') || false,
      sourceData: _.cloneDeep(this.sourceData),
      targetData: _.cloneDeep(this.targetData),
      mappingData: _.cloneDeep(this.mappingData),
      extraPos: _.get(this, 'config.extraPos'),
      linkNumLimit: _.get(this, 'config.linkNumLimit'),
      emptyContent: this.emptyContent,
      emptyWidth: this.emptyWidth,
      sourceClassName: this.sourceClassName || '',
      targetClassName: this.targetClassName || '',
    });

    let canvasObj = {
      root: root,
      disLinkable: true,
      linkable: true,
      draggable: false,
      zoomable: false,
      moveable: false,
      theme: {
        edge: {
          shapeType: 'AdvancedBezier',
          arrow: true,
          isExpandWidth: true,
          arrowPosition: 1,
          arrowOffset: 5,
        },
        endpoint: {
          limitNum: undefined,
          expandArea: {
            left: 0,
            right: 0,
            top: 0,
            botton: 0,
          },
        },
      },
      extraPos: _.get(this, 'config.extraPos'),
    };
    let _linkNumLimit = _.get(this, 'config.linkNumLimit');
    if (typeof _linkNumLimit === 'number' && !isNaN(_linkNumLimit)) {
      canvasObj.theme.endpoint.limitNum = _linkNumLimit;
    }
    if (Object.prototype.toString.call(_linkNumLimit) === '[object Object]') {
      canvasObj.theme.endpoint.limitNum = _linkNumLimit;
    }
    this.canvas = new Canvas(canvasObj);
    setTimeout(() => {
      this.canvas.draw(result, () => {
        this.canvas._calcPos();
        if (this.width === 'auto') {
          this.canvas._autoResize('width');
        }
        if (this.height === 'auto') {
          this.canvas._autoResize('height');
        }
        this.$emit('onLoaded', this.canvas);
      });
      this._addEventListener();
    }, _.get(this, 'config.delayDraw', 0));
  },
  methods: {
    _addEventListener() {
      let _addLinks = (links) => {
        let newLinkOpts = links.map((item) => {
          let _oldSource = _.get(item, 'sourceEndpoint.id', '');
          let _oldTarget = _.get(item, 'targetEndpoint.id', '');
          let _newSource = _oldSource.indexOf('-right') !== -1 ? _oldSource : _oldSource + '-right';
          let _newTarget = _oldTarget.indexOf('-left') !== -1 ? _oldTarget : _oldTarget + '-left';
          return {
            id: item.options.id,
            sourceNode: item.options.sourceNode,
            targetNode: item.options.targetNode,
            source: _newSource,
            target: _newTarget,
            type: 'endpoint',
          };
        });
        this.canvas.removeEdges(links, true);
        newLinkOpts = newLinkOpts.filter((item) => {
          let targetNode = this.canvas.getNode(item.targetNode);
          let targetEndpoint = targetNode.getEndpoint(item.target);
          let sourceEndpoint = targetNode.getEndpoint(item.source);
          let result = this.canvas._checkLinkNum(targetEndpoint, undefined, 'target');
          // 取消link状态
          if (!result) {
            sourceEndpoint && $(sourceEndpoint.dom).removeClass('link');
          }
          return result;
        });
        return this.canvas.addEdges(newLinkOpts, true);
      };
      let _isInit = true;
      this.canvas.on('system.link.connect', (data) => {
        let addEdges = _addLinks(data.links || []);
        let result = [];
        addEdges.forEach((item) => {
          let isConnect = true;
          // this.props.isConnect && (isConnect = this.props.isConnect(item));
          if (isConnect) {
            result.push(item);
          } else {
            this.canvas.removeEdge(item, true);
          }
        });
        if (!_isInit) {
          this.onChange();
        }
        _isInit = false;
        this.canvas._linkedChain(result);
      });

      this.canvas.on('system.link.reconnect', (data) => {
        let addEdges = _addLinks(data.addLinks || []);
        let result = [];
        addEdges.forEach((item) => {
          let isConnect = true;
          // this.props.isConnect && (isConnect = this.props.isConnect(item));
          if (isConnect) {
            result.push(item);
          } else {
            this.canvas.removeEdge(item, true);
          }
        });
        this.onChange();
        this.canvas._unLinkedChain(data.delLinks);
        this.canvas._linkedChain(result);
      });

      this.canvas.on('system.links.delete', (data) => {
        this.onChange();
        this.canvas._unLinkedChain(data.links);
      });

      // 线段删除特殊处理
      this.canvas.on('custom.endpoint.dragNode', (data) => {
        let point = data.data;
        let node = this.canvas.getNode(point.nodeId);
        let linkedPoint = node.getEndpoint(point.id + '-left', 'target');
        this.canvas.emit('InnerEvents', {
          type: 'endpoint:drag',
          data: linkedPoint,
        });
      });
      // 连线特殊处理
      this.canvas.on('system.drag.move', (data) => {
        let dragEdge = _.get(data, 'dragEdges[0]');
        let sourcePointId = _.get(dragEdge, 'sourceEndpoint.id', '');
        if (sourcePointId.indexOf('right') === -1) {
          let souceNode = _.get(dragEdge, 'sourceNode');
          let newSourcePoint = souceNode.getEndpoint(sourcePointId + '-right');
          dragEdge.sourceEndpoint = newSourcePoint;
          dragEdge.options.sourceEndpoint = newSourcePoint;
          this.canvas._checkLinkNum(newSourcePoint, dragEdge, 'source');
        }
      });
      // 聚焦链路
      this.canvas.on('custom.endpoint.focus', (data) => {
        this.canvas._focusChain(data.point);
        this.$emit('onRowMouseOver', data.point)
      });
      // 失焦链路
      this.canvas.on('custom.endpoint.unFocus', (data) => {
        this.canvas._unFocusChain(data.point);
        this.$emit('onRowMouseOut', data.point)
      });

      // 字段重新排列
      this.canvas.on('custom.field.sort', (data) => {
        const { nodeId, pointIds } = data;
        let node = this.canvas.getNode(nodeId);
        if (!node) {
          return;
        }
        pointIds.forEach((pointId) => {
          let fieldPoints = [
            node.getEndpoint(pointId),
            node.getEndpoint(pointId + '-left'),
            node.getEndpoint(pointId + '-right'),
          ];
          fieldPoints.forEach((point) => {
            if (!point) {
              return;
            }
            point.updatePos();
          });
          let updateEdges = this.canvas.edges.filter((item) => {
            if (nodeId === item.sourceNode.id && pointId + '-right' === item.sourceEndpoint.id) {
              return true;
            }
            if (nodeId === item.targetNode.id && pointId + '-left' === item.targetEndpoint.id) {
              return true;
            }
            return false;
          });
          updateEdges.forEach((item) => {
            item.redraw();
          });
          this.onChange();
        });
      });
    },
    onChange() {
      let result = transformChangeData(this.canvas.getDataMap(), this.type || 'single');
      this.$emit('onChange', result)
    },
  },
};
</script>

<style>
</style>