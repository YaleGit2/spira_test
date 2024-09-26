import axios from 'axios';
import { useState, useMemo } from 'react';
import { API_EPCIS_BASE_URL } from './utils';

export const useProduct = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const endpoint = 'traceability/products';

  return {
    searchProduct: (id) => {
      const param = `?productId=${id}`;
      setLoading(true);
      axios
        .get(`${API_EPCIS_BASE_URL}/${endpoint}${param}`)
        .then((response) => {
          setProduct(response.data);
          setLoading(false);
          setError(null);
        })
        .catch((error) => {
          console.error(error);
          setLoading(false);
          setError(error);
        });
    },
    product,
    loading,
    error,
  };
};

export const useProductList = (productList) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState({});

  const endpoint = 'traceability/products/check';
  const args = productList.join(',');

  useMemo(() => {
    setLoading(true);
    setError(null);
    axios
      .get(`${API_EPCIS_BASE_URL}/${endpoint}?productList=${args}`)
      .then((result) => {
        setLoading(false);
        setData(result.data);
      })
      .catch((error) => {
        setLoading(false);
        setData({});
        setError(error);
      });
  }, [args]);

  return {
    data,
    loading,
    error,
  };
};

export const useEventTraceability = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const endpoint = 'traceability';
  const userToken = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${userToken}`,
  };
  return {
    addEvent: (event) => {
      setLoading(true);
      axios
        .post(`${API_EPCIS_BASE_URL}/${endpoint}`, event, { headers })
        .then(() => {
          setLoading(false);
        })
        .catch((error) => {
          console.error(error);
          setLoading(false);
          setError(error);
        });
    },
    loading,
    error,
  };
};

export const useTransaction = (id) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const endpoint = 'transactions';

  useMemo(() => {
    const userToken = localStorage.getItem('token');
    const headers = {
      Authorization: `Bearer ${userToken}`,
    };
    setLoading(true);
    axios
      .get(`${API_EPCIS_BASE_URL}/${endpoint}/${id}`, { headers })
      .then((result) => {
        setLoading(false);
        setData(result.data);
        setError(null);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
        setError(error);
      });
  }, [id]);

  return {
    error,
    loading,
    data,
  };
};
