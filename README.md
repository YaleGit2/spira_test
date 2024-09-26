# Hyperledger-Hybrid Project Setup Guide

This guide provides step-by-step instructions on setting up Hyperledger Fabric, a Node.js server, and a React client on a local machine for development testing. The included chaincode is written in JavaScript. Once completed, the application can be launched and tested on the same machine.

## Prerequisites

Before you start developing blockchain applications or operating Hyperledger Fabric, ensure you have the following prerequisites installed:

- **[cURL](https://hyperledger-fabric.readthedocs.io/en/release-1.4/prereqs.html#curl)**: If not already installed or if you encounter errors running the curl commands, download the latest version of the cURL tool.

- **[Docker and Docker Compose](https://hyperledger-fabric.readthedocs.io/en/release-1.4/prereqs.html#docker-and-docker-compose)**: Docker version 17.06.2-ce or greater is required for macOS, *nix, or Windows 10. For older versions of Windows, use Docker Toolbox.

- **[Go Programming Language](https://hyperledger-fabric.readthedocs.io/en/release-1.4/prereqs.html#go-programming-language)**: Go version 1.12.x is required. Set the environment variable GOPATH to point to the Go workspace containing the downloaded Fabric code base. Extend the command search path to include the Go bin directory.

- **[Node.js Runtime and NPM](https://hyperledger-fabric.readthedocs.io/en/release-1.4/prereqs.html#node-js-runtime-and-npm)**: This project uses version 16.4.0 of Node.js.

- **[Python](https://hyperledger-fabric.readthedocs.io/en/release-1.4/prereqs.html#python)**: For Ubuntu 16.04 users, install Python 2.7 as the Fabric Node.js SDK requires it for `npm install` operations.

For further assistance or any issues, refer to the [Hyperledger Fabric documentation](https://hyperledger-fabric.readthedocs.io/en/release-1.4/prereqs.html) for additional help.

- **[Fabric Sample Binaries](https://hyperledger-fabric.readthedocs.io/en/latest/install.html)**: Proceed with the installation of the binary files with the following command:

    ./install-fabric.sh binary

- Install JQ with the following command:
    sudo apt install -y jq

-- **[JQ](https://lindevs.com/install-jq-on-ubuntu)**: For JSON data handling.
## Getting Started

Follow these steps to set up Hyperledger Fabric on your local machine for development testing:

1. Download Fabric samples and binaries (https://hyperledger-fabric.readthedocs.io/en/latest/install.html):

    ```
    $ mkdir -p $HOME/go/src/github.com/<your_github_userid>
    $ cd $HOME/go/src/github.com/<your_github_userid>
    $ curl -sSLO https://raw.githubusercontent.com/hyperledger/fabric/main/scripts/install-fabric.sh && chmod +x install-fabric.sh
    $ ./install-fabric.sh binary
    ```

2. Copy `config` and `bin` directories into the project:

    ```
    cp -r ./config ~/epcis-chaincode/
    cp -r ./bin ~/epcis-chaincode/
    ```

3. Run the script to set up blockchain test network from the test-network directory:

    ```
    cd /test-network
    ./epcis_start.sh
    ```

optional parameter: -d for only deploying and adding test event

4. For the backend, install the required dependencies for the Node.js project and start the API:

    ```
    cd /api
    npm i
    npm start
    ```

5. For epcis-ui, install dependencies for the react application and start the application:

    ```
    cd /epcis-ui
    npm i
    npm start
    ```

6. For the initial login, use 'admin' as the username and password.

7. [After completing the setup process, if you require guidance on how to utilize the platform through UI interaction, please refer to the README.md file located in the "ui" directory.](./ui/README.md)
