import React from 'react';
import { Fragment } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import GlobalStyle from './styles/global-styles';
import { ThemeProvider, createTheme } from './mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#7E94C2',
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <Fragment>
        <GlobalStyle />
        <App />
      </Fragment>
    </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
