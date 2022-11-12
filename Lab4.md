# Lab 4

## Gerenciamento de Chaincode (Smart contract)

### Realizar a instalação do contrato (Chaincode) - PEER0

Atualiza o contêiner ``cli``.
~~~sh
# Atualiza cliente fabric-tool
docker-compose -f docker-compose.yaml up -d cli

# Acessa contêiner
docker exec -it cli bash
~~~

Definir variaveis de ambiente para o PEER qual iremos instalar o Chaincode
~~~sh
# Member Service Provider config path to certificates
$ export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/produtor.sampledomain.com/users/Admin\@produtor.sampledomain.com/msp/

# Define member service provider
$ export CORE_PEER_LOCALMSPID=ProdutorMSP

# Define peer, qual iremos instalar o certificado
$ export CORE_PEER_ADDRESS=peer0.produtor.sampledomain.com:7051
~~~

Precisamos criar uma pasta chamada ``Chaincode``
~~~sh
$ cd ../../../
# Iremos para a Pasta "github.com"

$ mkdir chaincode   #cria pasta que armazerá os possíveis chaincodes a serem usados
$ cd chaincode
$ mkdir deal        #cria pasta que armazenará Chaincodes específicos para esse Lab
$ cd deal
~~~

Agora precisamo criar nossos arquivos ``deal.js`` e ``package.json``. Isso deverá ser feito através do próprio terminal, usando o comando "cat".
Para mais informações sobre o ``cat`` acessar o link: https://www.vivaolinux.com.br/dica/cat-como-um-editor-de-texto-simples

~~~sh
# "cat" será o comando usado para criar e editar arquivos dentro do terminal

#criar arquivo com código do chaincode
$ cat > deal.js
# ao apertar "enter" a partir da linha de baixo já pode escrever.
# escrever ou colar código do chaincode aqui
# para sair e salvar, é só apertar ctrl+Z

#para verificar arquivo criado
$ ls -l

#criar arquivo 'package.json'
$ cat > package.json
# escrever ou colar "package.json" aqui
# para sair e salvar, é só apertar ctrl+Z

#para verificar arquivo criado
$ ls -l

#para ler qualquer arquivo, basta usar o comando abaixo
$ cat deal.js
$ cat package.json

~~~

O path onde o CLI está rodando é esse: ``/opt/gopath/src/github.com/hyperledger/fabric/peer``



Para acessarmmos a versão do chaincode que vamos instalar, o caminho a se percorrer será esse: ``../../../chaincode/deal``

O comando que passaremos no terminal será esse:

~~~sh

$ peer chaincode install -l node -n deal -p ../../../chaincode/deal -v 1.0.1
# -l, --lang                           Language of the chaincode
# -n, --name string                    Name of the chaincode
# -p, --path string                    Path to chaincode
# -v, --version string                 Version of the chaincode specified in install/instantiate/upgrade commands
~~~

> Nota: Por padrão, a linguagem Golang é o padrão desse comando, logo se o chaincode for ser instalado em Go, não se torna necessário escrever "-l"
> Nota 2: muito cuidado com o ``-v``. Trata-se da ``version`` que aparece no ``package.json``

Para visualizar o chaincode instalado execute o comando:
~~~sh
$ peer chaincode list --installed
~~~

### Realizar a instalação do contrato (Chaincode) - PEER1
Vamos definir as variavéis de ambiente para o PEER1, observe que os procedimentos são exatamente os mesmos realizados para instalação do chaincode no PEER0, apenas atente-se para definir corretamente o PEER.

Se você possuir outros pares (peer) e deseja realizar a instalação do chaincode em cada um deles basta realizar os procedimentos abaixo para cada par (peer).

~~~sh
# Member Service Provider config path to certificates
$ export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/produtor.sampledomain.com/users/Admin\@produtor.sampledomain.com/msp/

# Define member service provider
$ export CORE_PEER_LOCALMSPID="ProdutorMSP"
~~~

Neste ponto está nossa primeira diferença, note que foi substituído ``peer0`` por ``peer1``. 
~~~sh
# Define peer, qual iremos instalar o certificado
$ export CORE_PEER_ADDRESS=peer1.produtor.sampledomain.com:7051

# Antes de instalar, faça uma verificação.
$ peer chaincode list --installed
# Se as variáreis foram definidas corretamente teremos o seguinte resultado:
Get installed chaincodes on peer:

# Vamos instalar nosso chaincode
$ peer chaincode install -l node -n deal -p ../../../chaincode/deal -v 1.0.1
# -l, --lang                           Language of the chaincode
# -n, --name string                    Name of the chaincode
# -p, --path string                    Path to chaincode
# -v, --version string                 Version of the chaincode specified in install/instantiate/upgrade commands


# Novamente, vamos verificar o canal instalado
$ peer chaincode list --installed

# Se tudo correu bem o resultado será:
Get installed chaincodes on peer:
Name: ccForAll, Version: 1.0, Path: github.com/sacc, Id: cd57c948631f3241d19204c3502f2e779ed2a3e1e33e40a9592cf452f9c31a9a
~~~

### Agora vamos instância nosso Chaincode

~~~sh
# Member Service Provider config path to certificates
$ export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/produtor.sampledomain.com/users/Admin\@produtor.sampledomain.com/msp/

# Define member service provider
$ export CORE_PEER_LOCALMSPID="ProdutorMSP"

# Define peer, qual iremos instalar o certificado
$ export CORE_PEER_ADDRESS=peer0.produtor.sampledomain.com:7051

$ export CHANNEL_NAME=sampledomain-channel
~~~

Definido as variáveis. Vamos instânciar nosso chaincode usando o comando ``peer chaincode instantiate``, esse comando inicia o ciclo de vida (lifecycle) para o chaincode. Ele pode demorar um pouco, apenas espere.
~~~sh
# Atenção, não execute esse comando, vamos instanciar nosso chaincode com policies
# Vide: Endorsement Policies para executar chaincode
# Esse código está aqui apenas pra consulta
$ peer chaincode instantiate \
    -l node \
    -n deal \
    -o orderer.sampledomain.com:7050 \
    -C $CHANNEL_NAME \
    -c '{"Args":["Mach","50"]}'
# -l, --lang                           Language of the chaincode
# -n, --name string                    Name of the chaincode
# -v, --version string                 Version of the chaincode specified in install/instantiate/upgrade commands
# -o, --orderer string                 Ordering service endpoint
# -C, --channelID string               The channel on which this command should be executed
# -c, --ctor string                    Constructor message for the chaincode in JSON format (default "{}")

~~~

### Endorsement Policies para executar chaincode
A instânciação de um chaincode é sinônimo de políticas de endosso (endorsement policy), ambos são confirmados simultâneamente.

As políticas de endosso (endorsement policy) são extremamente importantes ao especificar operações no chaincode porque determina que pode executar o contrato e quem apenas possui o código instalado para consulta e transparências.

> Nota: antes de prosseguir, verifique se o ``channel`` foi corretamente criado (vide Lab1)

Em nosso ``peer0`` vamos executar as políticas de endosso:
~~~sh
$ peer chaincode instantiate \
    -l node \
    -n deal \
    -v 1.0.1 \
    -o orderer.sampledomain.com:7050 \
    -C $CHANNEL_NAME \
    -c '{"Args":["Mach","50"]}' \
    --policy "AND('Produtor.peer', OR ('Produtor.member'))"
# -l, --lang                            Language of the chaincode
# -n, --name string                     Name of the chaincode
# -v, --version string                  Version of the chaincode specified in install/instantiate/upgrade commands
# -o, --orderer string                  Ordering service endpoint
# -C, --channelID string                The channel on which this command should be executed
# -c, --ctor string                     Constructor message for the chaincode in JSON format (default "{}")
# --policy                              The endorsement policy associated to this chaincode

# Next, let’s confirm that the chaincode is properly installed on the peer.
$ peer chaincode list --installed

# Second, let’s confirm the instantiation on our channel:
$ peer chaincode list --instantiated -C $CHANNEL_NAME
~~~
