# Lab 02

## Adicionar novo ``peer`` na organização ``Produtor``

> docker-compose.yaml

~~~txt  
  peer1.produtor.sampledomain.com:
    container_name: peer1.produtor.sampledomain.com
    image: hyperledger/fabric-peer
    environment:
      - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
      - CORE_PEER_ID=peer1.produtor.sampledomain.com
      - CORE_LOGGING_PEER=info
      - CORE_CHAINCODE_LOGGING=debug
      - CORE_PEER_LOCALMSPID=ProdutorMSP
      - CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/peer/
      - CORE_PEER_ADDRESS=peer1.produtor.sampledomain.com:7051
      - CORE_VM_DOCKER_HOSTCONFIG_NETWORKMODE=network_sampleNetwork
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric
    command: peer node start
    ports:
      - 8051:7051
      - 8053:7053
    volumes:
      - /var/run/:/host/var/run/
      - ./crypto-config/peerOrganizations/produtor.sampledomain.com/peers/peer1.produtor.sampledomain.com/msp:/etc/hyperledger/msp/peer
      - ./crypto-config/peerOrganizations/produtor.sampledomain.com/users:/etc/hyperledger/msp/users
      - ./channel-artifacts:/etc/hyperledger/configtx
    depends_on:
      - orderer.sampledomain.com
    networks:
      - sampleNetwork
~~~

> crypto-config.yaml

~~~txt
    Template:
      Count: 2
~~~


## Adicionar novo peer a rede Blockchain

~~~sh
# Verifique se as variáveis de ambiente estão definidas, caso negativo, defina conforme comandos abaixo
$ export PATH=$GOPATH/src/github.com/hyperledger/fabric/build/bin:${PWD}/../bin:${PWD}:$PATH
$ export FABRIC_CFG_PATH=${PWD}
$ export CHANNEL_NAME=sampledomain-channel
# Verifique se as variáveis de ambiente estão definidas, caso negativo, defina conforme comandos acima

$ cryptogen extend --config=./crypto-config.yaml

# Verifique novo peer adicionado
$ ls -l ./crypto-config/peerOrganizations/produtor.sampledomain.com/peers/

# Vamos gerar nosso genesis block
$ configtxgen -profile OrgsOrdererGenesis -outputBlock ./channel-artifacts/genesis.block

# Visualize o novo bloco gerado usando ``inspectBlock``
$ configtxgen -inspectBlock ./channel-artifacts/genesis.block

# Vamos iniciar os containers
$ docker-compose -f docker-compose.yaml up \
  -d peer0.produtor.sampledomain.com peer1.produtor.sampledomain.com cli

# Visualize os conatiners com filtro ``name=peer``
$ docker ps --filter name=peer

# Agora vamos unir o canal criado no Lab1 ao novo ``peer`` que acabamos de adicionar
# Primeiro vamos fazer um fetch do genesis block para o corrente channel
$ docker exec \
    -e "CORE_PEER_LOCALMSPID=ProdutorMSP" \
    -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@produtor.sampledomain.com/msp" peer1.produtor.sampledomain.com \
    peer channel fetch oldest $CHANNEL_NAME.block -c $CHANNEL_NAME \
    --orderer orderer.sampledomain.com:7050

# Segundo, vamos executar um join
$ docker exec \
    -e "CORE_PEER_LOCALMSPID=ProdutorMSP" \
    -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@produtor.sampledomain.com/msp" peer1.produtor.sampledomain.com \
    peer channel join -b $CHANNEL_NAME.block

# Verificar o canal
$ docker exec \
    -e "CORE_PEER_LOCALMSPID=ProdutorMSP" \
    -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@produtor.sampledomain.com/msp" peer1.produtor.sampledomain.com \
    peer channel list
~~~
