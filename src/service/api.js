import axios from 'axios'
const BASE_URL = 'http://127.0.0.1:3000'

export async function getSetting() {
    const res = await axios.get(`${BASE_URL}/api/settings`)
    return res.data
}

export async function getGiftConfig () {
     const res = await axios.get(`${BASE_URL}/api/gifts/config`)
    return res.data
}