# Passo a Passo - Implementação de Rede

## Desafio: Implementar "Produtor", "Transportador" e "Vendedor"


Depois de instalar Fabric-Samples e Baixar crypto-config, confgtx e docker-compose

### PASSO 1: acesse a pasta "network" e preparando ambiente
~~~sh
# Acessando diretório dos arquivos
$ cd network

# Variáveis de ambiente
$ export PATH=$GOPATH/src/github.com/hyperledger/fabric/build/bin:${PWD}/../bin:${PWD}:$PATH
$ export FABRIC_CFG_PATH=${PWD}
$ export CHANNEL_NAME=sampledomain-channel


# Remove all material pre-exists
$ rm -rf crypto-config channel-artifacts
$ mkdir crypto-config channel-artifacts
~~~

### PASSO 2: gerando material criptográfico dos Participantes
~~~sh
# Após a execução do comando será criada a pasta "crypto-config"
$ cryptogen generate --config=./crypto-config.yaml
~~~ 

### PASSO 3: criando Bloco Genesis e configuração de Canal
~~~sh
#Todos esses artefatos serão gerados na pasta "channel-artifacts", dentro de "network"

#=== Bloco Genesis ===#
$ configtxgen -profile OrgsOrdererGenesis -outputBlock ./channel-artifacts/genesis.block
  
#=== Canal ===#
$ configtxgen -profile OrgChannel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID $CHANNEL_NAME

#=== Organizações ===#
$ configtxgen -profile OrgChannel -outputAnchorPeersUpdate ./channel-artifacts/ProdutorMSPanchors.tx -channelID $CHANNEL_NAME -asOrg ProdutorMSP

$ configtxgen -profile OrgChannel -outputAnchorPeersUpdate ./channel-artifacts/TransportadorMSPanchors.tx -channelID $CHANNEL_NAME -asOrg TransportadorMSP

$ configtxgen -profile OrgChannel -outputAnchorPeersUpdate ./channel-artifacts/VendedorMSPanchors.tx -channelID $CHANNEL_NAME -asOrg VendedorMSP
~~~

### PASSO 4: Iniciar Containers
~~~sh
# Para e limpa todos os containers existentes
$ docker-compose -f docker-compose.yaml down

# Sobe containers
# Antes de continuar será necessário alterar a env FABRIC_CA_SERVER_CA_KEYFILE para a ca.produtor.sampledomain.com e para ca.transportador.sampledomain.com  no docker-compose.yaml
# ESQUECE ESSE COMANDO!!!! ls -la crypto-config/peerOrganizations/produtor.sampledomain.com/ca/ | grep _sk
$ docker-compose -f docker-compose.yaml up -d

# Testar CouchBD
$ curl http://localhost:5984
$ curl http://localhost:6984
$ curl http://localhost:7984

~~~

### PASSO 5: Criação do Canal: com base nos artefatos gerados anteriormente através da ferramenta configtxgen. 
~~~sh 
# Acessando CLI 
$ docker exec -it cli bash

#========= PEER0 de Produtor =========#
# Variáveis de Ambiente para PEER0

$ CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/produtor.sampledomain.com/users/Admin@produtor.sampledomain.com/msp
$ CORE_PEER_ADDRESS=peer0.produtor.sampledomain.com:7051
$ CORE_PEER_LOCALMSPID="ProdutorMSP"
$ CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/produtor.sampledomain.com/peers/peer0.produtor.sampledomain.com/tls/ca.crt
$ CHANNEL_NAME=sampledomain-channel

# Create Channel
$ peer channel create -o orderer.sampledomain.com:7050 -c $CHANNEL_NAME -f ./config/channel.tx

# antes de juntar, verificar o canal criado
$ peer channel list
  # saida esperada
  # Channels peers has joined:

    
# Join "peer0.produtor.sampledomain.com" to the channel
$ peer channel join -b $CHANNEL_NAME.block


# Verificar o canal criado
$ peer channel list
# saida esperada
# sampledomain-channel

#========= PEER1 de Produtor =========#
# Variáveis de Ambiente para PEER0
$ CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/produtor.sampledomain.com/users/Admin@produtor.sampledomain.com/msp
$ CORE_PEER_ADDRESS=peer1.produtor.sampledomain.com:7051

# Canal já foi Criado a partir do PEER0 de "Produtor". Não existe mais necessidade de recriá-lo

# antes de juntar, verificar o canal criado
$ peer channel list
# saida esperada
  # Channels peers has joined:

# Adicionar o peer1 de Produtor ao canal
$ peer channel join -b $CHANNEL_NAME.block

# Verificar o canal criado
$ peer channel list

# Saida esperada:
# Channels peers has joined:
# sampledomain-channel

#========= PEER0 de Transportador =========#
# Variáveis de Ambiente para PEER0
$ CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/transportador.sampledomain.com/users/Admin@transportador.sampledomain.com/msp
$ CORE_PEER_LOCALMSPID=TransportadorMSP
$ CORE_PEER_ADDRESS=peer0.transportador.sampledomain.com:7051
#Obs.: não importa a Organização, só funciona quando coloco a porta "7051" (por que será? porque foi definido como sendo a PORTA DO CONTAINER)

# antes de juntar, verificar o canal criado
$ peer channel list
# saida esperada
# Channels peers has joined:

# Adicionar o peer0 de Transportador ao canal
$ peer channel join -b $CHANNEL_NAME.block

# Verificar o canal criado
$ peer channel list

# saida esperada
# Channels peers has joined:
#   sampledomain-channel


#========= PEER1 de Transportador =========#
# Variáveis de Ambiente para PEER0
$ CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/transportador.sampledomain.com/users/Admin@transportador.sampledomain.com/msp
$ CORE_PEER_LOCALMSPID=TransportadorMSP
$ CORE_PEER_ADDRESS=peer1.transportador.sampledomain.com:7051

# antes de juntar, verificar o canal criado
$ peer channel list
# saida esperada
# Channels peers has joined:

# Adicionar o peer0 de Transportador ao canal
$ peer channel join -b $CHANNEL_NAME.block

# Verificar o canal criado
$ peer channel list
# saida esperada
# Channels peers has joined:
#   sampledomain-channel


#========= PEER0 de Vendedor =========#
# Variáveis de Ambiente para PEER0
$ CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/vendedor.sampledomain.com/users/Admin@vendedor.sampledomain.com/msp
$ CORE_PEER_LOCALMSPID=VendedorMSP
$ CORE_PEER_ADDRESS=peer0.vendedor.sampledomain.com:7051
#Obs.: não importa a Organização, só funciona quando coloco a porta "7051" (por que será? porque foi definido como sendo a PORTA DO CONTAINER)

# antes de juntar, verificar o canal criado
$ peer channel list
# saida esperada
# Channels peers has joined:

# Adicionar o peer0 de Vendedor ao canal
$ peer channel join -b $CHANNEL_NAME.block

# Verificar o canal criado
$ peer channel list

# saida esperada
# Channels peers has joined:
#   sampledomain-channel

#========= PEER1 de Vendedor =========#
# Variáveis de Ambiente para PEER0
$ CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/vendedor.sampledomain.com/users/Admin@vendedor.sampledomain.com/msp
$ CORE_PEER_LOCALMSPID=VendedorMSP
$ CORE_PEER_ADDRESS=peer1.vendedor.sampledomain.com:7051

# antes de juntar, verificar o canal criado
$ peer channel list
# saida esperada
# Channels peers has joined:

# Adicionar o peer0 de Vendedor ao canal
$ peer channel join -b $CHANNEL_NAME.block

# Verificar o canal criado
$ peer channel list
# saida esperada
# Channels peers has joined:
#   sampledomain-channel

~~~


### PASSO 6: Atualizar Anchor Peer no Canal
 ver link: https://hyperledger-fabric.readthedocs.io/en/release-1.4/build_network.html#update-the-anchor-peers

Diferente da etapa de adicionar participantes ao canal, esta etapa precisa ser executada SOMENTE NOS ANCHOR PEER DE CADA ORGANIZAÇÃO, e não em todos os nós da rede

~~~sh
# Atualize a definição do canal para definir o peer âncora para Produtor como peer0.produtor.sampledomain.com
  
#========= PEER0 de Produtor =========#
$ CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/produtor.sampledomain.com/users/Admin\@produtor.sampledomain.com/msp/
$ CORE_PEER_ADDRESS=peer0.produtor.sampledomain.com:7051
$ CORE_PEER_LOCALMSPID=ProdutorMSP
$ CHANNEL_NAME=sampledomain-channel

# atualizar Channel
$ peer channel update -o orderer.sampledomain.com:7050 -c $CHANNEL_NAME -f ./config/${CORE_PEER_LOCALMSPID}anchors.tx


#========= PEER0 de Transportador =========#
$ CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/transportador.sampledomain.com/users/Admin\@transportador.sampledomain.com/msp/
$ CORE_PEER_ADDRESS=peer0.transportador.sampledomain.com:7051
$ CORE_PEER_LOCALMSPID=TransportadorMSP
$ CHANNEL_NAME=sampledomain-channel

# atualizar Channel
$ peer channel update -o orderer.sampledomain.com:7050 -c $CHANNEL_NAME -f ./config/${CORE_PEER_LOCALMSPID}anchors.tx


#========= PEER0 de Vendedor =========#
$ CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/vendedor.sampledomain.com/users/Admin\@vendedor.sampledomain.com/msp/
$ CORE_PEER_ADDRESS=peer0.vendedor.sampledomain.com:7051
$ CORE_PEER_LOCALMSPID=VendedorMSP
$ CHANNEL_NAME=sampledomain-channel

# atualizar Channel
$ peer channel update -o orderer.sampledomain.com:7050 -c $CHANNEL_NAME -f ./config/${CORE_PEER_LOCALMSPID}anchors.tx

~~~


### FINALIZAÇÃO
Neste momento todos os comandos relativos à criação e configuração da rede blockchain foram concluídos. O próximo passo é <a href="https://github.com/leandromarques1/hyperledger-tcc/blob/teste_comRede_Produtor_Transportador/chaincode/README.md">instalar e instanciar o Smart Contract na rede</a>
