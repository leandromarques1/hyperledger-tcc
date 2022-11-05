# Lab 01

## Baixando Imagens Hyperledger Fabric v1.4
~~~sh
# Certifique que esteja no diretório correto
$ cd /opt/blockchain/hyperledger

$ curl -sSL http://bit.ly/2ysbOFE | bash -s 1.4.4 1.4.4 1.4.4

# Verifique que após conclusão será criado diretório fabric-samples
ls -l

# Para verificar o conteúdo
cd fabric-samples && ls -l
~~~

## Iniciando nossa primeira rede Blockchain
Neste primeiro laboratório iremos realizar todos os passos manualmente, é interessante para melhor entendimento do universo Hyperledger Fabric.

~~~sh
# Certifique que esteja no diretório correto
$ cd /opt/blockchain/hyperledger/fabric-samples

# Clonando arquivos de configuracoes
#$ git clone -b feature/lab-1 https://github.com/leandromarques1/hyperledger-tcc.git network
$ git clone https://github.com/leandromarques1/hyperledger-tcc.git network

# Acessando diretório dos arquivos
$ cd network

# Variáveis de ambiente
$ export PATH=$GOPATH/src/github.com/hyperledger/fabric/build/bin:${PWD}/../bin:${PWD}:$PATH
$ export FABRIC_CFG_PATH=${PWD}
$ export CHANNEL_NAME=sampledomain-channel

# Remove all material pre-exists
$ rm -rf crypto-config channel-artifacts
$ mkdir crypto-config channel-artifacts

# Após a execução do comando será criada a pasta ``crypto-config``
$ cryptogen generate --config=./crypto-config.yaml

$ configtxgen -profile OrgsOrdererGenesis -outputBlock ./channel-artifacts/genesis.block
$ configtxgen -profile OrgChannel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID $CHANNEL_NAME
$ configtxgen -profile OrgChannel -outputAnchorPeersUpdate ./channel-artifacts/ProdutorMSPanchors.tx -channelID $CHANNEL_NAME -asOrg ProdutorMSP

# Para e limpa todos os containers existentes
$ docker-compose -f docker-compose.yaml down

# Sobe containers
# Antes de continuar será necessário alterar a env FABRIC_CA_SERVER_CA_KEYFILE para a ca.sampledomain.com no docker-compose.yaml
# ESQUECE ESSE COMANDO!!!! ls -la crypto-config/peerOrganizations/produtor.sampledomain.com/ca/ | grep _sk
$ docker-compose -f docker-compose.yaml up -d

# Create the channel
$ docker exec \
    -e "CORE_PEER_LOCALMSPID=ProdutorMSP" \
    -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@produtor.sampledomain.com/msp" peer0.produtor.sampledomain.com \
    peer channel create -o orderer.sampledomain.com:7050 -c $CHANNEL_NAME -f /etc/hyperledger/configtx/channel.tx

# Join peer0.produtor.sampledomain.com to the channel
$ docker exec \
    -e "CORE_PEER_LOCALMSPID=ProdutorMSP" \
    -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@produtor.sampledomain.com/msp" peer0.produtor.sampledomain.com \
    peer channel join -b $CHANNEL_NAME.block

# Verificar o canal criado
$ docker exec \
    -e "CORE_PEER_LOCALMSPID=ProdutorMSP" \
    -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@produtor.sampledomain.com/msp" peer0.produtor.sampledomain.com \
    peer channel list
~~~
