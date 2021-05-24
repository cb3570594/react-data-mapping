<template>
  <div>
    <div class="title">DTDesign-Vue数据映射组件</div>
    <div style="width: 100%; display: flex; flex-wrap: wrap">
      <div class="canvas-container">
        <DataMapping
          className="container single-no-header"
          sourceClassName="single-no-header-source"
          targetClassName="single-no-header-target"
          :columns="columns1"
          :sourceData="sourceData1"
          :targetData="targetData1"
          :mappingData="mappingData1"
          :width="600"
          :height="500"
        />
      </div>
      <div class="canvas-container">
        <DataMapping
          className="container single-with-header"
          :columns="columns2"
          :sourceData="sourceData2"
          :targetData="targetData2"
          :mappingData="mappingData2"
          :width="600"
          :height="500"
        />
      </div>
      <div class="canvas-container">
        <DataMapping
          className="container mutiply-mapping"
          :columns="columns3"
          :sourceData="sourceData3"
          :targetData="targetData3"
          :mappingData="mappingData3"
          type="mutiply"
          :width="600"
          :height="500"
          :config="{
            extraPos: {
              paddingLeft: 10,
              paddingRight: 10,
              paddingTop: 10,
              paddingBottom: 10,
              paddingCenter: 130,
            },
          }"
        />
      </div>
      <div class="canvas-container">
        <DataMapping
          className="container mutiply-mapping"
          :columns="columns3"
          :sourceData="sourceData3"
          :targetData="targetData3"
          :mappingData="mappingData3"
          type="mutiply"
          :width="600"
          :height="600"
          :emptyContent="emptyContent"
          :config="{
            sortable: true,
            extraPos: {
              paddingLeft: 10,
              paddingRight: 10,
              paddingTop: 10,
              paddingBottom: 10,
              paddingCenter: 130,
            },
          }"
        />
      </div>
      <div class="canvas-container">
        <DataMapping
          className="container single-with-header"
          :columns="columns4"
          :sourceData="sourceData4"
          :targetData="targetData4"
          :mappingData="mappingData4"
          :width="600"
          :height="500"
          :config="{
            linkNumLimit: {
              source: 2,
              target: 1,
            },
            extraPos: {
              paddingLeft: 10,
              paddingRight: 10,
              paddingTop: 10,
              paddingBottom: 10,
              paddingCenter: 100,
            },
          }"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { DataMapping } from '../../../src/index';
import * as SingleNoHeaderData from './mock_data/single-no-header';
import * as SingleWithHeaderData from './mock_data/single-with-header';
import * as MutiplyMappingData from './mock_data/mutiply-mapping';
import * as SinglePointLimit from './mock_data/single-point-limit';
const { columns1, mappingData1, sourceData1, targetData1 } = SingleNoHeaderData;
const { columns2, mappingData2, sourceData2, targetData2 } = SingleWithHeaderData;
const { columns3, mappingData3, sourceData3, targetData3 } = MutiplyMappingData;
const { columns4, mappingData4, sourceData4, targetData4 } = SinglePointLimit;
import './index.less';
export default {
  components: {
    DataMapping,
  },
  data() {
    return {
      columns1,
      mappingData1,
      sourceData1,
      targetData1,
      columns2,
      mappingData2,
      sourceData2,
      targetData2,
      columns3,
      mappingData3,
      sourceData3,
      targetData3,
      columns4,
      mappingData4,
      sourceData4,
      targetData4,
      emptyContent: () => {
        return (
          <div class="empty-content">
            <p class="desc">暂无数据</p>
            <p
              class="add-field"
              vOn:click={(e) => {
                e.stopPropagation();
                console.log('自定义空状态');
              }}
            >
              + 添加字段
            </p>
          </div>
        );
      },
    };
  },
};
</script>

<style lang="less">
.title {
  background-color: #212528;
  color: #fff;
  height: 50px;
  line-height: 50px;
  padding: 0 50px;
}
.canvas-container {
  padding: 8px;
  flex: 0 0 600px;
  border: 1px solid rgba(99, 99, 99, 0.5);
}
</style>