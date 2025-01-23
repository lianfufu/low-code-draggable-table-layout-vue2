/*
 * @Description: What's this for
 * @Autor: WangYuan
 * @Date: 2021-03-24 16:07:46
 * @LastEditors: WangYuan
 * @LastEditTime: 2021-07-02 15:40:52
 */
import Vue from 'vue'
import axios from 'axios'
import store from '@/store'

const token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2Nzc1ZjQ3NGYxZDIyMGZkZjIyOTM2NzQiLCJ1c2VybmFtZSI6Imtha2ExMyIsInBob25lIjoiMTU2MzAxMDYyMTUiLCJlbWFpbCI6IjE0MjM1MzM2NEBxcy5jb20iLCJpbWFnZSI6bnVsbCwiY2hhbmVsRGVzIjoi6L-Z5piv5LiA5q616aKR6YGT5o-P6L-wIiwiZmluZXNDb3VudCI6MCwiY3JlYXRlQXQiOiIyMDI1LTAxLTAyVDAyOjAzOjU2LjUxMFoiLCJ1cGRhdGVBdCI6IjIwMjUtMDEtMDJUMDI6MDM6NTYuNTEwWiIsIl9fdiI6MCwiaWF0IjoxNzM1NzgzNTUwLCJleHAiOjE3MzU4Njk5NTB9.29ygiYg7TnamxaKqvh1bvQt8G-W2yR7RHPqXouHyhJk";
// create an axios instance
const request = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  timeout: 15000, // request timeout
    headers: {
        Authorization: token,
    },
})

// // request interceptor
// request.interceptors.request.use(
//   config => {
//       config.headers['Authorization'] = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzczNGQyMjBkZTI2Y2ViMDQyYTkyOGMiLCJ1c2VybmFtZSI6Imxhb2xpNiIsInBob25lIjoiMTU2MzAxMDg4MTYiLCJlbWFpbCI6IjIzYXNkZjc2NEBxcS5jb20iLCJpbWFnZSI6bnVsbCwiY3JlYXRlQXQiOiIyMDI0LTEyLTMxVDAxOjQ1OjQxLjYwNFoiLCJ1cGRhdGVBdCI6IjIwMjQtMTItMzFUMDE6NDU6NDEuNjA0WiIsImNvdmVyIjpudWxsLCJjaGFuZWxEZXMiOm51bGwsIl9fdiI6MCwiZmluZXNDb3VudCI6MSwiaWF0IjoxNzM1Njk1NjAwLCJleHAiOjE3MzU3ODIwMDB9.qb9LibKUAHh-WKOaZiSKiPxVt9XKOgLic8n7alZcmeA"
//       return config
//   })
//
// // response interceptor
// request.interceptors.response.use(
//   response => {
//     const token = response.headers['right-token']
//     token && store.commit('setToken', token)
//
//     return response.data
//   }
// )

export default request
