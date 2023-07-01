import axios from 'axios';

const buildClient = ({ req }) => {
  if (typeof window === 'undefined') {
    // we are on the server

    return axios.create({
      baseURL: 'http://hfcdevops.xyz/',
      headers: req.headers,
    });
  }else {
    // we are in the browser
    return axios.create( {
        baseUrl: '/',
    });
  }
}
export default buildClient;
