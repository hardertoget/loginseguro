const bcrypt = require('bcryptjs');
const { MongoClient } = require("mongodb");
const express = require('express');
const app = express();
const path = require('path');
const rateLimit = require('express-rate-limit');


const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // janela de 15 minutos
    max: 100, // limite de 100 requisições por janela por IP
    standardHeaders: true, // Retorna informações de limite de taxa nos headers `RateLimit-*`
    legacyHeaders: false, // Desabilita os headers `X-RateLimit-*`
    message: { error: 'Muitas requisições feitas deste IP, por favor tente novamente após 15 minutos' }
  });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

// Middleware para logar requisições
app.use((req, res, next) => {
    console.log(`Recebendo requisição ${req.method} para ${req.url}`);
    console.log('Corpo da requisição:', req.body);
    next();
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const uri = "mongodb+srv://user:userprogram@maincluster.cbiq3yr.mongodb.net/?retryWrites=true&w=majority";
const dbName = "myDatabase";
const collectionName = "usuarios";

async function createUniqueIndex() {
    const client = new MongoClient(uri);
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(collectionName);
    
    try {
        await collection.createIndex({ username: 1 }, { unique: true });
        console.log('Índice único criado para o campo username');
    } catch (error) {
        console.error('Erro ao criar índice único:', error);
    } finally {
        await client.close();
    }
}

// Chame a função para criar o índice único quando o servidor iniciar
createUniqueIndex();

app.post('/register', limiter, async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Usuário ou senha não fornecidos' });
    }

    const client = new MongoClient(uri);
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    try {
        const userExists = await collection.findOne({ username: username });
        if (userExists) {
            return res.status(400).json({ error: 'Usuário já existe' });
        }

        const salt = await bcrypt.genSalt(13);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            username: username,
            password: hashedPassword
        };

        await collection.insertOne(newUser);
        res.status(201).json({ message: 'Usuário registrado com sucesso!' });
    } catch (error) {
        console.error(`Erro ao registrar usuário: ${error}`);
        if (error.code === 11000) { // código de erro para duplicação de chave única
            return res.status(400).json({ error: 'Usuário já existe' });
        }
        res.status(500).json({ error: 'Erro interno do servidor' });
    } finally {
        await client.close();
    }
});


app.post('/login', limiter, async (req, res) => {
    const { username, password } = req.body;

    const client = new MongoClient(uri);
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    try {
        const user = await collection.findOne({ username: username });
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            res.status(200).json({ message: 'Login bem-sucedido!' });
        } else {
            res.status(401).json({ error: 'Senha incorreta' });
        }
    } catch (error) {
        console.error(`Erro ao logar: ${error}`);
        res.status(500).json({ error: 'Erro interno do servidor' });
    } finally {
        await client.close();
    }
});

app.listen(8080, () => console.log("listening on port: 8080"));
