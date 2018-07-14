import axios from 'axios';

var MyAxios = {};
MyAxios.install = function (Vue) {
// 创建自定义的axios实例
  const instance = axios.create({
    baseURL: 'http://localhost:8888/api/private/v1'
  });

  // Add a request interceptor
  // 添加请求的拦截器
  instance.interceptors.request.use(function (config) {
  // Do something before request is sent
  // 判断当前请求的地址是否是login
    if (config.url.toLowerCase() !== 'login') {
      const token = sessionStorage.getItem('token');
      // 如果请求的地址不是login,设置token
      config.headers.Authorization = token;
    }
    return config;
  }, function (error) {
    // Do something with request error
    return Promise.reject(error);
  });
  Vue.prototype.$http = instance;
};

export default MyAxios;
