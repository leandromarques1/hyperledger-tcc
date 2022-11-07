/*
 * SPDX-License-Identifier: Apache-2.0
 */

/**
    antes de começar, é necessário termos instalados "fabric-shim"
    --> pelo terminal, acessar diretório onde está o Chaincode
    --> Digitar os seguintes comandos
    # create a new node project
    npm init
    
    # install fabric-shim at master branch
    npm install 2.1.0-unstable
    
    # or using the released version
    npm install fabric-shim
    
    touch chaincode_name.js

*/

const { Contract } = require('fabric-contract-api');
const Aux = require('./_aux.js');
const fs = require('fs');   //manipulação de arquivos


//Smart Contract será escrito dentro da classe "supplychainContract" 
class SupplychainContract extends Contract {

    /*  Codigo para extrair o nome da organização do Nome do Container
        "nodeName" tem a ver com a organização presente em "container_name"
        
        var container_name = "peer0.org1.villalabs.co"
        var nodeName = container_name.split(".")[1];
        console.log(nodeName);

    */

    /*  CRUD
        --> CRUD representa as quatro principais operações realizadas em banco de dados, 
            seja no modelo relacional (SQL) ou não-relacional (NoSQL), facilitando no 
            processamento dos dados e na consistência e integridade das informações.
        --> São elas: Create, Read, Update, Delete
        --> "criação", "atualização" e "exclusão" devem ser encapsuladas no método "Invoke"
        --> leitura/consulta devem ser encapsuladas em "Query" 

    */

    //verificar se um produto existe ou não
    async existsProduct (ctx, product_ID) {
        // → product_ID: nº de identificação do produto

        //verificar se existe dentro da Rede
        const buffer = await ctx.stub.getState(product_ID);
        return (!!buffer && buffer.length > 0);
    }

    //criar Produto
    async createProduct (ctx, product_ID, nodeName, productName, cnpj_produtor) {
        // → product_ID: nº de identificação do produto
        // → nodeName: nome do nó responsável por aquela etapa 
        //      (pode ser: "Produtor", "Transportador", "Vendedor")       
        // → productName: nome do Produto
        // → cnpj_produtor: CNPJ do Produtor

        //REGRA PRINCIPAL: somente o nó "Produtor" pode criar um produto

        //verificar se existe dentro da Rede
        const exists = await this.existsProduct(ctx, product_ID);
        if (exists) {   
            //produto já existe, e não precisa criar
            throw new Error(`The product ${product_ID} already exists`);
            //acabar o método por aqui!
        }
        
        // caso produto ainda NÃO EXISTE, ele poderá então ser criado

        // método exclusivo para "Produtor"
        //avaliar quem estará criando o produto
        if (nodeName == "produtor")
        {   
            //somente o"Produtor" pode criar o produto
            
            //conjunto de informações a serem criadas (JSON)
            //aqui entram alguns parâmetros passados na função
            const product = {
                    ID: product_ID,
                    name: productName,
                    CNPJ_Produtor: cnpj_produtor,
                    CNPJ_Transportador: null, // se eu estou criando o Produto, não faz sentido usar o CNPJ do Transportador
                    CNPJ_Vendedor: null, //da mesma forma, se eu tou criando o Produto, não faz sentido usar o CNPJ do Vendedor
                    Data_Produtor: new Date().toLocaleString(), //pega a data e hora em que se está criando o produto, ou seja, o momento da passagem do lote pelo "Produtor";
                    Data_Transportador: null, // data e hora da passagem do lote pelo "Transportador";
                    Data_Vendedor: null //data e hora da passagem do lote pelo "Vendedor".
                }
            
            //transformar "product" de JSON em STRING, e depois colocar em Buffer
            const buffer = Buffer.from(JSON.stringify(product));

            //registrar informação criada dentro da rede (no LEDGER)
            await ctx.stub.putState(product_ID, buffer); //"stub": representação do Blockchain dentro do Código
        }
        
        else
        {   
            //se não for "Produtor", não pode criar produto
            throw new Error(`The product can't maker by ${nodeName}`);
        }
    }

    //ver informações sobre o Produto
    async readProduct (ctx, product_ID) {
        // → product_ID: nº de identificação do produto
        // *presente em "Produtor", "Transportador" e "Vendedor"
        // *parâmetro passado: product_ID
        // *return: dados do Produto
            
        // REGRA PRINCIPAL: qualquer nó poderá ter acesso às informações do Produto

        //verificar se o produto existe
        const exists = await this.existsProduct(ctx, product_ID);
        if (!exists) 
        {   //produto NÃO existe
            throw new Error(`The product ${product_ID} does not exist`);
            //acabar o método por aqui!
        }
        
        //"getState": busca a ultima informação (o ultimo registro)
        const buffer = await ctx.stub.getState(product_ID); //nessa função NÃO dá pra retornar todo seu histórico
        const product = JSON.parse(buffer.toString());
        return product;
    }

    //atualizar dados do Produto
    async updateProduct (ctx, product_ID, nodeName, productName, CNPJ) {
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
    
        //verificar se produto existe na Rede
        const exists = await this.existsProduct(ctx, product_ID);
        if (!exists) 
        {   //produto NÃO existe
            throw new Error(`The product ${product_ID} does not exist`);
            //acabar o método por aqui!
        }

        //cria uma variável que pega a Data e Hora do momento da análise (e já converte pra String)
        var dataAtual = new Date().toLocaleString();
    
        // ## ================================================================================= ##
        // ## ======= Será que essa parte deveria estar dentro das regras para cada nó? ======= ##
        //criando um obj. com o ultimo estado registrado
        var produto = await ctx.stub.getState(product_ID);
        //transformando objeto criado em JSON
        produto = JSON.parse(produto);
        // ## ================================================================================= ##

        //Se produto existe, avaliar quem é o Nó que estará efetuando a atualização
        //Se for o nó "Produtor"
        if (nodeName=="produtor")
        {   
            //"Produtor" só pode fazer atualização se produto não tiver chegado em "Transportador" e "Vendedor" 
            if(produto["CNPJ_Transportador"] == null && produto["CNPJ_Vendedor"] == null )
            {
                var data_produtor = dataAtual;
                var cnpj_produtor = CNPJ;

                if(produto["name"] != productName || produto["CNPJ_Produtor"] != CNPJ)
                {   
                    //houve uma alteração do nome do Produto ou então do CNPJ do Produtor
                    //isso não pode
                    throw new Error(`The product ${product_ID} already exists and your name OR your CNPJ can't be changed!`);
                }
            
                //atualizando conjunto de informação (é como criar de novo)
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
                await ctx.stub.putState(product_ID, buffer); //"stub": representação do Blockchain dentro do Código
            }

            else
            {   //Se o produto já tiver passado pelas etapas de "Transportador" ou "Vendedor" não poderá haver atualização
                throw new Error(`The ${nodeName} can't to update the product !`);
            }   
        }
        
        //Se for o nó "Transportador"
        if (nodeName=="transportador")
        {
            //se data de passagem por "Produtor" for anterior à etapa de Passagem atual
            if(produto["Data_Produtor"] >= dataAtual)
            {
                throw new Error(`The date does not possible!`);
            }
            
            //CNPJ do "Transportador" não pode ser a mesma do "Produtor"
            else if(produto["CNPJ_Produtor"] == CNPJ)
            {
                throw new Error(`The CNPJ isn't possible!`);
            }

            //CNPJ de "Transportador" não pode ser inserido se o CNPJ de "Produtor" não existir
            else if(produto["CNPJ_Produtor"] == null)
            {
                throw new Error(`A etapa de ${nodeName} ainda não é possível!`);
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
                await ctx.stub.putState(product_ID, buffer); //"stub": representação do Blockchain dentro do Código
            }
             
        }          
        
        //se for o nó "Vendedor"
        if (nodeName=="vendedor")
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
                await ctx.stub.putState(product_ID, buffer); //"stub": representação do Blockchain dentro do Código
            }
            
        }       
        /*  
            //transformar "product" de JSON em STRING, e depois colocar em Buffer
            const buffer = Buffer.from(JSON.stringify(product));

            //registrar informação criada dentro da rede
            await ctx.stub.putState(product_ID, buffer); //"stub": representação do Blockchain dentro do Código
        
        */
    }

    //excluir Produto
    async deleteProduct (ctx, product_ID, nodeName) {
        // Quem poderá excluir produto:
        //  --> Produtor (porque se o produto for excluído, significa que ele sairá da linha de Distribuição - motivos variados)  
        //  --> Vendedor (produto será vendido ou descartado pelo vendedor) 

        //verificar se produto existe na Rede
        const exists = await this.existsProduct(ctx, product_ID);
        if (!exists) 
        {   //produto NÃO existe
            throw new Error(`The product ${product_ID} does not exist`);
            //acabar o método por aqui!
        }

        //criando um obj. com o ultimo estado registrado
        var produto = await ctx.stub.getState(product_ID);
        //transformando objeto criado em JSON
        produto = JSON.parse(produto);
            
        // Se o produto existe, avaliar quem estará deletando o produto
        if (nodeName == "produtor")
        {
            //"Produtor" pode deletar o produto, desde que não tenha chegado nas etapas de "Transportador" e nem de "Vendedor"
            if(produto["CNPJ_Transportador"] != null || produto["CNPJ_Vendedor"] != null)
            {
                //Significa que produto já foi para as etapas de "Transportador" ou "Vendedor"
                throw new Error(`The product ${product_ID} can't be deleted`);
            }

            await ctx.stub.deleteState(product_ID);
        }
                    
        else if (nodeName == "vendedor")
        {
            //"Vendedor" só pode deletar o produto se já tiver chegado na etapa dele
            if(produto["CNPJ_Vendedor"] == null)
            {
                //Significa que produto já foi para as etapas de "Transportador" ou "Vendedor"
                throw new Error(`The product ${product_ID} can't be deleted`);
            }
            //"Produtor" pode deletar o produto
            await ctx.stub.deleteState(product_ID);
            //print(`The product has been selled!`)
        }

        else
        {    //se não for "Produtor", não pode criar produto
            throw new Error(`The product can't be delete by ${nodeName}`);
        }
        
    }

    //Acessar o Ledger
    //utilizar métodos para acessar histórico de dados na Rede
    //  --> uso do método "getHistoryForKey"
    //precisa ser imutável
    //Foram usadas duas formas para acessar esse Ledger. As duas são mostradas a seguir
    //  --> por enquanto, deixar as duas, existem coisas mais urgentes para fazer daqui pra frente

    // ## ========= 1ª Forma ============= ##
    async retrieveHistory(ctx, product_ID) {
        console.info('getting history for product_ID: ' + product_ID);
        let iterator = await ctx.stub.getHistoryForKey(product_ID);
        let result = [];
        let res = await iterator.next();
        while (!res.done) 
        {
            if (res.value) 
            {
                console.info(`found state update with value: ${res.value.value.toString('utf8')}`);
                const obj = JSON.parse(res.value.value.toString('utf8'));
                result.push(obj);
            }
            res = await iterator.next();
        }
        await iterator.close();
        return result;
    }
    
    // ## ========= 2ª Forma - a mais provável ============= ##
    async productHistory(ctx, product_ID)
    {   
        //verificar se produto existe na Rede
        const exists = await this.existsProduct(ctx, product_ID);
        if (!exists) 
        {   //produto NÃO existe
            throw new Error(`The product ${product_ID} does not exist`);
            //acabar o método por aqui!
        }

        // busca na rede histórico do identificador passado
        const history = await ctx.stub.getHistoryForKey(product_ID);

        //validar se houve ou não retorno
        const productHistory = history !== undefined ? await Aux.iteratorForJSON(history, true): {};
        const stringProductHistory = JSON.stringify(productHistory);
        fs.writeFile('history.json', stringProductHistory, err => {
            if (err) console.error(err);
            console.log('History CREATED!');
        });

        //retornar o Histórico (caso tenha havido retorno)
        return {
            status: 'OK',
            history: stringProductHistory
        }
        //Irá retorna o histórico de transações, com a Data da Transação e a Transação em si
        //Retorna da transação mais antiga para a transação mais recente 
        
    }
    /**/

}

module.exports = SupplychainContract;
