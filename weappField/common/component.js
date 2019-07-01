import { basic } from './basic';
import { observe } from './observer/index';

function mapKeys(source, target, map) {
  Object.keys(map).forEach(function (key) {
    if (source[key]) {
      target[map[key]] = source[key];
    }
  });
}

function VComponent(VOptions) {
  if (VOptions === void 0) {
    VOptions = {};
  }

  var options = {};
  mapKeys(VOptions, options, {
    data: 'data',
    props: 'properties',
    properties: 'properties',
    mixins: 'behaviors',
    methods: 'methods',
    beforeCreate: 'created',
    created: 'attached',
    mounted: 'ready',
    relations: 'relations',
    destroyed: 'detached',
    classes: 'externalClasses'
  });
  var _vantOptions = VOptions,
      relation = _vantOptions.relation;

  if (relation) {
    options.relations = Object.assign(options.relations || {}, {
      ["../" + relation.name + "/index"]: relation
    });
  } // add default externalClasses


  options.externalClasses = options.externalClasses || [];
  options.externalClasses.push('custom-class'); // add default behaviors

  options.behaviors = options.behaviors || [];
  options.behaviors.push(basic); // map field to form-field behavior

  if (VOptions.field) {
    options.behaviors.push('wx://form-field');
  } // add default options


  options.options = {
    multipleSlots: true,
    addGlobalClass: true
  };
  observe(VOptions, options);
  Component(options);
}

export { VComponent };