<template>
  <div :style="{
      position: 'absolute',
      top: '4px',
      bottom: '4px',
      left: '4px',
      right: '4px',
      '-webkit-user-select': 'none',
      opacity: windowOpacity,
    }">
    <!-- @mouseenter="isSingleWindow ? setUnIgnoreMouseEvent() : undefined" @mouseleave="isSingleWindow ? setIgnoreMouseEvent() : undefined" -->
    <div @wheel.prevent="giftScroll" :style="{
        position: 'absolute',
        top: '0px',
        width: '100%',
        height: `${giftLabels.length ? '36px' : '0px'}`,
      }">
      <div class="gift-show-content-wrapper" id="gift-show-content-wrapper">
        <transition-group name="fade">
          <template v-for="gift in giftLabels">
            <!-- eslint-disable-next-line -->
            <div :key="gift.id" @mouseenter="hoverGift(gift.id)" @mouseleave="unhoverGift(gift.id)" class="gift-show-wrapper">
              <!-- <transition name="fade"> -->
              <div :key="`${gift.id}_normal`" v-if="!giftHover.includes(gift.id)" class="gift-show-content" :style="{ background: gift.priceProperties.backgroundColor }">
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
                  <template v-if="gift.isGuardGift">
                    <span>
                      {{
                        gift.giftNumber === 1
                          ? `${gift.giftName}`
                          : `${gift.giftName}×${gift.giftNumber}`
                      }}
                    </span>
                  </template>
                  <template v-else-if="gift.totalPrice">
                    <span>{{ `￥${gift.totalPrice}` }}</span>
                  </template>
                </div>
              </div>
              <div :key="`${gift.id}_extend`" v-else class="gift-show-content-extend" :style="{
                  border: `1px solid ${gift.priceProperties.backgroundBottomColor}`,
                }">
                <div class="gift-show-content-header" :style="{ background: gift.priceProperties.backgroundColor }">
                  <Avatar class="gift-show-content-extend-avatar" :src="gift.avatar || DEFAULT_AVATAR" />
                  <div :style="{ display: 'inline-block' }">
                    <p>{{ gift.name }}</p>
                    <template v-if="gift.isGuardGift">
                      <p>
                        {{
                          gift.giftNumber === 1
                            ? `${gift.giftName}`
                            : `${gift.giftName}×${gift.giftNumber}`
                        }}
                      </p>
                    </template>
                    <template v-else-if="gift.totalPrice">
                      <p>{{ `￥${gift.totalPrice}` }}</p>
                    </template>
                  </div>
                </div>
                <div class="gift-show-content-extend-content" :style="{
                    background: gift.priceProperties.backgroundBottomColor,
                  }">
                  <template v-if="gift.type === 'superChat'">
                    {{ gift.comment }}
                    <template v-if="gift.commentJPN">
                      <div class="divider"></div>
                      {{ gift.commentJPN }}
                    </template>
                  </template>
                  <template v-else>
                    {{
                      `${gift.name} 赠送了 ${gift.giftNumber} 个 ${gift.giftName}`
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
    <div class="message-content-wrapper" :style="{ top: `${gifts.length ? '36px' : '0px'}` }">
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
      <transition-group name="fade" tag="div" class="message-content" :style="{ 'font-family': danmakuFont }">
        <p :key="message.id" v-for="message in messages">
          <template v-if="message.type === 'comment'">
            <p :style="getMessageStyleByRole(message)">
              <Avatar v-if="isShowAvatar" :src="message.avatar" :style="avatarSizeStyle" />
              <i v-if="isShowMemberShipIcon && message.role" class="guard-icon" :style="{
                  'background-image': `url(${getGuardIcon(message.role)})`,
                }"></i>
              <!-- v-bind="message" -->
              <FanMedal v-if="isShowFanMedal && message.medalLevel && message.medalName" :medalLevel="message.medalLevel" :medalName="message.medalName" :medalColorStart="message.medalColorStart" :medalColorEnd="message.medalColorEnd" :medalColorBorder="message.medalColorBorder"></FanMedal>
              <span class="message-text" :style="getNameStyleByRole(message)">{{ message.name }}:</span>
              <span class="message-text" :style="getCommentStyleByRole(message)">{{ message.comment }}</span>
              <SimilarCommentBadge class="message-text" :style="{ 'margin-left': '5px' }" v-if="message.similar > 0" v-bind:number="message.similar" />
            </p>
          </template>
          <template v-if="message.type === 'interactWord'">
            <!-- 入场消息设置默认使用普通设置 -->
            <p :style="getCommentStyleByRole({ role: 0 })">
              <FanMedal v-if="isShowFanMedal && message.medalLevel && message.medalName" :medalLevel="message.medalLevel" :medalName="message.medalName" :medalColorStart="message.medalColorStart" :medalColorEnd="message.medalColorEnd" :medalColorBorder="message.medalColorBorder"></FanMedal>
              <span :style="{ color: message.color ? message.color : undefined }">{{ message.name }}</span>
              {{ `${parseMsgType(message.msgType)}了直播间` }}
            </p>
          </template>
          <template v-if="message.type === 'superChat'">
            <GiftCard v-if="!isUseMiniGiftCard" v-bind="message">
              <div :style="{ padding: '10px' }">
                {{ message.comment }}
                <template v-if="message.commentJPN">
                  <div class="divider"></div>
                  {{ message.commentJPN }}
                </template>
              </div>
            </GiftCard>
            <GiftCardMini v-else v-bind="message">{{
              `: ${message.comment}`
            }}</GiftCardMini>
          </template>
          <template v-if="message.type === 'gift'">
            <GiftCard v-if="!isUseMiniGiftCard" v-bind="message">
              <span :style="{
                display: 'inline-block',
                padding: '10px 0px 10px 10px',
              }">{{
              `${message.name} 赠送了 ${message.giftNumber} 个 ${message.giftName}`
            }}</span>
              <img :style="{ 'vertical-align': 'middle', width: '35px' }" :src="giftGifMap[message.giftId] && giftGifMap[message.giftId].webp">
            </GiftCard>
            <GiftCardMini v-else v-bind="message">{{
              `: 赠送了 ${message.giftNumber}个 ${message.giftName}`
            }}
            </GiftCardMini>
          </template>
        </p>
      </transition-group>
    </div>
  </div>
</template>

<script>
import {
  DEFAULT_AVATAR,
  INTERACT_TYPE,
  GUARD_ICON_MAP,
} from "../service/const";
import { getPriceProperties } from "../service/util";
import SimilarCommentBadge from "./SimilarCommentBadge";
import GiftCard from "./GiftCard";
import GiftCardMini from "./GiftCardMini";
import FanMedal from "./FanMedal";
import { getSetting, getGiftConfig } from '../service/api'

const WS_URL = 'ws://127.0.0.1:3000'

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
      giftLabels: [],
      showGiftCardThreshold: 0,
      showGiftLabelThreshold: 0, // 顶部礼物条
      isShowMemberShipIcon: true,
      isShowFanMedal: true,
      isShowAvatar: true,
      isUseMiniGiftCard: false,
      danmakuFont: 'auto',
      avatarSizeStyle: {
        width: `12px`,
        height: `12px`,
        "line-height": `12px`,
      },
      messages: [],
      "0_message": {},
      "0_name": {
      },
      "0_comment": {
      },

      "3_message": {
      },
      "3_name": {
      },
      "3_comment": {
      },

      // 提督和总督暂时使用舰长配置
      "2_message": {
      },
      "2_name": {
      },
      "2_comment": {
      },

      "1_message": {
      },
      "1_name": {
      },
      "1_comment": {
      },
    };
  },
  computed: {
  },
  async mounted() {
    this.giftGifMap = await getGiftConfig()
    this.init()

    const ws = new WebSocket(WS_URL)

    ws.onopen = () => {

    }

    ws.onmessage = (msg) => {
      const payload = JSON.parse(msg.data)

      if (payload.cmd === 'MERGE_SETTING') {
        this.onSetting(payload.payload)
      }
      if (payload.cmd === 'COMMENT') {
        this.onComment(payload.payload)
      }
      if (payload.cmd === 'GIFT') {
        this.onGift(payload.payload)
      }
      if (payload.cmd === 'INTERACT') {
        this.onInteract(payload.payload)
      }
    }

    ws.onclose = (code) => {
      console.log('ws close: ', code)
    }

    ws.onerror = (err) => {
      console.error(err)
    }
  },
  methods: {
    onSetting(payload) {
      console.log(payload)
      for (const key in payload) {
        this[key] = payload[key]
      }
    },
    // TODO: 改成数组
    onComment(comment) {
      // if (payload)
      comment.id = comment._id
      comment.type = 'comment'
      if (this.messages.length > 100) {
        this.messages.pop()
        this.messages = [comment, ...this.messages]
      } else {
        this.messages = [comment, ...this.messages]
      }
    },
    onGift(gift) {
      gift.id = gift._id
      gift.type = 'gift'
      gift.totalPrice = gift.price * gift.giftNumber
      if (!gift.totalPrice || gift.totalPrice > this.showGiftCardThreshold) {
        Object.assign(gift, {
          priceProperties: getPriceProperties(gift.totalPrice) || {},
        });

        // 已存在的礼物覆盖，不存在的新增
        const existGift = this.messages.find(msg => msg.id === gift.id)
        if (existGift) {
          existGift.giftNumber = gift.giftNumber
          existGift.totalPrice = gift.price * gift.giftNumber
        } else {
          if (this.messages.length > 100) {
            this.messages.pop()
            this.messages = [gift, ...this.messages]
          } else {
            this.messages = [gift, ...this.messages]
          }
        }
      }

      // 添加到礼物栏
      if (gift.totalPrice > this.showGiftLabelThreshold) {
        const giftLabel = Object.assign({
          giftHover: true
        }, gift)
        setTimeout(() => {
          giftLabel.giftHover = false
        }, 5000);
        this.giftLabels = [giftLabel, ...this.giftLabels]
      }
    },
    onInteract(interact) {
      interact.id = interact._id
      interact.type = 'interactWord'

      if (this.messages.length > 100) {
        this.messages.pop()
        this.messages = [interact, ...this.messages]
      } else {
        this.messages = [interact, ...this.messages]
      }
    },

    async init() {
      const settings = await getSetting()
      console.log(settings)
      for (const key in settings) {
        this[key] = settings[key]
      }
    },

    getMessageStyleByRole(message) {
      return this[`${message.role}_message`];
    },
    getNameStyleByRole(message) {
      return this[`${message.role}_name`];
    },
    getCommentStyleByRole(message) {
      return this[`${message.role}_comment`];
    },

    parseMsgType(msgType) {
      return INTERACT_TYPE[msgType];
    },

    hoverGift(giftId) {
      this.giftHover = [...this.giftHover, giftId];
    },
    unhoverGift(giftId) {
      this.giftHover = this.giftHover.filter((id) => id !== giftId);
    },
    widthCalculator(gift) {
      if (Number(gift.existsTime) && Number(gift.priceProperties.time)) {
        return Math.floor(
          (1 - gift.existsTime / gift.priceProperties.time) * 100
        );
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
    giftScroll(e) {
      const el = document.getElementById("gift-show-content-wrapper");
      el.scrollLeft += e.deltaY;
    },
    getGuardIcon(level) {
      return GUARD_ICON_MAP[level];
    },
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

.message-super-chat {
  border-radius: 10px;
  border: solid 1px rgba(66, 125, 158, 1);
  margin: 5px;
  overflow: hidden;
}
.message-super-chat-content {
  padding: 10px;
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
.message-text {
  vertical-align: middle;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
