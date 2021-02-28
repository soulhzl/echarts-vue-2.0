<template>
  <div class="com-echart" ref="stock"></div>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "Stock",
  data() {
    return {
      data: null, //数据
      mychart: null, //echarts实例
      currentIndex: 0,
      timeId: null, //定时器
    };
  },
  created() {
    this.ws.registerCallback("stockData", this.initData);
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
      socketType: "stockData",
      chartName: "stock",
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
    this.ws.unregisterCallback("stockData");
  },
  methods: {
    initEcharts() {
      // 初始化echarts实例
      this.mychart = this.echarts.init(this.$refs.stock, this.theme);
      const initOption = {
        title: {
          text: "▎库存和销量分析", //标题
          left: 20, //字体离左边px
          top: 20, //字体离上边px
        },
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
        this.updateIndex();
      });
    },
    async initData(data) {
      // const res = await this.axios.get("stock");
      // this.data = res.data;
      this.data = data;
      this.updateEcharts();
      this.updateIndex();
    },
    updateEcharts() {
      const centerArr = [
        ["18%", "40%"],
        ["50%", "40%"],
        ["82%", "40%"],
        ["34%", "75%"],
        ["66%", "75%"],
      ];
      const colorArr = [
        ["#4FF778", "#0BA82C"],
        ["#E5DD45", "#E8B11C"],
        ["#E8821C", "#E55445"],
        ["#5052EE", "#AB6EE5"],
        ["#23E5E5", "#2E72BF"],
      ];
      const start = this.currentIndex * 5;
      const end = (this.currentIndex + 1) * 5;
      const valData = this.data.slice(start, end);
      const seriesArr = valData.map((e, index) => {
        return {
          type: "pie",
          center: centerArr[index], // 圆心位置
          emphasis: {
            scale: false, // 关闭鼠标移入到饼图时的动画效果
          },
          labelLine: {
            show: false, // 隐藏指示线
          },

          data: [
            {
              name: e.name + "\n\n" + e.sales, //用于显示文字提示
              value: e.sales,
              label: {
                position: "center", // 文字显示在中间
                color: colorArr[index][0], // 文字颜色
              },
              itemStyle: {
                //颜色
                color: new this.echarts.graphic.LinearGradient(0, 1, 0, 0, [
                  {
                    offset: 0,
                    color: colorArr[index][0],
                  },
                  {
                    offset: 1,
                    color: colorArr[index][1],
                  },
                ]),
              },
            },
            {
              value: e.stock,
              itemStyle: {
                color: "#333843",
              },
            },
          ],
        };
      });
      const dataOption = {
        series: seriesArr,
      };
      this.mychart.setOption(dataOption);
    },
    screenAdapter() {
      const fontSize = (this.$refs.stock.offsetWidth / 100) * 3.6;
      const innerRadius = fontSize * 2.8;
      const outterRadius = innerRadius * 1.125;
      const seriesArr = [];
      for (let i = 0; i < 5; i++) {
        seriesArr.push({
          type: "pie",
          radius: [outterRadius, innerRadius], // 圆外径和内径
          label: {
            fontSize: fontSize / 2,
          },
        });
      }
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: fontSize, // 标题字体大小
          },
        },
        series: seriesArr,
      };
      this.mychart.setOption(adapterOption);
      this.mychart.resize();
    },
    updateIndex() {
      // 如果有定时器则清除
      if (this.timeId) {
        clearInterval(this.timeId);
      }
      // 定时器每次给当前页+1，超出总页数时置为1
      this.timeId = setInterval(() => {
        this.currentIndex++;
        if (this.currentIndex > 1) {
          this.currentIndex = 0;
        }
        this.updateEcharts();
      }, 3000);
    },
  },
};
</script>
