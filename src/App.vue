<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style lang="less">
html, body, #app{
  overflow: hidden;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

canvas{
  border-radius: 20px;
}

.com-echart {
  width: 100%;
  height: 100%;
}
</style>
