import { useState } from 'react';
import axios from 'axios';
import { API_EPCIS_BASE_URL } from './utils';

export const useEventList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const endpoint = 'events';
  console.log("Yale from ../../services/event")
  return {
    get: (idList) => {
      setLoading(true);
      const userToken = localStorage.getItem('token');
      const headers = {
        Authorization: `Bearer ${userToken}`,
      };
      const params = Array.isArray(idList)
        ? `?EQ_eventID=[${idList.map((value) => `"${value}"`).join(',')}]`
        : '';

      axios
        .get(`${API_EPCIS_BASE_URL}/${endpoint}${params}`, { headers })
        .then((result) => {
          setData(result.data.epcisBody?.queryResults?.resultBody?.eventList);
          setLoading(false);
          console.log("Event Yale .." + result.data.epcisBody?.queryResults?.resultBody?.eventList)
        })
        .catch((e) => {
          console.log("Eroror Yale .." + e)
          console.error(e);
          setLoading(false);
          setError(e);
        });
    },
    data,
    loading,
    error,
  };
};

export const useEvent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const endpoint = 'events';
  const userToken = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${userToken}`,
  };

  return {
    loading,
    error,
    result,
    capture: (data) => {
      const obj = JSON.parse(data);
      setLoading(true);
      axios
        .post(`${API_EPCIS_BASE_URL}/${endpoint}`, obj, { headers })
        .then((result) => {
          setResult(result.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error(error.toJSON());
          setLoading(false);
          setError(error);
        });
    },
  };
};
