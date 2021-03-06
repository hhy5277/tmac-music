<template>
  <div class="search">
    <div class="search-box-wrapper">
      <!--searchBox query变化时派发query事件 search component监听该事件获取query值-->
      <!--search component将该值传递给suggest component-->
      <!--suggest component 监听到query值的变化调用search函数-->
      <search-box ref="searchBox" :newQuery="newQuery" @query="onQueryChange"></search-box>
    </div>
    <div class="shortcut-wrapper" v-show="!query" ref="shortcutWrapper">
      <scroll 
        class="shortcut"
        :data="shortCut"
        ref="shortcut"
        :refreshDelay="refreshDelay"
      >
        <div ref="scrollWrapper">
          <div class="hot-key">
            <h1 class="title">热门搜索</h1>
            <ul>
              <li class="item" 
                :class="theme"
                v-for="item in hotkey" 
                :key="item.key"
                @click="addQuery(item.k)"
              >
                <span>{{item.k}}</span>
              </li>
            </ul>
          </div>
          <!--搜索历史部分-->
          <div class="search-history" v-show="searchHistory.length">
          <h1 class="title">
            <span class="text">搜索历史</span>
            <span @click="showConfirm" class="clear">
              <i class="icon-clear"></i>
            </span>
          </h1>
          <!--搜索历史列表-->
          <search-list
            @delete="deleteSearchHistory" 
            @select="addQuery" 
            :searches="searchHistory"
          >
          </search-list>
          </div>
        </div>
      </scroll>
    </div>
    <div class="search-result" v-show="query" ref="searchResult">
      <!--搜索结果component-->
      <suggest 
        :query="query" 
        @listScroll="blurInput"
        @select="select"
        :selectFirst="selectFirst" 
        ref="suggest"
      >
      </suggest>
    </div>
    <router-view></router-view>
    <confirm
      ref="confirm"
      @confirm="clearSearchHistory"
      text="是否清空所有搜索历史"
      confirmBtnText="清空"
    >
    </confirm>
  </div>
</template>
<script>
  import SearchBox from 'base/searchBox/searchBox'
  import SearchList from 'base/searchList/searchList'
  import Scroll from 'base/scroll'
  import Confirm from 'base/confirm/confirm'
  import { ERR_OK } from 'api/config'
  import { getHotKey } from 'api/search'
  import Suggest from 'components/suggest/suggest'
  import { mapActions } from 'vuex'
  import { playListMixin, searchMixin } from 'common/js/mixin'
  export default {
    mixins: [playListMixin, searchMixin],
    components: {
      SearchBox,
      Suggest,
      SearchList,
      Confirm,
      Scroll
    },
    data() {
      return {
        hotkey: [],
        refreshDelay: 100,
        newQuery: '',
        selectFirst: false
      }
    },
    computed: {
      shortCut() {
        return this.hotkey.concat(this.searchHistory)
      }
    },
    watch: {
      query(newQuery) {
        if (!newQuery) {
          setTimeout(() => {
            this.handlePlayList(this.playList)
          }, this.refreshDelay)
        }
      }
    },
    created() {
      this._getHotKey()
    },
    mounted() {
      const { key } = this.$route.query

      setTimeout(() => {
        this.query = key
        this.newQuery = key
        this.selectFirst = true
      }, 1000)
    },
    methods: {
      ...mapActions([
        'clearSearchHistory'
      ]),
      // mini底部自适应
      handlePlayList(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''

        this.$refs.searchResult.style.bottom = bottom
        this.$refs.suggest.refresh()

        this.$refs.shortcutWrapper.style.bottom = bottom
        this.$refs.shortcut.refresh()
      },
      showConfirm() {
        this.$refs.confirm.show()
      },
      // 截取前10个作为热门搜索key
      _getHotKey() {
        getHotKey().then(res => {
          if (res.code === ERR_OK) {
            this.hotkey = res.data.hotkey.slice(0, 10)
          }
        })
      },
      select() {
        this.$nextTick(() => {
          this.saveSearch()
          this.clearScrollStyle()
        })
      },
      clearScrollStyle() {
        this.$refs.suggest.clearScrollStyle()
        const style = this.$refs.scrollWrapper.style
        style.transform = style.transform.replace('translateZ(0px)', '')
      }
    }
  }
</script>
<style lang="stylus" rel="stylesheet/stylus">
  .search
    .search-box-wrapper
      margin: 20px
    .shortcut-wrapper
      position: absolute
      top: 178px
      bottom: 0
      width: 100%
      .shortcut
        height: 100%
        overflow: hidden
        .hot-key
          margin: 0 20px 20px 20px
          .title
            margin-bottom: 20px
            font-size: $font-size-medium
            color: $color-text-l
          .item
            display: inline-block
            padding: 5px 10px
            margin: 0 20px 10px 0
            border-radius: 6px
            extend-styles(background, $color-highlight-background)
            font-size: $font-size-medium
            color: $color-text-d
        .search-history
          position: relative
          margin: 0 20px
          .title
            display: flex
            align-items: center
            height: 40px
            font-size: $font-size-medium
            color: $color-text-l
            .text
              flex: 1
            .clear
              extend-click()
              .icon-clear
                font-size: $font-size-medium
                color: $color-text-d
    .search-result
      position: absolute
      width: 100%
      top: 178px
      bottom: 0
</style>