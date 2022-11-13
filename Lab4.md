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

$ peer chaincode install -n deal -l node -p ../../../chaincode/deal -v 1.0.1
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
$ peer chaincode install -n deal -l node -p ../../../chaincode/deal -v 1.0.1
# -l, --lang                           Language of the chaincode
# -n, --name string                    Name of the chaincode
# -p, --path string                    Path to chaincode
# -v, --version string                 Version of the chaincode specified in install/instantiate/upgrade commands


# Novamente, vamos verificar o canal instalado
$ peer chaincode list --installed

# Se tudo correu bem o resultado será:
Get installed chaincodes on peer:
Name: deal, Version: 1.0, Path: github.com/sacc, Id: cd57c948631f3241d19204c3502f2e779ed2a3e1e33e40a9592cf452f9c31a9a
~~~

### Agora vamos instância nosso Chaincode
Os aplicativos interagem com o ledger blockchain por meio de ```chaincode```. Como tal, precisamos instalar o chaincode em cada peer que irá executar e endossar nossas transações, e então instanciar o chaincode no canal.


~~~sh
# Member Service Provider config path to certificates
$ export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/produtor.sampledomain.com/users/Admin\@produtor.sampledomain.com/msp/

# Define member service provider
$ export CORE_PEER_LOCALMSPID="ProdutorMSP"

# Define peer, qual iremos instalar o certificado
$ export CORE_PEER_ADDRESS=peer0.produtor.sampledomain.com:7051

$ export CHANNEL_NAME=sampledomain-channel
~~~
Em seguida, instancie o chaincode no canal. Isso inicializará o chaincode no canal, definirá a política de endosso para o chaincode e iniciará um contêiner de chaincode para o peer de destino. Observe o argumento ```-P```. Esta é a nossa política onde especificamos o nível de endosso necessário para que uma transação contra este chaincode seja validada.

No comando abaixo, você notará que especificamos nossa política como -P "AND ('ProdutorMSP.peer','TransportadorMSP.peer')". Isso significa que precisamos de “endosso” de um par pertencente a "Produtor" AND "Transportador" (ou seja, dois endossos). Se alterássemos a sintaxe para OR, precisaríamos apenas de um endosso.


> NOTA: A instanciação do chaincode do Node.js levará aproximadamente um minuto. O comando não está suspenso; em vez disso, está instalando a camada fabric-shim enquanto a imagem está sendo compilada.

~~~sh
# certifique-se de substituir a variável de ambiente $CHANNEL_NAME se você não a exportou
# observe que devemos passar o sinalizador "-l" após o nome do chaincode para identificar o idioma

$ peer chaincode instantiate \
	-o orderer.sampledomain.com:7050 \
	--tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/sampledomain.com/orderers/orderer.sampledomain.com/msp/tlscacerts/tlsca.sampledomain.com-cert.pem \
	-C $CHANNEL_NAME \
	-n deal \
	-l node \
	-v 1.0.1 \
	-c '{"Args":["init","a", "100", "b","200"]}' \
	-P "OR('Produtor.peer','Produtor.member')"
#	-P "OR ('ProdutorMSP.peer','TransportadorMSP.peer')"

~~~

Consulte a documentação de políticas de endosso para obter mais detalhes sobre a implementação de políticas.

Se você quiser que peers adicionais interajam com o ledger, precisará juntá-los ao canal e instalar o mesmo nome, versão e idioma da fonte do chaincode no sistema de arquivos do peer apropriado. Um contêiner de chaincode será lançado para cada peer assim que eles tentarem interagir com esse chaincode específico. Novamente, esteja ciente do fato de que as imagens Node.js serão mais lentas para compilar.

Uma vez que o chaincode tenha sido instanciado no canal, podemos renunciar ao sinalizador l. Precisamos apenas passar o identificador do canal e o nome do chaincode.

#### Query
#### Invoke
#### Query
-------------------------------------------------------------------------------------------------------------------





















Definido as variáveis. Vamos instânciar nosso chaincode usando o comando ``peer chaincode instantiate``, esse comando inicia o ciclo de vida (lifecycle) para o chaincode. Ele pode demorar um pouco, apenas espere.
~~~sh
# Atenção, não execute esse comando, vamos instanciar nosso chaincode com policies
# Vide: Endorsement Policies para executar chaincode
# Esse código está aqui apenas pra consulta
$ peer chaincode instantiate \
    -n deal \
    -l node \
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
    -n deal \
    -l node \
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
