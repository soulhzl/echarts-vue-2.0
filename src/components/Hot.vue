<template>
  <div class="com-echart">
    <div class="com-echart" ref="hot"></div>
    <span class="left-arrow iconfont" @click="toLeft" :style="spanStyle"
      >&#xe618;</span
    >
    <span class="right-arrow iconfont" @click="toRight" :style="spanStyle"
      >&#xe605;</span
    >
    <span class="echart-title" :style="spanStyle">{{ echartTitle }}</span>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { getThemeValue } from "@/utils/theme_utils.js";
export default {
  name: "Hot",
  data() {
    return {
      data: null, //数据
      mychart: null, //echarts实例
      currentIndex: 0,
      fontSize: 0,
    };
  },
  computed: {
    ...mapState(["theme"]),
    echartTitle() {
      return this.data ? this.data[this.currentIndex].name : "";
    },
    spanStyle() {
      return {
        fontSize: this.fontSize + "px",
        color: getThemeValue(this.theme).titleColor,
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
    this.ws.registerCallback("hotproductData", this.initData);
  },
  mounted() {
    this.initEcharts();
    // this.initData();
    this.ws.send({
      action: "getData",
      socketType: "hotproductData",
      chartName: "hotproduct",
      value: "",
    });
    window.addEventListener("resize", this.screenAdapter);
    this.screenAdapter();
  },
  destroyed() {
    window.removeEventListener("resize", this.screenAdapter);
    this.ws.unregisterCallback("hotproductData");
  },
  methods: {
    initEcharts() {
      // 初始化echarts实例
      this.mychart = this.echarts.init(this.$refs.hot, this.theme);
      const initOption = {
        title: {
          text: "▎热销商品的占比", //标题
          left: 20, //字体离左边px
          top: 20, //字体离上边px
        },
        legend: {
          top: "15%", //legend距离上方高度
          icon: "circle", //legend前面为圆形
        },
        tooltip: {
          show: true, //鼠标移入时显示数据
          formatter: (arg) => {
            //设置显示的数据
            const data = arg.data.children;
            let total = 0;
            data.forEach((e) => {
              total += e.value;
            });
            let text = "";
            data.forEach((e) => {
              text += `${e.name}：${
                parseInt((e.value / total) * 100) + "%"
              }<br/>`;
            });
            return text;
          },
        },
        series: {
          type: "pie",
          label: {
            show: false, //默认隐藏label
          },
          emphasis: {
            label: {
              show: true, //高亮时显示label
            },
            labelLine: {
              show: false, //label前面那条线是否显示
            },
          },
        },
      };
      this.mychart.setOption(initOption);
    },
    async initData(data) {
      // const res = await this.axios.get("hotproduct");
      // this.data = res.data;
      this.data = data;
      this.updateEcharts();
    },
    updateEcharts() {
      const legendData = this.data[this.currentIndex].children.map(
        (e) => e.name
      );
      const valData = this.data[this.currentIndex].children.map((e) => {
        return {
          name: e.name,
          value: e.value,
          children: e.children, // pie子系列，用于tooltip数据显示
        };
      });
      const dataOption = {
        legend: {
          data: legendData,
        },
        series: [
          {
            data: valData,
          },
        ],
      };
      this.mychart.setOption(dataOption);
    },
    screenAdapter() {
      this.fontSize = (this.$refs.hot.offsetWidth / 100) * 3.6;
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: this.fontSize, // 标题字体大小
          },
        },
        legend: {
          itemWidth: this.fontSize, // legend宽
          itemHeight: this.fontSize, // legend高
          itemGap: this.fontSize / 2, //legend距离
          textStyle: {
            fontSize: this.fontSize, // 字体大小
          },
        },
        series: [
          {
            radius: this.fontSize * 5, //圆半径
            center: ["50%", "60%"], // 中心位置
          },
        ],
      };
      this.mychart.setOption(adapterOption);
      this.mychart.resize();
    },
    // 向左
    toLeft() {
      this.currentIndex--;
      if (this.currentIndex < 0) {
        this.currentIndex = this.data.length - 1;
      }
      this.updateEcharts();
    },
    // 向右
    toRight() {
      this.currentIndex++;
      if (this.currentIndex > this.data.length - 1) {
        this.currentIndex = 0;
      }
      this.updateEcharts();
    },
  },
};
</script>

<style lang='less' scoped>
.left-arrow {
  position: absolute;
  left: 10%;
  top: 50%;
  color: white;
  transform: translateY(-50%);
  cursor: pointer;
}
.right-arrow {
  position: absolute;
  right: 10%;
  top: 50%;
  color: white;
  transform: translateY(-50%);
  cursor: pointer;
}
.echart-title {
  position: absolute;
  left: 80%;
  bottom: 20px;
  color: white;
}
</style>