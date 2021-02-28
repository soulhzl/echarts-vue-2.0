<template>
  <div class="com-echart" ref="rank"></div>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "Rank",
  data() {
    return {
      data: null, //数据
      mychart: null, //echarts实例
      startValue: 0, // 区域缩放的起点值
      endValue: 9, // 区域缩放的终点值
      timeId: null, //定时器
    };
  },
  created() {
    this.ws.registerCallback("rankData", this.initData);
  },
  computed: {
    ...mapState(["theme"]),
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
  mounted() {
    this.initEcharts();
    // this.initData();
    this.ws.send({
      action: "getData",
      socketType: "rankData",
      chartName: "rank",
      value: "",
    });
    window.addEventListener("resize", this.screenAdapter);
    this.screenAdapter();
  },
  destroyed() {
    // 页面销毁时清除定时器
    if (this.timeId) {
      clearInterval(this.timeId);
    }
    window.removeEventListener("resize", this.screenAdapter);
    this.ws.unregisterCallback("rankData");
  },
  methods: {
    initEcharts() {
      // 初始化echarts实例
      this.mychart = this.echarts.init(this.$refs.rank, this.theme);
      const initOption = {
        title: {
          text: "▎地区销售排行", //标题
          top: 20, //字体离上边px
          left: 20, //字体离左边px
        },
        // 坐标轴大小
        grid: {
          top: "40%", //整体表格离上方
          left: "5%", //整体表格离左方
          right: "5%", //整体表格离右方
          bottom: "5%", //整体表格离下方
          containLabel: true, //距离是否包含坐标字体
        },
        tooltip: {
          show: true, //鼠标移入坐标时显示信息
        },
        xAxis: {
          type: "category",
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            type: "bar",
          },
        ],
      };
      this.mychart.setOption(initOption);
      // 鼠标移入清除定时器
      this.mychart.on("mouseover", () => {
        if (this.timeId) {
          clearInterval(this.timeId);
        }
      });
      // 鼠标移出开启定时器
      this.mychart.on("mouseout", () => {
        this.updateDataZoom();
      });
    },
    async initData(data) {
      // const res = await this.axios.get("rank");
      // this.data = res.data;
      this.data = data;
      this.data.sort((a, b) => {
        return b.value - a.value;
      });
      this.updateEcharts();
      this.updateDataZoom();
    },
    updateEcharts() {
      const colorArr = [
        ["#0BA82C", "#4FF778"],
        ["#2E72BF", "#23E5E5"],
        ["#5052EE", "#AB6EE5"],
      ];
      const xdata = this.data.map((e) => e.name);
      const ydata = this.data.map((e) => e.value);
      const dataOption = {
        xAxis: {
          data: xdata,
        },
        dataZoom: {
          show: false, // 数据放大缩小显示，显示指定范围数据
          startValue: this.startValue, // 开始值
          endValue: this.endValue, // 结束值
        },
        series: [
          {
            data: ydata,
            itemStyle: {
              // 根据值显示不同颜色
              color: (e) => {
                let targetValArr = null;
                if (e.value > 300) {
                  targetValArr = colorArr[0];
                } else if (e.value > 200) {
                  targetValArr = colorArr[1];
                } else {
                  targetValArr = colorArr[2];
                }
                return new this.echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: targetValArr[0],
                  },
                  {
                    offset: 1,
                    color: targetValArr[1],
                  },
                ]);
              },
            },
          },
        ],
      };
      this.mychart.setOption(dataOption);
    },
    updateDataZoom() {
      // 如果有定时器则清除
      if (this.timeId) {
        clearInterval(this.timeId);
      }
      // 定时器每次首尾值加一
      this.timeId = setInterval(() => {
        this.startValue++;
        this.endValue++;
        if (this.endValue > this.data.length - 1) {
          this.startValue = 0;
          this.endValue = 9;
        }
        this.updateEcharts();
      }, 2000);
    },
    screenAdapter() {
      const fontSize = (this.$refs.rank.offsetWidth / 100) * 3.6;
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: fontSize, // 标题字体大小
          },
        },
        series: [
          {
            barWidth: fontSize, // bar宽度
            itemStyle: {
              borderRadius: [fontSize / 2, fontSize / 2, 0, 0], //bar圆角，上右下左
            },
          },
        ],
      };
      this.mychart.setOption(adapterOption);
      this.mychart.resize();
    },
  },
};
</script>
