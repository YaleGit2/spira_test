import axios from 'axios';
import { API_BASE_URL } from './utils';

const useAdminServices = {
  getSystemUsers: function (username, password) {
    const apiUrl = `${API_BASE_URL}/users`;
    const data = {
      username: username,
      password: password,
    };
    return axios.post(apiUrl, data).then((response) => {
      return response.data;
    });
  },

  approveSystemUser: function (username, password, user) {
    const userToken = localStorage.getItem('token');
    const headers = {
      Authorization: `Bearer ${userToken}`,
    };
    const apiUrl = `${API_BASE_URL}/users`;
    const data = {
      username: username,
      password: password,
      user: user,
    };
    return axios.post(apiUrl, data, { headers }).then((response) => {
      return response.data;
    });
  },

  deleteSystemUser: function (username, password, user) {
    const apiUrl = `${API_BASE_URL}/delete`;
    const userToken = localStorage.getItem('token');
    const headers = {
      Authorization: `Bearer ${userToken}`,
    };
    const data = {
      username: username,
      password: password,
      user: user,
    };
    return axios.post(apiUrl, data, { headers }).then((response) => {
      return response.data;
    });
  },
};

export default useAdminServices;
