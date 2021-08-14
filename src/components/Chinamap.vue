<template>
  <div class="com-echart" @dblclick="backChina">
    <div class="com-echart" ref="map"></div>
  </div>
</template>

<script>
import axios from "axios";
import { getProvinceMapInfo } from "@/utils/map_utils";
import { mapState } from "vuex";
export default {
  name: "Chinamap",
  data() {
    return {
      data: null, //数据
      mychart: null, //echarts实例
      mapData: {}, //缓存省份数据
    };
  },
  created() {
    this.ws.registerCallback("mapData", this.initData);
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
    }
  },
  mounted() {
    this.initEcharts();
    // this.initData();
    this.ws.send({
      action: "getData",
      socketType: "mapData",
      chartName: "map",
      value: "",
    });
    window.addEventListener("resize", this.screenAdapter);
    this.screenAdapter();
  },
  destroyed() {
    window.removeEventListener("resize", this.screenAdapter);
    this.ws.unregisterCallback("mapData");
  },
  methods: {
    async initEcharts() {
      // 初始化echarts实例
      this.mychart = this.echarts.init(this.$refs.map, this.theme);
      // 获取地图数据
      // const res = await axios.get("/echarts/map/china.json");
      const res = await axios.get("/map/china.json");
      // 注册地图
      this.echarts.registerMap("china", res.data);
      const initOption = {
        title: {
          text: "▎商家分布", //标题
          left: 20, //字体离左边px
          top: 20, //字体离上边px
        },
        geo: {
          type: "map",
          map: "china", // 已经注册的地图名称
          top: "5%",
          bottom: "5%",
          itemStyle: {
            areaColor: "#2E72BF", // 地图背景颜色
            borderColor: "#333", // 边线颜色
          },
        },
        legend: {
          left: "5%", // legend距离左边
          bottom: "5%", // legend距离下方
          orient: "vertical", // legend排列方式
        },
      };
      this.mychart.setOption(initOption);
      this.mychart.on("click", async (e) => {
        // 解析省份数据
        const provinceInfo = getProvinceMapInfo(e.name);
        // 获取省份数据
        if (provinceInfo.key) {
          // 有省份数据则缓存，无责跳过
          if (!this.mapData[provinceInfo.key]) {
            const res = await axios.get('/echarts/' + provinceInfo.path);
            // 注册省份地图
            this.mapData[provinceInfo.key] = res.data;
            this.echarts.registerMap(provinceInfo.key, res.data);
          }
          const provinceOption = {
            geo: {
              map: provinceInfo.key,
            },
          };
          this.mychart.setOption(provinceOption);
        }
      });
    },
    async initData(data) {
      // const res = await this.axios.get("map");
      // this.data = res.data;
      this.data = data;
      this.updateEcharts();
    },
    updateEcharts() {
      // legend数据
      const legendData = this.data.map((e) => e.name);
      // 在地图上使用散点图
      const seriesData = this.data.map((e) => {
        return {
          type: "effectScatter", //散点图
          rippleEffect: {
            scale: 5, // 点大小
            brushType: "stroke", // 点显示样式
          }, //联谊效果
          name: e.name,
          data: e.children,
          coordinateSystem: "geo", // 对应地图上坐标
        };
      });
      const dataOption = {
        legend: {
          data: legendData,
        },
        series: seriesData,
      };
      this.mychart.setOption(dataOption);
    },
    screenAdapter() {
      const fontSize = (this.$refs.map.offsetWidth / 100) * 3.6;
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: fontSize, // 标题字体大小
          },
        },
        legend: {
          itemWidth: fontSize, // legend宽
          itemHeight: fontSize, // legend高
          itemGap: fontSize, // legend距离
          textStyle: {
            fontSize: fontSize / 1.8, // legend字体大小
          },
        },
      };
      this.mychart.setOption(adapterOption);
      this.mychart.resize();
    },
    backChina() {
      const mapOption = {
        geo: {
          map: "china",
        },
      };
      this.mychart.setOption(mapOption);
    },
  },
};
</script>
