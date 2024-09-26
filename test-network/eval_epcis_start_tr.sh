#!/bin/bash

TRACEABILITY_CHAINCODE_NAME=traceability
EPCIS_CHAINCODE_NAME=epcis
OPT_DEPLOY=0
OPT_EVENT=0
TEST_NET_DIR=${PWD}

# Input args
while getopts "de" flag
do
    case "${flag}" in
        d) OPT_DEPLOY=1;;
        e) OPT_EVENT=1;;
    esac
done

# Network init
if [[ "$OPT_DEPLOY" -eq 0 && "$OPT_EVENT" -eq 0 ]]; then
    ${TEST_NET_DIR}/network.sh down
    ${TEST_NET_DIR}/network.sh up createChannel -ca -s couchdb
fi

# Setup environmental variables
export PATH=${PWD}/../bin:${PWD}:$PATH
export FABRIC_CFG_PATH=$PWD/../config/
export FABRIC_CA_CLIENT_HOME=${TEST_NET_DIR}/organizations/peerOrganizations/org1.example.com/
export FABRIC_LOGGING_SPEC=debug:cauthdsl,policies,msp,grpc,peer.gossip.mcs,gossip,leveldbhelper=info

# More env variables
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_TLS_CLIENTAUTHREQUIRED=false
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_MSPCONFIGPATH=${TEST_NET_DIR}/organizations/peerOrganizations/org1.example.com/users/minter@org1.example.com/msp
export CORE_PEER_TLS_ROOTCERT_FILE=${TEST_NET_DIR}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_ADDRESS=localhost:7051
export TARGET_TLS_OPTIONS="-o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${TEST_NET_DIR}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --peerAddresses localhost:7051 --tlsRootCertFiles ${TEST_NET_DIR}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${TEST_NET_DIR}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt"

# Chaincode deploy
if [[ "$OPT_EVENT" -eq 0 ]]; then

    ${TEST_NET_DIR}/network.sh deployCC -ccn ${EPCIS_CHAINCODE_NAME} -ccp ../chaincode/epcis-events/ -ccl javascript
    ${TEST_NET_DIR}/network.sh deployCC -ccn ${TRACEABILITY_CHAINCODE_NAME} -ccp ../chaincode/${TRACEABILITY_CHAINCODE_NAME}/ -ccl javascript

    # Register TLS certificate
    fabric-ca-client register --caname ca-org1 --id.name minter --id.secret minterpw --id.type client --tls.certfiles ${TEST_NET_DIR}/organizations/fabric-ca/org1/tls-cert.pem
    fabric-ca-client enroll -u https://minter:minterpw@localhost:7054 --caname ca-org1 -M ${TEST_NET_DIR}/organizations/peerOrganizations/org1.example.com/users/minter@org1.example.com/msp --tls.certfiles ${TEST_NET_DIR}/organizations/fabric-ca/org1/tls-cert.pem
    cp ${TEST_NET_DIR}/organizations/peerOrganizations/org1.example.com/msp/config.yaml ${TEST_NET_DIR}/organizations/peerOrganizations/org1.example.com/users/minter@org1.example.com/msp/config.yaml

    # Initialize Chaincode
    peer chaincode invoke $TARGET_TLS_OPTIONS -C mychannel -n ${TRACEABILITY_CHAINCODE_NAME} -c '{"function":"Initialize","Args":["EPCIS Product", "EPT"]}'
fi