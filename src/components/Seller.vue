<template>
  <div class="com-echart" ref="seller"></div>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "Seller",
  data() {
    return {
      data: null, //数据
      mychart: null, //echarts实例
      currentPage: 1, //当前页码
      totalPage: 0, //总页数
      timeId: null, //定时器
    };
  },
  created() {
    this.ws.registerCallback("sellerData", this.initData);
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
      socketType: "sellerData",
      chartName: "seller",
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
    this.ws.unregisterCallback("sellerData");
  },
  methods: {
    initEcharts() {
      // 初始化echarts实例
      this.mychart = this.echarts.init(this.$refs.seller, this.theme);
      // 初始化图标配置
      const initOption = {
        title: {
          text: "▎商家销售统计", //标题
          left: 20, //字体离左边px
          top: 20, //字体离上边px
        },
        // 坐标轴大小
        grid: {
          top: "20%", //整体表格离上方
          left: "3%", //整体表格离左方
          right: "6%", //整体表格离右方
          bottom: "3%", //整体表格离下方
          containLabel: true, //距离是否包含坐标字体
        },
        xAxis: {
          type: "value",
        },
        yAxis: {
          type: "category",
        },
        tooltip: {
          trigger: "axis", //鼠标移入坐标时显示当前坐标数据
          axisPointer: {
            type: "line", //移入背景为线
            z: 0, //层级
            lineStyle: {
              type: "solid", // 背景为线
              color: "#2D3443", //背景线颜色
            },
          },
        },
        series: [
          {
            type: "bar",
            label: {
              show: true, //是否将数据显示在bar上
              position: "right", //数据显示在bar右边
              color: "white", //数据颜色为白色
            },
            itemStyle: {
              // 渐变色，前面两个0为初始x和y坐标，后两个为结束时x和y坐标，数组第一个对象为0%的渐变设置，第二个为100%
              color: new this.echarts.graphic.LinearGradient(0, 0, 1, 0, [
                {
                  offset: 0,
                  color: "#5052EE",
                },
                {
                  offset: 1,
                  color: "#AB6EE5",
                },
              ]),
            },
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
        this.updatePage();
      });
    },
    async initData(data) {
      // 请求数据
      // const res = await this.axios.get("seller");
      // this.data = res.data;
      this.data = data;
      // 数据排序，从小到大
      this.data.sort((a, b) => {
        return b.value - a.value;
      });
      // 计算总页数
      this.totalPage = Math.ceil(this.data.length / 5);
      this.updateEcharts();
      this.updatePage();
    },
    updateEcharts() {
      const start = (this.currentPage - 1) * 5;
      const end = this.currentPage * 5;
      // 获取当前页面的五条数据
      const sliceData = this.data.slice(start, end);
      const ydata = sliceData.map((e) => e.name); //y数据
      const xdata = sliceData.map((e) => e.value); //x数据
      const dataOption = {
        yAxis: {
          data: ydata,
        },
        series: [
          {
            data: xdata,
          },
        ],
      };
      this.mychart.setOption(dataOption);
    },
    updatePage() {
      // 如果有定时器则清除
      if (this.timeId) {
        clearInterval(this.timeId);
      }
      // 定时器每次给当前页+1，超出总页数时置为1
      this.timeId = setInterval(() => {
        this.currentPage++;
        if (this.currentPage > this.totalPage) {
          this.currentPage = 1;
        }
        this.updateEcharts();
      }, 3000);
    },
    screenAdapter() {
      if (this.$refs.seller) {
        // 根据窗口计算大小
        const fontSize = (this.$refs.seller.offsetWidth / 100) * 3.6;
        const adapterOption = {
          title: {
            textStyle: {
              fontSize: fontSize, // 标题字体大小
            },
          },
          tooltip: {
            axisPointer: {
              lineStyle: {
                width: fontSize, // 鼠标移入显示的背景线的宽度
              },
            },
          },
          series: [
            {
              barWidth: fontSize, // bar宽度
              itemStyle: {
                borderRadius: [0, fontSize / 2, fontSize / 2, 0], //bar圆角，上右下左
              },
            },
          ],
        };
        this.mychart.setOption(adapterOption);
        this.mychart.resize();
      }
    },
  },
};
</script>
