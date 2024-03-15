import * as moment from "moment";

const functions = {
  arrayIsEmpty: function (array) {
    if (!Array.isArray(array)) {
        return false;
    }
    if (array.length == 0) {
        return true;
    }
    return false;
  },
  escapeEmptyObjectValue: function (o) {
    const isObject = function (obj) {
      return obj === Object(obj) && !isArray(obj) && typeof obj !== 'function';
    };
    const isArray = function (a) {
      return Array.isArray(a);
    };
    if (isObject(o)) {
      const n = {};
  
      Object.keys(o)
        .forEach((k) => {
          if (
            (functions.escapeEmptyObjectValue(o[k]) !== "" || functions.escapeEmptyObjectValue(o[k]) !== 0) 
            && !functions.arrayIsEmpty(functions.escapeEmptyObjectValue(o[k])) 
            && typeof functions.escapeEmptyObjectValue(o[k]) === "object" 
            &&  Object.keys(functions.escapeEmptyObjectValue(o[k])).length === 0) {
            n[k] = null;
          } else {
            n[k] =functions.escapeEmptyObjectValue(o[k]);
          }
        });
  
      return n;
    } else if (isArray(o)) {
      return o.map((i) => {
        return functions.escapeEmptyObjectValue(i);
      });
    }
  
    return o;
  },
  classificationParam : function (params) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    return {
      groupType : params.groupType ?? 'all',
      isFrom : params.isFrom ?? 'all',
      search : params.search ?? null,
      sortBy : params.sortBy ?? 'payment_date',
      sortType : params.sortType ?? 'desc',
      warehouseId : params.warehouseId ?? 1,
      status : params.status ?? -5,
      periode : params.periode ?? null,
      startDate : params.startDate ?? null,
      endDate : params.endDate ?? null,
      page,
      limit,
      offset : (page - 1) * limit,
      paymentStatus : params.paymentStatus ?? -1,
      paymentType : params.paymentType ?? 'all',
      showCreatedByOnly : params.showCreatedByOnly
    }
  },
  getActionPermissionRoleByName: function (array, menuName, actionName = ''){
    if(!Array.isArray(array)) return [];
    const menu = array.filter(arr => arr.name == menuName);
    const action = menu[0].permission.actions.filter(arr => arr.name == actionName);
    return action[0].privilege.status;
  },
  getValueOrDefault: function (value,defaultValue){
    return value || defaultValue;
  },
  getPeriodDateTime: function (type){
    if(type=='this_month'){
      return {
        start: moment().utcOffset('+0700').startOf("month").format("YYYY-MM-DD 00:00:00"),
        end: moment().utcOffset('+0700').endOf("month").format("YYYY-MM-DD 23:59:59"),
      }
    }else if(type=='this_day'){
      return {
        start: moment().utcOffset('+0700').format("YYYY-MM-DD 00:00:00"),
        end: moment().utcOffset('+0700').format("YYYY-MM-DD 23:59:59")
      }
    }
  },
  randomString: (length = 0) => {
    let string = '';
    let chars = '0123456789abcdefghijklmnopqrstuvwxyz';
    for (var i = length; i > 0; --i) {
      string += chars[Math.floor(Math.random() * chars.length)];
    }
    return string;
  },
}

export const utils = functions;