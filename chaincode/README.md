# Passo a Passo - Instalação Chaincode

Obs.: Essa passo-a-passo só funcionará se a Organização "Transportador" estiver já implementada. Verificar isso antes de começar esse passo a passo

### PASSO 1: atualizar CLI e acessá-lo
~~~sh
# Atualiza cliente fabric-tool
$ docker-compose -f docker-compose.yaml up -d cli

# Acessar contêiner
$ docker exec -it cli bash
~~~

### PASSO 2: Criação da Pasta (estando dentro de "CLI")
~~~sh
$ cd ../../../
$ cd chaincode
$ ls -l
$ mkdir chaincode_example02_teste
$ cd chaincode_example02_teste
	
# create a new node project
$ npm init
	
# install fabric-shim at main branch
# $ npm install fabric-shim@2.4.1
	
# or using the released version
$ npm install fabric-shim
	
$ touch chaincode_example02.js
~~~

### PASSO 3: criar e editar arquivos
~~~sh~~~
#criar arquivo com código do chaincode
$ cat > chaincode_example02.js
# ao apertar "enter" a partir da linha de baixo já pode escrever.
# escrever ou colar código do chaincode aqui (verificar em "fabric-samples/chaincode/chaincode_example02/node/chaincode_example02.js")
# para sair e salvar, é só apertar Ctrl+Z

#para verificar arquivo criado
$ ls -l

#criar arquivo 'package.json'
$ rm package.json
$ cat > package.json
# escrever ou colar "package.json" aqui
# escrever ou colar código do chaincode aqui (verificar em "fabric-samples/chaincode/chaincode_example02/node/package.json")
# IMPORTANTE: atenção com a "versão" do código 
# para sair e salvar, é só apertar ctrl+Z

#para verificar arquivo criado
$ ls -l

#para ler qualquer arquivo, basta usar o comando abaixo
$ cat chaincode_example02.js
$ cat package.json
~~~

### PASSO 4: instalar Chaincode - parte 1 
~~~sh
# focar em instalar Chaincode para PEER0 de Produtor e Transportador

#voltar para onde o CLI está: "hyperledger/fabric/peer"
$ cd ../../hyperledger/fabric/peer

	
#===== PEER0 de Produtor =====#
# Preparar Ambiente para a instalação em PEER0
# Configurando variáveis de Ambiente 
$ export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/produtor.sampledomain.com/users/Admin\@produtor.sampledomain.com/msp/
$ export CORE_PEER_LOCALMSPID=ProdutorMSP
$ export CORE_PEER_ADDRESS=peer0.produtor.sampledomain.com:7051

# Antes de instalar, faça uma verificação.
$ peer chaincode list --installed
# Se as variáreis foram definidas corretamente teremos o seguinte resultado:
#	Get installed chaincodes on peer:

# para instalar, o comando que passaremos será esse:
$ peer chaincode install \
	-n chaincode_example02 \
	-l node \
	-p ../../../chaincode/chaincode_example02_teste \
	-v 1.0.0

# o retorno deve ser parecido com isso
#	Installed remotely response:<status:200 payload:"OK" >


# Para visualizar o chaincode instalado execute o comando:
$ peer chaincode list --installed
# Se tudo correr bem, o resultado será parecido com esse:
#	Get installed chaincodes on peer:
#	Name: chaincode_example02, Version: 1.0.0, Path: ../../../chaincode/chaincode_example02_teste, Id: 6748193f695db02e265fe58f9cc614dd4b3145e4d2f7a11683111b09c5c45f94

# Quando instanciamos o chaincode no canal, a política de endosso será definida para exigir endossos de um par em Org1 e Org2. Portanto, também precisamos instalar o chaincode em um par em Org2.
#===== PEER0 de Transportador =====#
# Preparar Ambiente para a instalação em PEER0
# Configurando variáveis de Ambiente 
$ export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/transportador.sampledomain.com/users/Admin\@transportador.sampledomain.com/msp/
$ export CORE_PEER_LOCALMSPID=TransportadorMSP
$ export CORE_PEER_ADDRESS=peer0.transportador.sampledomain.com:7051
$ CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/transportador.sampledomain.com/peers/peer0.transportador.sampledomain.com/tls/ca.crt

# Antes de instalar, faça uma verificação.
$ peer chaincode list --installed
# Se as variáreis foram definidas corretamente teremos o seguinte resultado:
#	Get installed chaincodes on peer:


# para instalar, o comando que passaremos será esse:
$ peer chaincode install \
	-n chaincode_example02 \
	-l node \
	-p ../../../chaincode/chaincode_example02_teste \
	-v 1.0.0

# o retorno deve ser parecido com isso
#	Installed remotely response:<status:200 payload:"OK" >

# Para visualizar o chaincode instalado execute o comando:
$ peer chaincode list --installed
# Se tudo correr bem, o resultado será parecido com esse:
#	Get installed chaincodes on peer:
#	Name: chaincode_example02, Version: 1.0.0, Path: ../../../chaincode/chaincode_example02_teste, Id: 6748193f695db02e265fe58f9cc614dd4b3145e4d2f7a11683111b09c5c45f94
~~~

### PASSO 5: Instanciar o Chaincode - parte 1
~~~sh
# primeiro: precisamos instalar o chaincode em cada peer que irá executar e endossar nossas transações
# segundo: instanciar nosso chaincode no canal
# qualquer PEER pode ser usado para essa Instanciação
# para esse caso, vamos usar o peer0

#===== PEER0 de Produtor =====#
# Configurando Variáveis de Ambiente para "PEER0" para Produtor
$ export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/produtor.sampledomain.com/users/Admin\@produtor.sampledomain.com/msp/
$ export CORE_PEER_LOCALMSPID=ProdutorMSP
$ export CORE_PEER_ADDRESS=peer0.produtor.sampledomain.com:7051
$ export CHANNEL_NAME=sampledomain-channel

# Antes de instalar, faça uma verificação.
$ peer chaincode list --instantiated -C $CHANNEL_NAME
# Se as variáreis foram definidas corretamente teremos o seguinte resultado:
#	Get instantiated chaincodes on channel sampledomain-channel:

$ peer chaincode instantiate \
	-o orderer.sampledomain.com:7050 \
	-C $CHANNEL_NAME \
	-n chaincode_example02 \
	-l node \
	-v 1.0.0 \
	-c '{"Args":["init","a", "100", "b","200"]}' \
	-P "AND ('ProdutorMSP.peer','TransportadorMSP.peer')"

# Para confirmar a Instanciação no nosso Canal
$ peer chaincode list --instantiated -C $CHANNEL_NAME
# Se as variáreis foram definidas corretamente teremos o seguinte resultado:
#	Get instantiated chaincodes on channel sampledomain-channel:
#	Name: chaincode_example02, Version: 1.0.0, Path: ../../../chaincode/chaincode_example02_teste, Escc: escc, Vscc: vscc

~~~	
O chaincode é então “instanciado” no $CHANNEL_NAME. A instanciação adiciona o chaincode ao canal, inicia o contêiner para o peer de destino e inicializa os pares de valores-chave associados ao chaincode. Os valores iniciais para este exemplo são [“a”,”100” “b”,”200”]. Essa “instanciação” resulta em um CONTAINER com o nome "dev-peer0.produtor.sampledomain.com-chaincode_example02-1.0.0" iniciando.
		# IMPORTANTE: esse deve ser o processo de DEPLOY do SMART CONTRACT !!!!
		# Atenção ao "logs" desse container
		# para executar comando abaixo, deve sair do CLI (apertar Ctrl+D)
		$ docker logs dev-peer0.produtor.sampledomain.com-chaincode_example02-1.0.0

		#a saida deverá ser mais ou menos essa
			> chaincode_example02@1.0.0 start /usr/local/src
			> node chaincode_example02.js "--peer.address" "peer0.produtor.sampledomain.com:7052"

			2022-11-15T18:59:55.159Z info [shim:lib/chaincode.js]                             Registering with peer peer0.produtor.sampledomain.com:7052 as chaincode "chaincode_example02:1.0.0"

			2022-11-15T18:59:55.224Z info [shim:lib/handler.js]                               Successfully registered with peer node. State transferred to "established"
					
			2022-11-15T18:59:55.226Z info [shim:lib/handler.js]                               Successfully established communication with peer node. State transferred to "ready"
			========= example02 Init =========
			{ fcn: 'init', params: [ 'a', '100', 'b', '200' ] }
					
			2022-11-15T18:59:55.267Z info [shim:lib/handler.js]                               [sampledomain-channel-bf535583] Calling chaincode Init() succeeded. Sending COMPLETED message back to peer


		# esse é o tão famoso DEPLOY do SmartContract!!! 
			--> será???
~~~

### PASSO 6: Verificar métodos do Chaincode
~~~sh
# Vamos consultar o valor de a para ter certeza de que o chaincode foi instanciado corretamente e o banco de dados de estado foi preenchido.
	$ peer chaincode query \
		-C $CHANNEL_NAME \
		-n chaincode_example02 \
		-c '{"Args":["query","a"]}'

	# Agora vamos mover 10 de "a" para "b". Esta transação cortará um novo bloco e atualizará o banco de dados de estado. A sintaxe para invocar é a seguinte:
	$ peer chaincode invoke \
		-o orderer.sampledomain.com:7050 \
		-C $CHANNEL_NAME \
		-n chaincode_example02 \
		--peerAddresses peer0.produtor.sampledomain.com:7051 \
		--peerAddresses peer0.transportador.sampledomain.com:7051 \
		-c '{"Args":["invoke","a","b","10"]}'

		#DICA: olhar o "log" do container criado lá no Docker Desktop
		# --> olhar o "console.info"

	# Vamos confirmar que nossa invocação anterior foi executada corretamente. Inicializamos a chave a com um valor de 100 e apenas removemos 10 com nossa invocação anterior. Portanto, uma consulta em um deve retornar 90. A sintaxe para consulta é a seguinte:
	$ peer chaincode query \
		-C $CHANNEL_NAME \
		-n chaincode_example02 \
		-c '{"Args":["query","a"]}'

	# a saida deve ser:
		Query Result: 90


	## ATENÇÃO aos novos containers que foram sendo criados!!!

### PASSO 7: instalar Chaincode - parte 2 

	#Pela documentação, fala sobre instalar Chaincode no PEER1 de Transportador (achei estranho...)

	# Não necessita instanciar (pois já está instanciado no canal)

	#voltar para onde o CLI está: "hyperledger/fabric/peer"
	$ cd ../../hyperledger/fabric/peer

	#===== PEER1 de Transportador =====#
		# Preparar Ambiente para a instalação em PEER0
		# Configurando variáveis de Ambiente 
		$ export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/transportador.sampledomain.com/users/Admin\@transportador.sampledomain.com/msp/

		$ export CORE_PEER_LOCALMSPID=TransportadorMSP
		
		$ export CORE_PEER_ADDRESS=peer1.transportador.sampledomain.com:7051
		
		$ export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/transportador.sampledomain.com/peers/peer1.transportador.sampledomain.com/tls/ca.crt

		# Antes de instalar, faça uma verificação.
		$ peer chaincode list --installed
		# Se as variáreis foram definidas corretamente teremos o seguinte resultado:
			Get installed chaincodes on peer:


		# para instalar, o comando que passaremos será esse:
		$ peer chaincode install \
				-n chaincode_example02 \
				-l node \
				-p ../../../chaincode/chaincode_example02_teste \
				-v 1.0.0
			# o retorno deve ser parecido com isso
			Installed remotely response:<status:200 payload:"OK" >

		# Para visualizar o chaincode instalado execute o comando:
		$ peer chaincode list --installed
		# Se tudo correr bem, o resultado será parecido com esse:
			Name: chaincode_example02, Version: 1.0.0, Path: ../../../chaincode/chaincode_example02_teste, Id: 6748193f695db02e265fe58f9cc614dd4b3145e4d2f7a11683111b09c5c45f94

	# Peer1 de Produtor deixa em stand-by no momento
			#===== PEER1 de Produtor =====#
				# Preparar Ambiente para a instalação em PEER1
				# Configurando variáveis de Ambiente 
				$ export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/produtor.sampledomain.com/users/Admin\@produtor.sampledomain.com/msp/
				$ export CORE_PEER_LOCALMSPID=ProdutorMSP
				$ export CORE_PEER_ADDRESS=peer1.produtor.sampledomain.com:8051
				$ export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/transportador.sampledomain.com/peers/peer1.transportador.sampledomain.com/tls/ca.crt

				# Antes de instalar, faça uma verificação.
				$ peer chaincode list --installed
				# Se as variáreis foram definidas corretamente teremos o seguinte resultado:
					Get installed chaincodes on peer:


				# para instalar, o comando que passaremos será esse:
				$ peer chaincode install \
						-n chaincode_example02 \
						-l node \
						-p ../../../chaincode/chaincode_example02_teste \
						-v 1.0.0
					# o retorno deve ser parecido com isso
					Installed remotely response:<status:200 payload:"OK" >

				# Para visualizar o chaincode instalado execute o comando:
				$ peer chaincode list --installed
				# Se tudo correr bem, o resultado será parecido com esse:
					Get installed chaincodes on peer:
					Name: deal, Version: 1.0, Path: github.com/sacc, Id: cd57c948631f3241d19204c3502f2e779ed2a3e1e33e40a9592cf452f9c31a9a
~~~

### PASSO 8: Verificar métodos do Chaincode - parte 2
	# peer1 em Transportador deve primeiro ingressar no canal antes de poder responder às consultas. O canal pode ser associado emitindo o seguinte comando:

	$ export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/transportador.sampledomain.com/users/Admin@transportador.sampledomain.com/msp CORE_PEER_ADDRESS=peer1.transportador.sampledomain.com:7051 
	$ export CORE_PEER_LOCALMSPID="TransportadorMSP" 
	$ export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/transportador.sampledomain.com/peers/peer1.transportador.sampledomain.com/tls/ca.crt peer channel join -b mychannel.block


	# Após o retorno do comando join, a "consulta" pode ser emitida. A sintaxe para "consulta" é a seguinte.

	# Vamos consultar o valor de a para ter certeza de que o chaincode foi instanciado corretamente e o banco de dados de estado foi preenchido.
	$ peer chaincode query \
		-C $CHANNEL_NAME \
		-n chaincode_example02 \
		-c '{"Args":["query","a"]}'

	# Agora vamos mover 10 de "a" para "b". Esta transação cortará um novo bloco e atualizará o banco de dados de estado. A sintaxe para invocar é a seguinte:
	$ peer chaincode invoke \
		-o orderer.sampledomain.com:7050 \
		-C $CHANNEL_NAME \
		-n chaincode_example02 \
		--peerAddresses peer0.produtor.sampledomain.com:7051 \
		--peerAddresses peer0.transportador.sampledomain.com:7051 \
		-c '{"Args":["invoke","a","b","10"]}'







		# ATENÇÃO: observe a relação que ocorre entre "Produtor" e "Transportador"


	# Vamos confirmar que nossa invocação anterior foi executada corretamente. Inicializamos a chave a com um valor de 100 e apenas removemos 10 com nossa invocação anterior. Portanto, uma consulta em um deve retornar 90. A sintaxe para consulta é a seguinte:
	$ peer chaincode query \
		-C $CHANNEL_NAME \
		-n chaincode_example02 \
		-c '{"Args":["query","a"]}'

	# a saida deve ser:
		Query Result: 90


	## ATENÇÃO aos novos containers que foram sendo criados!!!

PASSO 9: Logs
	# "logs" servem para VISUALIZAR essas transações

	# Verifique os logs do contêiner do CLI Docker.
	$ docker logs -f cli

	#possivelmente, a saida será parecida com essa:
		2017-05-16 17:08:01.366 UTC [msp] GetLocalMSP -> DEBU 004 Returning existing local MSP
		2017-05-16 17:08:01.366 UTC [msp] GetDefaultSigningIdentity -> DEBU 005 Obtaining default signing identity
		2017-05-16 17:08:01.366 UTC [msp/identity] Sign -> DEBU 006 Sign: plaintext: 0AB1070A6708031A0C08F1E3ECC80510...6D7963631A0A0A0571756572790A0161
		2017-05-16 17:08:01.367 UTC [msp/identity] Sign -> DEBU 007 Sign: digest: E61DB37F4E8B0D32C9FE10E3936BA9B8CD278FAA1F3320B08712164248285C54
		Query Result: 90
		2017-05-16 17:08:15.158 UTC [main] main -> INFO 008 Exiting.....


	# para visualizar os logs dos Chaincodes 
	# Inspecione os contêineres de chaincode individuais para ver as transações separadas executadas em cada contêiner. Aqui está a saída combinada de cada contêiner:

	$ docker logs dev-peer0.transportador.sampledomain.com-chaincode_example02-1.0.0
		04:30:45.947 [BCCSP_FACTORY] DEBU : Initialize BCCSP [SW]
		ex02 Init
		Aval = 100, Bval = 200

	$ docker logs dev-peer0.produtor.sampledomain.com-chaincode_example02-1.0.0
		04:31:10.569 [BCCSP_FACTORY] DEBU : Initialize BCCSP [SW]
		ex02 Invoke
		Query Response:{"Name":"a","Amount":"100"}
		ex02 Invoke
		Aval = 90, Bval = 210

	$ docker logs dev-peer1.transportador.sampledomain.com-chaincode_example02-1.0.0
		04:31:30.420 [BCCSP_FACTORY] DEBU : Initialize BCCSP [SW]
		ex02 Invoke
		Query Response:{"Name":"a","Amount":"90"}



	#Para uma informação mais gráfica e bonita, veja o Docker Desktop





#### IMPORTANTE
um resumo de tudo isso
	https://hyperledger-fabric.readthedocs.io/en/release-1.4/build_network.html#what-s-happening-behind-the-scenes




==========================================================================================
PARTE 2: fazer o mesmo processo acima para Marbles02
