import axios from 'axios';
const timeout = 12000;

export const fetchData = async(method, url, body = {}, headers = {}) => {
    try {
        // let accessToken = await getItemFromAsyncStorage('accessToken');
        // headers['Authorization'] = `Bearer ${accessToken}`;
        let axiosParams = {};
        switch (method) {
            case 'get':
                axiosParams = { method: 'get', url: url, timeout: timeout, };
                break;
            case 'post':
                axiosParams = { method: 'post', url: url, data: body, timeout: timeout, };
                break;
            case 'put':
                axiosParams = { method: 'put', url: url, data: body, timeout: timeout, };
                break;
            default:
                break;
        }
        return new Promise(async(resolve, reject) => {
            try {
                let response = await axios(axiosParams);
                if (response.status === 200) {
                    resolve(response);
                }
            } catch (e) {
                reject(e);
            }
        });
    } catch (err) {
        console.log('err', err);
    }
};
