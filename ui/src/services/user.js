import axios from 'axios';
import { API_BASE_URL } from './utils';

const useUserService = {
  isAuthenticated: localStorage.getItem('token') !== null,

  login: function (username, password) {
    const apiUrl = `${API_BASE_URL}/login`;
    return axios.post(apiUrl, { username, password }).then((response) => {
      this.setToken(response.data.token);
      this.authenticated = true;
      return response.data;
    });
  },

  update: function (
    username,
    password,
    newUsername = null,
    newPassword = null
  ) {
    const apiUrl = `${API_BASE_URL}/update`;
    const data = {
      username: username,
      password: password,
      newUsername: newUsername,
      newPassword: newPassword,
    };
    return axios.post(apiUrl, data).then((response) => {
      return response.data;
    });
  },

  setToken: function (token) {
    localStorage.setItem('token', token);
  },

  logout: function () {
    localStorage.removeItem('token');
    this.authenticated = false;
  },

  register: function (username, password, email) {
    const apiUrl = `${API_BASE_URL}/register`;

    const data = {
      username: username,
      password: password,
      email: email,
    };
    return axios.post(apiUrl, data).then((response) => {
      return response.data;
    });
  },
};

export default useUserService;
