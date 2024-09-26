import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
    :root {
        --good--color: #00cccc;
        --warning--color: #ff6363;
        --danger--color: #ff4336;
        --link--color: rgb(35, 119, 235);
        --primary--color: #3f51b5;
    }

    body {
        margin: 0em 1em 1em 1em !important;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
            sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        display: block;
    }

    .clickable {
        cursor: pointer;
        color: var(--link--color);
        font-weight: 400;
        text-decoration: none;
    }

    .margin-top-1em {
        margin-top: 1em;
    }
`;

export default GlobalStyle;
