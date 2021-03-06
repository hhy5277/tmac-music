<template>
  <transition name="list-fade">
    <div class="playlist" ref="playList" :class="theme" v-show="showFlag" @click="hide">
      <div class="list-wrapper" :class="theme" @click.stop>
        <div class="list-header">
          <h1 class="title">
            <i class="icon" :class="iconMode" @click="changeMode"></i>
            <span class="text">{{modeText}}</span>
            <span class="clear" @click="showConfirm">
              <i class="icon-clear"></i>
            </span>
          </h1>
        </div>
        <scroll 
          class="list-content" 
          :data="sequenceList"
          ref="listContent"
          :refreshDelay="refreshDelay"
        >
          <transition-group tag="ul" name="list">
            <li
              class="item"
              v-for="(item, index) in sequenceList"
              :key="item.id"
              @click="selectiItem(item, index)"
              ref="listItem"
            >
              <i class="current" :class="getCurrentIcon(item)"></i>
              <span class="text"> {{item.name}} </span>
              <span @click.stop="toggleFavorite(item)" class="like">
                <i :class="getFavoriteIcon(item)"></i>
              </span>
              <span class="delete" @click.stop="deteleOne(item)">
                <i class="icon-delete"></i>
              </span>
            </li>
          </transition-group>
        </scroll>
        <div class="list-operate">
          <div class="add border ignore" @click="addSong">
            <i class="icon-add"></i>
            <span class="text">添加歌曲到队列</span>
          </div>
        </div>
        <div class="list-close" :class="theme" @click="hide()">
          <span>关闭</span>
        </div>
      </div>
      <confirm
        text="是否清空播放列表" 
        @confirm="confirmClear" 
        ref="confirm" 
        confirmBtnText="清空"
      >
      </confirm>
      <add-song ref="addSong"></add-song>
    </div>
  </transition>
</template>
<script>
  import { mapActions } from 'vuex'
  import Scroll from 'base/scroll'
  import { playMode } from 'common/js/config'
  import Confirm from 'base/confirm/confirm'
  import { playerMixin } from 'common/js/mixin'
  import AddSong from 'components/addSong/addSong'
  export default {
    mixins: [playerMixin],
    data() {
      return {
        showFlag: false,
        refreshDelay: 120
      }
    },
    components: {
      Scroll,
      Confirm,
      AddSong
    },
    computed: {
      modeText() {
        return this.mode === playMode.sequence ? '顺序播放' : this.mode === playMode.random ? '随机播放' : '单曲循环'
      }
    },
    mounted() {
      this.$refs.playList.style.zIndex = 200
    },
    methods: {
      ...mapActions([
        'deleteSong',
        'deleteSongList'
      ]),
      deteleOne(item) {
        this.deleteSong(item)
        if (!this.playList.length) this.hide()
      },
      show() {
        this.showFlag = true
        setTimeout(() => {
          this.$refs.listContent.refresh()
          this.scrollToCurrent(this.currentSong)
        }, 50)
      },
      hide() {
        this.showFlag = false
      },
      getCurrentIcon(item) {
        if (this.currentSong.id === item.id) return 'icon-play'
        return ''
      },
      selectiItem(item, index) {
        if (this.mode === playMode.random) {
          index = this.playList.findIndex((song) => {
            return song.id === item.id
          })
        }
        this.setCurrentIndex(index)
        this.setPlayingState(true)
      },

      showConfirm() {
        this.$refs.confirm.show()
      },
      confirmClear() {
        this.deleteSongList()
        this.hide()
      },
      // 打开播放列表滚动到当前播放歌曲的位置
      scrollToCurrent(current) {
        const index = this.sequenceList.findIndex((song) => {
          return current.id === song.id
        })
        this.$refs.listContent.scrollToElement(this.$refs.listItem[index], 300)
      },

      addSong() {
        this.$refs.addSong.show()
      }
    },
    // 歌曲切换成功,执行ScrollToCurrent
    watch: {
      currentSong(newSong, oldSong) {
        if (!this.showFlag || newSong.id === oldSong.id) {
          return
        }
        setTimeout(() => {
          this.scrollToCurrent(newSong)
        }, 20)
      }
    }
  }
</script>
<style scoped lang="stylus">
  .playlist
    position: fixed
    left: 0
    right: 0
    top: 0
    bottom: 0
    extend-styles(background-color, $color-background-d)
    &.list-fade-enter-active, &.list-fade-leave-active
      transition: opacity .2s
      .list-wrapper
        transition: all .2s
    &.list-fade-enter, &.list-fade-leave-to
      opacity: 0
      .list-wrapper
        transform: translate3d(0, 100%, 0)
    &.list-fade-enter
    .list-wrapper
      position: absolute
      left: 0
      bottom: 0
      width: 100%
      extend-styles(background, $color-highlight-background-op1)
      .list-header
        position: relative
        padding: 20px 30px 10px 20px
        .title
          display: flex
          align-items: center
          .icon
            margin-right: 10px
            font-size: 30px
            color: $color-theme-d
          .text
            flex: 1
            font-size: $font-size-medium
            color: $color-text-l
          .clear
            extend-click()
            .icon-clear
              font-size: $font-size-medium
              color: $color-text-d
      .list-content
        max-height: calc(240/667 * 100vh)
        overflow: hidden
        .item
          display: flex
          align-items: center
          height: 40px
          padding: 0 30px 0 20px
          overflow: hidden
          &.list-enter-active, &.list-leave-active
            transition: all 0.1s
          &.list-enter, &.list-leave-to
            height: 0
          .current
            flex: 0 0 20px
            width: 20px
            font-size: $font-size-small
            color: $color-theme-d
          .text
            flex: 1
            no-wrap()
            font-size: $font-size-medium
            color: $color-text-d
          .like
            extend-click()
            margin-right: 15px
            font-size: $font-size-small
            color: $color-theme
            .icon-favorite
              color: $color-sub-theme
          .delete
            extend-click()
            font-size: $font-size-small
            color: $color-theme
      .list-operate
        width: 140px
        margin: 20px auto 30px auto
        .add
          position: relative
          z-index: 1
          display: flex
          align-items: center
          padding: 8px 16px
          color: $color-text-l
          &.ignore.border::before
            border-color: $color-text-l
            border-radius: 100px
          .icon-add
            margin-right: 5px
            font-size: $font-size-small-s
          .text
            font-size: $font-size-small
      .list-close
        text-align: center
        line-height: 50px
        extend-styles(background, $color-background)
        font-size: $font-size-medium-x
        color: $color-text-l
</style>