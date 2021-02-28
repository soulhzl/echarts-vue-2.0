<template>
  <div class="screen-container" :style="containerStyle">
    <header class="screen-header" :style="headerStyle">
      <div>
        <img :src="headerSrc" />
      </div>
      <span class="title" :style="titleStyle">电商平台实时监控系统</span>
      <div class="title-right" :style="titleRightStyle">
        <img
          :src="qiehuanSrc"
          class="qiehuan"
          @click="handleChangeTheme"
          :style="titleRightImgStyle"
        />
        <span class="datetime" :style="titleRightTimeStyle"
          >2049-01-01 00:00:00</span
        >
      </div>
    </header>
    <div class="screen-body">
      <section class="screen-left">
        <div
          id="left-top"
          :class="[fullScreenStatus.trend ? 'fullscreen' : '']"
        >
          <trend ref="trend"></trend>
          <div class="resize">
            <span class="iconfont" @click="changeSize('trend')">{{
              fullScreenStatus.trend ? "&#xe68a;" : "&#xe614;"
            }}</span>
          </div>
        </div>
        <div
          id="left-bottom"
          :class="[fullScreenStatus.seller ? 'fullscreen' : '']"
        >
          <seller ref="seller"></seller>
          <div class="resize">
            <span class="iconfont" @click="changeSize('seller')">{{
              fullScreenStatus.seller ? "&#xe68a;" : "&#xe614;"
            }}</span>
          </div>
        </div>
      </section>
      <section class="screen-middle">
        <div
          id="middle-top"
          :class="[fullScreenStatus.chinamap ? 'fullscreen' : '']"
        >
          <chinamap ref="chinamap"></chinamap>
          <div class="resize">
            <span class="iconfont" @click="changeSize('chinamap')">{{
              fullScreenStatus.chinamap ? "&#xe68a;" : "&#xe614;"
            }}</span>
          </div>
        </div>
        <div
          id="middle-bottom"
          :class="[fullScreenStatus.rank ? 'fullscreen' : '']"
        >
          <rank ref="rank"></rank>
          <div class="resize">
            <span class="iconfont" @click="changeSize('rank')">{{
              fullScreenStatus.rank ? "&#xe68a;" : "&#xe614;"
            }}</span>
          </div>
        </div>
      </section>
      <section class="screen-right">
        <div id="right-top" :class="[fullScreenStatus.hot ? 'fullscreen' : '']">
          <hot ref="hot"></hot>
          <div class="resize">
            <span class="iconfont" @click="changeSize('hot')">{{
              fullScreenStatus.hot ? "&#xe68a;" : "&#xe614;"
            }}</span>
          </div>
        </div>
        <div
          id="right-bottom"
          :class="[fullScreenStatus.stock ? 'fullscreen' : '']"
        >
          <stock ref="stock"></stock>
          <div class="resize">
            <span class="iconfont" @click="changeSize('stock')">{{
              fullScreenStatus.stock ? "&#xe68a;" : "&#xe614;"
            }}</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import Chinamap from "../components/Chinamap.vue";
import Hot from "../components/Hot.vue";
import Rank from "../components/Rank.vue";
import Seller from "../components/Seller.vue";
import Stock from "../components/Stock.vue";
import Trend from "../components/Trend.vue";
import { mapState } from "vuex";
import { getThemeValue } from "@/utils/theme_utils.js";
export default {
  name: "ScreenPage",
  components: {
    Chinamap,
    Hot,
    Rank,
    Seller,
    Stock,
    Trend,
  },
  created() {
    this.ws.registerCallback("fullScreen", this.recvData);
    this.ws.registerCallback("themeChange", this.recvChangeTheme);
  },
  mounted() {
    window.addEventListener("resize", this.screenAdapter);
    this.screenAdapter();
  },
  destroyed() {
    window.removeEventListener("resize", this.screenAdapter);
    this.ws.unregisterCallback("fullScreen");
    this.ws.unregisterCallback("themeChange");
  },
  computed: {
    ...mapState(["theme"]),
    headerSrc() {
      return `/echarts/img/${getThemeValue(this.theme).headerBorderSrc}`;
    },
    qiehuanSrc() {
      return `/echarts/img/${getThemeValue(this.theme).themeSrc}`;
    },
    containerStyle() {
      return {
        backgroundColor: getThemeValue(this.theme).backgroundColor,
        color: getThemeValue(this.theme).titleColor,
      };
    },
    headerStyle() {
      const height =
        parseInt((this.size / 100) * 8) > 64
          ? 64
          : parseInt((this.size / 100) * 8);
      return {
        height: height + "px",
      };
    },
    titleStyle() {
      return {
        fontSize: parseInt((this.size / 100) * 2) + "px",
        top: parseInt((this.size / 100) * 3) + "%",
      };
    },
    titleRightStyle() {
      return {
        top: parseInt((this.size / 100) * 3) + "%",
      };
    },
    titleRightImgStyle() {
      return {
        width: parseInt((this.size / 100) * 2.5) + "px",
        height: parseInt((this.size / 100) * 2) + "px",
      };
    },
    titleRightTimeStyle() {
      return {
        fontSize: parseInt((this.size / 100) * 1.5) + "px",
      };
    },
  },
  data() {
    return {
      // 定义每一个图表的全屏状态
      fullScreenStatus: {
        trend: false,
        seller: false,
        chinamap: false,
        rank: false,
        hot: false,
        stock: false,
      },
      size: 0,
    };
  },
  methods: {
    changeSize(chartName) {
      const targetValue = !this.fullScreenStatus[chartName];
      this.ws.send({
        action: "fullScreen",
        socketType: "fullScreen",
        chartName: chartName,
        value: targetValue,
      });
    },
    recvData(data) {
      const chartName = data.chartName;
      const targetValue = data.value;
      this.fullScreenStatus[chartName] = targetValue;
      this.$nextTick(() => {
        this.$refs[chartName].screenAdapter();
      });
    },
    handleChangeTheme() {
      this.ws.send({
        action: "themeChange",
        socketType: "themeChange",
        chartName: "",
        value: "",
      });
    },
    recvChangeTheme() {
      this.$store.commit("changeTheme");
    },
    screenAdapter() {
      this.size = window.innerWidth;
    },
  },
};
</script>

<style lang="less" scoped>
// 全屏样式的定义
.fullscreen {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  z-index: 100;
}
.screen-container {
  width: 100%;
  height: 100%;
  padding: 0 20px;
  background-color: #161522;
  color: #fff;
  box-sizing: border-box;
}
.screen-header {
  width: 100%;
  height: 64px;
  font-size: 20px;
  position: relative;
  > div {
    img {
      width: 100%;
    }
  }
  .title {
    position: absolute;
    left: 50%;
    top: 50%;
    font-size: 20px;
    transform: translate(-50%, -50%);
  }
  .title-right {
    display: flex;
    align-items: center;
    position: absolute;
    right: 0px;
    top: 50%;
    transform: translateY(-80%);
  }
  .qiehuan {
    width: 28px;
    height: 21px;
    cursor: pointer;
  }
  .datetime {
    font-size: 15px;
    margin-left: 10px;
  }
}
.screen-body {
  width: 100%;
  height: 100%;
  display: flex;
  margin-top: 10px;
  .screen-left {
    height: 100%;
    width: 27.6%;
    #left-top {
      height: 53%;
      position: relative;
    }
    #left-bottom {
      height: 31%;
      margin-top: 25px;
      position: relative;
    }
  }
  .screen-middle {
    height: 100%;
    width: 41.5%;
    margin-left: 1.6%;
    margin-right: 1.6%;
    #middle-top {
      width: 100%;
      height: 56%;
      position: relative;
    }
    #middle-bottom {
      margin-top: 25px;
      width: 100%;
      height: 28%;
      position: relative;
    }
  }
  .screen-right {
    height: 100%;
    width: 27.6%;
    #right-top {
      height: 46%;
      position: relative;
    }
    #right-bottom {
      height: 38%;
      margin-top: 25px;
      position: relative;
    }
  }
}
.resize {
  position: absolute;
  right: 20px;
  top: 20px;
  cursor: pointer;
}
@media screen and (max-device-width: 480px) {
  .screen-header {
    display: none;
  }
  .screen-body {
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-top: 0;
    overflow-y: scroll;
    .screen-left {
      width: 100%;
      #left-top {
        height: 250px;
        margin-top: 25px;
        position: relative;
      }
      #left-bottom {
        height: 200px;
        margin-top: 25px;
        position: relative;
      }
    }
    .screen-middle {
      width: 100%;
      #middle-top {
        height: 300px;
        margin-top: 25px;
        position: relative;
      }
      #middle-bottom {
        margin-top: 25px;
        height: 200px;
        position: relative;
      }
    }
    .screen-right {
      width: 100%;
      #right-top {
        margin-top: 25px;
        height: 250px;
        position: relative;
      }
      #right-bottom {
        height: 230px;
        margin-top: 25px;
        position: relative;
      }
    }
  }
}
</style>
