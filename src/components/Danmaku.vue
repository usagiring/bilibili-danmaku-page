<template>
  <div :style="{
      position: 'absolute',
      top: '0px',
      bottom: '0px',
      left: '0px',
      right: '0px',
      background: background,
    }">
    <div :style="{
      position: 'absolute',
      top: '4px',
      bottom: '4px',
      left: '4px',
      right: '4px',
      '-webkit-user-select': 'none',
      opacity: opacity,
    }">
      <!-- @mouseenter="isSingleWindow ? setUnIgnoreMouseEvent() : undefined" @mouseleave="isSingleWindow ? setIgnoreMouseEvent() : undefined" -->
      <div v-if="isShowHeadline" @wheel.prevent="giftScroll" :style="{
        position: 'absolute',
        top: '0px',
        width: '100%',
        height: `${headlines.length ? '36px' : '0px'}`,
      }">
        <div class="gift-show-content-wrapper" id="gift-show-content-wrapper">
          <transition-group name="fade">
            <template v-for="gift of headlines">
              <!-- eslint-disable-next-line -->
              <div :key="gift._id" @mouseenter="hoverGift(gift._id)" @mouseleave="unhoverGift(gift._id)" class="gift-show-wrapper">
                <!-- <transition name="fade"> -->
                <div :key="`${gift._id}_normal`" v-if="!giftHover.includes(gift._id)" class="gift-show-content" :style="{ background: gift.priceProperties.backgroundColor }">
                  <div :style="{
                    'z-index': -1,
                    position: 'absolute',
                    width: `${widthCalculator(gift)}%`,
                    height: '100%',
                    background: gift.priceProperties.backgroundBottomColor,
                  }"></div>
                  <div :style="{
                    margin: '0 10px',
                    'font-weight': 'bold',
                    'z-index': 3,
                    '-webkit-text-stroke-width': '0.3px',
                    '-webkit-text-stroke-color': 'gray',
                  }">
                    <Avatar :src="gift.avatar || DEFAULT_AVATAR" size="small" />
                    <template v-if="gift.type === 2">
                      <span>
                        {{
                        gift.count === 1
                          ? `${gift.name}`
                          : `${gift.name}×${gift.count}`
                      }}
                      </span>
                    </template>
                    <template v-else-if="gift.totalPrice">
                      <span>{{ `￥${Number.isSafeInteger(gift.totalPrice) ? Number(gift.totalPrice).toFixed(0) : Number(gift.totalPrice).toFixed(1)}` }}</span>
                    </template>
                  </div>
                </div>
                <div :key="`${gift._id}_extend`" v-else class="gift-show-content-extend" :style="{
                  border: `1px solid ${gift.priceProperties.backgroundBottomColor}`,
                }">
                  <div class="gift-show-content-header" :style="{ background: gift.priceProperties.backgroundColor }">
                    <Avatar class="gift-show-content-extend-avatar" :src="gift.avatar || DEFAULT_AVATAR" />
                    <div :style="{ display: 'inline-block' }">
                      <p>{{ gift.uname }}</p>
                      <template v-if="gift.type === 2">
                        <p>
                          {{
                          gift.count === 1
                            ? `${gift.name}`
                            : `${gift.name}×${gift.count}`
                        }}
                        </p>
                      </template>
                      <template v-else-if="gift.totalPrice">
                        <p>{{ `￥${Number.isSafeInteger(gift.totalPrice) ? Number(gift.totalPrice).toFixed(0) : Number(gift.totalPrice).toFixed(1)}` }}</p>
                      </template>
                    </div>
                  </div>
                  <div class="gift-show-content-extend-content" :style="{
                    background: gift.priceProperties.backgroundBottomColor,
                  }">
                    <template v-if="gift.type === 3">
                      {{ gift.content }}
                      <template v-if="gift.contentJPN && isShowSuperChatJPN">
                        <div class="divider"></div>
                        {{ gift.contentJPN }}
                      </template>
                    </template>
                    <template v-else>
                      {{
                      `${gift.uname} 赠送了 ${gift.count} 个 ${gift.name}`
                    }}
                    </template>
                  </div>
                </div>
                <!-- </transition> -->
              </div>
            </template>
          </transition-group>
        </div>
      </div>
      <div class="message-content-wrapper" :style="{ top: `${headlines.length && isShowHeadline ? '36px' : '0px'}` }">
        <div :style="{
          position: 'absolute',
          height: '100%',
          width: '80%',
          '-webkit-app-region': 'drag',
        }"></div>
        <div :style="{
          position: 'absolute',
          height: '100%',
          width: '20%',
          right: '0',
        }"></div>
        <transition-group name="fade" tag="div" class="message-content">
          <p :key="message._id" v-for="message in messages">
            <template v-if="message.category === 'comment'">
              <span :class="!isBorderAdaptContent? 'max-width': ''" class="border-image-default" :style="{ ...borderImageStyle, ...getMessageStyleByRole(message)}">
                <template v-for="(setting, index) of messageSettings">
                  <Avatar class="margin-lr-1px" :key="index" v-if="setting.type==='avatar' && setting.isShow" :src="message.avatar" :style="avatarSizeStyle" />
                  <img class="guard-icon margin-lr-1px" :key="index" v-if="setting.type==='guard' && setting.isShow && message.role" :src="`${getGuardIcon(message.role)}`" />
                  <FanMedal class="margin-lr-1px" :key="index" v-if="setting.type==='medal' && setting.isShow && message.medalLevel && message.medalName" :medalLevel="message.medalLevel" :medalName="message.medalName" :medalColorStart="message.medalColorStart" :medalColorEnd="message.medalColorEnd" :medalColorBorder="message.medalColorBorder"></FanMedal>
                  <span :key="index" v-if="setting.type==='name'" class="is-vertical-align margin-lr-1px" :style="{...fontStyle, ...getNameStyleByRole(message)}">{{ message.uname }}</span>
                  <span :key="index" v-if="setting.type==='colon' && setting.isShow" class="is-vertical-align" :style="{...fontStyle, ...getNameStyleByRole(message)}">：</span>
                  <span :key="index" v-if="setting.type==='comment'">
                    <img v-if="message.emojiUrl" :style="{ 'vertical-align': 'middle', height: '24px' }" :src="message.emojiUrl" />
                    <span v-else class="is-vertical-align" :style="{...fontStyle, ...getCommentStyleByRole(message)}">{{ message.content }}</span>
                    <span v-if="message.voiceUrl" @click="playAudio(message.voiceUrl)" class="voice-container">
                      <Icon type="md-play" />
                      <span>{{ `${comment.fileDuration}"` }}</span>
                    </span>
                  </span>
                </template>
                <!-- v-bind="message" -->
                <SimilarCommentBadge class="is-vertical-align" :style="{ 'margin-left': '5px' }" v-if="message.similar > 0" v-bind:number="message.similar" />
              </span>
            </template>
            <template v-if="message.category === 'interactWord'">
              <!-- 入场消息设置默认使用普通设置 -->
              <p :style="getCommentStyleByRole({ role: 0 })">
                <FanMedal v-if="isShowFanMedal && message.medalLevel && message.medalName" :medalLevel="message.medalLevel" :medalName="message.medalName" :medalColorStart="message.medalColorStart" :medalColorEnd="message.medalColorEnd" :medalColorBorder="message.medalColorBorder"></FanMedal>
                <span :style="{ color: message.unameColor ? message.unameColor : undefined }">{{ message.uname }}</span>
                {{ `${parseMsgType(message.type)}了直播间` }}
              </p>
            </template>
            <template v-if="message.category === 'superChat'">
              <GiftCard v-if="!isUseMiniGiftCard" v-bind="message">
                <div :style="{ padding: '10px' }">
                  {{ message.content }}
                  <template v-if="message.contentJPN && isShowSuperChatJPN">
                    <div class="divider"></div>
                    {{ message.contentJPN }}
                  </template>
                </div>
              </GiftCard>
              <GiftCardMini v-else v-bind="message">{{
              `: ${message.content}`
            }}</GiftCardMini>
            </template>
            <template v-if="message.category === 'gift'">
              <GiftCard v-if="!isUseMiniGiftCard" v-bind="message">
                <span :style="{
                display: 'inline-block',
                padding: '10px 0px 10px 10px',
              }">{{
              `${message.uname} 赠送了 ${message.count} 个 ${message.name}`
            }}</span>
                <img :style="{ 'vertical-align': 'middle', width: '35px' }" :src="giftGifMap[message.id] && giftGifMap[message.id].webp">
              </GiftCard>
              <GiftCardMini v-else v-bind="message">{{
              `: 赠送了 ${message.count}个 ${message.name}`
            }}
              </GiftCardMini>
            </template>
          </p>
        </transition-group>
      </div>
    </div>
  </div>

</template>

<script>
import {
  DEFAULT_AVATAR,
  INTERACT_TYPE,
  GUARD_ICON_MAP,
  MAX_MESSAGE
} from "../service/const";
import { getPriceProperties } from "../service/util";
import SimilarCommentBadge from "./SimilarCommentBadge";
import GiftCard from "./GiftCard";
import GiftCardMini from "./GiftCardMini";
import FanMedal from "./FanMedal";
import { init as initAPI, getSetting, getGiftConfig, getExampleMessages } from '../service/api'

let ws
let retryWaitTime = 0

export default {
  components: {
    SimilarCommentBadge,
    GiftCard,
    GiftCardMini,
    FanMedal,
  },
  props: ["isPreview", "isSingleWindow"],
  data() {
    return {
      giftHover: [],
      DEFAULT_AVATAR,
      giftGifMap: {},
      headlines: [],
      PORT: 3000,
      showGiftCardThreshold: 0,
      combineSimilarTime: 3000,
      showHeadlineThreshold: 0, // 顶部礼物条
      isShowFanMedal: true,
      isUseMiniGiftCard: false,
      danmakuFont: 'auto',
      avatarSize: 12,
      isExample: false,
      background: 'rgba(0,0,0,0)',
      opacity: 1,
      messages: [],
      isShowInteractInfo: false,
      isShowSilverGift: false,
      isShowHeadline: true,
      fontWeight: 'normal',
      hiddenExpiredTime: 0,
      messageSettings: [],
      borderImages: [],
      isShowType1: true,
      isShowType2: true,
      isShowSuperChatJPN: true,

      message_lv0: {},
      name_lv0: {},
      comment_lv0: {},

      message_lv3: {},
      name_lv3: {},
      comment_lv3: {},

      message_lv2: {},
      name_lv2: {},
      comment_lv2: {},

      message_lv1: {},
      name_lv1: {},
      comment_lv1: {},
    };
  },
  computed: {
    avatarSizeStyle() {
      return {
        width: `${this.avatarSize}px`,
        height: `${this.avatarSize}px`,
        "line-height": `${this.avatarSize}px`,
      };
    },
    borderImageStyle() {
      const image = this.borderImages.find(image => image.isSelected)
      if (!image) return {}
      return {
        'border-width': `${image['border-width']}px`,
        'border-image-width': image['border-image-width'],
        'border-image-repeat': image['border-image-repeat'],
        'border-image-slice': image['border-image-slice'],
        'border-image-outset': image['border-image-outset'],
        'border-image-source': `url(${image.dataUrl})`
      }
    },
    isBorderAdaptContent() {
      const image = this.borderImages.find(image => image.isSelected)
      if (!image) return false
      return image.isAdaptContent
    },
    fontStyle() {
      return {
        'font-family': this.danmakuFont,
        'font-weight': this.fontWeight,
      }
    }
  },
  beforeCreate() {
    document
      .getElementsByTagName("body")[0]
      .setAttribute("style", "background-color:rgba(0,0,0,0);");
  },
  async mounted() {
    const params = new URLSearchParams(window.location.search)
    this.isExample = params.get('example') || false
    this.port = params.get('port') || 8081

    initAPI({ port: this.port })
    const { data: giftMap } = await getGiftConfig()
    this.giftGifMap = giftMap
    this.getSetting()

    this.ws()

    setInterval(() => {
      this.headlines = this.headlines
        .map(headline => {
          headline.existsTime = (headline.existsTime || 0) + 1000
          return headline
        })
        .filter(headline => {
          return headline.sendAt + headline.priceProperties.time > Date.now()
        })
    }, 1000)

    setInterval(() => {
      if (!this.hiddenExpiredTime) return
      this.messages = this.messages
        .filter(message => {
          return message.sendAt + this.hiddenExpiredTime > Date.now()
        })
    }, 2000)

    if (this.isExample) {
      this.initExampleMessage()
    }
  },
  methods: {
    ws() {
      const WS_URL = `ws://127.0.0.1:${this.port}`
      if (ws && ws.readyState === WebSocket.OPEN) {
        console.log('connected..., nothing todo.')
        return
      }
      if (ws && ws.readyState === WebSocket.CONNECTING) {
        console.log('connecting..., nothing todo.')
        return
      }

      ws = new WebSocket(WS_URL)
      ws.onopen = () => {
        console.log('onopen, connected...')
        retryWaitTime = 0
      }

      ws.onmessage = (msg) => {
        const payload = JSON.parse(msg.data)
        if (payload.cmd === 'SETTING') {
          this.onSetting(payload.payload)
        }
        if (payload.cmd === (this.isExample ? 'EXAMPLE_COMMENT' : 'COMMENT')) {
          this.onComment(payload.payload)
        }
        if (payload.cmd === (this.isExample ? 'EXAMPLE_GIFT' : 'GIFT')) {
          this.onGift(payload.payload)
        }
        if (payload.cmd === (this.isExample ? 'EXAMPLE_INTERACT' : 'INTERACT')) {
          this.onInteract(payload.payload)
        }
        if (payload.cmd === (this.isExample ? 'EXAMPLE_SUPER_CHAT' : 'SUPER_CHAT')) {
          this.onSuperChat(payload.payload)
        }

        if (payload.cmd === 'MESSAGE_CLEAR') {
          this.clearMessages()
        }

        if (payload.cmd === 'EXAMPLE_MESSAGE_RESTORE' && this.isExample) {
          this.clearMessages()
          this.initExampleMessage()
        }
      }

      ws.onclose = (code) => {
        ws = null
        console.log('ws close: ', code)
        console.log('onclose, reconnect...')
        setTimeout(() => {
          this.ws()
          retryWaitTime = 3000

        }, retryWaitTime)
      }

      ws.onerror = (err) => {
        //   ws = null
        console.error(err)
        //   console.log('onerror, reconnect...')
        //   setTimeout(() => {
        //     this.ws()
        //     retryWaitTime = 3000

        //   }, retryWaitTime)
      }
    },
    onSetting(payload) {
      for (const key in payload) {
        this[key] = payload[key]
      }
    },
    onComment(comment) {
      comment.category = 'comment'
      comment.avatar = comment.avatar ? `${comment.avatar}@48w_48h` : DEFAULT_AVATAR
      comment.role = comment.guard || comment.role
      comment.sendAt = comment.sendAt || Date.now()
      if (comment.type === 1 && !this.isShowType1) {
        return
      }
      if (comment.type === 2 && !this.isShowType2) {
        return
      }

      if (this.combineSimilarTime) {
        const reverseComments = this.messages.filter(msg => msg.category === 'comment')
        for (const message of reverseComments) {
          // 再之前的消息超过时间范围，直接跳出
          if (message.sendAt < Date.now() - this.combineSimilarTime) break
          if (message.content === comment.content) {
            message.similar = (message.similar || 0) + 1
            // * return
            return
          }
        }
      }

      if (this.messages.length > MAX_MESSAGE) {
        this.messages.pop()
        this.messages = [comment, ...this.messages]
      } else {
        this.messages = [comment, ...this.messages]
      }
    },
    onGift(gift) {
      if (!this.isShowSilverGift && gift.coinType !== 1) return
      gift.category = 'gift'
      gift.avatar = gift.avatar ? `${gift.avatar}@48w_48h` : DEFAULT_AVATAR
      gift.sendAt = Date.now()
      // 
      gift.totalPrice = gift.price * gift.count || 0
      gift.priceProperties = getPriceProperties(gift.totalPrice) || {}

      this.addToHeadline(gift)
      if (gift.totalPrice < this.showGiftCardThreshold) return
      // 已存在的礼物覆盖，不存在的新增
      const existGift = this.messages.find(msg => msg._id === gift._id)
      if (existGift) {
        existGift.count = gift.count
        existGift.totalPrice = gift.price * (existGift.count || 1)
        existGift.priceProperties = gift.priceProperties
      } else {
        if (this.messages.length > MAX_MESSAGE) {
          this.messages.pop()
          this.messages = [gift, ...this.messages]
        } else {
          this.messages = [gift, ...this.messages]
        }
      }
    },
    onInteract(interact) {
      if (!this.isShowInteractInfo) return
      interact.category = 'interactWord'

      if (this.messages.length > MAX_MESSAGE) {
        this.messages.pop()
        this.messages = [interact, ...this.messages]
      } else {
        this.messages = [interact, ...this.messages]
      }
    },
    onSuperChat(superChat) {
      superChat.category = 'superChat'
      superChat.avatar = superChat.avatar ? `${superChat.avatar}@48w_48h` : DEFAULT_AVATAR
      superChat.sendAt = Date.now()
      superChat.totalPrice = superChat.price || 0
      superChat.priceProperties = getPriceProperties(superChat.totalPrice) || {}

      this.addToHeadline(superChat)

      // 某些场景下SC会推送两次信息，判断SuperChatId相同则不发送重复SC
      const exists = this.messages.find(msg => msg._id === superChat._id)
      if (exists) {
        if (superChat.contentJPN) {
          exists.contentJPN = superChat.contentJPN
        }
        return
      }

      if (superChat.totalPrice < this.showGiftCardThreshold) return
      if (this.messages.length > MAX_MESSAGE) {
        this.messages.pop()
        this.messages = [superChat, ...this.messages]
      } else {
        this.messages = [superChat, ...this.messages]
      }
    },

    // 添加到礼物栏
    addToHeadline(item) {
      if (item.totalPrice < this.showHeadlineThreshold) return

      // 已存在的礼物覆盖，不存在的新增
      const exist = this.headlines.find(msg => msg._id === item._id)
      if (exist) {
        exist.count = item.count
        exist.totalPrice = item.price * item.count
        exist.priceProperties = item.priceProperties
        exist.contentJPN = item.contentJPN || exist.contentJPN
      } else {
        // 新加入高亮显示5s
        this.giftHover = [...this.giftHover, item._id]
        setTimeout(() => {
          this.giftHover = this.giftHover.filter(hover => hover !== item._id)
        }, 5000);
        this.headlines = [item, ...this.headlines]
      }
    },

    async getSetting() {
      const { data } = await getSetting()
      for (const key in data) {
        this[key] = data[key]
      }
    },

    getMessageStyleByRole(message) {
      // const role = (message.role === 1 || message.role === 2) ? 3 : message.role
      const role = message.role
      return this[`message_lv${role}`];
    },
    getNameStyleByRole(message) {
      // const role = (message.role === 1 || message.role === 2) ? 3 : message.role
      const role = message.role
      return this[`name_lv${role}`];
    },
    getCommentStyleByRole(message) {
      // const role = (message.role === 1 || message.role === 2) ? 3 : message.role
      const role = message.role
      return this[`comment_lv${role}`];
    },

    parseMsgType(type) {
      return INTERACT_TYPE[type];
    },

    hoverGift(giftId) {
      this.giftHover = [...this.giftHover, giftId];
    },
    unhoverGift(giftId) {
      this.giftHover = this.giftHover.filter((id) => id !== giftId);
    },
    widthCalculator(item) {
      if (Number(item.existsTime) && Number(item.priceProperties.time)) {
        return Math.floor((1 - item.existsTime / item.priceProperties.time) * 100)
      } else {
        return 100;
      }
    },
    // setIgnoreMouseEvent() {
    //   if (this.isAlwaysOnTop) {
    //     win.setIgnoreMouseEvents(true, { forward: true });
    //   }
    // },
    // setUnIgnoreMouseEvent() {
    //   win.setIgnoreMouseEvents(false);
    // },
    clearMessages() {
      this.messages = []
      this.headlines = []
    },

    giftScroll(e) {
      const el = document.getElementById("gift-show-content-wrapper");
      el.scrollLeft += e.deltaY;
    },
    getGuardIcon(level) {
      return GUARD_ICON_MAP[level];
    },

    async initExampleMessage() {
      const { data: messages } = await getExampleMessages()
      messages.forEach(msg => {
        if (msg.cmd === 'EXAMPLE_COMMENT') {
          this.onComment(msg.payload)
        }
        if (msg.cmd === 'EXAMPLE_GIFT') {
          this.onGift(msg.payload)
        }
        if (msg.cmd === 'EXAMPLE_INTERACT') {
          this.onInteract(msg.payload)
        }
        if (msg.cmd === 'EXAMPLE_SUPER_CHAT') {
          this.onSuperChat(msg.payload)
        }
      })
    },

    playAudio(url) {
      const audio = new Audio(url)
      audio.play()
    }
  },
}
</script>

<style scoped>
.layout {
  position: relative;
  overflow: hidden;
}
.layout-logo {
  float: left;
  position: relative;
}
.layout-nav {
  margin: 0 auto;
}
.layout-footer-center {
  text-align: center;
}
.gift-show-content-wrapper {
  white-space: nowrap;
  position: absolute;
  z-index: 999;
  overflow-x: auto;
  width: 100%;
  /* -webkit-app-region: no-drag; */
}

.gift-show-content-wrapper::-webkit-scrollbar {
  display: none;
}

.message-content-wrapper {
  /* height: calc(100% - 40px); */
  bottom: 0px;
  width: 100%;
  overflow: hidden;
  position: absolute;
}
.message-content {
  width: 100%;
  position: absolute;
  bottom: 0px;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column-reverse;
}

.message-content::-webkit-scrollbar {
  display: none;
}

.gift-show-wrapper {
  display: inline-block;
  vertical-align: top;
}
.gift-show-content {
  display: inline-block;
  line-height: 32px;
  border-radius: 20px;
  height: 32px;
  margin-right: 3px;
  color: white;
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.gift-show-content-extend {
  border-radius: 10px;
  margin-right: 3px;

  width: 200px;
  font-size: 12px;
  position: relative;
  z-index: 9999;
  overflow: hidden;
  /* -webkit-app-region: no-drag */
}

.gift-show-content-header {
  padding: 5px 10px;
}

.gift-show-content-extend-avatar {
  vertical-align: top;
  margin-top: 2px;
}

.gift-show-content-extend-content {
  padding: 10px 10px;

  color: white;
  white-space: normal;
}

.divider {
  border-top: 1px solid;
  width: 100%;
  margin: 10px 0;
  position: relative;
}
.guard-icon {
  width: 22px;
  height: 22px;
  display: inline-block;
  vertical-align: middle;
  background-size: contain;
  background-repeat: no-repeat;
}
.is-vertical-align {
  vertical-align: middle;
}

.max-width {
  width: 100%;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
.border-image-default {
  border-style: solid;
  border-color: transparent;
  display: inline-block;
  border-width: 0px;
}
.margin-lr-1px {
  margin: 0 1px;
}
</style>
