# Lab 3
Por padrão o Hyperledger Fabric usa como banco de dados de estado o LevelDB, neste laboratório iremos apresentar como configurar o CouchDB como nosso banco de dados de estado nos pares da nossa rede.

## Usando CouchDB
Todo peer na rede deve possuir uma cópia do ledger e um state database própio.

~~~sh
# Verificar se já possuo uma imagem do CouchDB
docker images hyperledger/fabric-couchdb

# Caso não exista uma imagem, pode fazer o pull 
docker pull hyperledger/fabric-couchdb
~~~

> docker-compose.yaml

~~~txt
  ...

  peer0.produtor.sampledomain.com:
    container_name: peer0.produtor.sampledomain.com
    image: hyperledger/fabric-peer
    environment:
      ...
      - CORE_LEDGER_STATE_STATEDATABASE=CouchDB
      - CORE_LEDGER_STATE_COUCHDBCONFIG_COUCHDBADDRESS=couchdb.peer0.produtor.sampledomain.com:5984
      - CORE_LEDGER_STATE_COUCHDBCONFIG_USERNAME=peer0.produtor
      - CORE_LEDGER_STATE_COUCHDBCONFIG_PASSWORD=password

  peer1.produtor.sampledomain.com:
    container_name: peer1.produtor.sampledomain.com
    image: hyperledger/fabric-peer
    environment:
      ...
      - CORE_LEDGER_STATE_STATEDATABASE=CouchDB
      - CORE_LEDGER_STATE_COUCHDBCONFIG_COUCHDBADDRESS=couchdb.peer1.produtor.sampledomain.com:5984
      - CORE_LEDGER_STATE_COUCHDBCONFIG_USERNAME=peer1.produtor
      - CORE_LEDGER_STATE_COUCHDBCONFIG_PASSWORD=password

  ...

  couchdb.peer0.produtor.sampledomain.com:
    container_name: couchdb.peer0.produtor.sampledomain.com
    environment:
      - COUCHDB_USER=peer0.produtor
      - COUCHDB_PASSWORD=password
    image: hyperledger/fabric-couchdb
    ports: 
      - 5984:5984
    networks: 
      - sampleNetwork

  couchdb.peer1.produtor.sampledomain.com:
    container_name: couchdb.peer1.produtor.sampledomain.com
    environment:
      - COUCHDB_USER=peer1.produtor
      - COUCHDB_PASSWORD=password
    image: hyperledger/fabric-couchdb
    ports: 
      - 6984:5984
    networks: 
      - sampleNetwork

  ...
~~~

> Os arquivos de configuração completos podem ser verificados no https://github.com/deusimarferreira/hyperledger-fabric/tree/feature/lab-3.

~~~sh
$ docker-compose -f docker-compose.yaml up \
    -d ca.sampledomain.com orderer.sampledomain.com \
    couchdb.peer0.produtor.sampledomain.com peer0.produtor.sampledomain.com \
    couchdb.peer1.produtor.sampledomain.com peer1.produtor.sampledomain.com \
    cli

# Testar CouchBD
$ curl http://localhost:5984
$ curl http://localhost:6984

# PEER0
# Primeiro vamos fazer um fetch do genesis block para o corrente channel
$ docker exec \
    -e "CORE_PEER_LOCALMSPID=ProdutorMSP" \
    -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@produtor.sampledomain.com/msp" peer0.produtor.sampledomain.com \
    peer channel fetch oldest $CHANNEL_NAME.block -c $CHANNEL_NAME \
    --orderer orderer.sampledomain.com:7050

# Segundo, vamos executar um join
$ docker exec \
    -e "CORE_PEER_LOCALMSPID=ProdutorMSP" \
    -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@produtor.sampledomain.com/msp" peer0.produtor.sampledomain.com \
    peer channel join -b $CHANNEL_NAME.block
    
# Verificar canal
docker exec \
    -e "CORE_PEER_LOCALMSPID=ProdutorMSP" \
    -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@produtor.sampledomain.com/msp" peer0.produtor.sampledomain.com \
    peer channel list

# PEER1
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
    
# Verificar canal
docker exec \
    -e "CORE_PEER_LOCALMSPID=ProdutorMSP" \
    -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@produtor.sampledomain.com/msp" peer1.produtor.sampledomain.com \
    peer channel list

# https://lists.hyperledger.org/g/fabric/topic/issue_couchdb_and_fabric_peer/68526566?p=,,,20,0,0,0::recentpostdate%2Fsticky,,,20,2,0,68526566
# https://forum.linuxfoundation.org/discussion/856354/lab3-panic-runtime-error-invalid-memory-address-or-nil-pointer-dereference
# GODEBUG=netdns=go
~~~
