import {VComponent} from '../common/component';
import AsyncValidator from "../common/async-validator/index";
import CountDown from "../common/utils/countDown";
import {stringToRegExp, getPropByPath, encodePattern} from '../common/utils/index';
import {
  maskText,
  unmaskText,
  defaultDelimiters
} from '../common/utils/mask'


VComponent({
  name: 'boxFormItem',

  properties: {
    value: {
      type: String,
      value: '',
      observer(newVal, oldVal, changedPath) {
        if (newVal) {
          this.set({
            computedValue: this.maskText(newVal)
          })
          this.validate('change');
        }
      }
    },
    // 检验字段，必传
    prop: String,
    // 表单类型
    type: {
      type: String,
      value: 'text'
    },
    // 表单次序
    index: {
      type: String,
      value: '1'
    },
    // 单独校验的表单规则
    rules: Object,
    // 是否必填
    required: {
      type: Boolean,
      value: false
    },
    // label名称
    label: {
      type: String,
      value: ''
    },
    // 禁止输入， 为true时立即执行校验表单
    disabled: {
      type: Boolean,
      value: false
    },
    // 是否立即执行校验表单
    immediate: {
      type: Boolean,
      value: false,
      observer(newVal, oldVal, changedPath) {
        if (newVal) this.validate('change');
      }
    },
    // 默认展示信息
    message: {
      type: String,
      value: ''
    },
    // 可替换的展示错误信息
    errorMsg: {
      type: String,
      value: '',
      observer(newVal, oldVal, changedPath) {
        console.log('observer newVal=' + newVal);
        if (newVal) {
          this.set({
            validateMessage: newVal,
            validateState: 'error'
          })
        }
      }
    },
    // 是否展示倒计时
    isCountDown: {
      type: Boolean,
      value: false
    },
    // 是否立即执行倒计时
    isImmdiateCountDown: {
      type: Boolean,
      value: true
    },
    // 是否展示图片
    hasImg: {
      type: Boolean,
      value: false
    },
    // 展示图片的base64，
    base64: String,
    // 展示图片的src，优先src，没有再选择base64
    imgSrc: String,
    // 是否禁止点击按钮
    isNotTouchBtn: {
      type: Boolean,
      value: false
    },
    // 是否展示icon
    showIcon: {
      type: Boolean,
      value: true
    },
    // 是否展示右侧按钮
    showBtn: {
      type: Boolean,
      value: false
    },
    // 自定义按钮名称
    btnName: {
      type: String,
      value: '发送验证码'
    },
    // icon的颜色
    icon_color: {
      type: String,
      value: '#4359ff'
    },
    // 可自定义的表单输入展示格式
    mask: {
      type: null,
      value: null
    },

    dontFillMaskBlanks: Boolean,
    returnMaskedValue: Boolean
  },

  data: {

    count: '',

    checkValue: '',

    computedValue: '',

    triggerType: 'blur',

    validateState: '',

    validateMessage: '',

    validateDisabled: false,

    isFocus: false,

    preDefined: {
      'credit-card': '#### - #### - #### - ####',
      date: '##/##/####',
      'date-with-time': '##/##/#### ##:##',
      phone: '(###) ### - ####',
      social: '###-##-####',
      time: '##:##',
      'time-with-seconds': '##:##:##'
    },

    form: {
      model: {},
      rules: {}
    }
  },

  created() {},


  relations: {
    '../boxForm/index': {
      type: 'parent',
      linked(target) {
        const properties = target.properties;
        let {model, rules} = properties;
        rules = rules ? encodePattern(rules, 'decode') : {};
        model = model ? model : {};
        this.set({
          form: {
            rules,
            model
          }
        })
      },
      linkChanged(target) {
      },
      unlinked(target) {
      }
    }
  },
  computed: {
    showNum() {
      return !/success|error/g.test(this.data.validateState) || this.data.isFocus;
    },

    masked() {
      const preDefined = this.data.preDefined[this.data.mask];
      const mask = preDefined || this.data.mask || '';

      return mask.split('');
    },

    maxlength() {
      if (this.data.mask && this.data.masked) {
        return this.data.masked && this.data.masked.length;
      }
      return 1000;
    },

    isRequired() {
      let rules = this.getRules();
      let isRequired = false;

      if (rules && rules.length) {
        rules.every(rule => {
          if (rule.required) {
            isRequired = true;
            return false;
          }
          return true;
        });
      }
      return isRequired;
    }
  },

  methods: {
    handlerCountDown() {
      this.hasCount = new CountDown({
          date: +(new Date) + 60000,
          onEnd() {
            this.setData({
                count: '',
              })
          },
          render(date) {
              const sec = this.leadingZeros(date.sec, 2) + ' 秒后重试'
              date.sec !== 0 && this.setData({
                count: sec,
              })
          },
      }, this);
    },

    btnHandle(e) {
      if (this.data.isNotTouchBtn) return;
      if (this.data.isCountDown) {
        if (this.hasCount && this.hasCount.interval ) return;
        this.handlerCountDown();
      }

      this.$emit('btn', {
        prop: this.data.prop,
        e
      });
    },
    focusHandle(e) {
      this.set({
        isFocus: true,
        validateMessage: this.data.message,
        errorMsg: '',
        validateState: ''
      });
      this.$emit('focus', {prop: this.data.prop});
    },
    blurHandle(e) {
      this.set({
        isFocus: false
      })
      if (this.data.triggerType === 'blur') {
        this.onFieldBlur();
      }
    },
    inputHandle(e) {
      const checkValue = this.unmaskText(e.detail.value);

      const maskTextValue = this.maskText(checkValue);
      this.set({
        checkValue
      }, () => {
        this.$emit('input', {
          prop: this.data.prop,
          value: checkValue
        });
      });
      const propPath = 'form.model.' + this.data.prop;
      this.set({
        [propPath]: checkValue
      })
      if (this.data.triggerType === 'change') {
        this.onFieldChange();
      }
      let {value, cursor} = e.detail;

      if (this.data.computedValue.length >= value.length) {
        this.set({
          computedValue: value
        })
        return {
          cursor,
          value
        }
      } else {
        this.set({
          computedValue: value
        })
        cursor += 1;
        return {
          cursor,
          value: maskTextValue ? maskTextValue : checkValue
        }
      }
    },

    onFieldBlur() {
      this.validate('blur');
    },

    onFieldChange() {
      if (this.data.validateDisabled) {
        this.set({
          validateDisabled: false
        })
        return;
      }
      this.validate('change');
    },

    clearValidate() {
      console.log('clear');
      this.set({
        computedValue: '',
        validateState: '',
        checkValue: '',
        validateMessage: this.data.message,
        validateDisabled: false
      })
    },
    resetField() {
      this.initHandle();

      let model = this.data.form.model;
      let value = this.fieldValue();
      let path = this.data.prop;
      if (path.indexOf(':') !== -1) {
        path = path.replace(/:/, '.');
      }

      let prop = getPropByPath(model, path, true);

      this.set({
        validateDisabled: true
      })
      if (Array.isArray(value)) {
        prop.o[prop.k] = [].concat(this.data.checkValue);
      } else {
        prop.o[prop.k] = this.data.checkValue;
      }
    },
    validate(trigger, callback = () => {}) {
      this.set({
        validateDisabled: false
      })
      const rules = this.getFilteredRule(trigger);
      if ((!rules || rules.length === 0) && this.data.required === undefined) {
        callback();
        return true;
      }

      this.set({
        validateState: 'validating'
      })
      const descriptor = {};
      if (rules && rules.length > 0) {
        rules.forEach(rule => {
          delete rule.trigger;
        });
      }
      descriptor[this.data.prop] = rules;

      const validator = new AsyncValidator(descriptor);
      const model = {};

      model[this.data.prop] = this.fieldValue();

      validator.validate(
        model,
        {firstFields: true},
        (errors, invalidFields) => {
          this.set({
            validateState: !errors ? 'success' : 'error',
            validateMessage: errors ? errors[0].message : this.data.message
          })

          callback(this.data.validateMessage, invalidFields);
        }
      );
    },

    getFilteredRule(trigger) {
      const rules = JSON.parse(JSON.stringify(this.getRules()));

      return rules
        .filter(rule => {
          if (!rule.trigger || trigger === '') return true;
          if (Array.isArray(rule.trigger)) {
            return rule.trigger.indexOf(trigger) > -1;
          } else {
            return rule.trigger === trigger;
          }
        })
        .map(rule => {
          if (rule.pattern) {
            rule.pattern = stringToRegExp(rule.pattern);
          }
          return {...rule};
        });
    },

    fieldValue() {
      if (this.data.value) {
        return this.data.value;
      }
      const model = this.data.form.model;

      if (!model || !this.data.prop) {
        return;
      }

      let path = this.data.prop;
      if (path.indexOf(':') !== -1) {
        path = path.replace(/:/, '.');
      }

      return getPropByPath(model, path, true).v;
    },

    getRules() {
      let formRules = this.data.form.rules;
      const selfRules = this.data.rules;
      const requiredRule =
        this.data.required !== undefined ? {required: !!this.data.required} : [];

      const prop = getPropByPath(formRules, this.data.prop || '');
      formRules = formRules ? prop.o[this.data.prop || ''] || prop.v : [];

      return [].concat(selfRules || formRules || []).concat(requiredRule);
    },

    getTrigger(rules) {
      for (let index = 0; index < rules.length; index++) {
        const element = rules[index];
        if (element.hasOwnProperty('trigger')) return element.trigger;
      }
      return 'blur';
    },

    maskText(text) {
      return this.data.mask
        ? maskText(text, this.data.masked, this.data.dontFillMaskBlanks)
        : text;
    },
    unmaskText(text) {
      return this.data.mask && !this.data.returnMaskedValue ? unmaskText(text, this.data.mask) : text;
    },
    initHandle(checkValue = '') {
      let rules = this.getRules();
      if (this.data.value) checkValue = this.data.value;
      this.set({
        checkValue,
        computedValue: this.maskText(checkValue),
        triggerType: this.getTrigger(rules),
        validateMessage: this.data.message
      });
      if (checkValue || this.data.value || this.data.immediate || this.data.disabled) {
        this.validate("change");
      }
      if (this.data.isCountDown && this.data.isImmdiateCountDown) {
        this.handlerCountDown();
      }
    }
  },

  mounted() {
    if (this.data.prop) {
      const checkValue = this.fieldValue();
      this.initHandle(checkValue);
    }
  }
});
