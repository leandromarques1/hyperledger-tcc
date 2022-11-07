# Lab 7

## Multi-Organizational
Neste laboratório iremos adicionar nossa segunda organização em nossa rede.

Para que seja adicionada a nova organização e seus respectivos peers será necessário alterar os arquivos ``crypto-config.yaml``, ``configtx.yaml`` e ``docker-compose.yaml`` 

Interessante ter o Lab1 como referencia para essa parte

> crypto-config.yaml
~~~txt
# ---------------------------------------------------------------------------
# "OrdererOrgs" - Definition of organizations managing orderer nodes
# ---------------------------------------------------------------------------
  OrdererOrgs:
    # ---------------------------------------------------------------------------
    # Orderer
    # ---------------------------------------------------------------------------
    - Name: Orderer
      Domain: sampledomain.com    
  
      # ---------------------------------------------------------------------------
      # "Specs" - See PeerOrgs below for complete description
      # ---------------------------------------------------------------------------
      Specs:
        - Hostname: orderer
  
  # ---------------------------------------------------------------------------
  # "PeerOrgs" - Definition of organizations managing peer nodes
  # ---------------------------------------------------------------------------
  PeerOrgs:
    # ---------------------------------------------------------------------------
    # Produtor
    # ---------------------------------------------------------------------------
    - Name: Produtor
      Domain: produtor.sampledomain.com
      
      # ---------------------------------------------------------------------------
      # "Specs"
      # ---------------------------------------------------------------------------
      # Uncomment this section to enable the explicit definition of hosts in your
      # configuration.  Most users will want to use Template, below
      #
      # Specs is an array of Spec entries.  Each Spec entry consists of two fields:
      #   - Hostname:   (Required) The desired hostname, sans the domain.
      #   - CommonName: (Optional) Specifies the template or explicit override for
      #                 the CN.  By default, this is the template:
      #
      #                              "{{.Hostname}}.{{.Domain}}"
      #
      #                 which obtains its values from the Spec.Hostname and
      #                 Org.Domain, respectively.
      # ---------------------------------------------------------------------------
      # Specs:
      #   - Hostname: foo # implicitly "foo.produtor.example.com"
      #     CommonName: foo27.org5.example.com # overrides Hostname-based FQDN set above
      #   - Hostname: bar
      #   - Hostname: baz
      
      # ---------------------------------------------------------------------------
      # "Template"
      # ---------------------------------------------------------------------------
      # Allows for the definition of 1 or more hosts that are created sequentially
      # from a template. By default, this looks like "peer%d" from 0 to Count-1.
      # You may override the number of nodes (Count), the starting index (Start)
      # or the template used to construct the name (Hostname).
      #
      # Note: Template and Specs are not mutually exclusive.  You may define both
      # sections and the aggregate nodes will be created for you.  Take care with
      # name collisions
      # ---------------------------------------------------------------------------
      Template:
        Count: 2
        # Start: 5
        # Hostname: {{.Prefix}}{{.Index}} # default
      
      # ---------------------------------------------------------------------------
      # "Users"
      # ---------------------------------------------------------------------------
      # Count: The number of user accounts _in addition_ to Admin
      # ---------------------------------------------------------------------------
      Users:
        Count: 1
    
    - Name: Transportador
      Domain: transportador.sampledomain.com
      
      EnableNodeOUs: true
      # ---------------------------------------------------------------------------
      # "Specs"
      # ---------------------------------------------------------------------------
      # Uncomment this section to enable the explicit definition of hosts in your
      # configuration.  Most users will want to use Template, below
      #
      # Specs is an array of Spec entries.  Each Spec entry consists of two fields:
      #   - Hostname:   (Required) The desired hostname, sans the domain.
      #   - CommonName: (Optional) Specifies the template or explicit override for
      #                 the CN.  By default, this is the template:
      #
      #                              "{{.Hostname}}.{{.Domain}}"
      #
      #                 which obtains its values from the Spec.Hostname and
      #                 Org.Domain, respectively.
      # ---------------------------------------------------------------------------
      # Specs:
      #   - Hostname: foo # implicitly "foo.produtor.example.com"
      #     CommonName: foo27.org5.example.com # overrides Hostname-based FQDN set above
      #   - Hostname: bar
      #   - Hostname: baz
      
      # ---------------------------------------------------------------------------
      # "Template"
      # ---------------------------------------------------------------------------
      # Allows for the definition of 1 or more hosts that are created sequentially
      # from a template. By default, this looks like "peer%d" from 0 to Count-1.
      # You may override the number of nodes (Count), the starting index (Start)
      # or the template used to construct the name (Hostname).
      #
      # Note: Template and Specs are not mutually exclusive.  You may define both
      # sections and the aggregate nodes will be created for you.  Take care with
      # name collisions
      # ---------------------------------------------------------------------------
      Template:
        Count: 2
        # Start: 5
        # Hostname: {{.Prefix}}{{.Index}} # default
      
      # ---------------------------------------------------------------------------
      # "Users"
      # ---------------------------------------------------------------------------
      # Count: The number of user accounts _in addition_ to Admin
      # ---------------------------------------------------------------------------
      Users:
        Count: 1
~~~

> configtx.yaml
~~~txt
################################################################################
#
#   Section: Organizations
#
#   - This section defines the different organizational identities which will
#   be referenced later in the configuration.
#
################################################################################
Organizations:
   
    - &OrdererOrg
        # DefaultOrg defines the organization which is used in the sampleconfig
        # of the fabric.git development environment    
        Name: OrdererOrg

        # ID to load the MSP definition as
        ID: OrdererMSP

        # MSPDir is the filesystem path which contains the MSP configuration
        MSPDir: crypto-config/ordererOrganizations/sampledomain.com/msp

    - &Produtor
        # DefaultOrg defines the organization which is used in the sampleconfig
        # of the fabric.git development environment 
        Name: ProdutorMSP

        # ID to load the MSP definition as
        ID: ProdutorMSP

        MSPDir: crypto-config/peerOrganizations/produtor.sampledomain.com/msp
        
        AnchorPeers:
            # AnchorPeers defines the location of peers which can be used
            # for cross org gossip communication.  Note, this value is only
            # encoded in the genesis block in the Application section context
            - Host: peer1.produtor.sampledomain.com
              Port: 7051

    - &Transportador
        # DefaultOrg defines the organization which is used in the sampleconfig
        # of the fabric.git development environment 
        Name: TransportadorMSP

        # ID to load the MSP definition as
        ID: TransportadorMSP

        MSPDir: crypto-config/peerOrganizations/transportador.sampledomain.com/msp
        
        AnchorPeers:
            # AnchorPeers defines the location of peers which can be used
            # for cross org gossip communication.  Note, this value is only
            # encoded in the genesis block in the Application section context
            - Host: peer1.transportador.sampledomain.com
              Port: 7051

################################################################################
#
#   SECTION: Application
#
#   - This section defines the values to encode into a config transaction or
#   genesis block for application related parameters
#
################################################################################
Application: &ApplicationDefaults

    # Organizations is the list of orgs which are defined as participants on
    # the application side of the network
    Organizations:

################################################################################
#
#   SECTION: Orderer
#
#   - This section defines the values to encode into a config transaction or
#   genesis block for orderer related parameters
#
################################################################################
Orderer: &OrdererDefaults

    # Orderer Type: The orderer implementation to start
    # Available types are "solo" and "kafka"
    OrdererType: solo

    Addresses:
        - orderer.sampledomain.com:7050

    # Batch Timeout: The amount of time to wait before creating a batch
    BatchTimeout: 2s

    # Batch Size: Controls the number of messages batched into a block
    BatchSize:

        # Max Message Count: The maximum number of messages to permit in a batch
        MaxMessageCount: 10

        # Absolute Max Bytes: The absolute maximum number of bytes allowed for
        # the serialized messages in a batch.
        AbsoluteMaxBytes: 99 MB

        # Preferred Max Bytes: The preferred maximum number of bytes allowed for
        # the serialized messages in a batch. A message larger than the preferred
        # max bytes will result in a batch larger than preferred max bytes.
        PreferredMaxBytes: 512 KB

    Kafka:
        # Brokers: A list of Kafka brokers to which the orderer connects
        # NOTE: Use IP:port notation
        Brokers:
            - 127.0.0.1:9092

    # Organizations is the list of orgs which are defined as participants on
    # the orderer side of the network
    Organizations:

################################################################################
#
#   Profile
#
#   - Different configuration profiles may be encoded here to be specified
#   as parameters to the configtxgen tool
#
################################################################################
Profiles:

    OrgsOrdererGenesis:
        Orderer:
            <<: *OrdererDefaults
            Organizations:
                - *OrdererOrg
        Consortiums:
            SampleConsortium:
                Organizations:
                    - *Produtor
    OrgChannel:
        Consortium: SampleConsortium
        Application:
            <<: *ApplicationDefaults
            Organizations:
                - *Produtor
~~~

> docker-compose.yaml
~~~txt
# Copyright 2018 Villa Labs All Rights Reserved
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# 
version: '2'

networks:
  sampleNetwork:

volumes:
  ca.produtor.sampledomain.com:
  ca.transportador.sampledomain.com:
  orderer.sampledomain.com:
  peer0.produtor.sampledomain.com:
  couchdb.peer0.produtor.sampledomain.com:
  peer1.produtor.sampledomain.com:
  couchdb.peer1.produtor.sampledomain.com:
  peer0.transportador.sampledomain.com:
  couchdb.peer0.transportador.sampledomain.com:
  peer1.transportador.sampledomain.com:
  couchdb.peer1.transportador.sampledomain.com:

services:
  ca.produtor.sampledomain.com:
    container_name: ca.produtor.sampledomain.com
    image: hyperledger/fabric-ca
    environment:
      - FABRIC_CA_HOME=/etc/hyperledger/fabric-ca-server
      - FABRIC_CA_SERVER_CA_NAME=ca.produtor.sampledomain.com
      - FABRIC_CA_SERVER_CA_CERTFILE=/etc/hyperledger/fabric-ca-server-config/ca.produtor.sampledomain.com-cert.pem
      - FABRIC_CA_SERVER_CA_KEYFILE=/etc/hyperledger/fabric-ca-server-config/42215d11328cb5dcc2054e4b4652a4174de4bb10e77e593d371a8a178da365a0_sk
    ports:
      - "7054:7054"
    command: sh -c 'fabric-ca-server start -b admin:adminpw'
    volumes:
      - ./crypto-config/peerOrganizations/produtor.sampledomain.com/ca/:/etc/hyperledger/fabric-ca-server-config
    networks:
      - sampleNetwork
  
  ca.transportador.sampledomain.com:
    container_name: ca.transportador.sampledomain.com
    image: hyperledger/fabric-ca
    environment:
      - FABRIC_CA_HOME=/etc/hyperledger/fabric-ca-server
      - FABRIC_CA_SERVER_CA_NAME=ca.transportador.sampledomain.com
      - FABRIC_CA_SERVER_CA_CERTFILE=/etc/hyperledger/fabric-ca-server-config/ca.transportador.sampledomain.com-cert.pem
      - FABRIC_CA_SERVER_CA_KEYFILE=/etc/hyperledger/fabric-ca-server-config/42215d11328cb5dcc2054e4b4652a4174de4bb10e77e593d371a8a178da365a0_sk
    ports:
      - "8054:7054"
    command: sh -c 'fabric-ca-server start -b admin:adminpw'
    volumes:
      - ./crypto-config/peerOrganizations/transportador.sampledomain.com/ca/:/etc/hyperledger/fabric-ca-server-config
    networks:
      - sampleNetwork

  orderer.sampledomain.com:
    container_name: orderer.sampledomain.com
    image: hyperledger/fabric-orderer
    environment:
      - FABRIC_LOGGING_SPEC=info
      - ORDERER_GENERAL_LISTENADDRESS=0.0.0.0
      - ORDERER_GENERAL_GENESISMETHOD=file
      - ORDERER_GENERAL_GENESISFILE=/etc/hyperledger/configtx/genesis.block
      - ORDERER_GENERAL_LOCALMSPID=OrdererMSP
      - ORDERER_GENERAL_LOCALMSPDIR=/etc/hyperledger/msp/orderer/msp
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric/orderer
    command: orderer
    ports:
      - 7050:7050
    volumes:
      - ./channel-artifacts/:/etc/hyperledger/configtx
      - ./crypto-config/ordererOrganizations/sampledomain.com/orderers/orderer.sampledomain.com/:/etc/hyperledger/msp/orderer
      - ./crypto-config/peerOrganizations/produtor.sampledomain.com/peers/peer0.produtor.sampledomain.com/:/etc/hyperledger/msp/peerProdutor
    networks:
      - sampleNetwork

  peer0.produtor.sampledomain.com:
    container_name: peer0.produtor.sampledomain.com
    image: hyperledger/fabric-peer
    environment:
      - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
      - CORE_PEER_ID=peer0.produtor.sampledomain.com
      - FABRIC_LOGGING_SPEC=info
      - CORE_CHAINCODE_LOGGING_LEVEL=info
      - CORE_PEER_LOCALMSPID=ProdutorMSP
      - CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/peer/
      - CORE_PEER_ADDRESS=peer0.produtor.sampledomain.com:7051
      - CORE_VM_DOCKER_HOSTCONFIG_NETWORKMODE=network_sampleNetwork
      - CORE_LEDGER_STATE_STATEDATABASE=CouchDB
      - CORE_LEDGER_STATE_COUCHDBCONFIG_COUCHDBADDRESS=couchdb.peer0.produtor.sampledomain.com:5984
      - CORE_LEDGER_STATE_COUCHDBCONFIG_USERNAME=peer0.produtor
      - CORE_LEDGER_STATE_COUCHDBCONFIG_PASSWORD=password
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric
    command: peer node start
    # command: peer node start --peer-chaincodedev=true
    ports:
      - 7051:7051
      - 7053:7053
    volumes:
      - /var/run/:/host/var/run/
      - ./crypto-config/peerOrganizations/produtor.sampledomain.com/peers/peer0.produtor.sampledomain.com/msp:/etc/hyperledger/msp/peer
      - ./crypto-config/peerOrganizations/produtor.sampledomain.com/users:/etc/hyperledger/msp/users
      - ./channel-artifacts:/etc/hyperledger/configtx
    depends_on:
      - orderer.sampledomain.com
      - couchdb.peer0.produtor.sampledomain.com
    networks:
      - sampleNetwork
  
  peer1.produtor.sampledomain.com:
    container_name: peer1.produtor.sampledomain.com
    image: hyperledger/fabric-peer
    environment:
      - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
      - CORE_PEER_ID=peer1.produtor.sampledomain.com
      - FABRIC_LOGGING_SPEC=info
      - CORE_CHAINCODE_LOGGING_LEVEL=info
      - CORE_PEER_LOCALMSPID=ProdutorMSP
      - CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/peer/
      - CORE_PEER_ADDRESS=peer1.produtor.sampledomain.com:7051
      - CORE_VM_DOCKER_HOSTCONFIG_NETWORKMODE=network_sampleNetwork
      - CORE_LEDGER_STATE_STATEDATABASE=CouchDB
      - CORE_LEDGER_STATE_COUCHDBCONFIG_COUCHDBADDRESS=couchdb.peer1.produtor.sampledomain.com:5984
      - CORE_LEDGER_STATE_COUCHDBCONFIG_USERNAME=peer1.produtor
      - CORE_LEDGER_STATE_COUCHDBCONFIG_PASSWORD=password
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric
    command: peer node start
    # command: peer node start --peer-chaincodedev=true
    ports:
      - 8051:7051
      - 8053:7053
    volumes:
      - /var/run/:/host/var/run/
      - ./crypto-config/peerOrganizations/produtor.sampledomain.com/peers/peer0.produtor.sampledomain.com/msp:/etc/hyperledger/msp/peer
      - ./crypto-config/peerOrganizations/produtor.sampledomain.com/users:/etc/hyperledger/msp/users
      - ./channel-artifacts:/etc/hyperledger/configtx
    depends_on:
      - orderer.sampledomain.com
      - couchdb.peer1.produtor.sampledomain.com
    networks:
      - sampleNetwork

  peer0.transportador.sampledomain.com:
    container_name: peer0.transportador.sampledomain.com
    image: hyperledger/fabric-peer
    environment:
      - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
      - CORE_PEER_ID=peer0.transportador.sampledomain.com
      - FABRIC_LOGGING_SPEC=info
      - CORE_CHAINCODE_LOGGING_LEVEL=info
      - CORE_PEER_LOCALMSPID=TransportadorMSP
      - CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/peer/
      - CORE_PEER_ADDRESS=peer0.transportador.sampledomain.com:7051
      - CORE_VM_DOCKER_HOSTCONFIG_NETWORKMODE=network_sampleNetwork
      - CORE_LEDGER_STATE_STATEDATABASE=CouchDB
      - CORE_LEDGER_STATE_COUCHDBCONFIG_COUCHDBADDRESS=couchdb.peer0.transportador.sampledomain.com:5984
      - CORE_LEDGER_STATE_COUCHDBCONFIG_USERNAME=peer0.transportador
      - CORE_LEDGER_STATE_COUCHDBCONFIG_PASSWORD=password
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric
    command: peer node start
    # command: peer node start --peer-chaincodedev=true
    ports:
      - 9051:7051
      - 9053:7053
    volumes:
      - /var/run/:/host/var/run/
      - ./crypto-config/peerOrganizations/transportador.sampledomain.com/peers/peer0.transportador.sampledomain.com/msp:/etc/hyperledger/msp/peer
      - ./crypto-config/peerOrganizations/transportador.sampledomain.com/users:/etc/hyperledger/msp/users
      - ./channel-artifacts:/etc/hyperledger/configtx
    depends_on:
      - orderer.sampledomain.com
      - couchdb.peer0.transportador.sampledomain.com
    networks:
      - sampleNetwork
  
  peer1.transportador.sampledomain.com:
    container_name: peer1.transportador.sampledomain.com
    image: hyperledger/fabric-peer
    environment:
      - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
      - CORE_PEER_ID=peer1.transportador.sampledomain.com
      - FABRIC_LOGGING_SPEC=info
      - CORE_CHAINCODE_LOGGING_LEVEL=info
      - CORE_PEER_LOCALMSPID=TransportadorMSP
      - CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/peer/
      - CORE_PEER_ADDRESS=peer1.transportador.sampledomain.com:7051
      - CORE_VM_DOCKER_HOSTCONFIG_NETWORKMODE=network_sampleNetwork
      - CORE_LEDGER_STATE_STATEDATABASE=CouchDB
      - CORE_LEDGER_STATE_COUCHDBCONFIG_COUCHDBADDRESS=couchdb.peer1.transportador.sampledomain.com:5984
      - CORE_LEDGER_STATE_COUCHDBCONFIG_USERNAME=peer1.transportador
      - CORE_LEDGER_STATE_COUCHDBCONFIG_PASSWORD=password
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric
    command: peer node start
    # command: peer node start --peer-chaincodedev=true
    ports:
      - 10051:7051
      - 10053:7053
    volumes:
      - /var/run/:/host/var/run/
      - ./crypto-config/peerOrganizations/transportador.sampledomain.com/peers/peer1.transportador.sampledomain.com/msp:/etc/hyperledger/msp/peer
      - ./crypto-config/peerOrganizations/transportador.sampledomain.com/users:/etc/hyperledger/msp/users
      - ./channel-artifacts:/etc/hyperledger/configtx
    depends_on:
      - orderer.sampledomain.com
      - couchdb.peer1.transportador.sampledomain.com
    networks:
      - sampleNetwork
      
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

  couchdb.peer0.transportador.sampledomain.com:
    container_name: couchdb.peer0.transportador.sampledomain.com
    environment:
      - COUCHDB_USER=peer0.transportador
      - COUCHDB_PASSWORD=password
    image: hyperledger/fabric-couchdb
    ports:
      - 7984:5984
    networks:
      - sampleNetwork

  couchdb.peer1.transportador.sampledomain.com:
    container_name: couchdb.peer1.transportador.sampledomain.com
    environment:
      - COUCHDB_USER=peer1.transportador
      - COUCHDB_PASSWORD=password
    image: hyperledger/fabric-couchdb
    ports:
      - 8984:5984
    networks:
      - sampleNetwork

  cli:
    container_name: cli
    image: hyperledger/fabric-tools
    tty: true
    environment:
      - GOPATH=/opt/gopath
      - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
      - CORE_LOGGING_LEVEL=info
      - CORE_PEER_ID=cli
      - CORE_PEER_ADDRESS=peer0.produtor.sampledomain.com:7051
      - CORE_PEER_LOCALMSPID=ProdutorMSP
      - CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/produtor.sampledomain.com/users/Admin@produtor.sampledomain.com/msp
      - CORE_CHAINCODE_KEEPALIVE=10
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric/peer
    command: /bin/bash
    volumes:
      - /var/run/:/host/var/run/
      - ../fabric-samples/chaincode/:/opt/gopath/src/github.com/
      - ./crypto-config:/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/
      - ./channel-artifacts:/opt/gopath/src/github.com/hyperledger/fabric/peer/config/
    networks:
        - sampleNetwork
   #depends_on:
   #   - orderer.sampledomain.com
   #   - peer0.produtor.sampledomain.com

~~~


~~~sh
# Extender nossa rede para mais uma organização
$ cryptogen extend --config=crypto-config.yaml

# Pastas para as orgs
$ ls -la ./crypto-config/peerOrganizations/

# Salve as definições da TransportadorMSP em arquivos json
$ configtxgen -printOrg TransportadorMSP > ./channel-artifacts/transportador_definition.json
~~~

Primeiro será necessário inicializar os contêineres para noss CA.
~~~sh
# Antes remova o contêiner usado pela definições antigas
$ docker rm -f ca.sampledomain.com

# Inicie as novas
$ docker-compose -f docker-compose.yaml up -d \
  ca.produtor.sampledomain.com ca.transportador.sampledomain.com

### Adicionar a Transportador

~~~h
$ docker exec -it cli bash
$ export CHANNEL_NAME=sampledomain-channel

$ peer channel fetch config blockFetchedConfig.pb \
  -o orderer.sampledomain.com:7050 -c $CHANNEL_NAME
  
# Decodifica para formato json
$ configtxlator proto_decode --input blockFetchedConfig.pb \
  --type common.Block | jq .data.data[0].payload.data.config > configBlock.json
  
# Modifica as configurações atuais para incluir as definições da Transportador
$ jq -s '.[0] * {"channel_group":{"groups":{"Application":{"groups":{"TransportadorMSP":.[1]}}}}}' \
  configBlock.json ./config/transportador_definition.json > configChanges.json

# Codifica para formato tx
$ configtxlator proto_encode --input configBlock.json \
  --type common.Config --output configBlock.pb

# Condifica as alterações
$ configtxlator proto_encode --input configChanges.json \
  --type common.Config --output configChanges.pb
  
$ configtxlator compute_update --channel_id $CHANNEL_NAME \
  --original configBlock.pb --updated configChanges.pb \
  --output configProposal_Transportador.pb
  
$ configtxlator proto_decode --input configProposal_Transportador.pb \
  --type common.ConfigUpdate | jq . > configProposal_Transportador.json
  
$ echo '{"payload":{"header":{"channel_header":{"channel_id":"sampledomain-channel","type":2}},"data":{"config_update":'$(cat configProposal_Transportador.json)'}}}' | jq . > transportadorSubmitReady.json

$ configtxlator proto_encode --input transportadorSubmitReady.json \
  --type common.Envelope --output transportadorSubmitReady.pb

$ peer channel signconfigtx -f transportadorSubmitReady.pb

$ peer channel update -f transportadorSubmitReady.pb \
  -o orderer.sampledomain.com:7050 -c $CHANNEL_NAME

# Pronto, vamos inicializar os contêiners para Transportador
$ docker-compose -f docker-compose.yaml up -d \
  couchdb.peer0.transportador.sampledomain.com peer0.transportador.sampledomain.com \
  couchdb.peer1.transportador.sampledomain.com peer1.transportador.sampledomain.com

$ docker ps -a --format "table {{.ID}}\t{{.Names}}\t{{.Status}}"
~~~

Vamos agora adicionar o canal existente aos peer's da Transportador
~~~sh
$ docker exec -it cli bash
$ export CHANNEL_NAME=sampledomain-channel

$ export CORE_PEER_LOCALMSPID=TransportadorMSP
$ export CORE_PEER_ADDRESS=peer0.transportador.sampledomain.com:7051
$ export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/transportador.sampledomain.com/users/Admin\@transportador.sampledomain.com/msp

$ peer channel fetch config TransportadorAddedConfig.pb \
  -o orderer.sampledomain.com:7050 -c $CHANNEL_NAME
$ peer channel fetch 0 TransportadorAddedConfig.block \
  -o orderer.sampledomain.com:7050 -c $CHANNEL_NAME
  
$ peer channel join -b TransportadorAddedConfig.block

$ peer chaincode install -l node -n deal -p ../../../chaincode/deal -v 1.0.1
  
# Vamos ao peer1
$ export CORE_PEER_ADDRESS=peer1.transportador.sampledomain.com:7051  
$ peer channel join -b TransportadorAddedConfig.block
$ peer chaincode install -l node -n deal -p ../../../chaincode/deal -v 1.0.1
  
$ peer chaincode list --installed

$ peer chaincode upgrade -n deal -v 1.0.2 -C $CHANNEL_NAME \
  -o orderer.sampledomain.com:7050 \
  --policy "AND('Produtor.peer', 'Transportador.peer', OR ('Produtor.admin'))" \
  -c '{"Args":["Mach", "50"]}'
  
$ peer chaincode list --installed && peer chaincode list \
  --instantiated -C $CHANNEL_NAME
~~~
