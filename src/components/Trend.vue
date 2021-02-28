<template>
  <div class="com-echart" :style="titleSize">
    <div class="dropdown-title">
      <span :style="titleSize">{{ typeTitle }}</span>
      <span
        class="dropdown-select iconfont"
        :style="titleSize"
        @click="showChoice = !showChoice"
        >&#xe613;</span
      >
      <div v-show="showChoice" :style="marginStyle">
        <div
          class="choice-type"
          v-for="item in selectType"
          :key="item.key"
          @click="selectChoice(item.key)"
        >
          {{ item.text }}
        </div>
      </div>
    </div>
    <div class="com-echart" ref="trend"></div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { getThemeValue } from "@/utils/theme_utils.js";
export default {
  name: "Trend",
  data() {
    return {
      data: null, //数据
      mychart: null, //echarts实例
      showChoice: false,
      choiceType: "map",
      fontSize: 0,
    };
  },
  computed: {
    ...mapState(["theme"]),
    // 获取选择类型
    selectType() {
      return this.data
        ? this.data.type.filter((e) => {
            return e.key != this.choiceType;
          })
        : [];
    },
    // 获取选择类型标题
    typeTitle() {
      return this.data ? "▎" + this.data[this.choiceType].title : "";
    },
    // 标题大小
    titleSize() {
      return {
        fontSize: this.fontSize + "px",
        color: getThemeValue(this.theme).titleColor,
      };
    },
    // 图标大小和间距
    marginStyle() {
      return {
        marginLeft: this.fontSize + "px",
        backgroundColor: "#222733",
      };
    },
  },
  watch: {
    theme() {
      this.mychart.dispose();
      this.initEcharts();
      this.screenAdapter();
      if (this.data) {
        this.updateEcharts();
      }
    },
  },
  created() {
    this.ws.registerCallback("trendData", this.initData);
  },
  mounted() {
    this.initEcharts();
    // this.initData();
    this.ws.send({
      action: "getData",
      socketType: "trendData",
      chartName: "trend",
      value: "",
    });
    window.addEventListener("resize", this.screenAdapter);
    this.screenAdapter();
  },
  destroyed() {
    window.removeEventListener("resize", this.screenAdapter);
    this.ws.unregisterCallback("trendData");
  },
  methods: {
    initEcharts() {
      // 初始化echarts实例
      this.mychart = this.echarts.init(this.$refs.trend, this.theme);
      const initOption = {
        grid: {
          top: "35%", //整体表格离上方
          left: "3%", //整体表格离左方
          right: "4%", //整体表格离右方
          bottom: "1%", //整体表格离下方
          containLabel: true, //距离是否包含坐标字体
        },
        tooltip: {
          trigger: "axis", // 坐标提示
        },
        legend: {
          top: "15%", // legend距离上面
          left: 20, // legend距离左边
          icon: "circle", // legend前面为圆
        },
        xAxis: {
          type: "category",
          boundaryGap: false, //   紧挨边缘
        },
        yAxis: {
          type: "value",
        },
      };
      this.mychart.setOption(initOption);
    },
    async initData(data) {
      // get请求
      // const res = await this.axios.get("trend");
      // this.data = res.data;
      this.data = data;
      this.updateEcharts();
    },
    updateEcharts() {
      // x轴月份数据
      const monthArr = this.data.common.month;
      // 中间值数据
      const valueData = this.data[this.choiceType].data;
      // 颜色数据
      // 半透明的颜色值
      const colorArr1 = [
        "rgba(11, 168, 44, 0.5)",
        "rgba(44, 110, 255, 0.5)",
        "rgba(22, 242, 217, 0.5)",
        "rgba(254, 33, 30, 0.5)",
        "rgba(250, 105, 0, 0.5)",
      ];
      // 全透明的颜色值
      const colorArr2 = [
        "rgba(11, 168, 44, 0)",
        "rgba(44, 110, 255, 0)",
        "rgba(22, 242, 217, 0)",
        "rgba(254, 33, 30, 0)",
        "rgba(250, 105, 0, 0)",
      ];
      // Y数据
      const seriesData = valueData.map((e, i) => {
        return {
          name: e.name, //与legend对应
          type: "line",
          data: e.data,
          stack: this.choiceType, // 变得有序
          areaStyle: {
            //区域颜色
            color: new this.echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: colorArr1[i],
              },
              {
                offset: 1,
                color: colorArr2[2],
              },
            ]),
          },
        };
      });
      // legend数据
      const legendData = valueData.map((e) => e.name);
      const dataOption = {
        xAxis: {
          data: monthArr,
        },
        legend: {
          data: legendData,
        },
        series: seriesData,
      };
      this.mychart.setOption(dataOption);
    },
    screenAdapter() {
      this.fontSize = (this.$refs.trend.offsetWidth / 100) * 3.6;
      const adapterOption = {
        legend: {
          itemWidth: this.fontSize, // legend宽
          itemHeight: this.fontSize, // legend高
          itemGap: this.fontSize, //legend距离
          textStyle: {
            fontSize: this.fontSize, // 字体大小
          },
        },
      };
      this.mychart.setOption(adapterOption);
      this.mychart.resize();
    },
    selectChoice(key) {
      // 设置当前选择类型
      this.choiceType = key;
      // 将选择栏隐藏
      this.showChoice = false;
      this.updateEcharts();
    },
  },
};
</script>

<style lang="less" scoped>
.dropdown-title {
  z-index: 10;
  position: absolute;
  left: 20px;
  top: 20px;
  color: white;
  .dropdown-select {
    margin-left: 10px;
    cursor: pointer;
  }
  div {
    .choice-type {
      cursor: pointer;
    }
  }
}
</style>
