# Lab 5
Embora a definição de uma atualização para a maioria dos produtos de software é simplismente uma mudança de versão, uma atualização no contexto Hyperledger significa uma "edição" para na configuração da rede blockchain. A maioria das "atualizações" na rede será enviada como transações de configurações.

## Atualizar Anchor Peers usando ``configtxgen``
No arquivo de configuração configtx.yaml alter o item ``AnchorPeers`` localizado na sessão ``Organizations```.

~~~txt
AnchorPeers:
    - Host: peer1.produtor.sampledomain.com
        Port: 7051
~~~

~~~sh
$ export CHANNEL_NAME=sampledomain-channel

$ configtxgen -profile OrgChannel -outputAnchorPeersUpdate ./channel-artifacts/changeanchorpeerprodutor.tx \
    -channelID $CHANNEL_NAME -asOrg ProdutorMSP
~~~

Agora, altere o ``docker-compose.yaml`` no item ``cli`` e adicione:
~~~txt
- ./channel-artifacts:/opt/gopath/src/github.com/hyperledger/fabric/peer/config/
~~~

Vamos atualizar o container:
~~~sh
$ docker container rm -f cli

$ docker-compose -f docker-compose.yaml up -d cli
~~~

Pronto, agora vamos acessar o container ``cli``:
~~~sh
$ docker exec -it cli bash

# Defina novamente a variável CHANNEL_NAME
export CHANNEL_NAME=sampledomain-channel

# Agora vamos executar o comando referente a nossa Anchor Peer criado anterioremente
$ peer channel update -o orderer.sampledomain.com:7050 -c $CHANNEL_NAME \
    -f ./config/changeanchorpeerprodutor.tx

#saia do CLI digitando Ctrl+D
# Verifique os logs
$ docker logs peer1.produtor.sampledomain.com

# Vamos verificar no peer1
$ export CORE_PEER_ADDRESS=peer1.produtor.sampledomain.com:7051
~~~
