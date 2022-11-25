/*
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
*/


'use strict';
const shim = require('fabric-shim');
const util = require('util');


let Chaincode = class{
    async Init(stub) {
        let ret = stub.getFunctionAndParameters();
        console.info(ret);
        console.info('=========== Instantiated Supplychain Chaincode ===========');
        return shim.success();
    }
    
    async Invoke(stub) {
        console.info('Transaction ID: ' + stub.getTxID());
        console.info(util.format('Args: %j', stub.getArgs()));

        let ret = stub.getFunctionAndParameters();
        console.info(ret);
        
        let method = this[ret.fcn];
        if (!method) {
            console.log('no method of name:' + ret.fcn + ' found');
            throw new Error('Received unknown method ' + ret.fcn + ' invocation');
            //return shim.success();

        }
        try {
            let payload = await method(stub, ret.params);
            return shim.success(payload);
        } catch (err) {
            console.log(err);
            return shim.error(err);
        }
    }

    /*  #========= CRUD =========#
        --> CRUD representa as quatro principais operações realizadas em banco de dados, 
            seja no modelo relacional (SQL) ou não-relacional (NoSQL), facilitando no 
            processamento dos dados e na consistência e integridade das informações.
        --> São elas: Create, Read, Update, Delete
        --> "criação", "atualização" e "exclusão" devem ser encapsuladas no método "Invoke"
        --> leitura/consulta devem ser encapsuladas em "Query" 
    */

    //criar Produto
    async createProduct (stub, args){
        // → product_ID: nº de identificação do produto
        // → nodeName: nome do nó responsável por aquela etapa 
        //      (pode ser: "Produtor", "Transportador", "Vendedor")       
        // → productName: nome do Produto
        // → cnpj_produtor: CNPJ do Produtor

        //REGRA PRINCIPAL: somente o nó "Produtor" pode criar um produto

        // Passo 1: verificar se "args" foram passados de forma correta
        if (args.length != 4) {
            throw new Error('Incorrect number of arguments. Expecting 4');
        }
        // #==== Input sanitation ====#
        console.info('--- start init product ---');
        if (args[0].length <= 0) {
            throw new Error('1st argument must be a non-empty string');
        }
        if (args[1].length <= 0) {
            throw new Error('2nd argument must be a non-empty string');
        }
        if (args[2].length <= 0) {
            throw new Error('3rd argument must be a non-empty string');
        }
        if (args[3].length <= 0) {
            throw new Error('4th argument must be a non-empty string');
        }


        //Passo 2: Associando args a cada um dos parâmetros a serem trabalhados
        let product_ID = args[0];
        let nodeName = args[1];
        let productName = args[2];
        let cnpj_produtor = args[3];


        //Passo 3: verificar se Produto já existe dentro da Rede
        let exists = await stub.getState(product_ID);
        if (exists.toString()) {
            //se o produto já existe, então não precisa criar
            throw new Error(`The product ${product_ID} already exists`);
            //acabar o método "createProduct" por aqui!
        }
        // caso produto ainda NÃO EXISTE, ele poderá então ser criado


        // Passo 4: método exclusivo para "Produtor"
        // avaliar quem estará criando o produto
        if (nodeName == "produtor")
        {   
            //somente o"Produtor" pode criar o produto
            
            //conjunto de informações a serem criadas (JSON)
            //aqui entram alguns parâmetros passados na função
            let product = {};
            product.ID = product_ID;
            product.name = productName;
            product.CNPJ_Produtor = cnpj_produtor;
            product.CNPJ_Transportador = null; // se eu estou criando o Produto, não faz sentido usar o CNPJ do Transportador
            product.CNPJ_Vendedor = null; //da mesma forma, se eu tou criando o Produto, não faz sentido usar o CNPJ do Vendedor
            product.Data_Produtor = new Date().toLocaleString(); //pega a data e hora em que se está criando o produto, ou seja, o momento da passagem do lote pelo "Produtor";
            product.Data_Transportador = null; // data e hora da passagem do lote pelo "Transportador";
            product.Data_Vendedor = null; //data e hora da passagem do lote pelo "Vendedor".
            
            //transformar "product" de JSON em STRING, e depois colocar em Buffer
            const buffer = Buffer.from(JSON.stringify(product));
        
            //registrar informação criada dentro da rede (no LEDGER)
            await stub.putState(product_ID, buffer); //"stub": representação do Blockchain dentro do Código
            //     
            //// === Save product to state ===
            ////transformar "product" de JSON em STRING, e depois colocar em Buffer
            ////depois, registrar informação criada dentro da rede (no LEDGER)
            //await stub.putState(product_ID, Buffer.from(JSON.stringify(product))); //"stub": representação do Blockchain dentro do Código
            //let indexId = 'product_ID~productName'
            //let colorIdIndexKey = await stub.createCompositeKey(indexId, [product.product_ID, product.productName]);
            //console.info(colorIdIndexKey);
            ////  Save index entry to state. Only the key name is needed, no need to store a duplicate copy of the marble.
            ////  Note - passing a 'nil' value will effectively delete the key from state, therefore we pass null character as value
            //await stub.putState(colorIdIndexKey, Buffer.from('\u0000'));
            //// ==== Marble saved and indexed. Return success ====
            console.info('- end init product');


        }
        
        else
        {   
            //se não for "Produtor", não pode criar produto
            throw new Error(`The product can't maker by ${nodeName}`);
        }

    }
    
    //ver informações sobre o Produto
    async readProduct (stub, args){
        // → product_ID: nº de identificação do produto
        // *presente em "Produtor", "Transportador" e "Vendedor"
        // *parâmetro passado: product_ID
        // *return: dados do Produto
            
        // REGRA PRINCIPAL: qualquer nó poderá ter acesso às informações do Produto
        if (args.length != 1) {
            throw new Error('Incorrect number of arguments. Expecting product_ID to query');
        }

        let product_ID = args[0];
        if (!product_ID) {
            throw new Error(' product_ID must not be empty');
        }

        //verificar se o produto existe
        const exists = await stub.getState(product_ID);
        if (!exists.toString()) {
            //se o produto NÃO existe, então não pode ser lido
            throw new Error(`The product ` + product_ID + ` does not exist!`);
            //acabar o método "readProduct" por aqui!
        }
        // caso produto EXISTA, ele poderá então ser lido!

        //"getState": busca a ultima informação (o ultimo registro)
        const productAsByte = await stub.getState(product_ID); //nessa função NÃO dá pra retornar todo seu histórico
        const product = JSON.parse(productAsByte.toString());
        console.info('=======================================');
        console.log(product);  //melhor para ler na Vertical
        //console.log(productAsByte.toString()); //melhor para ler na Horizontal
        console.info('=======================================');
        //return product;
        return productAsByte;
    }
        
    //atualizar dados do Produto e Transações
    async transferProduct (stub, args){
        //atualizar datas e CNPJ para quando o produto passa por determinada etapa da cadeia
        //função semelhante a de "createProduct", entretanto os novos dados a entrar deverão obedecer às regras estabelecidas. 
        //Regras:
            //*Cada nó deverá obedecer à determinadas regras para que ocorram atualizações de forma correta
            //* Essas regras deverão ser tais que obedeçam ao fluxo:
            //          PRODUTOR --> TRANSPORTADOR --> VENDEDOR
            
            //*Data_Produtor deve SEMPRE ser anterior à Data_Transportador (se ela existir), que por sua vez deve SEMPRE ser anterior à Data_Vendedor (se ela existir)
            //*Quando Data_Vendedor for ser inserida pela primeira vez, Data_Transportador e Data_Produtor não podem ser null
            //*Da mesma forma, quando Data_Transportador for ser inserida pela primeira vez, Data_Produtor não pode ser null
            //*O mesmo raciocínio vale para os CNPJs
    
        // → product_ID: nº de identificação do produto
        // → nodeName: nome do nó responsável por aquela etapa (pode ser: "Produtor", "Transportador", "Vendedor")
        // → productName: nome do produto
        // → CNPJ: nº de CNPJ passado

        //após a atualização, o produto deve ser registrado no LEDGER

        // Passo 1: verificar se "args" foram passados de forma correta
        if (args.length < 4) {
            throw new Error('Incorrect number of arguments!')
        }
        
        //Passo 2: Associando args a cada um dos parâmetros a serem trabalhados
        let product_ID = args[0];
        let nodeName = args[1];
        let productName = args[2];
        let CNPJ = args[3];
        console.info('- Start transferProduct ');

        //Passo 3: verificar se Produto já existe dentro da Rede
        const exists = await stub.getState(product_ID);
        if (!exists.toString()) {
            //se o produto NÃO existe, então não poderá ser realizada a operação
            throw new Error(`The product ` + product_ID + ` does not exist!`);
            //acabar o método "transferProduct" por aqui!
        }
        // caso produto EXISTA, operação de transferência poderá ser realizada!

        //Passo 4: cria uma variável que pega a Data e Hora do momento da análise (e já converte pra String)
        let dataAtual = new Date().toLocaleString();

        //Passo 5: criando um obj. com o ultimo estado registrado
        let produto = await stub.getState(product_ID);
        //transformando objeto criado em JSON
        produto = JSON.parse(produto);

        //Passo 6: avaliar regra para cada Organização
        //Se for o nó "Produtor"
        if (nodeName=="produtor")
        {   
            //"Produtor" só pode fazer atualização se produto não tiver chegado em "Transportador" e "Vendedor" 
            if(produto["CNPJ_Transportador"] == null && produto["CNPJ_Vendedor"] == null )
            {
                var data_produtor = dataAtual;
                var cnpj_produtor = CNPJ;

                //Código Atual --> pode alterar nome do Produto sim (vai que foi digitado errado)
                if(produto["CNPJ_Produtor"] != CNPJ)
                {   
                    //houve uma alteração do CNPJ do Produtor
                    //isso não pode!
                    throw new Error(`The product ${product_ID} already exists and your CNPJ can't be changed!`);
                }
            
                //atualizando conjunto de informação (é como criar de novo!)
                const product = {
                        ID: product_ID,
                        name: productName,
                        CNPJ_Produtor: cnpj_produtor,
                        CNPJ_Transportador: null,
                        CNPJ_Vendedor: null,
                        Data_Produtor: data_produtor,
                        Data_Transportador: null,
                        Data_Vendedor: null
                    }
            
                //transformar "product" de JSON em STRING, e depois colocar em Buffer
                const buffer = Buffer.from(JSON.stringify(product));

                //registrar informação criada dentro da rede (no LEDGER)
                await stub.putState(product_ID, buffer); //"stub": representação do Blockchain dentro do Código
                
                console.info('- End transferProduct (success)');
            }

            else
            {   //Se o produto já tiver passado pelas etapas de "Transportador" ou "Vendedor" não poderá haver atualização
                throw new Error(`The ${nodeName} can't to update the product !`);
            }   
        }
        
        //Se for o nó "Transportador"
        else if (nodeName=="transportador")
        {
            //se data de passagem por "Produtor" for anterior à etapa de Passagem atual
            if(produto["Data_Produtor"] >= dataAtual)
            {
                throw new Error(`The date does not possible!`);
            }
            
            //CNPJ do "Transportador" não pode ser o mesmo do "Produtor"
            else if(produto["CNPJ_Produtor"] == CNPJ)
            {
                throw new Error(`The CNPJ isn't possible!`);
            }

            //CNPJ de "Transportador" não pode ser inserido se o CNPJ de "Produtor" não existir
            else if(produto["CNPJ_Produtor"] == null)
            {
                throw new Error(`The update by ${nodeName} doesn't possible!`);
            }

            //CNPJ de "Transportador" não pode ser atualizado se já tiver passado pela etapa de "Vendedor"
            else if(produto["CNPJ_Vendedor"] != null)
            {
                throw new Error(`The update by ${nodeName} doesn't possible!`);
            }

            else
            {
                //após a verificação das condições, tem-se atualização de dados
                var data_transportador = dataAtual;
                var cnpj_transportador = CNPJ;

                //atualizando conjunto de informação (é como criar de novo)
                const product = {
                        ID: product_ID,
                        name: productName,
                        CNPJ_Produtor: produto["CNPJ_Produtor"],
                        CNPJ_Transportador: cnpj_transportador,
                        CNPJ_Vendedor: null,
                        Data_Produtor: produto["Data_Produtor"],
                        Data_Transportador: data_transportador,
                        Data_Vendedor: null
                    }

                //transformar "product" de JSON em STRING, e depois colocar em Buffer
                const buffer = Buffer.from(JSON.stringify(product));

                //registrar informação criada dentro da rede (no LEDGER)
                await stub.putState(product_ID, buffer); //"stub": representação do Blockchain dentro do Código
                console.info('- End transferProduct (success)');
            }
             
        }          
        
        //se for o nó "Vendedor"
        else if (nodeName=="vendedor")
        {
            //se data de passagem por "Produtor" e "Transportador" forem anteriores à etapa de Passagem atual
            // e tbm verificar se data de passagem por "Produtor" for anterior à data de passagem por "Transportador"
            if(produto["Data_Produtor"] >= dataAtual || produto["Data_Transportador"] >= dataAtual || produto["Data_Produtor"] >= produto["Data_Transportador"])
            {
                //var data_vendedor = dataAtual;
                throw new Error(`The date does not possible!`);
            }
                        
            //CNPJ do "Vendedor" não pode ser o mesmo de "Transportador" e nem do "Produtor"
            else if(produto["CNPJ_Produtor"] == CNPJ || produto["CNPJ_Transportador"] == CNPJ)
            {
                throw new Error(`The CNPJ can't be used!`);
            }

            //CNPJ do "Vendedor" não pode ser inserido se o CNPJ de "Produtor" ou de "Transportador" não existirem
            //se o CNPJ de "Produtor" ou de "Transportador" não existirem, é porque ainda não chegou na etap ade Vendedor
            else if(produto["CNPJ_Produtor"] == null || produto["CNPJ_Transportador"] == null)
            {
                throw new Error(`A etapa de ${nodeName} ainda não é possível!`);
            }

            else
            {
                //após a verificação das condições, tem-se atualização de dados
                var data_vendedor = dataAtual;
                var cnpj_vendedor = CNPJ;
                
                //atualizando conjunto de informação (é como criar de novo)
                const product = {
                        ID: product_ID,
                        name: productName,
                        CNPJ_Produtor: produto["CNPJ_Produtor"],
                        CNPJ_Transportador: produto["CNPJ_Transportador"],
                        CNPJ_Vendedor: cnpj_vendedor,
                        Data_Produtor: produto["Data_Produtor"],
                        Data_Transportador: produto["Data_Transportador"],
                        Data_Vendedor: data_vendedor
                    }

                //transformar "product" de JSON em STRING, e depois colocar em Buffer
                const buffer = Buffer.from(JSON.stringify(product));

                //registrar informação criada dentro da rede (no LEDGER)
                await stub.putState(product_ID, buffer); //"stub": representação do Blockchain dentro do Código
                
                console.info('- End transferProduct (success)');
            }
            
        }
        else
        {    //se não for "Produtor", não pode criar produto
            throw new Error(`The product can't be transfer by ${nodeName}`);
        }
    }
    
    //excluir Produto
    async deleteProduct (stub, args){
        // Quem poderá excluir produto:
        //  --> Produtor (porque se o produto for excluído, significa que ele sairá da linha de Distribuição - motivos variados)  
        //  --> Vendedor (produto será vendido ou descartado pelo vendedor) 

        // Passo 1: verificar se "args" foram passados de forma correta
        if (args.length != 2) {
            throw new Error('Incorrect number of arguments!');
        }
        

        //Passo 2: Associando args a cada um dos parâmetros a serem trabalhados
        let product_ID = args[0];
        let nodeName = args[1];

        //Passo 3: verificar se o produto existe
        const exists = await stub.getState(product_ID);
        if (!exists.toString()) {
            //se o produto NÃO existe, então não pode ser deletado!
            throw new Error(`The product ` + product_ID + ` does not exist!`);
            //acabar o método "deleteProduct" por aqui!
        }
        // caso produto EXISTA, ele poderá então ser deletado!

        //Parte 4: criando um obj. com o ultimo estado registrado
        var produto = await stub.getState(product_ID);
        //transformando objeto criado em JSON
        produto = JSON.parse(produto);

        //Parte 5: Se o produto existe, avaliar quem estará tentando deletar o produto
        if (nodeName == "produtor")
        {
            //"Produtor" pode deletar o produto, desde que não tenha chegado nas etapas de "Transportador" e nem de "Vendedor"
            if(produto["CNPJ_Transportador"] != null || produto["CNPJ_Vendedor"] != null)
            {
                //Significa que produto já foi para as etapas de "Transportador" ou "Vendedor"
                throw new Error(`The product ${product_ID} can't be deleted`);
            }

            await stub.deleteState(product_ID);
        }

        else if (nodeName == "vendedor")
        {
            //"Vendedor" pode deletar o produto, desde que já tenha passado pelas etapas de "Produtor" e "Transportador"
            if(produto["CNPJ_Produtor"] != null && produto["CNPJ_Transportador"] != null)
            {
                //"Vendedor" só pode deletar o produto se já tiver chegado na etapa dele
                if(produto["CNPJ_Vendedor"] == null)
                {
                    //Significa que produto já foi para as etapas de "Transportador" ou "Vendedor"
                    throw new Error(`The product ${product_ID} can't be deleted`);
                }
                //"Produtor" pode deletar o produto
                await stub.deleteState(product_ID);
                //print(`The product has been selled!`)    
            }
            
        }
        else
        {    //se não for "Produtor", não pode criar produto
            throw new Error(`The product can't be delete by ${nodeName}`);
        }

    }

    // #========== Acessar Lotes de Informação Criados ==========#
    // método p/ retorna todos os lotes de informação encontrados no estado mundial
    async queryAll(stub) {
        let allResults = [];
        // consulta de intervalo com string vazia para startKey e endKey faz uma consulta aberta de todos os ativos no namespace chaincode
        const iterator = await stub.getStateByRange('', '');
        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                await iterator.close();
                console.info(allResults);
                console.log('end of data');
                //return JSON.stringify(allResults);
                return allResults.toString()
            }
        }
    }

    /**/

    // #========== Acessar Histórico de Transações do Ledger ==========#
    //utilizar métodos para acessar histórico de dados na Rede
    //  --> uso do método "getHistoryForKey"
    //precisa ser imutável
    //A forma escolhida para acessar o Histórico de transações é a mostrada abaixo
    //Escolhida por ser a mais simples e fácil de entender
    //Foram usadas duas formas para acessar esse Ledger. As duas são mostradas a seguir
    //  --> por enquanto, deixar as duas, existem coisas mais urgentes para fazer daqui pra frente

    // acessar o histórico de Transações   
    // 3ª Forma
    async retrieveHistory(stub, args) {
        if (args.length < 1) {
            throw new Error('Incorrect number of arguments. Expecting 1')
        }

        let product_ID = args[0];
        console.info('getting history for product_ID: ' + product_ID);
        
        let allResults = [];
        let iterator = await stub.getHistoryForKey(product_ID);
        while (true) {
            let res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                let jsonRes = {};
                //console.log(res.value.value.toString('utf8'));
                jsonRes.TxId = res.value.tx_id;
                jsonRes.Timestamp = res.value.timestamp;
                jsonRes.IsDelete = res.value.is_delete.toString();
                try {
                    jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    jsonRes.Value = res.value.value.toString('utf8');
                }

                //jsonRes.Key = res.value.key;
                /*try {
                    jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    jsonRes.Record = res.value.value.toString('utf8');
                }*/

                allResults.push(jsonRes);
            }
            if (res.done) {
                await iterator.close();
                console.info(allResults);
                console.log('end of data');
                return allResults.toString();
            }
        }

       
        
    }

} 


shim.start(new Chaincode());
