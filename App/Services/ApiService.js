
import axios from 'axios'
import Toast from 'react-native-simple-toast'
import NetworkUtils from './NetworkUtils'
import { LocalDBItems, getData } from './LocalStorage'

export const apiService = async (requestObj) => {
  const { endpoint, type, params } = requestObj
  const baseUrl = requestObj.endpoint
  const getAccessToken = async () => {
    try {
     const retrievedItem = await getData(LocalDBItems.tokenData)
      if (retrievedItem !== null) {
        const authorization = `token ${retrievedItem}`
        // We have data!!
        return authorization
      }
      return null
    } catch (error) {
      // Error retrieving data
    }
  }

  const loginClient = axios.create({
    baseURL: baseUrl,
    headers: {
      Accept: 'application/json',
    },
    data: params,
  })

  const getLoginClient = async () => {
    loginClient.defaults.headers.common.Authorization = await getAccessToken()
    return loginClient
  }

  const apiCall = async () => {
    const client = await getLoginClient()
    switch (type) {
      case 'get':
        try {
          const { data: getData } = await client.get()
          return getData
        } catch (error) {
          if(error && error.response && error.response.data && error.response.data.message)
          {
            Toast.show(error.response.data.message, Toast.LONG)
          } else {
          Toast.show(error.toString(), Toast.LONG)
          }         
           return error
        }
      case 'post':
        try {
          const { data: postData } = await client.post(endpoint, params)
         if (postData.status == "Error") {
           Toast.show(postData.desc, Toast.LONG)
          }
          return postData
        } catch (error) {
          if(error && error.response && error.response.data && error.response.data.message)
          {
            Toast.show(error.response.data.message, Toast.LONG)
          } else {
          Toast.show(error.toString(), Toast.LONG)
          }
          return error
        }
        case 'patch':
          try {
          const { data: patchData } = await client.patch(endpoint, params)
         if (patchData.status == "Error") {
           Toast.show(patchData.desc, Toast.LONG)
          }
          return patchData
        } catch (error) {
          if(error && error.response && error.response.data && error.response.data.message)
          {
            Toast.show(error.response.data.message, Toast.LONG)
          } else {
          Toast.show(error.toString(), Toast.LONG)
          }
          return error
        }
      default:
        break
    }
  }

  const networkCheck = async () => {
    const isConnected = await NetworkUtils.isNetworkAvailable()
    if(isConnected) {
       let dataResponse = await apiCall()
       return dataResponse
    } else {
            Toast.show('You seems to be not connected to internet. Please check your connection', Toast.LONG)
            return 'You seems to be not connected to internet. Please check your connection'
    }
  }

 return networkCheck()
}
