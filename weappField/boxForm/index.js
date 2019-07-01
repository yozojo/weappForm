import {VComponent} from '../common/component';
VComponent({
  name: 'boxForm',

  properties: {
    rules: Object,
    model: Object
  },

  data: {
    fields: []
  },

  relations: {
    '../boxFormItem/index': {
      type: 'child',
      linked(target) {
        const fields = [...this.data.fields, target]
        this.set({
          fields
        });
      },
      linkChanged(target) {
      },
      unlinked(target) {
      }
    }
  },

  created() {},

  methods: {
    resetFields() {
      if (!this.data.model) {
          console.warn(
            '[Form]model is required for resetFields to work.'
          );
        return;
      }
      this.data.fields.forEach(field => {
        field.resetField();
      });
    },
    clearValidate(props = []) {
      const fields = props.length
        ? this.data.fields.filter(field => props.indexOf(field.prop) > -1)
        : this.data.fields;
      fields.forEach(field => {
        field.clearValidate();
      });
    },
    validate(callback) {
      if (!this.data.model) {
        console.warn(
          '[Form]model is required for validate to work!'
        );
        return;
      }

      let model = {};
      this.data.fields.length && (this.data.fields.forEach(item => {
        if (item.data.prop) {
          model[item.data.prop] = item.data.checkValue;
        }
      }))

      let promise;
      // if no callback, return promise
      if (typeof callback !== 'function' && window.Promise) {
        promise = new window.Promise((resolve, reject) => {
          callback = function(valid) {
            valid ? resolve(valid, model) : reject(valid, model);
          };
        });
      }

      let valid = true;
      let count = 0;
      // 如果需要验证的fields为空，调用验证时立刻返回callback
      if (this.data.fields.length === 0 && callback) {
        callback(true, model);
      }

      // let invalidFields = {};
      this.data.fields.forEach(field => {
        field.validate('', (message, field) => {
          if (field) {
            valid = false;
          }
          // invalidFields = {...invalidFields, ...field};
          if (
            typeof callback === 'function' &&
            ++count === this.data.fields.length
          ) {
            callback(valid, model);
          }
        });
      });

      if (promise) {
        return promise;
      }
    },
    validateField(prop, cb) {
      let field = this.data.fields.filter(field => field.prop === prop)[0];
      if (!field) {
        throw new Error('must call validateField with valid prop string!');
      }

      field.validate('', cb);
    }
  },

  mounted() {}
});
